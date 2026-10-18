'use client';

import React, { useState } from 'react';
import { usePlatformStore } from '@/components/providers/PlatformStoreContext';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  Campus,
  CampusStatus,
  CampusType,
  CreateCampusInput,
  Organization,
} from '@/lib/types';
import {
  MapPin,
  Building,
  Plus,
  Star,
  Edit2,
  Trash2,
  Users,
  Mail,
  Phone,
  Info,
} from 'lucide-react';

interface CampusManagementPanelProps {
  organization: Organization;
}

export function CampusManagementPanel({ organization }: CampusManagementPanelProps) {
  const {
    getCampusesByOrgId,
    createCampus,
    updateCampus,
    setMainCampus,
    setCampusStatus,
    deleteCampus,
    plans,
  } = usePlatformStore();

  const campuses = getCampusesByOrgId(organization.id);
  const plan = plans.find((p) => p.id === organization.planId);
  const maxCampusesAllowed = plan?.maxCampuses || organization.technicalConfig.maxCampuses || 1;

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<Campus | null>(null);
  const [deletingCampus, setDeletingCampus] = useState<Campus | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    type: CampusType;
    status: CampusStatus;
    isMainCampus: boolean;
    street: string;
    city: string;
    stateOrProvince: string;
    country: string;
    postalCode: string;
    contactEmail: string;
    contactPhone: string;
    principalName: string;
    studentCapacity: number;
  }>({
    name: '',
    code: '',
    type: 'branch',
    status: 'active',
    isMainCampus: false,
    street: '',
    city: organization.contact.city || '',
    stateOrProvince: organization.contact.stateOrProvince || '',
    country: organization.contact.country || 'United States',
    postalCode: '',
    contactEmail: organization.contact.email || '',
    contactPhone: organization.contact.phone || '',
    principalName: '',
    studentCapacity: 500,
  });

  const [formError, setFormError] = useState('');

  const openAddModal = () => {
    setFormData({
      name: '',
      code: '',
      type: campuses.length === 0 ? 'main' : 'branch',
      status: 'active',
      isMainCampus: campuses.length === 0,
      street: '',
      city: organization.contact.city || '',
      stateOrProvince: organization.contact.stateOrProvince || '',
      country: organization.contact.country || 'United States',
      postalCode: '',
      contactEmail: organization.contact.email || '',
      contactPhone: organization.contact.phone || '',
      principalName: '',
      studentCapacity: 500,
    });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (campus: Campus) => {
    setEditingCampus(campus);
    setFormData({
      name: campus.name,
      code: campus.code,
      type: campus.type,
      status: campus.status,
      isMainCampus: campus.isMainCampus,
      street: campus.address.street || '',
      city: campus.address.city || '',
      stateOrProvince: campus.address.stateOrProvince || '',
      country: campus.address.country || '',
      postalCode: campus.address.postalCode || '',
      contactEmail: campus.contactEmail || '',
      contactPhone: campus.contactPhone || '',
      principalName: campus.principalName || '',
      studentCapacity: campus.studentCapacity || 500,
    });
    setFormError('');
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const input: CreateCampusInput = {
      organizationId: organization.id,
      name: formData.name,
      code: formData.code,
      type: formData.type,
      status: formData.status,
      isMainCampus: formData.isMainCampus,
      address: {
        street: formData.street,
        city: formData.city,
        stateOrProvince: formData.stateOrProvince,
        country: formData.country,
        postalCode: formData.postalCode,
      },
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      principalName: formData.principalName,
      studentCapacity: Number(formData.studentCapacity),
    };

    const res = createCampus(input);
    if (res.success) {
      setIsAddModalOpen(false);
    } else if (res.error) {
      setFormError(res.error);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus) return;
    setFormError('');

    const res = updateCampus(editingCampus.id, {
      name: formData.name,
      code: formData.code,
      type: formData.type,
      status: formData.status,
      isMainCampus: formData.isMainCampus,
      address: {
        street: formData.street,
        city: formData.city,
        stateOrProvince: formData.stateOrProvince,
        country: formData.country,
        postalCode: formData.postalCode,
      },
      contactEmail: formData.contactEmail,
      contactPhone: formData.contactPhone,
      principalName: formData.principalName,
      studentCapacity: Number(formData.studentCapacity),
    });

    if (res.success) {
      setEditingCampus(null);
    } else if (res.error) {
      setFormError(res.error);
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingCampus) return;
    deleteCampus(deletingCampus.id);
    setDeletingCampus(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary */}
      <div className="bg-card text-card-foreground p-5 rounded-xl border border-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-foreground">Campuses & Branch Governance</h3>
            <Badge variant="neutral">{campuses.length} Registered</Badge>
            {campuses.length > maxCampusesAllowed && (
              <Badge variant="warning">Quota Exceeded ({campuses.length}/{maxCampusesAllowed})</Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage multi-branch campus sites, physical locations, branch directors, and principal institutional designations.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90 flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Register New Campus
        </button>
      </div>

      {/* Demonstration Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-4 rounded-xl flex items-start gap-3 text-xs">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Local Demonstration & Data Contract Boundary</p>
          <p className="mt-0.5 opacity-90">
            Campuses configured here represent multi-tenant partition entries in Super-Admin mock state. Changes do not invoke backend migrations or modify live school operational databases.
          </p>
        </div>
      </div>

      {/* Campuses Grid */}
      {campuses.length === 0 ? (
        <EmptyState
          icon={<Building className="w-12 h-12 text-muted-foreground" />}
          title="No Campuses Registered"
          description="This school organization currently has zero registered campuses. Register at least one primary campus to establish institutional operational baseline."
          action={
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-primary text-primary-foreground font-semibold text-xs rounded-lg hover:bg-primary/90"
            >
              Add Main Campus
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {campuses.map((campus) => (
            <div
              key={campus.id}
              className={`bg-card text-card-foreground p-5 rounded-xl border transition-all ${
                campus.isMainCampus
                  ? 'border-primary/50 shadow-xs ring-1 ring-primary/20'
                  : 'border-border shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm text-foreground">{campus.name}</h4>
                    <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-semibold">
                      {campus.code}
                    </span>
                    {campus.isMainCampus && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                        <Star className="w-3 h-3 fill-amber-500" />
                        Main Campus
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {campus.type.replace('_', ' ')} Campus
                  </p>
                </div>

                <Badge
                  variant={
                    campus.status === 'active'
                      ? 'success'
                      : campus.status === 'under_maintenance'
                      ? 'warning'
                      : 'neutral'
                  }
                >
                  {campus.status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Campus Details */}
              <div className="mt-4 pt-3 border-t border-border/60 space-y-2 text-xs">
                <div className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                  <span>
                    {campus.address.street ? `${campus.address.street}, ` : ''}
                    {campus.address.city}, {campus.address.stateOrProvince} {campus.address.postalCode},{' '}
                    {campus.address.country}
                  </span>
                </div>

                {campus.principalName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <span>
                      Head / Principal: <strong className="text-foreground">{campus.principalName}</strong>
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 text-muted-foreground">
                  {campus.contactEmail && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 shrink-0" />
                      <span className="truncate">{campus.contactEmail}</span>
                    </div>
                  )}
                  {campus.contactPhone && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{campus.contactPhone}</span>
                    </div>
                  )}
                </div>

                {campus.studentCapacity && (
                  <div className="text-muted-foreground pt-1">
                    Student Capacity:{' '}
                    <span className="font-semibold text-foreground">
                      {campus.studentCapacity.toLocaleString()} students
                    </span>
                  </div>
                )}
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <div>
                  {!campus.isMainCampus ? (
                    <button
                      onClick={() => setMainCampus(organization.id, campus.id)}
                      className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Star className="w-3 h-3" />
                      Set as Main Campus
                    </button>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      Primary Institutional Anchor
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(campus)}
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted cursor-pointer transition-colors"
                    title="Edit Campus Details"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      setCampusStatus(
                        campus.id,
                        campus.status === 'active' ? 'inactive' : 'active',
                        'Toggled via super-admin campus panel'
                      )
                    }
                    className="text-[11px] px-2 py-1 rounded bg-muted hover:bg-muted/80 text-foreground font-medium cursor-pointer"
                  >
                    {campus.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => setDeletingCampus(campus)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-destructive/10 cursor-pointer transition-colors"
                    title="Delete Campus"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Campus Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Campus / Branch"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">Campus Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. North Shore Annex"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Campus Code (2-8 chars) *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="e.g. NORTH"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">Campus Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CampusType })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="main">Main Campus</option>
                <option value="branch">Secondary Branch</option>
                <option value="satellite">Satellite Site</option>
                <option value="specialized">Specialized Center</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Lifecycle Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CampusStatus })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50 text-xs">
            <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Location & Address
            </h5>
            <div>
              <label className="block font-medium text-foreground mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Street address"
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">State / Province</label>
                <input
                  type="text"
                  value={formData.stateOrProvince}
                  onChange={(e) => setFormData({ ...formData, stateOrProvince: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50 text-xs">
            <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Administration & Capacity
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">Branch Lead / Principal</label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  placeholder="e.g. Dr. Jane Doe"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">Student Capacity</label>
                <input
                  type="number"
                  min="10"
                  max="100000"
                  value={formData.studentCapacity}
                  onChange={(e) => setFormData({ ...formData, studentCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isMainCampusCheck"
                checked={formData.isMainCampus}
                onChange={(e) => setFormData({ ...formData, isMainCampus: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="isMainCampusCheck" className="text-foreground font-medium">
                Designate as Primary / Main Campus for this organization
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              Register Campus
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Campus Modal */}
      <Modal
        isOpen={Boolean(editingCampus)}
        onClose={() => setEditingCampus(null)}
        title={`Edit Campus: ${editingCampus?.name}`}
        size="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">Campus Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Campus Code *</label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground font-mono uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-medium text-foreground mb-1">Campus Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as CampusType })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="main">Main Campus</option>
                <option value="branch">Secondary Branch</option>
                <option value="satellite">Satellite Site</option>
                <option value="specialized">Specialized Center</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-foreground mb-1">Lifecycle Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as CampusStatus })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              >
                <option value="active">Active</option>
                <option value="planned">Planned</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50 text-xs">
            <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Location & Address
            </h5>
            <div>
              <label className="block font-medium text-foreground mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">City *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">State / Province</label>
                <input
                  type="text"
                  value={formData.stateOrProvince}
                  onChange={(e) => setFormData({ ...formData, stateOrProvince: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">Country *</label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">Postal Code</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-border/50 text-xs">
            <h5 className="font-semibold text-muted-foreground uppercase text-[10px] tracking-wider">
              Administration & Capacity
            </h5>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-foreground mb-1">Branch Lead / Principal</label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block font-medium text-foreground mb-1">Student Capacity</label>
                <input
                  type="number"
                  min="10"
                  max="100000"
                  value={formData.studentCapacity}
                  onChange={(e) => setFormData({ ...formData, studentCapacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="editIsMainCampusCheck"
                checked={formData.isMainCampus}
                onChange={(e) => setFormData({ ...formData, isMainCampus: e.target.checked })}
                className="rounded border-border"
              />
              <label htmlFor="editIsMainCampusCheck" className="text-foreground font-medium">
                Designate as Primary / Main Campus for this organization
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setEditingCampus(null)}
              className="px-4 py-2 border border-border rounded-lg text-xs font-semibold hover:bg-muted cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90 cursor-pointer shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingCampus)}
        onClose={() => setDeletingCampus(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Campus Record?"
        description={`Are you sure you want to remove "${deletingCampus?.name}" (${deletingCampus?.code})? This will delete the campus from local development state.`}
        confirmLabel="Delete Campus"
        variant="danger"
      />
    </div>
  );
}

# Platform Backend Readiness Specification — Super-Admin API Contracts & Data Architecture

**Document Version:** 1.0.0  
**Phase Target:** Transition Specification from E-09.5 to Future Backend Phases  
**Author:** Staff SaaS Platform Architect & Principal Systems Engineer  
**Status:** **APPROVED SPECIFICATION — BACKEND IMPLEMENTATION PAUSED PENDING EXPLICIT AUTHORIZATION**

---

## 1. Architectural Foundations & Domain Boundaries

The School Management SaaS platform maintains strict domain separation between **Platform Super-Administration** (the hosting platform and tenant lifecycle) and **Tenant Operations** (individual school portals):

```
┌────────────────────────────────────────────────────────────────────────┐
│                   EDGE INGRESS / ROUTING GATEWAY                       │
│       *.schoolsaas.internal  ──────►  Tenant Isolation Router           │
│       admin.schoolsaas.internal ──►  Super-Admin Platform API          │
└──────────────────┬────────────────────────────────┬────────────────────┘
                   │                                │
┌──────────────────▼─────────────┐    ┌─────────────▼────────────────────┐
│      SUPER-ADMIN WORKSPACE     │    │        TENANT WORKSPACE          │
│   (dashboard/ — Phase E-09.5)  │    │      (tenant-dashboard/)         │
├────────────────────────────────┤    ├──────────────────────────────────┤
│ • Cross-tenant Directory       │    │ • Student Information (SIS)      │
│ • Subscription Plans & Billing │    │ • Attendance & Gradebooks        │
│ • Subdomain Reservation DNS    │    │ • Timetables & Examinations      │
│ • Global Settings & Flags      │    │ • Parent & Teacher Portals       │
│ • Platform Operator RBAC       │    │ • Branch/Campus Operations       │
│ • Immutable Audit Ledger       │    │ • Internal Fee Collections       │
└────────────────────────────────┘    └──────────────────────────────────┘
```

### Multitenant Isolation Rules
1. **Tenant Isolation:** Every tenant database query from school portals must include a verified `tenant_id` claim derived exclusively from cryptographically signed JWTs.
2. **Super-Admin Authorization:** Only users with `super_admin`, `support_specialist`, or `compliance_auditor` roles in the platform user repository are authorized to hit platform management endpoints.
3. **No Cross-Contamination:** Platform billing and subscription records belong to the platform database, never to tenant SIS databases.

---

## 2. Platform REST API Specifications

All endpoints require `Authorization: Bearer <JWT>` header and enforce CORS for `admin.schoolsaas.internal`.

### 2.1 Organization Lifecycle API

#### `GET /api/v1/organizations`
Returns paginated list of registered school organizations with query filtering.
- **Query Parameters:**
  - `page`: integer (default: 1)
  - `limit`: integer (default: 20, max: 100)
  - `search`: string (matches name, code, subdomain)
  - `classification`: string enum (`all`, `k12`, `higher_ed`, `vocational`, `language_academy`, `international`, `early_childhood`)
  - `status`: string enum (`all`, `pending`, `active`, `suspended`, `inactive`)
- **Response 200 OK:**
```json
{
  "data": [
    {
      "id": "org_001",
      "name": "Oak Hill Academy",
      "code": "OAKHILL",
      "classification": "k12",
      "subdomain": "oakhill",
      "status": "active",
      "planId": "plan_growth",
      "onboardingStatus": "completed",
      "studentCountEstimate": 1250,
      "staffCountEstimate": 95,
      "createdAt": "2025-08-15T09:00:00Z",
      "updatedAt": "2026-03-12T14:22:00Z"
    }
  ],
  "meta": { "total": 10, "page": 1, "limit": 20 }
}
```

#### `POST /api/v1/organizations`
Provisions a new school organization, reserves subdomain, and creates initial trial subscription.
- **Request Headers:**
  - `Idempotency-Key`: string UUID (required to prevent double-provisioning)
- **Request Body:**
```json
{
  "name": "Westlake STEM Academy",
  "code": "WESTLAKE",
  "classification": "k12",
  "subdomain": "westlake",
  "contact": {
    "email": "info@westlake.edu",
    "phone": "+1 555 987 6543",
    "address": "400 Valley Way",
    "city": "Austin",
    "stateOrProvince": "TX",
    "country": "United States",
    "postalCode": "78701",
    "website": "https://westlake.edu"
  },
  "administrator": {
    "name": "Dr. Eleanor Vance",
    "email": "e.vance@westlake.edu",
    "phone": "+1 555 987 6544",
    "roleTitle": "Head of School"
  },
  "planId": "plan_growth",
  "billingCycle": "annual",
  "technicalConfig": {
    "subdomain": "westlake",
    "timezone": "America/Chicago",
    "academicYearStartMonth": 8,
    "currency": "USD",
    "locale": "en-US",
    "maxCampuses": 2
  },
  "notes": "Fast-track onboarding approved."
}
```
- **Response 201 Created:** Returns full organization entity, assigned subscription, and generated onboarding token.

#### `PATCH /api/v1/organizations/:id/status`
Executes an organization lifecycle state transition.
- **Request Body:**
```json
{
  "status": "suspended",
  "reason": "Outstanding subscription balance past 60-day grace period."
}
```
- **Validation Rules:**
  - Enforces state machine transitions: `pending -> [active, inactive]`, `active -> [suspended, inactive]`, `suspended -> [active, inactive]`, `inactive -> [active, pending]`.
  - When `status === "suspended"`, `reason` is strictly required and must be >= 5 characters.
  - Automatically records an immutable `ORGANIZATION_STATUS_CHANGED` audit log event.

---

### 2.2 Subscriptions & Invoicing API

#### `GET /api/v1/subscriptions`
Lists all active tenant subscriptions, billing cadence, and current period bounds.

#### `PUT /api/v1/organizations/:id/plan`
Upgrades or downgrades an organization's subscription tier.
- **Request Body:**
```json
{
  "planId": "plan_enterprise",
  "billingCycle": "annual",
  "prorateImmediate": true
}
```
- **Behavior:** Updates entitlement quotas in Edge proxy cache within < 500ms.

#### `POST /api/v1/invoices/:id/payments`
Records a settled or partial payment against an issued platform invoice.
- **Request Headers:**
  - `Idempotency-Key`: string UUID (required)
- **Request Body:**
```json
{
  "amount": 2495.00,
  "method": "bank_transfer",
  "referenceNumber": "WIRE-2026-99481",
  "notes": "Verified by corporate accounts receivable."
}
```
- **Validation Rules:**
  - `amount > 0` and `amount <= invoice.amountDue - invoice.amountPaid`.
  - `referenceNumber` must be unique across all historical payments.
  - When `amountPaid === amountDue`, invoice status automatically transitions to `paid`.
  - Automatically records an immutable `PAYMENT_RECORDED` audit event.

---

### 2.3 Audit Logs API

#### `GET /api/v1/audit-events`
Queries chronological administrative actions with cursor-based pagination.
- **Query Parameters:**
  - `cursor`: string
  - `category`: string enum
  - `severity`: string enum (`info`, `warning`, `critical`)
  - `actorId`: string
  - `targetId`: string
  - `from`: ISO 8601 timestamp
  - `to`: ISO 8601 timestamp
- **Data Protection:** Backend audit service must append records to an S3 Object-Locked or WORM compliant immutable ledger.

---

## 3. Relational Database Schema Specifications (PostgreSQL)

```sql
-- 1. Organizations
CREATE TABLE platform_organizations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(16) NOT NULL UNIQUE,
    classification VARCHAR(32) NOT NULL,
    subdomain VARCHAR(64) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    plan_id VARCHAR(64) NOT NULL,
    onboarding_status VARCHAR(32) NOT NULL DEFAULT 'in_progress',
    student_count_estimate INTEGER DEFAULT 0,
    staff_count_estimate INTEGER DEFAULT 0,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(64) NOT NULL,
    contact_address TEXT,
    contact_city VARCHAR(128) NOT NULL,
    contact_state VARCHAR(128),
    contact_country VARCHAR(128) NOT NULL,
    contact_postal_code VARCHAR(32),
    contact_website VARCHAR(255),
    admin_name VARCHAR(255) NOT NULL,
    admin_email VARCHAR(255) NOT NULL,
    admin_phone VARCHAR(64) NOT NULL,
    admin_role VARCHAR(128) NOT NULL,
    timezone VARCHAR(64) NOT NULL DEFAULT 'UTC',
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    academic_year_start_month SMALLINT NOT NULL DEFAULT 9,
    max_campuses SMALLINT NOT NULL DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_organizations_status ON platform_organizations(status);
CREATE INDEX idx_organizations_subdomain ON platform_organizations(subdomain);

-- 2. Subscription Plans
CREATE TABLE platform_subscription_plans (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    tier VARCHAR(32) NOT NULL,
    description TEXT NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    price_annual NUMERIC(10, 2) NOT NULL,
    max_students INTEGER NOT NULL,
    max_staff INTEGER NOT NULL,
    max_campuses INTEGER NOT NULL,
    storage_gb INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Invoices
CREATE TABLE platform_invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) NOT NULL UNIQUE,
    organization_id VARCHAR(64) NOT NULL REFERENCES platform_organizations(id),
    subscription_id VARCHAR(64) NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    status VARCHAR(32) NOT NULL DEFAULT 'issued',
    issue_date TIMESTAMPTZ NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    paid_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Payment Settlements Ledger
CREATE TABLE platform_payments (
    id VARCHAR(64) PRIMARY KEY,
    invoice_id VARCHAR(64) NOT NULL REFERENCES platform_invoices(id),
    organization_id VARCHAR(64) NOT NULL REFERENCES platform_organizations(id),
    amount NUMERIC(12, 2) NOT NULL,
    currency VARCHAR(8) NOT NULL DEFAULT 'USD',
    method VARCHAR(32) NOT NULL,
    reference_number VARCHAR(128) NOT NULL UNIQUE,
    status VARCHAR(32) NOT NULL DEFAULT 'succeeded',
    processed_at TIMESTAMPTZ NOT NULL,
    recorded_by VARCHAR(64) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payments_invoice ON platform_payments(invoice_id);
CREATE INDEX idx_payments_org ON platform_payments(organization_id);

-- 5. Platform Audit Events (Append-Only)
CREATE TABLE platform_audit_events (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    category VARCHAR(64) NOT NULL,
    action VARCHAR(128) NOT NULL,
    severity VARCHAR(32) NOT NULL,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_email VARCHAR(255) NOT NULL,
    actor_role VARCHAR(64) NOT NULL,
    target_entity VARCHAR(128) NOT NULL,
    target_id VARCHAR(64) NOT NULL,
    target_name VARCHAR(255),
    status VARCHAR(32) NOT NULL DEFAULT 'succeeded',
    details TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_timestamp ON platform_audit_events(timestamp DESC);
CREATE INDEX idx_audit_category ON platform_audit_events(category);
CREATE INDEX idx_audit_target ON platform_audit_events(target_id);
```

---

## 4. Super-Admin Authentication & RBAC Policy Matrix

| Resource / Action | super_admin | support_specialist | compliance_auditor |
|---|:---:|:---:|:---:|
| View Organizations & Dashboard | Read / Write | Read / Write | Read Only |
| Suspend / Activate School | Full | With Approval | Read Only |
| Record Payments & Adjust Invoices | Full | Read Only | Read Only |
| Change Subscription Plans | Full | Read Only | Read Only |
| Manage Platform Operator Roles | Full | Forbidden | Forbidden |
| Toggle Global Feature Flags | Full | Forbidden | Read Only |
| Inspect Audit Event JSON | Full | Limited | Full |
| Trigger Emergency Maintenance Wall | Full | Forbidden | Forbidden |

---

## 5. Backend Readiness Transition Checklist

- [x] All 12 super-admin frontend views tested and standardized against TypeScript contracts.
- [x] Automated test suite verifying payment accounting, state machine rules, and formula injection security.
- [x] RFC 4180 CSV export utilities integrated with formula injection defense.
- [x] Clear visual boundaries and disclaimers identifying mock state throughout the frontend.
- [x] Production build passes clean Turbopack static compilation without regressions.
- [x] Concrete API endpoint contracts, JSON payloads, and PostgreSQL DDL defined in this specification.
- [!] **STOP BOUNDARY:** Backend microservices, controllers, routes, and database migrations MUST NOT be initiated until Phase E-09.5 is certified and authorized by the project lead.

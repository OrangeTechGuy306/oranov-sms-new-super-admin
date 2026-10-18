import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { generateCsvContent } from '../lib/utils/csv-export';

describe('CSV Export Utilities & Formula Injection Defense', () => {
  test('generates standard RFC 4180 CSV rows', () => {
    const headers = ['School Name', 'Code', 'Students'];
    const rows = [
      ['Oak Hill Academy', 'OAKHILL', 1250],
      ['St. Jude International', 'STJUDE', 840],
    ];

    const result = generateCsvContent(headers, rows);
    const lines = result.split('\r\n');

    assert.equal(lines[0], '"School Name","Code","Students"');
    assert.equal(lines[1], '"Oak Hill Academy","OAKHILL","1250"');
    assert.equal(lines[2], '"St. Jude International","STJUDE","840"');
  });

  test('escapes fields containing commas and double quotes', () => {
    const headers = ['Title', 'Description'];
    const rows = [
      ['Report, 2026', 'Contains "quoted" text and a, comma'],
    ];

    const result = generateCsvContent(headers, rows);
    const lines = result.split('\r\n');

    assert.equal(lines[1], '"Report, 2026","Contains ""quoted"" text and a, comma"');
  });

  test('escapes multiline fields containing newlines', () => {
    const headers = ['Notes'];
    const rows = [
      ['Line 1\nLine 2'],
    ];

    const result = generateCsvContent(headers, rows);
    assert.ok(result.includes('"Line 1\nLine 2"'));
  });

  test('neutralizes formula injection characters (=, +, -, @, tab, cr)', () => {
    const headers = ['Formula', 'Formula Plus', 'Formula Minus', 'Formula At'];
    const rows = [
      ['=SUM(A1:A10)', '+cmd|/c calc', '-5+5', '@SUM(B1:B2)'],
    ];

    const result = generateCsvContent(headers, rows);
    const lines = result.split('\r\n');

    // Values starting with injection characters must be prefixed with a single quote '
    assert.ok(lines[1].includes("'=SUM(A1:A10)"), 'Must sanitize = formula');
    assert.ok(lines[1].includes("'+cmd|/c calc"), 'Must sanitize + formula');
    assert.ok(lines[1].includes("'-5+5"), 'Must sanitize - formula');
    assert.ok(lines[1].includes("'@SUM(B1:B2)"), 'Must sanitize @ formula');
  });
});

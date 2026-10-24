import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateSectionScore, calculateAuditScoreSummary, getRiskLevelFromScore } from '../lib/scoring/index.ts';
import { buildCsv, withUtf8Bom } from '../lib/export/csv.ts';
import { parseAuditResponseFormData } from '../lib/audits/validation.ts';

const criterion = (id, score, weight = 1, confidence = 'HIGH') => ({
  id, weight, response: score === null ? null : { score0To5: score, confidence },
});
const section = (id, criteria, weight = 1) => ({ id, name: id, weight, criteria });

test('an unselected score is rejected while an explicit zero is valid', () => {
  const form = new FormData();
  form.set('confidence', 'HIGH');
  form.set('score0To5', '');
  assert.equal(parseAuditResponseFormData(form).success, false);
  form.set('score0To5', '0');
  const result = parseAuditResponseFormData(form);
  assert.equal(result.success, true);
  assert.equal(result.data.score0To5, 0);
  form.set('responseData', '{invalid json}');
  assert.equal(parseAuditResponseFormData(form).success, false);
});

test('unanswered sections remain unknown rather than receiving a zero score', () => {
  const result = calculateSectionScore(section('unknown', [criterion('a', null)]));
  assert.equal(result.score, null);
  assert.equal(result.riskLevel, null);
  assert.equal(result.confidence, null);
  assert.equal(result.completionPercentage, 0);
});

test('weighted answers exclude unanswered criteria and retain completion separately', () => {
  const result = calculateSectionScore(section('weighted', [criterion('a', 5, 3), criterion('b', 1, 1), criterion('c', null, 10)]));
  assert.equal(result.score, 80);
  assert.equal(result.completionPercentage, 67);
  assert.equal(result.answeredCriteria, 2);
  assert.equal(result.riskLevel, 'STRONG');
});

test('overall score uses section weights and excludes unscored sections', () => {
  const result = calculateAuditScoreSummary([
    section('a', [criterion('a', 5)], 3),
    section('b', [criterion('b', 1)], 1),
    section('c', [criterion('c', null)], 20),
  ]);
  assert.equal(result.overallScore, 80);
  assert.equal(result.completionPercentage, 67);
  assert.equal(result.highestRiskSections[0].sectionId, 'b');
});

test('risk boundaries and confidence ties behave consistently', () => {
  assert.deepEqual([0, 39.9, 40, 59.9, 60, 79.9, 80, 100].map(getRiskLevelFromScore),
    ['CRITICAL_GAP', 'CRITICAL_GAP', 'RISK_AREA', 'RISK_AREA', 'NEEDS_IMPROVEMENT', 'NEEDS_IMPROVEMENT', 'STRONG', 'STRONG']);
  assert.equal(calculateSectionScore(section('tie', [criterion('a', 3, 1, 'LOW'), criterion('b', 4, 1, 'HIGH')])).confidence, 'MEDIUM');
});

test('spreadsheet-facing string formulas are neutralized, including whitespace and full-width markers', () => {
  for (const value of ['=1+1', '+SUM(A1:A2)', '-1+2', '@SUM(A1:A2)', '  =1+1', '\t=1+1', '＝1+1']) {
    const csv = buildCsv({ columns: [{ key: 'value', header: 'value' }], rows: [{ value }] });
    assert.equal(csv.split('\r\n')[1], `"\t${value}"`);
  }
});

test('CSV preserves real numbers, Arabic, quotes, delimiters, normalized lines and UTF-8 BOM', () => {
  const csv = buildCsv({ columns: [{ key: 'number', header: 'number' }, { key: 'text', header: 'text' }],
    rows: [{ number: -12.5, text: 'نص, "تجريبي"\r\nسطر' }] });
  assert.equal(csv, '"number","text"\r\n"-12.5","نص, ""تجريبي""\nسطر"');
  assert.equal(withUtf8Bom(csv).charCodeAt(0), 0xfeff);
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { validateApplication } from '../src/utils/validation.js';

const base = {
  company: 'Acme', jobTitle: 'Developer', status: 'Applied', location: '', workMode: '', employmentType: '',
  salary: '', jobUrl: '', applicationDate: '', interviewDate: '', notes: '',
};

describe('validateApplication', () => {
  it('accepts a valid application', () => {
    assert.deepEqual(validateApplication(base), {});
  });
  it('requires company and job title', () => {
    const errors = validateApplication({ ...base, company: '  ', jobTitle: '' });
    assert.ok(errors.company);
    assert.ok(errors.jobTitle);
  });
  it('rejects non-http URLs', () => {
    assert.ok(validateApplication({ ...base, jobUrl: 'javascript:alert(1)' }).jobUrl);
    assert.equal(validateApplication({ ...base, jobUrl: 'https://careers.example.com/1' }).jobUrl, undefined);
  });
  it('requires an interview date for Interview status', () => {
    assert.ok(validateApplication({ ...base, status: 'Interview' }).interviewDate);
  });
});

import { useState } from 'react';
import { EMPLOYMENT_TYPES, STATUSES, WORK_MODES } from '../utils/constants.js';
import { fromDateTimeInput, toDateInput, toDateTimeInput } from '../utils/format.js';
import { validateApplication } from '../utils/validation.js';

const EMPTY = {
  company: '',
  jobTitle: '',
  status: 'Saved',
  location: '',
  workMode: '',
  employmentType: '',
  salary: '',
  jobUrl: '',
  applicationDate: '',
  interviewDate: '',
  notes: '',
};

function toFormValues(application) {
  if (!application) return { ...EMPTY, applicationDate: new Date().toISOString().slice(0, 10) };
  return {
    ...EMPTY,
    ...Object.fromEntries(Object.keys(EMPTY).map((k) => [k, application[k] ?? ''])),
    applicationDate: toDateInput(application.applicationDate),
    interviewDate: toDateTimeInput(application.interviewDate),
  };
}

export default function ApplicationForm({ application, onSubmit, onCancel, submitting }) {
  const [values, setValues] = useState(() => toFormValues(application));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  const update = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((errs) => ({ ...errs, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateApplication(values);
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(`field-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    setServerError('');
    const payload = {
      ...Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v])),
      interviewDate: fromDateTimeInput(values.interviewDate),
    };
    try {
      await onSubmit(payload);
    } catch (err) {
      const fieldErrors = Object.fromEntries((err.errors || []).map((fe) => [fe.field, fe.message]));
      setErrors(fieldErrors);
      setServerError(err.message);
    }
  };

  const field = (name, label, props = {}) => (
    <div className={`field ${props.wide ? 'field-wide' : ''}`}>
      <label htmlFor={`field-${name}`}>
        {label}
        {props.required && <span className="required" aria-hidden="true"> *</span>}
      </label>
      {props.children || (
        <input
          id={`field-${name}`}
          name={name}
          type={props.type || 'text'}
          value={values[name]}
          onChange={update}
          placeholder={props.placeholder}
          maxLength={props.maxLength}
          required={props.required}
          aria-invalid={Boolean(errors[name])}
          aria-describedby={errors[name] ? `error-${name}` : undefined}
        />
      )}
      {errors[name] && <span className="field-error" id={`error-${name}`}>{errors[name]}</span>}
    </div>
  );

  const select = (name, options, emptyLabel) => (
    <select id={`field-${name}`} name={name} value={values[name]} onChange={update} aria-invalid={Boolean(errors[name])}>
      {emptyLabel && <option value="">{emptyLabel}</option>}
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );

  return (
    <form className="app-form" onSubmit={handleSubmit} noValidate>
      {serverError && <div className="alert alert-error" role="alert">{serverError}</div>}
      <div className="form-grid">
        {field('company', 'Company', { required: true, placeholder: 'e.g. Google', maxLength: 120 })}
        {field('jobTitle', 'Job title', { required: true, placeholder: 'e.g. Frontend Developer', maxLength: 120 })}
        {field('status', 'Status', { children: select('status', STATUSES) })}
        {field('employmentType', 'Employment type', { children: select('employmentType', EMPLOYMENT_TYPES, 'Not specified') })}
        {field('location', 'Location', { placeholder: 'e.g. Bengaluru', maxLength: 120 })}
        {field('workMode', 'Work mode', { children: select('workMode', WORK_MODES, 'Not specified') })}
        {field('salary', 'Salary', { placeholder: 'e.g. ₹8 LPA', maxLength: 60 })}
        {field('jobUrl', 'Job posting URL', { type: 'url', placeholder: 'https://…', maxLength: 500 })}
        {field('applicationDate', 'Application date', { type: 'date' })}
        {field('interviewDate', 'Interview date & time', { type: 'datetime-local' })}
        {field('notes', 'Notes', {
          wide: true,
          children: (
            <textarea
              id="field-notes"
              name="notes"
              rows={4}
              value={values.notes}
              onChange={update}
              maxLength={2000}
              placeholder="Recruiter contact, interview prep, follow-ups…"
              aria-invalid={Boolean(errors.notes)}
            />
          ),
        })}
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={submitting}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : application ? 'Save changes' : 'Add application'}
        </button>
      </div>
    </form>
  );
}

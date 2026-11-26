import { formatDate } from '../utils/format.js';
import Icon from './Icon.jsx';
import StatusBadge from './StatusBadge.jsx';

const Row = ({ label, children }) => (
  <div className="detail-row">
    <dt>{label}</dt>
    <dd>{children || '—'}</dd>
  </div>
);

export default function ApplicationDetails({ application, onEdit, onDelete }) {
  const a = application;
  return (
    <div className="details">
      <div className="details-head">
        <div>
          <h3>{a.jobTitle}</h3>
          <p className="muted">{a.company}</p>
        </div>
        <StatusBadge status={a.status} />
      </div>
      <dl className="detail-grid">
        <Row label="Location">{a.location}</Row>
        <Row label="Work mode">{a.workMode}</Row>
        <Row label="Employment type">{a.employmentType}</Row>
        <Row label="Salary">{a.salary}</Row>
        <Row label="Application date">{a.applicationDate && formatDate(a.applicationDate)}</Row>
        <Row label="Interview date">{a.interviewDate && formatDate(a.interviewDate, true)}</Row>
        <Row label="Job posting">
          {a.jobUrl && (
            <a href={a.jobUrl} target="_blank" rel="noopener noreferrer" className="link">
              <Icon name="link" size={14} /> Open posting
            </a>
          )}
        </Row>
        <Row label="Last updated">{formatDate(a.updatedAt, true)}</Row>
      </dl>
      <div className="notes">
        <h4>Notes</h4>
        <p>{a.notes || <span className="muted">No notes added.</span>}</p>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-danger-outline" onClick={() => onDelete(a)}><Icon name="trash" /> Delete</button>
        <button type="button" className="btn btn-primary" onClick={() => onEdit(a)}><Icon name="edit" /> Edit</button>
      </div>
    </div>
  );
}

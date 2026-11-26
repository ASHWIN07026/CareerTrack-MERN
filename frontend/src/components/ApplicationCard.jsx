import { formatDate, isUpcoming, relativeDays } from '../utils/format.js';
import Icon from './Icon.jsx';
import StatusBadge from './StatusBadge.jsx';

export default function ApplicationCard({ application, onView, onEdit, onDelete }) {
  const { company, jobTitle, status, location, salary, applicationDate, interviewDate, workMode } = application;
  const upcoming = isUpcoming(interviewDate);
  return (
    <article className="app-card">
      <div className="app-card-head">
        <div className="app-card-title">
          <h3>{jobTitle}</h3>
          <p>{company}</p>
        </div>
        <StatusBadge status={status} />
      </div>
      <ul className="meta">
        {location && <li><Icon name="pin" size={15} />{location}{workMode ? ` · ${workMode}` : ''}</li>}
        {!location && workMode && <li><Icon name="pin" size={15} />{workMode}</li>}
        {salary && <li><Icon name="money" size={15} />{salary}</li>}
        <li><Icon name="calendar" size={15} />Applied: {formatDate(applicationDate)}</li>
        {interviewDate && (
          <li className={upcoming ? 'highlight' : ''}>
            <Icon name="clock" size={15} />Interview: {formatDate(interviewDate, true)}
            {upcoming && <em> ({relativeDays(interviewDate)})</em>}
          </li>
        )}
      </ul>
      <div className="app-card-actions">
        <button type="button" className="btn btn-ghost" onClick={() => onView(application)} aria-label={`View ${jobTitle} at ${company}`}>
          <Icon name="eye" /> View
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onEdit(application)} aria-label={`Edit ${jobTitle} at ${company}`}>
          <Icon name="edit" /> Edit
        </button>
        <button type="button" className="btn btn-ghost danger" onClick={() => onDelete(application)} aria-label={`Delete ${jobTitle} at ${company}`}>
          <Icon name="trash" /> Delete
        </button>
      </div>
    </article>
  );
}

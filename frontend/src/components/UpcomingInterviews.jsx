import { formatDate, relativeDays } from '../utils/format.js';
import Icon from './Icon.jsx';

export default function UpcomingInterviews({ stats, onView }) {
  const interviews = stats?.upcomingInterviews || [];
  return (
    <section className="panel upcoming">
      <div className="panel-title">
        <Icon name="calendar" />
        <h2>Upcoming interviews</h2>
        <span className="pill">{stats?.upcomingInterviewCount ?? 0}</span>
      </div>
      {interviews.length === 0 ? (
        <p className="muted">No upcoming interviews scheduled.</p>
      ) : (
        <ul className="upcoming-list">
          {interviews.map((item) => (
            <li key={item._id}>
              <button type="button" className="upcoming-item" onClick={() => onView(item._id)}>
                <span>
                  <strong>{item.company}</strong>
                  <span className="muted">{item.jobTitle}</span>
                </span>
                <span className="upcoming-when">
                  <strong>{relativeDays(item.interviewDate)}</strong>
                  <span className="muted">{formatDate(item.interviewDate, true)}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

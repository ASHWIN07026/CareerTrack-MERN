import { SORT_OPTIONS, STATUSES } from '../utils/constants.js';
import Icon from './Icon.jsx';

export default function Toolbar({ search, status, sort, onChange, resultCount }) {
  return (
    <section className="toolbar" aria-label="Search and filters">
      <label className="search-box">
        <Icon name="search" />
        <span className="sr-only">Search by company or job title</span>
        <input
          type="search"
          placeholder="Search company or job title…"
          value={search}
          maxLength={100}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </label>
      <div className="toolbar-selects">
        <label>
          <span className="sr-only">Filter by status</span>
          <select value={status} onChange={(e) => onChange({ status: e.target.value })}>
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label>
          <span className="sr-only">Sort applications</span>
          <select value={sort} onChange={(e) => onChange({ sort: e.target.value })}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      </div>
      {typeof resultCount === 'number' && (
        <p className="result-count" aria-live="polite">{resultCount} application{resultCount === 1 ? '' : 's'}</p>
      )}
    </section>
  );
}

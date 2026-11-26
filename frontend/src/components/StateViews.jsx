import Icon from './Icon.jsx';

export function Loader({ label = 'Loading…' }) {
  return (
    <div className="state" role="status">
      <span className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state state-error" role="alert">
      <Icon name="alert" size={28} />
      <p>{message}</p>
      {onRetry && (
        <button type="button" className="btn btn-secondary" onClick={onRetry}>
          <Icon name="refresh" /> Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ filtered, onAdd, onClear }) {
  return (
    <div className="state">
      <Icon name="briefcase" size={32} />
      <h3>{filtered ? 'No matching applications' : 'No applications yet'}</h3>
      <p className="muted">
        {filtered ? 'Try a different search or status filter.' : 'Add your first job application to start tracking.'}
      </p>
      {filtered ? (
        <button type="button" className="btn btn-secondary" onClick={onClear}>Clear filters</button>
      ) : (
        <button type="button" className="btn btn-primary" onClick={onAdd}><Icon name="plus" /> Add application</button>
      )}
    </div>
  );
}

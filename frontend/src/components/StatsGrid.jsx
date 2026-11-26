import { STATUSES } from '../utils/constants.js';

export default function StatsGrid({ stats, loading, error, activeStatus, onSelect }) {
  if (error) return <div className="alert alert-error" role="alert">Could not load statistics: {error}</div>;
  const cards = [
    { key: '', label: 'Total', value: stats?.total },
    ...STATUSES.map((s) => ({ key: s, label: s, value: stats?.byStatus?.[s] })),
  ];
  return (
    <section className="stats-grid" aria-label="Application statistics" aria-busy={loading}>
      {cards.map((card) => (
        <button
          type="button"
          key={card.label}
          className={`stat-card stat-${(card.key || 'total').toLowerCase()} ${activeStatus === card.key ? 'active' : ''}`}
          onClick={() => onSelect(card.key)}
          aria-pressed={activeStatus === card.key}
        >
          <span className="stat-label">{card.label}</span>
          <span className="stat-value">{loading && !stats ? <span className="skeleton" /> : card.value ?? 0}</span>
        </button>
      ))}
    </section>
  );
}

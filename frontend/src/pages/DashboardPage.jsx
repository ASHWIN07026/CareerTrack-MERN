import { useCallback, useState } from 'react';
import ApplicationCard from '../components/ApplicationCard.jsx';
import ApplicationDetails from '../components/ApplicationDetails.jsx';
import ApplicationForm from '../components/ApplicationForm.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import Header from '../components/Header.jsx';
import Modal from '../components/Modal.jsx';
import StatsGrid from '../components/StatsGrid.jsx';
import Toast from '../components/Toast.jsx';
import Toolbar from '../components/Toolbar.jsx';
import UpcomingInterviews from '../components/UpcomingInterviews.jsx';
import { EmptyState, ErrorState, Loader } from '../components/StateViews.jsx';
import { useApplications } from '../hooks/useApplications.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { applicationsApi } from '../services/api.js';

export default function DashboardPage() {
  const [filters, setFilters] = useState({ search: '', status: '', sort: 'newest' });
  const debouncedSearch = useDebounce(filters.search, 300);
  const { applications, stats, loading, statsLoading, error, statsError, refresh } = useApplications({
    ...filters,
    search: debouncedSearch,
  });

  // modal: null | { type: 'create' } | { type: 'edit' | 'view' | 'delete', application }
  const [modal, setModal] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);

  const closeModal = useCallback(() => setModal(null), []);
  const dismissToast = useCallback(() => setToast(null), []);
  const updateFilters = (patch) => setFilters((f) => ({ ...f, ...patch }));
  const filtered = Boolean(filters.search.trim() || filters.status);

  const openView = async (applicationOrId) => {
    if (typeof applicationOrId === 'object') return setModal({ type: 'view', application: applicationOrId });
    try {
      setModal({ type: 'view', application: await applicationsApi.get(applicationOrId) });
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    }
    return undefined;
  };

  const handleSave = async (payload) => {
    setBusy(true);
    try {
      if (modal.type === 'edit') {
        await applicationsApi.update(modal.application._id, payload);
        setToast({ type: 'success', message: 'Application updated' });
      } else {
        await applicationsApi.create(payload);
        setToast({ type: 'success', message: 'Application added' });
      }
      setModal(null);
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await applicationsApi.remove(modal.application._id);
      setToast({ type: 'success', message: 'Application deleted' });
      setModal(null);
      refresh();
    } catch (err) {
      setToast({ type: 'error', message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const actions = {
    onView: openView,
    onEdit: (application) => setModal({ type: 'edit', application }),
    onDelete: (application) => setModal({ type: 'delete', application }),
  };

  let content;
  if (loading && applications.length === 0) content = <Loader label="Loading applications…" />;
  else if (error) content = <ErrorState message={error} onRetry={refresh} />;
  else if (applications.length === 0) {
    content = (
      <EmptyState
        filtered={filtered}
        onAdd={() => setModal({ type: 'create' })}
        onClear={() => updateFilters({ search: '', status: '' })}
      />
    );
  } else {
    content = (
      <div className={`app-grid ${loading ? 'is-refreshing' : ''}`}>
        {applications.map((a) => <ApplicationCard key={a._id} application={a} {...actions} />)}
      </div>
    );
  }

  return (
    <>
      <Header onAdd={() => setModal({ type: 'create' })} />
      <main className="container main">
        <StatsGrid
          stats={stats}
          loading={statsLoading}
          error={statsError}
          activeStatus={filters.status}
          onSelect={(status) => updateFilters({ status })}
        />
        <div className="layout">
          <section className="panel applications" aria-labelledby="applications-heading">
            <h2 id="applications-heading" className="section-title">Applications</h2>
            <Toolbar {...filters} onChange={updateFilters} resultCount={loading || error ? undefined : applications.length} />
            {content}
          </section>
          <aside>
            <UpcomingInterviews stats={stats} onView={openView} />
          </aside>
        </div>
      </main>
      <footer className="footer container">
        CareerTrack · Built with MongoDB, Express, React &amp; Node.js
      </footer>

      {(modal?.type === 'create' || modal?.type === 'edit') && (
        <Modal title={modal.type === 'edit' ? 'Edit application' : 'Add application'} onClose={closeModal} busy={busy} size="lg">
          <ApplicationForm application={modal.application} onSubmit={handleSave} onCancel={closeModal} submitting={busy} />
        </Modal>
      )}
      {modal?.type === 'view' && (
        <Modal title="Application details" onClose={closeModal} size="lg">
          <ApplicationDetails application={modal.application} {...actions} />
        </Modal>
      )}
      {modal?.type === 'delete' && (
        <ConfirmDialog
          title="Delete application?"
          message={`Delete "${modal.application.jobTitle}" at ${modal.application.company}? This cannot be undone.`}
          busy={busy}
          onConfirm={handleDelete}
          onCancel={closeModal}
        />
      )}
      <Toast toast={toast} onDismiss={dismissToast} />
    </>
  );
}

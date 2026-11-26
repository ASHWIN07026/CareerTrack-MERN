import { useEffect } from 'react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDismiss, 3500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type}`} role={toast.type === 'error' ? 'alert' : 'status'}>
      <span>{toast.message}</span>
      <button type="button" onClick={onDismiss} aria-label="Dismiss notification">×</button>
    </div>
  );
}

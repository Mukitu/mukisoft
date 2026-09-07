'use client';

import { useEffect } from 'react';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="admin-modal">
        <h3 id="confirm-title">{title}</h3>
        <p>{description}</p>
        <div className="admin-modal-actions">
          <button type="button" className="admin-btn ghost" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button
            type="button"
            className={`admin-btn ${destructive ? 'danger' : 'primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? <span className="admin-spinner" /> : null}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
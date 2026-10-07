import { useState } from 'react';
import { deleteTeamMember } from '../../../lib/admin/settings';

export default function DeleteMemberDialog({ member, onClose, onDeleted }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmText, setConfirmText] = useState('');

  const canDelete =
    confirmText.trim().toLowerCase() === member.email.toLowerCase();

  async function handleDelete() {
    if (!canDelete) return;
    setBusy(true);
    setError(null);
    try {
      await deleteTeamMember(member.id);
      onDeleted();
    } catch (err) {
      console.error('[DeleteMemberDialog]', err);
      setError(err?.message || 'Could not delete this member.');
      setBusy(false);
    }
  }

  return (
    <>
      <div
        className='fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      <div
        role='alertdialog'
        aria-modal='true'
        aria-labelledby='delete-title'
        className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4'>
        <div className='bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden'>
          {/* Header */}
          <div className='px-6 pt-6 pb-5 border-b border-slate-100'>
            <div className='flex items-start gap-4'>
              <div className='w-11 h-11 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0'>
                <i className='fas fa-trash-can text-sm' aria-hidden='true' />
              </div>
              <div className='min-w-0'>
                <h2
                  id='delete-title'
                  className='font-display font-light text-xl text-slate-900 leading-tight'>
                  Delete {member.full_name || member.email}?
                </h2>
                <p className='mt-1.5 text-xs text-slate-500 leading-relaxed'>
                  This permanently removes their account. It cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className='px-6 py-5 space-y-4'>
            <div className='rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-700 leading-relaxed'>
              <strong className='block mb-1'>This will:</strong>
              <ul className='space-y-0.5'>
                <li>· Remove their login access immediately</li>
                <li>· Delete them from the admin team list</li>
                <li>· Preserve their past activity in audit logs</li>
              </ul>
            </div>

            <label className='block'>
              <span className='block text-xs font-medium text-slate-600 mb-1.5'>
                Type{' '}
                <span className='font-mono text-slate-900'>{member.email}</span>{' '}
                to confirm
              </span>
              <input
                type='text'
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                autoComplete='off'
                spellCheck={false}
                placeholder={member.email}
                className='w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm
                           text-slate-900 placeholder-slate-300 font-mono
                           focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/15'
              />
            </label>

            {error && (
              <p className='text-xs text-red-600 leading-relaxed'>{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className='px-6 pb-6 pt-2 flex items-center gap-2'>
            <button
              type='button'
              onClick={onClose}
              disabled={busy}
              className='flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-700
                         text-sm font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors'>
              Cancel
            </button>
            <button
              type='button'
              onClick={handleDelete}
              disabled={!canDelete || busy}
              className='flex-1 inline-flex items-center justify-center gap-2
                         px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold
                         hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors'>
              {busy ? (
                <>
                  <i
                    className='fas fa-circle-notch fa-spin text-xs'
                    aria-hidden='true'
                  />
                  Deleting…
                </>
              ) : (
                <>
                  <i className='fas fa-trash-can text-xs' aria-hidden='true' />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

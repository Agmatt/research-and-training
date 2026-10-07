import { useState } from 'react';
import {
  createTeamMember,
  validatePassword,
  ROLE_OPTIONS,
} from '../../../lib/admin/settings';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 ' +
  'focus:ring-primary/15 transition-colors';

export default function AddMemberModal({ onClose, onCreated }) {
  const [mode, setMode] = useState('invite'); // 'invite' | 'password'
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('staff');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const selectedRole = ROLE_OPTIONS.find((r) => r.value === role);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    if (fullName.trim().length < 2) {
      setError('Full name must be at least 2 characters.');
      return;
    }
    if (mode === 'password') {
      const pwErr = validatePassword(password);
      if (pwErr) {
        setError(pwErr);
        return;
      }
    }

    setSubmitting(true);
    try {
      await createTeamMember({
        mode,
        email: email.trim().toLowerCase(),
        full_name: fullName.trim(),
        role,
        password: mode === 'password' ? password : undefined,
      });
      onCreated();
    } catch (err) {
      console.error('[AddMemberModal]', err);
      setError(err?.message || 'Could not create team member.');
    } finally {
      setSubmitting(false);
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
        role='dialog'
        aria-modal='true'
        aria-label='Add team member'
        className='fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4'>
        <div className='bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[95vh] flex flex-col'>
          {/* Header */}
          <header className='flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 shrink-0'>
            <div>
              <h2 className='font-display font-light text-xl text-slate-900 leading-tight'>
                Add team member
              </h2>
              <p className='text-xs text-slate-500 mt-1'>
                Creates an SPMH admin account and provisions their access.
              </p>
            </div>
            <button
              type='button'
              onClick={onClose}
              className='w-8 h-8 flex items-center justify-center rounded-lg
                         text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0'
              aria-label='Close'>
              <i className='fas fa-times text-sm' aria-hidden='true' />
            </button>
          </header>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className='p-6 space-y-5 overflow-y-auto'>
            {/* Mode toggle */}
            <div className='grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100'>
              {[
                { id: 'invite', label: 'Invite by email', icon: 'envelope' },
                { id: 'password', label: 'Set password now', icon: 'key' },
              ].map((m) => (
                <button
                  key={m.id}
                  type='button'
                  onClick={() => {
                    setMode(m.id);
                    setError(null);
                  }}
                  className={`inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    mode === m.id
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}>
                  <i
                    className={`fas fa-${m.icon} text-[10px]`}
                    aria-hidden='true'
                  />
                  {m.label}
                </button>
              ))}
            </div>

            <label className='block'>
              <span className='block text-xs font-medium text-slate-600 mb-1.5'>
                Full name <span className='text-red-500'>*</span>
              </span>
              <input
                type='text'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoFocus
                placeholder='Dr. Jane Doe'
                className={inputCls}
              />
            </label>

            <label className='block'>
              <span className='block text-xs font-medium text-slate-600 mb-1.5'>
                Email <span className='text-red-500'>*</span>
              </span>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='jane.doe@spmh.co.ke'
                className={inputCls}
              />
            </label>

            <label className='block'>
              <span className='block text-xs font-medium text-slate-600 mb-1.5'>
                Role <span className='text-red-500'>*</span>
              </span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className={inputCls}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
              {selectedRole && (
                <span className='block text-[11px] text-slate-500 mt-1.5 leading-relaxed'>
                  {selectedRole.description}
                </span>
              )}
            </label>

            {mode === 'password' && (
              <label className='block'>
                <span className='block text-xs font-medium text-slate-600 mb-1.5'>
                  Temporary password <span className='text-red-500'>*</span>
                </span>
                <input
                  type='text'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Min 8 chars, upper + lower + number'
                  className={inputCls + ' font-mono'}
                />
                <span className='block text-[11px] text-slate-500 mt-1.5'>
                  Share this securely with the user. They can change it after
                  first login.
                </span>
              </label>
            )}

            {mode === 'invite' && (
              <div className='rounded-xl border border-blue-200/70 bg-blue-50/60 p-3 text-xs text-blue-900 leading-relaxed'>
                <i className='fas fa-circle-info mr-1.5' aria-hidden='true' />
                They&rsquo;ll receive an email with a sign-in link. The account
                stays unverified until they click it.
              </div>
            )}

            {error && (
              <p className='text-xs text-red-600 leading-relaxed'>{error}</p>
            )}

            <div className='flex items-center justify-end gap-2 pt-1'>
              <button
                type='button'
                onClick={onClose}
                disabled={submitting}
                className='px-4 py-2.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100 disabled:opacity-50'>
                Cancel
              </button>
              <button
                type='submit'
                disabled={submitting}
                className='inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold
                           hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors'>
                {submitting ? (
                  <>
                    <i
                      className='fas fa-circle-notch fa-spin text-[10px]'
                      aria-hidden='true'
                    />
                    Creating…
                  </>
                ) : (
                  <>
                    <i
                      className={`fas fa-${mode === 'invite' ? 'paper-plane' : 'user-plus'} text-[10px]`}
                      aria-hidden='true'
                    />
                    {mode === 'invite' ? 'Send invitation' : 'Create account'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

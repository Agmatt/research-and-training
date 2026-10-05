import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-react';
import {
  fetchTeam,
  updateMemberRole,
  setMemberActive,
  createTeamMember,
  roleLabel,
  relativeTime,
  formatDate,
  initialsOf,
  validatePassword,
  ROLE_OPTIONS,
} from '../../../lib/admin/settings';

/* ============================================================
   Row (unchanged)
   ============================================================ */

function TeamRow({ member, isSelf, onChange }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function handleRoleChange(newRole) {
    if (newRole === member.role) return;
    if (isSelf && newRole !== 'admin') {
      alert('You cannot demote yourself. Ask another admin to do it.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await updateMemberRole(member.id, newRole);
      onChange();
    } catch (err) {
      console.error('[TeamRow] role', err);
      setError('Could not change role.');
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleActive() {
    const next = !member.is_active;
    if (isSelf && !next) {
      alert('You cannot deactivate your own account.');
      return;
    }
    const verb = next ? 'restore' : 'deactivate';
    if (!confirm(`Are you sure you want to ${verb} ${member.full_name}?`))
      return;

    setBusy(true);
    setError(null);
    try {
      await setMemberActive(member.id, next);
      onChange();
    } catch (err) {
      console.error('[TeamRow] active', err);
      setError('Could not update status.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <tr
      className={`transition-colors ${!member.is_active ? 'bg-slate-50/60' : 'hover:bg-slate-50/40'}`}>
      <td className='px-5 py-4'>
        <div className='flex items-center gap-3 min-w-0'>
          <span
            className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
              member.is_active
                ? 'bg-primary/10 text-primary'
                : 'bg-slate-100 text-slate-400'
            }`}>
            {initialsOf(member.full_name)}
          </span>
          <div className='min-w-0'>
            <p
              className={`text-sm font-semibold truncate ${member.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
              {member.full_name || 'Unnamed'}
              {isSelf && (
                <span className='ml-2 text-[10px] uppercase tracking-wider font-bold text-primary'>
                  You
                </span>
              )}
            </p>
            <p className='text-xs text-slate-500 truncate'>{member.email}</p>
          </div>
        </div>
      </td>

      <td className='px-4 py-4'>
        <select
          value={member.role}
          onChange={(e) => handleRoleChange(e.target.value)}
          disabled={busy || isSelf}
          className='w-full max-w-[10rem] px-2.5 py-1.5 text-xs rounded-md border border-slate-200
                     bg-white text-slate-700
                     focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                     disabled:opacity-60 disabled:cursor-not-allowed'>
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </td>

      <td className='hidden md:table-cell px-4 py-4'>
        <span className='text-xs text-slate-500 font-mono'>
          {relativeTime(member.last_login_at)}
        </span>
      </td>

      <td className='px-4 py-4'>
        <span
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
            member.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-500'
          }`}>
          <span
            className={`h-1.5 w-1.5 rounded-full ${member.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}
          />
          {member.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>

      <td className='px-5 py-4 text-right'>
        {error && <p className='text-[10px] text-red-600 mb-1'>{error}</p>}
        <button
          type='button'
          onClick={handleToggleActive}
          disabled={busy || isSelf}
          className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed ${
                       member.is_active
                         ? 'text-red-600 hover:bg-red-50'
                         : 'text-emerald-600 hover:bg-emerald-50'
                     }`}>
          {busy ? '…' : member.is_active ? 'Deactivate' : 'Restore'}
        </button>
      </td>
    </tr>
  );
}

/* ============================================================
   Add member modal
   ============================================================ */

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 ' +
  'focus:ring-primary/15 transition-colors';

function AddMemberModal({ onClose, onCreated }) {
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
        className='fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      <div
        role='dialog'
        aria-modal='true'
        aria-label='Add team member'
        className='fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none'>
        <div
          className='bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto
                     animate-[fadeInUp_180ms_ease-out]'
          onClick={(e) => e.stopPropagation()}>
          <style>{`@keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

          {/* Header */}
          <header className='flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100'>
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
          <form onSubmit={handleSubmit} className='p-6 space-y-5'>
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

/* ============================================================
   Main
   ============================================================ */

export default function TeamTab() {
  const { adminUser } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    try {
      const rows = await fetchTeam();
      setMembers(rows);
      setError(null);
    } catch (err) {
      console.error('[TeamTab]', err);
      setError(err?.message || 'Could not load team.');
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchTeam();
        if (!cancelled) setMembers(rows);
      } catch (err) {
        console.error('[TeamTab]', err);
        if (!cancelled) setError(err?.message || 'Could not load team.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className='space-y-6'>
      {/* Header with Add button */}
      <div className='flex items-center justify-between gap-4'>
        <div>
          <h2 className='text-sm font-semibold text-slate-900'>Team</h2>
          <p className='text-xs text-slate-500 mt-1'>
            Manage roles, access, and provisioning.
          </p>
        </div>
        <button
          type='button'
          onClick={() => setShowAdd(true)}
          className='inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold
                     hover:bg-primary-dark transition-colors shrink-0'>
          <i className='fas fa-user-plus text-[10px]' aria-hidden='true' />
          Add member
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0'>
              <div className='w-10 h-10 rounded-full bg-slate-100 animate-pulse' />
              <div className='flex-1 space-y-2'>
                <div className='h-3 w-40 bg-slate-100 rounded animate-pulse' />
                <div className='h-2.5 w-56 bg-slate-100 rounded animate-pulse' />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
          <p className='text-sm text-red-800'>{error}</p>
        </div>
      ) : (
        <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-slate-100 bg-slate-50/50'>
                <th className='text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                  Member
                </th>
                <th className='text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                  Role
                </th>
                <th className='hidden md:table-cell text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                  Last login
                </th>
                <th className='text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                  Status
                </th>
                <th className='text-right px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500' />
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {members.map((m) => (
                <TeamRow
                  key={m.id}
                  member={m}
                  isSelf={m.id === adminUser?.id}
                  onChange={load}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Role legend */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
        {ROLE_OPTIONS.map((r) => (
          <div
            key={r.value}
            className='rounded-xl border border-slate-200/80 bg-white p-4'>
            <p className='text-xs font-bold text-slate-900 mb-1'>{r.label}</p>
            <p className='text-xs text-slate-500 leading-relaxed'>
              {r.description}
            </p>
          </div>
        ))}
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}

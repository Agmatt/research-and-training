import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-react';
import {
  fetchTeam,
  updateMemberRole,
  setMemberActive,
  roleLabel,
  relativeTime,
  initialsOf,
  ROLE_OPTIONS,
} from '../../../lib/admin/settings';
import DeleteMemberDialog from './DeleteMemberDialog';
import AddMemberModal from './AddMemberModal';

/* ============================================================
   Role badge — display-only in card view
   ============================================================ */

function RoleBadge({ role }) {
  const tones = {
    admin: 'bg-primary/10 text-primary ring-primary/20',
    supervisor: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    staff: 'bg-slate-100 text-slate-600 ring-slate-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ring-1 ${tones[role] || tones.staff}`}>
      {roleLabel(role)}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
        active
          ? 'bg-emerald-50 text-emerald-700'
          : 'bg-slate-100 text-slate-500'
      }`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-slate-400'}`}
      />
      {active ? 'Active' : 'Inactive'}
    </span>
  );
}

/* ============================================================
   Shared row actions — reused by both table and card views
   ============================================================ */

function useMemberActions(member, isSelf, onChange, onRequestDelete) {
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
      console.error('[TeamTab] role', err);
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
      console.error('[TeamTab] active', err);
      setError('Could not update status.');
    } finally {
      setBusy(false);
    }
  }

  return {
    busy,
    error,
    handleRoleChange,
    handleToggleActive,
    handleDelete: () => onRequestDelete(member),
  };
}

/* ============================================================
   DESKTOP — table row
   ============================================================ */

function TeamRow({ member, isSelf, onChange, onRequestDelete }) {
  const { busy, error, handleRoleChange, handleToggleActive, handleDelete } =
    useMemberActions(member, isSelf, onChange, onRequestDelete);

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

      <td className='hidden lg:table-cell px-4 py-4'>
        <span className='text-xs text-slate-500 font-mono'>
          {relativeTime(member.last_login_at)}
        </span>
      </td>

      <td className='px-4 py-4'>
        <StatusBadge active={member.is_active} />
      </td>

      <td className='px-5 py-4'>
        {error && (
          <p className='text-[10px] text-red-600 mb-1 text-right'>{error}</p>
        )}
        <div className='flex items-center justify-end gap-1'>
          <button
            type='button'
            onClick={handleToggleActive}
            disabled={busy || isSelf}
            className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed ${
                         member.is_active
                           ? 'text-slate-600 hover:bg-slate-100'
                           : 'text-emerald-600 hover:bg-emerald-50'
                       }`}
            title={member.is_active ? 'Deactivate' : 'Restore'}>
            {busy ? '…' : member.is_active ? 'Deactivate' : 'Restore'}
          </button>
          <button
            type='button'
            onClick={handleDelete}
            disabled={busy || isSelf}
            className='text-xs font-semibold px-2.5 py-1.5 rounded-md text-red-600
                       hover:bg-red-50 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed'
            title='Delete user'
            aria-label={`Delete ${member.full_name}`}>
            <i className='fas fa-trash-can text-[11px]' aria-hidden='true' />
          </button>
        </div>
      </td>
    </tr>
  );
}

/* ============================================================
   MOBILE — card
   ============================================================ */

function TeamCard({ member, isSelf, onChange, onRequestDelete }) {
  const { busy, error, handleRoleChange, handleToggleActive, handleDelete } =
    useMemberActions(member, isSelf, onChange, onRequestDelete);

  return (
    <div
      className={`rounded-2xl border bg-white p-5 ${
        member.is_active
          ? 'border-slate-200/80'
          : 'border-slate-200/60 bg-slate-50/60'
      }`}>
      {/* Identity */}
      <div className='flex items-start gap-3 mb-5'>
        <span
          className={`w-11 h-11 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
            member.is_active
              ? 'bg-primary/10 text-primary'
              : 'bg-slate-100 text-slate-400'
          }`}>
          {initialsOf(member.full_name)}
        </span>
        <div className='min-w-0 flex-1'>
          <p
            className={`text-sm font-semibold truncate ${member.is_active ? 'text-slate-900' : 'text-slate-400'}`}>
            {member.full_name || 'Unnamed'}
            {isSelf && (
              <span className='ml-2 text-[10px] uppercase tracking-wider font-bold text-primary'>
                You
              </span>
            )}
          </p>
          <p className='text-xs text-slate-500 truncate mt-0.5'>
            {member.email}
          </p>
          <div className='mt-2 flex flex-wrap items-center gap-2'>
            <RoleBadge role={member.role} />
            <StatusBadge active={member.is_active} />
          </div>
        </div>
      </div>

      {/* Meta rows */}
      <dl className='grid grid-cols-2 gap-y-3 gap-x-4 py-4 border-y border-slate-100 text-xs'>
        <div>
          <dt className='text-slate-400 mb-0.5'>Last login</dt>
          <dd className='text-slate-700 font-mono'>
            {relativeTime(member.last_login_at)}
          </dd>
        </div>
        <div>
          <dt className='text-slate-400 mb-0.5'>Role</dt>
          <dd>
            <select
              value={member.role}
              onChange={(e) => handleRoleChange(e.target.value)}
              disabled={busy || isSelf}
              className='w-full px-2 py-1 text-xs rounded-md border border-slate-200
                         bg-white text-slate-700
                         focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                         disabled:opacity-60 disabled:cursor-not-allowed'>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </dd>
        </div>
      </dl>

      {error && <p className='text-[10px] text-red-600 mt-3'>{error}</p>}

      {/* Actions */}
      <div className='mt-4 flex items-center gap-2'>
        <button
          type='button'
          onClick={handleToggleActive}
          disabled={busy || isSelf}
          className={`flex-1 inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg
                     text-xs font-semibold border transition-colors
                     disabled:opacity-40 disabled:cursor-not-allowed ${
                       member.is_active
                         ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
                         : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                     }`}>
          <i
            className={`fas ${member.is_active ? 'fa-user-slash' : 'fa-user-check'} text-[10px]`}
            aria-hidden='true'
          />
          {busy ? '…' : member.is_active ? 'Deactivate' : 'Restore'}
        </button>
        <button
          type='button'
          onClick={handleDelete}
          disabled={busy || isSelf}
          className='inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg
                     text-xs font-semibold border border-red-200 text-red-600
                     hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed
                     transition-colors'
          aria-label={`Delete ${member.full_name}`}>
          <i className='fas fa-trash-can text-[10px]' aria-hidden='true' />
          Delete
        </button>
      </div>
    </div>
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
  const [deleteTarget, setDeleteTarget] = useState(null);

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
          <span className='hidden sm:inline'>Add member</span>
          <span className='sm:hidden'>Add</span>
        </button>
      </div>

      {/* Loading */}
      {loading && (
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
      )}

      {/* Error */}
      {!loading && error && (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
          <p className='text-sm text-red-800'>{error}</p>
        </div>
      )}

      {/* Data */}
      {!loading && !error && (
        <>
          {/* Desktop table */}
          <div className='hidden md:block rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
            <table className='w-full'>
              <thead>
                <tr className='border-b border-slate-100 bg-slate-50/50'>
                  <th className='text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                    Member
                  </th>
                  <th className='text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                    Role
                  </th>
                  <th className='hidden lg:table-cell text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                    Last login
                  </th>
                  <th className='text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                    Status
                  </th>
                  <th className='text-right px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {members.map((m) => (
                  <TeamRow
                    key={m.id}
                    member={m}
                    isSelf={m.id === adminUser?.id}
                    onChange={load}
                    onRequestDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className='md:hidden space-y-3'>
            {members.map((m) => (
              <TeamCard
                key={m.id}
                member={m}
                isSelf={m.id === adminUser?.id}
                onChange={load}
                onRequestDelete={setDeleteTarget}
              />
            ))}
          </div>
        </>
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

      {/* Dialogs */}
      {showAdd && (
        <AddMemberModal
          onClose={() => setShowAdd(false)}
          onCreated={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
      {deleteTarget && (
        <DeleteMemberDialog
          member={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={() => {
            setDeleteTarget(null);
            load();
          }}
        />
      )}
    </div>
  );
}

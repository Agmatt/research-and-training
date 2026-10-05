import { useCallback, useEffect, useState } from 'react';
import StatusBadge from '../shared/StatusBadge';
import { useAuth } from '../../../lib/auth-react';
import {
  fetchApplicant,
  fetchEvents,
  fetchAssignment,
  fetchSupervisors,
  updateApplicantStatus,
  addNote,
  assignPreceptor,
  unassignPreceptor,
  statusLabel,
  relativeTime,
  formatDate,
  formatDateRange,
  STATUS_OPTIONS,
} from '../../../lib/admin/applicants';

/* ============================================================
   Small pieces
   ============================================================ */

function DetailRow({ label, children }) {
  return (
    <div className='grid grid-cols-3 gap-4 py-2.5 border-b border-slate-100 last:border-0'>
      <dt className='text-xs font-medium text-slate-500 pt-0.5'>{label}</dt>
      <dd className='col-span-2 text-sm text-slate-900 break-words'>
        {children || '—'}
      </dd>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className='px-6 py-5 border-b border-slate-100 last:border-0'>
      <div className='flex items-center gap-2 mb-4'>
        <i
          className={`fas fa-${icon} text-xs text-slate-400`}
          aria-hidden='true'
        />
        <h3 className='text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500'>
          {title}
        </h3>
      </div>
      {children}
    </section>
  );
}

/* ============================================================
   Status change panel
   ============================================================ */

function StatusPanel({ applicant, onUpdated }) {
  const { adminUser } = useAuth();
  const [newStatus, setNewStatus] = useState(applicant.status);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dirty = newStatus !== applicant.status;

  async function handleSave() {
    if (!dirty || !adminUser) return;
    setError(null);
    setLoading(true);
    try {
      await updateApplicantStatus(
        applicant.id,
        newStatus,
        applicant.status,
        adminUser.id,
        note.trim() || undefined,
      );
      setNote('');
      onUpdated();
    } catch (err) {
      console.error('[StatusPanel]', err);
      setError('Could not update status. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title='Status' icon='circle-half-stroke'>
      <div className='space-y-3'>
        <div className='flex items-center gap-3'>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className='flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
          <button
            type='button'
            onClick={handleSave}
            disabled={!dirty || loading}
            className='px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold
                       hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed
                       transition-colors shrink-0'>
            {loading ? 'Saving…' : dirty ? 'Update' : 'Saved'}
          </button>
        </div>

        {dirty && (
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder='Add a note about this change (optional)…'
            className='w-full px-3 py-2 text-sm rounded-lg border border-slate-200
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                       resize-none'
          />
        )}

        {error && <p className='text-xs text-red-600'>{error}</p>}
      </div>
    </Section>
  );
}

/* ============================================================
   Preceptor assignment panel
   ============================================================ */

function AssignmentPanel({ applicant, assignment, supervisors, onUpdated }) {
  const { adminUser } = useAuth();
  const [picking, setPicking] = useState(false);
  const [supervisorId, setSupervisorId] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleAssign() {
    if (!supervisorId || !adminUser) return;
    setError(null);
    setLoading(true);
    try {
      await assignPreceptor(
        applicant.id,
        supervisorId,
        adminUser.id,
        department.trim() || undefined,
        applicant.start_date || undefined,
        applicant.end_date || undefined,
      );
      setPicking(false);
      setSupervisorId('');
      setDepartment('');
      onUpdated();
    } catch (err) {
      console.error('[AssignmentPanel] assign', err);
      setError(err?.message || 'Could not assign preceptor.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUnassign() {
    if (!assignment || !adminUser) return;
    if (!confirm('Remove this preceptor assignment?')) return;
    setError(null);
    setLoading(true);
    try {
      await unassignPreceptor(assignment.id, applicant.id, adminUser.id);
      onUpdated();
    } catch (err) {
      console.error('[AssignmentPanel] unassign', err);
      setError('Could not remove assignment.');
    } finally {
      setLoading(false);
    }
  }

  /* — Currently assigned — */
  if (assignment) {
    return (
      <Section title='Preceptor' icon='user-tie'>
        <div className='rounded-xl border border-emerald-200 bg-emerald-50/60 p-4'>
          <div className='flex items-start justify-between gap-4'>
            <div className='min-w-0'>
              <p className='text-sm font-semibold text-emerald-900 truncate'>
                {assignment.supervisor?.full_name || 'Supervisor'}
              </p>
              <p className='text-xs text-emerald-700/80 mt-0.5 truncate'>
                {assignment.supervisor?.email}
              </p>
              {assignment.department && (
                <p className='text-xs text-emerald-700 mt-2'>
                  <span className='font-medium'>Department:</span>{' '}
                  {assignment.department}
                </p>
              )}
              {(assignment.start_date || assignment.end_date) && (
                <p className='text-xs text-emerald-700 mt-1'>
                  <span className='font-medium'>Period:</span>{' '}
                  {formatDateRange(assignment.start_date, assignment.end_date)}
                </p>
              )}
            </div>
            <button
              type='button'
              onClick={handleUnassign}
              disabled={loading}
              className='text-xs font-semibold text-emerald-800 hover:underline shrink-0
                         disabled:opacity-50'>
              {loading ? 'Removing…' : 'Remove'}
            </button>
          </div>
        </div>
        {error && <p className='text-xs text-red-600 mt-2'>{error}</p>}
      </Section>
    );
  }

  /* — Picking a preceptor — */
  if (picking) {
    return (
      <Section title='Preceptor' icon='user-tie'>
        <div className='space-y-3'>
          <select
            value={supervisorId}
            onChange={(e) => setSupervisorId(e.target.value)}
            className='w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'>
            <option value=''>Choose a preceptor…</option>
            {supervisors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.full_name} ({s.role})
              </option>
            ))}
          </select>

          <input
            type='text'
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder='Department (optional)'
            className='w-full px-3 py-2 text-sm rounded-lg border border-slate-200
                       focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15'
          />

          {error && <p className='text-xs text-red-600'>{error}</p>}

          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={handleAssign}
              disabled={!supervisorId || loading}
              className='px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold
                         hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed
                         transition-colors'>
              {loading ? 'Assigning…' : 'Assign'}
            </button>
            <button
              type='button'
              onClick={() => {
                setPicking(false);
                setSupervisorId('');
                setDepartment('');
                setError(null);
              }}
              className='px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-100'>
              Cancel
            </button>
          </div>
        </div>
      </Section>
    );
  }

  /* — No assignment yet — */
  return (
    <Section title='Preceptor' icon='user-tie'>
      <div className='rounded-xl border border-dashed border-slate-300 p-4 text-center'>
        <p className='text-sm text-slate-500 mb-3'>
          No preceptor assigned yet.
        </p>
        <button
          type='button'
          onClick={() => setPicking(true)}
          className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold
                     hover:bg-primary-dark transition-colors'>
          <i className='fas fa-plus text-[10px]' aria-hidden='true' />
          Assign preceptor
        </button>
      </div>
      {error && <p className='text-xs text-red-600 mt-2'>{error}</p>}
    </Section>
  );
}

/* ============================================================
   Notes panel
   ============================================================ */

function NotesPanel({ applicant, onUpdated }) {
  const { adminUser } = useAuth();
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSave() {
    const text = note.trim();
    if (!text || !adminUser) return;
    setError(null);
    setLoading(true);
    try {
      await addNote(applicant.id, adminUser.id, text);
      setNote('');
      onUpdated();
    } catch (err) {
      console.error('[NotesPanel]', err);
      setError('Could not save note.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Section title='Add a note' icon='note-sticky'>
      <div className='space-y-3'>
        <textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder='Internal note — visible only to admin staff…'
          className='w-full px-3 py-2 text-sm rounded-lg border border-slate-200
                     focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                     resize-none'
        />
        {error && <p className='text-xs text-red-600'>{error}</p>}
        <div className='flex justify-end'>
          <button
            type='button'
            onClick={handleSave}
            disabled={!note.trim() || loading}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white
                       text-xs font-semibold hover:bg-slate-800
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors'>
            <i className='fas fa-paper-plane text-[10px]' aria-hidden='true' />
            {loading ? 'Saving…' : 'Save note'}
          </button>
        </div>
      </div>
    </Section>
  );
}

/* ============================================================
   Activity timeline
   ============================================================ */

const EVENT_ICONS = {
  submitted: { icon: 'paper-plane', tone: 'text-blue-500 bg-blue-50' },
  status_change: {
    icon: 'circle-half-stroke',
    tone: 'text-amber-600 bg-amber-50',
  },
  note_added: { icon: 'note-sticky', tone: 'text-slate-600 bg-slate-100' },
  preceptor_assigned: {
    icon: 'user-check',
    tone: 'text-emerald-600 bg-emerald-50',
  },
  preceptor_unassigned: { icon: 'user-xmark', tone: 'text-red-500 bg-red-50' },
  email_sent: { icon: 'envelope', tone: 'text-indigo-500 bg-indigo-50' },
};

function ActivityTimeline({ events }) {
  if (events.length === 0) {
    return (
      <Section title='Activity' icon='clock-rotate-left'>
        <p className='text-xs text-slate-400 text-center py-4'>
          No activity recorded.
        </p>
      </Section>
    );
  }

  return (
    <Section title='Activity' icon='clock-rotate-left'>
      <ul className='space-y-4'>
        {events.map((e) => {
          const meta = EVENT_ICONS[e.event_type] || EVENT_ICONS.note_added;
          return (
            <li key={e.id} className='flex gap-3'>
              <span
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${meta.tone}`}>
                <i
                  className={`fas fa-${meta.icon} text-[10px]`}
                  aria-hidden='true'
                />
              </span>
              <div className='min-w-0 flex-1 pt-0.5'>
                <p className='text-xs text-slate-900'>
                  {e.event_type === 'status_change' ? (
                    <>
                      <span className='font-medium'>Status changed</span> from{' '}
                      <span className='font-mono text-[10px] text-slate-500'>
                        {statusLabel(e.from_value || '')}
                      </span>{' '}
                      to{' '}
                      <span className='font-medium'>
                        {statusLabel(e.to_value || '')}
                      </span>
                    </>
                  ) : e.event_type === 'note_added' ? (
                    <span className='font-medium'>Note added</span>
                  ) : e.event_type === 'preceptor_assigned' ? (
                    <span className='font-medium'>Preceptor assigned</span>
                  ) : e.event_type === 'preceptor_unassigned' ? (
                    <span className='font-medium'>Preceptor removed</span>
                  ) : (
                    <span className='font-medium capitalize'>
                      {e.event_type.replace(/_/g, ' ')}
                    </span>
                  )}
                  {e.actor?.full_name && (
                    <span className='text-slate-500'>
                      {' '}
                      · {e.actor.full_name}
                    </span>
                  )}
                </p>
                {e.note && (
                  <p className='mt-1 text-xs text-slate-600 bg-slate-50 rounded-md px-3 py-2 leading-relaxed'>
                    {e.note}
                  </p>
                )}
                <p className='text-[10px] text-slate-400 mt-1'>
                  {relativeTime(e.created_at)}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/* ============================================================
   Main drawer
   ============================================================ */

export default function ApplicantDrawer({ applicantId, onClose }) {
  const [applicant, setApplicant] = useState(null);
  const [events, setEvents] = useState([]);
  const [assignment, setAssignment] = useState(null);
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!applicantId) return;
    try {
      const [a, e, asn, sups] = await Promise.all([
        fetchApplicant(applicantId),
        fetchEvents(applicantId),
        fetchAssignment(applicantId),
        fetchSupervisors(),
      ]);
      setApplicant(a);
      setEvents(e);
      setAssignment(asn);
      setSupervisors(sups);
      setError(null);
    } catch (err) {
      console.error('[ApplicantDrawer]', err);
      setError(err?.message || 'Could not load applicant.');
    } finally {
      setLoading(false);
    }
  }, [applicantId]);

  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  /* Close on Escape */
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  /* Prevent body scroll */
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <>
      {/* Overlay */}
      <div
        className='fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Drawer */}
      <aside
        role='dialog'
        aria-modal='true'
        aria-label='Applicant details'
        className='fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl
                   flex flex-col animate-[slideInRight_200ms_ease-out]'>
        <style>{`@keyframes slideInRight { from { transform: translateX(20px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>

        {/* Header */}
        <header className='flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 shrink-0'>
          <div className='min-w-0'>
            <p className='text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-1.5'>
              Applicant
            </p>
            {loading || !applicant ? (
              <div className='h-6 w-48 bg-slate-100 rounded animate-pulse' />
            ) : (
              <>
                <h2 className='font-display font-light text-2xl text-slate-900 leading-tight truncate'>
                  {applicant.full_name}
                </h2>
                <div className='flex items-center gap-2 mt-2'>
                  <span className='font-mono text-xs text-slate-500'>
                    {applicant.reference_code}
                  </span>
                  <span className='text-slate-300'>·</span>
                  <StatusBadge status={applicant.status} />
                </div>
              </>
            )}
          </div>
          <button
            type='button'
            onClick={onClose}
            className='w-9 h-9 flex items-center justify-center rounded-lg
                       text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0'
            aria-label='Close'>
            <i className='fas fa-times text-sm' aria-hidden='true' />
          </button>
        </header>

        {/* Body */}
        <div className='flex-1 overflow-y-auto'>
          {error && (
            <div className='m-6 rounded-xl border border-red-200 bg-red-50 p-4'>
              <p className='text-sm text-red-800'>{error}</p>
            </div>
          )}

          {!loading && !applicant && !error && (
            <div className='m-6 text-center py-12'>
              <p className='text-sm text-slate-500'>Applicant not found.</p>
            </div>
          )}

          {loading && (
            <div className='p-6 space-y-4'>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className='h-16 bg-slate-100 rounded-xl animate-pulse'
                />
              ))}
            </div>
          )}

          {!loading && applicant && (
            <>
              {/* Actions — top of body */}
              <StatusPanel applicant={applicant} onUpdated={load} />

              <AssignmentPanel
                applicant={applicant}
                assignment={assignment}
                supervisors={supervisors}
                onUpdated={load}
              />

              {/* Applicant details */}
              <Section title='Applicant details' icon='id-card'>
                <dl className='divide-y divide-slate-100'>
                  <DetailRow label='Email'>
                    <a
                      href={`mailto:${applicant.email}`}
                      className='text-primary hover:underline'>
                      {applicant.email}
                    </a>
                  </DetailRow>
                  <DetailRow label='Phone'>
                    {applicant.phone ? (
                      <a
                        href={`tel:${applicant.phone}`}
                        className='text-primary hover:underline'>
                        {applicant.phone}
                      </a>
                    ) : null}
                  </DetailRow>
                  <DetailRow label='Institution'>
                    {applicant.home_institution}
                  </DetailRow>
                  <DetailRow label='Rotation'>
                    {applicant.rotation_type}
                  </DetailRow>
                  <DetailRow label='Duration'>
                    {applicant.duration_text}
                  </DetailRow>
                  <DetailRow label='Start date'>
                    {formatDate(applicant.start_date)}
                  </DetailRow>
                  <DetailRow label='End date'>
                    {formatDate(applicant.end_date)}
                  </DetailRow>
                  <DetailRow label='Submitted'>
                    {formatDate(applicant.created_at)}
                  </DetailRow>
                </dl>
              </Section>

              {/* Cover letter */}
              {applicant.cover_letter && (
                <Section title='Cover letter' icon='file-lines'>
                  <div className='rounded-xl bg-slate-50 border border-slate-100 p-4'>
                    <p className='text-sm text-slate-700 leading-relaxed whitespace-pre-line'>
                      {applicant.cover_letter}
                    </p>
                  </div>
                </Section>
              )}

              {/* Notes */}
              <NotesPanel applicant={applicant} onUpdated={load} />

              {/* Activity */}
              <ActivityTimeline events={events} />
            </>
          )}
        </div>
      </aside>
    </>
  );
}

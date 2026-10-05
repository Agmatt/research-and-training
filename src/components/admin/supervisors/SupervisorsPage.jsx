import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-react';
import SupervisorRoster from './SupervisorRoster';
import StudentList from './StudentList';
import {
  fetchAllSupervisors,
  fetchAssignmentsForSupervisor,
} from '../../../lib/admin/supervisors';

/* ============================================================
   Admin view — roster + drill-down
   ============================================================ */

function AdminView({ onOpenApplicant }) {
  const [supervisors, setSupervisors] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [students, setStudents] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchAllSupervisors();
        if (!cancelled) setSupervisors(rows);
      } catch (err) {
        console.error('[SupervisorsPage] roster', err);
        if (!cancelled) setError(err?.message || 'Could not load supervisors.');
      } finally {
        if (!cancelled) setLoadingRoster(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadStudents = useCallback(async (supervisorId) => {
    setLoadingStudents(true);
    try {
      const rows = await fetchAssignmentsForSupervisor(supervisorId);
      setStudents(rows);
    } catch (err) {
      console.error('[SupervisorsPage] students', err);
      setStudents([]);
    } finally {
      setLoadingStudents(false);
    }
  }, []);

  function handleSelect(id) {
    if (id === selectedId) {
      setSelectedId(null);
      setStudents([]);
      return;
    }
    setSelectedId(id);
    loadStudents(id);
  }

  const selectedSupervisor = supervisors.find((s) => s.id === selectedId);

  if (loadingRoster) {
    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className='h-40 rounded-2xl bg-white border border-slate-200/80 animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
        <p className='text-sm text-red-800'>{error}</p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Roster grid */}
      <section>
        <div className='flex items-baseline justify-between mb-4'>
          <h2 className='text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500'>
            All supervisors ({supervisors.length})
          </h2>
        </div>
        <SupervisorRoster
          supervisors={supervisors}
          onSelect={handleSelect}
          selectedId={selectedId}
        />
      </section>

      {/* Drill-down: students of the selected supervisor */}
      {selectedId && selectedSupervisor && (
        <section className='pt-6 border-t border-slate-200'>
          <div className='flex items-baseline justify-between mb-4'>
            <div>
              <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-1.5'>
                Assigned to
              </span>
              <h2 className='font-display font-light text-2xl text-slate-900 leading-tight'>
                {selectedSupervisor.full_name}
              </h2>
            </div>
            <button
              type='button'
              onClick={() => {
                setSelectedId(null);
                setStudents([]);
              }}
              className='text-xs text-slate-500 hover:text-slate-900 underline-offset-2 hover:underline'>
              Close
            </button>
          </div>

          {loadingStudents ? (
            <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0'>
                  <div className='w-11 h-11 rounded-full bg-slate-100 animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 w-40 bg-slate-100 rounded animate-pulse' />
                    <div className='h-2.5 w-56 bg-slate-100 rounded animate-pulse' />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <StudentList
              students={students}
              onOpenApplicant={onOpenApplicant}
            />
          )}
        </section>
      )}
    </div>
  );
}

/* ============================================================
   Supervisor view — just their students
   ============================================================ */

function SupervisorView({ supervisorId, onOpenApplicant }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchAssignmentsForSupervisor(supervisorId);
        if (!cancelled) setStudents(rows);
      } catch (err) {
        console.error('[SupervisorView]', err);
        if (!cancelled)
          setError(err?.message || 'Could not load your students.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [supervisorId]);

  if (loading) {
    return (
      <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='flex items-center gap-4 px-6 py-4 border-b border-slate-100 last:border-0'>
            <div className='w-11 h-11 rounded-full bg-slate-100 animate-pulse' />
            <div className='flex-1 space-y-2'>
              <div className='h-3 w-40 bg-slate-100 rounded animate-pulse' />
              <div className='h-2.5 w-56 bg-slate-100 rounded animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
        <p className='text-sm text-red-800'>{error}</p>
      </div>
    );
  }

  return <StudentList students={students} onOpenApplicant={onOpenApplicant} />;
}

/* ============================================================
   Main
   ============================================================ */

export default function SupervisorsPage({ onOpenApplicant }) {
  const { adminUser, loading } = useAuth();

  if (loading) return null;

  const isAdmin = adminUser?.role === 'admin';
  const isSupervisor = adminUser?.role === 'supervisor';

  /* — Admins: full roster + drill-down — */
  if (isAdmin) {
    return (
      <div className='space-y-6'>
        <div>
          <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2'>
            Supervisors
          </span>
          <h1 className='font-display font-light text-3xl text-slate-900 leading-tight'>
            Preceptor roster
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            Every active supervisor and the students assigned to them.
          </p>
        </div>

        <AdminView onOpenApplicant={onOpenApplicant} />
      </div>
    );
  }

  /* — Supervisors: just their own students — */
  if (isSupervisor) {
    return (
      <div className='space-y-6'>
        <div>
          <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2'>
            Your students
          </span>
          <h1 className='font-display font-light text-3xl text-slate-900 leading-tight'>
            Assigned placements
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            Students currently placed under your supervision.
          </p>
        </div>

        <SupervisorView
          supervisorId={adminUser.id}
          onOpenApplicant={onOpenApplicant}
        />
      </div>
    );
  }

  /* — Staff or unknown role — */
  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white py-16 text-center'>
      <div className='w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4'>
        <i className='fas fa-lock text-lg' aria-hidden='true' />
      </div>
      <p className='text-sm font-semibold text-slate-700 mb-1'>
        Access restricted
      </p>
      <p className='text-xs text-slate-500 max-w-xs mx-auto leading-relaxed'>
        The supervisor view is only available to <strong>admin</strong> and{' '}
        <strong>supervisor</strong> roles.
      </p>
    </div>
  );
}

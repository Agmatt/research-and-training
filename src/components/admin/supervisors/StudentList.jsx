import {
  formatDateRange,
  relativeTime,
  initialsOf,
} from '../../../lib/admin/supervisors';

function StatusDot({ status }) {
  const tones = {
    active: 'bg-emerald-500',
    completed: 'bg-slate-400',
    cancelled: 'bg-red-500',
  };
  return (
    <span
      className={`h-1.5 w-1.5 rounded-full ${tones[status] || 'bg-slate-400'}`}
    />
  );
}

export default function StudentList({ students, onOpenApplicant }) {
  if (students.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200/80 bg-white py-16 text-center'>
        <div className='w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4'>
          <i className='fas fa-user-graduate text-lg' aria-hidden='true' />
        </div>
        <p className='text-sm font-semibold text-slate-700 mb-1'>
          No students assigned
        </p>
        <p className='text-xs text-slate-500 max-w-xs mx-auto leading-relaxed'>
          Assigned students will appear here once an administrator creates an
          assignment.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
      <ul className='divide-y divide-slate-100'>
        {students.map((s) => (
          <li key={s.assignment_id}>
            <button
              type='button'
              onClick={() => onOpenApplicant?.(s.application_id)}
              className='group w-full flex items-center gap-4 px-5 sm:px-6 py-4 text-left
                         hover:bg-slate-50/70 transition-colors'>
              <span
                className='w-11 h-11 rounded-full shrink-0 flex items-center justify-center
                           text-xs font-bold ring-2 ring-offset-2 ring-offset-white
                           bg-primary/10 text-primary ring-primary/15 group-hover:ring-primary/30 transition-all'>
                {initialsOf(s.full_name)}
              </span>

              <div className='min-w-0 flex-1'>
                <div className='flex items-center gap-2.5'>
                  <p className='text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors'>
                    {s.full_name}
                  </p>
                  <StatusDot status={s.assignment_status} />
                  <span className='hidden sm:inline text-[10px] uppercase tracking-wider font-semibold text-slate-400'>
                    {s.assignment_status}
                  </span>
                </div>
                <p className='text-xs text-slate-500 truncate mt-0.5'>
                  {s.rotation_type || 'Rotation'} ·{' '}
                  <span className='font-mono'>{s.reference_code}</span>
                  {s.department && (
                    <>
                      <span className='mx-1.5 text-slate-300'>·</span>
                      {s.department}
                    </>
                  )}
                </p>
                <p className='text-xs text-slate-400 truncate mt-0.5'>
                  {formatDateRange(s.start_date, s.end_date)}
                </p>
              </div>

              <div className='hidden sm:flex items-center gap-4 shrink-0'>
                <span className='font-mono text-[10px] text-slate-400 tabular-nums'>
                  {relativeTime(s.assigned_at)}
                </span>
                <i
                  className='fas fa-chevron-right text-[10px] text-slate-300
                             opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                             group-hover:text-primary transition-all'
                  aria-hidden='true'
                />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

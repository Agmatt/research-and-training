import { initialsOf } from '../../../lib/admin/supervisors';

export default function SupervisorRoster({
  supervisors,
  onSelect,
  selectedId,
}) {
  if (supervisors.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200/80 bg-white py-16 text-center'>
        <div className='w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4'>
          <i className='fas fa-user-tie text-lg' aria-hidden='true' />
        </div>
        <p className='text-sm font-semibold text-slate-700 mb-1'>
          No supervisors yet
        </p>
        <p className='text-xs text-slate-500 max-w-xs mx-auto leading-relaxed'>
          Promote admin users to the{' '}
          <code className='font-mono text-[11px] bg-slate-100 px-1 py-0.5 rounded'>
            supervisor
          </code>{' '}
          role to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
      {supervisors.map((s) => {
        const isSelected = s.id === selectedId;
        return (
          <button
            key={s.id}
            type='button'
            onClick={() => onSelect(s.id)}
            className={`group text-left rounded-2xl border bg-white p-5 transition-all duration-300
                        ${
                          isSelected
                            ? 'border-primary/40 ring-2 ring-primary/15 shadow-md'
                            : 'border-slate-200/80 hover:border-primary/30 hover:shadow-lg hover:shadow-slate-900/[0.04] hover:-translate-y-0.5'
                        }`}>
            <div className='flex items-start justify-between mb-4'>
              <span
                className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold
                            ring-2 ring-offset-2 ring-offset-white transition-all
                            ${
                              isSelected
                                ? 'bg-primary text-white ring-primary/40'
                                : 'bg-primary/10 text-primary ring-primary/15 group-hover:ring-primary/30'
                            }`}>
                {initialsOf(s.full_name)}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full
                            ${
                              s.active_assignments > 0
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}>
                {s.active_assignments}{' '}
                {s.active_assignments === 1 ? 'student' : 'students'}
              </span>
            </div>

            <p className='text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors'>
              {s.full_name}
            </p>
            <p className='text-xs text-slate-500 truncate mt-1'>{s.email}</p>

            <div className='mt-4 pt-4 border-t border-slate-100 flex items-center justify-between'>
              <span className='text-[10px] uppercase tracking-wider text-slate-400 font-semibold'>
                {s.role}
              </span>
              <i
                className='fas fa-arrow-right text-[10px] text-slate-300
                           transition-all group-hover:translate-x-0.5 group-hover:text-primary'
                aria-hidden='true'
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

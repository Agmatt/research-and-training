import StatusBadge from '../shared/StatusBadge';
import { relativeTime, formatDateRange } from '../../../lib/admin/applicants';

export default function ApplicantTable({ applicants, onSelect, selectedId }) {
  if (applicants.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200/80 bg-white py-20 text-center'>
        <div className='w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4'>
          <i className='fas fa-inbox text-lg' aria-hidden='true' />
        </div>
        <p className='text-sm font-semibold text-slate-700 mb-1'>
          No applications match
        </p>
        <p className='text-xs text-slate-500 max-w-xs mx-auto leading-relaxed'>
          Try adjusting your filters or clearing the search.
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
      <table className='w-full'>
        <thead>
          <tr className='border-b border-slate-100 bg-slate-50/50'>
            <th className='text-left px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
              Applicant
            </th>
            <th className='hidden md:table-cell text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
              Rotation
            </th>
            <th className='hidden lg:table-cell text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
              Dates
            </th>
            <th className='text-left px-4 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
              Status
            </th>
            <th className='hidden sm:table-cell text-right px-5 py-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500'>
              Submitted
            </th>
          </tr>
        </thead>
        <tbody className='divide-y divide-slate-100'>
          {applicants.map((app) => {
            const isSelected = app.id === selectedId;
            const initials = app.full_name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(0, 2)
              .toUpperCase();
            return (
              <tr
                key={app.id}
                onClick={() => onSelect(app.id)}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'bg-primary/[0.04]' : 'hover:bg-slate-50/70'
                }`}>
                <td className='px-5 py-4'>
                  <div className='flex items-center gap-3 min-w-0'>
                    <span
                      className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-[11px] font-bold ring-2 ring-offset-2 ring-offset-white transition-all ${
                        isSelected
                          ? 'bg-primary text-white ring-primary/30'
                          : 'bg-primary/10 text-primary ring-primary/10'
                      }`}>
                      {initials}
                    </span>
                    <div className='min-w-0'>
                      <p className='text-sm font-semibold text-slate-900 truncate'>
                        {app.full_name}
                      </p>
                      <p className='text-xs text-slate-500 truncate'>
                        <span className='font-mono'>{app.reference_code}</span>
                        <span className='mx-1.5 text-slate-300'>·</span>
                        {app.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className='hidden md:table-cell px-4 py-4'>
                  <p className='text-xs text-slate-700 font-medium'>
                    {app.rotation_type || '—'}
                  </p>
                  <p className='text-[10px] text-slate-400 mt-0.5'>
                    {app.duration_text || 'No duration'}
                  </p>
                </td>

                <td className='hidden lg:table-cell px-4 py-4'>
                  <p className='text-xs text-slate-700 font-mono'>
                    {formatDateRange(app.start_date, app.end_date)}
                  </p>
                </td>

                <td className='px-4 py-4'>
                  <StatusBadge status={app.status} size='xs' />
                </td>

                <td className='hidden sm:table-cell px-5 py-4 text-right'>
                  <span className='text-[11px] text-slate-400 font-mono'>
                    {relativeTime(app.created_at)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

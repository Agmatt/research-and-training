import {
  STATUS_OPTIONS,
  ROTATION_OPTIONS,
  statusLabel,
} from '../../../lib/admin/applicants';

export default function ApplicantFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  rotation,
  onRotationChange,
  sort,
  onSortChange,
  total,
  filtered,
}) {
  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5'>
      <div className='grid grid-cols-1 md:grid-cols-12 gap-3'>
        {/* Search */}
        <div className='md:col-span-5 relative'>
          <label htmlFor='applicant-search' className='sr-only'>
            Search
          </label>
          <i
            className='fas fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400'
            aria-hidden='true'
          />
          <input
            id='applicant-search'
            type='search'
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder='Search name, email, reference code…'
            className='w-full pl-9 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50
                       text-slate-900 placeholder-slate-400
                       focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                       transition-colors'
          />
        </div>

        {/* Status */}
        <div className='md:col-span-3'>
          <label htmlFor='filter-status' className='sr-only'>
            Status
          </label>
          <select
            id='filter-status'
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className='w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50
                       text-slate-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                       transition-colors'>
            <option value=''>All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>

        {/* Rotation */}
        <div className='md:col-span-2'>
          <label htmlFor='filter-rotation' className='sr-only'>
            Rotation
          </label>
          <select
            id='filter-rotation'
            value={rotation}
            onChange={(e) => onRotationChange(e.target.value)}
            className='w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50
                       text-slate-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                       transition-colors'>
            <option value=''>All rotations</option>
            {ROTATION_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className='md:col-span-2'>
          <label htmlFor='filter-sort' className='sr-only'>
            Sort
          </label>
          <select
            id='filter-sort'
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className='w-full px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/50
                       text-slate-900 focus:bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15
                       transition-colors'>
            <option value='newest'>Newest first</option>
            <option value='oldest'>Oldest first</option>
            <option value='name'>Name (A–Z)</option>
          </select>
        </div>
      </div>

      {/* Result count */}
      <div className='mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs'>
        <span className='text-slate-500'>
          Showing <strong className='text-slate-900'>{filtered}</strong> of{' '}
          <strong className='text-slate-900'>{total}</strong>
          {filtered !== total && ' (filtered)'}
        </span>
        {(search || status || rotation) && (
          <button
            type='button'
            onClick={() => {
              onSearchChange('');
              onStatusChange('');
              onRotationChange('');
            }}
            className='text-primary hover:underline font-medium'>
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

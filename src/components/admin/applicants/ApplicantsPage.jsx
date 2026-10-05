import { useEffect, useMemo, useState } from 'react';
import ApplicantFilters from './ApplicantFilters';
import ApplicantTable from './ApplicantTable';
import ApplicantDrawer from './ApplicantDrawer';
import { fetchAllApplicants } from '../../../lib/admin/applicants';

export default function ApplicantsPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [rotation, setRotation] = useState('');
  const [sort, setSort] = useState('newest');

  // Selected applicant for drawer
  const [selectedId, setSelectedId] = useState(null);

  /* ---- Load all applications once ---- */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchAllApplicants();
        if (!cancelled) setAll(rows);
      } catch (err) {
        console.error('[ApplicantsPage]', err);
        if (!cancelled)
          setError(err?.message || 'Could not load applications.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* ---- Handle deep-link ?id=xxx ---- */
  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    if (id) setSelectedId(id);
  }, []);

  /* ---- Open / close drawer, keep URL in sync ---- */
  function openApplicant(id) {
    setSelectedId(id);
    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    window.history.replaceState({}, '', url.toString());
  }
  function closeDrawer() {
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('id');
    window.history.replaceState({}, '', url.toString());
  }

  /* ---- Refetch (called by drawer after updates) ---- */
  async function refresh() {
    try {
      const rows = await fetchAllApplicants();
      setAll(rows);
    } catch (err) {
      console.error('[ApplicantsPage] refresh', err);
    }
  }

  /* ---- Client-side filter + sort ---- */
  const filtered = useMemo(() => {
    let rows = all;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.full_name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.reference_code.toLowerCase().includes(q) ||
          (r.home_institution || '').toLowerCase().includes(q),
      );
    }

    if (status) rows = rows.filter((r) => r.status === status);
    if (rotation) rows = rows.filter((r) => r.rotation_type === rotation);

    const sorted = [...rows];
    if (sort === 'newest') {
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    } else if (sort === 'oldest') {
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    } else if (sort === 'name') {
      sorted.sort((a, b) => a.full_name.localeCompare(b.full_name));
    }
    return sorted;
  }, [all, search, status, rotation, sort]);

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
        <div>
          <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2'>
            Applications
          </span>
          <h1 className='font-display font-light text-3xl text-slate-900 leading-tight'>
            Applicant management
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            Review, verify, and assign preceptors to every incoming application.
          </p>
        </div>
      </div>

      {/* Filters */}
      <ApplicantFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        rotation={rotation}
        onRotationChange={setRotation}
        sort={sort}
        onSortChange={setSort}
        total={all.length}
        filtered={filtered.length}
      />

      {/* Table */}
      {loading ? (
        <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className='flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0'>
              <div className='w-9 h-9 rounded-full bg-slate-100 animate-pulse' />
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
        <ApplicantTable
          applicants={filtered}
          onSelect={openApplicant}
          selectedId={selectedId}
        />
      )}

      {/* Drawer */}
      {selectedId && (
        <ApplicantDrawer applicantId={selectedId} onClose={closeDrawer} />
      )}
    </div>
  );
}

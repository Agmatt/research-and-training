import { useEffect, useMemo, useState } from 'react';
import PartnershipsFilters from './PartnershipsFilters';
import PartnershipsTable from './PartnershipsTable';
import PartnershipDrawer from './PartnershipsDrawer';
import { fetchAllInquiries } from '../../../lib/admin/partnerships';

export default function PartnershipsPage() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [type, setType] = useState('');
  const [sort, setSort] = useState('newest');

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchAllInquiries();
        if (!cancelled) setAll(rows);
      } catch (err) {
        console.error('[PartnershipsPage]', err);
        if (!cancelled) setError(err?.message || 'Could not load inquiries.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const id = url.searchParams.get('id');
    if (id) setSelectedId(id);
  }, []);

  function openInquiry(id) {
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

  async function refresh() {
    try {
      const rows = await fetchAllInquiries();
      setAll(rows);
    } catch (err) {
      console.error('[PartnershipsPage] refresh', err);
    }
  }

  const filtered = useMemo(() => {
    let rows = all;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (r) =>
          r.institution_name.toLowerCase().includes(q) ||
          r.contact_person.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q),
      );
    }

    if (status) rows = rows.filter((r) => r.status === status);
    if (type) rows = rows.filter((r) => r.inquiry_type === type);

    const sorted = [...rows];
    if (sort === 'newest')
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else if (sort === 'oldest')
      sorted.sort((a, b) => a.created_at.localeCompare(b.created_at));
    else if (sort === 'institution')
      sorted.sort((a, b) =>
        a.institution_name.localeCompare(b.institution_name),
      );
    return sorted;
  }, [all, search, status, type, sort]);

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
        <div>
          <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2'>
            Partnerships
          </span>
          <h1 className='font-display font-light text-3xl text-slate-900 leading-tight'>
            Partnership inquiries
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            Track every institutional inquiry from first contact through to
            signed MOU.
          </p>
        </div>
      </div>

      <PartnershipsFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        type={type}
        onTypeChange={setType}
        sort={sort}
        onSortChange={setSort}
        total={all.length}
        filtered={filtered.length}
      />

      {loading ? (
        <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className='flex items-center gap-4 px-5 py-4 border-b border-slate-100 last:border-0'>
              <div className='w-9 h-9 rounded-xl bg-slate-100 animate-pulse' />
              <div className='flex-1 space-y-2'>
                <div className='h-3 w-44 bg-slate-100 rounded animate-pulse' />
                <div className='h-2.5 w-60 bg-slate-100 rounded animate-pulse' />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
          <p className='text-sm text-red-800'>{error}</p>
        </div>
      ) : (
        <PartnershipsTable
          inquiries={filtered}
          onSelect={openInquiry}
          selectedId={selectedId}
        />
      )}

      {selectedId && (
        <PartnershipDrawer inquiryId={selectedId} onClose={closeDrawer} />
      )}
    </div>
  );
}

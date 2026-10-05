import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../lib/auth-react';
import {
  fetchDashboardData,
  statusLabel,
  formatNumber,
  formatDate,
  relativeTime,
  greeting,
} from '../../lib/admin/dashboard';

/* ============================================================
   Status tokens — dot colour + soft badge style
   ============================================================ */
const STATUS = {
  submitted: { dot: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700' },
  under_review: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  verified: { dot: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-700' },
  assigned: { dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  active: { dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  completed: { dot: 'bg-slate-400', chip: 'bg-slate-100 text-slate-600' },
  declined: { dot: 'bg-red-500', chip: 'bg-red-50 text-red-700' },
  withdrawn: { dot: 'bg-slate-300', chip: 'bg-slate-100 text-slate-500' },
  new: { dot: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700' },
  reviewing: { dot: 'bg-amber-500', chip: 'bg-amber-50 text-amber-700' },
  contacted: { dot: 'bg-indigo-500', chip: 'bg-indigo-50 text-indigo-700' },
  in_discussion: { dot: 'bg-violet-500', chip: 'bg-violet-50 text-violet-700' },
  mou_drafted: { dot: 'bg-cyan-500', chip: 'bg-cyan-50 text-cyan-700' },
  signed: { dot: 'bg-emerald-500', chip: 'bg-emerald-50 text-emerald-700' },
  closed: { dot: 'bg-slate-300', chip: 'bg-slate-100 text-slate-500' },
};

function statusToken(status) {
  return STATUS[status] || STATUS.withdrawn;
}

/* ============================================================
   KPI CARD
   ============================================================ */
function KpiCard({
  label,
  value,
  deltaLabel,
  deltaValue,
  deltaTone = 'neutral',
  icon,
  tone = 'primary',
  href,
}) {
  const tones = {
    primary: {
      tile: 'bg-primary/10 text-primary',
      tileHover:
        'group-hover:bg-primary group-hover:text-white group-hover:shadow-primary/30',
      halo: 'from-primary/[0.08]',
    },
    amber: {
      tile: 'bg-amber-100 text-amber-600',
      tileHover:
        'group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-amber-500/30',
      halo: 'from-amber-500/[0.10]',
    },
    emerald: {
      tile: 'bg-emerald-100 text-emerald-600',
      tileHover:
        'group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-500/30',
      halo: 'from-emerald-500/[0.10]',
    },
    slate: {
      tile: 'bg-slate-100 text-slate-600',
      tileHover:
        'group-hover:bg-slate-800 group-hover:text-white group-hover:shadow-slate-800/30',
      halo: 'from-slate-900/[0.06]',
    },
  };
  const t = tones[tone] || tones.primary;

  const deltaTones = {
    positive: 'text-emerald-600',
    warning: 'text-amber-600',
    neutral: 'text-slate-400',
  };

  const Wrapper = href ? 'a' : 'div';

  return (
    <Wrapper
      href={href}
      className={`group relative block rounded-2xl bg-white border border-slate-200/80 overflow-hidden
                  transition-all duration-300
                  ${href ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/[0.06] cursor-pointer' : ''}`}>
      {/* Corner halo */}
      <span
        className={`absolute -top-16 -right-16 w-40 h-40 rounded-full bg-gradient-radial ${t.halo} to-transparent
                    opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
        aria-hidden='true'
      />

      <div className='relative p-6'>
        <div className='flex items-start justify-between mb-7'>
          <span className='text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400'>
            {label}
          </span>
          <span
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                        ${t.tile} ${t.tileHover} group-hover:shadow-lg`}>
            <i className={`fas fa-${icon} text-sm`} aria-hidden='true' />
          </span>
        </div>

        <p className='font-display font-light text-[2.75rem] text-slate-900 leading-none tracking-[-0.02em] tabular-nums'>
          {value}
        </p>

        {deltaValue !== undefined && (
          <div className='mt-4 flex items-center gap-1.5 text-xs'>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${deltaTones[deltaTone]}`}>
              {deltaTone === 'positive' && (
                <i
                  className='fas fa-arrow-trend-up text-[10px]'
                  aria-hidden='true'
                />
              )}
              {deltaTone === 'warning' && (
                <i
                  className='fas fa-circle-exclamation text-[10px]'
                  aria-hidden='true'
                />
              )}
              {deltaValue}
            </span>
            <span className='text-slate-400'>{deltaLabel}</span>
          </div>
        )}

        {deltaValue === undefined && deltaLabel && (
          <p className='mt-4 text-xs text-slate-400'>{deltaLabel}</p>
        )}
      </div>
    </Wrapper>
  );
}

/* ============================================================
   SECTION HEADER
   ============================================================ */
function SectionHeader({ eyebrow, title, action }) {
  return (
    <div className='flex items-end justify-between gap-4 mb-5'>
      <div className='min-w-0'>
        {eyebrow && (
          <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-1.5'>
            {eyebrow}
          </span>
        )}
        <h2 className='font-display font-light text-2xl text-slate-900 leading-tight tracking-tight truncate'>
          {title}
        </h2>
      </div>
      {action && (
        <a
          href={action.href}
          className='shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg
                     text-xs font-semibold text-primary
                     hover:bg-primary/5 transition-colors
                     group'>
          {action.label}
          <i
            className='fas fa-arrow-right text-[10px] transition-transform group-hover:translate-x-0.5'
            aria-hidden='true'
          />
        </a>
      )}
    </div>
  );
}

/* ============================================================
   STATUS BADGE
   ============================================================ */
function StatusBadge({ status, size = 'sm' }) {
  const t = statusToken(status);
  const sizeCls =
    size === 'xs' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeCls} ${t.chip}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${t.dot}`}
        aria-hidden='true'
      />
      {statusLabel(status)}
    </span>
  );
}

/* ============================================================
   RECENT LIST — compact, polished rows
   ============================================================ */
function RecentList({ items, kind, emptyIcon, emptyTitle, emptyDesc }) {
  if (items.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200/80 bg-white py-16 text-center'>
        <div className='w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4'>
          <i className={`fas fa-${emptyIcon} text-lg`} aria-hidden='true' />
        </div>
        <p className='text-sm font-semibold text-slate-700 mb-1'>
          {emptyTitle}
        </p>
        <p className='text-xs text-slate-500 max-w-xs mx-auto leading-relaxed'>
          {emptyDesc}
        </p>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white overflow-hidden'>
      <ul className='divide-y divide-slate-100'>
        {items.map((item) => {
          const isApp = kind === 'application';
          const name = isApp ? item.full_name : item.institution_name;
          const initials = name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          const secondary = isApp
            ? `${item.rotation_type || 'Unspecified'} · ${item.reference_code}`
            : `${item.contact_person}${item.inquiry_type ? ' · ' + item.inquiry_type.replace(/_/g, ' ') : ''}`;
                    const href = isApp
                      ? `/admin/academics/applicants?id=${item.id}`
                      : `/admin/academics/partnerships?id=${item.id}`;

          return (
            <li key={item.id}>
              <a
                href={href}
                className='group flex items-center gap-4 px-5 sm:px-6 py-4 hover:bg-slate-50/70 transition-colors'>
                {/* Avatar with ring */}
                <span
                  className={`relative w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold
                              ring-2 ring-offset-2 ring-offset-white transition-all
                              ${
                                isApp
                                  ? 'bg-primary/10 text-primary ring-primary/15 group-hover:ring-primary/30'
                                  : 'bg-slate-100 text-slate-600 ring-slate-200 group-hover:ring-slate-300'
                              }`}>
                  {isApp ? (
                    initials
                  ) : (
                    <i className='fas fa-building text-xs' aria-hidden='true' />
                  )}
                </span>

                {/* Body */}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-center gap-2.5'>
                    <p className='text-sm font-semibold text-slate-900 truncate group-hover:text-primary transition-colors'>
                      {name}
                    </p>
                    <span className='hidden md:inline-flex'>
                      <StatusBadge status={item.status} size='xs' />
                    </span>
                  </div>
                  <p className='text-xs text-slate-500 truncate mt-1'>
                    {secondary}
                  </p>
                </div>

                {/* Meta */}
                <div className='hidden sm:flex items-center gap-4 shrink-0'>
                  <span className='font-mono text-[10px] text-slate-400 tabular-nums w-12 text-right'>
                    {relativeTime(item.created_at)}
                  </span>
                  <i
                    className='fas fa-chevron-right text-[10px] text-slate-300
                               opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                               group-hover:text-primary transition-all'
                    aria-hidden='true'
                  />
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   PIPELINE — segmented bar + rows
   ============================================================ */
function Pipeline({ counts, total, emptyMessage }) {
  const entries = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .sort(([, a], [, b]) => b - a);

  if (entries.length === 0) {
    return (
      <div className='rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-center'>
        <div className='w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mx-auto mb-4'>
          <i className='fas fa-chart-simple text-lg' aria-hidden='true' />
        </div>
        <p className='text-xs text-slate-400'>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-slate-200/80 bg-white p-6'>
      {/* Segmented bar */}
      <div className='flex h-2 rounded-full overflow-hidden bg-slate-100 mb-6'>
        {entries.map(([status, count]) => {
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <span
              key={status}
              className={`${statusToken(status).dot} transition-all`}
              style={{ width: `${pct}%` }}
              title={`${statusLabel(status)}: ${count}`}
              aria-hidden='true'
            />
          );
        })}
      </div>

      {/* Rows */}
      <ul className='space-y-3.5'>
        {entries.map(([status, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 100) : 0;
          return (
            <li
              key={status}
              className='grid grid-cols-[1fr_auto_auto] items-center gap-3'>
              <span className='flex items-center gap-2.5 min-w-0'>
                <span
                  className={`h-2 w-2 rounded-full shrink-0 ${statusToken(status).dot}`}
                  aria-hidden='true'
                />
                <span className='text-xs font-medium text-slate-700 truncate'>
                  {statusLabel(status)}
                </span>
              </span>
              <span className='font-display font-light text-base text-slate-900 tabular-nums leading-none'>
                {count}
              </span>
              <span className='font-mono text-[10px] text-slate-400 tabular-nums w-9 text-right'>
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ============================================================
   QUICK ACTIONS
   ============================================================ */
const QUICK = [
  {
    label: 'Review applicants',
    href: '/admin/academics/applicants',
    icon: 'users',
    tone: 'primary',
  },
  {
    label: 'Partnership pipeline',
    href: '/admin/academics/partnerships',
    icon: 'handshake',
    tone: 'violet',
  },
  {
    label: 'Supervisor tools',
    href: '/admin/academics/supervisors',
    icon: 'user-tie',
    tone: 'emerald',
  },
  {
    label: 'Settings',
    href: '/admin/academics/settings',
    icon: 'cog',
    tone: 'slate',
  },
];

const QUICK_TONES = {
  primary:
    'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-primary/30',
  violet:
    'bg-violet-100 text-violet-600 group-hover:bg-violet-500 group-hover:text-white group-hover:shadow-violet-500/30',
  emerald:
    'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white group-hover:shadow-emerald-500/30',
  slate:
    'bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white group-hover:shadow-slate-800/30',
};

function QuickActions() {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
      {QUICK.map((a) => (
        <a
          key={a.href}
          href={a.href}
          className='group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4
                     hover:border-slate-300 hover:shadow-lg hover:shadow-slate-900/[0.05]
                     hover:-translate-y-0.5 transition-all duration-300'>
          <span
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0
                        transition-all duration-300 group-hover:shadow-lg
                        ${QUICK_TONES[a.tone]}`}>
            <i className={`fas fa-${a.icon} text-sm`} aria-hidden='true' />
          </span>
          <span className='min-w-0 flex-1 text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors truncate'>
            {a.label}
          </span>
          <i
            className='fas fa-arrow-right text-[10px] text-slate-300
                       opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0
                       group-hover:text-primary transition-all shrink-0'
            aria-hidden='true'
          />
        </a>
      ))}
    </div>
  );
}

/* ============================================================
   SKELETON
   ============================================================ */
function Skeleton() {
  return (
    <div className='space-y-8'>
      <div className='space-y-3'>
        <div className='h-9 w-72 bg-slate-100 rounded animate-pulse' />
        <div className='h-4 w-56 bg-slate-100 rounded animate-pulse' />
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='h-40 rounded-2xl bg-white border border-slate-200/80 animate-pulse'
          />
        ))}
      </div>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <div className='lg:col-span-2 h-72 rounded-2xl bg-white border border-slate-200/80 animate-pulse' />
        <div className='h-72 rounded-2xl bg-white border border-slate-200/80 animate-pulse' />
      </div>
    </div>
  );
}

/* ============================================================
   MAIN
   ============================================================ */
export default function Dashboard() {
  const { adminUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const canSeeSupervisors = adminUser?.role === 'admin';
      const result = await fetchDashboardData(canSeeSupervisors);
      setData(result);
      setError(null);
    } catch (err) {
      console.error('[Dashboard] load failed:', err);
      setError(err?.message || 'Could not load dashboard data.');
    }
  }, [adminUser?.role]);

  useEffect(() => {
    if (!adminUser) return;
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [adminUser, load]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (loading) return <Skeleton />;

  if (error) {
    return (
      <div className='rounded-2xl border border-red-200 bg-red-50 p-6'>
        <div className='flex items-start gap-3'>
          <i
            className='fas fa-triangle-exclamation text-red-600 mt-0.5'
            aria-hidden='true'
          />
          <div>
            <h3 className='text-sm font-semibold text-red-900'>
              Could not load dashboard
            </h3>
            <p className='text-sm text-red-700 mt-1'>{error}</p>
            <button
              type='button'
              onClick={handleRefresh}
              className='mt-4 text-xs font-semibold text-red-800 hover:underline'>
              Try again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const appsPending = data.applications.pending;
  const inqPending = data.inquiries.pending;

  return (
    <div className='space-y-10'>
      {/* ---- Page header ---- */}
      <div className='flex flex-col sm:flex-row sm:items-end justify-between gap-4'>
        <div>
          <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2'>
            Dashboard
          </span>
          <h1 className='font-display font-light text-3xl sm:text-4xl text-slate-900 leading-tight tracking-tight'>
            {greeting(adminUser?.full_name)}
          </h1>
          <p className='mt-2 text-sm text-slate-500'>
            {formatDate(new Date())}
            <span className='mx-2 text-slate-300'>·</span>
            <span className='text-slate-400'>
              Updated {relativeTime(data.fetchedAt)}
            </span>
          </p>
        </div>

        <button
          type='button'
          onClick={handleRefresh}
          disabled={refreshing}
          className='shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl
                     bg-white border border-slate-200 text-sm font-medium text-slate-700
                     hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm
                     transition-all disabled:opacity-50 disabled:cursor-not-allowed'>
          <i
            className={`fas fa-rotate-right text-xs ${refreshing ? 'animate-spin' : ''}`}
            aria-hidden='true'
          />
          {refreshing ? 'Refreshing' : 'Refresh'}
        </button>
      </div>

      {/* ---- KPI row ---- */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <KpiCard
          label='Applications'
          value={formatNumber(data.applications.total)}
          deltaValue={
            data.applications.thisMonth > 0
              ? `+${data.applications.thisMonth}`
              : '0'
          }
          deltaLabel='this month'
          deltaTone={data.applications.thisMonth > 0 ? 'positive' : 'neutral'}
          icon='user-graduate'
          tone='primary'
          href='/admin/academics/applicants'
        />
        <KpiCard
          label='Pending review'
          value={formatNumber(appsPending)}
          deltaValue={appsPending === 0 ? 'Clear' : `${appsPending} to action`}
          deltaLabel={appsPending === 0 ? '' : ''}
          deltaTone={appsPending === 0 ? 'positive' : 'warning'}
          icon='hourglass-half'
          tone={appsPending > 0 ? 'amber' : 'emerald'}
          href='/admin/academics/applicants'
        />
        <KpiCard
          label='Inquiries'
          value={formatNumber(data.inquiries.total)}
          deltaValue={inqPending === 0 ? 'Clear' : `${inqPending} open`}
          deltaLabel={inqPending === 0 ? '' : ''}
          deltaTone={inqPending === 0 ? 'positive' : 'warning'}
          icon='handshake'
          tone={inqPending > 0 ? 'amber' : 'slate'}
          href='/admin/academics/partnerships'
        />
        <KpiCard
          label='Supervisors'
          value={formatNumber(data.supervisors.active)}
          deltaLabel='Active preceptors'
          icon='user-tie'
          tone='emerald'
          href='/admin/academics/supervisors'
        />
      </div>

      {/* ---- Applications section ---- */}
      <section>
        <SectionHeader
          eyebrow='Applications'
          title='Recent submissions'
          action={{ label: 'View all', href: '/admin/academics/applicants' }}
        />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
          <div className='lg:col-span-2'>
            <RecentList
              items={data.applications.recent}
              kind='application'
              emptyIcon='inbox'
              emptyTitle='No applications yet'
              emptyDesc='Submissions from the public form will appear here.'
            />
          </div>
          <div>
            <Pipeline
              counts={data.applications.byStatus}
              total={data.applications.total}
              emptyMessage='Nothing to chart yet.'
            />
          </div>
        </div>
      </section>

      {/* ---- Inquiries section ---- */}
      <section>
        <SectionHeader
          eyebrow='Partnerships'
          title='Recent inquiries'
          action={{ label: 'View all', href: '/admin/academics/partnerships' }}
        />
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
          <div className='lg:col-span-2'>
            <RecentList
              items={data.inquiries.recent}
              kind='inquiry'
              emptyIcon='handshake'
              emptyTitle='No inquiries yet'
              emptyDesc='Institutional submissions will appear here.'
            />
          </div>
          <div>
            <Pipeline
              counts={data.inquiries.byStatus}
              total={data.inquiries.total}
              emptyMessage='Nothing to chart yet.'
            />
          </div>
        </div>
      </section>

      {/* ---- Quick actions ---- */}
      <section>
        <SectionHeader eyebrow='Shortcuts' title='Quick actions' />
        <QuickActions />
      </section>
    </div>
  );
}

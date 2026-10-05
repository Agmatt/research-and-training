import { getSupabase } from '../supabase';

/* ============================================================
   Types
   ============================================================ */

export interface ApplicationSummary {
  id: string;
  full_name: string;
  email: string;
  reference_code: string;
  status: string;
  rotation_type: string | null;
  created_at: string;
}

export interface InquirySummary {
  id: string;
  institution_name: string;
  contact_person: string;
  email: string;
  status: string;
  inquiry_type: string | null;
  created_at: string;
}

export interface DashboardData {
  applications: {
    total: number;
    thisMonth: number;
    pending: number;
    byStatus: Record<string, number>;
    recent: ApplicationSummary[];
  };
  inquiries: {
    total: number;
    thisMonth: number;
    pending: number;
    byStatus: Record<string, number>;
    recent: InquirySummary[];
  };
  supervisors: {
    active: number;
  };
  fetchedAt: string;
}

/* ============================================================
   Status metadata — labels, ordering, colour intent
   ============================================================ */

export const APPLICATION_STATUS_ORDER = [
  'submitted',
  'under_review',
  'verified',
  'assigned',
  'active',
  'completed',
  'declined',
  'withdrawn',
] as const;

export const INQUIRY_STATUS_ORDER = [
  'new',
  'reviewing',
  'contacted',
  'in_discussion',
  'mou_drafted',
  'signed',
  'declined',
  'closed',
] as const;

export const APPLICATION_PENDING_STATUSES = ['submitted', 'under_review'];
export const INQUIRY_PENDING_STATUSES = ['new', 'reviewing'];

/** Human label for a status string. */
export function statusLabel(status: string): string {
  return status
    .split('_')
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(' ');
}

/* ============================================================
   Fetching
   ============================================================ */

function startOfMonth(): Date {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function countBy<T extends { status: string }>(rows: T[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const row of rows) {
    out[row.status] = (out[row.status] || 0) + 1;
  }
  return out;
}

export async function fetchDashboardData(
  includeSupervisors: boolean,
): Promise<DashboardData> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const monthStart = startOfMonth().toISOString();

  const [appsRes, inqRes, supRes] = await Promise.all([
    supabase
      .from('internship_applications')
      .select('id, full_name, email, reference_code, status, rotation_type, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('partnership_inquiries')
      .select('id, institution_name, contact_person, email, status, inquiry_type, created_at')
      .order('created_at', { ascending: false }),
    includeSupervisors
      ? supabase
          .from('admin_users')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'supervisor')
          .eq('is_active', true)
      : Promise.resolve({ count: 0, data: null, error: null }),
  ]);

  if (appsRes.error) throw appsRes.error;
  if (inqRes.error) throw inqRes.error;

  const apps = (appsRes.data || []) as ApplicationSummary[];
  const inquiries = (inqRes.data || []) as InquirySummary[];

  const appsThisMonth = apps.filter((a) => a.created_at >= monthStart).length;
  const inqThisMonth = inquiries.filter((i) => i.created_at >= monthStart).length;

  const appsByStatus = countBy(apps);
  const inqByStatus = countBy(inquiries);

  const appsPending = APPLICATION_PENDING_STATUSES.reduce(
    (sum, s) => sum + (appsByStatus[s] || 0),
    0,
  );
  const inqPending = INQUIRY_PENDING_STATUSES.reduce(
    (sum, s) => sum + (inqByStatus[s] || 0),
    0,
  );

  return {
    applications: {
      total: apps.length,
      thisMonth: appsThisMonth,
      pending: appsPending,
      byStatus: appsByStatus,
      recent: apps.slice(0, 5),
    },
    inquiries: {
      total: inquiries.length,
      thisMonth: inqThisMonth,
      pending: inqPending,
      byStatus: inqByStatus,
      recent: inquiries.slice(0, 5),
    },
    supervisors: {
      active: supRes.count ?? 0,
    },
    fetchedAt: new Date().toISOString(),
  };
}

/* ============================================================
   Formatting helpers
   ============================================================ */

const NUM_FMT = new Intl.NumberFormat('en-KE');

export function formatNumber(n: number): string {
  return NUM_FMT.format(n);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
  });
}

export function greeting(name: string | undefined | null): string {
  const hour = new Date().getHours();
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  const firstName = (name || '').split(' ')[0] || 'there';
  return `Good ${timeOfDay}, ${firstName}`;
}
import { getSupabase } from '../supabase';

/* ============================================================
   Types
   ============================================================ */

export interface SupervisorProfile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  active_assignments: number;
}

export interface AssignedStudent {
  assignment_id: string;
  department: string | null;
  start_date: string | null;
  end_date: string | null;
  assignment_status: string;
  assigned_at: string;
  /* Applicant fields */
  application_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  home_institution: string | null;
  rotation_type: string | null;
  duration_text: string | null;
  application_status: string;
  reference_code: string;
}

/* ============================================================
   Fetchers
   ============================================================ */

/** Admin view — list all supervisors with a count of active assignments. */
export async function fetchAllSupervisors(): Promise<SupervisorProfile[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // Fetch supervisors
  const { data: supervisors, error: supError } = await supabase
    .from('admin_users')
    .select('id, full_name, email, role, is_active, last_login_at, created_at')
    .eq('is_active', true)
    .eq('role', 'supervisor')
    .order('full_name');

  if (supError) throw supError;
  if (!supervisors) return [];

  // Fetch assignment counts for those supervisors
  const ids = supervisors.map((s) => s.id);
  if (ids.length === 0) {
    return supervisors.map((s) => ({ ...s, active_assignments: 0 }));
  }

  const { data: assignments, error: asnError } = await supabase
    .from('assignments')
    .select('supervisor_id')
    .in('supervisor_id', ids)
    .eq('status', 'active');

  if (asnError) throw asnError;

  const counts = new Map<string, number>();
  for (const a of assignments || []) {
    counts.set(a.supervisor_id, (counts.get(a.supervisor_id) || 0) + 1);
  }

  return supervisors.map((s) => ({
    ...s,
    active_assignments: counts.get(s.id) || 0,
  }));
}

/** Supervisor-specific: fetch the current user's assignments with applicant details. */
export async function fetchMyStudents(supervisorId: string): Promise<AssignedStudent[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      id,
      department,
      start_date,
      end_date,
      status,
      created_at,
      application:internship_applications(
        id, full_name, email, phone, home_institution,
        rotation_type, duration_text, status, reference_code
      )
    `)
    .eq('supervisor_id', supervisorId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || [])
    .filter((row: any) => row.application)
    .map((row: any) => ({
      assignment_id: row.id,
      department: row.department,
      start_date: row.start_date,
      end_date: row.end_date,
      assignment_status: row.status,
      assigned_at: row.created_at,
      application_id: row.application.id,
      full_name: row.application.full_name,
      email: row.application.email,
      phone: row.application.phone,
      home_institution: row.application.home_institution,
      rotation_type: row.application.rotation_type,
      duration_text: row.application.duration_text,
      application_status: row.application.status,
      reference_code: row.application.reference_code,
    }));
}

/** Admin view — fetch assignments for any supervisor. */
export async function fetchAssignmentsForSupervisor(
  supervisorId: string,
): Promise<AssignedStudent[]> {
  return fetchMyStudents(supervisorId);
}

/* ============================================================
   Helpers
   ============================================================ */

export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  if (d < 30) return `${Math.floor(d / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return 'Not set';
  if (start && !end) return `${formatDate(start)} –`;
  if (!start && end) return `– ${formatDate(end)}`;
  return `${formatDate(start)} – ${formatDate(end)}`;
}

export function initialsOf(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}
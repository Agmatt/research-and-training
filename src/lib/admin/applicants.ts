import { getSupabase } from '../supabase';

/* ============================================================
   Types
   ============================================================ */

export interface Applicant {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  home_institution: string | null;
  rotation_type: string | null;
  duration_text: string | null;
  start_date: string | null;
  end_date: string | null;
  cover_letter: string | null;
  reference_code: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationEvent {
  id: string;
  application_id: string;
  actor_id: string | null;
  event_type: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  created_at: string;
  actor?: { full_name: string; email: string } | null;
}

export interface Assignment {
  id: string;
  application_id: string;
  supervisor_id: string;
  department: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  created_at: string;
  supervisor?: { full_name: string; email: string } | null;
}

export interface Supervisor {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const STATUS_OPTIONS = [
  'submitted',
  'under_review',
  'verified',
  'assigned',
  'active',
  'completed',
  'declined',
  'withdrawn',
] as const;

export const ROTATION_OPTIONS = [
  'Nursing',
  'Medical Laboratory',
  'Pharmacy',
  'Clinical Medicine',
  'Outpatient / Community',
  'Other',
] as const;

/* ============================================================
   Fetchers
   ============================================================ */

export async function fetchAllApplicants(): Promise<Applicant[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('internship_applications')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Applicant[];
}

export async function fetchApplicant(id: string): Promise<Applicant | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('internship_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Applicant | null;
}

export async function fetchEvents(applicationId: string): Promise<ApplicationEvent[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // Fetch events + join actor's name in one query
  const { data, error } = await supabase
    .from('application_events')
    .select(`
      *,
      actor:admin_users(full_name, email)
    `)
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as ApplicationEvent[];
}

export async function fetchAssignment(applicationId: string): Promise<Assignment | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('assignments')
    .select(`
      *,
      supervisor:admin_users(full_name, email)
    `)
    .eq('application_id', applicationId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data as Assignment | null;
}

export async function fetchSupervisors(): Promise<Supervisor[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, full_name, email, role')
    .eq('is_active', true)
    .in('role', ['supervisor', 'admin'])
    .order('full_name');

  if (error) throw error;
  return (data || []) as Supervisor[];
}

/* ============================================================
   Mutators
   ============================================================ */

export async function updateApplicantStatus(
  applicationId: string,
  newStatus: string,
  currentStatus: string,
  actorId: string,
  note?: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error: updateErr } = await supabase
    .from('internship_applications')
    .update({ status: newStatus })
    .eq('id', applicationId);

  if (updateErr) throw updateErr;

  const { error: eventErr } = await supabase
    .from('application_events')
    .insert([{
      application_id: applicationId,
      actor_id: actorId,
      event_type: 'status_change',
      from_value: currentStatus,
      to_value: newStatus,
      note: note || null,
    }]);

  if (eventErr) throw eventErr;
}

export async function addNote(
  applicationId: string,
  actorId: string,
  note: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('application_events')
    .insert([{
      application_id: applicationId,
      actor_id: actorId,
      event_type: 'note_added',
      note,
    }]);

  if (error) throw error;
}

export async function assignPreceptor(
  applicationId: string,
  supervisorId: string,
  actorId: string,
  department?: string,
  startDate?: string,
  endDate?: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error: assignErr } = await supabase
    .from('assignments')
    .insert([{
      application_id: applicationId,
      supervisor_id: supervisorId,
      department: department || null,
      start_date: startDate || null,
      end_date: endDate || null,
      status: 'active',
    }]);

  if (assignErr) throw assignErr;

  const { error: eventErr } = await supabase
    .from('application_events')
    .insert([{
      application_id: applicationId,
      actor_id: actorId,
      event_type: 'preceptor_assigned',
      to_value: supervisorId,
    }]);

  if (eventErr) throw eventErr;
}

export async function unassignPreceptor(
  assignmentId: string,
  applicationId: string,
  actorId: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error: updateErr } = await supabase
    .from('assignments')
    .update({ status: 'cancelled' })
    .eq('id', assignmentId);

  if (updateErr) throw updateErr;

  const { error: eventErr } = await supabase
    .from('application_events')
    .insert([{
      application_id: applicationId,
      actor_id: actorId,
      event_type: 'preceptor_unassigned',
    }]);

  if (eventErr) throw eventErr;
}

/* ============================================================
   Helpers
   ============================================================ */

export function statusLabel(s: string): string {
  return s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

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
  if (!start && !end) return '—';
  if (start && !end) return formatDate(start);
  if (!start && end) return formatDate(end);
  const s = new Date(start!);
  const e = new Date(end!);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sFmt = s.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
  const eFmt = e.toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `${sFmt} – ${eFmt}`;
}
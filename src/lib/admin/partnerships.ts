import { getSupabase } from '../supabase';

/* ============================================================
   Types
   ============================================================ */

export interface Inquiry {
  id: string;
  institution_name: string;
  contact_person: string;
  email: string;
  location_type: string | null;
  inquiry_type: string | null;
  message: string | null;
  status: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PartnershipEvent {
  id: string;
  inquiry_id: string;
  actor_id: string | null;
  event_type: string;
  from_value: string | null;
  to_value: string | null;
  note: string | null;
  created_at: string;
  actor?: { full_name: string; email: string } | null;
}

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

export const INQUIRY_STATUS_OPTIONS = [
  'new',
  'reviewing',
  'contacted',
  'in_discussion',
  'mou_drafted',
  'signed',
  'declined',
  'closed',
] as const;

export const LOCATION_TYPE_OPTIONS = [
  { value: 'local', label: 'Local (Kenya)' },
  { value: 'regional', label: 'Regional (East Africa)' },
  { value: 'international', label: 'International' },
] as const;

export const INQUIRY_TYPE_OPTIONS = [
  { value: 'student_attachment', label: 'Student Attachment Pipeline' },
  { value: 'research', label: 'Research Collaboration' },
  { value: 'faculty_exchange', label: 'Faculty Exchange' },
  { value: 'cme', label: 'CME / Training Collaboration' },
  { value: 'mou', label: 'Formal MOU' },
  { value: 'other', label: 'Other' },
] as const;

/* ============================================================
   Fetchers
   ============================================================ */

export async function fetchAllInquiries(): Promise<Inquiry[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('partnership_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as Inquiry[];
}

export async function fetchInquiry(id: string): Promise<Inquiry | null> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('partnership_inquiries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Inquiry | null;
}

export async function fetchPartnershipEvents(inquiryId: string): Promise<PartnershipEvent[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('partnership_events')
    .select(`
      *,
      actor:admin_users(full_name, email)
    `)
    .eq('inquiry_id', inquiryId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data || []) as PartnershipEvent[];
}

export async function fetchAdminUsers(): Promise<AdminUser[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('admin_users')
    .select('id, full_name, email, role')
    .eq('is_active', true)
    .order('full_name');

  if (error) throw error;
  return (data || []) as AdminUser[];
}

/* ============================================================
   Mutators
   ============================================================ */

export async function updateInquiryStatus(
  inquiryId: string,
  newStatus: string,
  currentStatus: string,
  actorId: string,
  note?: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error: updateErr } = await supabase
    .from('partnership_inquiries')
    .update({ status: newStatus })
    .eq('id', inquiryId);

  if (updateErr) throw updateErr;

  const { error: eventErr } = await supabase
    .from('partnership_events')
    .insert([{
      inquiry_id: inquiryId,
      actor_id: actorId,
      event_type: 'status_change',
      from_value: currentStatus,
      to_value: newStatus,
      note: note || null,
    }]);

  if (eventErr) throw eventErr;
}

export async function addPartnershipNote(
  inquiryId: string,
  actorId: string,
  note: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('partnership_events')
    .insert([{
      inquiry_id: inquiryId,
      actor_id: actorId,
      event_type: 'note_added',
      note,
    }]);

  if (error) throw error;
}

export async function assignOwner(
  inquiryId: string,
  ownerId: string,
  actorId: string,
  previousOwnerId: string | null,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error: updateErr } = await supabase
    .from('partnership_inquiries')
    .update({ owner_id: ownerId })
    .eq('id', inquiryId);

  if (updateErr) throw updateErr;

  const { error: eventErr } = await supabase
    .from('partnership_events')
    .insert([{
      inquiry_id: inquiryId,
      actor_id: actorId,
      event_type: 'owner_assigned',
      from_value: previousOwnerId,
      to_value: ownerId,
    }]);

  if (eventErr) throw eventErr;
}

export async function unassignOwner(
  inquiryId: string,
  actorId: string,
  previousOwnerId: string,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error: updateErr } = await supabase
    .from('partnership_inquiries')
    .update({ owner_id: null })
    .eq('id', inquiryId);

  if (updateErr) throw updateErr;

  const { error: eventErr } = await supabase
    .from('partnership_events')
    .insert([{
      inquiry_id: inquiryId,
      actor_id: actorId,
      event_type: 'owner_unassigned',
      from_value: previousOwnerId,
    }]);

  if (eventErr) throw eventErr;
}

/* ============================================================
   Helpers
   ============================================================ */

export function statusLabel(s: string): string {
  return s.split('_').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export function locationLabel(v: string | null): string {
  return LOCATION_TYPE_OPTIONS.find((o) => o.value === v)?.label || '—';
}

export function inquiryTypeLabel(v: string | null): string {
  return INQUIRY_TYPE_OPTIONS.find((o) => o.value === v)?.label || '—';
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
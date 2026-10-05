import { getSupabase } from '../supabase';

/* ============================================================
   Types
   ============================================================ */

export interface TeamMember {
  id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'staff';
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export const ROLE_OPTIONS = [
  { value: 'admin',      label: 'Administrator', description: 'Full access — manages applicants, partnerships, team, and settings.' },
  { value: 'supervisor', label: 'Supervisor',    description: 'Sees only their assigned students and placements.' },
  { value: 'staff',      label: 'Staff',         description: 'Read-only access to applications and inquiries.' },
] as const;

/* ============================================================
   Fetchers
   ============================================================ */

export async function fetchTeam(): Promise<TeamMember[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('full_name');

  if (error) throw error;
  return (data || []) as TeamMember[];
}

/* ============================================================
   Mutators
   ============================================================ */

export async function updateProfile(
  userId: string,
  updates: { full_name?: string },
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('admin_users')
    .update(updates)
    .eq('id', userId);

  if (error) throw error;
}

export async function changePassword(newPassword: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function updateMemberRole(
  userId: string,
  newRole: 'admin' | 'supervisor' | 'staff',
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('admin_users')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
}

export async function setMemberActive(
  userId: string,
  isActive: boolean,
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('admin_users')
    .update({ is_active: isActive })
    .eq('id', userId);

  if (error) throw error;
}

/* ============================================================
   Create team member — calls the server endpoint
   ============================================================ */

export interface CreateMemberPayload {
  mode: 'invite' | 'password';
  email: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'staff';
  password?: string;
}

export async function createTeamMember(payload: CreateMemberPayload): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated.');

  const res = await fetch('/api/admin/create-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Request failed (${res.status}).`);
  }
}

/* ============================================================
   Helpers — these are what SettingsPage/ProfileTab/TeamTab import
   ============================================================ */

export function roleLabel(role: string): string {
  return ROLE_OPTIONS.find((r) => r.value === role)?.label || role;
}

export function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never';
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
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export function initialsOf(name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

/** Password strength — returns null if acceptable, error message if not. */
export function validatePassword(pw: string): string | null {
  if (!pw) return 'Password is required.';
  if (pw.length < 8) return 'Password must be at least 8 characters.';
  if (!/[A-Z]/.test(pw)) return 'Password must contain an uppercase letter.';
  if (!/[a-z]/.test(pw)) return 'Password must contain a lowercase letter.';
  if (!/[0-9]/.test(pw)) return 'Password must contain a number.';
  return null;
}
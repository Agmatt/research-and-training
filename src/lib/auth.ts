import { getSupabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

export type AdminRole = 'admin' | 'supervisor' | 'staff';

export interface AdminUser {
  id: string;
  email: string;
  full_name: string;
  role: AdminRole;
  is_active: boolean;
}

export async function getSession(): Promise<Session | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function getUser(): Promise<User | null> {
  const session = await getSession();
  return session?.user ?? null;
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithMagicLink(email: string, redirectTo?: string) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const target = redirectTo
    ?? (typeof window !== 'undefined' ? `${window.location.origin}/admin/academics/dashboard` : undefined);
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: target },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function fetchAdminUser(userId: string): Promise<AdminUser | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('admin_users')
    .select('id, email, full_name, role, is_active')
    .eq('id', userId)
    .maybeSingle();
  if (error) {
    console.error('[auth] fetchAdminUser failed:', error.message);
    return null;
  }
  return data as AdminUser | null;
}
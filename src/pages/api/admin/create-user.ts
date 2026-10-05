/**
 * POST /api/admin/create-user
 * Creates a Supabase Auth user and provisions them in admin_users.
 *
 * Security:
 *   - Requires a valid session (JWT in Authorization header).
 *   - Caller must be an active 'admin' in admin_users.
 *   - Uses the service role key ONLY server-side.
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const VALID_ROLES = ['admin', 'supervisor', 'staff'] as const;

export const POST: APIRoute = async ({ request }) => {
  /* ---- Env ---- */
  const url = import.meta.env.PUBLIC_SUPABASE_ACADEMICS_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ACADEMICS_KEY;
  const serviceKey = import.meta.env.SUPABASE_ACADEMICS_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    console.error('[create-user] missing Supabase env vars');
    return json({ error: 'Server not configured.' }, 500);
  }

  /* ---- Authenticate caller ---- */
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Missing authorization.' }, 401);

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json({ error: 'Invalid session.' }, 401);
  }

  /* ---- Authorize: caller must be an active admin ---- */
  const adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: adminRow } = await adminClient
    .from('admin_users')
    .select('role, is_active')
    .eq('id', userData.user.id)
    .maybeSingle();

  if (!adminRow || !adminRow.is_active || adminRow.role !== 'admin') {
    return json({ error: 'Only administrators can add team members.' }, 403);
  }

  /* ---- Parse payload ---- */
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const mode: 'invite' | 'password' = body.mode === 'password' ? 'password' : 'invite';
  const email = String(body.email || '').trim().toLowerCase();
  const fullName = String(body.full_name || '').trim();
  const role = String(body.role || '').trim();
  const password = typeof body.password === 'string' ? body.password : '';

  /* ---- Validate ---- */
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return json({ error: 'A valid email is required.' }, 400);
  }
  if (fullName.length < 2) {
    return json({ error: 'Full name is required.' }, 400);
  }
  if (!VALID_ROLES.includes(role as any)) {
    return json({ error: 'Invalid role.' }, 400);
  }
  if (mode === 'password') {
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return json({ error: 'Password must be 8+ chars with upper, lower, and number.' }, 400);
    }
  }

  /* ---- Prevent duplicate ---- */
  const { data: existing } = await adminClient
    .from('admin_users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    return json({ error: 'A team member with this email already exists.' }, 409);
  }

  /* ---- Create the auth user ---- */
  let newUser: { id: string; email?: string } | null = null;

  if (mode === 'invite') {
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: { full_name: fullName },
      redirectTo: `${new URL(request.url).origin}/admin/login`,
    });
    if (error) return json({ error: error.message }, 400);
    newUser = data.user;
  } else {
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });
    if (error) return json({ error: error.message }, 400);
    newUser = data.user;
  }

  if (!newUser?.id) {
    return json({ error: 'Failed to create user.' }, 500);
  }

  /* ---- Provision in admin_users ---- */
  const { error: insertErr } = await adminClient
    .from('admin_users')
    .insert([{
      id: newUser.id,
      email,
      full_name: fullName,
      role,
      is_active: true,
    }]);

  if (insertErr) {
    // Roll back the auth user so we don't leave orphans
    await adminClient.auth.admin.deleteUser(newUser.id);
    console.error('[create-user] insert failed, rolled back auth user:', insertErr.message);
    return json({ error: insertErr.message }, 400);
  }

  return json({
    ok: true,
    user: { id: newUser.id, email, role },
  });
};
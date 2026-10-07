/**
 * POST /api/admin/mark-password-set
 * Called from /admin/set-password after the user sets their password.
 * Uses the service role to write password_set = true on the caller's row.
 */
import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

export const POST: APIRoute = async ({ request }) => {
  const url = import.meta.env.PUBLIC_SUPABASE_ACADEMICS_URL;
  const anonKey = import.meta.env.PUBLIC_SUPABASE_ACADEMICS_KEY;
  const serviceKey = import.meta.env.SUPABASE_ACADEMICS_SERVICE_ROLE_KEY;

  if (!url || !anonKey || !serviceKey) {
    return json({ error: 'Server not configured.' }, 500);
  }

  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Missing authorization.' }, 401);

  /* Identify the caller */
  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json({ error: 'Invalid session.' }, 401);
  }

  /* Flip the flag using the service role */
  const adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { error: updateErr } = await adminClient
    .from('admin_users')
    .update({ password_set: true })
    .eq('id', userData.user.id);

  if (updateErr) {
    console.error('[mark-password-set]', updateErr.message);
    return json({ error: updateErr.message }, 400);
  }

  return json({ ok: true });
};
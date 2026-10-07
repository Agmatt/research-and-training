/**
 * POST /api/admin/delete-user
 * Deletes a Supabase Auth user, which cascades to admin_users.
 *
 * Safety:
 *   - Caller must be an active admin.
 *   - Cannot delete self.
 *   - Cannot delete the last remaining active admin.
 *   - Cannot delete a user with active assignments (reassign first).
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

  /* ---- Auth ---- */
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return json({ error: 'Missing authorization.' }, 401);

  const userClient = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser(token);
  if (userErr || !userData?.user) {
    return json({ error: 'Invalid session.' }, 401);
  }
  const callerId = userData.user.id;

  /* ---- Caller must be an active admin ---- */
  const adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerRow } = await adminClient
    .from('admin_users')
    .select('role, is_active')
    .eq('id', callerId)
    .maybeSingle();

  if (!callerRow || !callerRow.is_active || callerRow.role !== 'admin') {
    return json({ error: 'Only administrators can delete team members.' }, 403);
  }

  /* ---- Parse body ---- */
  let body: any;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400);
  }

  const targetId = String(body.user_id || '').trim();
  if (!targetId) return json({ error: 'Missing user_id.' }, 400);

  /* ---- Guards ---- */
  if (targetId === callerId) {
    return json({ error: 'You cannot delete your own account.' }, 400);
  }

  const { data: targetRow } = await adminClient
    .from('admin_users')
    .select('id, email, role, is_active')
    .eq('id', targetId)
    .maybeSingle();

  if (!targetRow) {
    return json({ error: 'User not found.' }, 404);
  }

  /* Cannot remove the last remaining active admin */
  if (targetRow.role === 'admin' && targetRow.is_active) {
    const { count } = await adminClient
      .from('admin_users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')
      .eq('is_active', true);

    if ((count ?? 0) <= 1) {
      return json(
        { error: 'This is the last active administrator. Promote another user first.' },
        400,
      );
    }
  }

  /* Cannot delete a supervisor with active assignments */
  const { count: activeAssignments } = await adminClient
    .from('assignments')
    .select('*', { count: 'exact', head: true })
    .eq('supervisor_id', targetId)
    .eq('status', 'active');

  if ((activeAssignments ?? 0) > 0) {
    return json(
      {
        error:
          `This user has ${activeAssignments} active assignment${
            activeAssignments === 1 ? '' : 's'
          }. Reassign or remove their students first.`,
      },
      400,
    );
  }

  /* ---- Delete ---- */
  // Deleting the auth user cascades to admin_users (FK: on delete cascade).
  // Events/assignments reference admin_users with ON DELETE SET NULL / RESTRICT,
  // so audit history is preserved where possible.
  const { error: delErr } = await adminClient.auth.admin.deleteUser(targetId);
  if (delErr) {
    console.error('[delete-user]', delErr.message);
    return json({ error: delErr.message }, 400);
  }

  return json({ ok: true, deleted: targetRow.email });
};
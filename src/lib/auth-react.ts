import { useEffect, useState } from 'react';
import { getSupabase } from './supabase';
import { fetchAdminUser, type AdminUser } from './auth';
import type { Session } from '@supabase/supabase-js';

export interface AuthState {
  session: Session | null;
  adminUser: AdminUser | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [session, setSession] = useState<Session | null>(null);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function hydrate(s: Session | null, isInitial: boolean) {
      if (cancelled) return;
      setSession(s);

      if (s?.user) {
        const au = await fetchAdminUser(s.user.id);
        if (!cancelled) setAdminUser(au);
      } else {
        setAdminUser(null);
      }

      // Only clear loading after the initial `getSession()` resolves.
      if (!cancelled && isInitial) setLoading(false);
    }

    // 1. Source of truth for the first render: read persisted session from storage.
    supabase.auth.getSession().then(({ data }) => {
      hydrate(data.session, true);
    });

    // 2. Subscribe for subsequent auth changes — but ignore INITIAL_SESSION,
    //    which can fire with a stale `null` before storage is read.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === 'INITIAL_SESSION') return;
      hydrate(s, false);
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, adminUser, loading };
}
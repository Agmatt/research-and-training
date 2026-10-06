import { useEffect, useState } from 'react';
import { getSupabase } from '../../../lib/supabase';

/**
 * ConfirmPage — handles token_hash-based email confirmation.
 * Reads ?token_hash=…&type=…&next=… from the URL, verifies with Supabase,
 * then redirects to `next` (or /admin/academics/dashboard by default).
 */
export default function ConfirmPage() {
  const [state, setState] = useState('loading'); // 'loading' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [next, setNext] = useState('/admin/academics/dashboard');

  useEffect(() => {
    (async () => {
      const url = new URL(window.location.href);
      const tokenHash = url.searchParams.get('token_hash');
      const type = url.searchParams.get('type');
      const nextParam =
        url.searchParams.get('next') || '/admin/academics/dashboard';

      setNext(nextParam);

      if (!tokenHash || !type) {
        setState('error');
        setMessage(
          'This link is missing required parameters. Please open the link from your email.',
        );
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        setState('error');
        setMessage(
          'The site is not configured correctly. Please contact support.',
        );
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });

        if (error) throw error;

        setState('success');
        setTimeout(() => {
          window.location.href = nextParam;
        }, 700);
      } catch (err) {
        console.error('[ConfirmPage]', err);
        setState('error');
        setMessage(
          err?.message ||
            'This link has expired or has already been used. Please sign in or request a new link.',
        );
      }
    })();
  }, []);

  return (
    <div className='min-h-screen flex items-center justify-center px-4 bg-slate-50'>
      <div className='w-full max-w-sm text-center'>
        {state === 'loading' && (
          <>
            <div className='w-14 h-14 mx-auto mb-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin' />
            <h1 className='font-display font-light text-2xl text-slate-900'>
              Confirming your account
            </h1>
            <p className='mt-2 text-sm text-slate-500'>One moment…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className='w-14 h-14 mx-auto mb-5 rounded-full bg-emerald-500 text-white flex items-center justify-center'>
              <i className='fas fa-check text-xl' aria-hidden='true' />
            </div>
            <h1 className='font-display font-light text-2xl text-slate-900'>
              You&rsquo;re in
            </h1>
            <p className='mt-2 text-sm text-slate-500'>Redirecting…</p>
          </>
        )}

        {state === 'error' && (
          <>
            <div className='w-14 h-14 mx-auto mb-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center'>
              <i
                className='fas fa-triangle-exclamation text-xl'
                aria-hidden='true'
              />
            </div>
            <h1 className='font-display font-light text-2xl text-slate-900'>
              Link is invalid
            </h1>
            <p className='mt-2 text-sm text-slate-500 leading-relaxed'>
              {message}
            </p>
            <div className='mt-8 flex flex-col sm:flex-row justify-center gap-3'>
              <a
                href='/admin/login'
                className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-colors'>
                Back to sign-in
              </a>
              <a
                href={`mailto:academics@spmh.co.ke`}
                className='inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-100 transition-colors'>
                Request help
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

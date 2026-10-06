import { useEffect, useState } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { validatePassword } from '../../../lib/admin/settings';

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 ' +
  'focus:ring-primary/15 transition-colors';

export default function SetPasswordPage() {
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  /* -- Require a session. If none, send to login. -- */
  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        window.location.href = '/admin/login?error=not_provisioned';
        return;
      }
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/admin/login';
        return;
      }
      setCheckingSession(false);
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const err = validatePassword(pw1);
    if (err) {
      setError(err);
      return;
    }
    if (pw1 !== pw2) {
      setError('Passwords do not match.');
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      setError('Site is not configured.');
      return;
    }

    setSaving(true);
    try {
      const { error: pwErr } = await supabase.auth.updateUser({
        password: pw1,
      });
      if (pwErr) throw pwErr;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { error: dbErr } = await supabase
          .from('admin_users')
          .update({ password_set: true })
          .eq('id', user.id);
        if (dbErr) {
          // Non-fatal — log and continue. The guard will fire again on next login.
          console.warn(
            '[SetPasswordPage] could not flag password_set:',
            dbErr.message,
          );
        }
      }

      window.location.href = '/admin/academics/dashboard';
    } catch (err) {
      console.error('[SetPasswordPage]', err);
      setError(err?.message || 'Could not set password. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (checkingSession) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='w-12 h-12 border-2 border-slate-200 border-t-primary rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 py-12 bg-slate-50'>
      <div className='w-full max-w-md'>
        <div className='text-center mb-8'>
          <img
            src='/logos/logo.png'
            alt=''
            className='h-12 w-auto mx-auto mb-4'
          />
          <h1 className='font-display font-light text-3xl text-slate-900 leading-tight'>
            Set your password
          </h1>
          <p className='mt-3 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed'>
            You&rsquo;re signed in for the first time. Choose a password to use
            next time you log in.
          </p>
        </div>

        <div className='rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8'>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <label className='block'>
              <span className='block text-xs font-medium text-slate-600 mb-1.5'>
                New password
              </span>
              <input
                type='password'
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                autoComplete='new-password'
                placeholder='••••••••'
                className={inputCls}
                autoFocus
              />
            </label>

            <label className='block'>
              <span className='block text-xs font-medium text-slate-600 mb-1.5'>
                Confirm password
              </span>
              <input
                type='password'
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete='new-password'
                placeholder='••••••••'
                className={inputCls}
              />
            </label>

            {error && (
              <p className='text-xs text-red-600 leading-relaxed'>{error}</p>
            )}

            <p className='text-[11px] text-slate-500 leading-relaxed'>
              Minimum 8 characters, with at least one uppercase letter, one
              lowercase letter, and one number.
            </p>

            <button
              type='submit'
              disabled={saving}
              className='w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed'>
              {saving ? 'Saving…' : 'Set password and continue'}
              {!saving && (
                <i className='fas fa-arrow-right text-xs' aria-hidden='true' />
              )}
            </button>
          </form>
        </div>

        <p className='mt-6 text-center text-[11px] text-slate-400'>
          <a
            href='/admin/login'
            className='hover:text-slate-600 transition-colors'>
            ← Back to sign-in
          </a>
        </p>
      </div>
    </div>
  );
}

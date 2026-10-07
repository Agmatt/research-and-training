import { useEffect, useState } from 'react';
import { getSupabase } from '../../../lib/supabase';
import { validatePassword } from '../../../lib/admin/settings';+
import '../../../styles/global.css'
  
const inputCls =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 ' +
  'focus:ring-primary/15 transition-colors';

export default function SetPasswordPage() {
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');

  /* Confirm the user has a session, then redirect if they already set a password */
  useEffect(() => {
    (async () => {
      const supabase = getSupabase();
      if (!supabase) {
        window.location.href = '/admin/login';
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = '/admin/login';
        return;
      }

      setEmail(session.user.email || '');
      setFullName(session.user.user_metadata?.full_name || '');

      // If the user already has password_set = true, they don't belong here
      const { data: row } = await supabase
        .from('admin_users')
        .select('password_set')
        .eq('id', session.user.id)
        .maybeSingle();

      if (row?.password_set === true) {
        window.location.href = '/admin/academics/dashboard';
        return;
      }

      setCheckingSession(false);
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const basicErr = validatePassword(pw1);
    if (basicErr) {
      setError(basicErr);
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
      /* 1. Set the password in Supabase Auth */
      const { error: pwErr } = await supabase.auth.updateUser({
        password: pw1,
      });
      if (pwErr) throw pwErr;

      /* 2. Flip the flag server-side (RLS-safe) */
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await fetch('/api/admin/mark-password-set', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(
          body?.error || 'Could not finalize your account setup.',
        );
      }

      /* 3. Redirect to dashboard */
      window.location.href = '/admin/academics/dashboard';
    } catch (err) {
      console.error('[SetPasswordPage]', err);
      setError(err?.message || 'Could not set password. Please try again.');
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
    <div className='min-h-screen flex flex-col lg:flex-row bg-slate-50'>
      {/* Left / top: brand panel */}
      <div className='relative overflow-hidden bg-[#0A1730] text-white lg:w-1/2 flex-shrink-0'>
        <div
          className='absolute inset-0 pointer-events-none'
          aria-hidden='true'>
          <div className='absolute -top-32 -right-20 w-[30rem] h-[30rem] rounded-full bg-primary/[0.15] blur-[120px]' />
          <div className='absolute -bottom-40 -left-20 w-[30rem] h-[30rem] rounded-full bg-[#c8a951]/[0.06] blur-[120px]' />
        </div>

        <div className='relative p-8 sm:p-12 lg:p-16 flex flex-col justify-between min-h-[200px] lg:min-h-full'>
          <a href='/' className='inline-flex items-center gap-3'>
            <img src='/logos/logo.png' alt='' className='h-10 w-auto' />
            <span className='flex flex-col'>
              <span className='font-display text-sm font-bold leading-tight'>
                St. Paul&rsquo;s Mission Hospital
              </span>
              <span className='text-[10px] uppercase tracking-wider text-slate-400'>
                Academics &amp; Research
              </span>
            </span>
          </a>

          <div className='hidden lg:block mt-12 lg:mt-0'>
            <div className='h-px w-14 bg-gold/70 mb-6' />
            <h1 className='font-display font-light text-4xl xl:text-5xl leading-[1.05] tracking-[-0.03em] text-balance'>
              One last step
              <br />
              before you&rsquo;re
              <br />
              <span className='text-primary-light'>in.</span>
            </h1>
            <p className='mt-6 text-sm text-slate-400 leading-relaxed max-w-md'>
              Choose a password to secure your account. You&rsquo;ll use it
              every time you sign in from now on.
            </p>
          </div>

          <p className='hidden lg:block text-[10px] uppercase tracking-[0.24em] text-slate-500'>
            Level 5-Ready Teaching Hospital &middot; Homa Bay
          </p>
        </div>
      </div>

      {/* Right / bottom: form */}
      <div className='flex-1 flex items-center justify-center px-5 sm:px-8 py-10 sm:py-16 lg:py-0'>
        <div className='w-full max-w-md'>
          {/* Mobile heading */}
          <div className='lg:hidden mb-8'>
            <div className='h-px w-12 bg-gold/70 mb-5' />
            <h1 className='font-display font-light text-3xl text-slate-900 leading-tight tracking-[-0.02em]'>
              Set your password
            </h1>
            <p className='mt-3 text-sm text-slate-500 leading-relaxed'>
              One last step before you&rsquo;re in.
            </p>
          </div>

          {/* Who they are */}
          {(fullName || email) && (
            <div className='mb-6 rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex items-center gap-3'>
              <span className='w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0'>
                {(fullName || email)
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <div className='min-w-0'>
                {fullName && (
                  <p className='text-sm font-semibold text-slate-900 truncate'>
                    {fullName}
                  </p>
                )}
                <p className='text-xs text-slate-500 truncate'>{email}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className='space-y-4'>
            <label className='block'>
              <span className='block text-xs font-semibold text-slate-700 mb-1.5'>
                New password
              </span>
              <input
                type='password'
                value={pw1}
                onChange={(e) => setPw1(e.target.value)}
                autoComplete='new-password'
                placeholder='At least 8 characters'
                className={inputCls}
                autoFocus
              />
            </label>

            <label className='block'>
              <span className='block text-xs font-semibold text-slate-700 mb-1.5'>
                Confirm password
              </span>
              <input
                type='password'
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
                autoComplete='new-password'
                placeholder='Repeat your password'
                className={inputCls}
              />
            </label>

            {error && (
              <div className='flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-xs text-red-700'>
                <i
                  className='fas fa-circle-exclamation mt-0.5 shrink-0'
                  aria-hidden='true'
                />
                <span className='leading-relaxed'>{error}</span>
              </div>
            )}

            <div className='rounded-lg bg-slate-100/70 border border-slate-200 px-3.5 py-3 text-[11px] text-slate-600 leading-relaxed'>
              <strong className='text-slate-700'>Requirements</strong>
              <ul className='mt-1.5 space-y-0.5'>
                <li>· At least 8 characters</li>
                <li>· One uppercase letter</li>
                <li>· One lowercase letter</li>
                <li>· One number</li>
              </ul>
            </div>

            <button
              type='submit'
              disabled={saving}
              className='w-full inline-flex items-center justify-center gap-2
                         px-6 py-3.5 rounded-xl bg-primary text-white text-sm font-semibold
                         hover:bg-primary-dark active:scale-[0.99]
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200 shadow-lg shadow-primary/20'>
              {saving ? (
                <>
                  <i
                    className='fas fa-circle-notch fa-spin text-xs'
                    aria-hidden='true'
                  />
                  Saving…
                </>
              ) : (
                <>
                  Set password &amp; continue
                  <i
                    className='fas fa-arrow-right text-xs'
                    aria-hidden='true'
                  />
                </>
              )}
            </button>
          </form>

          <p className='mt-6 text-center text-[11px] text-slate-400'>
            <a
              href='/admin/login'
              className='hover:text-slate-600 transition-colors'>
              ← Back to sign-in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

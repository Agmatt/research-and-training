import { useEffect, useState } from 'react';
import { signInWithPassword, signInWithMagicLink } from '../../lib/auth';

const inputCls =
  'w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 ' +
  'focus:ring-primary/20 transition-colors';

const labelCls = 'block text-sm font-semibold text-slate-700 mb-1.5';

export default function LoginForm({ initialError }) {
  const [tab, setTab] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError || '');
  const [magicSent, setMagicSent] = useState(false);
  const [idleMsg, setIdleMsg] = useState(false);

  /* Detect ?reason=idle and show a friendly banner, then clean the URL */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reason') === 'idle') {
      setIdleMsg(true);
      params.delete('reason');
      const next =
        window.location.pathname +
        (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState({}, '', next);
    }
  }, []);

  const submitPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithPassword(email, password);
      window.location.href = '/admin/academics/dashboard';
    } catch (err) {
      setError(
        err?.message || 'Sign-in failed. Check your credentials and try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const submitMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithMagicLink(email);
      setMagicSent(true);
    } catch (err) {
      setError(err?.message || 'Could not send the sign-in link. Try again.');
    } finally {
      setLoading(false);
    }
  };

  if (magicSent) {
    return (
      <div className='text-center'>
        <div className='w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5'>
          <i
            className='fas fa-envelope-circle-check text-xl'
            aria-hidden='true'
          />
        </div>
        <h2 className='text-xl font-bold text-slate-900 mb-2'>
          Check your inbox
        </h2>
        <p className='text-sm text-slate-600 mb-6'>
          We sent a sign-in link to{' '}
          <strong className='text-slate-900'>{email}</strong>. It expires in 2
          hours.
        </p>
        <button
          type='button'
          onClick={() => {
            setMagicSent(false);
            setPassword('');
          }}
          className='text-sm text-primary hover:underline'>
          ← Use a different method
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Idle-logout banner */}
      {idleMsg && (
        <div className='mb-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 flex items-start gap-2.5'>
          <i
            className='fas fa-clock mt-0.5 text-xs shrink-0'
            aria-hidden='true'
          />
          <span className='leading-relaxed'>
            You were signed out after 15 minutes of inactivity.
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className='flex items-center gap-1 mb-6 border-b border-slate-200'>
        {[
          { id: 'password', label: 'Password' },
          { id: 'magic', label: 'Email link' },
        ].map((t) => (
          <button
            key={t.id}
            type='button'
            onClick={() => {
              setTab(t.id);
              setError('');
            }}
            className={`px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className='mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error === 'not_provisioned'
            ? 'Your account is not provisioned. Contact an administrator.'
            : error}
        </div>
      )}

      {tab === 'password' ? (
        <form onSubmit={submitPassword} className='space-y-4' noValidate>
          <label className='block'>
            <span className={labelCls}>Email</span>
            <input
              type='email'
              required
              autoFocus
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@spmh.co.ke'
              className={inputCls}
            />
          </label>

          <label className='block'>
            <span className={labelCls}>Password</span>
            <input
              type='password'
              required
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              className={inputCls}
            />
          </label>

          <button
            type='submit'
            disabled={loading}
            className='w-full btn-primary py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed'>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      ) : (
        <form onSubmit={submitMagicLink} className='space-y-4' noValidate>
          <label className='block'>
            <span className={labelCls}>Email</span>
            <input
              type='email'
              required
              autoFocus
              autoComplete='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='you@spmh.co.ke'
              className={inputCls}
            />
          </label>

          <p className='text-xs text-slate-500'>
            We&rsquo;ll email you a one-time sign-in link. No password needed.
          </p>

          <button
            type='submit'
            disabled={loading}
            className='w-full btn-primary py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed'>
            {loading ? 'Sending…' : 'Send sign-in link'}
          </button>
        </form>
      )}

      <p className='mt-6 text-center text-xs text-slate-500'>
        Access is by invitation. To request an account, contact
        <a
          href='mailto:academics@spmh.co.ke'
          className='text-primary hover:underline ml-1'> 
          academics@spmh.co.ke
        </a>
        .
      </p>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useAuth } from '../../../lib/auth-react';
import {
  updateProfile,
  changePassword,
  validatePassword,
  roleLabel,
  formatDate,
} from '../../../lib/admin/settings';

function Section({ title, description, children }) {
  return (
    <section className='rounded-2xl border border-slate-200/80 bg-white'>
      <div className='px-6 py-5 border-b border-slate-100'>
        <h2 className='text-sm font-semibold text-slate-900'>{title}</h2>
        {description && (
          <p className='text-xs text-slate-500 mt-1'>{description}</p>
        )}
      </div>
      <div className='p-6'>{children}</div>
    </section>
  );
}

const inputCls =
  'w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 ' +
  'placeholder-slate-400 focus:border-primary focus:outline-none focus:ring-2 ' +
  'focus:ring-primary/15 transition-colors';

export default function ProfileTab() {
  const { adminUser } = useAuth();

  /* — Name — */
  const [fullName, setFullName] = useState('');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState(null);
  const [nameError, setNameError] = useState(null);

  useEffect(() => {
    if (adminUser?.full_name) setFullName(adminUser.full_name);
  }, [adminUser?.full_name]);

  async function handleSaveName(e) {
    e.preventDefault();
    if (!adminUser) return;
    setNameError(null);
    setNameMsg(null);

    const trimmed = fullName.trim();
    if (trimmed.length < 2) {
      setNameError('Name must be at least 2 characters.');
      return;
    }
    if (trimmed === adminUser.full_name) {
      setNameMsg('No changes to save.');
      return;
    }

    setSavingName(true);
    try {
      await updateProfile(adminUser.id, { full_name: trimmed });
      setNameMsg('Name updated. Refresh to see it in the sidebar.');
    } catch (err) {
      console.error('[ProfileTab] name', err);
      setNameError('Could not update name.');
    } finally {
      setSavingName(false);
    }
  }

  /* — Password — */
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwError, setPwError] = useState(null);

  async function handleSavePw(e) {
    e.preventDefault();
    setPwError(null);
    setPwMsg(null);

    const err = validatePassword(pw1);
    if (err) {
      setPwError(err);
      return;
    }
    if (pw1 !== pw2) {
      setPwError('Passwords do not match.');
      return;
    }

    setSavingPw(true);
    try {
      await changePassword(pw1);
      setPw1('');
      setPw2('');
      setPwMsg('Password updated.');
    } catch (err) {
      console.error('[ProfileTab] password', err);
      setPwError(err?.message || 'Could not update password.');
    } finally {
      setSavingPw(false);
    }
  }

  if (!adminUser) return null;

  return (
    <div className='space-y-6 max-w-2xl'>
      {/* Identity summary */}
      <Section title='Account' description='Your current account details.'>
        <dl className='grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm'>
          <div>
            <dt className='text-xs font-medium text-slate-500 mb-1'>Email</dt>
            <dd className='text-slate-900 break-all'>{adminUser.email}</dd>
          </div>
          <div>
            <dt className='text-xs font-medium text-slate-500 mb-1'>Role</dt>
            <dd>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide'>
                {roleLabel(adminUser.role)}
              </span>
            </dd>
          </div>
        </dl>
      </Section>

      {/* Name */}
      <Section
        title='Display name'
        description='Shown in the sidebar and next to your actions.'>
        <form onSubmit={handleSaveName} className='space-y-4'>
          <label className='block'>
            <span className='block text-xs font-medium text-slate-600 mb-1.5'>
              Full name
            </span>
            <input
              type='text'
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder='Your full name'
              className={inputCls}
            />
          </label>

          {nameError && <p className='text-xs text-red-600'>{nameError}</p>}
          {nameMsg && <p className='text-xs text-emerald-600'>{nameMsg}</p>}

          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={savingName}
              className='px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold
                         hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors'>
              {savingName ? 'Saving…' : 'Save name'}
            </button>
          </div>
        </form>
      </Section>

      {/* Password */}
      <Section
        title='Password'
        description='Minimum 8 characters, one uppercase, one lowercase, one number.'>
        <form onSubmit={handleSavePw} className='space-y-4'>
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

          {pwError && <p className='text-xs text-red-600'>{pwError}</p>}
          {pwMsg && <p className='text-xs text-emerald-600'>{pwMsg}</p>}

          <div className='flex justify-end'>
            <button
              type='submit'
              disabled={savingPw}
              className='px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-semibold
                         hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors'>
              {savingPw ? 'Updating…' : 'Update password'}
            </button>
          </div>
        </form>
      </Section>
    </div>
  );
}

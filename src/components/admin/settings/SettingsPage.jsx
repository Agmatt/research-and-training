import { useState } from 'react';
import { useAuth } from '../../../lib/auth-react';
import ProfileTab from './ProfileTab';
import TeamTab from './TeamTab';

export default function SettingsPage() {
  const { adminUser } = useAuth();
  const [tab, setTab] = useState('profile');

  const isAdmin = adminUser?.role === 'admin';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: 'user' },
    { id: 'team', label: 'Team', icon: 'users', adminOnly: true },
  ];

  const visibleTabs = tabs.filter((t) => !t.adminOnly || isAdmin);

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div>
        <span className='block text-[10px] font-bold uppercase tracking-[0.18em] text-primary mb-2'>
          Account
        </span>
        <h1 className='font-display font-light text-3xl text-slate-900 leading-tight'>
          Settings
        </h1>
        <p className='mt-2 text-sm text-slate-500'>
          Manage your profile{isAdmin ? ' and your team' : ''}.
        </p>
      </div>

      {/* Tabs */}
      <div className='flex items-center gap-1 border-b border-slate-200'>
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type='button'
            onClick={() => setTab(t.id)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-sm font-medium -mb-px border-b-2 transition-colors ${
              tab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}>
            <i className={`fas fa-${t.icon} text-xs`} aria-hidden='true' />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'profile' && <ProfileTab />}
      {tab === 'team' && isAdmin && <TeamTab />}
    </div>
  );
}

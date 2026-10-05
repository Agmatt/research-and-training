import { useState } from 'react';
import { signOut } from '../../lib/auth';

const navGroups = [
  {
    title: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/academics/dashboard',
        icon: 'chart-line',
      },
    ],
  },
  {
    title: 'Operations',
    items: [
      {
        label: 'Applicants',
        href: '/admin/academics/applicants',
        icon: 'users',
      },
      {
        label: 'Supervisors',
        href: '/admin/academics/supervisors',
        icon: 'user-tie',
      },
      {
        label: 'Partnerships',
        href: '/admin/academics/partnerships',
        icon: 'handshake',
      },
    ],
  },
  {
    title: 'System',
    items: [
      { label: 'Settings', href: '/admin/academics/settings', icon: 'cog' },
    ],
  },
];

export default function AdminSidebar({
  currentPath = '',
  adminUser,
  open,
  onClose,
}) {
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();
    window.location.href = '/admin/login';
  };

  const initials = (adminUser?.full_name || adminUser?.email || '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* Mobile overlay — only when drawer open */}
      {open && (
        <div
          className='fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden'
          onClick={onClose}
          aria-hidden='true'
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 flex flex-col
          bg-slate-950 text-slate-300
          border-r border-slate-800
          shadow-[0_0_60px_rgba(0,0,0,0.5)]
          transition-transform duration-300 ease-out
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto lg:shadow-none
        `}>
        {/* Brand */}
        <div className='h-16 flex items-center gap-3 px-5 border-b border-white/[0.08] shrink-0'>
          <div className='w-9 h-9 rounded-lg bg-primary text-white flex items-center justify-center font-bold text-sm shadow-lg shadow-primary/30'>
            S
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-bold text-white leading-tight truncate'>
              SPMH Admin
            </p>
            <p className='text-[10px] uppercase tracking-wider text-slate-500 truncate'>
              Academics &amp; Research
            </p>
          </div>
          {/* Close button — mobile only */}
          <button
            type='button'
            onClick={onClose}
            className='ml-auto lg:hidden w-8 h-8 flex items-center justify-center rounded-md
                       text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors'
            aria-label='Close menu'>
            <i className='fas fa-times text-sm' aria-hidden='true' />
          </button>
        </div>

        {/* Nav */}
        <nav className='flex-1 overflow-y-auto py-6'>
          {navGroups.map((group) => (
            <div key={group.title} className='mb-6 px-3'>
              <p className='px-3 mb-2 text-[10px] uppercase tracking-[0.18em] font-semibold text-slate-500'>
                {group.title}
              </p>
              <ul className='space-y-0.5'>
                {group.items.map((item) => {
                  const active =
                    currentPath === item.href ||
                    currentPath.startsWith(item.href + '/');
                  return (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className={`
                          group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                          ${
                            active
                              ? 'bg-primary text-white shadow-lg shadow-primary/30'
                              : 'text-slate-400 hover:bg-white/[0.06] hover:text-white'
                          }
                        `}>
                        <i
                          className={`fas fa-${item.icon} text-xs w-4 text-center ${
                            active
                              ? 'text-white'
                              : 'text-slate-500 group-hover:text-primary-light'
                          } transition-colors`}
                          aria-hidden='true'
                        />
                        <span>{item.label}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className='border-t border-white/[0.08] p-3 shrink-0'>
          <div className='flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]'>
            <div className='w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='text-xs font-semibold text-white truncate'>
                {adminUser?.full_name || 'Unnamed user'}
              </p>
              <p className='text-[10px] uppercase tracking-wider text-slate-500 truncate'>
                {adminUser?.role || '—'}
              </p>
            </div>
          </div>
          <button
            type='button'
            onClick={handleSignOut}
            disabled={signingOut}
            className='mt-2 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium
                       text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed'>
            <i className='fas fa-sign-out-alt text-[10px]' aria-hidden='true' />
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      </aside>
    </>
  );
}

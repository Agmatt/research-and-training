import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import IdleWarning from './IdleWarningModal';

export default function AdminShell({
  children,
  adminUser,
  currentPath = '',
  pageTitle = '',
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className='min-h-screen bg-slate-50 flex'>
      <AdminSidebar
        currentPath={currentPath}
        adminUser={adminUser}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className='flex-1 flex flex-col min-w-0'>
        {/* Topbar */}
        <header className='h-16 bg-white border-b border-slate-200 flex items-center gap-4 px-4 sm:px-6 lg:px-8 sticky top-0 z-30 shrink-0'>
          <button
            type='button'
            onClick={() => setSidebarOpen(true)}
            className='lg:hidden w-10 h-10 flex items-center justify-center rounded-lg
                       text-slate-600 bg-slate-50 border border-slate-200
                       hover:bg-slate-100 hover:text-slate-900 transition-colors'
            aria-label='Open menu'>
            <i className='fas fa-bars text-sm' aria-hidden='true' />
          </button>

          <div className='min-w-0'>
            <h1 className='text-sm font-semibold text-slate-900 truncate'>
              {pageTitle}
            </h1>
            <p className='text-[10px] uppercase tracking-wider text-slate-400 truncate hidden sm:block'>
              SPMH Admin
            </p>
          </div>

          <div className='ml-auto flex items-center gap-2'>
            <a
              href='/'
              target='_blank'
              rel='noopener'
              className='hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                         text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors'>
              <i
                className='fas fa-arrow-up-right-from-square text-[10px]'
                aria-hidden='true'
              />
              View public site
            </a>
            <div className='w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-[11px] font-bold shrink-0 lg:hidden'>
              {(adminUser?.full_name || '?').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className='flex-1 px-4 sm:px-6 lg:px-8 py-8'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </main>
      </div>

      {/* Idle timeout — active on every admin page */}
      <IdleWarning />
    </div>
  );
}

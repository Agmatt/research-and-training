import { useEffect } from 'react';
import { useAuth } from '../../lib/auth-react';

export default function ProtectedRoute({ children }) {
  const { session, adminUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      window.location.href = '/admin/login';
      return;
    }

    if (!adminUser || !adminUser.is_active) {
      window.location.href = '/admin/login?error=not_provisioned';
      return;
    }

    // Force first-time invited users to set a password
    const onSetPassword = window.location.pathname === '/admin/set-password';
    if (adminUser.password_set === false && !onSetPassword) {
      window.location.href = '/admin/set-password';
      return;
    }
  }, [loading, session, adminUser]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='text-center'>
          <div className='w-10 h-10 border-2 border-slate-200 border-t-primary rounded-full animate-spin mx-auto' />
          <p className='mt-4 text-sm text-slate-500'>Checking access…</p>
        </div>
      </div>
    );
  }

  if (!session || !adminUser || !adminUser.is_active) {
    return null; // redirect in progress
  }

  return children;
}

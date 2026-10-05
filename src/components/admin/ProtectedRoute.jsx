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
      // Authenticated but not provisioned — send them back to login with an error
      window.location.href = '/admin/login?error=not_provisioned';
    }
  }, [loading, session, adminUser]);

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-admin-bg'>
        <div className='text-center'>
          <div className='w-10 h-10 border-2 border-slate-300 border-t-primary rounded-full animate-spin mx-auto' />
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

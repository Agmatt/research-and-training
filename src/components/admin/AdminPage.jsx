import ProtectedRoute from './ProtectedRoute';
import AdminShell from './AdminShell';
import { useAuth } from '../../lib/auth-react';

export default function AdminPage({
  children,
  currentPath = '',
  pageTitle = '',
}) {
  return (
    <ProtectedRoute>
      <AdminPageInner currentPath={currentPath} pageTitle={pageTitle}>
        {children}
      </AdminPageInner>
    </ProtectedRoute>
  );
}

function AdminPageInner({ children, currentPath, pageTitle }) {
  const { adminUser } = useAuth();
  return (
    <AdminShell
      adminUser={adminUser}
      currentPath={currentPath}
      pageTitle={pageTitle}>
      {children}
    </AdminShell>
  );
}

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../../components/ui/LoadingSpinner';

interface RequireAuthProps {
  children: React.ReactNode;
}

export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/admin" replace />;

  return <>{children}</>;
}

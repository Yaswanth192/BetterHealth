import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { HomePage } from './pages/HomePage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { RequireAuth } from './components/admin/RequireAuth';

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminAppointmentsPage = lazy(() => import('./pages/admin/AdminAppointmentsPage').then(m => ({ default: m.AdminAppointmentsPage })));
const AdminMessagesPage = lazy(() => import('./pages/admin/AdminMessagesPage').then(m => ({ default: m.AdminMessagesPage })));
const AdminDoctorsPage = lazy(() => import('./pages/admin/AdminDoctorsPage').then(m => ({ default: m.AdminDoctorsPage })));
const AdminServicesPage = lazy(() => import('./pages/admin/AdminServicesPage').then(m => ({ default: m.AdminServicesPage })));
const AdminSettingsPage = lazy(() => import('./pages/admin/AdminSettingsPage').then(m => ({ default: m.AdminSettingsPage })));
const DevPanelPage = lazy(() => import('./pages/dev/DevPanelPage').then(m => ({ default: m.DevPanelPage })));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<Navigate to="/medicare-clinic" replace />} />
          <Route path="/:slug" element={<HomePage />} />
          <Route path="/:slug/:page" element={<HomePage />} />

          {/* Admin Auth */}
          <Route path="/admin" element={<AdminLoginPage />} />

          {/* Admin Dashboard (protected) */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <NotificationProvider>
                  <AdminLayout />
                </NotificationProvider>
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}> <AdminDashboardPage /> </Suspense>} />
            <Route path="appointments" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}> <AdminAppointmentsPage /> </Suspense>} />
            <Route path="messages" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}> <AdminMessagesPage /> </Suspense>} />
            <Route path="doctors" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}> <AdminDoctorsPage /> </Suspense>} />
            <Route path="services" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}> <AdminServicesPage /> </Suspense>} />
            <Route path="settings" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}> <AdminSettingsPage /> </Suspense>} />
          </Route>

          {/* Developer Panel - hidden route */}
          <Route path="/inkocli" element={<Suspense fallback={<div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>}> <DevPanelPage /> </Suspense>} />

          {/* Fallback */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          <Route path="/" element={<Navigate to="/medicare-clinic" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

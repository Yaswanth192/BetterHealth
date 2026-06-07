import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { HomePage } from './pages/HomePage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminMessagesPage } from './pages/admin/AdminMessagesPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { DevPanelPage } from './pages/dev/DevPanelPage';
import { RequireAuth } from './components/admin/RequireAuth';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          {/* <Route path="/" element={<HomePage />} /> */}
          <Route path="/" element={<Navigate to="/medicare-clinic" replace />} />
          <Route path="/:slug" element={<HomePage />} />

          {/* Admin Auth */}
          <Route path="/admin" element={<AdminLoginPage />} />

          {/* Admin Dashboard (protected) */}
          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="appointments" element={<AdminAppointmentsPage />} />
            <Route path="messages" element={<AdminMessagesPage />} />
            <Route path="doctors" element={<AdminDoctorsPage />} />
            <Route path="services" element={<AdminServicesPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Developer Panel - hidden route */}
          <Route path="/inkocli" element={<DevPanelPage />} />

          {/* Fallback */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
          <Route path="/" element={<Navigate to="/medicare-clinic" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

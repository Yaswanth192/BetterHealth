import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, MessageSquare, Users, Settings,
  LogOut, Menu, X, Activity, ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/doctors', icon: Users, label: 'Doctors' },
  { to: '/admin/services', icon: Activity, label: 'Services' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function AdminLayout() {
  const { signOut, user, adminRecord } = useAuth();
  const { counts } = useNotifications();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [clinic, setClinic] = useState<any | null>(null);
  const publicSitePath = typeof window !== 'undefined' && window.location.hostname === 'localhost' && clinic?.slug ? `/${clinic.slug}` : '/';
  const totalNotifications = counts.pendingAppointments + counts.unreadMessages;

  async function handleSignOut() {
    await signOut();
    navigate('/admin');
  }

  useEffect(() => {
    async function fetchClinic() {
      if (!adminRecord?.clinic_id) return setClinic(null);
      const { data } = await supabase.from('clinics').select('*').eq('id', adminRecord!.clinic_id).maybeSingle();
      setClinic(data ?? null);
    }

    fetchClinic();

    const onClinicUpdated = () => { fetchClinic(); };
    window.addEventListener('clinic-updated', onClinicUpdated as EventListener);
    return () => window.removeEventListener('clinic-updated', onClinicUpdated as EventListener);
  }, [adminRecord]);

  return (
    <div className="flex h-screen bg-neutral-50 overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-neutral-100 flex flex-col shadow-lg lg:shadow-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-100">
          {clinic?.logo_url ? (
            <img src={clinic.logo_url} alt={clinic.name} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 truncate text-sm">{clinic?.name || 'Clinic Admin'}</p>
            <p className="text-xs text-neutral-400 capitalize">{adminRecord?.role || 'staff'}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-neutral-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600' : 'text-neutral-400 group-hover:text-neutral-600'}`} />
                  {label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-primary-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-neutral-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-neutral-50 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-700 truncate">{user?.email}</p>
              <p className="text-xs text-neutral-400 capitalize">{adminRecord?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-neutral-100 px-4 sm:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl hover:bg-neutral-100 text-neutral-500 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {totalNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalNotifications > 9 ? '9+' : totalNotifications}
                </span>
              )}
            </button>
            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg border border-neutral-100 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-100">
                    <p className="font-semibold text-neutral-900 text-sm">Notifications</p>
                  </div>
                  {totalNotifications === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Bell className="w-8 h-8 text-neutral-200 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-50">
                      {counts.pendingAppointments > 0 && (
                        <NavLink
                          to="/admin/appointments"
                          onClick={() => setNotificationsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900">Pending Appointments</p>
                            <p className="text-xs text-neutral-500">{counts.pendingAppointments} awaiting review</p>
                          </div>
                        </NavLink>
                      )}
                      {counts.unreadMessages > 0 && (
                        <NavLink
                          to="/admin/messages"
                          onClick={() => setNotificationsOpen(false)}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-teal-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900">Unread Messages</p>
                            <p className="text-xs text-neutral-500">{counts.unreadMessages} new messages</p>
                          </div>
                        </NavLink>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <NavLink to={publicSitePath} target="_blank" className="text-xs text-primary-600 hover:text-primary-700 font-medium">
            View Site →
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

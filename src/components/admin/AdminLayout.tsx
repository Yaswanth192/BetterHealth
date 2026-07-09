import { useEffect, useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard, Calendar, MessageSquare, Users, Settings,
  LogOut, Menu, X, Activity, ChevronRight, Bell, Sun, Moon,
  Image, Lightbulb, Package, HelpCircle, ChevronDown, Building2, ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';
import { applyClinicColors } from '../../hooks/useClinicData';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/doctors', icon: Users, label: 'Doctors' },
  { to: '/admin/services', icon: Activity, label: 'Services' },
];

const contentItems = [
  { to: '/admin/clinic-info', icon: Building2, label: 'Clinic Info' },
  { to: '/admin/hospital-images', icon: Image, label: 'Hospital Images' },
  { to: '/admin/health-tips', icon: Lightbulb, label: 'Health Tips' },
  { to: '/admin/health-packages', icon: Package, label: 'Health Packages' },
  { to: '/admin/insurance', icon: ShieldCheck, label: 'Insurance' },
  { to: '/admin/faq', icon: HelpCircle, label: 'FAQ' },
];

export function AdminLayout() {
  const { signOut, user, adminRecord } = useAuth();
  const { counts, dismissAppointments, dismissMessages } = useNotifications();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [contentOpen, setContentOpen] = useState(false);
  const [clinic, setClinic] = useState<Record<string, unknown> | null>(null);
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
      if (data?.primary_color) {
        applyClinicColors(data.primary_color, data.secondary_color, data.book_button_color);
      }
    }

    fetchClinic();

    const onClinicUpdated = () => { fetchClinic(); };
    window.addEventListener('clinic-updated', onClinicUpdated as EventListener);
    return () => window.removeEventListener('clinic-updated', onClinicUpdated as EventListener);
  }, [adminRecord]);

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-100 dark:border-neutral-800 flex flex-col shadow-lg lg:shadow-none transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-100 dark:border-neutral-800">
          {clinic?.logo_url ? (
            <img src={clinic.logo_url as string} alt={clinic.name as string} className="w-9 h-9 rounded-xl object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-teal-500 flex items-center justify-center flex-shrink-0">
              <Activity className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="min-w-0">
            <p className="font-bold text-neutral-900 dark:text-neutral-100 truncate text-sm">{(clinic?.name as string) || 'Clinic Admin'}</p>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 capitalize">{adminRecord?.role || 'staff'}</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden ml-auto p-1 text-neutral-400 dark:text-neutral-500">
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
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`} />
                  {label}
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto text-primary-400 dark:text-primary-300" />}
                </>
              )}
            </NavLink>
          ))}

          {/* Content Group */}
          <div>
            <button
              onClick={() => setContentOpen(!contentOpen)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              <Package className="w-5 h-5 flex-shrink-0 text-neutral-400 dark:text-neutral-500" />
              Content
              <ChevronDown className={`w-4 h-4 ml-auto transition-transform duration-200 ${contentOpen ? 'rotate-180' : ''}`} />
            </button>
            {contentOpen && (
              <div className="ml-4 mt-1 space-y-1">
                {contentItems.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500'}`} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            )}
          </div>

          <NavLink
            to="/admin/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                  : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300'}`} />
                Settings
                {isActive && <ChevronRight className="w-4 h-4 ml-auto text-primary-400 dark:text-primary-300" />}
              </>
            )}
          </NavLink>
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-neutral-50 dark:bg-neutral-800 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm flex-shrink-0">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-neutral-700 dark:text-neutral-200 truncate">{user?.email}</p>
              <p className="text-xs text-neutral-400 dark:text-neutral-500 capitalize">{adminRecord?.role}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-600 dark:text-neutral-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 px-4 sm:px-6 py-4 flex items-center gap-4 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 transition-colors"
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
                <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-neutral-900 rounded-xl shadow-lg border border-neutral-100 dark:border-neutral-700 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                    <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">Notifications</p>
                  </div>
                  {totalNotifications === 0 ? (
                    <div className="px-4 py-6 text-center">
                      <Bell className="w-8 h-8 text-neutral-200 dark:text-neutral-600 mx-auto mb-2" />
                      <p className="text-sm text-neutral-400 dark:text-neutral-500">No new notifications</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-neutral-50 dark:divide-neutral-800">
                      {counts.pendingAppointments > 0 && (
                        <NavLink
                          to="/admin/appointments"
                          onClick={() => { dismissAppointments(); setNotificationsOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Pending Appointments</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{counts.pendingAppointments} awaiting review</p>
                          </div>
                        </NavLink>
                      )}
                      {counts.unreadMessages > 0 && (
                        <NavLink
                          to="/admin/messages"
                          onClick={() => { dismissMessages(); setNotificationsOpen(false); }}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center flex-shrink-0">
                            <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Unread Messages</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{counts.unreadMessages} new messages</p>
                          </div>
                        </NavLink>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <NavLink to={publicSitePath} target="_blank" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
            View Site →
          </NavLink>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 dark:bg-neutral-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

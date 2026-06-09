import { useEffect, useState } from 'react';
import { Calendar, MessageSquare, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment, ContactMessage } from '../../types';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { AppointmentStatusBadge } from '../../components/admin/AppointmentStatusBadge';

export function AdminDashboardPage() {
  const { clinicId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (clinicId) fetchData();
  }, [clinicId]);

  async function fetchData() {
    setLoading(true);
    const [apptRes, msgRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*, clinic_doctors(name, specialization), clinic_services(title)')
        .eq('clinic_id', clinicId!)
        .order('created_at', { ascending: false })
        .limit(50),
      supabase
        .from('contact_messages')
        .select('*')
        .eq('clinic_id', clinicId!)
        .order('created_at', { ascending: false })
        .limit(20),
    ]);
    setAppointments(apptRes.data ?? []);
    setMessages(msgRes.data ?? []);
    setLoading(false);
  }

  const stats = [
    { label: 'Total Appointments', value: appointments.length, icon: Calendar, color: 'bg-primary-50 text-primary-600', change: '+12%' },
    { label: 'Pending', value: appointments.filter(a => a.status === 'pending').length, icon: Clock, color: 'bg-amber-50 text-amber-600', change: '' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'confirmed').length, icon: CheckCircle, color: 'bg-emerald-50 text-emerald-600', change: '+5%' },
    { label: 'Unread Messages', value: messages.filter(m => !m.is_read).length, icon: MessageSquare, color: 'bg-teal-50 text-teal-600', change: '' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-500 text-sm mt-1">Overview of your clinic activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.color.split(' ')[0]} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color.split(' ')[1]}`} />
              </div>
              {stat.change && (
                <span className="text-xs font-medium text-emerald-600 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {stat.change}
                </span>
              )}
            </div>
            <div className="text-2xl font-bold text-neutral-900">{stat.value}</div>
            <div className="text-xs text-neutral-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Appointments */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            Recent Appointments
          </h2>
          <a href="/admin/appointments" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </a>
        </div>

        {appointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400">No appointments yet</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {appointments.slice(0, 8).map((appt) => (
              <div key={appt.id} className="px-6 py-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                  {appt.patient_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-neutral-900 text-sm truncate">{appt.patient_name}</p>
                  <p className="text-xs text-neutral-400 truncate">
                    {(appt.clinic_doctors as any)?.name || 'Any Doctor'} • {appt.preferred_date} {appt.preferred_time}
                  </p>
                </div>
                <AppointmentStatusBadge status={appt.status} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Messages */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="font-bold text-neutral-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-teal-600" />
            Recent Messages
          </h2>
          <a href="/admin/messages" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
            View all →
          </a>
        </div>

        {messages.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-neutral-200 mx-auto mb-3" />
            <p className="text-neutral-400">No messages yet</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {messages.slice(0, 5).map((msg) => (
              <div key={msg.id} className={`px-6 py-4 flex items-start gap-4 hover:bg-neutral-50 transition-colors ${!msg.is_read ? 'bg-primary-50/50' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm flex-shrink-0 mt-0.5">
                  {msg.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-neutral-900 text-sm">{msg.name}</p>
                    {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-neutral-500 truncate">{msg.subject || msg.message}</p>
                </div>
                <span className="text-xs text-neutral-400 flex-shrink-0">
                  {new Date(msg.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

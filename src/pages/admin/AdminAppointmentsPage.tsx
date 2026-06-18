import { useEffect, useState } from 'react';
import { Search, Filter, Eye, CheckCircle, XCircle, Check, Calendar, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Appointment, AppointmentStatus } from '../../types';
import { AppointmentStatusBadge } from '../../components/admin/AppointmentStatusBadge';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

const STATUS_OPTIONS: AppointmentStatus[] = ['pending', 'confirmed', 'rejected', 'completed', 'cancelled'];

export function AdminAppointmentsPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | 'all'>('all');
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (clinicId) fetchAppointments();
  }, [clinicId]);

  async function fetchAppointments() {
    setLoading(true);
    const { data } = await supabase
      .from('appointments')
      .select('*, clinic_doctors(name, specialization), clinic_services(title)')
      .eq('clinic_id', clinicId!)
      .order('created_at', { ascending: false });
    setAppointments(data ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: AppointmentStatus, notesText?: string) {
    setUpdating(true);
    const { error } = await supabase
      .from('appointments')
      .update({ status, notes: notesText ?? '', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      addToast('error', 'Failed to update appointment status');
    } else {
      setAppointments((prev) => prev.map((a) => a.id === id ? { ...a, status, notes: notesText ?? '' } : a));
      if (selected?.id === id) setSelected({ ...selected, status, notes: notesText ?? '' });
      addToast('success', `Appointment ${status}`);
    }
    setUpdating(false);
  }

  async function deleteAppointment(id: string) {
    if (!confirm('Delete this appointment? This cannot be undone.')) return;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete appointment');
    } else {
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      if (selected?.id === id) setSelected(null);
      addToast('success', 'Appointment deleted');
    }
  }

  const filtered = appointments.filter((a) => {
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    const matchSearch = !search || [a.patient_name, a.patient_email, a.patient_phone].some(
      (f) => f?.toLowerCase().includes(search.toLowerCase())
    );
    return matchStatus && matchSearch;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Appointments</h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{appointments.length} total appointments</p>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email or phone..."
                className="input-field pl-10"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as AppointmentStatus | 'all')}
                className="input-field pl-10 pr-8 appearance-none w-full sm:w-44"
              >
                <option value="all">All Status</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
                <tr>
                  <th className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Patient</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3 hidden md:table-cell">Doctor / Service</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3 hidden sm:table-cell">Date & Time</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-700">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12">
                      <Calendar className="w-12 h-12 text-neutral-200 dark:text-neutral-600 mx-auto mb-3" />
                      <p className="text-neutral-400 dark:text-neutral-500">No appointments found</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((appt) => (
                    <tr key={appt.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm flex-shrink-0">
                            {appt.patient_name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{appt.patient_name}</p>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{appt.patient_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-neutral-700 dark:text-neutral-200">{(appt.clinic_doctors as any)?.name || '—'}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">{(appt.clinic_services as any)?.title || '—'}</p>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <p className="text-sm text-neutral-700 dark:text-neutral-200">{appt.preferred_date}</p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">{appt.preferred_time}</p>
                      </td>
                      <td className="px-6 py-4">
                        <AppointmentStatusBadge status={appt.status} />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {appt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(appt.id, 'confirmed')}
                                className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 transition-colors"
                                title="Confirm"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateStatus(appt.id, 'rejected')}
                                className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {appt.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(appt.id, 'completed')}
                              className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 text-primary-600 dark:text-primary-400 transition-colors"
                              title="Mark Complete"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => { setSelected(appt); setNotes(appt.notes || ''); }}
                            className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteAppointment(appt.id)}
                            className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 dark:text-red-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Appointment Details" size="lg">
        {selected && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Patient</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{selected.patient_name}</p>
                <p className="text-neutral-500 dark:text-neutral-400">{selected.patient_email}</p>
                <p className="text-neutral-500 dark:text-neutral-400">{selected.patient_phone}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Appointment</p>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">{selected.preferred_date}</p>
                <p className="text-neutral-500 dark:text-neutral-400">{selected.preferred_time}</p>
                <div className="mt-1"><AppointmentStatusBadge status={selected.status} /></div>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Doctor</p>
                <p className="text-neutral-700 dark:text-neutral-200">{(selected.clinic_doctors as any)?.name || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Service</p>
                <p className="text-neutral-700 dark:text-neutral-200">{(selected.clinic_services as any)?.title || 'Not specified'}</p>
              </div>
            </div>

            {selected.message && (
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Patient Message</p>
                <p className="text-neutral-700 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 text-sm">{selected.message}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Admin Notes</p>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this appointment..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((status) => (
                  <button
                    key={status}
                    onClick={() => updateStatus(selected.id, status, notes)}
                    disabled={updating || selected.status === status}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 capitalize ${
                      selected.status === status
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

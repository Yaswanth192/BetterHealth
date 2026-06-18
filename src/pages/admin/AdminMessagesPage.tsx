import { useEffect, useState } from 'react';
import { Search, Trash2, Mail, Phone, MessageSquare } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { ContactMessage } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

export function AdminMessagesPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (clinicId) fetchMessages();
  }, [clinicId]);

  async function fetchMessages() {
    setLoading(true);
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('clinic_id', clinicId!)
      .order('created_at', { ascending: false });
    setMessages(data ?? []);
    setLoading(false);
  }

  async function markRead(id: string) {
    await supabase.from('contact_messages').update({ is_read: true }).eq('id', id);
    setMessages((prev) => prev.map((m) => m.id === id ? { ...m, is_read: true } : m));
  }

  async function deleteMessage(id: string) {
    if (!confirm('Delete this message?')) return;
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete message');
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
      addToast('success', 'Message deleted');
    }
  }

  async function openMessage(msg: ContactMessage) {
    setSelected(msg);
    if (!msg.is_read) await markRead(msg.id);
  }

  const filtered = messages.filter((m) => {
    return !search || [m.name, m.email, m.subject, m.message].some(
      (f) => f?.toLowerCase().includes(search.toLowerCase())
    );
  });

  if (loading) {
    return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Messages</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
              {messages.filter((m) => !m.is_read).length} unread of {messages.length} total
            </p>
          </div>
        </div>

        <div className="card p-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="input-field pl-10"
            />
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="divide-y divide-neutral-50 dark:divide-neutral-700">
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-neutral-200 dark:text-neutral-600 mx-auto mb-3" />
                <p className="text-neutral-400 dark:text-neutral-500">No messages found</p>
              </div>
            ) : (
              filtered.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-4 px-6 py-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer ${!msg.is_read ? 'bg-primary-50/40 dark:bg-primary-900/10' : ''}`}
                  onClick={() => openMessage(msg)}
                >
                  <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold text-sm flex-shrink-0 mt-0.5">
                    {msg.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={`text-sm ${!msg.is_read ? 'font-bold text-neutral-900 dark:text-neutral-100' : 'font-medium text-neutral-700 dark:text-neutral-200'}`}>
                        {msg.name}
                      </p>
                      {!msg.is_read && <span className="w-2 h-2 rounded-full bg-primary-500 dark:bg-primary-400 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-0.5">{msg.email}</p>
                    {msg.subject && <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium truncate">{msg.subject}</p>}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{msg.message}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-neutral-400 dark:text-neutral-500">{new Date(msg.created_at).toLocaleDateString()}</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                      className="p-1.5 rounded-lg text-neutral-300 dark:text-neutral-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title="Message Details" size="lg">
        {selected && (
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-700 dark:text-teal-300 font-bold flex-shrink-0">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-neutral-900 dark:text-neutral-100">{selected.name}</p>
                  <p className="text-neutral-500 dark:text-neutral-400">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                  <Mail className="w-4 h-4" />
                  {selected.email}
                </a>
                {selected.phone && (
                  <a href={`tel:${selected.phone}`} className="flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">
                    <Phone className="w-4 h-4" />
                    {selected.phone}
                  </a>
                )}
              </div>
            </div>

            {selected.subject && (
              <div>
                <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-1">Subject</p>
                <p className="font-semibold text-neutral-800 dark:text-neutral-100">{selected.subject}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider mb-2">Message</p>
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-4 text-neutral-700 dark:text-neutral-200 text-sm leading-relaxed whitespace-pre-wrap">
                {selected.message}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <a href={`mailto:${selected.email}`} className="btn-primary flex-1 justify-center">
                <Mail className="w-4 h-4" />
                Reply by Email
              </a>
              {selected.phone && (
                <a href={`tel:${selected.phone}`} className="btn-secondary flex-1 justify-center">
                  <Phone className="w-4 h-4" />
                  Call
                </a>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

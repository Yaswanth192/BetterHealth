import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { FAQ } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import { ToastContainer } from '../../components/ui/Toast';

interface SectionSettings {
  show: boolean;
  useDummies: boolean;
}

interface FAQForm {
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

const EMPTY_FORM: FAQForm = { question: '', answer: '', sort_order: 0, is_active: true };

export function AdminFAQPage() {
  const { clinicId } = useAuth();
  const { toasts, addToast, removeToast } = useToast();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SectionSettings>({ show: true, useDummies: true });
  const [savingSettings, setSavingSettings] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<FAQ | null>(null);
  const [form, setForm] = useState<FAQForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [inlineForm, setInlineForm] = useState<FAQForm>(EMPTY_FORM);
  const [inlineSaving, setInlineSaving] = useState(false);

  useEffect(() => {
    if (clinicId) {
      fetchSettings();
      fetchFaqs();
    }
  }, [clinicId]);

  async function fetchSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    if (data?.section_settings?.faq) {
      setSettings(data.section_settings.faq);
    }
  }

  async function updateSettings(patch: Partial<SectionSettings>) {
    const next = { ...settings, ...patch };
    setSavingSettings(true);
    const { error } = await supabase.from('clinics').update({ section_settings: { ...await getFullSettings(), faq: next } }).eq('id', clinicId!);
    if (error) {
      addToast('error', 'Failed to update settings');
    } else {
      setSettings(next);
      addToast('success', 'Settings updated');
    }
    setSavingSettings(false);
  }

  async function getFullSettings() {
    const { data } = await supabase.from('clinics').select('section_settings').eq('id', clinicId!).maybeSingle();
    return data?.section_settings ?? {};
  }

  async function fetchFaqs() {
    setLoading(true);
    const { data } = await supabase.from('faqs').select('*').eq('clinic_id', clinicId!).order('sort_order');
    setFaqs(data ?? []);
    setLoading(false);
  }

  function openCreate() { setEditing(null); setForm(EMPTY_FORM); setModalOpen(true); }
  function openEdit(f: FAQ) {
    setEditing(f);
    setForm({ question: f.question, answer: f.answer, sort_order: f.sort_order, is_active: f.is_active });
    setModalOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        clinic_id: clinicId!,
        question: form.question,
        answer: form.answer,
        sort_order: form.sort_order,
        is_active: form.is_active,
      };
      const { error } = editing
        ? await supabase.from('faqs').update(payload).eq('id', editing.id)
        : await supabase.from('faqs').insert(payload);
      if (error) throw error;
      addToast('success', editing ? 'FAQ updated' : 'FAQ added');
      setModalOpen(false);
      fetchFaqs();
    } catch {
      addToast('error', 'Failed to save FAQ');
    }
    setSaving(false);
  }

  async function handleInlineSave() {
    if (!inlineForm.question || !inlineForm.answer) return;
    setInlineSaving(true);
    try {
      const { error } = await supabase.from('faqs').insert({
        clinic_id: clinicId!,
        question: inlineForm.question,
        answer: inlineForm.answer,
        sort_order: faqs.length,
        is_active: true,
      });
      if (error) throw error;
      addToast('success', 'FAQ added — switched to real data');
      setInlineForm(EMPTY_FORM);
      await updateSettings({ useDummies: false });
      fetchFaqs();
    } catch {
      addToast('error', 'Failed to add FAQ');
    }
    setInlineSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    const { error } = await supabase.from('faqs').delete().eq('id', id);
    if (error) {
      addToast('error', 'Failed to delete');
    } else {
      setFaqs(prev => prev.filter(f => f.id !== id));
      addToast('success', 'FAQ deleted');
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>;

  return (
    <>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">FAQ</h1>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">{faqs.length} questions</p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="w-4 h-4" /> Add FAQ</button>
        </div>

        {/* Toggle Controls */}
        <div className="card p-4">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Show Section</label>
              <button
                onClick={() => updateSettings({ show: !settings.show })}
                disabled={savingSettings}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.show ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.show ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Use Dummy Data</label>
              <button
                onClick={() => updateSettings({ useDummies: !settings.useDummies })}
                disabled={savingSettings}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.useDummies ? 'bg-primary-600' : 'bg-neutral-300 dark:bg-neutral-600'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings.useDummies ? 'translate-x-5' : ''}`} />
              </button>
            </div>
            {!settings.useDummies && faqs.length === 0 && (
              <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-1 rounded-full">
                Add your first FAQ below to populate this section
              </span>
            )}
          </div>
        </div>

        {/* Inline Quick-Add Form (shown when toggling off dummies and no FAQs exist) */}
        {settings.show && !settings.useDummies && faqs.length === 0 && (
          <div className="card p-6 border-2 border-dashed border-primary-300 dark:border-primary-700">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">Add Your First FAQ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Question *</label>
                <input
                  type="text"
                  value={inlineForm.question}
                  onChange={(e) => setInlineForm({ ...inlineForm, question: e.target.value })}
                  className="input-field"
                  placeholder="e.g. How do I book an appointment?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Answer *</label>
                <textarea
                  rows={3}
                  value={inlineForm.answer}
                  onChange={(e) => setInlineForm({ ...inlineForm, answer: e.target.value })}
                  className="input-field resize-none"
                  placeholder="Type the answer here..."
                />
              </div>
              <button
                onClick={handleInlineSave}
                disabled={inlineSaving || !inlineForm.question || !inlineForm.answer}
                className="btn-primary disabled:opacity-50"
              >
                {inlineSaving ? 'Saving...' : 'Add FAQ & Switch to Real Data'}
              </button>
            </div>
          </div>
        )}

        {/* FAQ List */}
        {faqs.length > 0 && (
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800 border-b border-neutral-100 dark:border-neutral-700">
                <tr>
                  <th className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase px-6 py-3 w-8"></th>
                  <th className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase px-6 py-3">Question</th>
                  <th className="text-left text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase px-6 py-3 hidden md:table-cell">Answer</th>
                  <th className="text-right text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50 dark:divide-neutral-700">
                {faqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                    <td className="px-6 py-4 text-neutral-300 dark:text-neutral-600">
                      <GripVertical className="w-4 h-4" />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-neutral-900 dark:text-neutral-100 text-sm">{faq.question}</p>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <p className="text-sm text-neutral-600 dark:text-neutral-300 truncate max-w-md">{faq.answer}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEdit(faq)} className="p-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-neutral-600 dark:text-neutral-300 transition-colors">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(faq.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit FAQ' : 'Add FAQ'}>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Question *</label>
            <input type="text" required value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} className="input-field" placeholder="e.g. How do I book an appointment?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Answer *</label>
            <textarea rows={4} value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} className="input-field resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} className="input-field" />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="faq-active" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-primary-600" />
              <label htmlFor="faq-active" className="text-sm font-medium text-neutral-700 dark:text-neutral-200">Active</label>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.question || !form.answer} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving...' : editing ? 'Update' : 'Add FAQ'}
            </button>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </>
  );
}

import { useState } from 'react';
import { Star, BadgeCheck, MessageSquare, X, Send } from 'lucide-react';
import { Testimonial, ClinicDoctor, ClinicService } from '../types';
import { supabase } from '../lib/supabase';

interface ReviewsPageProps {
  testimonials?: Testimonial[];
  doctors?: ClinicDoctor[];
  services?: ClinicService[];
  clinicId?: string;
}

export function ReviewsPage({ testimonials = [], doctors = [], services = [], clinicId }: ReviewsPageProps) {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [name, setName] = useState('');
  const [designation, setDesignation] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clinicId || rating === 0) return;
    setSubmitting(true);

    const { error } = await supabase.from('testimonials').insert({
      clinic_id: clinicId,
      patient_name: name,
      rating,
      message,
      designation,
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setTimeout(() => {
        setShowForm(false);
        setSubmitted(false);
        setRating(0);
        setName('');
        setDesignation('');
        setMessage('');
      }, 2000);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="bg-primary-950 bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 text-white text-center py-20">
        <div className="container-max px-4">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-full text-sm font-semibold mb-4">
            Customer Reviews
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-white/70 text-lg">Real reviews from real customers</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <span className="flex items-center gap-1">⭐ 4.8 Overall</span>
            <span className="flex items-center gap-1">✅ 100% Genuine</span>
            <span className="flex items-center gap-1">🏥 {testimonials.length}+ Reviews</span>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <div className="container-max px-4 py-12">
        {testimonials.length === 0 && (
          <p className="text-center text-neutral-500 dark:text-neutral-400 mb-8">
            No reviews yet? Be the first to share your experience!
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {testimonials.map((review) => (
            <div key={review.id} className="card p-6">
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-4 italic">"{review.message}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                {review.patient_avatar_url ? (
                  <img src={review.patient_avatar_url} alt={review.patient_name} className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                    {review.patient_name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{review.patient_name}</p>
                  <p className="text-xs text-neutral-400">{review.designation}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Share Experience */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Share Your Experience</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Your feedback helps others make better decisions.</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Share Feedback
          </button>
        </div>
      </div>

      {/* Review Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowForm(false)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Share Your Experience</h3>
              <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitted ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Send className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <p className="font-semibold text-neutral-900 dark:text-neutral-100">Review Submitted!</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Thank you for your feedback.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Doctor / Service</label>
                  <select
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    <option value="">Select doctor or service</option>
                    {doctors.length > 0 && (
                      <optgroup label="Doctors">
                        {doctors.map((d) => (
                          <option key={d.id} value={d.name}>{d.name} — {d.specialization}</option>
                        ))}
                      </optgroup>
                    )}
                    {services.length > 0 && (
                      <optgroup label="Services">
                        {services.map((s) => (
                          <option key={s.id} value={s.title}>{s.title}</option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Rating</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onMouseEnter={() => setHoveredStar(r)}
                        onMouseLeave={() => setHoveredStar(0)}
                        onClick={() => setRating(r)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            r <= (hoveredStar || rating)
                              ? 'text-amber-400 fill-current'
                              : 'text-neutral-300 dark:text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Your Review</label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || rating === 0}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

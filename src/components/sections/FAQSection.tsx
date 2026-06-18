import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ } from '../../types';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface FAQSectionProps {
  faqs: FAQ[];
}

const fallbackFaqs = [
  { id: '1', question: 'How do I book an appointment?', answer: 'You can book an appointment online through our website, by calling our phone number, or by visiting the clinic in person. Online booking is available 24/7.' },
  { id: '2', question: 'What insurance plans do you accept?', answer: 'We accept most major insurance plans including Blue Cross Blue Shield, Aetna, Cigna, United Healthcare, and Medicare. Please contact us to verify your specific coverage.' },
  { id: '3', question: 'How early should I arrive for my appointment?', answer: 'We recommend arriving 15 minutes before your scheduled appointment to complete any necessary paperwork and ensure a smooth check-in process.' },
  { id: '4', question: 'What should I bring to my first visit?', answer: 'Please bring a valid photo ID, your insurance card, a list of current medications, any relevant medical records, and completed new patient forms (available on our website).' },
  { id: '5', question: 'Do you offer telemedicine consultations?', answer: 'Yes, we offer virtual consultations for follow-up appointments and non-emergency medical consultations. Ask our staff about scheduling a telemedicine visit.' },
  { id: '6', question: 'What are your emergency procedures?', answer: 'For medical emergencies, please call 911 or visit the nearest emergency room. For urgent but non-emergency situations, we offer same-day urgent care appointments.' },
  { id: '7', question: 'How can I access my medical records?', answer: 'Patients can access their medical records through our secure patient portal. You can request records by contacting our medical records department directly.' },
  { id: '8', question: 'What is your cancellation policy?', answer: 'We request at least 24 hours notice for cancellations. Late cancellations or no-shows may be subject to a cancellation fee. Please call us as soon as possible if you need to reschedule.' },
];

export function FAQSection({ faqs }: FAQSectionProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const displayFaqs = faqs.length > 0 ? faqs : fallbackFaqs as unknown as FAQ[];

  return (
    <section id="faq" className="section-padding bg-neutral-50 dark:bg-neutral-900">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="section-title">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="section-subtitle">
            Find answers to the most common questions about our services and procedures.
          </p>
        </div>

        <div
          className={`max-w-3xl mx-auto space-y-3 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '200ms' }}
        >
          {displayFaqs.map((faq, i) => (
            <div
              key={faq.id || i}
              className="bg-white dark:bg-neutral-800 rounded-2xl shadow-sm border border-neutral-100 dark:border-neutral-700 overflow-hidden"
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
              >
                <span className="font-semibold text-neutral-800 dark:text-neutral-100 pr-4">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${openIndex === i ? 'rotate-180' : ''}`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-5 animate-slide-down">
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

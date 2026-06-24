import { Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Clinic } from '../../types';

interface CTASectionProps {
  clinic: Clinic | null;
  appointmentPath: string;
}

export function CTASection({ clinic, appointmentPath }: CTASectionProps) {
  const whatsappNumber = clinic?.whatsapp_number?.replace(/\s/g, '') || '';
  return (
    <section className="section-padding bg-primary-950 bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 text-white text-center">
      <div className="container-max">
        <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4">
          {clinic?.cta_headline || 'Ready to Take the First Step?'}
        </h2>
        <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
          {clinic?.cta_description || 'Book a consultation with our expert doctors today. Walk-ins welcome.'}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            to={appointmentPath}
            className="btn-book px-8 py-4 text-base"
          >
            <Calendar className="w-5 h-5" />
            Book Appointment
          </Link>
          {whatsappNumber && (
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors text-base"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

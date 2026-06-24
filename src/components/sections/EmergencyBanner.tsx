import { Phone } from 'lucide-react';
import { Clinic } from '../../types';

interface EmergencyBannerProps {
  clinic: Clinic | null;
}

export function EmergencyBanner({ clinic }: EmergencyBannerProps) {
  const emergencyPhone = clinic?.emergency_phone || clinic?.phone || '+91 98765 00999';
  return (
    <section className="bg-neutral-900 text-white dark:bg-neutral-950 py-6">
      <div className="container-max flex flex-col sm:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 gap-4">
        <div className="flex items-center gap-4">
          <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse flex-shrink-0" />
          <div>
            <h3 className="font-bold text-xl">{clinic?.emergency_title || '24/7 Emergency Services Available'}</h3>
            <p className="text-neutral-400 text-sm">Emergency Helpline: {emergencyPhone}</p>
          </div>
        </div>
        <a
          href={`tel:${emergencyPhone.replace(/\s/g, '')}`}
          className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
        >
          <Phone className="w-5 h-5" />
          Call Now
        </a>
      </div>
    </section>
  );
}

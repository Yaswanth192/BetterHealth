import { ClinicService } from '../../types';
import { Stethoscope, Heart, Brain, Bone, Eye, Baby, Microscope, Pill } from 'lucide-react';

interface ServicesMarqueeProps {
  services: ClinicService[];
}

const iconMap: Record<string, React.ElementType> = {
  stethoscope: Stethoscope,
  heart: Heart,
  brain: Brain,
  bone: Bone,
  eye: Eye,
  baby: Baby,
  microscope: Microscope,
  pill: Pill,
};

const fallbackServices = [
  'General Medicine', 'Dental Care', 'Dermatology', 'Pediatrics',
  'Ophthalmology', 'Orthopedics', 'ENT', 'Cardiology',
];

export function ServicesMarquee({ services }: ServicesMarqueeProps) {
  const items = services.length > 0
    ? services.map(s => s.title)
    : fallbackServices;

  const doubled = [...items, ...items];

  return (
    <div className="bg-white border-y border-neutral-100 py-4 overflow-hidden">
      <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
        {doubled.map((title, i) => {
          const Icon = iconMap[title.toLowerCase().replace(/\s+/g, '')] || Stethoscope;
          return (
            <div key={i} className="flex items-center gap-2 px-6 mx-2 rounded-full border border-neutral-200 bg-neutral-50 text-sm font-medium text-neutral-700 flex-shrink-0">
              <Icon className="w-4 h-4 text-primary-500" />
              {title}
              <span className="text-primary-400">+</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

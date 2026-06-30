import { Clinic } from '../types';
import { AboutUsSection } from '../components/sections/AboutUsSection';

interface AboutUsPageProps {
  clinic: Clinic | null;
  doctorsPath: string;
  doctorsCount?: number;
}

export function AboutUsPage({ clinic, doctorsPath, doctorsCount }: AboutUsPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      <section className="bg-primary-950 bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 text-white text-center py-20">
        <div className="container-max px-4">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-full text-sm font-semibold mb-4">About Us</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">About {clinic?.name || 'Our Clinic'}</h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            {clinic?.tagline || 'Quality healthcare with a personal touch'}
          </p>
        </div>
      </section>
      <AboutUsSection clinic={clinic} doctorsPath={doctorsPath} doctorsCount={doctorsCount} />
    </div>
  );
}

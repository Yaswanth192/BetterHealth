import { Link } from 'react-router-dom';
import { Clinic } from '../types';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

interface AboutUsPageProps {
  clinic: Clinic | null;
  doctorsPath: string;
  doctorsCount?: number;
}

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, isIntersecting } = useIntersectionObserver();
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className={`transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export function AboutUsPage({ clinic, doctorsPath, doctorsCount }: AboutUsPageProps) {
  const stats = [
    { value: clinic?.years_of_service ? `${clinic.years_of_service}+` : '15+', label: 'Years of Service' },
    { value: doctorsCount || '12+', label: 'Expert Doctors' },
    { value: clinic?.patients_treated || '50,000+', label: 'Happy Patients' },
    { value: clinic?.google_rating ? `${clinic.google_rating}★` : '4.8★', label: 'Google Rating' },
  ];

  const values = [
    { icon: '🩺', title: 'Patient First', desc: 'Every decision we make starts with one question: what is best for our patients?' },
    { icon: '🔬', title: 'Evidence-Based', desc: 'We use the latest medical research and proven treatments for the best outcomes.' },
    { icon: '🤝', title: 'Compassionate Care', desc: 'Healthcare is personal. We treat every patient like family with warmth and respect.' },
    { icon: '⚡', title: 'Advanced Technology', desc: 'State-of-the-art equipment and modern facilities for accurate diagnosis and treatment.' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* Faint background image behind the overlay */}
        <img
          src={clinic?.about_hero_image_url || 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1920'}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          style={{ objectPosition: clinic?.about_hero_image_position ? `${clinic.about_hero_image_position.x}% ${clinic.about_hero_image_position.y}%` : undefined, transform: clinic?.about_hero_image_zoom && clinic.about_hero_image_zoom > 1 ? `scale(${clinic.about_hero_image_zoom})` : undefined, transformOrigin: clinic?.about_hero_image_position ? `${clinic.about_hero_image_position.x}% ${clinic.about_hero_image_position.y}%` : undefined }}
        />
        {/* Theme color overlay - makes image faintly visible */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-800 via-primary-700 to-teal-800" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Glassy decorative element */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hidden lg:block" />
        <div className="absolute bottom-20 left-10 w-40 h-40 bg-white/5 backdrop-blur-sm rounded-full border border-white/10 hidden lg:block" />

        <div className="relative container-max px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-md text-white/90 border border-white/20 rounded-full text-sm font-medium mb-6">
              About Us
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white mb-6 leading-tight">
              Trusted Healthcare<br />
              <span className="text-primary-300">{clinic?.founded_year ? `Since ${clinic.founded_year}` : 'Since 2015'}</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-lg">
              {clinic?.tagline || 'Quality healthcare with a personal touch — where every patient matters.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to={doctorsPath} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl">
                Meet Our Doctors
              </Link>
              <Link to="/appointment" className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section-padding">
        <div className="container-max">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <FadeIn>
              <div className="relative">
                <div className="rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={clinic?.about_image_url || 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt="Our Clinic"
                    className="w-full h-[420px] object-cover"
                    style={{ objectPosition: clinic?.about_image_position ? `${clinic.about_image_position.x}% ${clinic.about_image_position.y}%` : undefined, transform: clinic?.about_image_zoom && clinic.about_image_zoom > 1 ? `scale(${clinic.about_image_zoom})` : undefined, transformOrigin: clinic?.about_image_position ? `${clinic.about_image_position.x}% ${clinic.about_image_position.y}%` : undefined }}
                  />
                </div>
                {/* Glassy floating card */}
                <div className="absolute -bottom-6 -right-6 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-lg rounded-2xl p-5 shadow-xl border border-white/20 dark:border-neutral-700/50 hidden sm:block">
                  <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                    {clinic?.years_of_service || '15'}+
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">Years of Trust</div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div>
                <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
                  Our Story
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mb-6">
                  A Legacy of Caring
                </h2>
                <div className="space-y-4 text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  <p>
                    {clinic?.description || 'Founded with a mission to make quality healthcare accessible, our clinic has grown from a small practice to a trusted healthcare institution serving thousands of families.'}
                  </p>
                  <p>
                    Our team of experienced specialists across multiple departments delivers compassionate, evidence-based care using state-of-the-art equipment. We believe in treating the whole person, not just the symptoms.
                  </p>
                  <p>
                    Over the years, we have earned the trust of our community through consistent quality, transparent communication, and genuine concern for every patient who walks through our doors.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-16 bg-gradient-to-r from-primary-600 via-primary-500 to-teal-500">
        <div className="container-max px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <FadeIn key={stat.label} delay={i * 100}>
                <div className="text-center">
                  <div className="text-4xl sm:text-5xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-white/70 text-sm font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section-padding">
        <div className="container-max">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
                Purpose
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
                Mission & Vision
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn delay={100}>
              <div className="relative bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-950/40 dark:to-teal-950/40 rounded-2xl p-8 border border-primary-100 dark:border-primary-800/30 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-200/30 dark:bg-primary-700/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-primary-600/30">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Our Mission</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    To provide compassionate, evidence-based healthcare that is accessible to every family. We strive to combine medical excellence with genuine care, ensuring every patient receives personalized attention and the best possible treatment.
                  </p>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="relative bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-950/40 dark:to-emerald-950/40 rounded-2xl p-8 border border-teal-100 dark:border-teal-800/30 overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/30 dark:bg-teal-700/20 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-500" />
                <div className="relative">
                  <div className="w-14 h-14 bg-teal-600 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-teal-600/30">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-3">Our Vision</h3>
                  <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    To be the most trusted healthcare institution in our community — known for clinical excellence, innovation, and the warmth of our patient relationships. We envision a future where quality healthcare is a right, not a privilege.
                  </p>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Dermatology Services */}
      {clinic?.services_content && (
        <section className="section-padding bg-neutral-50 dark:bg-neutral-900">
          <div className="container-max">
            <FadeIn>
              <div className="relative rounded-3xl overflow-hidden mb-12 shadow-xl">
                <img
                  src={clinic.services_heading_image_url || 'https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=1920'}
                  alt="Dermatology Services"
                  className="w-full h-64 sm:h-80 object-cover"
                  style={{ objectPosition: clinic.services_heading_image_position ? `${clinic.services_heading_image_position.x}% ${clinic.services_heading_image_position.y}%` : undefined, transform: clinic.services_heading_image_zoom && clinic.services_heading_image_zoom > 1 ? `scale(${clinic.services_heading_image_zoom})` : undefined, transformOrigin: clinic.services_heading_image_position ? `${clinic.services_heading_image_position.x}% ${clinic.services_heading_image_position.y}%` : undefined }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 via-primary-800/60 to-teal-800/40 flex items-center justify-center">
                  <h2 className="text-3xl sm:text-5xl font-bold font-heading text-white text-center px-4">
                    {clinic.name || 'Jaahnavi Clinic'} — Our Services
                  </h2>
                </div>
              </div>
            </FadeIn>

            {/* Services Content */}
            <FadeIn delay={100}>
              <div className="prose prose-lg dark:prose-invert max-w-none">
                {clinic.services_content.split('\n\n').map((block, i) => {
                  const trimmed = block.trim();
                  if (!trimmed) return null;

                  // Handle ## headings
                  if (trimmed.startsWith('## ')) {
                    const headingText = trimmed.replace(/^##\s*/, '').replace(/\*\*/g, '');
                    return (
                      <h3 key={i} className="text-2xl font-bold font-heading text-neutral-900 dark:text-neutral-100 mt-10 mb-4">
                        {headingText.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </h3>
                    );
                  }

                  // Handle ### sub-headings
                  if (trimmed.startsWith('### ')) {
                    const subheadingText = trimmed.replace(/^###\s*/, '').replace(/\*\*/g, '');
                    return (
                      <h4 key={i} className="text-xl font-bold text-neutral-800 dark:text-neutral-200 mt-8 mb-3">
                        {subheadingText.replace(/\*\*(.*?)\*\*/g, '$1')}
                      </h4>
                    );
                  }

                  // Handle bullet lists
                  if (trimmed.startsWith('* ')) {
                    const items = trimmed.split('\n').filter(l => l.startsWith('* '));
                    return (
                      <ul key={i} className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 my-4">
                        {items.map((item, j) => (
                          <li key={j} className="flex items-start gap-2 text-neutral-600 dark:text-neutral-300 text-[15px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-2.5 flex-shrink-0" />
                            <span>{item.replace(/^\*\s*/, '').replace(/\*\*(.*?)\*\*/g, '$1')}</span>
                          </li>
                        ))}
                      </ul>
                    );
                  }

                  // Regular paragraph
                  return (
                    <p key={i} className="text-neutral-600 dark:text-neutral-300 leading-relaxed my-4 text-[15px]">
                      {trimmed.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>
                  );
                })}
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* Values */}
      <section className="section-padding bg-neutral-50 dark:bg-neutral-900">
        <div className="container-max">
          <FadeIn>
            <div className="text-center mb-14">
              <span className="inline-block px-4 py-1.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-semibold mb-4">
                What We Stand For
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-neutral-900 dark:text-neutral-100">
                Our Core Values
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 100}>
                <div className="bg-white dark:bg-neutral-800 rounded-2xl p-6 text-center border border-neutral-100 dark:border-neutral-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{v.icon}</div>
                  <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2">{v.title}</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{v.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-max">
          <FadeIn>
            <div className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-teal-500 rounded-3xl p-10 sm:p-14 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iLjA1Ij48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtMmgtNHY2aDJ2Mmg0di0yek0yMiAyNGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-50" />
              <div className="relative">
                <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-4">
                  Ready to Experience Better Healthcare?
                </h2>
                <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                  Join thousands of families who trust us with their health. Your well-being is our priority.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/appointment" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-primary-700 font-semibold rounded-xl hover:bg-white/90 transition-all duration-200 shadow-lg">
                    Book Appointment
                  </Link>
                  <Link to={doctorsPath} className="inline-flex items-center gap-2 px-8 py-3.5 bg-white/10 backdrop-blur-md text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200">
                    Meet Our Team
                  </Link>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}

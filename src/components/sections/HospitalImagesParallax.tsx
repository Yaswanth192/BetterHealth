import { useState, useEffect, useRef } from 'react';

interface HospitalImage {
  title: string;
  description: string;
  image_url: string;
}

interface HospitalImagesParallaxProps {
  images: HospitalImage[];
}

const fallbackImages: HospitalImage[] = [
  { title: 'Modern Reception', description: 'Our welcoming reception area designed for your comfort. Walk in and feel the difference from the moment you arrive.', image_url: 'https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Operation Theater', description: 'State-of-the-art surgical facilities with the latest technology for safe and precise procedures.', image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Patient Rooms', description: 'Comfortable, hygienic, and private rooms designed to make your recovery peaceful and relaxing.', image_url: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Diagnostic Lab', description: 'Advanced diagnostic laboratory with cutting-edge equipment for accurate and quick results.', image_url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1200' },
];

export function HospitalImagesParallax({ images }: HospitalImagesParallaxProps) {
  const displayImages = images.length > 0 ? images : fallbackImages;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrolled = -rect.top;
      const totalScrollable = sectionHeight - viewportHeight;

      if (scrolled >= 0 && totalScrollable > 0) {
        const progress = Math.min(scrolled / totalScrollable, 1);
        const idx = Math.min(
          Math.floor(progress * displayImages.length),
          displayImages.length - 1
        );
        setActiveIndex(idx);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayImages.length]);

  return (
    <section ref={sectionRef} className="relative bg-white dark:bg-neutral-900" style={{ height: `${displayImages.length * 100}vh` }}>
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6">
          {/* Left side - Text content */}
          <div className="w-[40%] hidden md:flex flex-col justify-between h-full">
            <div className="relative flex-1">
              {displayImages.map((img, i) => (
                <div
                  key={i}
                  className={`absolute inset-0 flex flex-col justify-center transition-all duration-500 ${
                    i === activeIndex
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8 pointer-events-none'
                  }`}
                >
                  <h3 className="text-3xl lg:text-4xl font-bold font-heading text-neutral-900 dark:text-white mb-4 leading-tight">
                    {img.title.split(' ').map((word, wi) => (
                      <span key={wi} className={wi === img.title.split(' ').length - 1 ? 'text-primary-600 dark:text-primary-400' : ''}>
                        {word}{' '}
                      </span>
                    ))}
                  </h3>
                  <div className="w-16 h-0.5 bg-primary-600 dark:bg-primary-400 mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm leading-relaxed max-w-sm">
                    {img.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress dots */}
            <div className="flex items-center gap-3 mt-8">
              {displayImages.map((_, i) => (
                <div
                  key={i}
                  className={`h-0.5 rounded-full transition-all duration-500 ${
                    i === activeIndex
                      ? 'w-10 bg-primary-600 dark:bg-primary-400'
                      : 'w-4 bg-neutral-300 dark:bg-white/20'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Right side - Images */}
          <div className="w-full md:w-[60%] h-full relative rounded-2xl overflow-hidden">
            {displayImages.map((img, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 ease-out ${
                  i === activeIndex
                    ? 'opacity-100 scale-100 z-10'
                    : i < activeIndex
                      ? 'opacity-0 scale-110 z-0'
                      : 'opacity-0 scale-95 z-0'
                }`}
              >
                <img
                  src={img.image_url}
                  alt={img.title}
                  className="w-full h-full object-cover"
                  style={{
                    objectPosition: img.image_position ? `${img.image_position.x}% ${img.image_position.y}%` : undefined,
                    transform: img.image_zoom && img.image_zoom > 1 ? `scale(${img.image_zoom})` : undefined,
                    transformOrigin: img.image_position ? `${img.image_position.x}% ${img.image_position.y}%` : undefined,
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* Mobile title overlay */}
                <div className="md:hidden absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-2xl font-bold font-heading text-white mb-2">{img.title}</h3>
                  <p className="text-white/70 text-sm">{img.description}</p>
                </div>
              </div>
            ))}

            {/* Image counter */}
            <div className="absolute top-4 right-4 z-20">
              <span className="text-white/50 text-sm font-mono bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full">
                {String(activeIndex + 1).padStart(2, '0')} / {String(displayImages.length).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

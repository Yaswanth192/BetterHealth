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
  { title: 'Modern Reception', description: 'Our welcoming reception area designed for comfort', image_url: 'https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Operation Theater', description: 'State-of-the-art surgical facilities', image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Patient Rooms', description: 'Comfortable and hygienic patient rooms', image_url: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Laboratory', description: 'Advanced diagnostic laboratory', image_url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Pharmacy', description: 'In-house pharmacy for all your medication needs', image_url: 'https://images.pexels.com/photos/5699516/pexels-photo-5699516.jpeg?auto=compress&cs=tinysrgb&w=1200' },
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
    return () => window.removeEventListener('scroll', handleScroll);
  }, [displayImages.length]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: `${displayImages.length * 100}vh` }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* Background images with parallax */}
        {displayImages.map((img, i) => {
          const isActive = i === activeIndex;
          const isPast = i < activeIndex;
          
          let translateY = '100%';
          let opacity = 0;
          let scale = 1;
          
          if (isActive) {
            translateY = '0%';
            opacity = 1;
            scale = 1;
          } else if (isPast) {
            translateY = '-100%';
            opacity = 0;
            scale = 1.1;
          } else {
            translateY = '100%';
            opacity = 0;
            scale = 0.9;
          }

          return (
            <div
              key={i}
              className="absolute inset-0 transition-all duration-700 ease-out"
              style={{
                transform: `translateY(${translateY}) scale(${scale})`,
                opacity,
              }}
            >
              <img
                src={img.image_url}
                alt={img.title}
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40" />
              
              {/* Content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`text-center px-4 max-w-3xl transition-all duration-700 ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                  <span className="inline-block px-4 py-1.5 bg-white/10 backdrop-blur-sm text-white/80 border border-white/20 rounded-full text-sm font-semibold mb-4">
                    Our Facility
                  </span>
                  <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold font-heading text-white mb-4">
                    {img.title}
                  </h2>
                  <p className="text-white/70 text-lg sm:text-xl max-w-xl mx-auto">
                    {img.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Progress bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 z-10">
          {displayImages.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === activeIndex
                  ? 'w-12 bg-primary-400'
                  : i < activeIndex
                    ? 'w-6 bg-white/50'
                    : 'w-6 bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Image counter */}
        <div className="absolute bottom-8 right-8 z-10">
          <span className="text-white/50 text-sm font-mono">
            {String(activeIndex + 1).padStart(2, '0')} / {String(displayImages.length).padStart(2, '0')}
          </span>
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface HospitalImage {
  title: string;
  description: string;
  image_url: string;
}

interface HospitalImagesCarouselProps {
  images: HospitalImage[];
}

const fallbackImages: HospitalImage[] = [
  { title: 'Modern Reception', description: 'Our welcoming reception area designed for comfort', image_url: 'https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { title: 'Operation Theater', description: 'State-of-the-art surgical facilities', image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { title: 'Patient Rooms', description: 'Comfortable and hygienic patient rooms', image_url: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { title: 'Laboratory', description: 'Advanced diagnostic laboratory', image_url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { title: 'Pharmacy', description: 'In-house pharmacy for all your medication needs', image_url: 'https://images.pexels.com/photos/5699516/pexels-photo-5699516.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

export function HospitalImagesCarousel({ images }: HospitalImagesCarouselProps) {
  const { ref, isIntersecting } = useIntersectionObserver();
  const displayImages = images.length > 0 ? images : fallbackImages;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<'next' | 'prev'>('next');
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = displayImages.length;

  const goTo = useCallback((idx: number, dir: 'next' | 'prev') => {
    if (isFlipping) return;
    setFlipDirection(dir);
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentIndex(idx);
      setTimeout(() => setIsFlipping(false), 600);
    }, 300);
  }, [isFlipping]);

  const next = useCallback(() => {
    goTo((currentIndex + 1) % total, 'next');
  }, [currentIndex, total, goTo]);

  const prev = useCallback(() => {
    goTo((currentIndex - 1 + total) % total, 'prev');
  }, [currentIndex, total, goTo]);

  useEffect(() => {
    if (isIntersecting) {
      autoPlayRef.current = setInterval(next, 4000);
    }
    return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
  }, [isIntersecting, next]);

  const current = displayImages[currentIndex];
  const nextIdx = (currentIndex + 1) % total;
  const prevIdx = (currentIndex - 1 + total) % total;

  return (
    <section className="section-padding bg-neutral-900 dark:bg-neutral-950 overflow-hidden">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        {/* Header */}
        <div className={`text-center mb-12 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-900/30 text-primary-300 rounded-full text-sm font-semibold mb-4">
            Our Facility
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white">
            Take a Tour of Our Hospital
          </h2>
          <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
            Explore our world-class facilities designed for your comfort and care
          </p>
        </div>

        {/* 3D Book Carousel */}
        <div className={`relative max-w-4xl mx-auto transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ perspective: '1200px' }}>
          <div className="relative h-[400px] sm:h-[450px] md:h-[500px]">
            {/* Book container */}
            <div className="relative w-full h-full" style={{ transformStyle: 'preserve-3d' }}>
              {/* Previous card (left page) */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  transform: isFlipping && flipDirection === 'prev'
                    ? 'rotateY(-90deg) translateZ(50px)'
                    : 'rotateY(0deg) translateZ(0px)',
                  transformOrigin: 'right center',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 0.3,
                  clipPath: 'inset(0 50% 0 0)',
                }}
              >
                <img
                  src={displayImages[prevIdx].image_url}
                  alt={displayImages[prevIdx].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/60" />
              </div>

              {/* Current card (active page) */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  transform: isFlipping
                    ? flipDirection === 'next'
                      ? 'rotateY(90deg) translateZ(50px) scale(0.95)'
                      : 'rotateY(-90deg) translateZ(50px) scale(0.95)'
                    : 'rotateY(0deg) translateZ(0px) scale(1)',
                  transformOrigin: flipDirection === 'next' ? 'left center' : 'right center',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  backfaceVisibility: 'hidden',
                }}
              >
                <img
                  src={current.image_url}
                  alt={current.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">{current.title}</h3>
                  <p className="text-white/70 text-sm sm:text-base">{current.description}</p>
                </div>
              </div>

              {/* Next card (right page peek) */}
              <div
                className="absolute inset-0 rounded-2xl overflow-hidden"
                style={{
                  transform: isFlipping && flipDirection === 'next'
                    ? 'rotateY(90deg) translateZ(50px)'
                    : 'rotateY(0deg) translateZ(0px)',
                  transformOrigin: 'left center',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  opacity: 0.3,
                  clipPath: 'inset(0 0 0 50%)',
                }}
              >
                <img
                  src={displayImages[nextIdx].image_url}
                  alt={displayImages[nextIdx].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/60" />
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prev}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all z-10"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {displayImages.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i, i > currentIndex ? 'next' : 'prev')}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'bg-primary-400 w-8'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

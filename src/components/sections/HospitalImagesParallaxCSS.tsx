interface HospitalImage {
  title: string;
  description: string;
  image_url: string;
}

interface HospitalImagesParallaxCSSProps {
  images: HospitalImage[];
}

const fallbackImages: HospitalImage[] = [
  { title: 'Modern Reception', description: 'Our welcoming reception area designed for your comfort.', image_url: 'https://images.pexels.com/photos/263337/pexels-photo-263337.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Operation Theater', description: 'State-of-the-art surgical facilities with the latest technology.', image_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Patient Rooms', description: 'Comfortable, hygienic, and private rooms for your recovery.', image_url: 'https://images.pexels.com/photos/263402/pexels-photo-263402.jpeg?auto=compress&cs=tinysrgb&w=1200' },
  { title: 'Diagnostic Lab', description: 'Advanced diagnostic laboratory for accurate and quick results.', image_url: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=1200' },
];

export function HospitalImagesParallaxCSS({ images }: HospitalImagesParallaxCSSProps) {
  const displayImages = images.length > 0 ? images : fallbackImages;

  return (
    <div className="relative">
      {displayImages.map((img, i) => (
        <div
          key={i}
          className="sticky top-0 h-screen flex items-center justify-center overflow-hidden"
        >
          {/* Background image */}
          <img
            src={img.image_url}
            alt={img.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: img.image_position ? `${img.image_position.x}% ${img.image_position.y}%` : undefined,
              transform: img.image_zoom && img.image_zoom > 1 ? `scale(${img.image_zoom})` : undefined,
              transformOrigin: img.image_position ? `${img.image_position.x}% ${img.image_position.y}%` : undefined,
            }}
          />
          {/* Shadow overlay */}
          <div className="absolute inset-0 bg-black/50" />
          {/* Content */}
          <div className="relative z-10 text-center px-6 max-w-xl">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-white mb-3 drop-shadow-lg">
              {img.title}
            </h2>
            <p className="text-white/70 text-sm sm:text-base drop-shadow-md">
              {img.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

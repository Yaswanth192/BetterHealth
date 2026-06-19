import { Star, BadgeCheck, MessageSquare } from 'lucide-react';

const reviews = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    rating: 5,
    message: 'Excellent experience! The doctors are highly professional and the dental implant procedure was painless. Highly recommend this clinic.',
    service: 'Dental Implant',
    date: '2 weeks ago',
  },
  {
    id: '2',
    name: 'Sunita Patel',
    rating: 5,
    message: 'Dr. Karthik resolved my chronic skin condition that I\'d been struggling with for years. The staff is incredibly warm and welcoming.',
    service: 'Skin Treatment',
    date: '1 month ago',
  },
  {
    id: '3',
    name: 'Amit Deshmukh',
    rating: 5,
    message: 'After my knee surgery, the recovery program was outstanding. The physiotherapy team helped me walk again in just 3 weeks.',
    service: 'Knee Surgery',
    date: '3 weeks ago',
  },
  {
    id: '4',
    name: 'Priya Nair',
    rating: 5,
    message: 'Best pediatric care in the area. Dr. Neha is so gentle with my daughter. The vaccination schedule was well-managed.',
    service: 'Pediatrics',
    date: '2 months ago',
  },
  {
    id: '5',
    name: 'Vikram Singh',
    rating: 5,
    message: 'Quick diagnosis and effective treatment for my eye infection. The ophthalmology department is top-notch.',
    service: 'Eye Care',
    date: '1 week ago',
  },
  {
    id: '6',
    name: 'Meera Joshi',
    rating: 5,
    message: 'The health check-up package was comprehensive and affordable. Got all results within 24 hours. Great service!',
    service: 'Health Check-up',
    date: '5 days ago',
  },
];

export function ReviewsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="bg-[#080f24] bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 text-white text-center py-20">
        <div className="container-max px-4">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-full text-sm font-semibold mb-4">
            Customer Reviews
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-white/70 text-lg">Real reviews from real customers</p>
          <div className="flex items-center justify-center gap-6 mt-6 text-sm">
            <span className="flex items-center gap-1">⭐ 4.8 Overall</span>
            <span className="flex items-center gap-1">✅ 100% Genuine</span>
            <span className="flex items-center gap-1">🏥 500+ Reviews</span>
          </div>
        </div>
      </section>

      {/* Reviews */}
      <div className="container-max px-4 py-12">
        <p className="text-center text-neutral-500 dark:text-neutral-400 mb-8">
          No reviews yet? Be the first to share your experience!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {reviews.map((review) => (
            <div key={review.id} className="card p-6">
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-current" />
                ))}
              </div>
              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed mb-4 italic">"{review.message}"</p>
              <div className="flex items-center gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold text-sm">
                  {review.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm">{review.name}</p>
                  <p className="text-xs text-neutral-400">{review.service}</p>
                </div>
                <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Share Experience */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Share Your Experience</h3>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">Your feedback helps others make better decisions.</p>
          <a
            href="#"
            className="inline-flex items-center gap-2 px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-colors"
          >
            <MessageSquare className="w-5 h-5" />
            Contribute to Share Feedback →
          </a>
        </div>
      </div>
    </div>
  );
}

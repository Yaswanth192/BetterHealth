import { Clock, ArrowRight } from 'lucide-react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  author: string;
  date: string;
}

const fallbackPosts: BlogPost[] = [
  {
    id: '1',
    title: '5 Tips for a Healthy Heart',
    excerpt: 'Simple daily habits that can significantly reduce your risk of heart disease and improve cardiovascular health.',
    category: 'Cardiology',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
    readTime: '5 min read',
    author: 'Dr. Sharma',
    date: '7 Jan 2026',
  },
  {
    id: '2',
    title: 'When to See a Dermatologist',
    excerpt: 'Common signs that indicate you should book a consultation with a skin specialist.',
    category: 'Skin Care',
    image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=600',
    readTime: '4 min read',
    author: 'Dr. Patel',
    date: '5 Jan 2026',
  },
  {
    id: '3',
    title: "Children's Vaccination Guide 2025",
    excerpt: 'Complete vaccination schedule for children from birth to 16 years as per IAP guidelines.',
    category: 'Pediatrics',
    image: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=600',
    readTime: '6 min read',
    author: 'Dr. Gupta',
    date: '3 Jan 2026',
  },
];

export function BlogSection() {
  const { ref, isIntersecting } = useIntersectionObserver();

  return (
    <section className="section-padding bg-neutral-50">
      <div className="container-max" ref={ref as React.RefObject<HTMLDivElement>}>
        <div className={`text-center mb-14 transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block px-4 py-1.5 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold mb-4">
            Health Tips
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Stay Informed, Stay Healthy
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {fallbackPosts.map((post, i) => (
            <div
              key={post.id}
              className={`card overflow-hidden group transition-all duration-700 ${isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">
                  {post.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-neutral-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                </div>
                <h3 className="font-bold text-neutral-900 mb-2 group-hover:text-primary-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-sm text-neutral-500 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-400">By {post.author} · {post.date}</span>
                  <ArrowRight className="w-4 h-4 text-primary-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

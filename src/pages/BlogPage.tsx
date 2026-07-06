import { useState } from 'react';
import { Clock, User } from 'lucide-react';
import { BlogPost as BlogPostType } from '../types';

interface BlogPageProps {
  posts?: BlogPostType[];
}

interface DisplayPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  image_position: { x: number; y: number } | null;
  image_zoom: number | null;
  readTime: string;
  author: string;
  date: string;
}

const fallbackPosts: DisplayPost[] = [
  {
    id: '1',
    title: 'Understanding Seasonal Allergies in India',
    excerpt: 'All allergies spike during certain months and how to manage them effectively.',
    category: 'Health Tips',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '5 min read',
    author: 'Dr. Sharma',
    date: '7 Jan 2026',
  },
  {
    id: '2',
    title: 'When Should You Visit a General Physician?',
    excerpt: "Don't wait for a week — these signs mean it's time to see a doctor.",
    category: 'Wellness',
    image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '4 min read',
    author: 'Dr. Patel',
    date: '5 Jan 2026',
  },
  {
    id: '3',
    title: 'Diabetes Prevention: Simple Lifestyle Changes',
    excerpt: 'India is the diabetes capital of the world. Here are 5 small daily changes that can reduc...',
    category: 'Health Tips',
    image: 'https://images.pexels.com/photos/6823568/pexels-photo-6823568.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '6 min read',
    author: 'Dr. Gupta',
    date: '3 Jan 2026',
  },
  {
    id: '4',
    title: "Childhood Vaccination Schedule: A Parent's Guide",
    excerpt: 'A comprehensive, easy-to-understand guide to the Indian immunization schedule.',
    category: 'Pediatrics',
    image: 'https://images.pexels.com/photos/8376201/pexels-photo-8376201.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '7 min read',
    author: 'Dr. Mehta',
    date: '2 Jan 2026',
  },
  {
    id: '5',
    title: 'Managing Workplace Stress: A Medical Perspective',
    excerpt: 'Chronic stress isnt just uncomfortable — its a medical condition with real health risks.',
    category: 'Wellness',
    image: 'https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '5 min read',
    author: 'Dr. Patel',
    date: '30 Dec 2025',
  },
  {
    id: '6',
    title: 'Monsoon Health Precautions You Must Take',
    excerpt: 'Dengue, malaria, food poisoning — the monsoon brings specific health risks. Heres a...',
    category: 'Seasonal Health',
    image: 'https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '4 min read',
    author: 'Dr. Sharma',
    date: '28 Dec 2025',
  },
  {
    id: '7',
    title: 'Blood Pressure: The Silent Killer Explained',
    excerpt: 'Most people show no symptoms. Understanding it could save your life.',
    category: 'Heart Health',
    image: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '5 min read',
    author: 'Dr. Patel',
    date: '25 Dec 2025',
  },
  {
    id: '8',
    title: 'Why Regular Health Checkups Are Non-Negotiable',
    excerpt: 'Most chronic diseases are preventable — or catchable early — when youre checked and scanned to treat.',
    category: 'Wellness',
    image: 'https://images.pexels.com/photos/7659564/pexels-photo-7659564.jpeg?auto=compress&cs=tinysrgb&w=600',
    image_position: null,
    image_zoom: null,
    readTime: '4 min read',
    author: 'Dr. Mehta',
    date: '22 Dec 2025',
  },
];

export function BlogPage({ posts = [] }: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState('All');

  const allPosts: DisplayPost[] = posts.length > 0
    ? posts.map(p => ({
        id: p.id,
        title: p.title,
        excerpt: p.excerpt,
        category: p.category,
        image: p.image_url || 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=600',
        image_position: p.image_position ?? null,
        image_zoom: p.image_zoom ?? null,
        readTime: p.read_time,
        author: p.author,
        date: p.publish_date,
      }))
    : fallbackPosts;

  const categories = ['All', ...new Set(allPosts.map(p => p.category))];
  const filtered = activeCategory === 'All' ? allPosts : allPosts.filter(p => p.category === activeCategory);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Hero */}
      <section className="bg-primary-950 bg-gradient-to-br from-primary-900 via-primary-800 to-teal-900 text-white text-center py-20">
        <div className="container-max px-4">
          <span className="inline-block px-4 py-1.5 bg-white/10 text-white/80 border border-white/20 rounded-full text-sm font-semibold mb-4">Blog</span>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Blog</h1>
          <p className="text-white/70 text-lg">Latest news, tips, and insights</p>
        </div>
      </section>

      {/* Filters */}
      <div className="container-max px-4 py-8">
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? 'bg-primary-600 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-primary-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((post) => (
            <div key={post.id} className="card overflow-hidden group">
              <div className="relative h-48 overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" style={{
                  objectPosition: post.image_position ? `${post.image_position.x}% ${post.image_position.y}%` : undefined,
                  transform: post.image_zoom && post.image_zoom > 1 ? `scale(${post.image_zoom})` : undefined,
                  transformOrigin: post.image_position ? `${post.image_position.x}% ${post.image_position.y}%` : undefined,
                }} />
                <span className="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full">{post.category}</span>
                <span className="absolute top-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readTime}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-neutral-900 dark:text-neutral-100 mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">{post.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="flex items-center justify-between text-xs text-neutral-400">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {post.author}</span>
                  <span>{post.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

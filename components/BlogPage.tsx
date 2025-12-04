
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { dataManager } from '../services/dataManager';
import { BlogPost } from '../types';
import { Calendar, User, ArrowRight, Loader } from 'lucide-react';

interface BlogPageProps {
  onSelectPost: (postId: string) => void;
}

const BlogPage: React.FC<BlogPageProps> = ({ onSelectPost }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Все');
  const [loading, setLoading] = useState(true);
  
  // Pagination State
  const [page, setPage] = useState(1);
  const POSTS_PER_PAGE = 6;
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    window.scrollTo(0, 0);
    const loadData = async () => {
        setLoading(true);
        const allPosts = await dataManager.getBlogPosts();
        const cats = await dataManager.getCategories();
        setPosts(allPosts);
        setCategories(['Все', ...cats]);
        setLoading(false);
    };
    loadData();
  }, []);

  // Filter Posts
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'Все') return posts;
    return posts.filter(p => p.category === selectedCategory);
  }, [selectedCategory, posts]);

  // Visible Posts
  const visiblePosts = useMemo(() => {
    return filteredPosts.slice(0, page * POSTS_PER_PAGE);
  }, [filteredPosts, page]);

  const hasMore = visiblePosts.length < filteredPosts.length;

  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setTimeout(() => {
             setPage(prev => prev + 1);
          }, 500);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => { if (observerTarget.current) observer.unobserve(observerTarget.current); };
  }, [hasMore]);

  if (loading) return <div className="min-h-screen pt-20 flex justify-center items-center"><Loader className="animate-spin text-brand-orange" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in pb-24">
      <section className="py-16 md:py-24 text-center container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
          Блог <span className="text-gradient">Valstand</span>
        </h1>
      </section>

      <div className="container mx-auto px-4 mb-12">
        <div className="flex flex-wrap justify-center gap-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-brand-orange text-white shadow-lg shadow-orange-500/30'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-brand-orange/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visiblePosts.map((post) => (
            <div 
              key={post.id} 
              onClick={() => onSelectPost(post.id)}
              className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
            >
              <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                <img 
                  src={post.image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-white/90 backdrop-blur-sm text-slate-900 font-bold rounded-full text-xs uppercase tracking-wider shadow-sm">
                  {post.category}
                </div>
              </div>
              
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-orange transition-colors">
                  {post.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-brand-orange font-semibold text-sm">
                  <span>Читать статью</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div ref={observerTarget} className="py-12 flex justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
                <Loader className="animate-spin text-brand-orange" size={32} />
                <span className="text-sm font-medium">Загружаем еще...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;

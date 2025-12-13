
import React, { useEffect, useState } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { BlogPost } from '../types';
import ScrollReveal from './ScrollReveal';

interface BlogPreviewProps {
  onSelectPost: (postId: string) => void;
  onViewAll: () => void;
  initialPosts?: BlogPost[];
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ onSelectPost, onViewAll, initialPosts }) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts ? initialPosts.slice(0, 3) : []);

  useEffect(() => {
    if (initialPosts && initialPosts.length > 0) {
        setPosts(initialPosts.slice(0, 3));
        return;
    }
    const load = async () => {
        const allPosts = await dataManager.getBlogPosts();
        setPosts(allPosts.slice(0, 3));
    };
    load();
  }, [initialPosts]);

  if (posts.length === 0) return null;

  return (
    <section className="py-24 bg-white border-t border-slate-100">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
                Последнее в <span className="text-gradient">Блоге</span>
              </h2>
            </div>
            <button 
              onClick={onViewAll}
              className="flex items-center gap-2 text-brand-orange font-bold hover:text-orange-700 transition-colors"
            >
              Читать все статьи
              <ArrowRight size={20} />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <ScrollReveal key={post.id} delay={index * 100}>
              <div 
                onClick={() => onSelectPost(post.id)}
                className="group cursor-pointer flex flex-col h-full"
              >
                <div className="rounded-2xl overflow-hidden mb-6 relative h-64 shadow-md">
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

                <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-orange transition-colors leading-tight">
                  {post.title}
                </h3>
                
                <p className="text-slate-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <span className="mt-auto text-brand-orange font-semibold text-sm flex items-center gap-2 group-hover:translate-x-1 transition-transform w-fit">
                  Читать
                  <ArrowRight size={16} />
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogPreview;

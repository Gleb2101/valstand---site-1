
import React, { useEffect, useState } from 'react';
import { BlogPost } from '../types';
import { ArrowLeft, Calendar, User, Share2, Check } from 'lucide-react';
import ContactForm from './ContactForm';

interface BlogPostProps {
  post: BlogPost;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const BlogPostView: React.FC<BlogPostProps> = ({ post, onBack, onNavigate }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [post]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        alert('Не удалось скопировать ссылку');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-brand-orange transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          Назад в блог
        </button>
      </div>

      <article>
        {/* Header */}
        <div className="container mx-auto px-4 mb-8">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block px-4 py-1.5 bg-brand-yellow/20 text-brand-dark font-bold rounded-full text-sm uppercase tracking-wider mb-6">
              {post.category}
            </span>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-8 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-sm text-slate-500 border-y border-slate-200 py-4">
              <div className="flex items-center gap-2">
                <Calendar size={16} />
                <span>{new Date(post.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} />
                <span>{post.author}</span>
              </div>
              <button 
                onClick={handleShare} 
                className="flex items-center gap-2 hover:text-brand-orange transition-colors"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                <span className="hidden sm:inline">
                  {copied ? 'Ссылка скопирована' : 'Поделиться'}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="container mx-auto px-4 mb-12">
          <div className="max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-xl h-[400px] md:h-[600px] relative">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto px-4 mb-20">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-100">
             <div 
               className="prose prose-lg prose-slate max-w-none 
                 prose-headings:font-bold prose-headings:text-slate-900 
                 prose-a:text-brand-orange prose-img:rounded-xl
                 prose-blockquote:border-l-brand-orange prose-blockquote:bg-slate-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
               "
               dangerouslySetInnerHTML={{ __html: post.content }}
             />
          </div>
        </div>
      </article>

      {/* CTA */}
      <div className="bg-gradient-to-t from-slate-100 to-white">
        <ContactForm selectedService="Консультация (Блог)" onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default BlogPostView;

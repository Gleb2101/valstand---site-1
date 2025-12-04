
import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { Testimonial } from '../types';

const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);

  useEffect(() => {
    dataManager.getTestimonials().then(setReviews);
  }, []);

  if (reviews.length === 0) return null;

  return (
    <section id="testimonials" className="bg-slate-50 py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center text-slate-900">
          Что говорят <span className="text-gradient">Клиенты</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((t) => (
            <div key={t.id} className="glass-panel p-8 rounded-2xl relative border-t border-white hover:shadow-xl transition-shadow">
              <Quote className="absolute top-6 right-6 text-brand-orange/10" size={48} />
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-14 h-14 rounded-full border-2 border-brand-orange/20 object-cover"
                />
                <div>
                  <h4 className="font-bold text-slate-900">{t.name}</h4>
                  <p className="text-xs text-brand-orange uppercase tracking-wide">{t.role}</p>
                  <p className="text-xs text-slate-500">{t.company}</p>
                </div>
              </div>

              <p className="text-slate-600 italic leading-relaxed">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

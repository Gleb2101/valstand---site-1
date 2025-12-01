
import React, { useState, useEffect } from 'react';
import { Quote } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { Testimonial } from '../types';

interface TestimonialsProps {
  isPage?: boolean;
}

const Testimonials: React.FC<TestimonialsProps> = ({ isPage = false }) => {
  const [reviews, setReviews] = useState<Testimonial[]>([]);

  useEffect(() => {
    setReviews(dataManager.getTestimonials());
  }, []);

  return (
    <section id="testimonials" className={`bg-brand-dark ${isPage ? 'py-12 pb-20' : 'py-24'}`}>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold mb-16 text-center">
          {isPage ? 'Все' : 'Что говорят'} <span className="text-gradient">Клиенты</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {reviews.map((t) => (
            <div key={t.id} className="glass-panel p-8 rounded-2xl relative border-t border-white/5">
              <Quote className="absolute top-6 right-6 text-brand-yellow/20" size={48} />
              
              <div className="flex items-center gap-4 mb-6">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-14 h-14 rounded-full border-2 border-brand-orange/50 object-cover"
                />
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-brand-yellow uppercase tracking-wide">{t.role}</p>
                  <p className="text-xs text-gray-500">{t.company}</p>
                </div>
              </div>

              <p className="text-gray-300 italic leading-relaxed">
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

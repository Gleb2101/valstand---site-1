import React, { useEffect } from 'react';
import { ArrowLeft, Target, Lightbulb, TrendingUp, CheckCircle } from 'lucide-react';
import { CaseStudy } from '../types';
import ContactForm from './ContactForm';

interface CaseDetailProps {
  caseStudy: CaseStudy;
  onBack: () => void;
  onOrder: () => void;
}

const CaseDetail: React.FC<CaseDetailProps> = ({ caseStudy, onBack, onOrder }) => {
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark pt-20 animate-fade-in text-white">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-brand-yellow transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          Назад к кейсам
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-brand-dark via-brand-dark/50 to-transparent z-10"></div>
        <img 
          src={caseStudy.image} 
          alt={caseStudy.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-12">
          <span className="inline-block px-3 py-1 bg-brand-yellow text-brand-dark font-bold rounded-full text-sm uppercase tracking-wider mb-4">
            {caseStudy.category}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight">
            {caseStudy.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Left Column: Stats & Client Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-panel p-6 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4 border-b border-white/10 pb-2">Результаты</h3>
              <div className="space-y-6">
                {caseStudy.results.map((res, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-brand-yellow">{res.value}</p>
                    <p className="text-sm text-gray-400 uppercase tracking-wide">{res.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/5">
              <h3 className="text-lg font-bold text-white mb-2">О клиенте</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {caseStudy.clientInfo || caseStudy.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                 {caseStudy.tags.map(tag => (
                   <span key={tag} className="text-xs bg-black/30 px-2 py-1 rounded text-gray-400">#{tag}</span>
                 ))}
              </div>
            </div>
          </div>

          {/* Right Column: Story */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Challenge */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Задача и Проблема</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {caseStudy.challenge || "Описание задачи отсутствует."}
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Наше Решение</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {caseStudy.solution || "Описание решения отсутствует."}
                </div>
              </div>
            </div>

            {/* Results Description */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">Итоги</h3>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {caseStudy.fullDescription || caseStudy.description}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-gradient-to-b from-brand-dark to-black py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6">Готовы повторить этот успех в вашем бизнесе?</h2>
            <button 
                onClick={onOrder}
                className="px-8 py-4 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-brand-orange transition-colors text-lg"
            >
                Обсудить стратегию
            </button>
        </div>
      </section>
    </div>
  );
};

export default CaseDetail;
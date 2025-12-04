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
    <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in text-slate-900">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-brand-orange transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          Назад к кейсам
        </button>
      </div>

      {/* Hero */}
      <div className="relative h-[400px] md:h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-900/50 to-transparent z-10"></div>
        <img 
          src={caseStudy.image} 
          alt={caseStudy.title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-12">
          <span className="inline-block px-3 py-1 bg-white text-slate-900 font-bold rounded-full text-sm uppercase tracking-wider mb-4 shadow-md">
            {caseStudy.category}
          </span>
          <h1 className="text-4xl md:text-6xl font-bold max-w-4xl leading-tight text-white drop-shadow-md">
            {caseStudy.title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Left Column: Stats & Client Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-panel p-6 rounded-2xl border border-slate-200 bg-white shadow-lg">
              <h3 className="text-xl font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Результаты</h3>
              <div className="space-y-6">
                {caseStudy.results.map((res, i) => (
                  <div key={i}>
                    <p className="text-3xl font-bold text-brand-orange">{res.value}</p>
                    <p className="text-sm text-slate-500 uppercase tracking-wide">{res.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-2">О клиенте</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {caseStudy.clientInfo || caseStudy.description}
              </p>
              <div className="flex flex-wrap gap-2 mt-4">
                 {caseStudy.tags.map(tag => (
                   <span key={tag} className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">#{tag}</span>
                 ))}
              </div>
            </div>
          </div>

          {/* Right Column: Story */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Challenge */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                <Target size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Задача и Проблема</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {caseStudy.challenge || "Описание задачи отсутствует."}
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200">
                <Lightbulb size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Наше Решение</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {caseStudy.solution || "Описание решения отсутствует."}
                </div>
              </div>
            </div>

            {/* Results Description */}
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 border border-green-200">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Итоги</h3>
                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {caseStudy.fullDescription || caseStudy.description}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA */}
      <section className="bg-gradient-to-b from-slate-50 to-slate-100 py-12 border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-4xl text-center">
            <h2 className="text-3xl font-bold mb-6 text-slate-900">Готовы повторить этот успех в вашем бизнесе?</h2>
            <button 
                onClick={onOrder}
                className="px-8 py-4 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-brand-orange transition-colors text-lg shadow-lg hover:shadow-orange-500/20"
            >
                Обсудить стратегию
            </button>
        </div>
      </section>
    </div>
  );
};

export default CaseDetail;
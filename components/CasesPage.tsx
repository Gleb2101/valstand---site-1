
import React, { useState, useEffect } from 'react';
import { dataManager } from '../services/dataManager';
import { CaseStudy } from '../types';
import { TrendingUp, ArrowRight, Loader } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface CasesPageProps {
  onOrder: () => void;
  isHomePreview?: boolean;
  onViewAll?: () => void;
  onSelectCase?: (caseId: string) => void;
  initialCases?: CaseStudy[];
}

const CasesPage: React.FC<CasesPageProps> = ({ onOrder, isHomePreview = false, onViewAll, onSelectCase, initialCases }) => {
  const [cases, setCases] = useState<CaseStudy[]>(initialCases || []);
  const [loading, setLoading] = useState(!initialCases || initialCases.length === 0);

  useEffect(() => {
    // Only fetch if we don't have data already
    if (initialCases && initialCases.length > 0) {
        setCases(initialCases);
        setLoading(false);
        return;
    }

    const loadData = async () => {
      try {
        const data = await dataManager.getCases();
        setCases(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [initialCases]);

  const displayCases = isHomePreview ? cases.slice(0, 3) : cases;

  if (loading && !isHomePreview) {
    return <div className="min-h-screen pt-20 flex justify-center items-center"><Loader className="animate-spin text-brand-orange" /></div>;
  }
  
  if (isHomePreview && cases.length === 0 && !loading) return null;

  return (
    <div className={`bg-slate-50 ${isHomePreview ? 'py-12' : 'min-h-screen pt-20 pb-24 animate-fade-in'}`}>
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className={`text-center ${isHomePreview ? 'mb-12' : 'mb-16 pt-12'}`}>
            <h2 className={`${isHomePreview ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl'} font-bold mb-6 text-slate-900`}>
              {isHomePreview ? 'Последние' : 'Наши'} <span className="text-gradient">Кейсы</span>
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto text-lg">
              Реальные цифры и результаты.
            </p>
          </div>
        </ScrollReveal>

        {cases.length > 0 ? (
          <div className="grid gap-12">
            {displayCases.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 100}>
                <div 
                  onClick={() => onSelectCase && onSelectCase(item.id)}
                  className={`flex flex-col md:flex-row gap-8 items-center glass-panel p-6 md:p-8 rounded-3xl hover:border-brand-orange/30 transition-all cursor-pointer group/card ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
                >
                  <div className="w-full md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden relative group shadow-md">
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors z-10"></div>
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-white/90 text-slate-900 font-bold rounded-full text-xs uppercase tracking-wider shadow-sm">
                      {item.category}
                    </div>
                  </div>

                  <div className="w-full md:w-1/2 space-y-6">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 group-hover/card:text-brand-orange transition-colors">{item.title}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags?.map(tag => (
                          <span key={tag} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded border border-slate-200">
                            #{tag}
                          </span>
                        )) || null}
                      </div>
                      <p className="text-slate-600 leading-relaxed line-clamp-3">
                        {item.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 border-y border-slate-200 py-6">
                      {item.results?.map((res, i) => (
                        <div key={i} className="text-center md:text-left">
                          <p className="text-brand-orange font-bold text-xl md:text-2xl">{res.value}</p>
                          <p className="text-xs text-slate-500 uppercase mt-1">{res.label}</p>
                        </div>
                      )) || null}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if(onSelectCase) onSelectCase(item.id);
                      }}
                      className="w-full md:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-900 border border-slate-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group hover:border-brand-orange/50 shadow-sm"
                    >
                      Читать подробнее
                      <ArrowRight className="group-hover:text-brand-orange transition-colors" size={18} />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
             <p className="text-slate-400">В данный момент кейсы загружаются или добавляются администратором.</p>
          </div>
        )}

        {!isHomePreview && (
            <ScrollReveal delay={200} className="mt-20 text-center">
                <div className="inline-block p-8 rounded-3xl bg-white border border-slate-200 shadow-xl max-w-3xl">
                    <TrendingUp className="w-12 h-12 text-brand-orange mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Ваш бизнес может быть следующим</h3>
                    <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrder();
                        }}
                        className="px-8 py-3 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-brand-orange transition-colors shadow-lg hover:shadow-orange-500/20"
                    >
                        Обсудить проект
                    </button>
                </div>
            </ScrollReveal>
        )}

        {isHomePreview && onViewAll && cases.length > 0 && (
          <ScrollReveal delay={100} className="mt-12 text-center">
            <button
               onClick={onViewAll}
               className="inline-flex items-center gap-2 text-brand-orange font-bold hover:text-orange-700 transition-colors"
            >
              Смотреть все кейсы
              <ArrowRight size={20} />
            </button>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
};

export default CasesPage;

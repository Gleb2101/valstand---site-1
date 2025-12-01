
import React, { useState, useEffect } from 'react';
import { dataManager } from '../services/dataManager';
import { CaseStudy } from '../types';
import { ArrowUpRight, TrendingUp, ArrowRight } from 'lucide-react';

interface CasesPageProps {
  onOrder: () => void;
  isHomePreview?: boolean;
  onViewAll?: () => void;
  onSelectCase?: (caseId: string) => void;
}

const CasesPage: React.FC<CasesPageProps> = ({ onOrder, isHomePreview = false, onViewAll, onSelectCase }) => {
  const [cases, setCases] = useState<CaseStudy[]>([]);

  useEffect(() => {
    // Load from data manager
    setCases(dataManager.getCases());
  }, []);

  const displayCases = isHomePreview ? cases.slice(0, 3) : cases;

  return (
    <div className={`bg-brand-dark ${isHomePreview ? 'py-12' : 'min-h-screen pt-20 pb-24 animate-fade-in'}`}>
      <div className="container mx-auto px-4">
        <div className={`text-center ${isHomePreview ? 'mb-12' : 'mb-16 pt-12'}`}>
          <h2 className={`${isHomePreview ? 'text-3xl md:text-5xl' : 'text-4xl md:text-6xl'} font-bold mb-6`}>
            {isHomePreview ? 'Последние' : 'Наши'} <span className="text-gradient">Кейсы</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Реальные цифры и результаты. Мы гордимся успехами наших клиентов и открыто делимся статистикой.
          </p>
        </div>

        <div className="grid gap-12">
          {displayCases.map((item, index) => (
            <div 
              key={item.id} 
              onClick={() => onSelectCase && onSelectCase(item.id)}
              className={`flex flex-col md:flex-row gap-8 items-center glass-panel p-6 md:p-8 rounded-3xl border-t border-white/5 hover:border-brand-yellow/20 transition-all cursor-pointer group/card ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Image Side */}
              <div className="w-full md:w-1/2 h-64 md:h-80 rounded-2xl overflow-hidden relative group">
                <div className="absolute inset-0 bg-brand-dark/20 group-hover:bg-transparent transition-colors z-10"></div>
                <img 
                  src={item.image} 
                  alt={item.title} 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-brand-yellow text-brand-dark font-bold rounded-full text-xs uppercase tracking-wider">
                  {item.category}
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full md:w-1/2 space-y-6">
                <div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover/card:text-brand-yellow transition-colors">{item.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map(tag => (
                      <span key={tag} className="text-xs text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 border-y border-white/10 py-6">
                  {item.results.map((res, i) => (
                    <div key={i} className="text-center md:text-left">
                      <p className="text-brand-yellow font-bold text-xl md:text-2xl">{res.value}</p>
                      <p className="text-xs text-gray-500 uppercase mt-1">{res.label}</p>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Stop bubbling to prevent double action if card is clicked
                    if(onSelectCase) onSelectCase(item.id);
                  }}
                  className="w-full md:w-auto px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 group hover:border-brand-yellow/50"
                >
                  Читать подробнее
                  <ArrowRight className="group-hover:text-brand-yellow transition-colors" size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {!isHomePreview && (
            <div className="mt-20 text-center">
                <div className="inline-block p-8 rounded-3xl bg-gradient-to-r from-brand-yellow/10 to-brand-orange/10 border border-brand-yellow/20 max-w-3xl">
                    <TrendingUp className="w-12 h-12 text-brand-yellow mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-3">Ваш бизнес может быть следующим</h3>
                    <p className="text-gray-400 mb-6">Мы не просто настраиваем рекламу, мы погружаемся в вашу unit-экономику.</p>
                    <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onOrder();
                        }}
                        className="px-8 py-3 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-brand-orange transition-colors"
                    >
                        Обсудить проект
                    </button>
                </div>
            </div>
        )}

        {isHomePreview && onViewAll && (
          <div className="mt-12 text-center">
            <button
               onClick={onViewAll}
               className="inline-flex items-center gap-2 text-brand-yellow font-bold hover:text-white transition-colors"
            >
              Смотреть все кейсы
              <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CasesPage;



import React from 'react';
import { Check, ArrowRight, Eye } from 'lucide-react';
import { PACKAGES } from '../constants';

interface PackagesProps {
  onOrder: (packageName: string) => void;
  onViewDetails?: (packageId: string) => void;
}

const Packages: React.FC<PackagesProps> = ({ onOrder, onViewDetails }) => {
  return (
    <div className="py-24 bg-gradient-to-b from-brand-dark to-brand-surface/30 border-t border-white/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Комплексные <span className="text-gradient">Решения</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Готовые пакеты услуг, адаптированные под масштаб вашего бизнеса.
            От стартапа до федеральной компании.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 ${
                pkg.isPopular 
                  ? 'bg-brand-surface/60 border-brand-yellow shadow-[0_0_30px_rgba(255,184,0,0.1)]' 
                  : 'glass-panel border-white/10 hover:border-brand-yellow/30'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-yellow text-brand-dark text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  ХИТ ПРОДАЖ
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{pkg.title}</h3>
                <p className="text-sm text-gray-400 uppercase tracking-wide mb-4">{pkg.subtitle}</p>
                <div className="text-3xl font-bold text-brand-yellow mb-2">{pkg.price}</div>
              </div>

              <p className="text-gray-400 text-sm mb-6 leading-relaxed text-center h-16 line-clamp-3">
                {pkg.description}
              </p>

              <ul className="space-y-4 mb-8 flex-grow">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-gray-300">
                    <Check className="text-brand-orange shrink-0 mt-0.5" size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => onViewDetails && onViewDetails(pkg.id)}
                  className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group hover:border-brand-yellow/50"
                >
                  Подробнее
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => onOrder(`Пакет: ${pkg.title}`)}
                  className={`w-full py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                    pkg.isPopular
                      ? 'bg-brand-yellow text-brand-dark hover:bg-brand-orange hover:shadow-lg'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Заказать
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Packages;
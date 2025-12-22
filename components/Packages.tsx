import React from 'react';
import { Check, ArrowRight, Eye } from 'lucide-react';
import { ServicePackage } from '../types';

interface PackagesProps {
  packages: ServicePackage[];
  onOrder: (packageName: string) => void;
  onViewDetails?: (packageId: string) => void;
}

const Packages: React.FC<PackagesProps> = ({ packages, onOrder, onViewDetails }) => {
  return (
    <div className="py-24 bg-gradient-to-b from-slate-50 to-white border-t border-slate-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
            Комплексные <span className="text-gradient">Решения</span>
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Готовые пакеты услуг, адаптированные под масштаб вашего бизнеса.
            От стартапа до федеральной компании.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className={`relative flex flex-col p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-2 ${
                pkg.isPopular 
                  ? 'bg-white border-brand-orange shadow-[0_0_30px_rgba(255,138,0,0.15)] ring-1 ring-brand-orange/20' 
                  : 'glass-panel border-slate-200 hover:border-brand-orange/30'
              }`}
            >
              {pkg.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-orange text-white text-xs font-bold px-4 py-1 rounded-full shadow-lg">
                  ХИТ ПРОДАЖ
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-1">{pkg.title}</h3>
                <p className="text-sm text-slate-500 uppercase tracking-wide mb-4">{pkg.subtitle}</p>
                <div className="text-3xl font-bold text-brand-orange mb-2">{pkg.price}</div>
              </div>

              <p className="text-slate-600 text-sm mb-6 leading-relaxed text-center h-16 line-clamp-3">
                {pkg.description}
              </p>

              <ul className="space-y-4 mb-8 flex-grow">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-700">
                    <Check className="text-brand-yellow shrink-0 mt-0.5" size={16} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 mt-auto">
                <button 
                  onClick={() => onViewDetails && onViewDetails(pkg.id)}
                  className="w-full py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 group hover:border-brand-orange/30"
                >
                  Подробнее
                  <Eye size={16} />
                </button>
                <button 
                  onClick={() => onOrder(`Пакет: ${pkg.title}`)}
                  className={`w-full py-2.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                    pkg.isPopular
                      ? 'bg-brand-orange text-white hover:bg-orange-600 hover:shadow-lg'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
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
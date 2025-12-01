
import React from 'react';
import { Target, Search, Share2, Code, ArrowRight, ArrowUpRight, Palette, PieChart } from 'lucide-react';
import { SERVICES } from '../constants';
import Packages from './Packages';

const iconMap: Record<string, React.ReactNode> = {
  target: <Target size={32} />,
  search: <Search size={32} />,
  share: <Share2 size={32} />,
  code: <Code size={32} />,
  palette: <Palette size={32} />,
  chart: <PieChart size={32} />,
};

interface ServicesProps {
  onSelectService: (serviceId: string) => void;
  onQuickOrder: (serviceTitle: string) => void;
  isHomePreview?: boolean;
  onViewPackage?: (packageId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ onSelectService, onQuickOrder, isHomePreview = false, onViewPackage }) => {
  return (
    <>
      <section id="services" className={`bg-brand-dark relative ${isHomePreview ? 'py-24' : 'py-12 pb-24'}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
               {isHomePreview ? 'Наши' : 'Все'} <span className="text-gradient">Услуги</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Мы не просто "настраиваем рекламу", мы создаем экосистему для привлечения клиентов и увеличения продаж.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div 
                key={service.id} 
                className="group glass-panel p-8 rounded-2xl hover:bg-white/5 transition-all duration-300 border-t border-white/5 hover:border-brand-yellow/30 flex flex-col"
              >
                <div className="w-14 h-14 bg-brand-surface rounded-xl flex items-center justify-center text-brand-yellow mb-6 group-hover:scale-110 transition-transform duration-300 border border-white/5 shadow-lg">
                  {iconMap[service.icon]}
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-brand-yellow transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-400 text-sm mb-6 leading-relaxed line-clamp-3">
                  {service.description}
                </p>

                <div className="mt-auto space-y-3">
                  <button 
                    onClick={() => onSelectService(service.id)}
                    className="w-full py-2.5 rounded-lg border border-white/10 hover:bg-white/5 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 group-hover:border-brand-yellow/50"
                  >
                    Подробнее
                    <ArrowRight size={16} />
                  </button>
                  <button 
                    onClick={() => onQuickOrder(service.title)}
                    className="w-full py-2.5 rounded-lg bg-white/5 hover:bg-brand-yellow hover:text-brand-dark text-gray-300 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    Заказать сейчас
                    <ArrowUpRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Show Packages only on full Services page */}
      {!isHomePreview && (
        <Packages onOrder={onQuickOrder} onViewDetails={onViewPackage} />
      )}
    </>
  );
};

export default Services;


import React from 'react';
import { Target, Search, Share2, Code, ArrowRight, ArrowUpRight, Palette, PieChart, Box } from 'lucide-react';
import Packages from './Packages';
import ScrollReveal from './ScrollReveal';
import { ServiceItem, ServicePackage } from '../types';

const iconMap: Record<string, React.ReactNode> = {
  target: <Target size={32} />,
  search: <Search size={32} />,
  share: <Share2 size={32} />,
  code: <Code size={32} />,
  palette: <Palette size={32} />,
  chart: <PieChart size={32} />,
};

// Fallback icon
const DefaultIcon = <Box size={32} />;

interface ServicesProps {
  services: ServiceItem[];
  packages: ServicePackage[];
  onSelectService: (serviceId: string) => void;
  onQuickOrder: (serviceTitle: string) => void;
  isHomePreview?: boolean;
  onViewPackage?: (packageId: string) => void;
}

const Services: React.FC<ServicesProps> = ({ services, packages, onSelectService, onQuickOrder, isHomePreview = false, onViewPackage }) => {
  
  const renderIcon = (iconKey: string) => {
    if (!iconKey) return DefaultIcon;
    
    // Check if it's a URL or base64 data
    if (iconKey.startsWith('http') || iconKey.startsWith('data:') || iconKey.startsWith('/')) {
        return <img src={iconKey} alt="" className="w-8 h-8 object-contain" />;
    }
    
    return iconMap[iconKey] || DefaultIcon;
  };

  return (
    <>
      <section id="services" className={`bg-slate-50 relative ${isHomePreview ? 'py-24' : 'py-12 pb-24'}`}>
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
                 {isHomePreview ? 'Наши' : 'Все'} <span className="text-gradient">Услуги</span>
              </h2>
              <p className="text-slate-600 max-w-2xl mx-auto">
                Мы не просто "настраиваем рекламу", мы создаем экосистему для привлечения клиентов и увеличения продаж.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <ScrollReveal key={service.id} delay={index * 100}>
                <div 
                  className="group glass-panel p-8 rounded-2xl hover:bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-full"
                >
                  <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-brand-orange mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-200">
                    {renderIcon(service.icon)}
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-brand-orange transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    {service.description}
                  </p>

                  <div className="mt-auto space-y-3">
                    <button 
                      onClick={() => onSelectService(service.id)}
                      className="w-full py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2 group-hover:border-brand-orange/30"
                    >
                      Подробнее
                      <ArrowRight size={16} />
                    </button>
                    <button 
                      onClick={() => onQuickOrder(service.title)}
                      className="w-full py-2.5 rounded-lg bg-slate-100 hover:bg-brand-yellow hover:text-white text-slate-700 text-sm font-semibold transition-all flex items-center justify-center gap-2"
                    >
                      Заказать сейчас
                      <ArrowUpRight size={16} />
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Show Packages only on full Services page */}
      {!isHomePreview && (
        <Packages packages={packages} onOrder={onQuickOrder} onViewDetails={onViewPackage} />
      )}
    </>
  );
};

export default Services;

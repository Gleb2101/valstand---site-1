
import React from 'react';
import { ArrowRight, Briefcase } from 'lucide-react';
import ScrollReveal from './ScrollReveal';

interface HeroProps {
  onNavigate: (page: string) => void;
}

const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-slate-50">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-1/4 -right-20 w-[600px] h-[600px] bg-brand-yellow/10 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
        <ScrollReveal>
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-yellow/30 bg-white shadow-sm text-brand-orange text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-brand-orange animate-pulse"></span>
              Комплексный маркетинг 360°
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight text-slate-900">
              Масштабируем <br />
              Ваш Бизнес через <br />
              <span className="text-gradient">Цифровые Каналы</span>
            </h1>
            
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Агентство <b>Valstand</b> сочетает креативный подход и точную аналитику данных. Настраиваем рекламу, которая окупается, и создаем бренды, которые любят.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button 
                onClick={() => onNavigate('cases')}
                className="px-8 py-4 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                Смотреть кейсы
                <Briefcase size={20} />
              </button>
              <button 
                onClick={() => onNavigate('services')}
                className="px-8 py-4 border border-slate-300 text-slate-700 font-semibold rounded-xl hover:bg-white hover:border-brand-orange hover:text-brand-orange transition-all flex items-center justify-center gap-2 bg-white"
              >
                Наши услуги
                <ArrowRight size={20} />
              </button>
            </div>

            <div className="pt-8 flex gap-8 border-t border-slate-200">
              <div>
                <p className="text-3xl font-bold text-slate-900">150+</p>
                <p className="text-sm text-slate-500">Успешных проектов</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-slate-900">x3.5</p>
                <p className="text-sm text-slate-500">Средний ROI клиентов</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200} className="hidden md:block relative">
          <div className="relative">
            <div className="relative z-10 glass-panel rounded-2xl p-6 transform rotate-2 hover:rotate-0 transition-all duration-500 shadow-2xl border-t border-l border-white">
              <div className="flex justify-between items-center mb-6">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <span className="text-xs text-slate-400">analytics_dashboard.exe</span>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">TG</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Telegram Ads</p>
                      <p className="text-xs text-slate-500">Кампания "Запуск"</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-bold text-sm">+245%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">YA</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Яндекс.Директ</p>
                      <p className="text-xs text-slate-500">Ретаргетинг</p>
                    </div>
                  </div>
                  <span className="text-green-600 font-bold text-sm">+180%</span>
                </div>

                <div className="h-32 bg-gradient-to-t from-orange-50 to-transparent rounded-lg flex items-end justify-between px-2 pb-2 gap-2 border-b border-slate-200">
                   {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                     <div key={i} style={{height: `${h}%`}} className="w-full bg-gradient-to-t from-brand-orange to-brand-yellow rounded-t-sm opacity-80"></div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default Hero;

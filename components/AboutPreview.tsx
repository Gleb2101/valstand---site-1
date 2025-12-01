import React from 'react';
import { Users, ShieldCheck, Rocket, ArrowRight } from 'lucide-react';

interface AboutPreviewProps {
  onNavigate: () => void;
}

const AboutPreview: React.FC<AboutPreviewProps> = ({ onNavigate }) => {
  return (
    <section className="py-24 bg-gradient-to-b from-black to-brand-dark border-t border-white/5 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-yellow/5 rounded-full blur-[100px] -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-white">
              Кто мы такие: <br />
              <span className="text-gradient">Агентство Valstand</span>
            </h2>
            <p className="text-gray-400 text-lg leading-relaxed">
              Мы — команда практиков, объединившая опыт в маркетинге, дизайне и разработке. 
              Мы не верим в "волшебные таблетки", но верим в цифры, тесты и системный подход.
            </p>
            <p className="text-gray-400 text-lg leading-relaxed">
              Наше название <b>Valstand</b> происходит от сложения ценности (Value) и стандарта (Standard). 
              Мы создаем новый стандарт качества на рынке digital-услуг.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              <div className="flex flex-col gap-2">
                <Users className="text-brand-yellow mb-2" size={32} />
                <h4 className="font-bold text-white">Команда PRO</h4>
                <p className="text-sm text-gray-500">Узкие специалисты под каждую задачу</p>
              </div>
              <div className="flex flex-col gap-2">
                <ShieldCheck className="text-brand-orange mb-2" size={32} />
                <h4 className="font-bold text-white">Гарантии</h4>
                <p className="text-sm text-gray-500">Работаем официально по договору</p>
              </div>
              <div className="flex flex-col gap-2">
                <Rocket className="text-blue-500 mb-2" size={32} />
                <h4 className="font-bold text-white">Скорость</h4>
                <p className="text-sm text-gray-500">Запуск проектов за 3-5 дней</p>
              </div>
            </div>

            <button 
              onClick={onNavigate}
              className="mt-8 px-8 py-3 border border-brand-yellow text-brand-yellow font-bold rounded-xl hover:bg-brand-yellow hover:text-brand-dark transition-all flex items-center gap-2 group"
            >
              Узнать больше о нас
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop" 
                alt="Team working" 
                className="rounded-2xl w-full h-64 object-cover mt-12 transform hover:-translate-y-2 transition-transform duration-500 border border-white/10"
              />
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=800&auto=format&fit=crop" 
                alt="Meeting" 
                className="rounded-2xl w-full h-64 object-cover transform hover:-translate-y-2 transition-transform duration-500 border border-white/10"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-brand-orange rounded-full blur-3xl opacity-20"></div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
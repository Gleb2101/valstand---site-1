

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Zap, ExternalLink, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceItem } from '../types';
import ContactForm from './ContactForm';

interface ServiceDetailProps {
  service: ServiceItem;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack, onNavigate }) => {
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);

  const toggleStep = (index: number) => {
    setExpandedStepIndex(expandedStepIndex === index ? null : index);
  };

  const defaultProcessText = `На данном этапе мы действуем согласно принципам полной прозрачности и методологии Agile. 

1. Формируется рабочая группа проекта (Project Manager, специалисты).
2. Вы получаете доступ к таск-трекеру (Trello/Jira) или еженедельным отчетам.
3. Каждое действие согласовывается с бизнес-целями.

Мы не делаем работу "ради галочки". Если в процессе анализа мы понимаем, что изначальная гипотеза не сработает, мы честно говорим об этом и предлагаем альтернативу. Наш приоритет — окупаемость ваших инвестиций.`;

  return (
    <div className="min-h-screen bg-brand-dark pt-20 animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-brand-yellow transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          Назад к услугам
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-yellow/5 skew-x-12 transform origin-top blur-3xl -z-10"></div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">
            {service.title}
          </h1>
          <div className="text-lg md:text-xl text-gray-300 max-w-4xl leading-relaxed border-l-4 border-brand-orange pl-6 whitespace-pre-wrap font-light">
            {service.fullDescription}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 bg-brand-surface/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-10 flex items-center gap-3">
            <Zap className="text-brand-yellow" />
            Ключевые преимущества
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {service.benefits.map((benefit, index) => (
              <div key={index} className="glass-panel p-6 rounded-xl border-t border-white/10 hover:border-brand-yellow/30 transition-colors">
                <h3 className="text-xl font-bold text-brand-yellow mb-3">{benefit.title}</h3>
                <p className="text-gray-400">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Steps (Accordion) */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Как мы работаем</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {service.process.map((step, index) => {
              const isOpen = expandedStepIndex === index;
              return (
                <div 
                  key={index} 
                  className={`glass-panel rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen ? 'border-brand-yellow/50 bg-white/5' : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <button 
                    onClick={() => toggleStep(index)}
                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-6">
                       <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-lg transition-colors ${
                         isOpen 
                           ? 'bg-brand-orange text-white border-brand-orange' 
                           : 'bg-brand-surface text-gray-500 border-white/10'
                       }`}>
                         {index + 1}
                       </div>
                       <div>
                         <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-brand-yellow' : 'text-white'}`}>
                           {step.step}
                         </h3>
                         <p className="text-sm text-gray-400 mt-1 line-clamp-1 hidden md:block">
                           {step.desc}
                         </p>
                       </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="text-brand-yellow shrink-0" />
                    ) : (
                      <ChevronDown className="text-gray-500 shrink-0" />
                    )}
                  </button>

                  <div className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-8 pt-2 pl-[5.5rem]">
                      {/* Short Desc (Mobile) */}
                      <p className="text-gray-400 mb-4 md:hidden">{step.desc}</p>
                      
                      {/* Detailed Description */}
                      <div className="prose prose-invert prose-sm max-w-none text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
                        {step.details ? step.details : defaultProcessText}
                      </div>

                      {/* Example Image */}
                      {step.exampleImage && (
                        <div className="mt-6">
                           <p className="text-xs text-brand-orange uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                             <ImageIcon size={14} /> 
                             Пример реализации
                           </p>
                           <div className="rounded-xl overflow-hidden border border-white/10 relative group">
                             <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors"></div>
                             <img 
                               src={step.exampleImage} 
                               alt={`Example for ${step.step}`} 
                               className="w-full h-auto object-cover object-top max-h-64 md:max-h-80"
                             />
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA / Contact Form */}
      <div className="bg-gradient-to-t from-brand-dark to-brand-surface/20">
        <ContactForm selectedService={service.title} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default ServiceDetail;

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Zap, ExternalLink, Image as ImageIcon, ChevronDown, ChevronUp, ArrowRight, Briefcase } from 'lucide-react';
import { ServiceItem, CaseStudy } from '../types';
import ContactForm from './ContactForm';

interface ServiceDetailProps {
  service: ServiceItem;
  onBack: () => void;
  onNavigate: (page: string) => void;
  relatedCases?: CaseStudy[];
  onViewCase?: (caseId: string) => void;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({ service, onBack, onNavigate, relatedCases = [], onViewCase }) => {
  const [expandedStepIndex, setExpandedStepIndex] = useState<number | null>(null);

  const toggleStep = (index: number) => {
    setExpandedStepIndex(expandedStepIndex === index ? null : index);
  };

  const defaultProcessText = `На данном этапе мы действуем согласно принципам полной прозрачности и методологии Agile. 

1. Формируется рабочая группа проекта (Project Manager, специалисты).
2. Вы получаете доступ к таск-трекеру (Trello/Jira) или еженедельным отчетам.
3. Каждое действие согласовывается с бизнес-целями.

Мы не делаем работу "ради галочки". Если в процессе анализа мы понимаем, что изначальная гипотеза не сработает, мы честно говорим об этом и предлагаем альтернативу. Наш приоритет — окупаемость ваших инвестиций.`;

  // Filter cases related to this service
  const serviceCases = relatedCases.filter(c => c.serviceId === service.id);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in">
      {/* Navigation Breadcrumb */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-brand-orange transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          Назад к услугам
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-yellow/10 skew-x-12 transform origin-top blur-3xl -z-10"></div>
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8">
            {service.title}
          </h1>
          <div className="text-lg md:text-xl text-slate-600 max-w-4xl leading-relaxed border-l-4 border-brand-orange pl-6 whitespace-pre-wrap font-light">
            {service.fullDescription}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-10 flex items-center gap-3">
            <Zap className="text-brand-orange" />
            Ключевые преимущества
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {service.benefits.map((benefit, index) => (
              <div key={index} className="glass-panel p-6 rounded-xl border border-slate-200 hover:border-brand-orange/30 transition-colors shadow-sm">
                <h3 className="text-xl font-bold text-slate-900 mb-3">{benefit.title}</h3>
                <p className="text-slate-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Included Features List (New) */}
      <section className="py-12 bg-slate-50">
        <div className="container mx-auto px-4">
           <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <CheckCircle className="text-brand-orange" />
            Что входит в услугу
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
             {service.features.map((feature, index) => (
               <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                 <div className="w-2 h-2 rounded-full bg-brand-orange shrink-0"></div>
                 <span className="text-slate-700 font-medium">{feature}</span>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Process Steps (Accordion) */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Как мы работаем</h2>
          <div className="max-w-4xl mx-auto space-y-4">
            {service.process.map((step, index) => {
              const isOpen = expandedStepIndex === index;
              return (
                <div 
                  key={index} 
                  className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm ${
                    isOpen ? 'border-brand-orange ring-1 ring-brand-orange/20' : 'border-slate-200 hover:border-slate-300'
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
                           : 'bg-slate-100 text-slate-500 border-slate-200'
                       }`}>
                         {index + 1}
                       </div>
                       <div>
                         <h3 className={`text-xl font-bold transition-colors ${isOpen ? 'text-brand-orange' : 'text-slate-900'}`}>
                           {step.step}
                         </h3>
                         <p className="text-sm text-slate-500 mt-1 line-clamp-1 hidden md:block">
                           {step.desc}
                         </p>
                       </div>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="text-brand-orange shrink-0" />
                    ) : (
                      <ChevronDown className="text-slate-400 shrink-0" />
                    )}
                  </button>

                  <div className={`transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-8 pt-2 pl-[5.5rem]">
                      {/* Short Desc (Mobile) */}
                      <p className="text-slate-600 mb-4 md:hidden">{step.desc}</p>
                      
                      {/* Detailed Description */}
                      <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-6 whitespace-pre-wrap">
                        {step.details ? step.details : defaultProcessText}
                      </div>

                      {/* Example Image */}
                      {step.exampleImage && (
                        <div className="mt-6">
                           <p className="text-xs text-brand-orange uppercase font-bold tracking-wider mb-3 flex items-center gap-2">
                             <ImageIcon size={14} /> 
                             Пример реализации
                           </p>
                           <div className="rounded-xl overflow-hidden border border-slate-200 relative group shadow-md">
                             <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors"></div>
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

      {/* Related Cases Section */}
      {serviceCases.length > 0 && (
        <section className="py-16 bg-white border-t border-slate-200">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-slate-900 mb-10 flex items-center gap-3">
              <Briefcase className="text-brand-orange" />
              Кейсы по этой услуге
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {serviceCases.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => onViewCase && onViewCase(item.id)}
                  className="flex flex-col md:flex-row gap-6 items-center glass-panel p-6 rounded-2xl hover:border-brand-orange/30 transition-all cursor-pointer group shadow-sm border border-slate-200"
                >
                  <div className="w-full md:w-1/3 h-48 rounded-xl overflow-hidden relative shadow-sm">
                    <img 
                      src={item.image} 
                      alt={item.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="w-full md:w-2/3">
                    <span className="text-xs font-bold text-brand-orange uppercase tracking-wider mb-2 block">
                      {item.category}
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-orange transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                      {item.description}
                    </p>
                    <button className="text-sm font-semibold text-slate-900 flex items-center gap-1 group-hover:gap-2 transition-all">
                      Подробнее <ArrowRight size={14} className="text-brand-orange" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA / Contact Form */}
      <div className="bg-gradient-to-t from-slate-100 to-white">
        <ContactForm selectedService={service.title} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default ServiceDetail;

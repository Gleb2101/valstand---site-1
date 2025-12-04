import React, { useEffect } from 'react';
import { ArrowLeft, Check, Clock, Zap, Star } from 'lucide-react';
import { ServicePackage } from '../types';
import ContactForm from './ContactForm';

interface PackageDetailProps {
  pkg: ServicePackage;
  onBack: () => void;
  onNavigate: (page: string) => void;
}

const PackageDetail: React.FC<PackageDetailProps> = ({ pkg, onBack, onNavigate }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-brand-orange transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          Назад к услугам
        </button>
      </div>

      {/* Hero */}
      <section className="relative py-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-yellow/10 skew-x-12 transform origin-top blur-3xl -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-brand-orange font-bold uppercase tracking-wider text-sm">
                  Комплексное решение
                </span>
                {pkg.isPopular && (
                  <span className="px-3 py-0.5 bg-brand-orange text-white text-xs font-bold rounded-full">
                    ХИТ ПРОДАЖ
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-2">
                {pkg.title}
              </h1>
              <p className="text-xl text-slate-500">{pkg.subtitle}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-3xl md:text-5xl font-bold text-brand-orange mb-1">{pkg.price}</div>
              <div className="flex items-center gap-2 text-slate-500 text-sm justify-start md:justify-end">
                <Clock size={16} />
                <span>Срок реализации: {pkg.timeline}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-slate-200 bg-white">
            <p className="text-lg text-slate-700 leading-relaxed max-w-4xl whitespace-pre-wrap">
              {pkg.fullDescription}
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            {pkg.benefits.map((benefit, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <Star className="text-brand-yellow mb-4" size={24} />
                <h3 className="text-lg font-bold text-slate-900 mb-2">{benefit.title}</h3>
                <p className="text-slate-600 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-12 bg-slate-100">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Zap className="text-brand-orange" />
            Что входит в пакет
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pkg.detailedFeatures.map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-6 glass-panel rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="w-8 h-8 rounded-full bg-brand-yellow/20 flex items-center justify-center shrink-0 text-brand-orange">
                  <Check size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-gradient-to-t from-slate-100 to-white">
        <ContactForm selectedService={`Пакет: ${pkg.title}`} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default PackageDetail;
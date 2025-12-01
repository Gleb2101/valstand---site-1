
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
    <div className="min-h-screen bg-brand-dark pt-20 animate-fade-in">
      {/* Navigation */}
      <div className="container mx-auto px-4 py-6">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-brand-yellow transition-colors gap-2"
        >
          <ArrowLeft size={20} />
          Назад к услугам
        </button>
      </div>

      {/* Hero */}
      <section className="relative py-12">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-yellow/5 skew-x-12 transform origin-top blur-3xl -z-10"></div>
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-brand-yellow font-bold uppercase tracking-wider text-sm">
                  Комплексное решение
                </span>
                {pkg.isPopular && (
                  <span className="px-3 py-0.5 bg-brand-yellow text-brand-dark text-xs font-bold rounded-full">
                    ХИТ ПРОДАЖ
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">
                {pkg.title}
              </h1>
              <p className="text-xl text-gray-400">{pkg.subtitle}</p>
            </div>
            <div className="text-left md:text-right">
              <div className="text-3xl md:text-5xl font-bold text-brand-yellow mb-1">{pkg.price}</div>
              <div className="flex items-center gap-2 text-gray-400 text-sm justify-start md:justify-end">
                <Clock size={16} />
                <span>Срок реализации: {pkg.timeline}</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-8 rounded-2xl border border-white/10">
            <p className="text-lg text-gray-300 leading-relaxed max-w-4xl whitespace-pre-wrap">
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
              <div key={idx} className="bg-white/5 p-6 rounded-xl border border-white/5">
                <Star className="text-brand-yellow mb-4" size={24} />
                <h3 className="text-lg font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-gray-400 text-sm">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Features */}
      <section className="py-12 bg-black/20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
            <Zap className="text-brand-orange" />
            Что входит в пакет
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {pkg.detailedFeatures.map((feature, idx) => (
              <div key={idx} className="flex gap-4 p-6 glass-panel rounded-xl border border-white/5">
                <div className="w-8 h-8 rounded-full bg-brand-yellow/10 flex items-center justify-center shrink-0 text-brand-yellow">
                  <Check size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <div className="bg-gradient-to-t from-brand-dark to-brand-surface/20">
        <ContactForm selectedService={`Пакет: ${pkg.title}`} onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default PackageDetail;

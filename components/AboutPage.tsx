
import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, FileText } from 'lucide-react';
import { LEGAL_INFO } from '../constants';
import { dataManager } from '../services/dataManager';
import { TeamMember } from '../types';

const AboutPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setTeam(dataManager.getTeam());
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark pt-20 animate-fade-in pb-24">
      
      {/* Header */}
      <section className="py-16 md:py-24 text-center container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
          Мы — команда <span className="text-gradient">Valstand</span>
        </h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Мы объединяем технологии и креатив, чтобы ваш бизнес рос. Каждый член нашей команды — эксперт в своей области, нацеленный на результат.
        </p>
      </section>

      {/* Team Section */}
      <section className="py-12 bg-black/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-white mb-12 flex items-center gap-3">
            <span className="w-2 h-8 bg-brand-yellow rounded-full"></span>
            Наша Команда
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.id} className="glass-panel p-6 rounded-2xl border border-white/5 hover:border-brand-yellow/30 transition-all group">
                <div className="w-full h-80 rounded-xl overflow-hidden mb-6 relative">
                  <div className="absolute inset-0 bg-brand-dark/10 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1">{member.name}</h3>
                <p className="text-brand-yellow text-sm font-bold uppercase tracking-wider mb-4">{member.role}</p>
                <p className="text-gray-400 leading-relaxed text-sm border-t border-white/10 pt-4">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts & Legal Info Grid */}
      <section className="py-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          
          {/* Contact Information Block */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
              Контактная информация
            </h2>
            <div className="glass-panel p-8 rounded-3xl space-y-8 border border-white/10">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-full flex items-center justify-center text-brand-yellow shrink-0">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Телефон</h4>
                  <p className="text-gray-400">+7 (999) 000-00-00</p>
                  <p className="text-gray-500 text-sm mt-1">Пн-Пт с 10:00 до 19:00</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-full flex items-center justify-center text-brand-yellow shrink-0">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Email для связи</h4>
                  <p className="text-gray-400">hello@valstand.agency</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-brand-yellow/10 rounded-full flex items-center justify-center text-brand-yellow shrink-0">
                  <MapPin size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold text-lg mb-1">Наш Офис</h4>
                  <p className="text-gray-400">{LEGAL_INFO.address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Legal Information Block */}
          <div>
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-gray-600 rounded-full"></span>
              Юридическая информация
            </h2>
            <div className="glass-panel p-8 rounded-3xl border border-white/10 h-fit">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/10">
                <FileText className="text-gray-400" size={24} />
                <h3 className="text-xl font-bold text-white">Реквизиты компании</h3>
              </div>
              
              <div className="space-y-4 font-mono text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Название</span>
                  <span className="text-white font-bold text-right">{LEGAL_INFO.companyName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">ИНН</span>
                  <span className="text-white">{LEGAL_INFO.inn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">КПП</span>
                  <span className="text-white">{LEGAL_INFO.kpp}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">ОГРН</span>
                  <span className="text-white">{LEGAL_INFO.ogrn}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">Юр. адрес</span>
                  <span className="text-white text-right max-w-[200px]">{LEGAL_INFO.address}</span>
                </div>
                <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Банк</span>
                    <span className="text-white text-right">{LEGAL_INFO.bank}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">БИК</span>
                    <span className="text-white">{LEGAL_INFO.bik}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Р/С</span>
                    <span className="text-white">{LEGAL_INFO.account}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
};

export default AboutPage;

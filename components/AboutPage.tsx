
import React, { useEffect, useState } from 'react';
import { Mail, Phone, FileText } from 'lucide-react';
import { LEGAL_INFO } from '../constants';
import { dataManager } from '../services/dataManager';
import { TeamMember } from '../types';

const AboutPage: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    dataManager.getTeam().then(setTeam);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 animate-fade-in pb-24">
      
      <section className="py-16 md:py-24 text-center container mx-auto px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
          Мы — команда <span className="text-gradient">Valstand</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
          Мы объединяем технологии и креатив.
        </p>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 flex items-center gap-3">
            <span className="w-2 h-8 bg-brand-orange rounded-full"></span>
            Наша Команда
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {team.map((member) => (
              <div key={member.id} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:shadow-xl transition-all group">
                <div className="w-full h-80 rounded-xl overflow-hidden mb-6 relative">
                  <div className="absolute inset-0 bg-slate-900/5 group-hover:bg-transparent transition-colors z-10"></div>
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{member.name}</h3>
                <p className="text-brand-orange text-sm font-bold uppercase tracking-wider mb-4">{member.role}</p>
                <p className="text-slate-600 leading-relaxed text-sm border-t border-slate-200 pt-4">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-brand-yellow rounded-full"></span>
              Контактная информация
            </h2>
            <div className="bg-white p-8 rounded-3xl space-y-8 border border-slate-200 shadow-sm">
              <div className="flex items-start gap-4">
                <Phone size={24} className="text-brand-orange" />
                <div>
                  <h4 className="text-slate-900 font-bold text-lg mb-1">Телефон</h4>
                  <p className="text-slate-600">+7 (499) 110-07-88</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Mail size={24} className="text-brand-orange" />
                <div>
                  <h4 className="text-slate-900 font-bold text-lg mb-1">Email</h4>
                  <p className="text-slate-600">info@valstand.ru</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-2 h-8 bg-slate-400 rounded-full"></span>
              Юридическая информация
            </h2>
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm h-fit">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
                <FileText className="text-slate-400" size={24} />
                <h3 className="text-xl font-bold text-slate-900">Реквизиты компании</h3>
              </div>
              <div className="space-y-4 font-mono text-sm">
                 <div className="flex justify-between">
                  <span className="text-slate-500">Название</span>
                  <span className="text-slate-900 font-bold">{LEGAL_INFO.companyName}</span>
                </div>
                {/* Simplified for brevity, use LEGAL_INFO fields */}
                 <div className="flex justify-between">
                  <span className="text-slate-500">ИНН</span>
                  <span className="text-slate-900">{LEGAL_INFO.inn}</span>
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

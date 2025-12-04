
import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, CheckCircle } from 'lucide-react';
import { SERVICES, PACKAGES } from '../constants';
import { dataManager } from '../services/dataManager';

interface ContactFormProps {
  selectedService: string;
  isPage?: boolean;
  onNavigate: (page: string) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({ selectedService, isPage = false, onNavigate }) => {
  const [submitted, setSubmitted] = useState(false);
  const [interest, setInterest] = useState(selectedService);
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    setInterest(selectedService);
  }, [selectedService]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!privacyAccepted) return;

    // Save to CMS Manager
    dataManager.addLead({
      name: formData.name,
      phone: formData.phone,
      service: interest
    });

    setSubmitted(true);
    setFormData({ name: '', phone: '' });
    setPrivacyAccepted(false);
  };

  return (
    <section id="contact" className={`${isPage ? 'py-12' : 'py-24'} bg-gradient-to-b from-slate-100 to-white relative`}>
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-slate-900">
              {isPage ? (
                <>Наши <span className="text-gradient">Контакты</span></>
              ) : (
                (selectedService.startsWith('Пакет:') || selectedService === 'Комплексное продвижение' || SERVICES.find(s => s.title === selectedService)) ? (
                  <>Давайте обсудим <br /><span className="text-gradient">Ваш Проект</span></>
                ) : (
                   <>Закажите услугу <br /><span className="text-gradient">{selectedService}</span></>
                )
              )}
            </h2>
            <p className="text-slate-600 mb-10 text-lg">
              Оставьте заявку, и мы проведем бесплатный аудит ваших текущих показателей и предложим план роста.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-brand-orange shrink-0 shadow-sm">
                  <Phone size={24} />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold mb-1">Телефон</h4>
                  <p className="text-slate-600">+7 (499) 110-07-88</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white rounded-full border border-slate-200 flex items-center justify-center text-brand-orange shrink-0 shadow-sm">
                  <Mail size={24} />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold mb-1">Email</h4>
                  <p className="text-slate-600">info@valstand.ru</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-slate-100">
            {submitted ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20">
                <CheckCircle className="text-green-500 w-20 h-20 mb-6" />
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Заявка отправлена!</h3>
                <p className="text-slate-600">Менеджер Valstand свяжется с вами в течение 15 минут.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-brand-orange font-semibold hover:underline"
                >
                  Отправить еще одну
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">Имя</label>
                  <input 
                    type="text" 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900"
                    placeholder="Иван Иванов"
                  />
                </div>
                
                <div>
                  <label className="block text-slate-700 font-semibold mb-2">Телефон</label>
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900"
                    placeholder="+7 (---) --- -- --"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-2">Интересующая услуга</label>
                  <select 
                    value={interest}
                    onChange={(e) => setInterest(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-white border border-slate-200 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none transition-all text-slate-900"
                  >
                    <optgroup label="Основные услуги">
                      {SERVICES.map((s) => (
                        <option key={s.id} value={s.title}>{s.title}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Комплексные пакеты">
                      {PACKAGES.map((p) => (
                         <option key={p.id} value={`Пакет: ${p.title}`}>Пакет: {p.title}</option>
                      ))}
                    </optgroup>
                    <option value="Другое">Другое</option>
                  </select>
                </div>

                <div className="flex items-start gap-3 mt-2">
                  <div className="relative flex items-center pt-1">
                    <input
                      id="privacy-policy"
                      name="privacy-policy"
                      type="checkbox"
                      checked={privacyAccepted}
                      onChange={(e) => setPrivacyAccepted(e.target.checked)}
                      className="h-5 w-5 text-brand-orange border-slate-300 rounded focus:ring-brand-orange cursor-pointer"
                    />
                  </div>
                  <label htmlFor="privacy-policy" className="text-sm text-slate-500 leading-tight cursor-pointer">
                    Я соглашаюсь с{' '}
                    <span 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onNavigate('privacy');
                      }}
                      className="text-brand-orange hover:underline relative z-10"
                    >
                      политикой конфиденциальности
                    </span>
                    {' '}и даю согласие на обработку персональных данных
                  </label>
                </div>

                <button 
                  type="submit" 
                  disabled={!privacyAccepted}
                  className={`w-full py-4 font-bold rounded-lg transition-all transform ${
                    privacyAccepted
                      ? 'bg-gradient-to-r from-brand-yellow to-brand-orange text-white hover:shadow-lg hover:shadow-orange-500/30 hover:-translate-y-1'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Получить консультацию
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactForm;


import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { Popup } from '../types';
import ContactForm from './ContactForm';

const GlobalPopup: React.FC = () => {
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const popups = dataManager.getPopups();
    // Find a popup that is active
    // In a real scenario, you might have complex logic (once per session, specific pages)
    // Here we just take the first active popup
    const target = popups.find(p => p.isActive);

    if (target) {
      // Check session storage to avoid spamming user on refresh
      const seenKey = `valstand_popup_seen_${target.id}`;
      if (!sessionStorage.getItem(seenKey)) {
        setTimeout(() => {
          setActivePopup(target);
          setIsOpen(true);
        }, (target.delaySeconds || 0) * 1000);
      }
    }
  }, []);

  const handleClose = () => {
    if (activePopup) {
      sessionStorage.setItem(`valstand_popup_seen_${activePopup.id}`, 'true');
    }
    setIsOpen(false);
  };

  if (!isOpen || !activePopup) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-brand-surface border border-white/10 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col">
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-2 bg-black/20 rounded-full"
        >
          <X size={20} />
        </button>

        <div className="p-0">
          {activePopup.imageUrl && (
            <div className="w-full flex justify-center bg-black/20">
              <img 
                src={activePopup.imageUrl} 
                alt={activePopup.title} 
                style={{ width: activePopup.imageWidth ? `${activePopup.imageWidth}%` : '100%' }}
                className="object-cover"
              />
            </div>
          )}
          
          <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">{activePopup.title}</h2>
            <div className="text-gray-300 mb-6 whitespace-pre-wrap text-center">
              {activePopup.text}
            </div>

            {activePopup.hasForm && (
              <div className="bg-black/20 p-4 rounded-xl">
                <p className="text-sm text-gray-400 text-center mb-4">Оставьте заявку и мы свяжемся с вами</p>
                {/* Simplified inline form logic re-using ContactForm might be too heavy visually, 
                    so we create a mini form here or render ContactForm with specific props */}
                <MiniContactForm service={activePopup.title} onSuccess={handleClose} />
              </div>
            )}
            
            {!activePopup.hasForm && (
                <div className="text-center">
                    <button 
                        onClick={handleClose}
                        className="px-6 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange"
                    >
                        Понятно
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const MiniContactForm: React.FC<{ service: string; onSuccess: () => void }> = ({ service, onSuccess }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      dataManager.addLead({ name, phone, service: `POPUP: ${service}` });
      setSubmitted(true);
      setTimeout(onSuccess, 2000);
    };
  
    if (submitted) return <div className="text-green-500 text-center font-bold">Спасибо! Заявка отправлена.</div>;
  
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <input 
          required 
          placeholder="Имя" 
          className="w-full p-2 rounded bg-white/10 border border-white/10 text-white text-sm"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input 
          required 
          placeholder="Телефон" 
          className="w-full p-2 rounded bg-white/10 border border-white/10 text-white text-sm"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button type="submit" className="w-full py-2 bg-brand-yellow text-brand-dark font-bold rounded text-sm hover:bg-brand-orange transition-colors">
          Отправить
        </button>
      </form>
    );
};

export default GlobalPopup;

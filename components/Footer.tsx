
import React, { useEffect, useState } from 'react';
import { Lock, Send } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { SiteSettings } from '../types';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [socials, setSocials] = useState<SiteSettings['socials']>({});

  useEffect(() => {
    dataManager.getSettings().then(s => setSocials(s.socials || {}));
  }, []);

  return (
    <footer className="bg-slate-900 py-12 border-t border-slate-800 text-slate-400 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col items-start gap-4">
            <div className="flex items-center gap-2">
                <span className="font-bold text-xl text-white">Valstand</span>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span>Since 2024</span>
            </div>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {socials?.vk && (
                <a 
                  href={socials.vk} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-white hover:bg-[#0077FF] transition-colors font-bold"
                  title="VK"
                >
                  VK
                </a>
              )}
              {socials?.telegram && (
                <a 
                  href={socials.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-white hover:bg-[#24A1DE] transition-colors"
                  title="Telegram"
                >
                  <Send size={18} />
                </a>
              )}
              {socials?.vc && (
                <a 
                  href={socials.vc} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-white hover:bg-[#e41b71] transition-colors font-bold"
                  title="VC.ru"
                >
                  VC
                </a>
              )}
              {socials?.tj && (
                <a 
                  href={socials.tj} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-white hover:bg-yellow-500 transition-colors font-bold text-slate-900"
                  title="TJournal"
                >
                  TJ
                </a>
              )}
            </div>
          </div>
          
          <div className="flex gap-6">
            <button 
              onClick={() => onNavigate('privacy')}
              className="hover:text-brand-yellow transition-colors text-left"
            >
              Политика конфиденциальности
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="opacity-20 hover:opacity-100 transition-opacity flex items-center gap-1"
            >
              <Lock size={12} />
              CMS
            </button>
          </div>

          <div className="text-center md:text-right">
            <p>&copy; {new Date().getFullYear()} Valstand Agency. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-black py-12 border-t border-white/10 text-gray-400 text-sm">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xl text-white">Valstand</span>
            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
            <span>Since 2024</span>
          </div>
          
          <div className="flex gap-6">
            <button 
              onClick={() => onNavigate('privacy')}
              className="hover:text-brand-yellow transition-colors text-left"
            >
              Политика конфиденциальности
            </button>
            <a href="#" className="hover:text-brand-yellow transition-colors">Договор оферты</a>
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

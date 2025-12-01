import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PRIVACY_POLICY } from '../constants';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-brand-dark pt-24 pb-12 text-white animate-fade-in">
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-brand-yellow transition-colors gap-2 mb-8"
        >
          <ArrowLeft size={20} />
          Назад
        </button>
        
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white border-b border-white/10 pb-6">
            Политика конфиденциальности
          </h1>
          <div className="prose prose-invert prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-gray-300 font-light leading-relaxed">
              {PRIVACY_POLICY}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
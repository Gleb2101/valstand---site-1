
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PRIVACY_POLICY } from '../constants';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 text-slate-900 animate-fade-in">
      <div className="container mx-auto px-4 max-w-4xl">
        <button 
          onClick={onBack}
          className="flex items-center text-slate-500 hover:text-brand-orange transition-colors gap-2 mb-8"
        >
          <ArrowLeft size={20} />
          Назад
        </button>
        
        <div className="bg-white p-8 md:p-12 rounded-3xl border border-slate-200 shadow-sm">
          <h1 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900 border-b border-slate-100 pb-6">
            Политика конфиденциальности
          </h1>
          <div className="prose prose-lg max-w-none">
            <div className="whitespace-pre-wrap text-slate-600 font-light leading-relaxed">
              {PRIVACY_POLICY}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

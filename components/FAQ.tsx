import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../constants';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-white relative border-y border-slate-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-slate-900">
            Частые <span className="text-gradient">Вопросы</span>
          </h2>
          <p className="text-slate-600">
            Все, что вы хотели узнать о работе с нами
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {FAQ_ITEMS.map((item, index) => (
            <div 
              key={index} 
              className="mb-4 bg-white rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${
                  openIndex === index ? 'bg-slate-50' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  <HelpCircle className={`w-5 h-5 ${openIndex === index ? 'text-brand-orange' : 'text-slate-400'}`} />
                  <span className={`font-bold text-lg ${openIndex === index ? 'text-slate-900' : 'text-slate-700'}`}>
                    {item.question}
                  </span>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="text-brand-orange" />
                ) : (
                  <ChevronDown className="text-slate-400" />
                )}
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { FAQ_ITEMS } from '../constants';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 bg-brand-dark relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Частые <span className="text-gradient">Вопросы</span>
          </h2>
          <p className="text-gray-400">
            Все, что вы хотели узнать о работе с нами
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {FAQ_ITEMS.map((item, index) => (
            <div 
              key={index} 
              className="mb-4 glass-panel rounded-xl border border-white/5 overflow-hidden transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className={`w-full flex items-center justify-between p-6 text-left transition-colors ${
                  openIndex === index ? 'bg-white/5' : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <HelpCircle className={`w-5 h-5 ${openIndex === index ? 'text-brand-yellow' : 'text-gray-500'}`} />
                  <span className={`font-bold text-lg ${openIndex === index ? 'text-white' : 'text-gray-300'}`}>
                    {item.question}
                  </span>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="text-brand-yellow" />
                ) : (
                  <ChevronDown className="text-gray-500" />
                )}
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-6 pt-0 text-gray-400 leading-relaxed border-t border-white/5 bg-black/20">
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
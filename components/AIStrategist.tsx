import React, { useState } from 'react';
import { Sparkles, Loader2, Send } from 'lucide-react';
import { generateMarketingStrategy } from '../services/geminiService';
import { LoadingState } from '../types';

const AIStrategist: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadingState>(LoadingState.IDLE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;

    setStatus(LoadingState.LOADING);
    setResult(null);

    try {
      const strategy = await generateMarketingStrategy(niche);
      setResult(strategy);
      setStatus(LoadingState.SUCCESS);
    } catch (error) {
      setStatus(LoadingState.ERROR);
    }
  };

  return (
    <section id="ai-tool" className="py-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-brand-surface/30 skew-y-3 transform origin-top-left -z-10"></div>
      
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-8 md:p-12 border border-brand-yellow/20 shadow-[0_0_50px_rgba(255,184,0,0.1)]">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 text-purple-300 text-sm font-semibold mb-4">
              <Sparkles size={16} className="text-purple-400" />
              Powered by Gemini AI
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Получите бесплатную <br /><span className="text-gradient">Экспресс-Стратегию</span>
            </h2>
            <p className="text-gray-400">
              Введите вашу нишу (например, "Салон красоты в Москве" или "Интернет-магазин автозапчастей"), 
              и наш AI-ассистент предложит 3 точки роста прямо сейчас.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative max-w-lg mx-auto mb-10">
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Введите вашу нишу..."
              className="w-full h-16 pl-6 pr-36 rounded-2xl bg-black/30 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-brand-yellow/50 transition-colors"
              disabled={status === LoadingState.LOADING}
            />
            <button
              type="submit"
              disabled={status === LoadingState.LOADING || !niche.trim()}
              className="absolute right-2 top-2 h-12 px-6 bg-gradient-to-r from-brand-yellow to-brand-orange text-brand-dark font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {status === LoadingState.LOADING ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>Анализ</span>
                  <Send size={18} />
                </>
              )}
            </button>
          </form>

          {status === LoadingState.ERROR && (
            <div className="text-center text-red-400 bg-red-900/20 p-4 rounded-xl">
              Произошла ошибка при соединении с AI. Пожалуйста, проверьте подключение или попробуйте позже.
            </div>
          )}

          {result && (
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 animate-fade-in">
              <div className="prose prose-invert max-w-none">
                <h3 className="text-xl font-bold text-brand-yellow mb-4">Результат анализа для: "{niche}"</h3>
                <div className="whitespace-pre-wrap text-gray-300 leading-relaxed font-light">
                  {result}
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10 text-center">
                <p className="text-sm text-gray-400 mb-4">Это лишь поверхностный взгляд. Хотите детальный план действий?</p>
                <a href="#contact" className="inline-block px-6 py-3 border border-brand-yellow text-brand-yellow font-bold rounded-lg hover:bg-brand-yellow hover:text-brand-dark transition-all">
                  Записаться на разбор
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default AIStrategist;
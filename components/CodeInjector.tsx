
import React, { useEffect } from 'react';
import { dataManager } from '../services/dataManager';

const CodeInjector: React.FC = () => {
  useEffect(() => {
    const settings = dataManager.getSettings();

    // Helper to safely inject script/html
    const injectHTML = (htmlString: string, location: 'head' | 'body') => {
      if (!htmlString) return;

      const range = document.createRange();
      const fragment = range.createContextualFragment(htmlString);
      
      if (location === 'head') {
        document.head.appendChild(fragment);
      } else {
        document.body.appendChild(fragment);
      }
    };

    // Inject Header Code
    // Note: React effects run after initial render, so this is client-side injection.
    // For true tracking pixels, this is usually sufficient in SPA.
    injectHTML(settings.headerCode, 'head');
    injectHTML(settings.footerCode, 'body');

    // Cleanup isn't perfect for raw injected scripts, but we avoid re-injecting on re-renders
    // by using an empty dependency array.
  }, []);

  return null;
};

export default CodeInjector;

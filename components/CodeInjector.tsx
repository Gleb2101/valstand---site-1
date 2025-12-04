
import React, { useEffect } from 'react';
import { dataManager } from '../services/dataManager';

const CodeInjector: React.FC = () => {
  useEffect(() => {
    const load = async () => {
        const settings = await dataManager.getSettings();

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

        injectHTML(settings.headerCode, 'head');
        injectHTML(settings.footerCode, 'body');
    };
    load();
  }, []);

  return null;
};

export default CodeInjector;

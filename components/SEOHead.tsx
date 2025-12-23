import React, { useEffect, useRef } from 'react';
import { dataManager } from '../services/dataManager';

interface SEOHeadProps {
  pageKey: string;
  dynamicTitle?: string;
  dynamicDescription?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ pageKey, dynamicTitle, dynamicDescription }) => {
  const isFirstLoad = useRef(true);

  useEffect(() => {
    const load = async () => {
        const settings = await dataManager.getSettings();
        
        // If we have dynamic content (like a blog post title), it usually comes from App.tsx logic
        // We prioritize Admin SEO config -> Dynamic Title -> Site Default
        const seoConfig = settings.seo?.[pageKey];

        let title = '';
        if (seoConfig && seoConfig.title && seoConfig.title.trim() !== '') {
            title = seoConfig.title;
        } else if (dynamicTitle) {
            title = `${dynamicTitle} | Valstand`;
        }

        // ONLY update the title if we actually found a specific configuration
        // This prevents overwriting the server-injected title with a "Valstand Agency" default during the first few ms
        if (title) {
            document.title = title;
        } else if (isFirstLoad.current) {
            // On first load, if no specific title is found, we assume the server-injected one is correct
            isFirstLoad.current = false;
        } else {
            // If it's a client-side navigation and no title found, use default
            document.title = 'Valstand | Маркетинговое Агентство';
        }

        // --- Meta Tags ---
        const description = seoConfig?.description || dynamicDescription || '';
        const keywords = seoConfig?.keywords || '';
        const ogImage = seoConfig?.ogImage || '';

        const updateMeta = (nameOrProperty: string, content: string, isProperty = false) => {
            const attr = isProperty ? 'property' : 'name';
            let element = document.querySelector(`meta[${attr}="${nameOrProperty}"]`);
            
            if (content) {
                if (!element) {
                    element = document.createElement('meta');
                    element.setAttribute(attr, nameOrProperty);
                    document.head.appendChild(element);
                }
                element.setAttribute('content', content);
            }
        };

        if (description) {
            updateMeta('description', description);
            updateMeta('og:description', description, true);
            updateMeta('twitter:description', description);
        }
        
        if (keywords) updateMeta('keywords', keywords);
        
        if (title) {
            updateMeta('og:title', title, true);
            updateMeta('twitter:title', title);
        }

        if (ogImage) {
            updateMeta('og:image', ogImage, true);
            updateMeta('twitter:image', ogImage);
        }

        // Favicon
        if (settings.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (link) link.href = settings.favicon;
        }
    };
    
    load();
  }, [pageKey, dynamicTitle, dynamicDescription]);

  return null;
};

export default SEOHead;
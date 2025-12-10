
import React, { useEffect } from 'react';
import { dataManager } from '../services/dataManager';

interface SEOHeadProps {
  pageKey: string;
  dynamicTitle?: string;
  dynamicDescription?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ pageKey, dynamicTitle, dynamicDescription }) => {
  useEffect(() => {
    const load = async () => {
        const settings = await dataManager.getSettings();
        const seoConfig = settings.seo[pageKey];

        // --- 1. Title ---
        let title = 'Valstand Agency';
        if (seoConfig && seoConfig.title && seoConfig.title.trim() !== '') {
        title = seoConfig.title;
        } else if (dynamicTitle) {
        title = `${dynamicTitle} | Valstand`;
        }
        document.title = title;

        // --- 2. Description ---
        let description = '';
        if (seoConfig && seoConfig.description && seoConfig.description.trim() !== '') {
        description = seoConfig.description;
        } else if (dynamicDescription) {
        description = dynamicDescription;
        }

        // --- 3. Keywords & Image ---
        const keywords = seoConfig?.keywords || '';
        const ogImage = seoConfig?.ogImage || '';

        // --- 4. Favicon ---
        if (settings.favicon) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = settings.favicon;
        }

        // --- Helper to update or create meta tags ---
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
        } else if (element) {
            element.remove();
        }
        };

        updateMeta('description', description);
        updateMeta('keywords', keywords);
        updateMeta('og:title', title, true);
        updateMeta('og:description', description, true);
        updateMeta('og:image', ogImage, true);
        updateMeta('og:type', 'website', true);
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', title);
        updateMeta('twitter:description', description);
        if (ogImage) updateMeta('twitter:image', ogImage);
    };
    load();

  }, [pageKey, dynamicTitle, dynamicDescription]);

  return null;
};

export default SEOHead;

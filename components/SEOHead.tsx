
import React, { useEffect } from 'react';
import { dataManager } from '../services/dataManager';

interface SEOHeadProps {
  pageKey: string;
  dynamicTitle?: string;
  dynamicDescription?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({ pageKey, dynamicTitle, dynamicDescription }) => {
  useEffect(() => {
    const settings = dataManager.getSettings();
    const seoConfig = settings.seo[pageKey];

    // Priority: CMS Config > Dynamic Prop > Default Fallback
    // If CMS has a title for this specific key (e.g. "service:targeting"), use it.
    // Otherwise use dynamicTitle (e.g. "Targeting") and append suffix.
    
    let title = 'Valstand Agency';
    if (seoConfig && seoConfig.title && seoConfig.title.trim() !== '') {
      title = seoConfig.title;
    } else if (dynamicTitle) {
      title = `${dynamicTitle} | Valstand`;
    }

    // Determine Description
    let description = '';
    if (seoConfig && seoConfig.description && seoConfig.description.trim() !== '') {
      description = seoConfig.description;
    } else if (dynamicDescription) {
      description = dynamicDescription;
    }

    // Update Document Title
    document.title = title;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);

  }, [pageKey, dynamicTitle, dynamicDescription]);

  return null;
};

export default SEOHead;

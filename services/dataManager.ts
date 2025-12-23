import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings, BlogPost, StoredImage, ServiceItem, ServicePackage } from '../types';
import { CASES, TESTIMONIALS, TEAM_MEMBERS, BLOG_POSTS, BLOG_CATEGORIES, SERVICES, PACKAGES } from '../constants';

const API_URL = '/api';

const DEFAULT_SEO = {
  home: {
    title: 'Valstand | Маркетинговое Агентство',
    description: 'Комплексное маркетинговое агентство: Таргет, SEO, Контент-стратегии.'
  },
  services: {
    title: 'Услуги | Valstand Agency',
    description: 'Полный спектр digital-услуг.'
  },
  cases: { title: 'Кейсы', description: '' },
  about: { title: 'О нас', description: '' },
  blog: { title: 'Блог', description: '' },
  contact: { title: 'Контакты', description: '' }
};

// Cache storage
const cache: Record<string, Promise<any> | null> = {
    services: null,
    packages: null,
    cases: null,
    testimonials: null,
    team: null,
    blog_posts: null,
    categories: null,
    popups: null,
    settings: null,
    images: null
};

// Helper to clear cache
const invalidateCache = (key: string) => {
    cache[key] = null;
};

// Fallback to constants if server is offline or slow
const fetchWithFallback = async <T>(endpoint: string, fallback: T): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout

  try {
    const res = await fetch(`${API_URL}/${endpoint}`, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    
    if (Array.isArray(data) && data.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
        return fallback; 
    }
    return data;
  } catch (e: any) {
    clearTimeout(timeoutId);
    console.warn(`API ${endpoint} failed or timed out, using fallback. Error:`, e.message);
    return fallback;
  }
};

// Helper for cached requests
const getCached = <T>(key: string, endpoint: string, fallback: T): Promise<T> => {
    if (!cache[key]) {
        cache[key] = fetchWithFallback(endpoint, fallback).catch(err => {
            cache[key] = null; 
            throw err;
        });
    }
    return cache[key];
};

const postData = async (endpoint: string, data: any) => {
    try {
        const res = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`Server error: ${res.status} ${errText}`);
        }
    } catch (e: any) {
        console.error(`Save to ${endpoint} failed`, e);
        throw e; 
    }
};

const deleteData = async (endpoint: string, id: string | number) => {
    try {
        const res = await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
    } catch (e: any) {
        console.error("Delete failed", e);
        throw e;
    }
};

export const dataManager = {
  init: async () => {
     try {
       await fetch(`${API_URL}/status`); 
     } catch (e: any) {}
  },

  // Services
  getServices: (): Promise<ServiceItem[]> => {
      return getCached('services', 'services', SERVICES).then(items => {
          return items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      });
  },
  saveService: async (item: ServiceItem) => {
      await postData('services', item);
      invalidateCache('services');
  },
  deleteService: async (id: string) => {
      await deleteData('services', id);
      invalidateCache('services');
  },

  // Packages
  getPackages: (): Promise<ServicePackage[]> => {
    return getCached('packages', 'packages', PACKAGES);
  },
  savePackage: async (item: ServicePackage) => {
      await postData('packages', item);
      invalidateCache('packages');
  },
  deletePackage: async (id: string) => {
      await deleteData('packages', id);
      invalidateCache('packages');
  },

  // Cases
  getCases: (): Promise<CaseStudy[]> => getCached('cases', 'cases', CASES),
  saveCase: async (item: CaseStudy) => {
      await postData('cases', item);
      invalidateCache('cases');
  },
  deleteCase: async (id: string) => {
      await deleteData('cases', id);
      invalidateCache('cases');
  },

  // Testimonials
  getTestimonials: (): Promise<Testimonial[]> => getCached('testimonials', 'testimonials', TESTIMONIALS),
  saveTestimonial: async (item: Testimonial) => {
      await postData('testimonials', item);
      invalidateCache('testimonials');
  },
  deleteTestimonial: async (id: number) => {
      await deleteData('testimonials', id);
      invalidateCache('testimonials');
  },

  // Team
  getTeam: (): Promise<TeamMember[]> => getCached('team', 'team', TEAM_MEMBERS),
  saveTeamMember: async (item: TeamMember) => {
      await postData('team', item);
      invalidateCache('team');
  },
  deleteTeamMember: async (id: string) => {
      await deleteData('team', id);
      invalidateCache('team');
  },

  // Blog
  getBlogPosts: (): Promise<BlogPost[]> => getCached('blog_posts', 'blog_posts', BLOG_POSTS),
  saveBlogPost: async (item: BlogPost) => {
      await postData('blog_posts', item);
      invalidateCache('blog_posts');
  },
  deleteBlogPost: async (id: string) => {
      await deleteData('blog_posts', id);
      invalidateCache('blog_posts');
  },

  // Categories
  getCategories: (): Promise<string[]> => getCached('categories', 'categories', BLOG_CATEGORIES.filter(c => c !== 'Все')),
  addCategory: async (cat: string) => {
      await postData('categories', { name: cat });
      invalidateCache('categories');
  },
  deleteCategory: async (cat: string) => {
      await deleteData('categories', cat);
      invalidateCache('categories');
  },

  // Leads
  getLeads: async (): Promise<Lead[]> => fetchWithFallback('leads', []),
  addLead: async (lead: Omit<Lead, 'id' | 'date' | 'status'>) => {
    const date = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const newLead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      date: date,
      status: 'new'
    };
    await postData('leads', newLead);
  },
  updateLeadStatus: async (id: string, status: Lead['status']) => {
      try {
        await fetch(`${API_URL}/leads/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
      } catch (e: any) {}
  },
  deleteLead: async (id: string) => deleteData('leads', id),

  // Popups
  getPopups: (): Promise<Popup[]> => getCached('popups', 'popups', []),
  savePopup: async (item: Popup) => {
      await postData('popups', item);
      invalidateCache('popups');
  },
  deletePopup: async (id: string) => {
      await deleteData('popups', id);
      invalidateCache('popups');
  },

  // Images
  getImages: (): Promise<StoredImage[]> => getCached('images', 'images', []),
  saveImage: async (item: StoredImage) => {
      await postData('images', item);
      invalidateCache('images');
  },
  deleteImage: async (id: string) => {
      await deleteData('images', id);
      invalidateCache('images');
  },

  // Settings
  getSettings: async (): Promise<SiteSettings> => {
      if (cache.settings) return cache.settings;
      
      const fallback: SiteSettings = { headerCode: '', footerCode: '', seo: DEFAULT_SEO, socials: {} };
      cache.settings = fetchWithFallback('settings', fallback).then(settings => {
           if (!settings.seo) settings.seo = DEFAULT_SEO;
           return settings;
      });
      return cache.settings;
  },
  saveSettings: async (settings: SiteSettings) => {
      await postData('settings', settings);
      invalidateCache('settings');
  },

  // SEO Files
  getSeoFiles: async (): Promise<{ robots_txt: string; sitemap_xml: string }> => {
      try {
          const res = await fetch(`${API_URL}/seo-files`);
          if (!res.ok) throw new Error('Failed to fetch seo files');
          return await res.json();
      } catch (e) {
          return { robots_txt: '', sitemap_xml: '' };
      }
  },
  saveSeoFiles: async (files: { robots_txt?: string; sitemap_xml?: string }) => {
      await postData('seo-files', files);
  }
};

import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings, BlogPost, StoredImage, ServiceItem } from '../types';
import { CASES, TESTIMONIALS, TEAM_MEMBERS, BLOG_POSTS, BLOG_CATEGORIES, SERVICES } from '../constants';

// Так как мы раздаем статику через Node.js, API всегда доступно по относительному пути '/api'
// Это работает и локально (через прокси Vite), и на продакшене.
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

// Fallback to constants if server is offline
const fetchWithFallback = async <T>(endpoint: string, fallback: T): Promise<T> => {
  try {
    const res = await fetch(`${API_URL}/${endpoint}`);
    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length === 0 && Array.isArray(fallback) && fallback.length > 0) {
        return fallback; 
    }
    return data;
  } catch (e: any) {
    console.warn(`API ${endpoint} failed, using fallback. Error:`, e);
    const ls = localStorage.getItem(`valstand_${endpoint}`);
    if (ls) return JSON.parse(ls);
    return fallback;
  }
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
        const errorMsg = e?.message || String(e);
        alert(`Ошибка сохранения данных: ${errorMsg}.`);
        throw e; 
    }
};

const deleteData = async (endpoint: string, id: string | number) => {
    try {
        const res = await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Delete failed');
    } catch (e: any) {
        console.error("Delete failed", e);
        alert('Ошибка удаления. Сервер недоступен.');
        throw e;
    }
};

export const dataManager = {
  init: async () => {
     try {
       await fetch(`${API_URL}`); 
     } catch (e: any) {
       console.log("Backend offline");
     }
  },

  // Services
  getServices: async (): Promise<ServiceItem[]> => fetchWithFallback('services', SERVICES),
  saveService: async (item: ServiceItem) => postData('services', item),
  deleteService: async (id: string) => deleteData('services', id),

  // Cases
  getCases: async (): Promise<CaseStudy[]> => fetchWithFallback('cases', CASES),
  saveCase: async (item: CaseStudy) => postData('cases', item),
  deleteCase: async (id: string) => deleteData('cases', id),

  // Testimonials
  getTestimonials: async (): Promise<Testimonial[]> => fetchWithFallback('testimonials', TESTIMONIALS),
  saveTestimonial: async (item: Testimonial) => postData('testimonials', item),
  deleteTestimonial: async (id: number) => deleteData('testimonials', id),

  // Team
  getTeam: async (): Promise<TeamMember[]> => fetchWithFallback('team', TEAM_MEMBERS),
  saveTeamMember: async (item: TeamMember) => postData('team', item),

  // Blog
  getBlogPosts: async (): Promise<BlogPost[]> => fetchWithFallback('blog_posts', BLOG_POSTS),
  saveBlogPost: async (item: BlogPost) => postData('blog_posts', item),
  deleteBlogPost: async (id: string) => deleteData('blog_posts', id),

  // Categories
  getCategories: async (): Promise<string[]> => fetchWithFallback('categories', BLOG_CATEGORIES.filter(c => c !== 'Все')),
  addCategory: async (cat: string) => postData('categories', { name: cat }),
  deleteCategory: async (cat: string) => deleteData('categories', cat),

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
      } catch (e: any) { console.error(e); }
  },
  deleteLead: async (id: string) => deleteData('leads', id),

  // Popups
  getPopups: async (): Promise<Popup[]> => fetchWithFallback('popups', []),
  savePopup: async (item: Popup) => postData('popups', item),
  deletePopup: async (id: string) => deleteData('popups', id),

  // Images
  getImages: async (): Promise<StoredImage[]> => fetchWithFallback('images', []),
  saveImage: async (item: StoredImage) => postData('images', item),
  deleteImage: async (id: string) => deleteData('images', id),

  // Settings
  getSettings: async (): Promise<SiteSettings> => {
      const fallback = { headerCode: '', footerCode: '', seo: DEFAULT_SEO, socials: {} };
      const settings = await fetchWithFallback('settings', fallback);
      if (!settings.seo) settings.seo = DEFAULT_SEO;
      return settings;
  },
  saveSettings: async (settings: SiteSettings) => postData('settings', settings)
};

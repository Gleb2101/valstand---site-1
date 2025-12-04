
import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings, BlogPost, StoredImage } from '../types';
import { CASES, TESTIMONIALS, TEAM_MEMBERS, BLOG_POSTS, BLOG_CATEGORIES } from '../constants';

const API_URL = 'http://localhost:3001/api';

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
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    // If array is empty, maybe return fallback? No, DB might be genuinely empty.
    // But if DB returns nothing on first load, we might want to seed it? 
    // For now, return DB data.
    return data;
  } catch (e) {
    console.warn(`API ${endpoint} failed, using fallback.`, e);
    // Try localStorage as second fallback layer
    const ls = localStorage.getItem(`valstand_${endpoint}`);
    if (ls) return JSON.parse(ls);
    return fallback;
  }
};

const postData = async (endpoint: string, data: any) => {
    try {
        await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        // Also save to LS for redundancy
        // localStorage.setItem(`valstand_${endpoint}`, ... logic is complex for arrays, skipping LS write for post);
    } catch (e) {
        console.error("Save failed", e);
        alert("Ошибка сохранения на сервере");
    }
};

const deleteData = async (endpoint: string, id: string | number) => {
    try {
        await fetch(`${API_URL}/${endpoint}/${id}`, { method: 'DELETE' });
    } catch (e) {
        console.error("Delete failed", e);
    }
};

export const dataManager = {
  init: async () => {
     // Optional: Check server health
  },

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
    const newLead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
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
      } catch (e) { console.error(e); }
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
      const fallback = { headerCode: '', footerCode: '', seo: DEFAULT_SEO };
      const settings = await fetchWithFallback('settings', fallback);
      if (!settings.seo) settings.seo = DEFAULT_SEO;
      return settings;
  },
  saveSettings: async (settings: SiteSettings) => postData('settings', settings)
};



import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings } from '../types';
import { CASES, TESTIMONIALS, TEAM_MEMBERS } from '../constants';

const KEYS = {
  CASES: 'valstand_cases',
  TESTIMONIALS: 'valstand_testimonials',
  LEADS: 'valstand_leads',
  TEAM: 'valstand_team',
  POPUPS: 'valstand_popups',
  SETTINGS: 'valstand_settings'
};

const DEFAULT_SEO = {
  home: {
    title: 'Valstand | Маркетинговое Агентство',
    description: 'Комплексное маркетинговое агентство: Таргет, SEO, Контент-стратегии. Современные решения для роста вашего бизнеса.'
  },
  services: {
    title: 'Услуги | Valstand Agency',
    description: 'Таргетированная реклама, SEO продвижение, SMM, Разработка сайтов и брендинг. Полный спектр digital-услуг.'
  },
  cases: {
    title: 'Кейсы и Портфолио | Valstand',
    description: 'Реальные примеры наших работ с цифрами и результатами. Посмотрите, как мы решаем задачи бизнеса.'
  },
  about: {
    title: 'О нас | Valstand Team',
    description: 'Команда профессиональных маркетологов, дизайнеров и разработчиков. Работаем на результат.'
  },
  reviews: {
    title: 'Отзывы Клиентов | Valstand',
    description: 'Что говорят о нас наши клиенты. Реальные отзывы о работе с маркетинговым агентством Valstand.'
  },
  contact: {
    title: 'Контакты | Valstand',
    description: 'Свяжитесь с нами для обсуждения вашего проекта. Офис в Москва-Сити, телефон и email.'
  }
};

// Initialize data if not exists
const initData = () => {
  if (!localStorage.getItem(KEYS.CASES)) {
    localStorage.setItem(KEYS.CASES, JSON.stringify(CASES));
  }
  if (!localStorage.getItem(KEYS.TESTIMONIALS)) {
    localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(TESTIMONIALS));
  }
  if (!localStorage.getItem(KEYS.TEAM)) {
    localStorage.setItem(KEYS.TEAM, JSON.stringify(TEAM_MEMBERS));
  }
  if (!localStorage.getItem(KEYS.LEADS)) {
    localStorage.setItem(KEYS.LEADS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.POPUPS)) {
    localStorage.setItem(KEYS.POPUPS, JSON.stringify([]));
  }
  
  // Settings initialization with migration support for existing data
  const existingSettings = localStorage.getItem(KEYS.SETTINGS);
  if (!existingSettings) {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify({ 
      headerCode: '', 
      footerCode: '',
      seo: DEFAULT_SEO
    }));
  } else {
    // Migration: Check if seo exists, if not add it
    const settings = JSON.parse(existingSettings);
    if (!settings.seo) {
      settings.seo = DEFAULT_SEO;
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    }
  }
};

export const dataManager = {
  init: initData,

  // Cases
  getCases: (): CaseStudy[] => {
    const data = localStorage.getItem(KEYS.CASES);
    return data ? JSON.parse(data) : CASES;
  },
  saveCase: (item: CaseStudy) => {
    const items = dataManager.getCases();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(KEYS.CASES, JSON.stringify(items));
  },
  deleteCase: (id: string) => {
    const items = dataManager.getCases().filter(i => i.id !== id);
    localStorage.setItem(KEYS.CASES, JSON.stringify(items));
  },

  // Testimonials
  getTestimonials: (): Testimonial[] => {
    const data = localStorage.getItem(KEYS.TESTIMONIALS);
    return data ? JSON.parse(data) : TESTIMONIALS;
  },
  saveTestimonial: (item: Testimonial) => {
    const items = dataManager.getTestimonials();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      item.id = Date.now();
      items.push(item);
    }
    localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(items));
  },
  deleteTestimonial: (id: number) => {
    const items = dataManager.getTestimonials().filter(i => i.id !== id);
    localStorage.setItem(KEYS.TESTIMONIALS, JSON.stringify(items));
  },

  // Team
  getTeam: (): TeamMember[] => {
    const data = localStorage.getItem(KEYS.TEAM);
    return data ? JSON.parse(data) : TEAM_MEMBERS;
  },
  saveTeamMember: (item: TeamMember) => {
    const items = dataManager.getTeam();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    }
    localStorage.setItem(KEYS.TEAM, JSON.stringify(items));
  },

  // Leads
  getLeads: (): Lead[] => {
    const data = localStorage.getItem(KEYS.LEADS);
    return data ? JSON.parse(data) : [];
  },
  addLead: (lead: Omit<Lead, 'id' | 'date' | 'status'>) => {
    const leads = dataManager.getLeads();
    const newLead: Lead = {
      ...lead,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      status: 'new'
    };
    leads.unshift(newLead);
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },
  updateLeadStatus: (id: string, status: Lead['status']) => {
    const leads = dataManager.getLeads();
    const lead = leads.find(l => l.id === id);
    if (lead) {
      lead.status = status;
      localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
    }
  },
  deleteLead: (id: string) => {
    const leads = dataManager.getLeads().filter(l => l.id !== id);
    localStorage.setItem(KEYS.LEADS, JSON.stringify(leads));
  },

  // Popups
  getPopups: (): Popup[] => {
    const data = localStorage.getItem(KEYS.POPUPS);
    return data ? JSON.parse(data) : [];
  },
  savePopup: (item: Popup) => {
    const items = dataManager.getPopups();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(KEYS.POPUPS, JSON.stringify(items));
  },
  deletePopup: (id: string) => {
    const items = dataManager.getPopups().filter(i => i.id !== id);
    localStorage.setItem(KEYS.POPUPS, JSON.stringify(items));
  },

  // Settings
  getSettings: (): SiteSettings => {
    const data = localStorage.getItem(KEYS.SETTINGS);
    const parsed = data ? JSON.parse(data) : { headerCode: '', footerCode: '', seo: DEFAULT_SEO };
    if (!parsed.seo) parsed.seo = DEFAULT_SEO;
    return parsed;
  },
  saveSettings: (settings: SiteSettings) => {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  }
};
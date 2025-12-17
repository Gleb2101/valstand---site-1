
export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  fullDescription: string;
  benefits: { title: string; desc: string }[];
  process: { 
    step: string; 
    desc: string;
    details?: string;
    exampleImage?: string;
  }[];
  orderIndex?: number; // Added for ordering
}

export interface ServicePackage {
  id: string;
  title: string;
  subtitle: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  // Detailed fields
  fullDescription: string;
  timeline: string;
  benefits: { title: string; desc: string }[];
  detailedFeatures: { title: string; description: string }[];
}

export interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  text: string;
  avatar: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  results: { label: string; value: string }[];
  tags: string[];
  clientInfo?: string;
  challenge?: string;
  solution?: string;
  fullDescription?: string;
  serviceId?: string; // Linked service ID
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  description: string;
  image: string;
}

export interface Lead {
  id: string;
  name: string;
  phone: string;
  service: string;
  status: 'new' | 'contacted' | 'archived';
  date: string;
}

export interface Popup {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  imageWidth?: number; // percentage
  hasForm: boolean;
  isActive: boolean;
  delaySeconds: number;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string; // HTML
  image: string;
  category: string;
  date: string;
  author: string;
}

export interface PageSEO {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
}

export interface MailConfig {
  host: string;
  port: string;
  user: string;
  pass: string;
  receiverEmail: string;
  enabled: boolean;
}

export interface SiteSettings {
  favicon?: string; 
  logo?: string; // URL to logo
  socials?: {
    vk?: string;
    telegram?: string;
    tj?: string;
    vc?: string;
  };
  headerCode: string; 
  footerCode: string; 
  seo: Record<string, PageSEO>;
  mailConfig?: MailConfig;
}

export interface StoredImage {
  id: string;
  name: string;
  data: string; // base64
  date: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
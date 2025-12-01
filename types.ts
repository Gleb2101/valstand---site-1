

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

export interface PageSEO {
  title: string;
  description: string;
}

export interface SiteSettings {
  headerCode: string; // HTML/JS for <head>
  footerCode: string; // HTML/JS for end of <body>
  seo: Record<string, PageSEO>;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}
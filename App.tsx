
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import ContactForm from './components/ContactForm';
import Footer from './components/Footer';
import ServiceDetail from './components/ServiceDetail';
import PackageDetail from './components/PackageDetail';
import CasesPage from './components/CasesPage';
import FAQ from './components/FAQ';
import PrivacyPolicy from './components/PrivacyPolicy';
import CaseDetail from './components/CaseDetail';
import AboutPreview from './components/AboutPreview';
import AboutPage from './components/AboutPage';
import AdminPanel from './components/AdminPanel';
import CodeInjector from './components/CodeInjector';
import GlobalPopup from './components/GlobalPopup';
import SEOHead from './components/SEOHead';
import BlogPage from './components/BlogPage';
import BlogPreview from './components/BlogPreview';
import BlogPostView from './components/BlogPost';
import { SERVICES, PACKAGES } from './constants';
import { dataManager } from './services/dataManager';
import { CaseStudy, BlogPost } from './types';

type ViewState = 
  | { type: 'home' }
  | { type: 'services' }
  | { type: 'cases' }
  | { type: 'about' }
  | { type: 'blog' }
  | { type: 'contact' }
  | { type: 'privacy' }
  | { type: 'admin' }
  | { type: 'service', serviceId: string }
  | { type: 'package-detail', packageId: string }
  | { type: 'case-detail', caseId: string }
  | { type: 'blog-post', postId: string };

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [selectedContactService, setSelectedContactService] = useState<string>('Комплексное продвижение');
  
  // Dynamic data loading needed for routing & SEO
  const [dynamicCases, setDynamicCases] = useState<CaseStudy[]>([]);
  const [dynamicPosts, setDynamicPosts] = useState<BlogPost[]>([]);

  // Navigation Logic with Hash Routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      
      if (!hash || hash === 'home') {
        setView({ type: 'home' });
      } else if (hash === 'services') {
        setView({ type: 'services' });
      } else if (hash === 'cases') {
        setView({ type: 'cases' });
      } else if (hash === 'about') {
        setView({ type: 'about' });
      } else if (hash === 'blog') {
        setView({ type: 'blog' });
      } else if (hash === 'contact') {
        setView({ type: 'contact' });
      } else if (hash === 'privacy') {
        setView({ type: 'privacy' });
      } else if (hash === 'admin') {
        setView({ type: 'admin' });
      } else if (hash.startsWith('service/')) {
        setView({ type: 'service', serviceId: hash.split('/')[1] });
      } else if (hash.startsWith('package/')) {
        setView({ type: 'package-detail', packageId: hash.split('/')[1] });
      } else if (hash.startsWith('case/')) {
        setView({ type: 'case-detail', caseId: hash.split('/')[1] });
      } else if (hash.startsWith('blog/')) {
        setView({ type: 'blog-post', postId: hash.split('/')[1] });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Initial check

    // Initial Data Load
    const loadData = async () => {
       await dataManager.init();
       setDynamicCases(await dataManager.getCases());
       setDynamicPosts(await dataManager.getBlogPosts());
    };
    loadData();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (page: string) => {
     window.location.hash = page;
  };

  const navigateToService = (serviceId: string) => {
    window.location.hash = `service/${serviceId}`;
  };

  const navigateToPackage = (packageId: string) => {
    window.location.hash = `package/${packageId}`;
  };

  const navigateToCase = (caseId: string) => {
    window.location.hash = `case/${caseId}`;
  };

  const navigateToBlogPost = (postId: string) => {
    window.location.hash = `blog/${postId}`;
  };

  const handleQuickOrder = (serviceTitle: string) => {
    setSelectedContactService(serviceTitle);
    window.location.hash = 'contact';
  };

  const getCurrentPageKey = () => {
    if (view.type === 'service') return `service:${view.serviceId}`;
    if (view.type === 'package-detail') return `package:${view.packageId}`;
    if (view.type === 'case-detail') return `case:${view.caseId}`;
    if (view.type === 'blog-post') return `blog:${view.postId}`;
    return view.type;
  };

  // Determine dynamic props for SEO
  let dynamicTitle;
  let dynamicDescription;
  
  if (view.type === 'service') {
    const s = SERVICES.find(s => s.id === view.serviceId);
    if (s) {
      dynamicTitle = s.title;
      dynamicDescription = s.description;
    }
  } else if (view.type === 'package-detail') {
    const p = PACKAGES.find(p => p.id === view.packageId);
    if (p) {
      dynamicTitle = `Пакет "${p.title}"`;
      dynamicDescription = p.description;
    }
  } else if (view.type === 'case-detail') {
    const c = dynamicCases.find(c => c.id === view.caseId);
    if (c) {
      dynamicTitle = c.title;
      dynamicDescription = c.description;
    }
  } else if (view.type === 'blog-post') {
    const p = dynamicPosts.find(p => p.id === view.postId);
    if (p) {
      dynamicTitle = p.title;
      dynamicDescription = p.excerpt;
    }
  }

  // Admin View takes over full screen
  if (view.type === 'admin') {
    return <AdminPanel onBack={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-orange selection:text-white flex flex-col">
      <CodeInjector />
      <GlobalPopup />
      <SEOHead 
        pageKey={getCurrentPageKey()} 
        dynamicTitle={dynamicTitle}
        dynamicDescription={dynamicDescription}
      />
      
      <Header onNavigate={navigateTo} currentPage={getCurrentPageKey()} />
      
      <main className="flex-grow">
        {view.type === 'home' && (
          <>
            <Hero onNavigate={navigateTo} />
            <Services 
              onSelectService={navigateToService} 
              onQuickOrder={handleQuickOrder}
              isHomePreview={true}
            />
            <AboutPreview onNavigate={() => navigateTo('about')} />
            <div id="cases">
              <CasesPage 
                onOrder={() => navigateTo('contact')} 
                isHomePreview={true}
                onViewAll={() => navigateTo('cases')}
                onSelectCase={navigateToCase}
              />
            </div>
            <BlogPreview onSelectPost={navigateToBlogPost} onViewAll={() => navigateTo('blog')} />
            <FAQ />
            <Testimonials />
            <ContactForm selectedService={selectedContactService} onNavigate={navigateTo} />
          </>
        )}

        {view.type === 'services' && (
          <div className="pt-20">
             <Services 
              onSelectService={navigateToService} 
              onQuickOrder={handleQuickOrder}
              isHomePreview={false}
              onViewPackage={navigateToPackage}
            />
          </div>
        )}

        {view.type === 'cases' && (
          <CasesPage 
            onOrder={() => navigateTo('contact')} 
            onSelectCase={navigateToCase}
          />
        )}

        {view.type === 'about' && (
          <AboutPage />
        )}

        {view.type === 'blog' && (
          <BlogPage onSelectPost={navigateToBlogPost} />
        )}

        {view.type === 'blog-post' && (
          <BlogPostView 
            post={dynamicPosts.find(p => p.id === view.postId) || dynamicPosts[0]}
            onBack={() => navigateTo('blog')}
            onNavigate={navigateTo}
          />
        )}

        {view.type === 'contact' && (
          <div className="pt-20 min-h-screen flex flex-col justify-center">
            <ContactForm selectedService={selectedContactService} isPage={true} onNavigate={navigateTo} />
          </div>
        )}

        {view.type === 'service' && (
          <ServiceDetail 
            service={SERVICES.find(s => s.id === view.serviceId) || SERVICES[0]} 
            onBack={() => navigateTo('services')}
            onNavigate={navigateTo}
          />
        )}

        {view.type === 'package-detail' && (
          <PackageDetail
            pkg={PACKAGES.find(p => p.id === view.packageId) || PACKAGES[0]}
            onBack={() => navigateTo('services')}
            onNavigate={navigateTo}
          />
        )}

        {view.type === 'case-detail' && (
          <CaseDetail 
            caseStudy={dynamicCases.find(c => c.id === view.caseId) || dynamicCases[0]}
            onBack={() => navigateTo('cases')}
            onOrder={() => navigateTo('contact')}
          />
        )}

        {view.type === 'privacy' && (
          <PrivacyPolicy onBack={() => navigateTo('home')} />
        )}
      </main>
      
      <Footer onNavigate={navigateTo} />
    </div>
  );
};

export default App;

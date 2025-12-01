
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
import { SERVICES, PACKAGES } from './constants';
import { dataManager } from './services/dataManager';

type ViewState = 
  | { type: 'home' }
  | { type: 'services' }
  | { type: 'cases' }
  | { type: 'about' }
  | { type: 'reviews' }
  | { type: 'contact' }
  | { type: 'privacy' }
  | { type: 'admin' }
  | { type: 'service', serviceId: string }
  | { type: 'package-detail', packageId: string }
  | { type: 'case-detail', caseId: string };

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>({ type: 'home' });
  const [selectedContactService, setSelectedContactService] = useState<string>('Комплексное продвижение');
  
  // Dynamic data loading needed for CaseDetail routing
  const [dynamicCases, setDynamicCases] = useState(dataManager.getCases());

  useEffect(() => {
    // Initialize DB simulation
    dataManager.init();
    setDynamicCases(dataManager.getCases());
  }, []);

  // Handle browser back button
  useEffect(() => {
    const handlePopState = () => {
      // Basic fallback
      setView({ type: 'home' }); 
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (page: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    switch(page) {
      case 'home':
        setView({ type: 'home' });
        break;
      case 'services':
        setView({ type: 'services' });
        break;
      case 'cases':
        setView({ type: 'cases' });
        break;
      case 'about':
        setView({ type: 'about' });
        break;
      case 'reviews':
        setView({ type: 'reviews' });
        break;
      case 'contact':
        setView({ type: 'contact' });
        break;
      case 'privacy':
        setView({ type: 'privacy' });
        break;
      case 'admin':
        setView({ type: 'admin' });
        break;
      default:
        setView({ type: 'home' });
    }
  };

  const navigateToService = (serviceId: string) => {
    setView({ type: 'service', serviceId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPackage = (packageId: string) => {
    setView({ type: 'package-detail', packageId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCase = (caseId: string) => {
    // Refresh cases data before navigating to ensure we have the latest
    setDynamicCases(dataManager.getCases());
    setView({ type: 'case-detail', caseId });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleQuickOrder = (serviceTitle: string) => {
    setSelectedContactService(serviceTitle);
    navigateTo('contact');
  };

  const getCurrentPageKey = () => {
    if (view.type === 'service') return `service:${view.serviceId}`;
    if (view.type === 'package-detail') return `package:${view.packageId}`;
    if (view.type === 'case-detail') return `case:${view.caseId}`;
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
  }

  // Admin View takes over full screen
  if (view.type === 'admin') {
    return <AdminPanel onBack={() => navigateTo('home')} />;
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white selection:bg-brand-orange selection:text-white flex flex-col">
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

        {view.type === 'reviews' && (
          <div className="pt-20">
            <Testimonials isPage={true} />
            <div className="container mx-auto px-4 pb-24 text-center">
              <button 
                onClick={() => navigateTo('contact')}
                className="px-8 py-3 border border-brand-yellow text-brand-yellow hover:bg-brand-yellow hover:text-brand-dark font-bold rounded-xl transition-all"
              >
                Стать нашим клиентом
              </button>
            </div>
          </div>
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

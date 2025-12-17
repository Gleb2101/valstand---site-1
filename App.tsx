
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
import { SERVICES as STATIC_SERVICES, PACKAGES } from './constants';
import { dataManager } from './services/dataManager';
import { CaseStudy, BlogPost, ServiceItem } from './types';
import { Loader } from 'lucide-react';

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
  
  // Dynamic data
  const [dynamicCases, setDynamicCases] = useState<CaseStudy[]>([]);
  const [dynamicPosts, setDynamicPosts] = useState<BlogPost[]>([]);
  const [servicesData, setServicesData] = useState<ServiceItem[]>(STATIC_SERVICES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Data Load in Parallel
    const loadData = async () => {
       setIsLoading(true);
       try {
           // Warm up the server
           dataManager.init(); 
           
           // Fetch all heavy data in parallel
           const [cases, posts, services] = await Promise.all([
               dataManager.getCases(),
               dataManager.getBlogPosts(),
               dataManager.getServices()
           ]);
           
           setDynamicCases(cases);
           setDynamicPosts(posts);
           setServicesData(services);
       } catch (e) {
           console.error("Failed to load initial data", e);
       } finally {
           setIsLoading(false);
       }
    };
    loadData();
  }, []);

  const navigateTo = (page: string) => {
     window.scrollTo(0, 0);
     if (page === 'home' || page === 'services' || page === 'cases' || page === 'about' || page === 'blog' || page === 'contact' || page === 'privacy' || page === 'admin') {
         setView({ type: page });
     } else {
         // Fallback
         setView({ type: 'home' });
     }
  };

  const navigateToService = (serviceId: string) => {
    window.scrollTo(0, 0);
    setView({ type: 'service', serviceId });
  };

  const navigateToPackage = (packageId: string) => {
    window.scrollTo(0, 0);
    setView({ type: 'package-detail', packageId });
  };

  const navigateToCase = (caseId: string) => {
    window.scrollTo(0, 0);
    setView({ type: 'case-detail', caseId });
  };

  const navigateToBlogPost = (postId: string) => {
    window.scrollTo(0, 0);
    setView({ type: 'blog-post', postId });
  };

  const handleQuickOrder = (serviceTitle: string) => {
    setSelectedContactService(serviceTitle);
    setView({ type: 'contact' });
    window.scrollTo(0, 0);
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
    const s = servicesData.find(s => s.id === view.serviceId);
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
    return <AdminPanel onBack={() => {
        // Reload data when returning from admin
        Promise.all([
            dataManager.getServices(),
            dataManager.getCases(),
            dataManager.getBlogPosts()
        ]).then(([s, c, p]) => {
            setServicesData(s);
            setDynamicCases(c);
            setDynamicPosts(p);
            navigateTo('home');
        });
    }} />;
  }
  
  if (isLoading) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <div className="text-center">
                  <Loader className="w-10 h-10 text-brand-orange animate-spin mx-auto mb-4" />
                  <p className="text-slate-500">Загрузка данных...</p>
              </div>
          </div>
      );
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
              services={servicesData}
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
                initialCases={dynamicCases}
              />
            </div>
            <BlogPreview 
                onSelectPost={navigateToBlogPost} 
                onViewAll={() => navigateTo('blog')} 
                initialPosts={dynamicPosts}
            />
            <FAQ />
            <Testimonials />
            <ContactForm services={servicesData} selectedService={selectedContactService} onNavigate={navigateTo} />
          </>
        )}

        {view.type === 'services' && (
          <div className="pt-20">
             <Services 
              services={servicesData}
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
            initialCases={dynamicCases}
          />
        )}

        {view.type === 'about' && (
          <AboutPage />
        )}

        {view.type === 'blog' && (
          <BlogPage onSelectPost={navigateToBlogPost} initialPosts={dynamicPosts} />
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
            <ContactForm services={servicesData} selectedService={selectedContactService} isPage={true} onNavigate={navigateTo} />
          </div>
        )}

        {view.type === 'service' && (
          <ServiceDetail 
            service={servicesData.find(s => s.id === view.serviceId) || servicesData[0]} 
            onBack={() => navigateTo('services')}
            onNavigate={navigateTo}
            relatedCases={dynamicCases}
            onViewCase={navigateToCase}
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

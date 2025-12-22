import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams, Navigate } from 'react-router-dom';
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
import { SERVICES as STATIC_SERVICES, PACKAGES as STATIC_PACKAGES } from './constants';
import { dataManager } from './services/dataManager';
import { CaseStudy, BlogPost, ServiceItem, ServicePackage } from './types';
import { Loader } from 'lucide-react';

// ScrollToTop Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

// --- Route Wrapper Components ---

const ServiceDetailRoute: React.FC<{
  services: ServiceItem[]; 
  cases: CaseStudy[];
  onNavigate: (p: string) => void;
  onViewCase: (id: string) => void;
}> = ({ services, cases, onNavigate, onViewCase }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services.find(s => s.id === id);

  if (!service) return <Navigate to="/services" replace />;

  return (
    <ServiceDetail 
      service={service} 
      onBack={() => navigate('/services')}
      onNavigate={onNavigate}
      relatedCases={cases}
      onViewCase={onViewCase}
    />
  );
};

const PackageDetailRoute: React.FC<{
  packages: ServicePackage[];
  onNavigate: (p: string) => void;
}> = ({ packages, onNavigate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const pkg = packages.find(p => p.id === id);

  if (!pkg) return <Navigate to="/services" replace />;

  return (
    <PackageDetail
      pkg={pkg}
      onBack={() => navigate('/services')}
      onNavigate={onNavigate}
    />
  );
};

const CaseDetailRoute: React.FC<{
  cases: CaseStudy[];
  onNavigate: (p: string) => void;
}> = ({ cases, onNavigate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const caseStudy = cases.find(c => c.id === id);

  if (!caseStudy) return <Navigate to="/cases" replace />;

  return (
    <CaseDetail 
      caseStudy={caseStudy}
      onBack={() => navigate('/cases')}
      onOrder={() => onNavigate('contact')}
    />
  );
};

const BlogPostRoute: React.FC<{
  posts: BlogPost[];
  onNavigate: (p: string) => void;
}> = ({ posts, onNavigate }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const post = posts.find(p => p.id === id);

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <BlogPostView 
      post={post}
      onBack={() => navigate('/blog')}
      onNavigate={onNavigate}
    />
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedContactService, setSelectedContactService] = useState<string>('Комплексное продвижение');
  
  // Dynamic data
  const [dynamicCases, setDynamicCases] = useState<CaseStudy[]>([]);
  const [dynamicPosts, setDynamicPosts] = useState<BlogPost[]>([]);
  const [servicesData, setServicesData] = useState<ServiceItem[]>(STATIC_SERVICES);
  const [packagesData, setPackagesData] = useState<ServicePackage[]>(STATIC_PACKAGES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial Data Load
    const loadData = async () => {
       setIsLoading(true);
       try {
           dataManager.init(); 
           const [cases, posts, services, pkgs] = await Promise.all([
               dataManager.getCases(),
               dataManager.getBlogPosts(),
               dataManager.getServices(),
               dataManager.getPackages()
           ]);
           setDynamicCases(cases);
           setDynamicPosts(posts);
           setServicesData(services);
           setPackagesData(pkgs);
       } catch (e) {
           console.error("Failed to load initial data", e);
       } finally {
           setIsLoading(false);
       }
    };
    loadData();
  }, []);

  const handleNavigate = (page: string) => {
     if (page === 'home') navigate('/');
     else if (page === 'services') navigate('/services');
     else if (page === 'cases') navigate('/cases');
     else if (page === 'about') navigate('/about');
     else if (page === 'blog') navigate('/blog');
     else if (page === 'contact') navigate('/contact');
     else if (page === 'privacy') navigate('/privacy');
     else if (page === 'admin') navigate('/admin');
     else navigate('/');
  };

  const handleQuickOrder = (serviceTitle: string) => {
    setSelectedContactService(serviceTitle);
    navigate('/contact');
  };

  const getCurrentPageKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/services/')) return `service:${path.split('/')[2]}`;
    if (path.startsWith('/packages/')) return `package:${path.split('/')[2]}`;
    if (path.startsWith('/cases/')) return `case:${path.split('/')[2]}`;
    if (path.startsWith('/blog/')) return `blog:${path.split('/')[2]}`;
    return path.substring(1); 
  };

  let dynamicTitle;
  let dynamicDescription;
  const pathParts = location.pathname.split('/');
  
  if (location.pathname.startsWith('/services/') && pathParts[2]) {
    const s = servicesData.find(s => s.id === pathParts[2]);
    if (s) { dynamicTitle = s.title; dynamicDescription = s.description; }
  } else if (location.pathname.startsWith('/packages/') && pathParts[2]) {
    const p = packagesData.find(p => p.id === pathParts[2]);
    if (p) { dynamicTitle = `Пакет "${p.title}"`; dynamicDescription = p.description; }
  } else if (location.pathname.startsWith('/cases/') && pathParts[2]) {
    const c = dynamicCases.find(c => c.id === pathParts[2]);
    if (c) { dynamicTitle = c.title; dynamicDescription = c.description; }
  } else if (location.pathname.startsWith('/blog/') && pathParts[2]) {
    const p = dynamicPosts.find(p => p.id === pathParts[2]);
    if (p) { dynamicTitle = p.title; dynamicDescription = p.excerpt; }
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

  if (location.pathname === '/admin') {
     return <AdminPanel onBack={() => {
        Promise.all([
            dataManager.getServices(),
            dataManager.getPackages(),
            dataManager.getCases(),
            dataManager.getBlogPosts()
        ]).then(([s, pkgs, c, p]) => {
            setServicesData(s);
            setPackagesData(pkgs);
            setDynamicCases(c);
            setDynamicPosts(p);
            navigate('/');
        });
    }} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-brand-orange selection:text-white flex flex-col">
      <ScrollToTop />
      <CodeInjector />
      <GlobalPopup />
      <SEOHead 
        pageKey={getCurrentPageKey()} 
        dynamicTitle={dynamicTitle}
        dynamicDescription={dynamicDescription}
      />
      
      <Header onNavigate={handleNavigate} currentPage={getCurrentPageKey()} />
      
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={
             <>
               <Hero onNavigate={handleNavigate} />
               <Services 
                 services={servicesData}
                 packages={packagesData}
                 onSelectService={(id) => navigate(`/services/${id}`)}
                 onQuickOrder={handleQuickOrder}
                 isHomePreview={true}
               />
               <AboutPreview onNavigate={() => navigate('/about')} />
               <CasesPage 
                   onOrder={() => navigate('/contact')} 
                   isHomePreview={true}
                   onViewAll={() => navigate('/cases')}
                   onSelectCase={(id) => navigate(`/cases/${id}`)}
                   initialCases={dynamicCases}
               />
               <BlogPreview 
                   onSelectPost={(id) => navigate(`/blog/${id}`)}
                   onViewAll={() => navigate('/blog')}
                   initialPosts={dynamicPosts}
               />
               <FAQ />
               <Testimonials />
               <ContactForm services={servicesData} selectedService={selectedContactService} onNavigate={handleNavigate} />
             </>
          } />

          <Route path="/services" element={
            <div className="pt-20">
               <Services 
                 services={servicesData}
                 packages={packagesData}
                 onSelectService={(id) => navigate(`/services/${id}`)}
                 onQuickOrder={handleQuickOrder}
                 isHomePreview={false}
                 onViewPackage={(id) => navigate(`/packages/${id}`)}
               />
            </div>
          } />

          <Route path="/services/:id" element={
            <ServiceDetailRoute 
              services={servicesData} 
              cases={dynamicCases} 
              onNavigate={handleNavigate} 
              onViewCase={(id) => navigate(`/cases/${id}`)}
            />
          } />

          <Route path="/packages/:id" element={
            <PackageDetailRoute packages={packagesData} onNavigate={handleNavigate} />
          } />

          <Route path="/cases" element={
            <CasesPage 
               onOrder={() => navigate('/contact')} 
               onSelectCase={(id) => navigate(`/cases/${id}`)}
               initialCases={dynamicCases}
            />
          } />

          <Route path="/cases/:id" element={
            <CaseDetailRoute cases={dynamicCases} onNavigate={handleNavigate} />
          } />

          <Route path="/about" element={<AboutPage />} />

          <Route path="/blog" element={
            <BlogPage 
              onSelectPost={(id) => navigate(`/blog/${id}`)} 
              initialPosts={dynamicPosts} 
            />
          } />

          <Route path="/blog/:id" element={
            <BlogPostRoute posts={dynamicPosts} onNavigate={handleNavigate} />
          } />

          <Route path="/contact" element={
            <div className="pt-20 min-h-screen flex flex-col justify-center">
               <ContactForm services={servicesData} selectedService={selectedContactService} isPage={true} onNavigate={handleNavigate} />
            </div>
          } />

          <Route path="/privacy" element={
             <PrivacyPolicy onBack={() => navigate('/')} />
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      <Footer onNavigate={handleNavigate} />
    </div>
  );
};

export default App;
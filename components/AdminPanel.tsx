import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, Users, MessageSquare, Briefcase, Save, Trash2, Plus, LogOut, Settings, Layers, Search, Image as ImageIcon, FileText, X, Target, ChevronUp, ChevronDown, RefreshCw, Database, FileCode, Mail, AlertCircle, CheckCircle, Package, ExternalLink } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings, BlogPost, ServiceItem, ServicePackage } from '../types';
import { PACKAGES, SERVICES, CASES, TEAM_MEMBERS, TESTIMONIALS, BLOG_POSTS, BLOG_CATEGORIES } from '../constants';
import RichTextEditor from './RichTextEditor';
import ImagePicker from './ImagePicker';
import MediaLibrary from './MediaLibrary';

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = 'dashboard' | 'leads' | 'services' | 'packages' | 'cases' | 'reviews' | 'blog' | 'team' | 'popups' | 'settings' | 'seo' | 'media';

interface SeoPageItem {
  key: string;
  label: string;
  group: 'Основные' | 'Услуги' | 'Пакеты' | 'Кейсы' | 'Блог' | 'Другое';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  
  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [servicesData, setServicesData] = useState<ServiceItem[]>([]);
  const [packagesData, setPackagesData] = useState<ServicePackage[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ headerCode: '', footerCode: '', seo: {}, socials: {} });

  // Editing State
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  // Category editing
  const [newCategory, setNewCategory] = useState('');

  // SEO State
  const [seoSearch, setSeoSearch] = useState('');
  const [selectedSeoPage, setSelectedSeoPage] = useState<string>('home');

  // RTE Image Picker State
  const [showRteImagePicker, setShowRteImagePicker] = useState(false);

  useEffect(() => {
    const isAuth = sessionStorage.getItem('valstand_admin');
    if (isAuth === 'true') {
      setIsAuthenticated(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
        const [l, c, r, t, p, b, cat, s, srv, pkgs] = await Promise.all([
            dataManager.getLeads(),
            dataManager.getCases(),
            dataManager.getTestimonials(),
            dataManager.getTeam(),
            dataManager.getPopups(),
            dataManager.getBlogPosts(),
            dataManager.getCategories(),
            dataManager.getSettings(),
            dataManager.getServices(),
            dataManager.getPackages()
        ]);
        setLeads(l);
        setCases(c);
        setReviews(r);
        setTeam(t);
        setPopups(p);
        setBlogPosts(b);
        setCategories(cat);
        setServicesData(srv);
        setPackagesData(pkgs);
        setSettings({ 
            ...s, 
            socials: s.socials || {}, 
            mailConfig: s.mailConfig || { host: '', port: '465', user: '', pass: '', receiverEmail: '', enabled: false } 
        });
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleSyncData = async () => {
      if(!confirm('Это действие загрузит стандартные данные в базу. Продолжить?')) return;
      setSyncing(true);
      try {
          for(const s of SERVICES) await dataManager.saveService(s);
          for(const c of CASES) await dataManager.saveCase(c);
          for(const p of PACKAGES) await dataManager.savePackage(p);
          for(const t of TEAM_MEMBERS) await dataManager.saveTeamMember(t);
          for(const r of TESTIMONIALS) await dataManager.saveTestimonial(r);
          for(const b of BLOG_POSTS) await dataManager.saveBlogPost(b);
          for(const cat of BLOG_CATEGORIES) if (cat !== 'Все') await dataManager.addCategory(cat);
          alert('Данные успешно синхронизированы с БД!');
          loadData();
      } catch (e) { alert('Ошибка при синхронизации.'); } finally { setSyncing(false); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (['p592462_valstand', 'admin123', 'lA5gJ2dX1j'].includes(password)) {
      setIsAuthenticated(true);
      sessionStorage.setItem('valstand_admin', 'true');
      loadData();
    } else alert('Неверный пароль');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('valstand_admin');
    onBack();
  };

  // --- Handlers ---
  const handleLeadStatus = async (id: string, status: Lead['status']) => {
    await dataManager.updateLeadStatus(id, status);
    setLeads(await dataManager.getLeads());
  };

  const handleDeleteLead = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if(confirm('Удалить заявку?')) {
        await dataManager.deleteLead(id);
        setLeads(await dataManager.getLeads());
    }
  };

  const handleSaveService = async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingService) {
          await dataManager.saveService(editingService);
          setEditingService(null);
          setServicesData(await dataManager.getServices());
      }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingPackage) {
          await dataManager.savePackage(editingPackage);
          setEditingPackage(null);
          setPackagesData(await dataManager.getPackages());
      }
  };

  const handleSaveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase) {
      await dataManager.saveCase(editingCase);
      setEditingCase(null);
      setCases(await dataManager.getCases());
    }
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      await dataManager.saveTestimonial(editingReview);
      setEditingReview(null);
      setReviews(await dataManager.getTestimonials());
    }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      await dataManager.saveTeamMember(editingMember);
      setEditingMember(null);
      setTeam(await dataManager.getTeam());
    }
  };

  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPopup) {
      await dataManager.savePopup(editingPopup);
      setEditingPopup(null);
      setPopups(await dataManager.getPopups());
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost) {
      await dataManager.saveBlogPost(editingPost);
      setEditingPost(null);
      setBlogPosts(await dataManager.getBlogPosts());
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataManager.saveSettings(settings);
    alert('Настройки сохранены.');
  };

  const handleSeoChange = (pageKey: string, field: 'title' | 'description' | 'keywords' | 'ogImage', value: string) => {
    setSettings(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [pageKey]: {
          ...prev.seo[pageKey] || { title: '', description: '' },
          [field]: value
        }
      }
    }));
  };

  const handleRteImageSelect = (url: string) => {
    setShowRteImagePicker(false);
    const btn = document.getElementById('rte-insert-image-trigger');
    if (btn) { btn.dataset.url = url; btn.click(); }
  };

  const getAllSeoPages = (): SeoPageItem[] => {
    const pages: SeoPageItem[] = [
      { key: 'home', label: 'Главная', group: 'Основные' },
      { key: 'services', label: 'Все Услуги (Список)', group: 'Основные' },
      { key: 'cases', label: 'Все Кейсы (Список)', group: 'Основные' },
      { key: 'blog', label: 'Блог (Список)', group: 'Основные' },
      { key: 'about', label: 'О нас', group: 'Основные' },
      { key: 'contact', label: 'Контакты', group: 'Основные' },
    ];
    servicesData.forEach(s => pages.push({ key: `service:${s.id}`, label: `Услуга: ${s.title}`, group: 'Услуги' }));
    packagesData.forEach(p => pages.push({ key: `package:${p.id}`, label: `Пакет: ${p.title}`, group: 'Пакеты' }));
    cases.forEach(c => pages.push({ key: `case:${c.id}`, label: `Кейс: ${c.title}`, group: 'Кейсы' }));
    blogPosts.forEach(b => pages.push({ key: `blog:${b.id}`, label: `Статья: ${b.title}`, group: 'Блог' }));
    return pages;
  };

  const filteredSeoPages = getAllSeoPages().filter(p => 
    p.label.toLowerCase().includes(seoSearch.toLowerCase()) || 
    p.key.toLowerCase().includes(seoSearch.toLowerCase())
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl w-full max-w-md border border-slate-200 shadow-xl">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-brand-orange mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900">Valstand CMS</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Пароль администратора" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:border-brand-orange outline-none" />
            <button type="submit" className="w-full py-3 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange transition-colors">Войти</button>
            <button type="button" onClick={onBack} className="w-full py-3 text-slate-400 hover:text-slate-600">Назад на сайт</button>
          </form>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button type="button" onClick={() => setActiveTab(id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${activeTab === id ? 'bg-brand-yellow text-brand-dark font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white'}`}>
      <Icon size={18} /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Панель управления</h1>
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700"><LogOut size={18} /> Выйти</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 bg-slate-200/50 p-2 rounded-xl border border-slate-200 overflow-x-auto scrollbar-hide">
          <TabButton id="dashboard" label="Сводка" icon={LayoutDashboard} />
          <TabButton id="leads" label="Заявки" icon={MessageSquare} />
          <TabButton id="services" label="Услуги" icon={Target} />
          <TabButton id="packages" label="Пакеты" icon={Package} />
          <TabButton id="blog" label="Блог" icon={FileText} />
          <TabButton id="cases" label="Кейсы" icon={Briefcase} />
          <TabButton id="reviews" label="Отзывы" icon={Users} />
          <TabButton id="team" label="Команда" icon={Users} />
          <TabButton id="popups" label="Попапы" icon={Layers} />
          <TabButton id="seo" label="SEO" icon={Search} />
          <TabButton id="media" label="Медиа" icon={ImageIcon} />
          <TabButton id="settings" label="Настройки" icon={Settings} />
        </div>

        {loading ? <div className="flex justify-center py-20 animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full" /> : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {activeTab === 'dashboard' && (
                <div className="space-y-8">
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200"><h3 className="text-slate-500 mb-2">Новых заявок</h3><p className="text-4xl font-bold text-blue-600">{leads.filter(l => l.status === 'new').length}</p></div>
                        <div className="p-6 bg-orange-50 rounded-xl border border-orange-200"><h3 className="text-slate-500 mb-2">Статей в блоге</h3><p className="text-4xl font-bold text-orange-600">{blogPosts.length}</p></div>
                        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200"><h3 className="text-slate-500 mb-2">Всего кейсов</h3><p className="text-4xl font-bold text-purple-600">{cases.length}</p></div>
                        <div className="p-6 bg-green-50 rounded-xl border border-green-200"><h3 className="text-slate-500 mb-2">Отзывов</h3><p className="text-4xl font-bold text-green-600">{reviews.length}</p></div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-4 mb-4"><Database className="text-slate-700" size={24} /><h3 className="text-xl font-bold text-slate-900">Инициализация БД</h3></div>
                        <p className="text-slate-600 mb-4">Синхронизируйте базу с демо-данными при первом запуске.</p>
                        <button onClick={handleSyncData} disabled={syncing} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800">{syncing ? <RefreshCw className="animate-spin" /> : <Save />} {syncing ? 'Синхронизация...' : 'Загрузить демо-данные'}</button>
                    </div>
                </div>
            )}

            {activeTab === 'seo' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 bg-slate-50 p-4 rounded-xl border h-fit">
                        <h3 className="font-bold mb-4">Страницы</h3>
                        <input placeholder="Поиск..." className="w-full p-2 mb-4 border rounded text-sm" value={seoSearch} onChange={e => setSeoSearch(e.target.value)} />
                        <div className="space-y-1 max-h-[600px] overflow-y-auto">
                            {filteredSeoPages.map(p => (
                                <button key={p.key} onClick={() => setSelectedSeoPage(p.key)} className={`w-full text-left px-3 py-2 rounded text-sm truncate ${selectedSeoPage === p.key ? 'bg-brand-orange text-white' : 'hover:bg-slate-200'}`}>{p.label}</button>
                            ))}
                        </div>
                    </div>
                    <div className="md:col-span-3 space-y-8">
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg flex items-center gap-3 border border-blue-100">
                            <FileCode size={20} />
                            <div className="text-sm">
                                <strong>Sitemap и Robots генерируются автоматически!</strong><br />
                                Вам больше не нужно редактировать их вручную. Все новые страницы добавляются в карту сайта мгновенно.
                            </div>
                            <div className="flex gap-2 ml-auto">
                                <a href="/sitemap.xml" target="_blank" className="p-2 bg-white rounded border hover:text-brand-orange" title="Открыть Sitemap"><ExternalLink size={16}/></a>
                                <a href="/robots.txt" target="_blank" className="p-2 bg-white rounded border hover:text-brand-orange" title="Открыть Robots"><FileText size={16}/></a>
                            </div>
                        </div>

                        <form onSubmit={handleSaveSettings} className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                            <h3 className="font-bold text-xl mb-4">SEO: {filteredSeoPages.find(p => p.key === selectedSeoPage)?.label || selectedSeoPage}</h3>
                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Meta Title</label><input className="w-full p-2 border rounded" value={settings.seo[selectedSeoPage]?.title || ''} onChange={e => handleSeoChange(selectedSeoPage, 'title', e.target.value)} /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Meta Description</label><textarea className="w-full p-2 border rounded h-24" value={settings.seo[selectedSeoPage]?.description || ''} onChange={e => handleSeoChange(selectedSeoPage, 'description', e.target.value)} /></div>
                            <div><label className="block text-sm font-bold text-slate-700 mb-1">Keywords</label><input className="w-full p-2 border rounded" value={settings.seo[selectedSeoPage]?.keywords || ''} onChange={e => handleSeoChange(selectedSeoPage, 'keywords', e.target.value)} /></div>
                            <ImagePicker label="OG Image" value={settings.seo[selectedSeoPage]?.ogImage || ''} onChange={url => handleSeoChange(selectedSeoPage, 'ogImage', url)} />
                            <div className="pt-4 flex justify-end"><button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold flex items-center gap-2"><Save size={18}/> Сохранить мета-теги</button></div>
                        </form>
                    </div>
                </div>
            )}
            {/* ... other tabs ... */}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
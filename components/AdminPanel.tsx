
import React, { useState, useEffect } from 'react';
// Fix: Added missing 'Share2' to the lucide-react imports
import { Lock, LayoutDashboard, Users, MessageSquare, Briefcase, Save, Trash2, Plus, LogOut, Settings, Layers, Search, Image as ImageIcon, FileText, X, Target, ChevronUp, ChevronDown, RefreshCw, Database, FileCode, Mail, AlertCircle, CheckCircle, Package, ExternalLink, Calendar, Star, Clock, List, ArrowUp, ArrowDown, Smile, Home, Share2, ClipboardList } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings, BlogPost, ServiceItem, ServicePackage, HomeContent } from '../types';
import { PACKAGES, SERVICES, CASES, TEAM_MEMBERS, TESTIMONIALS, BLOG_POSTS, BLOG_CATEGORIES } from '../constants';
import RichTextEditor from './RichTextEditor';
import ImagePicker from './ImagePicker';
import MediaLibrary from './MediaLibrary';

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = 'dashboard' | 'leads' | 'home_edit' | 'services' | 'packages' | 'cases' | 'reviews' | 'blog' | 'team' | 'popups' | 'settings' | 'seo' | 'media';

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
  const [settings, setSettings] = useState<SiteSettings>({ headerCode: '', footerCode: '', seo: {}, socials: {}, homeContent: {} });

  // Editing State
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);
  const [editingPackage, setEditingPackage] = useState<ServicePackage | null>(null);

  // SEO State
  const [seoSearch, setSeoSearch] = useState('');
  const [selectedSeoPage, setSelectedSeoPage] = useState<string>('home');

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
            homeContent: s.homeContent || {},
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

  const handleDeleteLead = async (id: string) => {
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

  const handleMoveService = async (index: number, direction: 'up' | 'down') => {
    const newServices = [...servicesData];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;

    [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
    
    const updated = newServices.map((s, idx) => ({ ...s, orderIndex: idx }));
    setServicesData(updated);
    
    for (const s of updated) {
        await dataManager.saveService(s);
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
    if(e) e.preventDefault();
    try {
      await dataManager.saveSettings(settings);
      alert('Настройки успешно сохранены!');
    } catch (error) {
      alert('Ошибка при сохранении.');
    }
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

  const handleHomeContentChange = (field: keyof HomeContent, value: string) => {
    setSettings(prev => ({
      ...prev,
      homeContent: {
        ...(prev.homeContent || {}),
        [field]: value
      }
    }));
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

  const TabButton = ({ id, label, icon: Icon }: { id: Tab, label: string, icon: any }) => (
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
          <TabButton id="home_edit" label="Главная" icon={Home} />
          <TabButton id="services" label="Услуги" icon={Target} />
          <TabButton id="packages" label="Пакеты" icon={Package} />
          <TabButton id="blog" label="Блог" icon={FileText} />
          <TabButton id="cases" label="Кейсы" icon={Briefcase} />
          <TabButton id="reviews" label="Отзывы" icon={Star} />
          <TabButton id="team" label="Команда" icon={Users} />
          <TabButton id="popups" label="Попапы" icon={Layers} />
          <TabButton id="seo" label="SEO" icon={Search} />
          <TabButton id="media" label="Медиа" icon={ImageIcon} />
          <TabButton id="settings" label="Настройки" icon={Settings} />
        </div>

        {loading ? <div className="flex justify-center py-20 animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full" /> : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[600px]">
            
            {/* DASHBOARD */}
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
                        <p className="text-slate-600 mb-4">Если база данных пуста, вы можете загрузить стандартный контент одним кликом.</p>
                        <button onClick={handleSyncData} disabled={syncing} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50">{syncing ? <RefreshCw className="animate-spin" /> : <Save />} {syncing ? 'Синхронизация...' : 'Загрузить демо-данные'}</button>
                    </div>
                </div>
            )}

            {/* LEADS */}
            {activeTab === 'leads' && (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b">
                                <th className="py-4 font-bold">Дата</th>
                                <th className="py-4 font-bold">Имя</th>
                                <th className="py-4 font-bold">Контакт</th>
                                <th className="py-4 font-bold">Услуга</th>
                                <th className="py-4 font-bold">Статус</th>
                                <th className="py-4 font-bold text-right">Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.length === 0 ? (
                                <tr><td colSpan={6} className="py-10 text-center text-slate-400">Заявок пока нет</td></tr>
                            ) : leads.map(lead => (
                                <tr key={lead.id} className="border-b hover:bg-slate-50">
                                    <td className="py-4 text-sm text-slate-500">{new Date(lead.date).toLocaleDateString()}</td>
                                    <td className="py-4 font-medium">{lead.name}</td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm">{lead.phone}</span>
                                            {lead.email && <span className="text-xs text-slate-400">{lead.email}</span>}
                                        </div>
                                    </td>
                                    <td className="py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs">{lead.service}</span></td>
                                    <td className="py-4">
                                        <select 
                                            value={lead.status} 
                                            onChange={(e) => handleLeadStatus(lead.id, e.target.value as any)}
                                            className={`text-xs px-2 py-1 rounded border-none outline-none font-bold ${
                                                lead.status === 'new' ? 'bg-blue-100 text-blue-600' :
                                                lead.status === 'contacted' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600'
                                            }`}
                                        >
                                            <option value="new">Новая</option>
                                            <option value="contacted">Связались</option>
                                            <option value="archived">Архив</option>
                                        </select>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button onClick={() => handleDeleteLead(lead.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* HOME EDIT */}
            {activeTab === 'home_edit' && (
                <div className="space-y-8">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h3 className="text-xl font-bold">Контент главной страницы</h3>
                        <button onClick={handleSaveSettings} className="bg-brand-orange text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2"><Save size={18}/> Сохранить всё</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4 p-6 bg-slate-50 rounded-xl border">
                            <h4 className="font-bold flex items-center gap-2 text-slate-700"><Layers size={18}/> Первый экран (Hero)</h4>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Заголовок (HTML)</label><textarea className="w-full p-2 border rounded font-mono text-sm h-32" value={settings.homeContent?.heroTitle || ''} onChange={e => handleHomeContentChange('heroTitle', e.target.value)} /></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Описание</label><textarea className="w-full p-2 border rounded text-sm h-24" value={settings.homeContent?.heroDescription || ''} onChange={e => handleHomeContentChange('heroDescription', e.target.value)} /></div>
                        </div>
                        <div className="space-y-4 p-6 bg-slate-50 rounded-xl border">
                            <h4 className="font-bold flex items-center gap-2 text-slate-700"><Users size={18}/> Блок "О нас" (превью)</h4>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Заголовок</label><input className="w-full p-2 border rounded text-sm" value={settings.homeContent?.aboutPreviewTitle || ''} onChange={e => handleHomeContentChange('aboutPreviewTitle', e.target.value)} /></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Абзац 1</label><textarea className="w-full p-2 border rounded text-sm h-20" value={settings.homeContent?.aboutPreviewText1 || ''} onChange={e => handleHomeContentChange('aboutPreviewText1', e.target.value)} /></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Абзац 2</label><textarea className="w-full p-2 border rounded text-sm h-20" value={settings.homeContent?.aboutPreviewText2 || ''} onChange={e => handleHomeContentChange('aboutPreviewText2', e.target.value)} /></div>
                        </div>
                    </div>
                </div>
            )}

            {/* SERVICES */}
            {activeTab === 'services' && (
                <div>
                    {!editingService ? (
                        <div className="space-y-4">
                            <button onClick={() => setEditingService({ id: Date.now().toString(), title: '', description: '', icon: 'target', features: [], fullDescription: '', benefits: [], process: [], orderIndex: servicesData.length })} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold"><Plus size={20}/> Добавить услугу</button>
                            <div className="grid gap-4">
                                {servicesData.map((s, index) => (
                                    <div key={s.id} className="p-4 border rounded-xl flex items-center justify-between hover:border-brand-orange transition-colors bg-white">
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col gap-1 mr-2">
                                                <button onClick={() => handleMoveService(index, 'up')} disabled={index === 0} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ArrowUp size={14}/></button>
                                                <button onClick={() => handleMoveService(index, 'down')} disabled={index === servicesData.length - 1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ArrowDown size={14}/></button>
                                            </div>
                                            <div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-brand-orange">
                                                {s.icon && (s.icon.startsWith('http') || s.icon.startsWith('data:')) ? <img src={s.icon} className="w-6 h-6 object-contain" /> : <Target size={20}/>}
                                            </div>
                                            <div><h4 className="font-bold">{s.title}</h4><p className="text-xs text-slate-500 truncate max-w-md">{s.description}</p></div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingService(s)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FileText size={18}/></button>
                                            <button onClick={async () => { if(confirm('Удалить?')) { await dataManager.deleteService(s.id); setServicesData(await dataManager.getServices()); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveService} className="space-y-6 max-w-5xl">
                            <div className="flex justify-between items-center border-b pb-4">
                                <h3 className="text-xl font-bold">Услуга: {editingService.title || 'Новая'}</h3>
                                <button type="button" onClick={() => setEditingService(null)} className="text-slate-400 hover:text-slate-600"><X/></button>
                            </div>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div><label className="block text-sm font-bold mb-1">ID (URL)</label><input className="w-full p-2 border rounded" value={editingService.id} onChange={e => setEditingService({...editingService, id: e.target.value})} required /></div>
                                <div><label className="block text-sm font-bold mb-1">Название</label><input className="w-full p-2 border rounded" value={editingService.title} onChange={e => setEditingService({...editingService, title: e.target.value})} required /></div>
                            </div>
                            <ImagePicker label="Иконка (Изображение или ID Lucide)" value={editingService.icon} onChange={url => setEditingService({...editingService, icon: url})} />
                            
                            <div className="bg-slate-50 p-4 rounded-xl border">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-700"><List size={18}/> Что входит в услугу</h4>
                                <div className="space-y-2">
                                    {(editingService.features || []).map((f, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input className="flex-grow p-2 border rounded text-sm" value={f} onChange={e => {
                                                const newFeatures = [...editingService.features];
                                                newFeatures[idx] = e.target.value;
                                                setEditingService({...editingService, features: newFeatures});
                                            }} />
                                            <button type="button" onClick={() => setEditingService({...editingService, features: editingService.features.filter((_, i) => i !== idx)})} className="text-red-500 p-2 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setEditingService({...editingService, features: [...(editingService.features || []), '']})} className="text-sm font-bold text-brand-orange flex items-center gap-1 hover:underline"><Plus size={16}/> Добавить пункт</button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-700"><Star size={18}/> Преимущества</h4>
                                <div className="grid gap-4">
                                    {(editingService.benefits || []).map((b, idx) => (
                                        <div key={idx} className="p-4 bg-white border rounded-lg relative">
                                            <button type="button" onClick={() => setEditingService({...editingService, benefits: editingService.benefits.filter((_, i) => i !== idx)})} className="absolute top-2 right-2 text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                            <div className="space-y-2">
                                                <input placeholder="Заголовок" className="w-full p-2 border rounded text-sm font-bold" value={b.title} onChange={e => {
                                                    const newBenefits = [...editingService.benefits];
                                                    newBenefits[idx] = { ...newBenefits[idx], title: e.target.value };
                                                    setEditingService({...editingService, benefits: newBenefits});
                                                }} />
                                                <textarea placeholder="Описание" className="w-full p-2 border rounded text-sm h-16" value={b.desc} onChange={e => {
                                                    const newBenefits = [...editingService.benefits];
                                                    newBenefits[idx] = { ...newBenefits[idx], desc: e.target.value };
                                                    setEditingService({...editingService, benefits: newBenefits});
                                                }} />
                                            </div>
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setEditingService({...editingService, benefits: [...(editingService.benefits || []), {title: '', desc: ''}]})} className="text-sm font-bold text-brand-orange flex items-center gap-1 hover:underline"><Plus size={16}/> Добавить преимущество</button>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-4 rounded-xl border">
                                <h4 className="font-bold mb-4 flex items-center gap-2 text-slate-700"><ClipboardList size={18}/> Этапы работы (Как мы работаем)</h4>
                                <div className="space-y-6">
                                    {(editingService.process || []).map((step, idx) => (
                                        <div key={idx} className="p-4 bg-white border rounded-lg relative space-y-4">
                                            <div className="flex justify-between items-center border-b pb-2">
                                                <span className="font-bold text-brand-orange">Этап {idx + 1}</span>
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => {
                                                        if (idx === 0) return;
                                                        const newProcess = [...editingService.process];
                                                        [newProcess[idx], newProcess[idx-1]] = [newProcess[idx-1], newProcess[idx]];
                                                        setEditingService({...editingService, process: newProcess});
                                                    }} disabled={idx === 0} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronUp size={16}/></button>
                                                    <button type="button" onClick={() => {
                                                        if (idx === editingService.process.length - 1) return;
                                                        const newProcess = [...editingService.process];
                                                        [newProcess[idx], newProcess[idx+1]] = [newProcess[idx+1], newProcess[idx]];
                                                        setEditingService({...editingService, process: newProcess});
                                                    }} disabled={idx === editingService.process.length - 1} className="p-1 hover:bg-slate-100 rounded disabled:opacity-30"><ChevronDown size={16}/></button>
                                                    <button type="button" onClick={() => setEditingService({...editingService, process: editingService.process.filter((_, i) => i !== idx)})} className="text-red-500 p-1 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                                </div>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4">
                                                <input placeholder="Название этапа" className="w-full p-2 border rounded text-sm font-bold" value={step.step} onChange={e => {
                                                    const newProcess = [...editingService.process];
                                                    newProcess[idx] = { ...newProcess[idx], step: e.target.value };
                                                    setEditingService({...editingService, process: newProcess});
                                                }} />
                                                <input placeholder="Краткое описание" className="w-full p-2 border rounded text-sm" value={step.desc} onChange={e => {
                                                    const newProcess = [...editingService.process];
                                                    newProcess[idx] = { ...newProcess[idx], desc: e.target.value };
                                                    setEditingService({...editingService, process: newProcess});
                                                }} />
                                            </div>
                                            <textarea placeholder="Подробное описание этапа (отображается при раскрытии)" className="w-full p-2 border rounded text-sm h-24" value={step.details || ''} onChange={e => {
                                                const newProcess = [...editingService.process];
                                                newProcess[idx] = { ...newProcess[idx], details: e.target.value };
                                                setEditingService({...editingService, process: newProcess});
                                            }} />
                                            <ImagePicker label="Пример реализации (картинка)" value={step.exampleImage || ''} onChange={url => {
                                                const newProcess = [...editingService.process];
                                                newProcess[idx] = { ...newProcess[idx], exampleImage: url };
                                                setEditingService({...editingService, process: newProcess});
                                            }} />
                                        </div>
                                    ))}
                                    <button type="button" onClick={() => setEditingService({...editingService, process: [...(editingService.process || []), {step: '', desc: '', details: '', exampleImage: ''}]})} className="text-sm font-bold text-brand-orange flex items-center gap-1 hover:underline"><Plus size={16}/> Добавить этап</button>
                                </div>
                            </div>

                            <div><label className="block text-sm font-bold mb-1">Полное описание (Rich Text)</label><RichTextEditor content={editingService.fullDescription} onChange={html => setEditingService({...editingService, fullDescription: html})} /></div>
                            <div className="flex justify-end gap-3 pt-6 border-t"><button type="button" onClick={() => setEditingService(null)} className="px-6 py-2 border rounded">Отмена</button><button type="submit" className="px-6 py-2 bg-brand-orange text-white rounded">Сохранить</button></div>
                        </form>
                    )}
                </div>
            )}

            {/* PACKAGES */}
            {activeTab === 'packages' && (
                <div>
                    {!editingPackage ? (
                        <div className="space-y-4">
                            <button onClick={() => setEditingPackage({ id: Date.now().toString(), title: '', subtitle: '', price: '', description: '', features: [], fullDescription: '', timeline: '', benefits: [], detailedFeatures: [] })} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold"><Plus size={20}/> Создать пакет</button>
                            <div className="grid md:grid-cols-2 gap-4">
                                {packagesData.map(p => (
                                    <div key={p.id} className="p-4 border rounded-xl flex items-center justify-between hover:border-brand-orange transition-colors">
                                        <div className="flex items-center gap-4"><div className="w-10 h-10 bg-slate-100 rounded flex items-center justify-center text-brand-orange"><Package size={20}/></div><div><h4 className="font-bold">{p.title}</h4><p className="text-xs text-brand-orange font-bold">{p.price}</p></div></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingPackage(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FileText size={18}/></button>
                                            <button onClick={async () => { if(confirm('Удалить?')) { await dataManager.deletePackage(p.id); setPackagesData(await dataManager.getPackages()); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSavePackage} className="space-y-6">
                            <h3 className="text-xl font-bold border-b pb-2">Пакет: {editingPackage.title || 'Новый'}</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <input placeholder="Название" className="p-2 border rounded" value={editingPackage.title} onChange={e => setEditingPackage({...editingPackage, title: e.target.value})} />
                                <input placeholder="Цена" className="p-2 border rounded" value={editingPackage.price} onChange={e => setEditingPackage({...editingPackage, price: e.target.value})} />
                                <input placeholder="Срок" className="p-2 border rounded" value={editingPackage.timeline} onChange={e => setEditingPackage({...editingPackage, timeline: e.target.value})} />
                            </div>
                            <label className="block text-sm font-bold">Подробное описание пакета</label>
                            <RichTextEditor content={editingPackage.fullDescription} onChange={html => setEditingPackage({...editingPackage, fullDescription: html})} />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingPackage(null)} className="px-6 py-2 border rounded">Отмена</button><button type="submit" className="px-6 py-2 bg-brand-orange text-white rounded">Сохранить</button></div>
                        </form>
                    )}
                </div>
            )}

            {/* CASES */}
            {activeTab === 'cases' && (
                <div>
                    {!editingCase ? (
                        <div className="space-y-4">
                            <button onClick={() => setEditingCase({ id: Date.now().toString(), title: '', category: 'Маркетинг', image: '', description: '', results: [], tags: [] })} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold"><Plus size={20}/> Добавить кейс</button>
                            <div className="grid md:grid-cols-2 gap-4">
                                {cases.map(c => (
                                    <div key={c.id} className="p-4 border rounded-xl flex items-center justify-between hover:border-brand-orange">
                                        <div className="flex items-center gap-4"><img src={c.image} className="w-16 h-12 object-cover rounded" /><div><h4 className="font-bold text-sm">{c.title}</h4><span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded">{c.category}</span></div></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingCase(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FileText size={18}/></button>
                                            <button onClick={async () => { if(confirm('Удалить?')) { await dataManager.deleteCase(c.id); setCases(await dataManager.getCases()); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveCase} className="space-y-6">
                            <h3 className="text-xl font-bold">Кейс: {editingCase.title || 'Новый'}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Заголовок" className="p-2 border rounded" value={editingCase.title} onChange={e => setEditingCase({...editingCase, title: e.target.value})} />
                                <input placeholder="Категория" className="p-2 border rounded" value={editingCase.category} onChange={e => setEditingCase({...editingCase, category: e.target.value})} />
                            </div>
                            <ImagePicker label="Обложка кейса" value={editingCase.image} onChange={url => setEditingCase({...editingCase, image: url})} />
                            <label className="block text-sm font-bold">Текст решения (Rich Text)</label>
                            <RichTextEditor content={editingCase.fullDescription || ''} onChange={html => setEditingCase({...editingCase, fullDescription: html})} />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingCase(null)} className="px-6 py-2 border rounded">Отмена</button><button type="submit" className="px-6 py-2 bg-brand-orange text-white rounded">Сохранить</button></div>
                        </form>
                    )}
                </div>
            )}

            {/* REVIEWS */}
            {activeTab === 'reviews' && (
                <div>
                    {!editingReview ? (
                        <div className="space-y-4">
                            <button onClick={() => setEditingReview({ id: Date.now(), name: '', role: '', company: '', text: '', avatar: '' })} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold"><Plus size={20}/> Добавить отзыв</button>
                            <div className="grid md:grid-cols-2 gap-4">
                                {reviews.map(r => (
                                    <div key={r.id} className="p-4 border rounded-xl flex items-center justify-between hover:border-brand-orange">
                                        <div className="flex items-center gap-4"><img src={r.avatar} className="w-12 h-12 rounded-full object-cover" /><div><h4 className="font-bold">{r.name}</h4><p className="text-xs text-slate-500">{r.company}</p></div></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingReview(r)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FileText size={18}/></button>
                                            <button onClick={async () => { if(confirm('Удалить?')) { await dataManager.deleteTestimonial(r.id); setReviews(await dataManager.getTestimonials()); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveReview} className="space-y-6">
                            <h3 className="text-xl font-bold">Отзыв</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Имя клиента" className="p-2 border rounded" value={editingReview.name} onChange={e => setEditingReview({...editingReview, name: e.target.value})} />
                                <input placeholder="Компания" className="p-2 border rounded" value={editingReview.company} onChange={e => setEditingReview({...editingReview, company: e.target.value})} />
                            </div>
                            <ImagePicker label="Аватар клиента" value={editingReview.avatar} onChange={url => setEditingReview({...editingReview, avatar: url})} />
                            <textarea placeholder="Текст отзыва" className="w-full p-2 border rounded h-32" value={editingReview.text} onChange={e => setEditingReview({...editingReview, text: e.target.value})} />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingReview(null)} className="px-6 py-2 border rounded">Отмена</button><button type="submit" className="px-6 py-2 bg-brand-orange text-white rounded">Сохранить</button></div>
                        </form>
                    )}
                </div>
            )}

            {/* BLOG */}
            {activeTab === 'blog' && (
                <div>
                    {!editingPost ? (
                        <div className="space-y-4">
                            <button onClick={() => setEditingPost({ id: Date.now().toString(), title: '', excerpt: '', content: '', image: '', category: 'Маркетинг', date: new Date().toISOString().split('T')[0], author: 'Valstand' })} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold"><Plus size={20}/> Написать статью</button>
                            <div className="grid gap-4">
                                {blogPosts.map(p => (
                                    <div key={p.id} className="p-4 border rounded-xl flex items-center justify-between hover:border-brand-orange">
                                        <div className="flex items-center gap-4"><img src={p.image} className="w-12 h-12 object-cover rounded" /><div><h4 className="font-bold">{p.title}</h4><div className="flex gap-2 items-center text-[10px] text-slate-500"><Calendar size={10}/> {p.date}</div></div></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingPost(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FileText size={18}/></button>
                                            <button onClick={async () => { if(confirm('Удалить?')) { await dataManager.deleteBlogPost(p.id); setBlogPosts(await dataManager.getBlogPosts()); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSavePost} className="space-y-6">
                            <h3 className="text-xl font-bold">Статья: {editingPost.title || 'Новая'}</h3>
                            <input placeholder="Заголовок статьи" className="w-full p-2 border rounded font-bold" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} />
                            <ImagePicker label="Главное фото статьи" value={editingPost.image} onChange={url => setEditingPost({...editingPost, image: url})} />
                            <label className="block text-sm font-bold">Содержание статьи (Rich Text)</label>
                            <RichTextEditor content={editingPost.content} onChange={html => setEditingPost({...editingPost, content: html})} />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingPost(null)} className="px-6 py-2 border rounded">Отмена</button><button type="submit" className="px-6 py-2 bg-brand-orange text-white rounded">Опубликовать</button></div>
                        </form>
                    )}
                </div>
            )}

            {/* TEAM */}
            {activeTab === 'team' && (
                <div>
                    {!editingMember ? (
                        <div className="space-y-4">
                            <button onClick={() => setEditingMember({ id: Date.now().toString(), name: '', role: '', description: '', image: '' })} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold"><Plus size={20}/> Добавить в команду</button>
                            <div className="grid md:grid-cols-3 gap-4">
                                {team.map(m => (
                                    <div key={m.id} className="p-4 border rounded-xl flex flex-col items-center text-center">
                                        <img src={m.image} className="w-24 h-24 rounded-full object-cover mb-4" />
                                        <h4 className="font-bold">{m.name}</h4><p className="text-xs text-brand-orange uppercase mb-4">{m.role}</p>
                                        <div className="flex gap-2 w-full justify-center pt-4 border-t">
                                            <button onClick={() => setEditingMember(m)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FileText size={18}/></button>
                                            <button onClick={async () => { if(confirm('Удалить?')) { await dataManager.deleteTeamMember(m.id); setTeam(await dataManager.getTeam()); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSaveTeam} className="space-y-6">
                            <h3 className="text-xl font-bold">Участник команды</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Имя сотрудника" className="p-2 border rounded" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} />
                                <input placeholder="Должность" className="p-2 border rounded" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value})} />
                            </div>
                            <ImagePicker label="Фото сотрудника" value={editingMember.image} onChange={url => setEditingMember({...editingMember, image: url})} />
                            <textarea placeholder="Краткое описание" className="w-full p-2 border rounded h-24" value={editingMember.description} onChange={e => setEditingMember({...editingMember, description: e.target.value})} />
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingMember(null)} className="px-6 py-2 border rounded">Отмена</button><button type="submit" className="px-6 py-2 bg-brand-orange text-white rounded">Сохранить</button></div>
                        </form>
                    )}
                </div>
            )}

            {/* POPUPS */}
            {activeTab === 'popups' && (
                <div>
                    {!editingPopup ? (
                        <div className="space-y-4">
                            <button onClick={() => setEditingPopup({ id: Date.now().toString(), title: '', text: '', hasForm: true, isActive: true, delaySeconds: 5 })} className="flex items-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg font-bold"><Plus size={20}/> Создать попап</button>
                            <div className="grid md:grid-cols-2 gap-4">
                                {popups.map(p => (
                                    <div key={p.id} className={`p-4 border rounded-xl flex items-center justify-between ${p.isActive ? 'border-brand-orange' : 'opacity-50'}`}>
                                        <div><h4 className="font-bold">{p.title}</h4><p className="text-xs text-slate-500">Задержка: {p.delaySeconds} сек</p></div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setEditingPopup(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded"><FileText size={18}/></button>
                                            <button onClick={async () => { if(confirm('Удалить?')) { await dataManager.deletePopup(p.id); setPopups(await dataManager.getPopups()); } }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={18}/></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSavePopup} className="space-y-6">
                            <h3 className="text-xl font-bold">Маркетинговый попап</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Заголовок окна" className="p-2 border rounded" value={editingPopup.title} onChange={e => setEditingPopup({...editingPopup, title: e.target.value})} />
                                <input type="number" placeholder="Задержка (сек)" className="p-2 border rounded" value={editingPopup.delaySeconds} onChange={e => setEditingPopup({...editingPopup, delaySeconds: parseInt(e.target.value)})} />
                            </div>
                            <ImagePicker label="Изображение в окне" value={editingPopup.imageUrl || ''} onChange={url => setEditingPopup({...editingPopup, imageUrl: url})} />
                            <textarea placeholder="Текст оффера" className="w-full p-2 border rounded h-24" value={editingPopup.text} onChange={e => setEditingPopup({...editingPopup, text: e.target.value})} />
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editingPopup.isActive} onChange={e => setEditingPopup({...editingPopup, isActive: e.target.checked})} /> <span className="text-sm">Активен</span></label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={editingPopup.hasForm} onChange={e => setEditingPopup({...editingPopup, hasForm: e.target.checked})} /> <span className="text-sm">С формой заявки</span></label>
                            </div>
                            <div className="flex justify-end gap-3"><button type="button" onClick={() => setEditingPopup(null)} className="px-6 py-2 border rounded">Отмена</button><button type="submit" className="px-6 py-2 bg-brand-orange text-white rounded">Сохранить</button></div>
                        </form>
                    )}
                </div>
            )}

            {/* SEO */}
            {activeTab === 'seo' && (
                <div className="grid md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 bg-slate-50 p-4 rounded-xl border h-fit">
                        <div className="flex items-center justify-between mb-4">
                             <h3 className="font-bold">Страницы</h3>
                             <RefreshCw size={14} className="text-slate-400 cursor-pointer hover:text-brand-orange" onClick={loadData} />
                        </div>
                        <input placeholder="Поиск страницы..." className="w-full p-2 mb-4 border rounded text-sm" value={seoSearch} onChange={e => setSeoSearch(e.target.value)} />
                        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
                            {filteredSeoPages.map(p => (
                                <button key={p.key} onClick={() => setSelectedSeoPage(p.key)} className={`w-full text-left px-3 py-2 rounded text-sm truncate transition-colors ${selectedSeoPage === p.key ? 'bg-brand-orange text-white font-bold' : 'hover:bg-slate-200'}`}>
                                    {p.label}
                                </button>
                            ))}
                            {filteredSeoPages.length === 0 && <p className="text-xs text-slate-400 text-center py-4">Ничего не найдено</p>}
                        </div>
                    </div>
                    <div className="md:col-span-3">
                        <div className="p-6 bg-white rounded-xl border shadow-sm space-y-4">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-brand-orange"><Search size={20}/></div>
                                <div>
                                    <h3 className="font-bold text-xl leading-none">SEO настройки</h3>
                                    <p className="text-xs text-slate-400 mt-1">Редактирование для: <strong>{filteredSeoPages.find(p => p.key === selectedSeoPage)?.label || selectedSeoPage}</strong></p>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Meta Title (Заголовок во вкладке)</label>
                                <input className="w-full p-2 border rounded focus:border-brand-orange outline-none" value={settings.seo[selectedSeoPage]?.title || ''} onChange={e => handleSeoChange(selectedSeoPage, 'title', e.target.value)} placeholder="Название страницы для поисковиков" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Meta Description (Описание в поиске)</label>
                                <textarea className="w-full p-2 border rounded h-24 focus:border-brand-orange outline-none text-sm" value={settings.seo[selectedSeoPage]?.description || ''} onChange={e => handleSeoChange(selectedSeoPage, 'description', e.target.value)} placeholder="Краткое описание страницы для Google/Яндекс" />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Keywords (Ключевые слова через запятую)</label>
                                <input className="w-full p-2 border rounded focus:border-brand-orange outline-none" value={settings.seo[selectedSeoPage]?.keywords || ''} onChange={e => handleSeoChange(selectedSeoPage, 'keywords', e.target.value)} placeholder="маркетинг, агентство, услуги..." />
                            </div>
                            
                            <ImagePicker label="Open Graph Image (Картинка при репосте в соцсети)" value={settings.seo[selectedSeoPage]?.ogImage || ''} onChange={url => handleSeoChange(selectedSeoPage, 'ogImage', url)} />
                            
                            <div className="pt-6 border-t flex justify-end">
                                <button onClick={handleSaveSettings} className="bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg shadow-green-600/20 transition-all">
                                    <Save size={18}/> Сохранить мета-теги
                                </button>
                            </div>
                        </div>
                        
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-start gap-3">
                             <AlertCircle className="text-blue-500 shrink-0" size={20} />
                             <p className="text-xs text-blue-700 leading-relaxed">
                                <strong>Совет:</strong> Sitemap.xml и Robots.txt обновляются автоматически на сервере. После сохранения SEO настроек поисковикам может потребоваться от пары дней до недель для обновления информации в выдаче.
                             </p>
                        </div>
                    </div>
                </div>
            )}

            {/* MEDIA */}
            {activeTab === 'media' && (
                <div className="h-[700px] flex flex-col">
                    <div className="mb-4">
                        <h3 className="text-xl font-bold">Медиабиблиотека</h3>
                        <p className="text-sm text-slate-400">Все изображения хранятся в базе данных и доступны для вставки в любой раздел.</p>
                    </div>
                    <div className="flex-grow overflow-hidden rounded-xl border">
                        <MediaLibrary />
                    </div>
                </div>
            )}

            {/* SETTINGS */}
            {activeTab === 'settings' && (
                <form onSubmit={handleSaveSettings} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4 p-6 bg-slate-50 rounded-xl border">
                            <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2"><ImageIcon size={20} className="text-slate-400" /> Фирменный стиль</h3>
                            <ImagePicker label="Основной логотип" value={settings.logo || ''} onChange={url => setSettings({...settings, logo: url})} />
                            <ImagePicker label="Favicon (иконка вкладки)" value={settings.favicon || ''} onChange={url => setSettings({...settings, favicon: url})} />
                        </div>
                        <div className="space-y-4 p-6 bg-slate-50 rounded-xl border">
                            <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2"><Share2 size={20} className="text-slate-400" /> Соцсети и ссылки</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500">Telegram</label><input placeholder="https://t.me/..." className="w-full p-2 border rounded text-sm" value={settings.socials?.telegram || ''} onChange={e => setSettings({...settings, socials: {...settings.socials, telegram: e.target.value}})} /></div>
                                <div><label className="text-xs font-bold text-slate-500">VK</label><input placeholder="https://vk.com/..." className="w-full p-2 border rounded text-sm" value={settings.socials?.vk || ''} onChange={e => setSettings({...settings, socials: {...settings.socials, vk: e.target.value}})} /></div>
                                <div><label className="text-xs font-bold text-slate-500">VC.ru</label><input placeholder="https://vc.ru/u/..." className="w-full p-2 border rounded text-sm" value={settings.socials?.vc || ''} onChange={e => setSettings({...settings, socials: {...settings.socials, vc: e.target.value}})} /></div>
                                <div><label className="text-xs font-bold text-slate-500">TJournal (TJ)</label><input placeholder="https://tjournal.ru/..." className="w-full p-2 border rounded text-sm" value={settings.socials?.tj || ''} onChange={e => setSettings({...settings, socials: {...settings.socials, tj: e.target.value}})} /></div>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 p-6 bg-slate-50 rounded-xl border">
                        <h3 className="font-bold text-lg border-b pb-2 flex items-center gap-2"><FileCode size={20} className="text-slate-400" /> Сторонние скрипты (Метрика, Аналитика, Пиксели)</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Header Code (перед &lt;/head&gt;)</label><textarea placeholder="<script>...</script>" className="w-full p-3 font-mono text-xs border rounded bg-slate-900 text-green-400 h-40 outline-none focus:ring-1 ring-brand-orange" value={settings.headerCode} onChange={e => setSettings({...settings, headerCode: e.target.value})} /></div>
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Footer Code (перед &lt;/body&gt;)</label><textarea placeholder="<script>...</script>" className="w-full p-3 font-mono text-xs border rounded bg-slate-900 text-green-400 h-40 outline-none focus:ring-1 ring-brand-orange" value={settings.footerCode} onChange={e => setSettings({...settings, footerCode: e.target.value})} /></div>
                        </div>
                    </div>
                    <div className="pt-6 border-t flex justify-end"><button type="submit" className="bg-slate-900 text-white px-12 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand-dark shadow-xl transition-all"><Save size={20}/> Сохранить общие настройки</button></div>
                </form>
            )}

            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

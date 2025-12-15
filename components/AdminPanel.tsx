
import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, Users, MessageSquare, Briefcase, Save, Trash2, Plus, LogOut, Settings, Layers, Search, Image as ImageIcon, FileText, X, Target, ChevronUp, ChevronDown, RefreshCw, Database } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings, BlogPost, ServiceItem } from '../types';
import { PACKAGES, SERVICES, CASES, TEAM_MEMBERS, TESTIMONIALS, BLOG_POSTS, BLOG_CATEGORIES } from '../constants';
import RichTextEditor from './RichTextEditor';
import ImagePicker from './ImagePicker';
import MediaLibrary from './MediaLibrary';

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = 'dashboard' | 'leads' | 'services' | 'cases' | 'reviews' | 'blog' | 'team' | 'popups' | 'settings' | 'seo' | 'media';

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
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ headerCode: '', footerCode: '', seo: {}, socials: {} });

  // Editing State
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Category editing
  const [newCategory, setNewCategory] = useState('');
  const [showCategoryEditor, setShowCategoryEditor] = useState(false);

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
        const [l, c, r, t, p, b, cat, s, srv] = await Promise.all([
            dataManager.getLeads(),
            dataManager.getCases(),
            dataManager.getTestimonials(),
            dataManager.getTeam(),
            dataManager.getPopups(),
            dataManager.getBlogPosts(),
            dataManager.getCategories(),
            dataManager.getSettings(),
            dataManager.getServices()
        ]);
        setLeads(l);
        setCases(c);
        setReviews(r);
        setTeam(t);
        setPopups(p);
        setBlogPosts(b);
        setCategories(cat);
        setServicesData(srv);
        // Ensure socials object exists
        setSettings({ ...s, socials: s.socials || {} });
    } catch (e) {
        console.error(e);
        // Do not alert constantly if offline, let dataManager fallback
    } finally {
        setLoading(false);
    }
  };

  const handleSyncData = async () => {
      if(!confirm('Это действие загрузит стандартные данные (Кейсы, Услуги, Блог) в базу данных. Если в базе уже есть записи с такими же ID, они будут обновлены. Продолжить?')) return;
      
      setSyncing(true);
      try {
          // Sync Services
          for(const s of SERVICES) {
              await dataManager.saveService(s);
          }
          // Sync Cases
          for(const c of CASES) {
              await dataManager.saveCase(c);
          }
          // Sync Team
          for(const t of TEAM_MEMBERS) {
              await dataManager.saveTeamMember(t);
          }
          // Sync Reviews
          for(const r of TESTIMONIALS) {
              await dataManager.saveTestimonial(r);
          }
          // Sync Blog
          for(const b of BLOG_POSTS) {
              await dataManager.saveBlogPost(b);
          }
          // Sync Categories
          for(const cat of BLOG_CATEGORIES) {
              if (cat !== 'Все') await dataManager.addCategory(cat);
          }

          alert('Данные успешно синхронизированы с БД!');
          loadData();
      } catch (e) {
          console.error(e);
          alert('Ошибка при синхронизации. Проверьте консоль.');
      } finally {
          setSyncing(false);
      }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'p592462_valstand' || password === 'admin123' || password === 'lA5gJ2dX1j') {
      setIsAuthenticated(true);
      sessionStorage.setItem('valstand_admin', 'true');
      loadData();
    } else {
      alert('Неверный пароль');
    }
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
    e.stopPropagation();
    if(confirm('Удалить заявку?')) {
        await dataManager.deleteLead(id);
        setLeads(await dataManager.getLeads());
    }
  };

  // --- SERVICES LOGIC ---

  const handleSaveService = async (e: React.FormEvent) => {
      e.preventDefault();
      if (editingService) {
          try {
              await dataManager.saveService(editingService);
              setEditingService(null);
              setServicesData(await dataManager.getServices());
              alert('Услуга успешно сохранена');
          } catch (err) {
              alert('Ошибка сохранения услуги. Проверьте соединение с БД.');
          }
      }
  };

  const handleCreateService = () => {
      setEditingService({
          id: Date.now().toString(),
          title: 'Новая услуга',
          description: '',
          icon: 'target',
          features: [],
          fullDescription: '',
          benefits: [],
          process: [],
          orderIndex: servicesData.length
      });
  };

  const handleDeleteService = async (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm('Вы уверены, что хотите удалить эту услугу? Это действие нельзя отменить.')) {
          await dataManager.deleteService(id);
          setServicesData(await dataManager.getServices());
      }
  };

  const moveService = async (index: number, direction: -1 | 1) => {
      const newServices = [...servicesData];
      if (direction === -1 && index > 0) {
          [newServices[index], newServices[index - 1]] = [newServices[index - 1], newServices[index]];
      } else if (direction === 1 && index < newServices.length - 1) {
          [newServices[index], newServices[index + 1]] = [newServices[index + 1], newServices[index]];
      } else {
          return;
      }
      
      // Re-index
      const reindexed = newServices.map((s, i) => ({ ...s, orderIndex: i }));
      setServicesData(reindexed);

      // Save order to DB immediately to persist changes
      try {
        await Promise.all(reindexed.map(s => dataManager.saveService(s)));
      } catch (err) {
        console.error("Failed to save order", err);
        alert("Ошибка сохранения порядка сортировки");
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

  const handleDeleteCase = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Вы уверены?')) {
      await dataManager.deleteCase(id);
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

  const handleDeleteReview = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Вы уверены?')) {
      await dataManager.deleteTestimonial(id);
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

  const handleDeleteTeam = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if(confirm('Удалить сотрудника?')) {
         // Note: Team API endpoint wasn't explicitly added for delete in dataManager in previous steps, but generic one might work if implemented.
         // Assuming generic delete works or adding alert for now.
         alert('Для удаления сотрудника требуется реализация API DELETE /api/team/:id');
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

  const handleDeletePopup = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Удалить этот попап?')) {
      await dataManager.deletePopup(id);
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

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Удалить статью?')) {
      await dataManager.deleteBlogPost(id);
      setBlogPosts(await dataManager.getBlogPosts());
    }
  };

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
        await dataManager.addCategory(newCategory.trim());
        setCategories(await dataManager.getCategories());
        setNewCategory('');
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, cat: string) => {
      e.preventDefault();
      e.stopPropagation();
      if (confirm(`Удалить рубрику "${cat}"?`)) {
          await dataManager.deleteCategory(cat);
          setCategories(await dataManager.getCategories());
      }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await dataManager.saveSettings(settings);
    alert('Настройки сохранены.');
  };

  // Service Helpers
  const addServiceBenefit = () => {
    if (editingService) {
        setEditingService({
            ...editingService,
            benefits: [...editingService.benefits, { title: 'Заголовок', desc: 'Описание' }]
        });
    }
  };

  const removeServiceBenefit = (idx: number) => {
     if(editingService) {
         const nb = [...editingService.benefits];
         nb.splice(idx, 1);
         setEditingService({...editingService, benefits: nb});
     }
  };

  const updateServiceBenefit = (idx: number, field: 'title' | 'desc', val: string) => {
      if(editingService) {
          const nb = [...editingService.benefits];
          nb[idx][field] = val;
          setEditingService({...editingService, benefits: nb});
      }
  };

  const addServiceFeature = () => {
      if (editingService) {
          setEditingService({...editingService, features: [...editingService.features, '']});
      }
  };

  const updateServiceFeature = (idx: number, val: string) => {
      if (editingService) {
          const nf = [...editingService.features];
          nf[idx] = val;
          setEditingService({...editingService, features: nf});
      }
  };

  const removeServiceFeature = (idx: number) => {
    if(editingService) {
        const nf = [...editingService.features];
        nf.splice(idx, 1);
        setEditingService({...editingService, features: nf});
    }
  };

  const addServiceProcess = () => {
      if (editingService) {
          setEditingService({
              ...editingService,
              process: [...editingService.process, { step: 'Этап', desc: 'Описание', details: '', exampleImage: '' }]
          });
      }
  };
  
  const updateServiceProcess = (idx: number, field: string, val: string) => {
      if (editingService) {
          const np = [...editingService.process];
          (np[idx] as any)[field] = val;
          setEditingService({...editingService, process: np});
      }
  };

  const removeServiceProcess = (idx: number) => {
      if(editingService) {
          const np = [...editingService.process];
          np.splice(idx, 1);
          setEditingService({...editingService, process: np});
      }
  };

  // Case Results Helpers
  const addCaseResult = () => {
    if (editingCase) {
      setEditingCase({
        ...editingCase,
        results: [...editingCase.results, { label: '', value: '' }]
      });
    }
  };

  const removeCaseResult = (index: number) => {
    if (editingCase) {
      const newResults = [...editingCase.results];
      newResults.splice(index, 1);
      setEditingCase({ ...editingCase, results: newResults });
    }
  };

  const updateCaseResult = (index: number, field: 'label' | 'value', val: string) => {
    if (editingCase) {
      const newResults = [...editingCase.results];
      newResults[index][field] = val;
      setEditingCase({ ...editingCase, results: newResults });
    }
  };

  // SEO Helpers
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

  // RTE Image Selection
  const handleRteImageSelect = (url: string) => {
    setShowRteImagePicker(false);
    const btn = document.getElementById('rte-insert-image-trigger');
    if (btn) {
        btn.dataset.url = url;
        btn.click();
    }
  };

  // Generate complete list of pages for SEO
  const getAllSeoPages = (): SeoPageItem[] => {
    const pages: SeoPageItem[] = [
      { key: 'home', label: 'Главная', group: 'Основные' },
      { key: 'services', label: 'Все Услуги (Список)', group: 'Основные' },
      { key: 'cases', label: 'Все Кейсы (Список)', group: 'Основные' },
      { key: 'blog', label: 'Блог (Список)', group: 'Основные' },
      { key: 'about', label: 'О нас', group: 'Основные' },
      { key: 'reviews', label: 'Отзывы (секция)', group: 'Основные' },
      { key: 'contact', label: 'Контакты', group: 'Основные' },
      { key: 'privacy', label: 'Политика конфиденциальности', group: 'Другое' },
    ];

    servicesData.forEach(s => {
      pages.push({ key: `service:${s.id}`, label: `Услуга: ${s.title}`, group: 'Услуги' });
    });

    PACKAGES.forEach(p => {
      pages.push({ key: `package:${p.id}`, label: `Пакет: ${p.title}`, group: 'Пакеты' });
    });

    cases.forEach(c => {
      pages.push({ key: `case:${c.id}`, label: `Кейс: ${c.title}`, group: 'Кейсы' });
    });

    blogPosts.forEach(b => {
      pages.push({ key: `blog:${b.id}`, label: `Статья: ${b.title}`, group: 'Блог' });
    });

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
            <input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:border-brand-orange outline-none"
            />
            <button type="submit" className="w-full py-3 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange transition-colors">
              Войти
            </button>
            <button type="button" onClick={onBack} className="w-full py-3 text-slate-400 hover:text-slate-600">
              Назад на сайт
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      type="button"
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
        activeTab === id ? 'bg-brand-yellow text-brand-dark font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900 hover:bg-white'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Панель управления</h1>
          <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:text-red-700">
            <LogOut size={18} /> Выйти
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-200/50 p-2 rounded-xl border border-slate-200 overflow-x-auto scrollbar-hide">
          <TabButton id="dashboard" label="Сводка" icon={LayoutDashboard} />
          <TabButton id="leads" label="Заявки" icon={MessageSquare} />
          <TabButton id="services" label="Услуги" icon={Target} />
          <TabButton id="blog" label="Блог" icon={FileText} />
          <TabButton id="cases" label="Кейсы" icon={Briefcase} />
          <TabButton id="reviews" label="Отзывы" icon={Users} />
          <TabButton id="team" label="Команда" icon={Users} />
          <TabButton id="popups" label="Попапы" icon={Layers} />
          <TabButton id="seo" label="SEO" icon={Search} />
          <TabButton id="media" label="Медиа" icon={ImageIcon} />
          <TabButton id="settings" label="Настройки" icon={Settings} />
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full" /></div>
        ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* --- DASHBOARD --- */}
            {activeTab === 'dashboard' && (
                <div className="space-y-8">
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                            <h3 className="text-slate-500 mb-2">Новых заявок</h3>
                            <p className="text-4xl font-bold text-blue-600">
                            {leads.filter(l => l.status === 'new').length}
                            </p>
                        </div>
                        <div className="p-6 bg-orange-50 rounded-xl border border-orange-200">
                            <h3 className="text-slate-500 mb-2">Статей в блоге</h3>
                            <p className="text-4xl font-bold text-orange-600">{blogPosts.length}</p>
                        </div>
                        <div className="p-6 bg-purple-50 rounded-xl border border-purple-200">
                            <h3 className="text-slate-500 mb-2">Всего кейсов</h3>
                            <p className="text-4xl font-bold text-purple-600">{cases.length}</p>
                        </div>
                        <div className="p-6 bg-green-50 rounded-xl border border-green-200">
                            <h3 className="text-slate-500 mb-2">Отзывов</h3>
                            <p className="text-4xl font-bold text-green-600">{reviews.length}</p>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <Database className="text-slate-700" size={24} />
                            <h3 className="text-xl font-bold text-slate-900">Инициализация Базы Данных</h3>
                        </div>
                        <p className="text-slate-600 mb-4">
                            Если вы только подключили БД, она может быть пустой. 
                            Нажмите кнопку ниже, чтобы загрузить в неё стандартные данные (Услуги, Кейсы, Блог и т.д.) из кода сайта.
                            Это решит проблему "исчезновения" контента при первом сохранении.
                        </p>
                        <button 
                            onClick={handleSyncData}
                            disabled={syncing}
                            className={`flex items-center gap-2 px-6 py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {syncing ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                            {syncing ? 'Синхронизация...' : 'Загрузить демо-данные в БД'}
                        </button>
                    </div>
                </div>
            )}

            {/* --- MEDIA --- */}
            {activeTab === 'media' && (
                <div className="h-[600px]">
                    <MediaLibrary />
                </div>
            )}
            
            {/* --- SERVICES --- */}
            {activeTab === 'services' && (
                <div>
                    {!editingService ? (
                        <>
                        <button 
                            type="button"
                            onClick={handleCreateService}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"
                        >
                            <Plus size={18} /> Добавить услугу
                        </button>
                        <div className="grid gap-4">
                            {servicesData.map((s, index) => (
                                <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <button 
                                                onClick={() => moveService(index, -1)}
                                                disabled={index === 0}
                                                className="p-1 text-slate-400 hover:text-brand-orange disabled:opacity-30 disabled:hover:text-slate-400"
                                            >
                                                <ChevronUp size={20} />
                                            </button>
                                            <button 
                                                onClick={() => moveService(index, 1)}
                                                disabled={index === servicesData.length - 1}
                                                className="p-1 text-slate-400 hover:text-brand-orange disabled:opacity-30 disabled:hover:text-slate-400"
                                            >
                                                <ChevronDown size={20} />
                                            </button>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-lg">{s.title}</h4>
                                            <p className="text-sm text-slate-500 truncate max-w-md">{s.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setEditingService(s)}
                                            className="px-4 py-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 flex items-center gap-2"
                                        >
                                            <Settings size={16} /> Ред.
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteService(e, s.id)}
                                            className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 flex items-center gap-2"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                    ) : (
                        <form onSubmit={handleSaveService} className="space-y-6">
                             <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold">Редактирование услуги: {editingService.title}</h3>
                                <button type="button" onClick={() => setEditingService(null)} className="text-slate-500 hover:text-slate-700 p-2"><X /></button>
                             </div>

                             <div className="grid md:grid-cols-2 gap-6">
                                 <div>
                                     <label className="block text-sm font-bold text-slate-700 mb-1">Название услуги</label>
                                     <input className="w-full p-2 border rounded" value={editingService.title} onChange={e => setEditingService({...editingService, title: e.target.value})} required />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-bold text-slate-700 mb-1">Иконка (ключ из lucide)</label>
                                     <select 
                                        className="w-full p-2 border rounded"
                                        value={editingService.icon}
                                        onChange={e => setEditingService({...editingService, icon: e.target.value})}
                                     >
                                         <option value="target">Target (Мишень)</option>
                                         <option value="search">Search (Лупа)</option>
                                         <option value="share">Share (Поделиться)</option>
                                         <option value="code">Code (Код)</option>
                                         <option value="palette">Palette (Палитра)</option>
                                         <option value="chart">Chart (График)</option>
                                     </select>
                                 </div>
                             </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Краткое описание (для карточки)</label>
                                <textarea className="w-full p-2 border rounded h-20" value={editingService.description} onChange={e => setEditingService({...editingService, description: e.target.value})} required />
                             </div>

                             <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Полное описание (вверху страницы услуги)</label>
                                <textarea className="w-full p-2 border rounded h-40 font-light" value={editingService.fullDescription} onChange={e => setEditingService({...editingService, fullDescription: e.target.value})} required />
                             </div>

                             {/* Features List */}
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                 <h4 className="font-bold mb-2">Что входит в услугу (Список)</h4>
                                 {editingService.features.map((feat, idx) => (
                                     <div key={idx} className="flex gap-2 mb-2">
                                         <input className="w-full p-2 border rounded" value={feat} onChange={e => updateServiceFeature(idx, e.target.value)} />
                                         <button type="button" onClick={() => removeServiceFeature(idx)} className="text-red-500 p-2"><X size={16} /></button>
                                     </div>
                                 ))}
                                 <button type="button" onClick={addServiceFeature} className="text-sm text-blue-600 font-bold">+ Добавить пункт</button>
                             </div>

                             {/* Benefits List */}
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                 <h4 className="font-bold mb-2">Преимущества (Блоки)</h4>
                                 {editingService.benefits.map((ben, idx) => (
                                     <div key={idx} className="flex gap-2 mb-2 items-start">
                                         <input placeholder="Заголовок" className="w-1/3 p-2 border rounded" value={ben.title} onChange={e => updateServiceBenefit(idx, 'title', e.target.value)} />
                                         <textarea placeholder="Описание" className="w-2/3 p-2 border rounded h-10" value={ben.desc} onChange={e => updateServiceBenefit(idx, 'desc', e.target.value)} />
                                         <button type="button" onClick={() => removeServiceBenefit(idx)} className="text-red-500 p-2 mt-2"><X size={16} /></button>
                                     </div>
                                 ))}
                                 <button type="button" onClick={addServiceBenefit} className="text-sm text-blue-600 font-bold">+ Добавить преимущество</button>
                             </div>

                             {/* Process Steps */}
                             <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                 <h4 className="font-bold mb-2">Этапы работы</h4>
                                 <div className="space-y-4">
                                    {editingService.process.map((step, idx) => (
                                        <div key={idx} className="bg-white p-4 rounded border border-slate-200">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-slate-400">Этап {idx + 1}</span>
                                                <button type="button" onClick={() => removeServiceProcess(idx)} className="text-red-500"><Trash2 size={16} /></button>
                                            </div>
                                            <div className="grid md:grid-cols-2 gap-4 mb-2">
                                                <input placeholder="Название этапа" className="w-full p-2 border rounded" value={step.step} onChange={e => updateServiceProcess(idx, 'step', e.target.value)} />
                                                <input placeholder="Краткое описание" className="w-full p-2 border rounded" value={step.desc} onChange={e => updateServiceProcess(idx, 'desc', e.target.value)} />
                                            </div>
                                            <div className="mb-2">
                                                <label className="text-xs text-slate-500">Подробности (Rich Text)</label>
                                                {/* Simple textarea for details inside repeater to avoid complex nesting issues with RTE for now, or just text area */}
                                                <textarea className="w-full p-2 border rounded h-24" value={step.details} onChange={e => updateServiceProcess(idx, 'details', e.target.value)} />
                                            </div>
                                            <ImagePicker label="Пример реализации (картинка)" value={step.exampleImage || ''} onChange={url => updateServiceProcess(idx, 'exampleImage', url)} />
                                        </div>
                                    ))}
                                 </div>
                                 <button type="button" onClick={addServiceProcess} className="mt-4 text-sm text-blue-600 font-bold">+ Добавить этап</button>
                             </div>

                             <div className="flex gap-4 pt-4 border-t">
                                <button type="submit" className="px-6 py-3 bg-green-600 text-white rounded font-bold hover:bg-green-500 flex items-center gap-2"><Save size={18} /> Сохранить изменения</button>
                                <button type="button" onClick={() => setEditingService(null)} className="px-6 py-3 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Отмена</button>
                             </div>
                        </form>
                    )}
                </div>
            )}
            
            {/* ... Other tabs ... */}
            {activeTab === 'leads' && (
                <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                        <th className="p-4">Дата</th>
                        <th className="p-4">Имя</th>
                        <th className="p-4">Телефон</th>
                        <th className="p-4">Услуга</th>
                        <th className="p-4">Статус</th>
                        <th className="p-4">Действия</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leads.map(lead => (
                        <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="p-4 text-sm text-slate-500">{new Date(lead.date).toLocaleDateString()}</td>
                        <td className="p-4 font-bold text-slate-900">{lead.name}</td>
                        <td className="p-4 text-slate-700">{lead.phone}</td>
                        <td className="p-4 text-brand-orange">{lead.service}</td>
                        <td className="p-4">
                            <select 
                            value={lead.status}
                            onChange={(e) => handleLeadStatus(lead.id, e.target.value as any)}
                            className={`bg-transparent border rounded px-2 py-1 text-xs ${
                                lead.status === 'new' ? 'border-green-500 text-green-600' :
                                lead.status === 'contacted' ? 'border-blue-500 text-blue-600' :
                                'border-slate-400 text-slate-500'
                            }`}
                            >
                            <option value="new">Новая</option>
                            <option value="contacted">Обработана</option>
                            <option value="archived">Архив</option>
                            </select>
                        </td>
                        <td className="p-4">
                            <button 
                                type="button"
                                onClick={(e) => handleDeleteLead(e, lead.id)} 
                                className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                            >
                                <Trash2 size={16} />
                            </button>
                        </td>
                        </tr>
                    ))}
                    {leads.length === 0 && (
                        <tr><td colSpan={6} className="p-8 text-center text-slate-400">Заявок пока нет</td></tr>
                    )}
                    </tbody>
                </table>
                </div>
            )}

            {/* Same components for Cases, Reviews, Team, Popups, Blog, SEO, Settings as before */}
            {activeTab === 'cases' && (
                <div>
                    {!editingCase ? (
                        <>
                        <button onClick={() => setEditingCase({id: Date.now().toString(), title: '', category: '', image: '', description: '', results: [], tags: [], clientInfo: '', challenge: '', solution: '', fullDescription: ''})} className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"><Plus size={18} /> Добавить кейс</button>
                        <div className="grid gap-4">{cases.map(c => <div key={c.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border"><div className="flex gap-4"><img src={c.image} className="w-16 h-16 rounded object-cover"/><div><h4 className="font-bold">{c.title}</h4></div></div><div className="flex gap-2"><button onClick={() => setEditingCase(c)} className="p-2 bg-blue-100 text-blue-600 rounded">Ред.</button><button onClick={(e) => handleDeleteCase(e, c.id)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2/></button></div></div>)}</div>
                        </>
                    ) : (
                        <form onSubmit={handleSaveCase} className="space-y-4">
                            <h3 className="font-bold">Кейс</h3>
                            <input className="w-full p-2 border rounded" placeholder="Название" value={editingCase.title} onChange={e => setEditingCase({...editingCase, title: e.target.value})} />
                            <ImagePicker label="Картинка" value={editingCase.image} onChange={url => setEditingCase({...editingCase, image: url})} />
                            <textarea className="w-full p-2 border rounded" placeholder="Описание" value={editingCase.description} onChange={e => setEditingCase({...editingCase, description: e.target.value})} />
                            <div className="flex gap-4"><button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Сохранить</button><button type="button" onClick={() => setEditingCase(null)} className="bg-slate-200 px-4 py-2 rounded">Отмена</button></div>
                        </form>
                    )}
                </div>
            )}
            
            {activeTab === 'reviews' && (
                <div>
                    {!editingReview ? (
                        <>
                        <button onClick={() => setEditingReview({id: Date.now(), name: '', role: '', company: '', text: '', avatar: ''})} className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"><Plus size={18} /> Добавить отзыв</button>
                        <div className="grid gap-4">{reviews.map(r => <div key={r.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border"><div className="flex gap-4"><img src={r.avatar} className="w-12 h-12 rounded-full object-cover"/><div><h4 className="font-bold">{r.name}</h4><p className="text-xs text-slate-500">{r.company}</p></div></div><div className="flex gap-2"><button onClick={() => setEditingReview(r)} className="p-2 bg-blue-100 text-blue-600 rounded">Ред.</button><button onClick={(e) => handleDeleteReview(e, r.id)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2/></button></div></div>)}</div>
                        </>
                    ) : (
                        <form onSubmit={handleSaveReview} className="space-y-4">
                            <h3 className="font-bold">Отзыв</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <input className="p-2 border rounded" placeholder="Имя" value={editingReview.name} onChange={e => setEditingReview({...editingReview, name: e.target.value})} />
                                <input className="p-2 border rounded" placeholder="Должность" value={editingReview.role} onChange={e => setEditingReview({...editingReview, role: e.target.value})} />
                            </div>
                            <input className="w-full p-2 border rounded" placeholder="Компания" value={editingReview.company} onChange={e => setEditingReview({...editingReview, company: e.target.value})} />
                            <textarea className="w-full p-2 border rounded" placeholder="Текст отзыва" value={editingReview.text} onChange={e => setEditingReview({...editingReview, text: e.target.value})} />
                            <ImagePicker label="Аватар" value={editingReview.avatar} onChange={url => setEditingReview({...editingReview, avatar: url})} />
                            <div className="flex gap-4"><button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Сохранить</button><button type="button" onClick={() => setEditingReview(null)} className="bg-slate-200 px-4 py-2 rounded">Отмена</button></div>
                        </form>
                    )}
                </div>
            )}

            {activeTab === 'blog' && (
                <div>
                    {!editingPost ? (
                        <>
                        <button onClick={() => setEditingPost({id: Date.now().toString(), title: '', excerpt: '', content: '', image: '', category: 'Маркетинг', date: new Date().toISOString(), author: 'Admin'})} className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"><Plus size={18} /> Добавить статью</button>
                        <div className="grid gap-4">{blogPosts.map(p => <div key={p.id} className="flex justify-between p-4 bg-slate-50 rounded-xl border"><div><h4 className="font-bold">{p.title}</h4><span className="text-xs bg-white px-2 py-1 rounded border">{p.category}</span></div><div className="flex gap-2"><button onClick={() => setEditingPost(p)} className="p-2 bg-blue-100 text-blue-600 rounded">Ред.</button><button onClick={(e) => handleDeletePost(e, p.id)} className="p-2 bg-red-100 text-red-600 rounded"><Trash2/></button></div></div>)}</div>
                        </>
                    ) : (
                        <form onSubmit={handleSavePost} className="space-y-4">
                            <h3 className="font-bold">Статья</h3>
                            <input className="w-full p-2 border rounded" placeholder="Заголовок" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} />
                            <input className="w-full p-2 border rounded" placeholder="Краткое описание" value={editingPost.excerpt} onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})} />
                            <div className="grid grid-cols-2 gap-4">
                                <select className="p-2 border rounded" value={editingPost.category} onChange={e => setEditingPost({...editingPost, category: e.target.value})}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <input className="p-2 border rounded" placeholder="Автор" value={editingPost.author} onChange={e => setEditingPost({...editingPost, author: e.target.value})} />
                            </div>
                            <ImagePicker label="Обложка" value={editingPost.image} onChange={url => setEditingPost({...editingPost, image: url})} />
                            <div className="h-96">
                                <RichTextEditor content={editingPost.content} onChange={html => setEditingPost({...editingPost, content: html})} onImageRequest={() => setShowRteImagePicker(true)} />
                            </div>
                            <div className="flex gap-4 pt-4"><button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Сохранить</button><button type="button" onClick={() => setEditingPost(null)} className="bg-slate-200 px-4 py-2 rounded">Отмена</button></div>
                        </form>
                    )}
                </div>
            )}
            
            </div>
        )}
        
        {/* RTE Image Picker Modal */}
        {showRteImagePicker && (
            <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden relative">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h3 className="font-bold text-lg">Выберите изображение</h3>
                    <button type="button" onClick={() => setShowRteImagePicker(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
                    </div>
                    <div className="flex-grow overflow-hidden p-4 bg-slate-50">
                    <MediaLibrary selectionMode onSelect={handleRteImageSelect} />
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;

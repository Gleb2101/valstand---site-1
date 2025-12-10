
import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, Users, MessageSquare, Briefcase, Save, Trash2, Plus, LogOut, ArrowLeft, Settings, Layers, Search, Globe, Box, Tag, Image as ImageIcon, FileText, List, Loader, X, Check } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings, BlogPost } from '../types';
import { SERVICES, PACKAGES } from '../constants';
import RichTextEditor from './RichTextEditor';
import ImagePicker from './ImagePicker';
import MediaLibrary from './MediaLibrary';

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = 'dashboard' | 'leads' | 'cases' | 'reviews' | 'blog' | 'team' | 'popups' | 'settings' | 'seo' | 'media';

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
  
  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ headerCode: '', footerCode: '', seo: {}, socials: {} });

  // Editing State
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

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
        const [l, c, r, t, p, b, cat, s] = await Promise.all([
            dataManager.getLeads(),
            dataManager.getCases(),
            dataManager.getTestimonials(),
            dataManager.getTeam(),
            dataManager.getPopups(),
            dataManager.getBlogPosts(),
            dataManager.getCategories(),
            dataManager.getSettings()
        ]);
        setLeads(l);
        setCases(c);
        setReviews(r);
        setTeam(t);
        setPopups(p);
        setBlogPosts(b);
        setCategories(cat);
        // Ensure socials object exists
        setSettings({ ...s, socials: s.socials || {} });
    } catch (e) {
        console.error(e);
        alert('Ошибка загрузки данных. Проверьте соединение с сервером.');
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple password check (client-side only for this demo)
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
    alert('Удаление сотрудников пока не реализовано в API');
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

    SERVICES.forEach(s => {
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
            <div className="flex justify-center py-20"><Loader className="animate-spin text-brand-orange" /></div>
        ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            
            {/* --- DASHBOARD --- */}
            {activeTab === 'dashboard' && (
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
            )}

            {/* --- MEDIA --- */}
            {activeTab === 'media' && (
                <div className="h-[600px]">
                    <MediaLibrary />
                </div>
            )}

            {/* --- LEADS --- */}
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

            {/* ... Cases, Reviews, Team, Popups, Blog, SEO tabs (unchanged) ... */}
            {activeTab === 'blog' && (
                <div>
                  {!editingPost ? (
                    <>
                      <div className="flex gap-4 mb-6">
                          <button 
                            type="button"
                            onClick={() => setEditingPost({
                              id: Date.now().toString(),
                              title: '',
                              excerpt: '',
                              content: '',
                              category: categories[0] || 'Маркетинг',
                              image: '',
                              date: new Date().toISOString(),
                              author: 'Команда Valstand'
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange"
                          >
                            <Plus size={18} /> Новая статья
                          </button>
                          <button 
                             type="button"
                             onClick={() => setShowCategoryEditor(!showCategoryEditor)}
                             className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                          >
                             Управление рубриками
                          </button>
                      </div>

                      {showCategoryEditor && (
                          <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                             <h4 className="font-bold mb-3">Рубрики блога</h4>
                             <div className="flex gap-2 mb-4">
                                <input 
                                  className="border p-2 rounded" 
                                  placeholder="Название рубрики" 
                                  value={newCategory} 
                                  onChange={e => setNewCategory(e.target.value)} 
                                />
                                <button onClick={handleAddCategory} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Добавить</button>
                             </div>
                             <div className="flex flex-wrap gap-2">
                                {categories.map(cat => (
                                   <div key={cat} className="flex items-center gap-2 bg-white px-3 py-1 rounded border border-slate-200">
                                      {cat}
                                      {cat !== 'Все' && (
                                          <button onClick={(e) => handleDeleteCategory(e, cat)} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                                      )}
                                   </div>
                                ))}
                             </div>
                          </div>
                      )}

                      <div className="grid gap-4">
                        {blogPosts.map(post => (
                          <div key={post.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded overflow-hidden bg-slate-200 flex-shrink-0">
                                 {post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={20} /></div>}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{post.title}</h4>
                                <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">{post.category}</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => setEditingPost(post)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">Ред.</button>
                              <button 
                                type="button" 
                                onClick={(e) => handleDeletePost(e, post.id)} 
                                className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"
                              >
                                Удалить
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <form onSubmit={handleSavePost} className="space-y-4">
                       <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold">{editingPost.id ? 'Редактирование статьи' : 'Новая статья'}</h3>
                          <button type="button" onClick={() => setEditingPost(null)} className="text-slate-500 hover:text-slate-700"><X /></button>
                       </div>
                       
                       <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-slate-500 mb-1">Заголовок</label>
                            <input required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} />
                          </div>
                          <div>
                            <label className="block text-sm text-slate-500 mb-1">Рубрика</label>
                            <select className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingPost.category} onChange={e => setEditingPost({...editingPost, category: e.target.value})}>
                              {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                       </div>
                       
                       <ImagePicker label="Обложка" value={editingPost.image} onChange={(url) => setEditingPost({...editingPost, image: url})} />
                       
                       <div>
                         <label className="block text-sm text-slate-500 mb-1">Краткое описание (для превью)</label>
                         <textarea className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-24" value={editingPost.excerpt} onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})} />
                       </div>

                       <div>
                         <label className="block text-sm text-slate-500 mb-1">Содержание</label>
                         <RichTextEditor content={editingPost.content} onChange={(html) => setEditingPost({...editingPost, content: html})} onImageRequest={() => setShowRteImagePicker(true)} />
                       </div>

                       <div className="flex gap-4 pt-4">
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-500 flex items-center gap-2"><Save size={18} /> Сохранить</button>
                        <button type="button" onClick={() => setEditingPost(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Отмена</button>
                      </div>
                    </form>
                  )}
                </div>
            )}

            {activeTab === 'cases' && (
                <div>
                    {!editingCase ? (
                        <>
                        <button 
                            type="button"
                            onClick={() => setEditingCase({
                            id: Date.now().toString(),
                            title: '',
                            category: '',
                            image: '',
                            description: '',
                            results: [],
                            tags: [],
                            clientInfo: '',
                            challenge: '',
                            solution: '',
                            fullDescription: ''
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"
                        >
                            <Plus size={18} /> Добавить кейс
                        </button>
                        <div className="grid gap-4">
                            {cases.map(c => (
                            <div key={c.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                                <div className="flex items-center gap-4">
                                <img src={c.image} alt="" className="w-16 h-16 rounded object-cover" />
                                <div>
                                    <h4 className="font-bold text-slate-900">{c.title}</h4>
                                    <span className="text-xs text-slate-500">{c.category}</span>
                                </div>
                                </div>
                                <div className="flex gap-2">
                                <button type="button" onClick={() => setEditingCase(c)} className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">Ред.</button>
                                <button type="button" onClick={(e) => handleDeleteCase(e, c.id)} className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200"><Trash2 size={16} /></button>
                                </div>
                            </div>
                            ))}
                        </div>
                        </>
                    ) : (
                        <form onSubmit={handleSaveCase} className="space-y-4">
                            {/* Case form fields - unchanged */}
                            <h3 className="text-xl font-bold mb-4">{editingCase.id ? 'Редактирование кейса' : 'Новый кейс'}</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">Название клиента/проекта</label>
                                    <input required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingCase.title} onChange={e => setEditingCase({...editingCase, title: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">Категория (например, SEO)</label>
                                    <input required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingCase.category} onChange={e => setEditingCase({...editingCase, category: e.target.value})} />
                                </div>
                            </div>
                            
                            <ImagePicker label="Главное изображение" value={editingCase.image} onChange={(url) => setEditingCase({...editingCase, image: url})} />

                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Краткое описание (для карточки)</label>
                                <textarea className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-20" value={editingCase.description} onChange={e => setEditingCase({...editingCase, description: e.target.value})} />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">Проблема/Задача</label>
                                    <textarea className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-24" value={editingCase.challenge} onChange={e => setEditingCase({...editingCase, challenge: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">Решение</label>
                                    <textarea className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-24" value={editingCase.solution} onChange={e => setEditingCase({...editingCase, solution: e.target.value})} />
                                </div>
                            </div>
                             
                             <div>
                                <label className="block text-sm text-slate-500 mb-1">Итоговый результат</label>
                                <textarea className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-20" value={editingCase.fullDescription} onChange={e => setEditingCase({...editingCase, fullDescription: e.target.value})} />
                            </div>

                            {/* Tags */}
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Теги (через запятую)</label>
                                <input 
                                    className="w-full p-2 rounded bg-slate-50 border border-slate-300" 
                                    value={editingCase.tags?.join(', ') || ''} 
                                    onChange={e => setEditingCase({...editingCase, tags: e.target.value.split(',').map(t => t.trim())})} 
                                />
                            </div>

                            {/* Results Builder */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="font-bold text-sm">Показатели (Цифры)</label>
                                    <button type="button" onClick={addCaseResult} className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200">+ Добавить</button>
                                </div>
                                {editingCase.results?.map((res, idx) => (
                                    <div key={idx} className="flex gap-2 mb-2">
                                        <input placeholder="Значение (напр. +200%)" className="w-1/2 p-2 border rounded" value={res.value} onChange={e => updateCaseResult(idx, 'value', e.target.value)} />
                                        <input placeholder="Подпись (напр. Рост трафика)" className="w-1/2 p-2 border rounded" value={res.label} onChange={e => updateCaseResult(idx, 'label', e.target.value)} />
                                        <button type="button" onClick={() => removeCaseResult(idx)} className="text-red-500 hover:bg-red-50 p-2 rounded"><X size={16}/></button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-500">Сохранить</button>
                                <button type="button" onClick={() => setEditingCase(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Отмена</button>
                            </div>
                        </form>
                    )}
                </div>
            )}
            
            {activeTab === 'reviews' && (
                <div>
                   {/* Review rendering logic (unchanged) */}
                    {!editingReview ? (
                         <>
                         <button 
                            type="button"
                            onClick={() => setEditingReview({
                            id: Date.now(),
                            name: '',
                            role: '',
                            company: '',
                            text: '',
                            avatar: ''
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"
                        >
                            <Plus size={18} /> Добавить отзыв
                        </button>
                        <div className="grid md:grid-cols-2 gap-4">
                            {reviews.map(r => (
                                <div key={r.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-start">
                                    <div className="flex gap-4">
                                        <img src={r.avatar} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <h4 className="font-bold">{r.name}</h4>
                                            <p className="text-xs text-slate-500">{r.company}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setEditingReview(r)} className="p-1 text-blue-600 hover:bg-blue-100 rounded"><Settings size={16}/></button>
                                        <button type="button" onClick={(e) => handleDeleteReview(e, r.id)} className="p-1 text-red-600 hover:bg-red-100 rounded"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                         </>
                    ) : (
                        <form onSubmit={handleSaveReview} className="space-y-4 max-w-2xl">
                             <h3 className="text-xl font-bold mb-4">Редактирование отзыва</h3>
                             <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">Имя</label>
                                    <input required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingReview.name} onChange={e => setEditingReview({...editingReview, name: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-500 mb-1">Компания</label>
                                    <input required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingReview.company} onChange={e => setEditingReview({...editingReview, company: e.target.value})} />
                                </div>
                             </div>
                             <div>
                                <label className="block text-sm text-slate-500 mb-1">Должность</label>
                                <input required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingReview.role} onChange={e => setEditingReview({...editingReview, role: e.target.value})} />
                            </div>
                            <ImagePicker label="Аватар" value={editingReview.avatar} onChange={(url) => setEditingReview({...editingReview, avatar: url})} />
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Текст отзыва</label>
                                <textarea required className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-24" value={editingReview.text} onChange={e => setEditingReview({...editingReview, text: e.target.value})} />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-500">Сохранить</button>
                                <button type="button" onClick={() => setEditingReview(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Отмена</button>
                            </div>
                        </form>
                    )}
                 </div>
            )}
            
            {activeTab === 'team' && (
                <div>
                   {/* Team tab logic (unchanged) */}
                     {!editingMember ? (
                         <>
                         <button 
                            type="button"
                            onClick={() => setEditingMember({
                            id: Date.now().toString(),
                            name: '',
                            role: '',
                            description: '',
                            image: ''
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"
                        >
                            <Plus size={18} /> Добавить сотрудника
                        </button>
                        <div className="grid md:grid-cols-3 gap-4">
                             {team.map(m => (
                                 <div key={m.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center relative group">
                                     <img src={m.image} className="w-24 h-24 rounded-full mx-auto object-cover mb-3" />
                                     <h4 className="font-bold">{m.name}</h4>
                                     <p className="text-xs text-brand-orange uppercase">{m.role}</p>
                                     <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <button onClick={() => setEditingMember(m)} className="p-1 bg-white rounded-full shadow hover:text-blue-600"><Settings size={14}/></button>
                                     </div>
                                 </div>
                             ))}
                        </div>
                         </>
                     ) : (
                        <form onSubmit={handleSaveTeam} className="space-y-4 max-w-2xl">
                            <h3 className="text-xl font-bold mb-4">Сотрудник</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <input placeholder="Имя" required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingMember.name} onChange={e => setEditingMember({...editingMember, name: e.target.value})} />
                                <input placeholder="Должность" required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value})} />
                            </div>
                            <ImagePicker label="Фото" value={editingMember.image} onChange={(url) => setEditingMember({...editingMember, image: url})} />
                            <textarea placeholder="Описание" className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-24" value={editingMember.description} onChange={e => setEditingMember({...editingMember, description: e.target.value})} />
                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-500">Сохранить</button>
                                <button type="button" onClick={() => setEditingMember(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Отмена</button>
                            </div>
                        </form>
                     )}
                </div>
            )}

            {activeTab === 'popups' && (
                <div>
                   {/* Popup tab logic (unchanged) */}
                     {!editingPopup ? (
                        <>
                        <button 
                            type="button"
                            onClick={() => setEditingPopup({
                            id: Date.now().toString(),
                            title: '',
                            text: '',
                            isActive: true,
                            hasForm: true,
                            delaySeconds: 5,
                            imageUrl: ''
                            })}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange mb-6"
                        >
                            <Plus size={18} /> Создать попап
                        </button>
                        <div className="space-y-4">
                            {popups.map(p => (
                                <div key={p.id} className={`p-4 rounded-xl border flex justify-between items-center ${p.isActive ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                                    <div>
                                        <h4 className="font-bold flex items-center gap-2">
                                            {p.title}
                                            {p.isActive && <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded-full">Активен</span>}
                                        </h4>
                                        <p className="text-sm text-slate-500 truncate max-w-md">{p.text}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => setEditingPopup(p)} className="p-2 hover:bg-blue-100 rounded text-blue-600">Ред.</button>
                                        <button onClick={(e) => handleDeletePopup(e, p.id)} className="p-2 hover:bg-red-100 rounded text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        </>
                     ) : (
                        <form onSubmit={handleSavePopup} className="space-y-4 max-w-2xl">
                            <h3 className="text-xl font-bold mb-4">Настройка Pop-up</h3>
                            <input placeholder="Заголовок" required className="w-full p-2 rounded bg-slate-50 border border-slate-300" value={editingPopup.title} onChange={e => setEditingPopup({...editingPopup, title: e.target.value})} />
                            <textarea placeholder="Текст сообщения" required className="w-full p-2 rounded bg-slate-50 border border-slate-300 h-24" value={editingPopup.text} onChange={e => setEditingPopup({...editingPopup, text: e.target.value})} />
                            <ImagePicker label="Изображение (опционально)" value={editingPopup.imageUrl || ''} onChange={(url) => setEditingPopup({...editingPopup, imageUrl: url})} />
                            
                            <div className="flex gap-6 items-center bg-slate-50 p-4 rounded-lg">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={editingPopup.isActive} onChange={e => setEditingPopup({...editingPopup, isActive: e.target.checked})} />
                                    <span className="font-bold">Активен</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" checked={editingPopup.hasForm} onChange={e => setEditingPopup({...editingPopup, hasForm: e.target.checked})} />
                                    <span>Включить форму заявки</span>
                                </label>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Задержка появления (секунды)</label>
                                <input type="number" className="w-24 p-2 rounded bg-slate-50 border border-slate-300" value={editingPopup.delaySeconds} onChange={e => setEditingPopup({...editingPopup, delaySeconds: parseInt(e.target.value)})} />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-500">Сохранить</button>
                                <button type="button" onClick={() => setEditingPopup(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Отмена</button>
                            </div>
                        </form>
                     )}
                </div>
            )}

            {/* --- SEO --- */}
            {activeTab === 'seo' && (
                <div className="grid lg:grid-cols-3 gap-6">
                     <div className="lg:col-span-1 bg-slate-50 p-4 rounded-xl h-[600px] overflow-y-auto border border-slate-200">
                        <div className="mb-4 sticky top-0 bg-slate-50 pb-2 z-10">
                            <input 
                                placeholder="Поиск страницы..." 
                                className="w-full p-2 border rounded"
                                value={seoSearch}
                                onChange={(e) => setSeoSearch(e.target.value)}
                            />
                        </div>
                        <div className="space-y-1">
                            {filteredSeoPages.map(page => (
                                <button
                                    key={page.key}
                                    onClick={() => setSelectedSeoPage(page.key)}
                                    className={`w-full text-left px-3 py-2 rounded text-sm truncate transition-colors ${
                                        selectedSeoPage === page.key 
                                        ? 'bg-brand-orange text-white font-bold' 
                                        : 'hover:bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    <span className="block text-xs opacity-70 mb-0.5">{page.group}</span>
                                    {page.label}
                                </button>
                            ))}
                        </div>
                     </div>

                     <div className="lg:col-span-2 space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-800">
                             Редактирование мета-тегов для: <b>{getAllSeoPages().find(p => p.key === selectedSeoPage)?.label}</b>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Meta Title</label>
                            <input 
                                className="w-full p-2 border border-slate-300 rounded"
                                value={settings.seo[selectedSeoPage]?.title || ''}
                                onChange={(e) => handleSeoChange(selectedSeoPage, 'title', e.target.value)}
                                placeholder="Заголовок страницы"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Meta Description</label>
                            <textarea 
                                className="w-full p-2 border border-slate-300 rounded h-24"
                                value={settings.seo[selectedSeoPage]?.description || ''}
                                onChange={(e) => handleSeoChange(selectedSeoPage, 'description', e.target.value)}
                                placeholder="Описание для поисковиков"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Keywords</label>
                            <input 
                                className="w-full p-2 border border-slate-300 rounded"
                                value={settings.seo[selectedSeoPage]?.keywords || ''}
                                onChange={(e) => handleSeoChange(selectedSeoPage, 'keywords', e.target.value)}
                                placeholder="ключевые, слова, через, запятую"
                            />
                        </div>

                        <ImagePicker 
                            label="OG Image (Картинка для соцсетей)" 
                            value={settings.seo[selectedSeoPage]?.ogImage || ''}
                            onChange={(url) => handleSeoChange(selectedSeoPage, 'ogImage', url)}
                        />

                        <div className="pt-4 border-t mt-4">
                            <button onClick={handleSaveSettings} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-500 w-full md:w-auto">
                                Сохранить SEO настройки
                            </button>
                        </div>
                     </div>
                </div>
            )}

            {/* --- SETTINGS (CODE & BRANDING) --- */}
            {activeTab === 'settings' && (
                <div className="max-w-4xl space-y-6">
                    {/* General Settings Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                         <h3 className="text-xl font-bold mb-4">Брендинг</h3>
                         <div className="space-y-6">
                            <ImagePicker 
                              label="Логотип в шапке (Header)" 
                              value={settings.logo || ''} 
                              onChange={(url) => setSettings({...settings, logo: url})} 
                            />
                            <ImagePicker 
                              label="Фавикон сайта (рекомендуется 32x32 или 64x64 PNG)" 
                              value={settings.favicon || ''} 
                              onChange={(url) => setSettings({...settings, favicon: url})} 
                            />
                         </div>
                    </div>

                    {/* Social Media Section */}
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                        <h3 className="text-xl font-bold mb-4">Социальные сети (Footer)</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">ВКонтакте (VK)</label>
                                <input 
                                    className="w-full p-2 border border-slate-300 rounded" 
                                    placeholder="https://vk.com/..."
                                    value={settings.socials?.vk || ''}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socials: { ...settings.socials, vk: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">Telegram</label>
                                <input 
                                    className="w-full p-2 border border-slate-300 rounded" 
                                    placeholder="https://t.me/..."
                                    value={settings.socials?.telegram || ''}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socials: { ...settings.socials, telegram: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">VC.ru</label>
                                <input 
                                    className="w-full p-2 border border-slate-300 rounded" 
                                    placeholder="https://vc.ru/..."
                                    value={settings.socials?.vc || ''}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socials: { ...settings.socials, vc: e.target.value }
                                    })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-slate-500 mb-1">TJ (ТЖ)</label>
                                <input 
                                    className="w-full p-2 border border-slate-300 rounded" 
                                    placeholder="https://tjournal.ru/..."
                                    value={settings.socials?.tj || ''}
                                    onChange={(e) => setSettings({
                                        ...settings, 
                                        socials: { ...settings.socials, tj: e.target.value }
                                    })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-sm text-yellow-800">
                        <span className="font-bold">Внимание:</span> Вставка некорректного кода (JS/HTML) может сломать сайт. Будьте осторожны.
                    </div>

                    <div>
                        <label className="block font-bold mb-2 font-mono">Header Code (&lt;head&gt;)</label>
                        <p className="text-xs text-slate-500 mb-2">Для Яндекс.Метрики, Google Analytics, верификации и стилей.</p>
                        <textarea 
                            className="w-full h-48 bg-slate-900 text-green-400 font-mono p-4 rounded-xl text-sm"
                            value={settings.headerCode}
                            onChange={(e) => setSettings({...settings, headerCode: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block font-bold mb-2 font-mono">Footer Code (&lt;/body&gt;)</label>
                        <p className="text-xs text-slate-500 mb-2">Для чат-ботов, пикселей и скриптов, которые не требуют немедленной загрузки.</p>
                        <textarea 
                            className="w-full h-48 bg-slate-900 text-green-400 font-mono p-4 rounded-xl text-sm"
                            value={settings.footerCode}
                            onChange={(e) => setSettings({...settings, footerCode: e.target.value})}
                        />
                    </div>

                    <button onClick={handleSaveSettings} className="px-6 py-3 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-brand-orange">
                        Сохранить настройки
                    </button>
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
                    <button type="button" onClick={() => setShowRteImagePicker(false)} className="p-2 hover:bg-slate-100 rounded-full"><Settings size={20} /></button>
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

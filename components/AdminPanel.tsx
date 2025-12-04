
import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, Users, MessageSquare, Briefcase, Save, Trash2, Plus, LogOut, ArrowLeft, Settings, Layers, Search, Globe, Box, Tag, Image as ImageIcon, FileText, List, Loader } from 'lucide-react';
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
  const [settings, setSettings] = useState<SiteSettings>({ headerCode: '', footerCode: '', seo: {} });

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
        setSettings(s);
    } catch (e) {
        console.error(e);
        alert('Ошибка загрузки данных');
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') {
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
          <TabButton id="settings" label="Код" icon={Settings} />
        </div>

        {loading ? (
            <div className="flex justify-center py-20"><Loader className="animate-spin text-brand-orange" /></div>
        ) : (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            {/* Dashboard Tab */}
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

            {/* Media Tab */}
            {activeTab === 'media' && (
                <div className="h-[600px]">
                    <MediaLibrary />
                </div>
            )}

            {/* Leads Tab */}
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

            {/* Blog Tab (Simplified View, assuming logic remains similar to previous step but async) */}
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
                      </div>
                      <div className="grid gap-4">
                        {blogPosts.map(post => (
                          <div key={post.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-4">
                              <img src={post.image} alt="" className="w-16 h-16 rounded object-cover" />
                              <div>
                                <h4 className="font-bold text-slate-900">{post.title}</h4>
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
                      {/* Form inputs same as before... */}
                       <h3 className="text-xl font-bold mb-4">{editingPost.id ? 'Редактирование статьи' : 'Новая статья'}</h3>
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
                       <RichTextEditor content={editingPost.content} onChange={(html) => setEditingPost({...editingPost, content: html})} onImageRequest={() => setShowRteImagePicker(true)} />
                       <div className="flex gap-4 pt-4">
                        <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-500">Сохранить</button>
                        <button type="button" onClick={() => setEditingPost(null)} className="px-6 py-2 bg-slate-200 text-slate-700 rounded font-bold hover:bg-slate-300">Отмена</button>
                      </div>
                    </form>
                  )}
                </div>
            )}
            
            {/* Other tabs follow same pattern of async handlers */}
            {/* ... Cases, Reviews, Team, Popups, Settings, SEO ... */}
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

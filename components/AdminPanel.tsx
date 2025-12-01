
import React, { useState, useEffect } from 'react';
import { Lock, LayoutDashboard, Users, MessageSquare, Briefcase, Save, Trash2, Plus, LogOut, ArrowLeft, Settings, Layers, Search, Globe, Box, Tag } from 'lucide-react';
import { dataManager } from '../services/dataManager';
import { CaseStudy, Testimonial, Lead, TeamMember, Popup, SiteSettings } from '../types';
import { SERVICES, PACKAGES } from '../constants';

interface AdminPanelProps {
  onBack: () => void;
}

type Tab = 'dashboard' | 'leads' | 'cases' | 'reviews' | 'team' | 'popups' | 'settings' | 'seo';

interface SeoPageItem {
  key: string;
  label: string;
  group: 'Основные' | 'Услуги' | 'Пакеты' | 'Кейсы' | 'Другое';
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  
  // Data State
  const [leads, setLeads] = useState<Lead[]>([]);
  const [cases, setCases] = useState<CaseStudy[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({ headerCode: '', footerCode: '', seo: {} });

  // Editing State
  const [editingCase, setEditingCase] = useState<CaseStudy | null>(null);
  const [editingReview, setEditingReview] = useState<Testimonial | null>(null);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [editingPopup, setEditingPopup] = useState<Popup | null>(null);

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

  const loadData = () => {
    setLeads(dataManager.getLeads());
    setCases(dataManager.getCases());
    setReviews(dataManager.getTestimonials());
    setTeam(dataManager.getTeam());
    setPopups(dataManager.getPopups());
    setSettings(dataManager.getSettings());
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

  const handleLeadStatus = (id: string, status: Lead['status']) => {
    dataManager.updateLeadStatus(id, status);
    setLeads(dataManager.getLeads());
  };

  const handleDeleteLead = (id: string) => {
    if(confirm('Удалить заявку?')) {
        dataManager.deleteLead(id);
        setLeads(dataManager.getLeads());
    }
  };

  const handleSaveCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCase) {
      dataManager.saveCase(editingCase);
      setEditingCase(null);
      setCases(dataManager.getCases());
    }
  };

  const handleDeleteCase = (id: string) => {
    if (confirm('Вы уверены?')) {
      dataManager.deleteCase(id);
      setCases(dataManager.getCases());
    }
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingReview) {
      dataManager.saveTestimonial(editingReview);
      setEditingReview(null);
      setReviews(dataManager.getTestimonials());
    }
  };

  const handleDeleteReview = (id: number) => {
    if (confirm('Вы уверены?')) {
      dataManager.deleteTestimonial(id);
      setReviews(dataManager.getTestimonials());
    }
  };

  const handleSaveTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingMember) {
      dataManager.saveTeamMember(editingMember);
      setEditingMember(null);
      setTeam(dataManager.getTeam());
    }
  };

  const handleSavePopup = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPopup) {
      dataManager.savePopup(editingPopup);
      setEditingPopup(null);
      setPopups(dataManager.getPopups());
    }
  };

  const handleDeletePopup = (id: string) => {
    if (confirm('Удалить этот попап?')) {
      dataManager.deletePopup(id);
      setPopups(dataManager.getPopups());
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    dataManager.saveSettings(settings);
    alert('Настройки сохранены. Обновите страницу, чтобы изменения вступили в силу.');
  };

  // SEO Helpers
  const handleSeoChange = (pageKey: string, field: 'title' | 'description', value: string) => {
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

  // Generate complete list of pages for SEO
  const getAllSeoPages = (): SeoPageItem[] => {
    const pages: SeoPageItem[] = [
      { key: 'home', label: 'Главная', group: 'Основные' },
      { key: 'services', label: 'Все Услуги (Список)', group: 'Основные' },
      { key: 'cases', label: 'Все Кейсы (Список)', group: 'Основные' },
      { key: 'about', label: 'О нас', group: 'Основные' },
      { key: 'reviews', label: 'Отзывы', group: 'Основные' },
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

    return pages;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-2xl w-full max-w-md border border-white/10">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-brand-yellow mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white">Valstand CMS</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Пароль администратора"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-brand-yellow outline-none"
            />
            <button className="w-full py-3 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange transition-colors">
              Войти
            </button>
            <button type="button" onClick={onBack} className="w-full py-3 text-gray-400 hover:text-white">
              Назад на сайт
            </button>
          </form>
        </div>
      </div>
    );
  }

  const TabButton = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
        activeTab === id ? 'bg-brand-yellow text-brand-dark font-bold' : 'text-gray-400 hover:text-white'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-brand-dark text-white pt-20 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Панель управления</h1>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400 hover:text-red-300">
            <LogOut size={18} /> Выйти
          </button>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 bg-white/5 p-2 rounded-xl border border-white/5 overflow-x-auto scrollbar-hide">
          <TabButton id="dashboard" label="Сводка" icon={LayoutDashboard} />
          <TabButton id="leads" label="Заявки" icon={MessageSquare} />
          <TabButton id="cases" label="Кейсы" icon={Briefcase} />
          <TabButton id="reviews" label="Отзывы" icon={Users} />
          <TabButton id="team" label="Команда" icon={Users} />
          <TabButton id="popups" label="Попапы" icon={Layers} />
          <TabButton id="seo" label="SEO" icon={Search} />
          <TabButton id="settings" label="Код" icon={Settings} />
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-white/10">
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-6 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <h3 className="text-gray-400 mb-2">Новых заявок</h3>
                <p className="text-4xl font-bold text-blue-400">
                  {leads.filter(l => l.status === 'new').length}
                </p>
              </div>
              <div className="p-6 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <h3 className="text-gray-400 mb-2">Всего кейсов</h3>
                <p className="text-4xl font-bold text-purple-400">{cases.length}</p>
              </div>
              <div className="p-6 bg-green-500/10 rounded-xl border border-green-500/20">
                <h3 className="text-gray-400 mb-2">Отзывов</h3>
                <p className="text-4xl font-bold text-green-400">{reviews.length}</p>
              </div>
            </div>
          )}

          {/* Leads Tab */}
          {activeTab === 'leads' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
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
                    <tr key={lead.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="p-4 text-sm text-gray-400">{new Date(lead.date).toLocaleDateString()}</td>
                      <td className="p-4 font-bold">{lead.name}</td>
                      <td className="p-4">{lead.phone}</td>
                      <td className="p-4 text-brand-yellow">{lead.service}</td>
                      <td className="p-4">
                        <select 
                          value={lead.status}
                          onChange={(e) => handleLeadStatus(lead.id, e.target.value as any)}
                          className={`bg-transparent border rounded px-2 py-1 text-xs ${
                            lead.status === 'new' ? 'border-green-500 text-green-500' :
                            lead.status === 'contacted' ? 'border-blue-500 text-blue-500' :
                            'border-gray-500 text-gray-500'
                          }`}
                        >
                          <option value="new">Новая</option>
                          <option value="contacted">Обработана</option>
                          <option value="archived">Архив</option>
                        </select>
                      </td>
                      <td className="p-4">
                          <button onClick={() => handleDeleteLead(lead.id)} className="text-red-400 hover:text-red-300">
                              <Trash2 size={16} />
                          </button>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center text-gray-500">Заявок пока нет</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Cases Tab */}
          {activeTab === 'cases' && (
            <div>
              {!editingCase ? (
                <>
                  <button 
                    onClick={() => setEditingCase({
                      id: Date.now().toString(),
                      title: 'Новый кейс',
                      category: '',
                      description: '',
                      fullDescription: '',
                      image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop',
                      tags: [],
                      results: [],
                      challenge: '',
                      solution: '',
                      clientInfo: ''
                    })}
                    className="mb-6 flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange"
                  >
                    <Plus size={18} /> Добавить кейс
                  </button>
                  <div className="grid gap-4">
                    {cases.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                        <div className="flex items-center gap-4">
                          <img src={item.image} alt="" className="w-16 h-16 rounded object-cover" />
                          <div>
                            <h4 className="font-bold">{item.title}</h4>
                            <p className="text-xs text-gray-400">{item.category}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setEditingCase(item)} className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">Ред.</button>
                          <button onClick={() => handleDeleteCase(item.id)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Удалить</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <form onSubmit={handleSaveCase} className="space-y-4 max-w-2xl">
                  <h3 className="text-xl font-bold mb-4">Редактирование кейса</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Название</label>
                          <input required className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingCase.title} onChange={e => setEditingCase({...editingCase, title: e.target.value})} />
                      </div>
                      <div>
                          <label className="block text-sm text-gray-400 mb-1">Категория</label>
                          <input required className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingCase.category} onChange={e => setEditingCase({...editingCase, category: e.target.value})} />
                      </div>
                  </div>
                  <div>
                      <label className="block text-sm text-gray-400 mb-1">Ссылка на изображение</label>
                      <input className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingCase.image} onChange={e => setEditingCase({...editingCase, image: e.target.value})} />
                  </div>
                  <div>
                      <label className="block text-sm text-gray-400 mb-1">Краткое описание</label>
                      <textarea className="w-full p-2 rounded bg-black/30 border border-white/10 h-24" value={editingCase.description} onChange={e => setEditingCase({...editingCase, description: e.target.value})} />
                  </div>
                  
                  {/* Detailed Fields */}
                  <div>
                      <label className="block text-sm text-gray-400 mb-1">Задача (Challenge)</label>
                      <textarea className="w-full p-2 rounded bg-black/30 border border-white/10 h-24" value={editingCase.challenge || ''} onChange={e => setEditingCase({...editingCase, challenge: e.target.value})} />
                  </div>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Решение (Solution)</label>
                      <textarea className="w-full p-2 rounded bg-black/30 border border-white/10 h-24" value={editingCase.solution || ''} onChange={e => setEditingCase({...editingCase, solution: e.target.value})} />
                  </div>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Итоги (Full Description)</label>
                      <textarea className="w-full p-2 rounded bg-black/30 border border-white/10 h-24" value={editingCase.fullDescription || ''} onChange={e => setEditingCase({...editingCase, fullDescription: e.target.value})} />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="submit" className="px-6 py-2 bg-green-600 rounded font-bold hover:bg-green-500">Сохранить</button>
                    <button type="button" onClick={() => setEditingCase(null)} className="px-6 py-2 bg-gray-600 rounded font-bold hover:bg-gray-500">Отмена</button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
             <div>
             {!editingReview ? (
               <>
                 <button 
                   onClick={() => setEditingReview({
                     id: Date.now(),
                     name: '',
                     role: '',
                     company: '',
                     text: '',
                     avatar: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=200&auto=format&fit=crop'
                   })}
                   className="mb-6 flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange"
                 >
                   <Plus size={18} /> Добавить отзыв
                 </button>
                 <div className="grid gap-4">
                   {reviews.map(item => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                       <div className="flex items-center gap-4">
                         <img src={item.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                         <div>
                           <h4 className="font-bold">{item.name}</h4>
                           <p className="text-xs text-gray-400">{item.company}</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setEditingReview(item)} className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">Ред.</button>
                         <button onClick={() => handleDeleteReview(item.id)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Удалить</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </>
             ) : (
               <form onSubmit={handleSaveReview} className="space-y-4 max-w-xl">
                 <h3 className="text-xl font-bold mb-4">Редактирование отзыва</h3>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Имя</label>
                    <input required className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingReview.name} onChange={e => setEditingReview({...editingReview, name: e.target.value})} />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Должность</label>
                        <input required className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingReview.role} onChange={e => setEditingReview({...editingReview, role: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm text-gray-400 mb-1">Компания</label>
                        <input className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingReview.company} onChange={e => setEditingReview({...editingReview, company: e.target.value})} />
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Текст отзыва</label>
                    <textarea required className="w-full p-2 rounded bg-black/30 border border-white/10 h-32" value={editingReview.text} onChange={e => setEditingReview({...editingReview, text: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Ссылка на аватар</label>
                    <input className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingReview.avatar} onChange={e => setEditingReview({...editingReview, avatar: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-4">
                   <button type="submit" className="px-6 py-2 bg-green-600 rounded font-bold hover:bg-green-500">Сохранить</button>
                   <button type="button" onClick={() => setEditingReview(null)} className="px-6 py-2 bg-gray-600 rounded font-bold hover:bg-gray-500">Отмена</button>
                 </div>
               </form>
             )}
           </div>
          )}

           {/* Team Tab */}
           {activeTab === 'team' && (
             <div>
             {!editingMember ? (
               <>
                 <div className="grid gap-4">
                   {team.map(item => (
                     <div key={item.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                       <div className="flex items-center gap-4">
                         <img src={item.image} alt="" className="w-12 h-12 rounded-full object-cover" />
                         <div>
                           <h4 className="font-bold">{item.name}</h4>
                           <p className="text-xs text-gray-400">{item.role}</p>
                         </div>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setEditingMember(item)} className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">Редактировать</button>
                       </div>
                     </div>
                   ))}
                 </div>
               </>
             ) : (
               <form onSubmit={handleSaveTeam} className="space-y-4 max-w-xl">
                 <h3 className="text-xl font-bold mb-4">Редактирование: {editingMember.name}</h3>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Должность</label>
                    <input required className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingMember.role} onChange={e => setEditingMember({...editingMember, role: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Описание</label>
                    <textarea required className="w-full p-2 rounded bg-black/30 border border-white/10 h-32" value={editingMember.description} onChange={e => setEditingMember({...editingMember, description: e.target.value})} />
                 </div>
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Ссылка на фото</label>
                    <input className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingMember.image} onChange={e => setEditingMember({...editingMember, image: e.target.value})} />
                 </div>
                 <div className="flex gap-4 pt-4">
                   <button type="submit" className="px-6 py-2 bg-green-600 rounded font-bold hover:bg-green-500">Сохранить</button>
                   <button type="button" onClick={() => setEditingMember(null)} className="px-6 py-2 bg-gray-600 rounded font-bold hover:bg-gray-500">Отмена</button>
                 </div>
               </form>
             )}
           </div>
          )}

          {/* Popups Tab */}
          {activeTab === 'popups' && (
             <div>
             {!editingPopup ? (
               <>
                 <button 
                   onClick={() => setEditingPopup({
                     id: Date.now().toString(),
                     title: 'Специальное предложение',
                     text: '',
                     hasForm: true,
                     isActive: true,
                     delaySeconds: 5,
                     imageUrl: '',
                     imageWidth: 100
                   })}
                   className="mb-6 flex items-center gap-2 px-4 py-2 bg-brand-yellow text-brand-dark font-bold rounded-lg hover:bg-brand-orange"
                 >
                   <Plus size={18} /> Создать попап
                 </button>
                 <div className="grid gap-4">
                   {popups.map(item => (
                     <div key={item.id} className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border-l-4 ${item.isActive ? 'border-green-500' : 'border-gray-500'}`}>
                       <div>
                         <h4 className="font-bold">{item.title}</h4>
                         <p className="text-xs text-gray-400">Задержка: {item.delaySeconds}с | Форма: {item.hasForm ? 'Да' : 'Нет'}</p>
                       </div>
                       <div className="flex gap-2">
                         <button onClick={() => setEditingPopup(item)} className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30">Ред.</button>
                         <button onClick={() => handleDeletePopup(item.id)} className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">Удалить</button>
                       </div>
                     </div>
                   ))}
                   {popups.length === 0 && <p className="text-gray-500 text-center py-8">Нет активных попапов</p>}
                 </div>
               </>
             ) : (
               <form onSubmit={handleSavePopup} className="space-y-4 max-w-2xl">
                 <h3 className="text-xl font-bold mb-4">Настройка попапа</h3>
                 <div className="grid md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Заголовок</label>
                      <input required className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingPopup.title} onChange={e => setEditingPopup({...editingPopup, title: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Задержка (сек)</label>
                      <input type="number" className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingPopup.delaySeconds} onChange={e => setEditingPopup({...editingPopup, delaySeconds: parseInt(e.target.value)})} />
                   </div>
                 </div>
                 
                 <div>
                    <label className="block text-sm text-gray-400 mb-1">Текст сообщения</label>
                    <textarea required className="w-full p-2 rounded bg-black/30 border border-white/10 h-24" value={editingPopup.text} onChange={e => setEditingPopup({...editingPopup, text: e.target.value})} />
                 </div>

                 <div className="grid md:grid-cols-2 gap-4">
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">URL изображения (необязательно)</label>
                      <input className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingPopup.imageUrl || ''} onChange={e => setEditingPopup({...editingPopup, imageUrl: e.target.value})} />
                   </div>
                   <div>
                      <label className="block text-sm text-gray-400 mb-1">Ширина картинки (%)</label>
                      <input type="number" min="10" max="100" className="w-full p-2 rounded bg-black/30 border border-white/10" value={editingPopup.imageWidth || 100} onChange={e => setEditingPopup({...editingPopup, imageWidth: parseInt(e.target.value)})} />
                   </div>
                 </div>

                 <div className="flex gap-8 py-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingPopup.hasForm} onChange={e => setEditingPopup({...editingPopup, hasForm: e.target.checked})} className="w-5 h-5 text-brand-orange" />
                      <span>Включить форму заявки</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={editingPopup.isActive} onChange={e => setEditingPopup({...editingPopup, isActive: e.target.checked})} className="w-5 h-5 text-green-500" />
                      <span>Попап Активен</span>
                    </label>
                 </div>

                 <div className="flex gap-4 pt-4">
                   <button type="submit" className="px-6 py-2 bg-green-600 rounded font-bold hover:bg-green-500">Сохранить</button>
                   <button type="button" onClick={() => setEditingPopup(null)} className="px-6 py-2 bg-gray-600 rounded font-bold hover:bg-gray-500">Отмена</button>
                 </div>
               </form>
             )}
           </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
             <form onSubmit={handleSaveSettings} className="space-y-6 h-full flex flex-col">
                <div className="flex-shrink-0">
                  <h3 className="text-xl font-bold mb-2">Настройки SEO</h3>
                  <p className="text-gray-400 text-sm mb-6">Управление Meta Title и Description для всех страниц сайта, включая услуги и кейсы.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6 h-[600px]">
                  
                  {/* Left Column: Page List */}
                  <div className="w-full md:w-1/3 flex flex-col bg-black/30 rounded-xl border border-white/10 overflow-hidden">
                     <div className="p-4 border-b border-white/10 bg-white/5">
                        <div className="relative">
                           <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                           <input 
                             type="text" 
                             placeholder="Поиск страницы..." 
                             className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/10 rounded-lg text-sm text-white focus:border-brand-yellow outline-none"
                             value={seoSearch}
                             onChange={(e) => setSeoSearch(e.target.value)}
                           />
                        </div>
                     </div>
                     <div className="flex-grow overflow-y-auto p-2 space-y-1">
                        {getAllSeoPages()
                           .filter(p => p.label.toLowerCase().includes(seoSearch.toLowerCase()))
                           .map(page => (
                             <button
                               type="button"
                               key={page.key}
                               onClick={() => setSelectedSeoPage(page.key)}
                               className={`w-full text-left p-3 rounded-lg text-sm transition-colors flex items-center justify-between group ${
                                 selectedSeoPage === page.key 
                                   ? 'bg-brand-yellow text-brand-dark font-bold' 
                                   : 'text-gray-400 hover:bg-white/5 hover:text-white'
                               }`}
                             >
                               <span className="truncate">{page.label}</span>
                               <span className={`text-[10px] px-1.5 py-0.5 rounded uppercase tracking-wide ${
                                 selectedSeoPage === page.key ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-500'
                               }`}>
                                 {page.group === 'Основные' && <Globe size={10} />}
                                 {page.group === 'Услуги' && <Layers size={10} />}
                                 {page.group === 'Кейсы' && <Briefcase size={10} />}
                                 {page.group === 'Пакеты' && <Box size={10} />}
                                 {page.group === 'Другое' && <Tag size={10} />}
                               </span>
                             </button>
                           ))
                        }
                     </div>
                  </div>

                  {/* Right Column: Editor */}
                  <div className="w-full md:w-2/3 bg-white/5 rounded-xl border border-white/10 p-6 flex flex-col">
                     <div className="mb-6 pb-6 border-b border-white/10">
                        <h4 className="text-lg font-bold text-white mb-1">
                           {getAllSeoPages().find(p => p.key === selectedSeoPage)?.label || selectedSeoPage}
                        </h4>
                        <p className="text-xs text-gray-500 font-mono">ID: {selectedSeoPage}</p>
                     </div>

                     <div className="space-y-6 flex-grow">
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Meta Title</label>
                          <input 
                            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-brand-yellow outline-none transition-colors"
                            placeholder="Например: Таргетированная реклама | Valstand"
                            value={settings.seo[selectedSeoPage]?.title || ''}
                            onChange={(e) => handleSeoChange(selectedSeoPage, 'title', e.target.value)}
                          />
                          <p className="text-xs text-gray-500 mt-2">
                             Если оставить пустым, будет использован стандартный заголовок.
                          </p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-semibold text-gray-300 mb-2">Meta Description</label>
                          <textarea 
                            className="w-full p-3 rounded-lg bg-black/40 border border-white/10 text-white focus:border-brand-yellow outline-none transition-colors h-32 resize-none"
                            placeholder="Краткое описание страницы для поисковых систем..."
                            value={settings.seo[selectedSeoPage]?.description || ''}
                            onChange={(e) => handleSeoChange(selectedSeoPage, 'description', e.target.value)}
                          />
                        </div>
                     </div>

                     <div className="pt-6 border-t border-white/10 flex justify-end">
                       <button type="submit" className="px-6 py-3 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-brand-orange transition-colors flex items-center gap-2">
                          <Save size={18} />
                          Сохранить SEO настройки
                       </button>
                     </div>
                  </div>

                </div>
             </form>
          )}

          {/* Settings (Code) Tab */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-3xl">
              <div className="bg-yellow-900/20 p-4 rounded-xl text-yellow-200 text-sm mb-6 border border-yellow-700/30">
                <strong className="block mb-1">Внимание!</strong>
                Здесь вы можете добавить коды счетчиков аналитики (Яндекс.Метрика, Google Analytics) или другие скрипты. Будьте осторожны: некорректный код может сломать сайт.
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Header Code</label>
                <p className="text-sm text-gray-400 mb-2">Код будет добавлен в конец тега &lt;head&gt;</p>
                <textarea 
                  className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 focus:border-brand-yellow outline-none"
                  placeholder="<script>...</script>"
                  value={settings.headerCode}
                  onChange={e => setSettings({...settings, headerCode: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-lg font-bold mb-2">Footer Code</label>
                <p className="text-sm text-gray-400 mb-2">Код будет добавлен перед закрывающим тегом &lt;/body&gt;</p>
                <textarea 
                  className="w-full h-48 bg-black/50 border border-white/10 rounded-xl p-4 font-mono text-xs text-green-400 focus:border-brand-yellow outline-none"
                  placeholder="<script>...</script>"
                  value={settings.footerCode}
                  onChange={e => setSettings({...settings, footerCode: e.target.value})}
                />
              </div>

              <button type="submit" className="px-8 py-3 bg-brand-yellow text-brand-dark font-bold rounded-xl hover:bg-brand-orange transition-colors flex items-center gap-2">
                <Save size={18} />
                Сохранить настройки
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

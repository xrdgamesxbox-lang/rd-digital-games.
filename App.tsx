
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Star, Settings,
  LogOut, Edit2, Trash2, Plus, X, Loader2, Lock, Mail, UserPlus, LogIn,
  Instagram, Facebook, AlertTriangle, CheckCircle, Zap, Palette, Image as ImageIcon, Gamepad2, Layers, Check, Wifi, WifiOff, Terminal, Copy, HelpCircle, Rocket, ShieldCheck, RefreshCcw, ExternalLink, Activity, Globe, Search, Info, Download, Box, Monitor, AlertOctagon, Wallet, MessageCircle, Save, TrendingUp, Users, ShoppingBag, Eye, Clock, Type, Send, Languages, Phone, CreditCard, Calendar, Tag, ChevronRight, Link as LinkIcon, ArrowUp, ArrowDown, UserCheck, Key, ListChecks, DollarSign, History, GripVertical, FileText, Youtube, Video
} from 'lucide-react';
import { Game, User, CartItem, License } from './types.ts';
import GameCard from './components/GameCard.tsx';
import AdminModal from './components/AdminModal.tsx';
import BulkPriceModal from './components/BulkPriceModal.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import ProductPage from './components/ProductPage.tsx'; 
import RefundPolicy from './components/RefundPolicy.tsx';
import GamePassSEO from './components/GamePassSEO.tsx';
import { supabase } from './services/supabaseClient.ts';

const ADMIN_EMAIL = 'xrdgamesxbox@gmail.com';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'products' | 'settings' | 'categories'>('dashboard');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Game | null>(null);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showGamePassSEO, setShowGamePassSEO] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('jogo');
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0, totalVisits: 0, recentSales: [] as any[] });
  
  const [siteSettings, setSiteSettings] = useState<any>({
    primary_color: '#ccff00',
    bg_color: '#000000',
    text_color: '#ffffff',
    logo_url: '',
    login_title: 'RD DIGITAL',
    hero_title: 'A loja líder em venda de jogos!',
    hero_description: 'A RD Digital se destaca como a referência no mercado de Xbox, oferecendo uma ampla variedade de produtos com entrega imediata.',
    hero_image: 'https://images.unsplash.com/photo-1621259182978-f09e5e2ca09a?q=80&w=2069&auto=format&fit=crop',
    how_it_works_title: 'Como Funciona?',
    how_it_works_subtitle: 'Entenda tudo sobre a mídia digital e não tenha dúvidas!',
    how_it_works_btn: 'Saiba mais',
    how_it_works_image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2000&auto=format&fit=crop',
    how_it_works_video_url: '',
    text_parental: 'A Conta Parental é uma licença compartilhada oficial. Você joga no seu próprio perfil pessoal.',
    text_exclusive: 'A Conta Exclusiva é totalmente sua. Você recebe e-mail e senha e pode alterar os dados.',
    catalog_title: 'CATÁLOGO COMPLETO',
    search_placeholder: 'Procurar jogo no catálogo...',
    tab_games: 'JOGOS',
    tab_gamepass: 'GAME PASS',
    tab_preorder: 'PRÉ-VENDA',
    tab_codes: '25 DÍGITOS',
    pix_key: 'rodrigooportunidades20@gmail.com',
    pix_name: 'RODRIGO RD GAMES',
    whatsapp_number: '55619982351315',
    category_order: 'jogo,gamepass,prevenda,codigo25'
  });

  const [games, setGames] = useState<Game[]>([]);

  const sortedCategories = useMemo(() => {
    const order = siteSettings.category_order.split(',');
    const categoryMap: any = {
      jogo: { id: 'jogo', label: siteSettings.tab_games, icon: <Gamepad2 className="w-4 h-4" /> },
      gamepass: { id: 'gamepass', label: siteSettings.tab_gamepass, icon: <Layers className="w-4 h-4" /> },
      prevenda: { id: 'prevenda', label: siteSettings.tab_preorder, icon: <Rocket className="w-4 h-4" /> },
      codigo25: { id: 'codigo25', label: siteSettings.tab_codes, icon: <Key className="w-4 h-4" /> }
    };
    return order.map((id: string) => categoryMap[id]).filter(Boolean);
  }, [siteSettings]);

  useEffect(() => {
    checkUser();
    fetchInitialData();
    trackVisit();
    const savedCart = localStorage.getItem('rd_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--neon-green', siteSettings.primary_color);
    root.style.setProperty('--bg-dark', siteSettings.bg_color);
    root.style.setProperty('--text-main', siteSettings.text_color);
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };
    root.style.setProperty('--neon-glow', hexToRgba(siteSettings.primary_color, 0.4));
  }, [siteSettings]);

  const fetchInitialData = async () => {
    try {
      let { data: gamesData } = await supabase.from('games').select('*').order('display_order', { ascending: true });
      if (gamesData) setGames(gamesData.map(g => ({...g, is_available: g.is_available !== false})));
      
      const { data: settingsData } = await supabase.from('site_settings').select('key, value');
      if (settingsData) {
        const settingsMap: any = { ...siteSettings };
        settingsData.forEach(item => { settingsMap[item.key] = item.value; });
        setSiteSettings(settingsMap);
      }
    } catch (err) {}
    setLoading(false);
  };

  const trackVisit = async () => { try { await supabase.from('site_visits').insert([{ user_agent: navigator.userAgent }]); } catch (e) {} };
  
  const fetchStats = async () => {
    if (!user?.isAdmin) return;
    try {
      const { count: visitsCount } = await supabase.from('site_visits').select('*', { count: 'exact', head: true });
      const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      const totalRevenue = salesData?.reduce((acc, sale) => acc + (sale.status === 'aprovado' ? sale.total_amount : 0), 0) || 0;
      setStats({ totalSales: salesData?.length || 0, totalRevenue, totalVisits: visitsCount || 0, recentSales: salesData || [] });
    } catch (e) {}
  };

  useEffect(() => { if (isAdminPanelOpen) fetchStats(); }, [isAdminPanelOpen]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: String(message), type });
    setTimeout(() => setToast(null), 5000);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignUpMode) {
        await supabase.auth.signUp({ email, password });
        showToast("Verifique seu e-mail.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email!, isAdmin: data.user.email === ADMIN_EMAIL });
          setShowAuthModal(false);
        }
      }
    } catch (error: any) { showToast(error.message, 'error'); }
    finally { setAuthLoading(false); }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUser({ id: user.id, email: user.email!, isAdmin: user.email === ADMIN_EMAIL });
  };

  const handleSaveGame = async (gameData: Omit<Game, 'id'>) => {
    try {
      if (editingGame) await supabase.from('games').update(gameData).eq('id', editingGame.id);
      else await supabase.from('games').insert([gameData]);
      fetchInitialData();
      setShowAdminModal(false);
      showToast('Salvo com sucesso!');
    } catch (e) { showToast('Erro ao salvar', 'error'); }
  };

  const handleUpdateSetting = async (key: string, value: string) => {
    try {
      setSiteSettings((prev: any) => ({ ...prev, [key]: value }));
      await supabase.from('site_settings').upsert({ key, value });
      showToast("Configuração salva!");
    } catch (e) { showToast("Erro ao salvar", "error"); }
  };

  const moveCategory = async (index: number, direction: 'up' | 'down') => {
    const order = siteSettings.category_order.split(',');
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= order.length) return;
    const newOrder = [...order];
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    const orderStr = newOrder.join(',');
    handleUpdateSetting('category_order', orderStr);
  };

  const filteredCatalog = useMemo(() => {
    return games.filter(g => g.category === activeCategory).filter(g => g.title.toLowerCase().includes(catalogSearchTerm.toLowerCase()));
  }, [games, activeCategory, catalogSearchTerm]);

  // Fix: Defined addToCart to handle adding games to the cart and updating localStorage
  const addToCart = (game: Game, accountType: string, price: number) => {
    const newItem: CartItem = {
      cartId: Math.random().toString(36).substring(2, 11),
      gameId: game.id,
      title: game.title,
      image_url: game.image_url,
      accountType: accountType as any,
      price: price
    };
    const newCart = [...cart, newItem];
    setCart(newCart);
    localStorage.setItem('rd_cart', JSON.stringify(newCart));
    setIsCartOpen(true);
    showToast(`${game.title} adicionado ao carrinho!`);
  };

  // Fix: Defined handleOpenProduct to set the selected product and open its details page
  const handleOpenProduct = (game: Game) => {
    setSelectedProduct(game);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-12 h-12 text-[var(--neon-green)] animate-spin" /></div>;

  return (
    <div className="flex flex-col min-h-screen" style={{ color: siteSettings.text_color, backgroundColor: siteSettings.bg_color }}>
      {selectedProduct && <ProductPage game={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}
      {showAdminModal && <AdminModal onClose={() => {setShowAdminModal(false); setEditingGame(null)}} onSave={handleSaveGame} initialData={editingGame} />}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.cartId !== id))} onClear={() => setCart([])} siteSettings={siteSettings} customerEmail={user?.email} />
      
      {toast && (
        <div className="fixed top-24 right-8 z-[300] animate-bounce-in">
           <div className={`px-6 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest backdrop-blur-xl ${toast.type === 'error' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-[var(--neon-green)]/10 border-[var(--neon-green)]/20 text-[var(--neon-green)]'}`}>{toast.message}</div>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/90 backdrop-blur-xl border-b border-white/5 px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-5 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          {siteSettings.logo_url && !logoError ? <img src={siteSettings.logo_url} onError={() => setLogoError(true)} className="h-14 w-auto" /> : <Zap className="text-[var(--neon-green)] w-8 h-8 fill-[var(--neon-green)]" />}
          <span className="text-2xl font-black italic uppercase text-white hidden md:block">{siteSettings.login_title}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsCartOpen(true)} className="relative p-4 bg-white/5 rounded-2xl text-white">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[var(--neon-green)] text-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center">{cart.length}</span>}
          </button>
          {user ? (
            <>
               {user.isAdmin && <button onClick={() => setIsAdminPanelOpen(true)} className="bg-[var(--neon-green)] text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase">PAINEL ADM</button>}
               <button onClick={async () => { await supabase.auth.signOut(); setUser(null); }} className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
            </>
          ) : <button onClick={() => setShowAuthModal(true)} className="bg-[var(--neon-green)] text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase">ENTRAR</button>}
        </div>
      </nav>

      <div className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-20 pb-32 px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 z-10 text-center md:text-left">
            <h1 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase italic text-white animate-bounce-in">{siteSettings.hero_title}</h1>
            <p className="text-gray-400 text-xl max-w-xl mx-auto md:mx-0 font-medium">{siteSettings.hero_description}</p>
          </div>
          <div className="flex-1 relative"><img src={siteSettings.hero_image} className="w-full h-auto drop-shadow-[0_0_100px_var(--neon-glow)] animate-float rounded-[4rem]" /></div>
        </section>

        {/* COMO FUNCIONA */}
        <section className="px-8 max-w-7xl mx-auto w-full mb-32">
          <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-16 relative text-center lg:text-left">
             <div className="flex-1 space-y-8">
                <h2 className="text-5xl lg:text-7xl font-black text-[var(--neon-green)] uppercase italic tracking-tighter leading-[0.9]">{siteSettings.how_it_works_title}</h2>
                <p className="text-xl text-gray-400">{siteSettings.how_it_works_subtitle}</p>
                <button type="button" onClick={() => setShowInfoModal(true)} className="bg-[var(--neon-green)] text-black px-12 py-5 rounded-2xl font-black uppercase text-sm">{siteSettings.how_it_works_btn}</button>
             </div>
             <div className="flex-1 w-full">
                {siteSettings.how_it_works_video_url && siteSettings.how_it_works_video_url.includes('youtube') ? (
                   <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl">
                      <iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${siteSettings.how_it_works_video_url.split('v=')[1]}`} frameBorder="0" allowFullScreen></iframe>
                   </div>
                ) : <img src={siteSettings.how_it_works_image} className="w-full rounded-3xl" />}
             </div>
          </div>
        </section>

        {/* CATÁLOGO */}
        <div className="px-8 max-w-7xl mx-auto w-full pb-32">
           <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-10 mb-16 gap-8">
              <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">{siteSettings.catalog_title}</h2>
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <input type="text" value={catalogSearchTerm} onChange={e => setCatalogSearchTerm(e.target.value)} placeholder={siteSettings.search_placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-xs outline-none" />
              </div>
              <div className="flex flex-wrap gap-4 justify-center">
                 {sortedCategories.map(cat => (
                   <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all flex items-center gap-2 ${activeCategory === cat.id ? 'bg-[var(--neon-green)] text-black' : 'bg-white/5 text-gray-500 hover:text-white'}`}>
                     {cat.icon} {cat.label}
                   </button>
                 ))}
              </div>
           </div>
           <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-12">
             {filteredCatalog.map(game => <GameCard key={game.id} game={game} onOpenPage={handleOpenProduct} />)}
           </section>
        </div>
      </div>

      <footer className="bg-[#070709] border-t border-white/5 pt-20 pb-12 text-center md:text-left px-8">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
            <h4 className="text-2xl font-black uppercase italic text-white tracking-tighter">{siteSettings.login_title}</h4>
            <div className="flex flex-col gap-3 text-right">
              <a href="#" onClick={(e) => { e.preventDefault(); setShowRefundPolicy(true); }} className="text-[10px] font-black uppercase text-gray-500 hover:text-[var(--neon-green)]">Reembolso</a>
              <p className="text-[10px] text-gray-600 font-black uppercase">© 2024 RD Digital - Todos os Direitos Reservados</p>
            </div>
         </div>
      </footer>

      {/* ADMIN PANEL */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-[100] bg-black overflow-y-auto p-4 md:p-12">
           <div className="max-w-7xl mx-auto pb-20">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-4xl font-black italic uppercase text-white">GERENCIAMENTO</h2>
                 <button onClick={() => setIsAdminPanelOpen(false)} className="bg-white/5 p-4 rounded-3xl"><X className="w-8 h-8 text-white"/></button>
              </div>

              {/* TABS ADMIN */}
              <div className="flex flex-wrap gap-4 mb-12 border-b border-white/5 pb-6">
                {[
                  { id: 'dashboard', label: 'DASHBOARD', icon: <TrendingUp className="w-4 h-4" /> },
                  { id: 'products', label: 'PRODUTOS', icon: <Gamepad2 className="w-4 h-4" /> },
                  { id: 'settings', label: 'CONFIGURAÇÕES', icon: <Settings className="w-4 h-4" /> },
                  { id: 'categories', label: 'ORDENAR ABAS', icon: <GripVertical className="w-4 h-4" /> }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setActiveAdminTab(tab.id as any)} className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase transition-all flex items-center gap-3 ${activeAdminTab === tab.id ? 'bg-[var(--neon-green)] text-black' : 'text-gray-500 bg-white/5 hover:bg-white/10'}`}>
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* DASHBOARD TAB */}
              {activeAdminTab === 'dashboard' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem]">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Vendas Totais</p>
                      <h4 className="text-5xl font-black text-white italic">R$ {stats.totalRevenue.toFixed(2)}</h4>
                   </div>
                   <div className="bg-white/5 border border-white/5 p-10 rounded-[3rem]">
                      <p className="text-[10px] font-black text-gray-500 uppercase mb-2">Visitas Únicas</p>
                      <h4 className="text-5xl font-black text-white italic">{stats.totalVisits}</h4>
                   </div>
                   <div className="bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/20 p-10 rounded-[3rem]">
                      <p className="text-[10px] font-black text-[var(--neon-green)] uppercase mb-2">Solicitações</p>
                      <h4 className="text-5xl font-black text-white italic">{stats.totalSales}</h4>
                   </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {activeAdminTab === 'products' && (
                <div className="space-y-12">
                  <div className="flex justify-between items-center">
                    <button onClick={() => {setEditingGame(null); setShowAdminModal(true)}} className="bg-[var(--neon-green)] px-12 py-5 rounded-2xl text-black font-black uppercase text-xs flex items-center gap-3"><Plus /> NOVO PRODUTO</button>
                    <div className="text-gray-500 text-[10px] font-black uppercase">{games.length} Jogos Cadastrados</div>
                  </div>
                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                    {games.map(game => (
                      <div key={game.id} className="bg-white/5 p-4 rounded-[2rem] border border-white/5 group relative">
                        <img src={game.image_url} className="w-full h-40 object-cover rounded-2xl mb-4" />
                        <h5 className="text-white font-bold text-xs uppercase truncate mb-4">{game.title}</h5>
                        <div className="flex gap-2">
                          <button onClick={() => {setEditingGame(game); setShowAdminModal(true)}} className="flex-1 bg-white/5 text-white py-2 rounded-xl text-[9px] font-black hover:bg-[var(--neon-green)] hover:text-black transition-colors">EDITAR</button>
                          <button onClick={() => { if(confirm("Deseja excluir?")) supabase.from('games').delete().eq('id', game.id).then(() => fetchInitialData()); }} className="p-2 bg-red-600/10 text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SETTINGS TAB (A QUE HAVIA SUMIDO) */}
              {activeAdminTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   {/* TEXTOS DO SITE */}
                   <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                      <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><Type className="w-5 h-5 text-[var(--neon-green)]" /> TEXTOS DO SITE</h3>
                      <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Título Hero (Grande)</label>
                          <input type="text" value={siteSettings.hero_title} onChange={e => handleUpdateSetting('hero_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Descrição Hero</label>
                          <textarea rows={3} value={siteSettings.hero_description} onChange={e => handleUpdateSetting('hero_description', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Título Como Funciona</label>
                          <input type="text" value={siteSettings.how_it_works_title} onChange={e => handleUpdateSetting('how_it_works_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Texto Informativo Parental</label>
                          <textarea rows={3} value={siteSettings.text_parental} onChange={e => handleUpdateSetting('text_parental', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] font-black text-gray-500 uppercase">Texto Informativo Exclusivo</label>
                          <textarea rows={3} value={siteSettings.text_exclusive} onChange={e => handleUpdateSetting('text_exclusive', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                        </div>
                      </div>
                   </div>

                   {/* CORES E PAGAMENTOS */}
                   <div className="space-y-12">
                      <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                        <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><Wallet className="w-5 h-5 text-blue-500" /> VENDAS E CONTATO</h3>
                        <div className="grid grid-cols-1 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase">Chave PIX</label>
                              <input type="text" value={siteSettings.pix_key} onChange={e => handleUpdateSetting('pix_key', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase">Nome Beneficiário PIX</label>
                              <input type="text" value={siteSettings.pix_name} onChange={e => handleUpdateSetting('pix_name', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase">WhatsApp (Apenas Números)</label>
                              <input type="text" value={siteSettings.whatsapp_number} onChange={e => handleUpdateSetting('whatsapp_number', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                           </div>
                        </div>
                      </div>

                      <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-8">
                        <h3 className="text-xl font-black text-white uppercase italic flex items-center gap-3"><Palette className="w-5 h-5 text-purple-500" /> IDENTIDADE VISUAL</h3>
                        <div className="grid grid-cols-2 gap-6">
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase">Cor Principal</label>
                              <div className="flex gap-2">
                                <input type="color" value={siteSettings.primary_color} onChange={e => handleUpdateSetting('primary_color', e.target.value)} className="w-12 h-12 bg-transparent rounded cursor-pointer" />
                                <input type="text" value={siteSettings.primary_color} readOnly className="flex-grow bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                              </div>
                           </div>
                           <div className="space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase">Fundo do Site</label>
                              <input type="color" value={siteSettings.bg_color} onChange={e => handleUpdateSetting('bg_color', e.target.value)} className="w-full h-12 bg-transparent rounded cursor-pointer" />
                           </div>
                           <div className="col-span-2 space-y-2">
                              <label className="text-[9px] font-black text-gray-500 uppercase">URL da Logo (PNG transparente)</label>
                              <input type="text" value={siteSettings.logo_url} onChange={e => handleUpdateSetting('logo_url', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              )}

              {/* CATEGORIES TAB */}
              {activeAdminTab === 'categories' && (
                <div className="max-w-xl space-y-6">
                  <div className="bg-white/5 p-10 rounded-[3rem] border border-white/5 space-y-6">
                    <h3 className="text-xl font-black text-white uppercase italic">Arraste para Ordenar</h3>
                    <div className="space-y-4 pt-4">
                      {sortedCategories.map((cat, idx) => (
                        <div key={cat.id} className="bg-black/40 p-6 rounded-2xl flex items-center justify-between border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="bg-white/5 p-3 rounded-xl text-white">{cat.icon}</div>
                            <span className="text-sm font-black text-white uppercase tracking-tighter">{cat.label}</span>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => moveCategory(idx, 'up')} disabled={idx === 0} className="p-3 bg-white/5 rounded-xl text-white disabled:opacity-20 hover:bg-[var(--neon-green)] hover:text-black transition-all"><ArrowUp className="w-4 h-4" /></button>
                            <button onClick={() => moveCategory(idx, 'down')} disabled={idx === sortedCategories.length - 1} className="p-3 bg-white/5 rounded-xl text-white disabled:opacity-20 hover:bg-[var(--neon-green)] hover:text-black transition-all"><ArrowDown className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
           </div>
        </div>
      )}

      {showAuthModal && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
           <div className="relative w-full max-w-[400px] bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10">
                <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-gray-500"><X /></button>
                <h1 className="text-2xl font-black text-white uppercase italic text-center mb-8">{isSignUpMode ? 'CRIAR CONTA' : 'LOGIN ADM'}</h1>
                <form onSubmit={handleAuth} className="space-y-4">
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white text-sm" placeholder="E-mail" />
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black border border-white/5 rounded-2xl py-4 px-6 text-white text-sm" placeholder="Senha" />
                  <button type="submit" disabled={authLoading} className="w-full bg-[var(--neon-green)] text-black py-4 rounded-2xl font-black uppercase text-[10px]">
                    {authLoading ? <Loader2 className="animate-spin mx-auto" /> : 'ACESSAR'}
                  </button>
                  <button type="button" onClick={() => setIsSignUpMode(!isSignUpMode)} className="w-full text-[9px] font-black text-gray-500 uppercase mt-4">{isSignUpMode ? 'Já tenho conta' : 'Criar conta'}</button>
                </form>
           </div>
        </div>
      )}

      {/* INFO MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[5000] bg-black/95 flex items-center justify-center p-6" onClick={() => setShowInfoModal(false)}>
           <div className="bg-[#070709] border border-white/10 w-full max-w-4xl rounded-[3.5rem] p-10 animate-bounce-in" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-3xl font-black uppercase italic text-white">COMO FUNCIONA</h3>
                 <button onClick={() => setShowInfoModal(false)} className="bg-white/5 p-4 rounded-2xl text-white"><X /></button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <h4 className="text-xl font-black text-white uppercase italic mb-4">CONTA PARENTAL</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{siteSettings.text_parental}</p>
                 </div>
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <h4 className="text-xl font-black text-white uppercase italic mb-4">CONTA EXCLUSIVA</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">{siteSettings.text_exclusive}</p>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;

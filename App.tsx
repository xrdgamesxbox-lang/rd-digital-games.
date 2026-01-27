
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
import { searchGameData } from './services/geminiService.ts';

const ADMIN_EMAIL = 'xrdgamesxbox@gmail.com';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [activeAdminTab, setActiveAdminTab] = useState<'dashboard' | 'products' | 'licenses'>('dashboard');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Game | null>(null);
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);
  const [showGamePassSEO, setShowGamePassSEO] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [licenses, setLicenses] = useState<License[]>([]);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeCategory, setActiveCategory] = useState<'jogo' | 'gamepass' | 'prevenda' | 'codigo25'>('jogo');
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [xboxLinkCheck, setXboxLinkCheck] = useState('');
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);
  const [priceCheckResult, setPriceCheckResult] = useState<{ found: boolean, game?: Game, extractedTitle?: string, error?: string } | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0, totalVisits: 0, abandonedCarts: 0, recentSales: [] as any[] });
  const [siteSettings, setSiteSettings] = useState<any>({
    primary_color: '#ccff00',
    bg_color: '#000000',
    text_color: '#ffffff',
    logo_url: '',
    login_title: 'RD DIGITAL',
    login_subtitle: 'Sua conta de jogos oficial',
    login_btn_text: 'ACESSAR AGORA',
    login_footer: 'RD Digital Games © 2024 • Todos os Direitos Reservados',
    hero_title: 'A loja líder em venda de jogos!',
    hero_description: 'A RD Digital se destaca como a referência no mercado de Xbox, oferecendo uma ampla variedade de produtos com entrega imediata e suporte 24h.',
    hero_image: 'https://images.unsplash.com/photo-1621259182978-f09e5e2ca09a?q=80&w=2069&auto=format&fit=crop',
    how_it_works_title: 'Como Funciona?',
    how_it_works_subtitle: 'Entenda tudo sobre a mídia digital e não tenha dúvidas!',
    how_it_works_btn: 'Saiba mais',
    how_it_works_image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2000&auto=format&fit=crop',
    how_it_works_video_url: '',
    text_parental: 'A Conta Parental é uma licença compartilhada oficial. Você joga no seu próprio perfil pessoal, conquista troféus e salva seu progresso. O método de acesso é simples e enviamos um tutorial passo a passo.',
    text_exclusive: 'A Conta Exclusiva é totalmente sua. Você recebe e-mail e senha, pode alterar os dados de segurança e compartilhar com um amigo se desejar (Configuração de Home Principal). É como comprar o jogo digitalmente na loja.',
    gamepass_title: 'GAME PASS PREMIUM',
    gamepass_subtitle: 'ASSINE E JOGUE CENTENAS DE TÍTULOS',
    prevenda_title: 'PRÉ-VENDAS ÉPICAS',
    prevenda_subtitle: 'GARANTA SEU LUGAR NO LANÇAMENTO',
    catalog_title: 'CATÁLOGO COMPLETO',
    search_placeholder: 'Procurar jogo no catálogo...',
    tab_games: 'JOGOS',
    tab_gamepass: 'GAME PASS',
    tab_preorder: 'PRÉ-VENDA',
    tab_codes: '25 DÍGITOS',
    cart_title: 'Seu Carrinho',
    cart_empty_text: 'Carrinho Vazio',
    checkout_button_text: 'PAGAR AGORA',
    pix_key: 'rodrigooportunidades20@gmail.com',
    pix_name: 'RODRIGO RD GAMES',
    whatsapp_number: '55619982351315', 
    stripe_public_key: 'pk_test_51ShFjSFLtqLxkHWdRthCEvD7ZoLKkF2pTSuuaCsPEQM7tfHM3QSWw471b7mwCOXgQrj6wxLODmoOmCSntYOZxSNp00yO7Y8EvQ',
    enable_stripe: 'true',
    enable_pix: 'true',
    enable_card_whatsapp: 'true',
  });
  const [games, setGames] = useState<Game[]>([]);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regex);
      if (match && match[1]) return `https://www.youtube.com/embed/${match[1]}?rel=0`;
      return null;
    } catch (e) { return null; }
  };

  useEffect(() => {
    checkUser();
    fetchInitialData();
    trackVisit();
    const savedCart = localStorage.getItem('rd_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
    const params = new URLSearchParams(window.location.search);
    if (params.get('page') === 'politica-de-reembolso') setShowRefundPolicy(true);
    if (params.get('page') === 'game-pass-ultimate') setShowGamePassSEO(true);
    if (params.get('success')) {
      showToast('Pagamento aprovado! Verifique seu e-mail ou contate nosso suporte.', 'success');
      setCart([]);
      localStorage.removeItem('rd_cart');
      updateUrl();
    }
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = () => { try { window.history.replaceState({}, document.title, window.location.pathname); } catch (e) {} }

  useEffect(() => {
    if (games.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const gameId = params.get('game');
      if (gameId) {
        const foundGame = games.find(g => g.id === gameId);
        if (foundGame) setSelectedProduct(foundGame);
      }
    }
  }, [games]);

  useEffect(() => { localStorage.setItem('rd_cart', JSON.stringify(cart)); }, [cart]);

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

  const handlePopState = () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    const page = params.get('page');
    if (!gameId) setSelectedProduct(null);
    setShowRefundPolicy(page === 'politica-de-reembolso');
    setShowGamePassSEO(page === 'game-pass-ultimate');
  };

  const handleOpenProduct = (game: Game) => {
    setSelectedProduct(game);
    try {
      const newUrl = `${window.location.pathname}?game=${game.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (e) {}
  };

  const handleCloseProduct = () => {
    setSelectedProduct(null);
    try { window.history.pushState({ path: window.location.pathname }, '', window.location.pathname); } catch (e) {}
  };

  const handleCheckPrice = async () => {
    if (!xboxLinkCheck.includes('xbox.com')) {
      showToast('Por favor, insira um link oficial da Xbox Store.', 'error');
      return;
    }
    setIsCheckingPrice(true);
    setPriceCheckResult(null);
    try {
      const data = await searchGameData(xboxLinkCheck);
      if (data) {
        const existingGame = games.find(g => 
          g.title.toLowerCase().includes(data.title.toLowerCase()) || 
          data.title.toLowerCase().includes(g.title.toLowerCase())
        );
        if (existingGame) setPriceCheckResult({ found: true, game: existingGame });
        else setPriceCheckResult({ found: false, extractedTitle: data.title });
      }
    } catch (e: any) {
      if (e.message === "LIMITE_EXCEDIDO") {
        setPriceCheckResult({ found: false, error: "LIMITE_EXCEDIDO" });
      } else {
        showToast('Erro ao processar o link.', 'error');
      }
    } finally {
      setIsCheckingPrice(false);
    }
  };

  const trackVisit = async () => { try { await supabase.from('site_visits').insert([{ user_agent: navigator.userAgent }]); } catch (e) {} };

  const fetchStats = async () => {
    if (!user?.isAdmin) return;
    try {
      const { count: visitsCount } = await supabase.from('site_visits').select('*', { count: 'exact', head: true });
      const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      const { data: licensesData } = await supabase.from('customer_licenses').select('*').order('created_at', { ascending: false });
      const totalRevenue = salesData?.reduce((acc, sale) => acc + (sale.status === 'aprovado' ? sale.total_amount : 0), 0) || 0;
      setStats({ totalSales: salesData?.length || 0, totalRevenue, totalVisits: visitsCount || 0, abandonedCarts: 0, recentSales: salesData || [] });
      if (licensesData) setLicenses(licensesData as unknown as License[]);
    } catch (e) {}
  };

  useEffect(() => { if (isAdminPanelOpen) fetchStats(); }, [isAdminPanelOpen]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: String(message), type });
    setTimeout(() => setToast(null), 6000);
  };

  const addToCart = async (game: Game, type: 'parental' | 'exclusiva' | 'gamepass' | 'prevenda' | 'codigo25', price: number) => {
    if (!user) { setShowAuthModal(true); showToast("ATENÇÃO: Para comprar você precisa criar uma conta!", "error"); return; }
    const newItem: CartItem = { cartId: Math.random().toString(36).substr(2, 9), gameId: game.id, title: game.title, image_url: game.image_url, accountType: type, price: price };
    const newCart = [...cart, newItem];
    setCart(newCart);
    setIsCartOpen(true);
    showToast(`${game.title} adicionado!`);
    if (selectedProduct) handleCloseProduct();
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email!, isAdmin: user.email === ADMIN_EMAIL });
        setShowAuthModal(false);
      }
    } catch (e) {}
    setLoading(false);
  };

  const fetchInitialData = async () => {
    try {
      let { data: gamesData, error: gamesError } = await supabase.from('games').select('*').order('display_order', { ascending: true });
      if (!gamesError && gamesData) {
        const sanitizedGames = gamesData.map((g, idx) => ({
             ...g,
             is_available: g.is_available !== false,
             is_parental_available: g.is_parental_available !== false,
             is_exclusive_available: g.is_exclusive_available !== false,
             display_order: g.display_order ?? idx
        }));
        setGames(sanitizedGames);
      }
      const { data: settingsData, error: settingsError } = await supabase.from('site_settings').select('key, value');
      if (!settingsError && settingsData) {
        const settingsMap: any = { ...siteSettings };
        settingsData.forEach(item => { if (item.key !== 'whatsapp_number') settingsMap[item.key] = item.value; });
        setSiteSettings(settingsMap);
      }
    } catch (err) {}
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    try {
      if (isSignUpMode) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setNeedsEmailConfirmation(true);
        setIsSignUpMode(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) {
          setUser({ id: data.user.id, email: data.user.email!, isAdmin: data.user.email === ADMIN_EMAIL });
          setShowAuthModal(false);
        }
      }
    } catch (error: any) { showToast(error.message || "Erro na autenticação", 'error'); }
    finally { setAuthLoading(false); }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); setIsAdminPanelOpen(false); };

  const handleSaveGame = async (gameData: Omit<Game, 'id'>) => {
    try {
      const timestamp = new Date().toISOString();
      const gameDataWithTimestamp = { ...gameData, updated_at: timestamp };
      if (editingGame) {
        const { data, error } = await supabase.from('games').update(gameDataWithTimestamp).eq('id', editingGame.id).select().single();
        if (error) throw error;
        if (data) setGames(games.map(g => g.id === editingGame.id ? data : g));
      } else {
        const nextOrder = games.length > 0 ? Math.max(...games.map(g => g.display_order || 0)) + 1 : 0;
        const { data, error } = await supabase.from('games').insert([{ ...gameDataWithTimestamp, display_order: nextOrder }]).select().single();
        if (error) throw error;
        if (data) setGames([...games, data]);
      }
      setShowAdminModal(false);
      showToast('Sucesso!');
    } catch (error: any) { showToast(error.message || "Erro ao salvar", 'error'); }
  };

  const filteredCatalog = useMemo(() => {
    return games.filter(g => g.category === activeCategory).filter(g => g.title.toLowerCase().includes(catalogSearchTerm.toLowerCase()));
  }, [games, activeCategory, catalogSearchTerm]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-12 h-12 text-[var(--neon-green)] animate-spin" /></div>;

  return (
    <div className="flex flex-col min-h-screen" style={{ color: siteSettings.text_color }}>
      {selectedProduct && <ProductPage game={selectedProduct} onClose={handleCloseProduct} onAddToCart={addToCart} />}
      {showRefundPolicy && <RefundPolicy onClose={() => setShowRefundPolicy(false)} />}
      {showGamePassSEO && <GamePassSEO onClose={() => setShowGamePassSEO(false)} whatsappNumber={siteSettings.whatsapp_number} />}
      {showAdminModal && <AdminModal onClose={() => {setShowAdminModal(false); setEditingGame(null)}} onSave={handleSaveGame} initialData={editingGame} />}
      {showBulkPriceModal && <BulkPriceModal games={games.filter(g => selectedGameIds.includes(g.id))} onClose={() => {setShowBulkPriceModal(false); setSelectedGameIds([])}} onSave={() => {}} />}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} items={cart} onRemove={(id) => setCart(cart.filter(i => i.cartId !== id))} onClear={() => setCart([])} siteSettings={siteSettings} customerEmail={user?.email} />
      
      {showInfoModal && (
        <div className="fixed inset-0 z-[5000] bg-black/95 backdrop-blur-md flex items-center justify-center p-6" onClick={(e) => { if (e.target === e.currentTarget) setShowInfoModal(false) }}>
           <div className="bg-[#070709] border border-white/10 w-full max-w-4xl rounded-[3.5rem] overflow-hidden animate-bounce-in flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">TIPOS DE CONTA</h3>
                 <button onClick={() => setShowInfoModal(false)} className="bg-white/5 p-4 rounded-2xl text-white"><X /></button>
              </div>
              <div className="p-10 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <h4 className="text-2xl font-black text-white uppercase italic mb-2">CONTA PARENTAL</h4>
                    <p className="text-gray-400 text-sm">{siteSettings.text_parental}</p>
                 </div>
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5">
                    <h4 className="text-2xl font-black text-white uppercase italic mb-2">CONTA EXCLUSIVA</h4>
                    <p className="text-gray-400 text-sm">{siteSettings.text_exclusive}</p>
                 </div>
              </div>
           </div>
        </div>
      )}

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
               {user.isAdmin && <button onClick={() => setIsAdminPanelOpen(true)} className="bg-[var(--neon-green)] text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase">ADM</button>}
               <button onClick={handleLogout} className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-red-500"><LogOut className="w-5 h-5" /></button>
            </>
          ) : <button onClick={() => setShowAuthModal(true)} className="bg-[var(--neon-green)] text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-[0_0_20px_var(--neon-glow)]"><LogIn className="w-4 h-4" /> ENTRAR / CRIAR CONTA</button>}
        </div>
      </nav>

      <div className="flex-grow">
        <section className="relative overflow-hidden pt-20 pb-32 px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 z-10 text-center md:text-left">
            <h1 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase italic text-white animate-bounce-in">{siteSettings.hero_title}</h1>
            <p className="text-gray-400 text-xl max-w-xl mx-auto md:mx-0 font-medium">{siteSettings.hero_description}</p>
          </div>
          <div className="flex-1 relative"><img src={siteSettings.hero_image} className="w-full h-auto drop-shadow-[0_0_100px_var(--neon-glow)] animate-float rounded-[4rem]" /></div>
        </section>

        <section className="px-8 max-w-4xl mx-auto w-full mb-32 relative">
           <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 md:p-16 rounded-[4rem] relative z-10 space-y-8 shadow-2xl">
              <div className="text-center space-y-4">
                 <div className="bg-[var(--neon-green)] w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_var(--neon-glow)] rotate-6"><LinkIcon className="text-black w-8 h-8" /></div>
                 <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">CONSULTAR PREÇO RD</h2>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cole o link do jogo na Xbox Store e descubra nosso valor exclusivo</p>
              </div>
              <div className="flex flex-col md:flex-row gap-4">
                 <input type="text" value={xboxLinkCheck} onChange={e => setXboxLinkCheck(e.target.value)} placeholder="https://www.xbox.com/pt-br/..." className="flex-grow bg-black/40 border border-white/10 rounded-3xl p-6 text-white text-sm outline-none" />
                 <button onClick={handleCheckPrice} disabled={isCheckingPrice} className="bg-[var(--neon-green)] text-black px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-widest">{isCheckingPrice ? <Loader2 className="animate-spin" /> : "VERIFICAR"}</button>
              </div>

              {priceCheckResult?.error === "LIMITE_EXCEDIDO" && (
                <div className="bg-orange-600/10 border border-orange-500/30 p-6 rounded-[2rem] flex items-center gap-4 animate-bounce-in">
                   <AlertTriangle className="text-orange-500 w-8 h-8 flex-shrink-0" />
                   <div>
                      <p className="text-[10px] text-white font-black uppercase">Limite da IA Atingido</p>
                      <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Devido à alta demanda, a consulta automática está temporariamente bloqueada. Por favor, tente novamente em 1 minuto.</p>
                   </div>
                </div>
              )}

              {priceCheckResult && !priceCheckResult.error && (
                 <div className="animate-bounce-in pt-6">
                    {priceCheckResult.found ? (
                       <div className="bg-[var(--neon-green)]/5 border border-[var(--neon-green)]/20 rounded-[3rem] p-8 flex flex-col md:flex-row items-center gap-8">
                          <img src={priceCheckResult.game?.image_url} className="w-24 h-32 rounded-2xl object-cover" />
                          <div className="flex-grow text-center md:text-left">
                             <p className="text-[10px] text-[var(--neon-green)] font-black uppercase mb-1">JOGO ENCONTRADO!</p>
                             <h4 className="text-2xl font-black text-white uppercase italic mb-4">{priceCheckResult.game?.title}</h4>
                             <div className="flex items-center gap-4 justify-center md:justify-start">
                                <div className="text-3xl font-black text-white italic">R$ {priceCheckResult.game?.current_price_parental?.toFixed(2)}</div>
                                <button onClick={() => handleOpenProduct(priceCheckResult.game!)} className="bg-[var(--neon-green)] text-black px-6 py-3 rounded-xl font-black uppercase text-[9px]">COMPRAR AGORA</button>
                             </div>
                          </div>
                       </div>
                    ) : (
                       <div className="bg-orange-600/5 border border-orange-500/20 rounded-[3rem] p-8 text-center space-y-6">
                          <AlertTriangle className="text-orange-500 w-12 h-12 mx-auto" />
                          <h4 className="text-xl font-black text-white uppercase italic">JOGO NÃO CADASTRADO NO CATÁLOGO</h4>
                          <button onClick={() => { const msg = encodeURIComponent(`Olá RD Digital! Gostaria de um orçamento para o jogo "${priceCheckResult.extractedTitle}". Vi no link: ${xboxLinkCheck}`); window.open(`https://wa.me/${siteSettings.whatsapp_number}?text=${msg}`, '_blank'); }} className="w-full bg-[#25D366] text-white py-6 rounded-3xl font-black uppercase text-xs flex items-center justify-center gap-3"><MessageCircle /> SOLICITAR NO WHATSAPP</button>
                       </div>
                    )}
                 </div>
              )}
           </div>
        </section>

        <section className="px-8 max-w-7xl mx-auto w-full mb-32">
          <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-16 relative">
             <div className="flex-1 space-y-8 z-10 text-center lg:text-left">
                <h2 className="text-5xl lg:text-7xl font-black text-[var(--neon-green)] uppercase italic tracking-tighter leading-[0.9]">{siteSettings.how_it_works_title}</h2>
                <p className="text-xl text-gray-400 max-w-lg mx-auto lg:mx-0">{siteSettings.how_it_works_subtitle}</p>
                <button type="button" onClick={() => setShowInfoModal(true)} className="bg-[var(--neon-green)] text-black px-12 py-5 rounded-2xl font-black uppercase text-sm shadow-[0_10px_40px_rgba(204,255,0,0.2)]">{siteSettings.how_it_works_btn}</button>
             </div>
             <div className="flex-1 w-full">
                {getYouTubeEmbedUrl(siteSettings.how_it_works_video_url) ? (
                   <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                      <iframe width="100%" height="100%" src={getYouTubeEmbedUrl(siteSettings.how_it_works_video_url)!} frameBorder="0" allowFullScreen></iframe>
                   </div>
                ) : <img src={siteSettings.how_it_works_image} className="w-full max-w-md mx-auto rounded-3xl shadow-2xl" />}
             </div>
          </div>
        </section>

        <div className="px-8 max-w-7xl mx-auto w-full">
           <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-10 mb-16 gap-8">
              <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">{siteSettings.catalog_title}</h2>
              <div className="relative w-full md:w-96">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <input type="text" value={catalogSearchTerm} onChange={e => setCatalogSearchTerm(e.target.value)} placeholder={siteSettings.search_placeholder} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-xs outline-none" />
              </div>
              <div className="flex flex-wrap gap-4">
                 <button onClick={() => setActiveCategory('jogo')} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${activeCategory === 'jogo' ? 'bg-[var(--neon-green)] text-black' : 'bg-white/5 text-gray-500'}`}>{siteSettings.tab_games}</button>
                 <button onClick={() => setActiveCategory('gamepass')} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${activeCategory === 'gamepass' ? 'bg-green-600 text-white' : 'bg-white/5 text-gray-500'}`}>{siteSettings.tab_gamepass}</button>
                 <button onClick={() => setActiveCategory('prevenda')} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${activeCategory === 'prevenda' ? 'bg-orange-600 text-white' : 'bg-white/5 text-gray-500'}`}>{siteSettings.tab_preorder}</button>
                 <button onClick={() => setActiveCategory('codigo25')} className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase transition-all ${activeCategory === 'codigo25' ? 'bg-purple-600 text-white' : 'bg-white/5 text-gray-500'}`}>{siteSettings.tab_codes}</button>
              </div>
           </div>
           <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-12 pb-24">
             {filteredCatalog.map(game => <GameCard key={game.id} game={game} onOpenPage={handleOpenProduct} />)}
           </section>
        </div>
      </div>

      <footer className="bg-[#070709] border-t border-white/5 pt-20 pb-12">
         <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
            <h4 className="text-2xl font-black uppercase italic text-white tracking-tighter">RD DIGITAL GAMES</h4>
            <div className="flex flex-col gap-4">
               <a href="#" onClick={(e) => { e.preventDefault(); setShowGamePassSEO(true); }} className="text-[10px] text-gray-400 hover:text-[var(--neon-green)] font-black uppercase">Game Pass Barato</a>
               <a href="#" onClick={(e) => { e.preventDefault(); setShowRefundPolicy(true); }} className="text-[10px] text-gray-400 hover:text-[var(--neon-green)] font-black uppercase">Política de Reembolso</a>
            </div>
         </div>
      </footer>

      {showAuthModal && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
           <div className="relative w-full max-w-[400px] animate-bounce-in bg-white/[0.03] p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
                <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
                <div className="text-center mb-10">
                   <h1 className="text-3xl font-black italic uppercase text-white">CONECTAR</h1>
                   <p className="text-[9px] text-gray-500 font-black uppercase mt-1">Sua conta de jogos oficial</p>
                </div>
                <form onSubmit={handleAuth} className="space-y-4">
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:border-[var(--neon-green)]/50 outline-none" placeholder="E-mail" />
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:border-[var(--neon-green)]/50 outline-none" placeholder="Senha" />
                  <button type="submit" disabled={authLoading} className="w-full bg-[var(--neon-green)] text-black py-4 rounded-2xl font-black uppercase text-[10px] shadow-[0_10px_30px_var(--neon-glow)]">
                    {authLoading ? <Loader2 className="animate-spin mx-auto" /> : (isSignUpMode ? 'CRIAR CONTA' : 'ACESSAR AGORA')}
                  </button>
                  <button type="button" onClick={() => setIsSignUpMode(!isSignUpMode)} className="w-full text-[9px] font-black uppercase text-gray-500 mt-4">{isSignUpMode ? 'JÁ TENHO CONTA' : 'CRIAR CONTA AGORA'}</button>
                </form>
           </div>
        </div>
      )}

      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-[100] bg-black overflow-y-auto p-4 md:p-12">
           <div className="max-w-7xl mx-auto pb-20">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="text-4xl font-black italic uppercase text-white">ADMINISTRAÇÃO</h2>
                 <button onClick={() => setIsAdminPanelOpen(false)} className="bg-white/5 p-4 rounded-3xl"><X className="w-8 h-8 text-white"/></button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                 <div className="bg-[#070709] border border-white/5 p-8 rounded-[3rem]">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Faturamento</p>
                    <h4 className="text-3xl font-black text-white italic mt-2">R$ {stats.totalRevenue.toFixed(2)}</h4>
                 </div>
                 <button onClick={() => {setEditingGame(null); setShowAdminModal(true)}} className="bg-[var(--neon-green)] p-8 rounded-[3rem] text-black font-black uppercase text-xs flex items-center justify-center gap-3"><Plus /> NOVO PRODUTO</button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                {games.map(game => (
                  <div key={game.id} className="bg-white/5 p-6 rounded-[2.5rem] relative group border border-white/5">
                    <img src={game.image_url} className="w-full h-40 object-cover rounded-2xl mb-4" />
                    <h5 className="text-white font-black uppercase italic truncate">{game.title}</h5>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => {setEditingGame(game); setShowAdminModal(true)}} className="flex-1 bg-white/10 text-white py-2 rounded-xl text-[9px] font-black">EDITAR</button>
                      <button onClick={() => supabase.from('games').delete().eq('id', game.id).then(() => fetchInitialData())} className="p-2 bg-red-600/10 text-red-500 rounded-xl"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;

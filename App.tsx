
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Star, Settings,
  LogOut, Edit2, Trash2, Plus, X, Loader2, Lock, Mail, UserPlus, LogIn,
  Instagram, Facebook, AlertTriangle, CheckCircle, Zap, Palette, Image as ImageIcon, Gamepad2, Layers, Check, Wifi, WifiOff, Terminal, Copy, HelpCircle, Rocket, ShieldCheck, RefreshCcw, ExternalLink, Activity, Globe, Search, Info, Download, Box, Monitor, AlertOctagon, Wallet, MessageCircle, Save, TrendingUp, Users, ShoppingBag, Eye, Clock, Type, Send, Languages, Phone, CreditCard, Calendar, Tag, ChevronRight, Link as LinkIcon, ArrowUp, ArrowDown
} from 'lucide-react';
import { Game, User, CartItem } from './types.ts';
import GameCard from './components/GameCard.tsx';
import AdminModal from './components/AdminModal.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import { supabase } from './services/supabaseClient.ts';
import { searchGameData } from './services/geminiService.ts';

const ADMIN_EMAIL = 'xrdgamesxbox@gmail.com';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [needsEmailConfirmation, setNeedsEmailConfirmation] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [activeCategory, setActiveCategory] = useState<'jogo' | 'gamepass' | 'prevenda'>('jogo');
  
  // Estados para Busca e Verificação de Preço
  const [catalogSearchTerm, setCatalogSearchTerm] = useState('');
  const [xboxLinkCheck, setXboxLinkCheck] = useState('');
  const [isCheckingPrice, setIsCheckingPrice] = useState(false);
  const [priceCheckResult, setPriceCheckResult] = useState<{ found: boolean, game?: Game, extractedTitle?: string } | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  const [stats, setStats] = useState({
    totalSales: 0,
    totalRevenue: 0,
    totalVisits: 0,
    abandonedCarts: 0,
    recentSales: [] as any[]
  });

  const [siteSettings, setSiteSettings] = useState({
    hero_title: 'A loja líder em venda de jogos!',
    hero_description: 'A RD Digital se destaca como a referência no mercado de Xbox, oferecendo uma ampla variedade de produtos com entrega imediata e suporte 24h.',
    promo_bar_text: '🔥 JOGOS XBOX COM ATÉ 90% DE DESCONTO - ENTREGA IMEDIATA 🔥',
    hero_image: 'https://images.unsplash.com/photo-1621259182978-f09e5e2ca09a?q=80&w=2069&auto=format&fit=crop',
    logo_url: '',
    footer_description: 'A melhor loja de produtos digitais para Xbox com entrega imediata e suporte eficiente via WhatsApp.',
    primary_color: '#ccff00',
    bg_color: '#000000',
    text_color: '#ffffff',
    pix_key: 'rodrigooportunidades20@gmail.com',
    pix_name: 'RODRIGO RD GAMES',
    whatsapp_number: '5511999999999',
    stripe_public_key: 'pk_test_51ShFjSFLtqLxkHWdRthCEvD7ZoLKkF2pTSuuaCsPEQM7tfHM3QSWw471b7mwCOXgQrj6wxLODmoOmCSntYOZxSNp00yO7Y8EvQ',
    enable_stripe: 'true',
    enable_pix: 'true',
    gamepass_title: 'GAME PASS PREMIUM',
    gamepass_subtitle: 'ASSINE E JOGUE CENTENAS DE TÍTULOS',
    prevenda_title: 'PRÉ-VENDAS ÉPICAS',
    prevenda_subtitle: 'GARANTA SEU LUGAR NO LANÇAMENTO',
    catalog_title: 'CATÁLOGO COMPLETO',
    cart_title: 'Seu Carrinho',
    cart_empty_text: 'Carrinho Vazio',
    pix_checkout_title: 'Pagamento PIX',
    checkout_button_text: 'PAGAR AGORA'
  });

  const [games, setGames] = useState<Game[]>([]);

  useEffect(() => {
    checkUser();
    fetchInitialData();
    trackVisit();
    
    const savedCart = localStorage.getItem('rd_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const params = new URLSearchParams(window.location.search);
    if (params.get('success')) {
      showToast('Pagamento aprovado! Verifique seu e-mail ou contate nosso suporte.', 'success');
      setCart([]);
      localStorage.removeItem('rd_cart');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    if (params.get('cancel')) {
      showToast('O pagamento foi cancelado.', 'error');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rd_cart', JSON.stringify(cart));
  }, [cart]);

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

  // Função para verificar preço por link
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
        // Busca se já temos o jogo no nosso estado 'games'
        const existingGame = games.find(g => 
          g.title.toLowerCase().includes(data.title.toLowerCase()) || 
          data.title.toLowerCase().includes(g.title.toLowerCase())
        );

        if (existingGame) {
          setPriceCheckResult({ found: true, game: existingGame });
        } else {
          setPriceCheckResult({ found: false, extractedTitle: data.title });
        }
      }
    } catch (e) {
      showToast('Erro ao processar o link.', 'error');
    } finally {
      setIsCheckingPrice(false);
    }
  };

  const trackVisit = async () => {
    try {
      await supabase.from('site_visits').insert([{ user_agent: navigator.userAgent }]);
    } catch (e) { console.error("Error tracking visit", e); }
  };

  const fetchStats = async () => {
    if (!user?.isAdmin) return;
    try {
      const { count: visitsCount } = await supabase.from('site_visits').select('*', { count: 'exact', head: true });
      const { data: salesData } = await supabase.from('sales').select('*').order('created_at', { ascending: false });
      const { count: abandonedCount } = await supabase
        .from('cart_activity')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', false);

      const totalRevenue = salesData?.reduce((acc, sale) => acc + (sale.status === 'aprovado' ? sale.total_amount : 0), 0) || 0;

      setStats({
        totalSales: salesData?.length || 0,
        totalRevenue,
        totalVisits: visitsCount || 0,
        abandonedCarts: abandonedCount || 0,
        recentSales: salesData || []
      });
    } catch (e) { console.error("Error fetching stats", e); }
  };

  useEffect(() => {
    if (isAdminPanelOpen) fetchStats();
  }, [isAdminPanelOpen]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: String(message), type });
    setTimeout(() => setToast(null), 6000);
  };

  const addToCart = async (game: Game, type: 'parental' | 'exclusiva' | 'gamepass' | 'prevenda', price: number) => {
    const newItem: CartItem = {
      cartId: Math.random().toString(36).substr(2, 9),
      gameId: game.id,
      title: game.title,
      image_url: game.image_url,
      accountType: type,
      price: price
    };
    const newCart = [...cart, newItem];
    setCart(newCart);
    setIsCartOpen(true);
    showToast(`${game.title} adicionado!`);

    await supabase.from('cart_activity').insert([{
      items: newCart,
      total_amount: newCart.reduce((acc, i) => acc + i.price, 0),
      is_completed: false
    }]);
  };

  const removeFromCart = (cartId: string) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser({ id: user.id, email: user.email!, isAdmin: user.email === ADMIN_EMAIL });
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchInitialData = async () => {
    try {
      // Tenta buscar ordenado por display_order (recurso novo)
      let { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('display_order', { ascending: true });
      
      // Se houver erro (provavelmente a coluna display_order não existe ainda no Supabase),
      // fazemos o fallback para a ordenação padrão por data de criação para que os produtos APAREÇAM.
      if (gamesError) {
        console.warn("Ordenação personalizada indisponível, usando fallback.", gamesError);
        const fallback = await supabase
          .from('games')
          .select('*')
          .order('created_at', { ascending: true });
        
        gamesData = fallback.data;
        gamesError = fallback.error;
      }
      
      if (!gamesError && gamesData) {
        // Preenche o display_order na memória se vier nulo do banco
        const sanitizedGames = gamesData.map((g, idx) => ({
             ...g,
             display_order: g.display_order !== null && g.display_order !== undefined ? g.display_order : idx
        }));
        setGames(sanitizedGames);
      }

      const { data: settingsData, error: settingsError } = await supabase.from('site_settings').select('key, value');
      if (!settingsError && settingsData) {
        const settingsMap: any = { ...siteSettings };
        settingsData.forEach(item => { settingsMap[item.key] = item.value; });
        setSiteSettings(settingsMap);
        setLogoError(false);
      }
    } catch (err) {
      console.error(err);
    }
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
        }
      }
    } catch (error: any) {
      showToast(error.message || "Erro na autenticação", 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAdminPanelOpen(false);
  };

  const handleUpdateSaleStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('sales').update({ status }).eq('id', id);
    if (!error) {
      showToast(`Pedido atualizado!`);
      fetchStats();
      if (selectedOrder?.id === id) setSelectedOrder({...selectedOrder, status});
    }
  };

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    const { error } = await supabase.from('sales').delete().eq('id', orderToDelete);
    if (!error) {
      showToast('Pedido removido com sucesso!');
      fetchStats();
      if (selectedOrder?.id === orderToDelete) setSelectedOrder(null);
      setOrderToDelete(null);
    } else {
      showToast('Erro ao remover pedido.', 'error');
      setOrderToDelete(null);
    }
  };

  const handleMoveGame = async (gameId: string, direction: 'up' | 'down') => {
    const index = games.findIndex(g => g.id === gameId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === games.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newGames = [...games];
    
    // Troca de posição no array
    [newGames[index], newGames[targetIndex]] = [newGames[targetIndex], newGames[index]];

    // Atualiza o display_order baseado no novo índice
    const updatedGames = newGames.map((g, i) => ({ ...g, display_order: i }));
    setGames(updatedGames);

    // Persiste no Supabase
    try {
      await Promise.all([
        supabase.from('games').update({ display_order: index }).eq('id', newGames[index].id),
        supabase.from('games').update({ display_order: targetIndex }).eq('id', newGames[targetIndex].id)
      ]);
    } catch (e) {
      console.error("Erro ao salvar nova ordem:", e);
      showToast("Erro ao reorganizar jogo (Verifique se a coluna display_order existe).", "error");
    }
  };

  const handleSaveGame = async (gameData: Omit<Game, 'id'>) => {
    try {
      if (editingGame) {
        const { data, error } = await supabase.from('games').update(gameData).eq('id', editingGame.id).select().single();
        if (error) throw error;
        if (data) setGames(games.map(g => g.id === editingGame.id ? data : g));
      } else {
        // Define o display_order para o final da lista
        const nextOrder = games.length > 0 ? Math.max(...games.map(g => g.display_order || 0)) + 1 : 0;
        const { data, error } = await supabase.from('games').insert([{ ...gameData, display_order: nextOrder }]).select().single();
        if (error) throw error;
        if (data) setGames([...games, data]);
      }
      setShowAdminModal(false);
      showToast('Sucesso!');
    } catch (error: any) {
      showToast(error.message || "Erro ao salvar", 'error');
    }
  };

  const handleDeleteGame = async (id: string) => {
    const { error } = await supabase.from('games').delete().eq('id', id);
    if (!error) {
      setGames(games.filter(x => x.id !== id));
      setGameToDelete(null);
      showToast('Item removido!');
    }
  };

  const handleSaveSettings = async () => {
    setAuthLoading(true);
    try {
      const updates = Object.entries(siteSettings).map(([key, value]) => ({ key, value }));
      const { error } = await supabase.from('site_settings').upsert(updates);
      if (error) throw error;
      showToast('Configurações e Pagamentos salvos!');
    } catch (error: any) { showToast(error.message, 'error'); }
    finally { setAuthLoading(false); }
  };

  // Filtragem de catálogo com termo de busca
  const filteredCatalog = useMemo(() => {
    return games
      .filter(g => g.category === activeCategory)
      .filter(g => g.title.toLowerCase().includes(catalogSearchTerm.toLowerCase()));
  }, [games, activeCategory, catalogSearchTerm]);

  const gamepassGames = games.filter(g => g.category === 'gamepass');
  const prevendaGames = games.filter(g => g.category === 'prevenda');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-12 h-12 text-[var(--neon-green)] animate-spin" /></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--bg-dark)] flex items-center justify-center p-4 relative overflow-hidden bg-grid">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--neon-green)]/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="relative w-full max-w-[400px] animate-bounce-in">
          <div className="text-center mb-10">
             {siteSettings.logo_url && !logoError ? (
               <img src={siteSettings.logo_url} onError={() => setLogoError(true)} className="h-28 w-auto object-contain mx-auto mb-4 drop-shadow-[0_0_20px_var(--neon-glow)]" />
             ) : (
               <div className="w-16 h-16 bg-[var(--neon-green)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_var(--neon-glow)] rotate-3">
                  <Zap className="w-8 h-8 text-black fill-black" />
               </div>
             )}
             <h1 className="text-3xl font-black italic uppercase tracking-tighter neon-text-glow text-white">RD DIGITAL</h1>
             <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1">Sua conta de jogos oficial</p>
          </div>
          <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
            {needsEmailConfirmation ? (
              <div className="text-center space-y-6">
                 <Mail className="w-12 h-12 text-[var(--neon-green)] mx-auto animate-pulse" />
                 <h2 className="text-xl font-black text-white uppercase italic">CONFIRME SEU E-MAIL!</h2>
                 <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed">Verifique o link enviado para ativar sua conta.</p>
                 <button onClick={() => setNeedsEmailConfirmation(false)} className="w-full bg-[var(--neon-green)] text-black py-4 rounded-2xl font-black text-xs">ENTENDI</button>
              </div>
            ) : (
              <form onSubmit={handleAuth} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase ml-2 tracking-widest">E-mail de acesso</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:border-[var(--neon-green)]/50 outline-none transition-all" placeholder="nome@exemplo.com" />
                </div>
                <div className="space-y-1">
                  <label className="text-[8px] font-black text-gray-500 uppercase ml-2 tracking-widest">Sua senha</label>
                  <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white text-sm focus:border-[var(--neon-green)]/50 outline-none transition-all" placeholder="••••••••" />
                </div>
                <button type="submit" disabled={authLoading} className="w-full bg-[var(--neon-green)] text-black py-4 mt-2 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-[0_10px_30px_var(--neon-glow)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>ACESSAR AGORA <LogIn className="w-4 h-4" /></>}
                </button>
                <div className="pt-4 text-center border-t border-white/5 mt-6">
                  <button type="button" onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest">
                    {isSignUpMode ? 'JÁ TENHO UMA CONTA' : 'NÃO TEM CONTA? CADASTRE-SE'}
                  </button>
                </div>
              </form>
            )}
          </div>
          <p className="text-center text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-8">RD Digital Games © 2024 • Todos os Direitos Reservados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ color: siteSettings.text_color }}>
      {toast && (
        <div className="fixed top-24 right-8 z-[300] animate-bounce-in">
           <div className="px-6 py-4 rounded-2xl bg-[var(--neon-green)]/10 border border-[var(--neon-green)]/20 text-[var(--neon-green)] font-black text-[10px] uppercase tracking-widest backdrop-blur-xl">
             {toast.message}
           </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/90 backdrop-blur-xl border-b border-white/5 px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-5">
          {siteSettings.logo_url && !logoError ? (
            <img src={siteSettings.logo_url} onError={() => setLogoError(true)} className="h-14 w-auto object-contain drop-shadow-[0_0_10px_var(--neon-glow)]" />
          ) : (
            <Zap className="text-[var(--neon-green)] w-8 h-8 fill-[var(--neon-green)]" />
          )}
          <span className="text-2xl font-black italic uppercase text-white tracking-tighter">RD DIGITAL</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsCartOpen(true)} className="relative p-4 bg-white/5 rounded-2xl text-white">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[var(--neon-green)] text-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--bg-dark)]">{cart.length}</span>}
          </button>
          {user.isAdmin && <button onClick={() => setIsAdminPanelOpen(true)} className="bg-[var(--neon-green)] text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">ADM</button>}
          <button onClick={handleLogout} className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-red-500 transition-all"><LogOut className="w-5 h-5" /></button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32 px-8 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1 space-y-8 z-10 text-center md:text-left">
          <h1 className="text-6xl md:text-9xl font-black leading-[0.85] tracking-tighter uppercase italic text-white animate-bounce-in">{siteSettings.hero_title}</h1>
          <p className="text-gray-400 text-xl max-w-xl mx-auto md:mx-0 font-medium leading-relaxed">{siteSettings.hero_description}</p>
        </div>
        <div className="flex-1 relative">
          <img src={siteSettings.hero_image} className="relative w-full h-auto drop-shadow-[0_0_100px_var(--neon-glow)] animate-float rounded-[4rem]" />
        </div>
      </section>

      {/* COMPARADOR DE PREÇOS (DESTAQUE) */}
      <section className="px-8 max-w-4xl mx-auto w-full mb-32 relative group">
         <div className="absolute inset-0 bg-[var(--neon-green)]/10 blur-[100px] rounded-full opacity-50 pointer-events-none"></div>
         <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-10 md:p-16 rounded-[4rem] relative z-10 space-y-8 shadow-2xl">
            <div className="text-center space-y-4">
               <div className="bg-[var(--neon-green)] w-16 h-16 rounded-3xl mx-auto flex items-center justify-center shadow-[0_0_30px_var(--neon-glow)] rotate-6">
                  <LinkIcon className="text-black w-8 h-8" />
               </div>
               <h2 className="text-3xl font-black uppercase italic tracking-tighter text-white">CONSULTAR PREÇO RD</h2>
               <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Cole o link do jogo na Xbox Store e descubra nosso valor exclusivo</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
               <input 
                 type="text" 
                 value={xboxLinkCheck}
                 onChange={e => setXboxLinkCheck(e.target.value)}
                 onKeyDown={e => e.key === 'Enter' && handleCheckPrice()}
                 placeholder="https://www.xbox.com/pt-br/games/store/..." 
                 className="flex-grow bg-black/40 border border-white/10 rounded-3xl p-6 text-white text-sm outline-none focus:border-[var(--neon-green)]/50 transition-all"
               />
               <button 
                 onClick={handleCheckPrice}
                 disabled={isCheckingPrice}
                 className="bg-[var(--neon-green)] text-black px-12 py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
               >
                 {isCheckingPrice ? <Loader2 className="animate-spin" /> : "VERIFICAR"}
               </button>
            </div>

            {/* Resultado da Verificação */}
            {priceCheckResult && (
               <div className="animate-bounce-in pt-6">
                  {priceCheckResult.found ? (
                     <div className="bg-[var(--neon-green)]/5 border border-[var(--neon-green)]/20 rounded-[3rem] p-8 flex flex-col md:flex-row items-center gap-8">
                        <img src={priceCheckResult.game?.image_url} className="w-24 h-32 rounded-2xl object-cover shadow-2xl" />
                        <div className="flex-grow text-center md:text-left">
                           <p className="text-[10px] text-[var(--neon-green)] font-black uppercase tracking-widest mb-1">JOGO ENCONTRADO!</p>
                           <h4 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-4">{priceCheckResult.game?.title}</h4>
                           <div className="flex items-center gap-4 justify-center md:justify-start">
                              <div className="text-3xl font-black text-white italic">R$ {priceCheckResult.game?.current_price_parental?.toFixed(2)}</div>
                              <button 
                                onClick={() => addToCart(priceCheckResult.game!, 'parental', priceCheckResult.game!.current_price_parental!)}
                                className="bg-[var(--neon-green)] text-black px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest"
                              >
                                COMPRAR AGORA
                              </button>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="bg-orange-600/5 border border-orange-500/20 rounded-[3rem] p-8 text-center space-y-6">
                        <div className="flex flex-col items-center">
                           <AlertTriangle className="text-orange-500 w-12 h-12 mb-4" />
                           <h4 className="text-xl font-black text-white uppercase italic">JOGO NÃO CADASTRADO</h4>
                           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Mas não se preocupe, podemos conseguir para você agora!</p>
                        </div>
                        <button 
                          onClick={() => {
                            const msg = encodeURIComponent(`Olá RD Digital! Gostaria de um orçamento para o jogo "${priceCheckResult.extractedTitle}". Vi no link: ${xboxLinkCheck}`);
                            window.open(`https://wa.me/${siteSettings.whatsapp_number}?text=${msg}`, '_blank');
                          }}
                          className="w-full bg-[#25D366] text-white py-6 rounded-3xl font-black uppercase text-xs tracking-widest flex items-center justify-center gap-3 animate-pulse shadow-[0_10px_30px_rgba(37,211,102,0.3)]"
                        >
                           <MessageCircle /> SOLICITAR ORÇAMENTO WHATSAPP
                        </button>
                     </div>
                  )}
               </div>
            )}
         </div>
      </section>

      {/* VITRINES */}
      {gamepassGames.length > 0 && (
        <section className="px-8 max-w-7xl mx-auto w-full py-20 bg-[var(--neon-green)]/5 rounded-[5rem] border border-[var(--neon-green)]/10 mb-20 relative overflow-hidden">
           <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none"><Layers className="w-96 h-96 text-[var(--neon-green)]" /></div>
           <div className="relative z-10">
              <div className="flex items-center gap-4 mb-12">
                 <div className="bg-[var(--neon-green)] p-4 rounded-2xl"><Layers className="text-black w-8 h-8" /></div>
                 <div>
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter">{siteSettings.gamepass_title}</h2>
                    <p className="text-[10px] text-[var(--neon-green)] font-black uppercase tracking-[0.6em] mt-2">{siteSettings.gamepass_subtitle}</p>
                 </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                 {gamepassGames.map(game => (
                   <div key={game.id} className="relative group">
                     <GameCard game={game} onBuy={addToCart} />
                   </div>
                 ))}
              </div>
           </div>
        </section>
      )}

      {prevendaGames.length > 0 && (
        <section className="px-8 max-w-7xl mx-auto w-full py-20 mb-20">
           <div className="flex items-center gap-4 mb-12 justify-center md:justify-start">
              <div className="bg-orange-600 p-4 rounded-2xl shadow-[0_0_30px_rgba(234,88,12,0.4)]"><Rocket className="text-white w-8 h-8" /></div>
              <div>
                 <h2 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter">{siteSettings.prevenda_title}</h2>
                 <p className="text-[10px] text-orange-500 font-black uppercase tracking-[0.6em] mt-2">{siteSettings.prevenda_subtitle}</p>
              </div>
           </div>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
              {prevendaGames.map(game => (
                <div key={game.id} className="relative group">
                  <GameCard game={game} onBuy={addToCart} />
                </div>
              ))}
           </div>
        </section>
      )}

      {/* Catálogo */}
      <div className="px-8 max-w-7xl mx-auto w-full">
         <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-10 mb-16 gap-8">
            <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">{siteSettings.catalog_title}</h2>
            
            {/* SISTEMA DE BUSCA NO CATÁLOGO */}
            <div className="relative w-full md:w-96 group">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--neon-green)] transition-colors" />
               <input 
                 type="text" 
                 value={catalogSearchTerm}
                 onChange={e => setCatalogSearchTerm(e.target.value)}
                 placeholder="Procurar jogo no catálogo..." 
                 className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-xs outline-none focus:border-[var(--neon-green)]/40 transition-all shadow-lg"
               />
            </div>

            <div className="flex gap-4">
               <button onClick={() => setActiveCategory('jogo')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCategory === 'jogo' ? 'bg-[var(--neon-green)] text-black shadow-xl' : 'bg-white/5 text-gray-500'}`}>JOGOS</button>
               <button onClick={() => setActiveCategory('gamepass')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCategory === 'gamepass' ? 'bg-green-600 text-white shadow-xl' : 'bg-white/5 text-gray-500'}`}>GAME PASS</button>
               <button onClick={() => setActiveCategory('prevenda')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCategory === 'prevenda' ? 'bg-orange-600 text-white shadow-xl' : 'bg-white/5 text-gray-500'}`}>PRÉ-VENDA</button>
            </div>
         </div>
         
         {filteredCatalog.length > 0 ? (
           <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-48">
             {filteredCatalog.map(game => (
               <div key={game.id} className="relative group">
                 <GameCard game={game} onBuy={addToCart} />
                 {user.isAdmin && (
                  <div className="absolute top-8 right-8 z-40 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => {setEditingGame(game); setShowAdminModal(true)}} className="p-4 bg-blue-600 rounded-2xl text-white"><Edit2 className="w-4 h-4"/></button>
                    <button onClick={() => setGameToDelete(game.id)} className="p-4 bg-red-600 rounded-2xl text-white"><Trash2 className="w-4 h-4"/></button>
                  </div>
                 )}
               </div>
             ))}
           </section>
         ) : (
           <div className="text-center py-40 space-y-4 opacity-20">
              <Box className="w-16 h-16 mx-auto text-gray-500" />
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhum jogo encontrado com este nome</p>
           </div>
         )}
      </div>

      {/* ADM PANEL INTEGRAL */}
      {isAdminPanelOpen && (
        <div className="fixed inset-0 z-[100] bg-black overflow-y-auto p-4 md:p-12 custom-scrollbar">
           <div className="max-w-7xl mx-auto space-y-12 pb-20">
              <div className="flex justify-between items-center border-b border-white/5 pb-10">
                <div className="flex flex-col">
                   <h2 className="text-4xl font-black italic uppercase text-white">ADMINISTRAÇÃO RD</h2>
                   <p className="text-[9px] text-[var(--neon-green)] font-black uppercase tracking-[0.5em]">CONTROLE TOTAL DO SEU NEGÓCIO</p>
                </div>
                <button onClick={() => setIsAdminPanelOpen(false)} className="bg-white/5 p-4 rounded-3xl"><X className="w-8 h-8 text-white"/></button>
              </div>

              {/* DASHBOARD RÁPIDO */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                 <div className="bg-[#070709] border border-white/5 p-8 rounded-[3rem]">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Faturamento</p>
                    <h4 className="text-3xl font-black text-white italic mt-2">R$ {stats.totalRevenue.toFixed(2)}</h4>
                 </div>
                 <div className="bg-[#070709] border border-white/5 p-8 rounded-[3rem]">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Visitantes</p>
                    <h4 className="text-3xl font-black text-white italic mt-2">{stats.totalVisits}</h4>
                 </div>
                 <div className="bg-[#070709] border border-white/5 p-8 rounded-[3rem]">
                    <p className="text-[10px] font-black text-gray-500 uppercase">Vendas</p>
                    <h4 className="text-3xl font-black text-white italic mt-2">{stats.totalSales}</h4>
                 </div>
                 <button onClick={() => {setEditingGame(null); setShowAdminModal(true)}} className="bg-[var(--neon-green)] p-8 rounded-[3rem] text-black font-black uppercase text-xs flex items-center justify-center gap-3">
                   <Plus /> NOVO PRODUTO
                 </button>
              </div>

              {/* EDITOR DE CONFIGURAÇÕES E DICIONÁRIO */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* IDENTIDADE E VISUAL */}
                <div className="bg-[#070709] border border-white/5 p-10 rounded-[4rem] space-y-6">
                   <div className="flex items-center gap-3 text-[var(--neon-green)] mb-2">
                      <Palette className="w-5 h-5" />
                      <h3 className="text-[12px] font-black uppercase italic">IDENTIDADE VISUAL</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Logo URL (PNG Transparente)</label>
                        <input type="text" value={siteSettings.logo_url} onChange={e => setSiteSettings({...siteSettings, logo_url: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-xs" placeholder="Link da imagem .png" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Cor do Neon</label>
                        <input type="color" value={siteSettings.primary_color} onChange={e => setSiteSettings({...siteSettings, primary_color: e.target.value})} className="w-full h-12 bg-black border border-white/10 rounded-2xl p-1" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Imagem Destaque Hero (URL)</label>
                        <input type="text" value={siteSettings.hero_image} onChange={e => setSiteSettings({...siteSettings, hero_image: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-xs" />
                      </div>
                   </div>
                </div>

                {/* PAGAMENTO E GATEWAYS */}
                <div className="bg-[#070709] border border-[var(--neon-green)]/20 p-10 rounded-[4rem] space-y-6">
                   <div className="flex items-center gap-3 text-orange-500 mb-2">
                      <CreditCard className="w-5 h-5" />
                      <h3 className="text-[12px] font-black uppercase italic">GATEWAYS DE PAGAMENTO</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-4">
                        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Opção PIX Manual</p>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-600 uppercase">Chave PIX</label>
                          <input type="text" value={siteSettings.pix_key} onChange={e => setSiteSettings({...siteSettings, pix_key: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="checkbox" checked={siteSettings.enable_pix === 'true'} onChange={e => setSiteSettings({...siteSettings, enable_pix: String(e.target.checked)})} className="w-4 h-4 accent-[var(--neon-green)]" />
                           <label className="text-[9px] font-black text-gray-500">HABILITAR PIX</label>
                        </div>
                      </div>

                      <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/20 space-y-4">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Opção Stripe (Cartão)</p>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-gray-600 uppercase">Stripe Public Key</label>
                          <input type="text" value={siteSettings.stripe_public_key} onChange={e => setSiteSettings({...siteSettings, stripe_public_key: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" placeholder="pk_live_..." />
                        </div>
                        <div className="flex items-center gap-2">
                           <input type="checkbox" checked={siteSettings.enable_stripe === 'true'} onChange={e => setSiteSettings({...siteSettings, enable_stripe: String(e.target.checked)})} className="w-4 h-4 accent-blue-500" />
                           <label className="text-[9px] font-black text-gray-500">HABILITAR STRIPE</label>
                        </div>
                      </div>
                   </div>
                </div>

                {/* DICIONÁRIO DE TEXTOS */}
                <div className="bg-[#070709] border border-white/5 p-10 rounded-[4rem] space-y-6">
                   <div className="flex items-center gap-3 text-blue-500 mb-2">
                      <Languages className="w-5 h-5" />
                      <h3 className="text-[12px] font-black uppercase italic">DICIONÁRIO DO SITE</h3>
                   </div>
                   <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Título Game Pass</label>
                        <input type="text" value={siteSettings.gamepass_title} onChange={e => setSiteSettings({...siteSettings, gamepass_title: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Título Pré-Venda</label>
                        <input type="text" value={siteSettings.prevenda_title} onChange={e => setSiteSettings({...siteSettings, prevenda_title: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-xs" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-gray-500 uppercase">Título Carrinho</label>
                        <input type="text" value={siteSettings.cart_title} onChange={e => setSiteSettings({...siteSettings, cart_title: e.target.value})} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-xs" />
                      </div>
                   </div>
                   <button onClick={handleSaveSettings} disabled={authLoading} className="w-full bg-[var(--neon-green)] text-black py-6 rounded-3xl font-black flex items-center justify-center gap-3 uppercase text-[10px] shadow-xl hover:scale-[1.02] transition-all">
                      {authLoading ? <Loader2 className="animate-spin" /> : <Save />} SALVAR TODAS AS ALTERAÇÕES
                   </button>
                </div>
              </div>

              {/* VENDAS E ESTOQUE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="bg-[#070709] border border-white/5 p-10 rounded-[4rem] space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black uppercase italic text-white">HISTÓRICO DE PEDIDOS</h3>
                       <TrendingUp className="text-[var(--neon-green)] w-5 h-5" />
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                       {stats.recentSales.map(sale => (
                         <div 
                           key={sale.id} 
                           className="flex flex-col gap-4 p-6 bg-black/40 border border-white/5 rounded-3xl hover:border-[var(--neon-green)]/30 transition-all group relative overflow-hidden"
                         >
                            <div className="flex justify-between items-start" onClick={() => setSelectedOrder(sale)}>
                               <div className="space-y-1 flex-grow cursor-pointer">
                                  <div className="flex items-center gap-2">
                                     <p className="text-white font-black text-[11px] uppercase italic">#{sale.id.slice(0,6).toUpperCase()}</p>
                                     <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${sale.status === 'aprovado' ? 'bg-green-600/20 text-green-500' : 'bg-orange-600/20 text-orange-500'}`}>
                                        {sale.status}
                                     </div>
                                  </div>
                                  <p className="text-[9px] text-gray-500 font-bold uppercase truncate max-w-[200px]">{sale.customer_email || 'Email não registrado'}</p>
                               </div>
                               <div className="text-right flex flex-col items-end gap-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setOrderToDelete(sale.id); }}
                                    className="p-2 bg-red-600/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                  <p className="text-[var(--neon-green)] font-black text-lg italic tracking-tighter">R$ {sale.total_amount.toFixed(2)}</p>
                                  <p className="text-[8px] text-gray-600 font-black uppercase">{new Date(sale.created_at).toLocaleDateString('pt-BR')}</p>
                               </div>
                            </div>
                            <div className="flex items-center justify-between pt-2 border-t border-white/5 cursor-pointer" onClick={() => setSelectedOrder(sale)}>
                               <div className="flex -space-x-3">
                                  {sale.items?.slice(0, 3).map((item: any, idx: number) => (
                                    <img key={idx} src={item.image_url} className="w-8 h-10 rounded-lg object-cover border-2 border-[#070709] shadow-lg" />
                                  ))}
                                  {sale.items?.length > 3 && (
                                    <div className="w-8 h-10 rounded-lg bg-white/5 flex items-center justify-center text-[10px] text-gray-500 font-black border-2 border-[#070709]">+{sale.items.length - 3}</div>
                                  )}
                               </div>
                               <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-[var(--neon-green)] transition-colors" />
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>

                 {/* NOVA SEÇÃO DE ORGANIZAÇÃO DE PRODUTOS */}
                 <div className="bg-[#070709] border border-white/5 p-10 rounded-[4rem] space-y-6">
                    <div className="flex items-center justify-between">
                       <h3 className="text-xl font-black uppercase italic text-white">VITRINE E ORDEM</h3>
                       <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Organize seus produtos</p>
                    </div>
                    <div className="max-h-96 overflow-y-auto custom-scrollbar space-y-3 pr-2">
                       {games.map((game, index) => (
                         <div key={game.id} className="flex items-center gap-4 bg-black/40 border border-white/5 p-4 rounded-3xl group">
                            <div className="flex flex-col gap-1">
                               <button onClick={() => handleMoveGame(game.id, 'up')} disabled={index === 0} className="p-1.5 bg-white/5 rounded-lg text-gray-500 hover:text-[var(--neon-green)] disabled:opacity-20 hover:disabled:text-gray-500 transition-colors"><ArrowUp className="w-3 h-3" /></button>
                               <button onClick={() => handleMoveGame(game.id, 'down')} disabled={index === games.length - 1} className="p-1.5 bg-white/5 rounded-lg text-gray-500 hover:text-[var(--neon-green)] disabled:opacity-20 hover:disabled:text-gray-500 transition-colors"><ArrowDown className="w-3 h-3" /></button>
                            </div>
                            <img src={game.image_url} className="w-12 h-16 rounded-xl object-cover transition-transform group-hover:scale-105" />
                            <div className="flex-grow">
                               <p className="text-[11px] text-white font-black uppercase italic line-clamp-1">{game.title}</p>
                               <div className="flex items-center gap-2 mt-1">
                                  <Tag className="w-3 h-3 text-[var(--neon-green)]" />
                                  <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{game.category}</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <button onClick={() => {setEditingGame(game); setShowAdminModal(true)}} className="p-4 bg-white/5 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 className="w-4 h-4"/></button>
                               <button onClick={() => setGameToDelete(game.id)} className="p-4 bg-white/5 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4"/></button>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* MODAL DE DETALHES DO PEDIDO */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
           <div className="bg-[#070709] border border-white/10 w-full max-w-lg rounded-[3.5rem] overflow-hidden animate-bounce-in shadow-[0_0_100px_rgba(0,0,0,1)]">
              <div className="p-8 border-b border-white/5 flex items-center justify-between">
                 <div className="flex flex-col">
                    <h3 className="text-xl font-black uppercase italic text-white tracking-tighter">PEDIDO #{selectedOrder.id.slice(0,8).toUpperCase()}</h3>
                    <p className="text-[9px] text-[var(--neon-green)] font-black uppercase tracking-[0.4em]">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => setOrderToDelete(selectedOrder.id)} 
                      className="p-3 bg-red-600/10 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => setSelectedOrder(null)} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white"><X /></button>
                 </div>
              </div>
              
              <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
                       <Mail className="w-4 h-4" /> CLIENTE
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl flex items-center justify-between border border-white/5">
                       <p className="text-sm font-black text-white italic">{selectedOrder.customer_email || 'Não informado'}</p>
                       <button onClick={() => {navigator.clipboard.writeText(selectedOrder.customer_email); showToast('Email copiado!')}} className="p-2 text-gray-500 hover:text-white transition-colors"><Copy className="w-4 h-4" /></button>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          <CreditCard className="w-3.5 h-3.5" /> MÉTODO
                       </div>
                       <div className="bg-white/5 p-4 rounded-2xl text-[11px] font-black text-white uppercase italic border border-white/5">
                          {selectedOrder.payment_method || 'Não especificado'}
                       </div>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center gap-2 text-[9px] font-black text-gray-500 uppercase tracking-widest">
                          <Activity className="w-3.5 h-3.5" /> STATUS
                       </div>
                       <div className={`p-4 rounded-2xl text-[11px] font-black uppercase italic border border-white/5 ${selectedOrder.status === 'aprovado' ? 'bg-green-600/10 text-green-500' : 'bg-orange-600/10 text-orange-500'}`}>
                          {selectedOrder.status}
                       </div>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center gap-3 text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-white/5 pb-2">
                       <ShoppingBag className="w-4 h-4" /> JOGOS COMPRADOS
                    </div>
                    <div className="space-y-3">
                       {selectedOrder.items?.map((item: any, idx: number) => (
                         <div key={idx} className="flex gap-4 p-4 bg-white/5 rounded-3xl border border-white/5">
                            <img src={item.image_url} className="w-12 h-16 rounded-xl object-cover" />
                            <div className="flex-grow">
                               <p className="text-[11px] text-white font-black uppercase italic line-clamp-1">{item.title}</p>
                               <div className="flex items-center gap-4 mt-2">
                                  <div className="bg-black/50 px-2 py-0.5 rounded text-[8px] font-black text-gray-400 uppercase tracking-widest">{item.accountType}</div>
                                  <p className="text-[var(--neon-green)] font-black text-xs">R$ {item.price.toFixed(2)}</p>
                               </div>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>

              <div className="p-8 border-t border-white/5 bg-black/40 flex gap-4">
                 {selectedOrder.status === 'pendente' && (
                    <button 
                      onClick={() => handleUpdateSaleStatus(selectedOrder.id, 'aprovado')}
                      className="flex-1 bg-green-600 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(22,163,74,0.3)] hover:scale-[1.02] transition-transform"
                    >
                       <Check className="w-4 h-4 stroke-[4]" /> APROVAR AGORA
                    </button>
                 )}
                 <button 
                   onClick={() => {
                     const msg = encodeURIComponent(`Olá RD Digital! Verifiquei meu pedido #${selectedOrder.id.slice(0,6).toUpperCase()}...`);
                     window.open(`https://wa.me/${siteSettings.whatsapp_number}?text=${msg}`, '_blank');
                   }}
                   className="flex-1 bg-white/5 text-white py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-widest border border-white/10"
                 >
                    CONTATAR WHATSAPP
                 </button>
              </div>
           </div>
        </div>
      )}

      {showAdminModal && <AdminModal onClose={() => setShowAdminModal(false)} onSave={handleSaveGame} initialData={editingGame} />}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart} 
        onClear={() => setCart([])} 
        siteSettings={siteSettings}
        customerEmail={user.email}
      />

      {gameToDelete && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-6">
           <div className="bg-[#070709] p-12 rounded-[4rem] max-w-sm w-full text-center space-y-8 border border-white/5">
              <h3 className="text-2xl font-black text-white uppercase italic">EXCLUIR ITEM?</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Essa ação não pode ser desfeita.</p>
              <div className="flex gap-4">
                 <button onClick={() => setGameToDelete(null)} className="flex-1 bg-white/5 py-5 rounded-3xl font-black text-gray-500 uppercase text-[10px] tracking-widest">NÃO</button>
                 <button onClick={() => handleDeleteGame(gameToDelete)} className="flex-1 bg-red-600 py-5 rounded-3xl font-black text-white uppercase text-[10px] tracking-widest">SIM, EXCLUIR</button>
              </div>
           </div>
        </div>
      )}

      {orderToDelete && (
        <div className="fixed inset-0 z-[700] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-[#070709] p-12 rounded-[4rem] max-w-sm w-full text-center space-y-8 border border-red-600/20 shadow-[0_0_100px_rgba(220,38,38,0.1)]">
              <div className="w-20 h-20 bg-red-600/10 rounded-full flex items-center justify-center mx-auto">
                 <AlertTriangle className="w-10 h-10 text-red-600" />
              </div>
              <div className="space-y-2">
                 <h3 className="text-2xl font-black text-white uppercase italic">APAGAR PEDIDO?</h3>
                 <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed px-4">O pedido será removido permanentemente do seu histórico administrativo.</p>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setOrderToDelete(null)} className="flex-1 bg-white/5 py-5 rounded-3xl font-black text-gray-500 uppercase text-[10px] tracking-widest">VOLTAR</button>
                 <button onClick={confirmDeleteOrder} className="flex-1 bg-red-600 py-5 rounded-3xl font-black text-white uppercase text-[10px] tracking-widest shadow-lg shadow-red-600/20">CONFIRMAR</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;

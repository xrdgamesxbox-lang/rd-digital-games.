
import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, Star, Settings,
  LogOut, Edit2, Trash2, Plus, X, Loader2, Lock, Mail, UserPlus, LogIn,
  Instagram, Facebook, AlertTriangle, CheckCircle, Zap, Palette, Image as ImageIcon, Gamepad2, Layers, Check, Wifi, WifiOff, Terminal, Copy, HelpCircle, Rocket, ShieldCheck, RefreshCcw, ExternalLink, Activity, Globe, Search, Info, Download, Box, Monitor, AlertOctagon, Wallet, MessageCircle, Save, TrendingUp, Users, ShoppingBag, Eye, Clock, Type, Send, Languages, Phone, CreditCard, Calendar, Tag, ChevronRight, Link as LinkIcon, ArrowUp, ArrowDown, UserCheck, Key, ListChecks, DollarSign, History, GripVertical, FileText
} from 'lucide-react';
import { Game, User, CartItem, License } from './types.ts';
import GameCard from './components/GameCard.tsx';
import AdminModal from './components/AdminModal.tsx';
import BulkPriceModal from './components/BulkPriceModal.tsx';
import CartDrawer from './components/CartDrawer.tsx';
import ProductPage from './components/ProductPage.tsx'; 
import RefundPolicy from './components/RefundPolicy.tsx'; // Importado Novo Componente
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
  
  // Estado para Produto Aberto (Detalhes)
  const [selectedProduct, setSelectedProduct] = useState<Game | null>(null);
  
  // Estado para Página de Política de Reembolso
  const [showRefundPolicy, setShowRefundPolicy] = useState(false);

  // Estados para Drag and Drop
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Estados para Bulk Edit (Edição em Massa)
  const [selectedGameIds, setSelectedGameIds] = useState<string[]>([]);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);

  // Estado para pesquisa no ADM
  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  // Estados para Licenças
  const [licenses, setLicenses] = useState<License[]>([]);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<string | null>(null);
  
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

  const [siteSettings, setSiteSettings] = useState<any>({
    // Configurações Gerais
    primary_color: '#ccff00',
    bg_color: '#000000',
    text_color: '#ffffff',
    logo_url: '',
    
    // Login
    login_title: 'RD DIGITAL',
    login_subtitle: 'Sua conta de jogos oficial',
    login_btn_text: 'ACESSAR AGORA',
    login_footer: 'RD Digital Games © 2024 • Todos os Direitos Reservados',
    
    // Hero & Home
    hero_title: 'A loja líder em venda de jogos!',
    hero_description: 'A RD Digital se destaca como a referência no mercado de Xbox, oferecendo uma ampla variedade de produtos com entrega imediata e suporte 24h.',
    hero_image: 'https://images.unsplash.com/photo-1621259182978-f09e5e2ca09a?q=80&w=2069&auto=format&fit=crop',
    
    // Seção Como Funciona
    how_it_works_title: 'Como Funciona?',
    how_it_works_subtitle: 'Entenda tudo sobre a mídia digital e não tenha dúvidas!',
    how_it_works_btn: 'Saiba mais',
    how_it_works_image: 'https://images.unsplash.com/photo-1605901309584-818e25960b8f?q=80&w=2000&auto=format&fit=crop',
    text_parental: 'A Conta Parental é uma licença compartilhada oficial. Você joga no seu próprio perfil pessoal, conquista troféus e salva seu progresso. O método de acesso é simples e enviamos um tutorial passo a passo.',
    text_exclusive: 'A Conta Exclusiva é totalmente sua. Você recebe e-mail e senha, pode alterar os dados de segurança e compartilhar com um amigo se desejar (Configuração de Home Principal). É como comprar o jogo digitalmente na loja.',

    // Seções / Vitrines
    gamepass_title: 'GAME PASS PREMIUM',
    gamepass_subtitle: 'ASSINE E JOGUE CENTENAS DE TÍTULOS',
    prevenda_title: 'PRÉ-VENDAS ÉPICAS',
    prevenda_subtitle: 'GARANTA SEU LUGAR NO LANÇAMENTO',
    catalog_title: 'CATÁLOGO COMPLETO',
    
    // Navegação e Botões
    search_placeholder: 'Procurar jogo no catálogo...',
    tab_games: 'JOGOS',
    tab_gamepass: 'GAME PASS',
    tab_preorder: 'PRÉ-VENDA',
    
    // Carrinho e Checkout
    cart_title: 'Seu Carrinho',
    cart_empty_text: 'Carrinho Vazio',
    checkout_button_text: 'PAGAR AGORA',
    
    // Pagamentos
    pix_key: 'rodrigooportunidades20@gmail.com',
    pix_name: 'RODRIGO RD GAMES',
    whatsapp_number: '55619982351315', 
    stripe_public_key: 'pk_test_51ShFjSFLtqLxkHWdRthCEvD7ZoLKkF2pTSuuaCsPEQM7tfHM3QSWw471b7mwCOXgQrj6wxLODmoOmCSntYOZxSNp00yO7Y8EvQ',
    enable_stripe: 'true',
    enable_pix: 'true',
    enable_card_whatsapp: 'true',
  });

  const [games, setGames] = useState<Game[]>([]);

  // Carrega dados iniciais e usuário
  useEffect(() => {
    checkUser();
    fetchInitialData();
    trackVisit();
    
    const savedCart = localStorage.getItem('rd_cart');
    if (savedCart) setCart(JSON.parse(savedCart));

    const params = new URLSearchParams(window.location.search);
    
    // Check for Policy Page
    if (params.get('page') === 'politica-de-reembolso') {
        setShowRefundPolicy(true);
    }

    if (params.get('success')) {
      showToast('Pagamento aprovado! Verifique seu e-mail ou contate nosso suporte.', 'success');
      setCart([]);
      localStorage.removeItem('rd_cart');
      updateUrl();
    }
    if (params.get('cancel')) {
      showToast('O pagamento foi cancelado.', 'error');
      updateUrl();
    }

    // Escuta o botão voltar do navegador
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const updateUrl = (newParams = {}) => {
      try {
        window.history.replaceState({}, document.title, window.location.pathname);
      } catch (e) {
        console.warn('URL update failed:', e);
      }
  }

  // Verifica URL params para abrir produto direto ao carregar (deeplinking)
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

  // Handle Browser Back Button
  const handlePopState = () => {
    const params = new URLSearchParams(window.location.search);
    const gameId = params.get('game');
    const page = params.get('page');

    if (!gameId) setSelectedProduct(null);
    if (page !== 'politica-de-reembolso') setShowRefundPolicy(false);
    if (page === 'politica-de-reembolso') setShowRefundPolicy(true);
  };

  // Handle Open Product Page (Updates URL)
  const handleOpenProduct = (game: Game) => {
    setSelectedProduct(game);
    try {
      const newUrl = `${window.location.pathname}?game=${game.id}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (e) { console.warn(e); }
  };

  // Handle Close Product Page
  const handleCloseProduct = () => {
    setSelectedProduct(null);
    try {
      window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
    } catch (e) { console.warn(e); }
  };

  // Handle Open Policy
  const handleOpenRefundPolicy = () => {
      setShowRefundPolicy(true);
      try {
          const newUrl = `${window.location.pathname}?page=politica-de-reembolso`;
          window.history.pushState({ path: newUrl }, '', newUrl);
      } catch (e) { console.warn(e); }
  };

  // Handle Close Policy
  const handleCloseRefundPolicy = () => {
      setShowRefundPolicy(false);
      try {
          window.history.pushState({ path: window.location.pathname }, '', window.location.pathname);
      } catch (e) { console.warn(e); }
  };

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
      const { data: licensesData } = await supabase.from('customer_licenses').select('*').order('created_at', { ascending: false });

      const totalRevenue = salesData?.reduce((acc, sale) => acc + (sale.status === 'aprovado' ? sale.total_amount : 0), 0) || 0;

      setStats({
        totalSales: salesData?.length || 0,
        totalRevenue,
        totalVisits: visitsCount || 0,
        abandonedCarts: abandonedCount || 0,
        recentSales: salesData || []
      });
      
      if (licensesData) setLicenses(licensesData as unknown as License[]);

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
    if (!user) {
      setShowAuthModal(true);
      showToast("ATENÇÃO: Para comprar você precisa criar uma conta!", "error");
      return;
    }

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
    
    if (selectedProduct) {
       handleCloseProduct();
    }

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
        setShowAuthModal(false);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchInitialData = async () => {
    try {
      let { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('display_order', { ascending: true });
      
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
        const sanitizedGames = gamesData.map((g, idx) => ({
             ...g,
             is_available: g.is_available !== false,
             is_parental_available: g.is_parental_available !== false,
             is_exclusive_available: g.is_exclusive_available !== false,
             display_order: g.display_order !== null && g.display_order !== undefined ? g.display_order : idx
        }));
        setGames(sanitizedGames);
      }

      const { data: settingsData, error: settingsError } = await supabase.from('site_settings').select('key, value');
      if (!settingsError && settingsData) {
        const settingsMap: any = { ...siteSettings };
        settingsData.forEach(item => { 
            if (item.key !== 'whatsapp_number') {
                settingsMap[item.key] = item.value; 
            }
        });
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
          setShowAuthModal(false);
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

  // Funções de Licença e ADM omitidas para brevidade (mantidas iguais ao original)
  // ... (handleSaveLicense, handleDeleteLicense, createNewLicense, calculateDaysRemaining, toggleGameSelection, handleBulkSave, handleDragStart, handleDragEnd, handleDragOver, handleDrop, handleMoveGame, handleSaveGame, handleDeleteGame, handleSaveSettings, updateSetting)
  const handleSaveLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense) return;

    try {
      const { error } = await supabase.from('customer_licenses').upsert(editingLicense);
      if (error) throw error;
      showToast("Licença salva/atualizada!");
      setShowLicenseModal(false);
      fetchStats();
    } catch (e: any) {
      showToast("Erro ao salvar licença: " + e.message, 'error');
    }
  };

  const handleDeleteLicense = async (id: string) => {
    try {
      const { error } = await supabase.from('customer_licenses').delete().eq('id', id);
      if (error) throw error;
      setLicenses(licenses.filter(l => l.id !== id));
      setLicenseToDelete(null);
      showToast('Licença removida!');
    } catch (e: any) {
      console.error("Erro ao deletar licença:", e);
      showToast('Erro ao excluir licença.', 'error');
    }
  };

  const createNewLicense = () => {
    setEditingLicense({
      id: undefined as any,
      created_at: new Date().toISOString(),
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      game_title: '',
      product_category: 'jogo',
      account_type: 'parental',
      assigned_email: '',
      assigned_password: '',
      is_gamepass: false,
      subscription_months: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: '',
      status: 'ativo'
    });
    setShowLicenseModal(true);
  };

  const calculateDaysRemaining = (endDate?: string) => {
    if (!endDate) return null;
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const toggleGameSelection = (id: string) => {
    if (selectedGameIds.includes(id)) {
      setSelectedGameIds(prev => prev.filter(gId => gId !== id));
    } else {
      if (selectedGameIds.length >= 10) {
        showToast("Limite de 10 jogos por vez atingido!", "error");
        return;
      }
      setSelectedGameIds(prev => [...prev, id]);
    }
  };

  const handleBulkSave = async (updates: { id: string, updates: Partial<Game> }[], deletions: string[]) => {
    try {
      setLoading(true);
      if (deletions.length > 0) {
        const { error: deleteError } = await supabase.from('games').delete().in('id', deletions);
        if (deleteError) throw deleteError;
      }
      if (updates.length > 0) {
         const promises = updates.map(u => 
           supabase.from('games').update({ ...u.updates, updated_at: new Date().toISOString() }).eq('id', u.id)
         );
         await Promise.all(promises);
      }
      setGames(prevGames => {
        let newGames = prevGames.filter(g => !deletions.includes(g.id));
        newGames = newGames.map(game => {
          const update = updates.find(u => u.id === game.id);
          return update ? { ...game, ...update.updates, updated_at: new Date().toISOString() } : game;
        });
        return newGames;
      });
      setShowBulkPriceModal(false);
      setSelectedGameIds([]);
      showToast("Operação em massa concluída com sucesso!");
    } catch (e: any) {
      console.error(e);
      showToast("Erro ao processar edição em massa: " + e.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.currentTarget.style.opacity = '0.5';
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.opacity = '1';
    setDraggedIndex(null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    const newGames = [...games];
    const [movedGame] = newGames.splice(draggedIndex, 1);
    newGames.splice(index, 0, movedGame);
    const updatedGames = newGames.map((g, i) => ({ ...g, display_order: i }));
    setGames(updatedGames);
    try {
      const { error } = await supabase.from('games').upsert(updatedGames);
      if (error) throw error;
      showToast("Ordem atualizada com sucesso!");
    } catch (err) {
      console.error(err);
      showToast("Erro ao salvar ordem no servidor.", 'error');
    }
  };

  const handleMoveGame = async (gameId: string, direction: 'up' | 'down') => {
    const index = games.findIndex(g => g.id === gameId);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === games.length - 1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newGames = [...games];
    [newGames[index], newGames[targetIndex]] = [newGames[targetIndex], newGames[index]];
    const updatedGames = newGames.map((g, i) => ({ ...g, display_order: i }));
    setGames(updatedGames);
    try {
      await Promise.all([
        supabase.from('games').update({ display_order: index }).eq('id', newGames[index].id),
        supabase.from('games').update({ display_order: targetIndex }).eq('id', newGames[targetIndex].id)
      ]);
    } catch (e) {
      console.error("Erro ao salvar nova ordem:", e);
      showToast("Erro ao reorganizar jogo.", "error");
    }
  };

  const handleSaveGame = async (gameData: Omit<Game, 'id'>) => {
    try {
      const normalize = (str: string) => str.trim().toLowerCase();
      const isEditingSameTitle = editingGame && normalize(editingGame.title) === normalize(gameData.title);
      if (!isEditingSameTitle) {
          const isDuplicate = games.some(g => 
            normalize(g.title) === normalize(gameData.title) && 
            g.id !== editingGame?.id 
          );
          if (isDuplicate) {
            showToast("ERRO: Já existe um jogo cadastrado com este nome!", "error");
            return; 
          }
      }
      const timestamp = new Date().toISOString();
      const gameDataWithTimestamp = { ...gameData, updated_at: timestamp };
      if (editingGame) {
        const { data, error } = await supabase.from('games').update(gameDataWithTimestamp).eq('id', editingGame.id).select().single();
        if (error) throw error;
        if (data) setGames(games.map(g => g.id === editingGame.id ? data : g));
      } else {
        const nextOrder = games.length > 0 ? Math.max(...games.map(g => g.display_order || 0)) + 1 : 0;
        const newGameData = { 
            ...gameDataWithTimestamp, 
            is_available: gameData.is_available !== false,
            is_parental_available: gameData.is_parental_available !== false,
            is_exclusive_available: gameData.is_exclusive_available !== false
        };
        const { data, error } = await supabase.from('games').insert([{ ...newGameData, display_order: nextOrder }]).select().single();
        if (error) throw error;
        if (data) setGames([...games, data]);
      }
      setShowAdminModal(false);
      showToast('Sucesso!');
    } catch (error: any) {
      console.error(error);
      showToast(error.message || "Erro ao salvar", 'error');
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      const { error } = await supabase.from('games').delete().eq('id', id);
      if (error) throw error;
      setGames(games.filter(x => x.id !== id));
      setGameToDelete(null);
      showToast('Item removido!');
    } catch (e: any) {
      console.error("Erro ao deletar:", e);
      showToast('Erro ao excluir.', 'error');
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

  const updateSetting = (key: string, value: string) => {
    setSiteSettings((prev: any) => ({ ...prev, [key]: value }));
  };


  const filteredCatalog = useMemo(() => {
    return games
      .filter(g => g.category === activeCategory)
      .filter(g => g.title.toLowerCase().includes(catalogSearchTerm.toLowerCase()));
  }, [games, activeCategory, catalogSearchTerm]);

  const filteredAdminGames = useMemo(() => {
    return games.filter(g => g.title.toLowerCase().includes(adminSearchTerm.toLowerCase()));
  }, [games, adminSearchTerm]);

  const gamepassGames = games.filter(g => g.category === 'gamepass');
  const prevendaGames = games.filter(g => g.category === 'prevenda');

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black"><Loader2 className="w-12 h-12 text-[var(--neon-green)] animate-spin" /></div>;

  return (
    <div className="flex flex-col min-h-screen" style={{ color: siteSettings.text_color }}>
      
      {/* PÁGINA DE PRODUTO INDIVIDUAL */}
      {selectedProduct && (
        <ProductPage 
          game={selectedProduct} 
          onClose={handleCloseProduct} 
          onAddToCart={addToCart} 
        />
      )}

      {/* PÁGINA DE POLÍTICA DE REEMBOLSO */}
      {showRefundPolicy && (
          <RefundPolicy onClose={handleCloseRefundPolicy} />
      )}

      {/* MODAL ADM */}
      {showAdminModal && (
        <AdminModal 
          onClose={() => {setShowAdminModal(false); setEditingGame(null)}} 
          onSave={handleSaveGame} 
          initialData={editingGame} 
        />
      )}
      
      {/* MODAL BULK */}
      {showBulkPriceModal && (
        <BulkPriceModal 
          games={games.filter(g => selectedGameIds.includes(g.id))} 
          onClose={() => {setShowBulkPriceModal(false); setSelectedGameIds([])}} 
          onSave={handleBulkSave} 
        />
      )}

      {/* MODAL CARRINHO */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cart} 
        onRemove={removeFromCart} 
        onClear={() => setCart([])}
        siteSettings={siteSettings}
        customerEmail={user?.email}
      />

      {toast && (
        <div className="fixed top-24 right-8 z-[300] animate-bounce-in">
           <div className={`px-6 py-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest backdrop-blur-xl ${toast.type === 'error' ? 'bg-red-600/10 border-red-600/20 text-red-500' : 'bg-[var(--neon-green)]/10 border-[var(--neon-green)]/20 text-[var(--neon-green)]'}`}>
             {toast.message}
           </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[var(--bg-dark)]/90 backdrop-blur-xl border-b border-white/5 px-8 h-24 flex items-center justify-between">
        <div className="flex items-center gap-5 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
          {siteSettings.logo_url && !logoError ? (
            <img src={siteSettings.logo_url} onError={() => setLogoError(true)} className="h-14 w-auto object-contain drop-shadow-[0_0_10px_var(--neon-glow)]" />
          ) : (
            <Zap className="text-[var(--neon-green)] w-8 h-8 fill-[var(--neon-green)]" />
          )}
          <span className="text-2xl font-black italic uppercase text-white tracking-tighter hidden md:block">{siteSettings.login_title}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setIsCartOpen(true)} className="relative p-4 bg-white/5 rounded-2xl text-white">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-[var(--neon-green)] text-black text-[9px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-[var(--bg-dark)]">{cart.length}</span>}
          </button>
          
          {user ? (
            <>
               {user.isAdmin && <button onClick={() => setIsAdminPanelOpen(true)} className="bg-[var(--neon-green)] text-black px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">ADM</button>}
               <button onClick={handleLogout} className="p-4 bg-white/5 rounded-2xl text-gray-500 hover:text-red-500 transition-all"><LogOut className="w-5 h-5" /></button>
            </>
          ) : (
             <button onClick={() => setShowAuthModal(true)} className="bg-[var(--neon-green)] text-black px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform shadow-[0_0_20px_var(--neon-glow)]">
                <LogIn className="w-4 h-4" /> ENTRAR / CRIAR CONTA
             </button>
          )}
        </div>
      </nav>

      {/* Conteúdo Principal */}
      <div className="flex-grow">
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

        {/* COMPARADOR DE PREÇOS */}
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
                                  onClick={() => handleOpenProduct(priceCheckResult.game!)}
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

        {/* SEÇÃO COMO FUNCIONA */}
        <section className="px-8 max-w-7xl mx-auto w-full mb-32">
          <div className="bg-white/5 border border-white/5 rounded-[4rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
             <div className="absolute inset-0 bg-[var(--neon-green)]/5 opacity-50 pointer-events-none"></div>
             <div className="flex-1 space-y-8 relative z-10 text-center lg:text-left">
                <h2 className="text-5xl lg:text-7xl font-black text-[var(--neon-green)] uppercase italic tracking-tighter leading-[0.9]">{siteSettings.how_it_works_title}</h2>
                <p className="text-xl text-gray-400 max-w-lg mx-auto lg:mx-0">{siteSettings.how_it_works_subtitle}</p>
                <button 
                  onClick={() => setShowInfoModal(true)}
                  className="bg-[var(--neon-green)] text-black px-12 py-5 rounded-2xl font-black uppercase text-sm tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_10px_40px_rgba(204,255,0,0.2)]"
                >
                  {siteSettings.how_it_works_btn}
                </button>
             </div>
             <div className="flex-1 relative z-10">
                <img 
                  src={siteSettings.how_it_works_image} 
                  className="w-full max-w-md mx-auto rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] transform hover:rotate-2 transition-transform duration-700"
                  alt="Console"
                />
             </div>
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-12">
                   {gamepassGames.map(game => (
                     <div key={game.id} className="relative group">
                       <GameCard game={game} onOpenPage={handleOpenProduct} />
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
             <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-12">
                {prevendaGames.map(game => (
                  <div key={game.id} className="relative group">
                    <GameCard game={game} onOpenPage={handleOpenProduct} />
                  </div>
                ))}
             </div>
          </section>
        )}

        {/* Catálogo */}
        <div className="px-8 max-w-7xl mx-auto w-full">
           <div className="flex flex-col md:flex-row items-center justify-between border-b border-white/5 pb-10 mb-16 gap-8">
              <h2 className="text-4xl font-black italic uppercase text-white tracking-tighter">{siteSettings.catalog_title}</h2>
              
              <div className="relative w-full md:w-96 group">
                 <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--neon-green)] transition-colors" />
                 <input 
                   type="text" 
                   value={catalogSearchTerm}
                   onChange={e => setCatalogSearchTerm(e.target.value)}
                   placeholder={siteSettings.search_placeholder}
                   className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white text-xs outline-none focus:border-[var(--neon-green)]/40 transition-all shadow-lg"
                 />
              </div>

              <div className="flex gap-4">
                 <button onClick={() => setActiveCategory('jogo')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCategory === 'jogo' ? 'bg-[var(--neon-green)] text-black shadow-xl' : 'bg-white/5 text-gray-500'}`}>{siteSettings.tab_games}</button>
                 <button onClick={() => setActiveCategory('gamepass')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCategory === 'gamepass' ? 'bg-green-600 text-white shadow-xl' : 'bg-white/5 text-gray-500'}`}>{siteSettings.tab_gamepass}</button>
                 <button onClick={() => setActiveCategory('prevenda')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase italic tracking-widest transition-all ${activeCategory === 'prevenda' ? 'bg-orange-600 text-white shadow-xl' : 'bg-white/5 text-gray-500'}`}>{siteSettings.tab_preorder}</button>
              </div>
           </div>
           
           {filteredCatalog.length > 0 ? (
             <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-12 pb-24">
               {filteredCatalog.map(game => (
                 <div key={game.id} className="relative group">
                   <GameCard game={game} onOpenPage={handleOpenProduct} />
                   {user?.isAdmin && (
                    <div className="absolute top-4 right-4 z-40 flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); setEditingGame(game); setShowAdminModal(true); }} className="p-3 bg-blue-600 rounded-2xl text-white hover:scale-105 transition-transform"><Edit2 className="w-4 h-4"/></button>
                      <button onClick={(e) => { e.stopPropagation(); setGameToDelete(game.id); }} className="p-3 bg-red-600 rounded-2xl text-white hover:scale-105 transition-transform"><Trash2 className="w-4 h-4"/></button>
                    </div>
                   )}
                 </div>
               ))}
             </section>
           ) : (
             <div className="text-center py-40 space-y-4 opacity-20">
                <Box className="w-16 h-16 mx-auto text-gray-500" />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum jogo encontrado</p>
             </div>
           )}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-[#070709] border-t border-white/5 mt-20 pt-20 pb-12">
         <div className="max-w-7xl mx-auto px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
               <div className="space-y-4">
                  <h4 className="text-2xl font-black uppercase italic text-white tracking-tighter">RD DIGITAL GAMES</h4>
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-widest max-w-sm">Sua loja premium de jogos digitais. Garantia vitalícia, suporte especializado e entrega imediata.</p>
               </div>
               
               <div className="flex flex-col gap-4">
                  <button onClick={handleOpenRefundPolicy} className="text-[10px] text-gray-400 hover:text-[var(--neon-green)] font-black uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start transition-colors">
                     <FileText className="w-4 h-4" /> Política de Devolução & Reembolso
                  </button>
                  <a href={`https://wa.me/${siteSettings.whatsapp_number}`} target="_blank" className="text-[10px] text-gray-400 hover:text-[var(--neon-green)] font-black uppercase tracking-widest flex items-center gap-2 justify-center md:justify-start transition-colors">
                     <MessageCircle className="w-4 h-4" /> Fale Conosco
                  </a>
               </div>
            </div>
            
            <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">© 2024 RD Digital Games. Todos os direitos reservados.</p>
               <div className="flex items-center gap-4 opacity-30 grayscale">
                  <div className="h-4 w-8 bg-white rounded"></div>
                  <div className="h-4 w-8 bg-white rounded"></div>
                  <div className="h-4 w-8 bg-white rounded"></div>
               </div>
            </div>
         </div>
      </footer>

      {/* MODAL DE LOGIN (NOVA IMPLEMENTAÇÃO) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
           <div className="relative w-full max-w-[400px] animate-bounce-in">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--neon-green)]/5 blur-[120px] rounded-full pointer-events-none"></div>
              
              <div className="text-center mb-10">
                 {siteSettings.logo_url && !logoError ? (
                   <img src={siteSettings.logo_url} onError={() => setLogoError(true)} className="h-28 w-auto object-contain mx-auto mb-4 drop-shadow-[0_0_20px_var(--neon-glow)]" />
                 ) : (
                   <div className="w-16 h-16 bg-[var(--neon-green)] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_var(--neon-glow)] rotate-3">
                      <Zap className="w-8 h-8 text-black fill-black" />
                   </div>
                 )}
                 <h1 className="text-3xl font-black italic uppercase tracking-tighter neon-text-glow text-white">{siteSettings.login_title || 'RD DIGITAL'}</h1>
                 <p className="text-[9px] text-gray-500 font-black uppercase tracking-[0.4em] mt-1">{siteSettings.login_subtitle || 'Sua conta de jogos oficial'}</p>
                 
                 {/* AVISO IMPORTANTE */}
                 <div className="mt-6 bg-orange-600/10 border border-orange-500/20 rounded-2xl p-4 flex items-center gap-3 text-left">
                    <AlertTriangle className="w-6 h-6 text-orange-500 flex-shrink-0" />
                    <p className="text-[9px] text-orange-200 font-bold uppercase leading-relaxed">Atenção: Para comprar, é obrigatório criar uma conta ou fazer login.</p>
                 </div>
              </div>

              <div className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative">
                <button onClick={() => setShowAuthModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
                
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
                      {authLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{isSignUpMode ? 'CRIAR CONTA' : (siteSettings.login_btn_text || 'ACESSAR AGORA')} <LogIn className="w-4 h-4" /></>}
                    </button>
                    <div className="pt-4 text-center border-t border-white/5 mt-6">
                      <button type="button" onClick={() => setIsSignUpMode(!isSignUpMode)} className="text-[9px] font-black uppercase text-gray-500 hover:text-white transition-colors tracking-widest">
                        {isSignUpMode ? 'JÁ TENHO UMA CONTA' : 'NÃO TEM CONTA? CADASTRE-SE'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
              <p className="text-center text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] mt-8">{siteSettings.login_footer || 'Direitos Reservados'}</p>
           </div>
        </div>
      )}

      {/* MODAL COMO FUNCIONA */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-md flex items-center justify-center p-6">
           <div className="bg-[#070709] border border-white/10 w-full max-w-4xl rounded-[3.5rem] overflow-hidden animate-bounce-in flex flex-col max-h-[90vh]">
              <div className="p-10 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter">TIPOS DE CONTA</h3>
                 <button onClick={() => setShowInfoModal(false)} className="bg-white/5 p-4 rounded-2xl text-white hover:bg-white/10 transition-colors"><X /></button>
              </div>
              <div className="p-10 overflow-y-auto custom-scrollbar grid grid-cols-1 md:grid-cols-2 gap-8">
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-6 hover:border-[var(--neon-green)]/30 transition-colors">
                    <div className="w-16 h-16 bg-orange-600 rounded-3xl flex items-center justify-center shadow-xl">
                       <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-white uppercase italic mb-2">CONTA PARENTAL</h4>
                       <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{siteSettings.text_parental}</p>
                    </div>
                 </div>
                 <div className="bg-white/5 p-8 rounded-[3rem] border border-white/5 space-y-6 hover:border-blue-500/30 transition-colors">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                       <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <div>
                       <h4 className="text-2xl font-black text-white uppercase italic mb-2">CONTA EXCLUSIVA</h4>
                       <p className="text-gray-400 text-sm leading-relaxed whitespace-pre-wrap">{siteSettings.text_exclusive}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      )}

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

              {/* MENU DE NAVEGAÇÃO DO ADM */}
              <div className="flex gap-4">
                 <button onClick={() => setActiveAdminTab('dashboard')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeAdminTab === 'dashboard' ? 'bg-[var(--neon-green)] text-black' : 'bg-white/5 text-gray-500'}`}>DASHBOARD</button>
                 <button onClick={() => setActiveAdminTab('products')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeAdminTab === 'products' ? 'bg-[var(--neon-green)] text-black' : 'bg-white/5 text-gray-500'}`}>PRODUTOS</button>
                 <button onClick={() => setActiveAdminTab('licenses')} className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activeAdminTab === 'licenses' ? 'bg-[var(--neon-green)] text-black' : 'bg-white/5 text-gray-500'}`}>ENTREGAS & GAME PASS</button>
              </div>

              {activeAdminTab === 'dashboard' && (
                <div className="space-y-12 animate-bounce-in">
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

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="bg-[#070709] border border-white/5 p-10 rounded-[4rem] space-y-6">
                       <div className="flex items-center gap-3 text-[var(--neon-green)] mb-2">
                          <Palette className="w-5 h-5" />
                          <h3 className="text-[12px] font-black uppercase italic">IDENTIDADE VISUAL</h3>
                       </div>
                       <div className="space-y-4">
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase">Logo URL (PNG Transparente)</label>
                            <input type="text" value={siteSettings.logo_url || ''} onChange={e => updateSetting('logo_url', e.target.value)} className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-xs" placeholder="Link da imagem .png" />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-black text-gray-500 uppercase">Cor do Neon</label>
                            <input type="color" value={siteSettings.primary_color || '#ccff00'} onChange={e => updateSetting('primary_color', e.target.value)} className="w-full h-12 bg-black border border-white/10 rounded-2xl p-1" />
                          </div>
                       </div>
                    </div>
                    
                    {/* GATEWAYS DE PAGAMENTO */}
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
                              <input type="text" value={siteSettings.pix_key || ''} onChange={e => updateSetting('pix_key', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="flex items-center gap-2">
                               <input type="checkbox" checked={siteSettings.enable_pix === 'true'} onChange={e => updateSetting('enable_pix', String(e.target.checked))} className="w-4 h-4 accent-[var(--neon-green)]" />
                               <label className="text-[9px] font-black text-gray-500">HABILITAR PIX</label>
                            </div>
                          </div>
                          <div className="bg-blue-600/5 p-4 rounded-2xl border border-blue-500/20 space-y-4">
                            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Opção Stripe (Cartão)</p>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Stripe Public Key</label>
                              <input type="text" value={siteSettings.stripe_public_key || ''} onChange={e => updateSetting('stripe_public_key', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" placeholder="pk_live_..." />
                            </div>
                            <div className="flex items-center gap-2">
                               <input type="checkbox" checked={siteSettings.enable_stripe === 'true'} onChange={e => updateSetting('enable_stripe', String(e.target.checked))} className="w-4 h-4 accent-blue-500" />
                               <label className="text-[9px] font-black text-gray-500">HABILITAR STRIPE</label>
                            </div>
                          </div>
                          <div className="bg-purple-600/5 p-4 rounded-2xl border border-purple-500/20 space-y-4">
                            <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest">Opção Cartão via WhatsApp</p>
                            <div className="flex items-center gap-2">
                               <input type="checkbox" checked={siteSettings.enable_card_whatsapp === 'true'} onChange={e => updateSetting('enable_card_whatsapp', String(e.target.checked))} className="w-4 h-4 accent-purple-500" />
                               <label className="text-[9px] font-black text-gray-500">HABILITAR OPÇÃO NO CHECKOUT</label>
                            </div>
                          </div>
                       </div>
                    </div>

                    <div className="bg-[#070709] border border-white/5 p-10 rounded-[4rem] space-y-6">
                       <div className="flex items-center gap-3 text-blue-500 mb-2">
                          <Languages className="w-5 h-5" />
                          <h3 className="text-[12px] font-black uppercase italic">DICIONÁRIO DO SITE</h3>
                       </div>
                       
                       <div className="space-y-8 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                          
                          {/* LOGIN & GERAL */}
                          <div className="space-y-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">TELA DE LOGIN & GERAL</p>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Título Principal</label>
                              <input type="text" value={siteSettings.login_title || ''} onChange={e => updateSetting('login_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Subtítulo</label>
                              <input type="text" value={siteSettings.login_subtitle || ''} onChange={e => updateSetting('login_subtitle', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Botão Entrar</label>
                              <input type="text" value={siteSettings.login_btn_text || ''} onChange={e => updateSetting('login_btn_text', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Rodapé</label>
                              <input type="text" value={siteSettings.login_footer || ''} onChange={e => updateSetting('login_footer', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                          </div>

                          {/* HERO / CAPA */}
                          <div className="space-y-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">BANNER DE CAPA (HERO)</p>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Título Grande</label>
                              <input type="text" value={siteSettings.hero_title || ''} onChange={e => updateSetting('hero_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Descrição</label>
                              <textarea rows={3} value={siteSettings.hero_description || ''} onChange={e => updateSetting('hero_description', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                          </div>

                          {/* COMO FUNCIONA */}
                          <div className="space-y-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">SEÇÃO COMO FUNCIONA</p>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Título Seção</label>
                              <input type="text" value={siteSettings.how_it_works_title || ''} onChange={e => updateSetting('how_it_works_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Subtítulo Seção</label>
                              <input type="text" value={siteSettings.how_it_works_subtitle || ''} onChange={e => updateSetting('how_it_works_subtitle', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Botão</label>
                              <input type="text" value={siteSettings.how_it_works_btn || ''} onChange={e => updateSetting('how_it_works_btn', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Explicação Conta Parental (Modal)</label>
                              <textarea rows={4} value={siteSettings.text_parental || ''} onChange={e => updateSetting('text_parental', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Explicação Conta Exclusiva (Modal)</label>
                              <textarea rows={4} value={siteSettings.text_exclusive || ''} onChange={e => updateSetting('text_exclusive', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                          </div>

                          {/* VITRINES E CATÁLOGO */}
                          <div className="space-y-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">VITRINES E TÍTULOS</p>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Título Game Pass</label>
                              <input type="text" value={siteSettings.gamepass_title || ''} onChange={e => updateSetting('gamepass_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Subtítulo Game Pass</label>
                              <input type="text" value={siteSettings.gamepass_subtitle || ''} onChange={e => updateSetting('gamepass_subtitle', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Título Pré-Venda</label>
                              <input type="text" value={siteSettings.prevenda_title || ''} onChange={e => updateSetting('prevenda_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Subtítulo Pré-Venda</label>
                              <input type="text" value={siteSettings.prevenda_subtitle || ''} onChange={e => updateSetting('prevenda_subtitle', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Título Catálogo Geral</label>
                              <input type="text" value={siteSettings.catalog_title || ''} onChange={e => updateSetting('catalog_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                          </div>

                          {/* NAVEGAÇÃO E BOTÕES */}
                          <div className="space-y-4">
                            <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest border-b border-white/10 pb-1">NAVEGAÇÃO, ABAS E CARRINHO</p>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Aba Jogos</label>
                              <input type="text" value={siteSettings.tab_games || ''} onChange={e => updateSetting('tab_games', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Aba Game Pass</label>
                              <input type="text" value={siteSettings.tab_gamepass || ''} onChange={e => updateSetting('tab_gamepass', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Aba Pré-Venda</label>
                              <input type="text" value={siteSettings.tab_preorder || ''} onChange={e => updateSetting('tab_preorder', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Placeholder Busca</label>
                              <input type="text" value={siteSettings.search_placeholder || ''} onChange={e => updateSetting('search_placeholder', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Título Carrinho</label>
                              <input type="text" value={siteSettings.cart_title || ''} onChange={e => updateSetting('cart_title', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Carrinho Vazio</label>
                              <input type="text" value={siteSettings.cart_empty_text || ''} onChange={e => updateSetting('cart_empty_text', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] font-black text-gray-600 uppercase">Texto Botão Checkout</label>
                              <input type="text" value={siteSettings.checkout_button_text || ''} onChange={e => updateSetting('checkout_button_text', e.target.value)} className="w-full bg-black border border-white/10 rounded-xl p-3 text-white text-xs" />
                            </div>
                          </div>
                       </div>

                       <button onClick={handleSaveSettings} disabled={authLoading} className="w-full bg-[var(--neon-green)] text-black py-6 rounded-3xl font-black flex items-center justify-center gap-3 uppercase text-[10px] shadow-xl hover:scale-[1.02] transition-all">
                          {authLoading ? <Loader2 className="animate-spin" /> : <Save />} SALVAR TODAS AS ALTERAÇÕES
                       </button>
                    </div>
                  </div>

                  {/* HISTÓRICO DE PEDIDOS */}
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
                             </div>
                           ))}
                        </div>
                     </div>
                  </div>
                </div>
              )}

              {/* ... (Resto do conteúdo da aba de produtos e licenças mantido idêntico) ... */}
              {activeAdminTab === 'products' && (
                <div className="bg-[#070709] border border-white/5 p-10 rounded-[4rem] space-y-6 animate-bounce-in relative">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                       <div className="flex items-center gap-4">
                          <h3 className="text-xl font-black uppercase italic text-white">VITRINE E ORDEM</h3>
                          <div className="bg-white/10 text-white px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/5">
                             {filteredAdminGames.length} ITENS
                          </div>
                          {selectedGameIds.length > 0 && (
                            <div className="bg-[var(--neon-green)] text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest animate-bounce-in">
                               {selectedGameIds.length} SELECIONADOS
                            </div>
                          )}
                       </div>
                       
                       <div className="relative w-full max-w-xs group">
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-[var(--neon-green)] transition-colors" />
                          <input 
                             type="text" 
                             value={adminSearchTerm}
                             onChange={e => setAdminSearchTerm(e.target.value)}
                             placeholder="Filtrar por nome..." 
                             className="w-full bg-black/40 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-white text-xs outline-none focus:border-[var(--neon-green)]/50 transition-all"
                          />
                       </div>
                    </div>

                    {selectedGameIds.length > 0 && (
                       <div className="sticky top-0 z-50 bg-[var(--neon-green)]/10 backdrop-blur-md border border-[var(--neon-green)]/20 p-4 rounded-3xl flex items-center justify-between animate-bounce-in mb-4">
                          <div className="flex items-center gap-2 text-[var(--neon-green)]">
                             <ListChecks className="w-5 h-5" />
                             <span className="text-[10px] font-black uppercase tracking-widest">AÇÕES PARA SELECIONADOS</span>
                          </div>
                          <div className="flex gap-2">
                             <button onClick={() => setShowBulkPriceModal(true)} className="bg-[var(--neon-green)] text-black px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:scale-105 transition-transform flex items-center gap-2">
                                <DollarSign className="w-3 h-3" /> EDITAR PREÇOS E OPÇÕES ({selectedGameIds.length})
                             </button>
                             <button onClick={() => setSelectedGameIds([])} className="bg-white/10 text-white px-4 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-white/20 transition-colors">
                                CANCELAR
                             </button>
                          </div>
                       </div>
                    )}

                    <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-3 pr-2">
                       {filteredAdminGames.length === 0 ? (
                          <div className="text-center py-10 opacity-30">
                             <Search className="w-12 h-12 mx-auto mb-2" />
                             <p className="text-[10px] font-black uppercase">Nenhum produto encontrado</p>
                          </div>
                       ) : (
                          filteredAdminGames.map((game, index) => (
                           <div 
                             key={game.id} 
                             draggable={!adminSearchTerm} 
                             onDragStart={(e) => handleDragStart(e, index)}
                             onDragEnd={handleDragEnd}
                             onDragOver={handleDragOver}
                             onDrop={(e) => handleDrop(e, index)}
                             className={`flex items-center gap-4 bg-black/40 border p-4 rounded-3xl group transition-all ${selectedGameIds.includes(game.id) ? 'border-[var(--neon-green)]/50 bg-[var(--neon-green)]/5' : 'border-white/5 hover:border-white/10'} ${draggedIndex === index ? 'opacity-50 border-dashed border-[var(--neon-green)]' : ''}`}
                           >
                              
                              {!adminSearchTerm && (
                                <div className="cursor-grab active:cursor-grabbing p-2 text-gray-600 hover:text-white">
                                   <GripVertical className="w-5 h-5" />
                                </div>
                              )}

                              <div className="flex items-center justify-center p-2">
                                 <input 
                                    type="checkbox" 
                                    checked={selectedGameIds.includes(game.id)} 
                                    onChange={() => toggleGameSelection(game.id)}
                                    className="w-5 h-5 accent-[var(--neon-green)] cursor-pointer"
                                 />
                              </div>

                              <div className="flex flex-col gap-1">
                                 <button onClick={() => handleMoveGame(game.id, 'up')} disabled={index === 0 || !!adminSearchTerm} className="p-1.5 bg-white/5 rounded-lg text-gray-500 hover:text-[var(--neon-green)] disabled:opacity-20 hover:disabled:text-gray-500 transition-colors"><ArrowUp className="w-3 h-3" /></button>
                                 <button onClick={() => handleMoveGame(game.id, 'down')} disabled={index === games.length - 1 || !!adminSearchTerm} className="p-1.5 bg-white/5 rounded-lg text-gray-500 hover:text-[var(--neon-green)] disabled:opacity-20 hover:disabled:text-gray-500 transition-colors"><ArrowDown className="w-3 h-3" /></button>
                              </div>
                              <img src={game.image_url} className="w-12 h-16 rounded-xl object-cover transition-transform group-hover:scale-105" />
                              <div className="flex-grow">
                                 <p className="text-[11px] text-white font-black uppercase italic line-clamp-1">{game.title}</p>
                                 <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <div className="flex items-center gap-1.5">
                                      <Tag className="w-3 h-3 text-[var(--neon-green)]" />
                                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest">{game.category}</p>
                                    </div>
                                    
                                    {game.updated_at && (
                                      <>
                                         <span className="text-gray-700 mx-1">•</span>
                                         <p className="text-[8px] text-gray-600 font-bold uppercase flex items-center gap-1">
                                            Atualizado: {new Date(game.updated_at).toLocaleDateString('pt-BR')}
                                         </p>
                                      </>
                                    )}

                                    {!game.is_available && (
                                       <span className="text-[8px] bg-red-600 text-white px-2 py-0.5 rounded-full font-black uppercase ml-2">INDISPONÍVEL</span>
                                    )}
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 <button onClick={() => {setEditingGame(game); setShowAdminModal(true)}} className="p-4 bg-white/5 text-blue-500 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 className="w-4 h-4"/></button>
                                 <button onClick={() => setGameToDelete(game.id)} className="p-4 bg-white/5 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-4 h-4"/></button>
                              </div>
                           </div>
                         ))
                       )}
                    </div>
                </div>
              )}

              {activeAdminTab === 'licenses' && (
                <div className="space-y-8 animate-bounce-in">
                   <div className="flex justify-between items-center">
                      <h3 className="text-2xl font-black italic uppercase text-white">PAINEL DE ENTREGAS & GAME PASS</h3>
                      <button onClick={createNewLicense} className="bg-[var(--neon-green)] text-black px-6 py-4 rounded-2xl font-black uppercase text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                         <Plus className="w-4 h-4" /> Nova Licença
                      </button>
                   </div>

                   <div className="grid grid-cols-1 gap-6">
                      {licenses.length === 0 ? (
                         <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-white/5">
                            <Key className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 font-black uppercase text-xs">Nenhuma licença cadastrada</p>
                         </div>
                      ) : (
                         licenses.map(lic => {
                            const daysLeft = lic.is_gamepass ? calculateDaysRemaining(lic.end_date) : null;
                            const isExpiring = daysLeft !== null && daysLeft <= 10 && daysLeft >= 0;
                            const isExpired = daysLeft !== null && daysLeft < 0;

                            return (
                               <div key={lic.id} className="bg-[#070709] border border-white/10 rounded-[2.5rem] p-8 flex flex-col lg:flex-row gap-8 relative group hover:border-[var(--neon-green)]/30 transition-all">
                                  <div className="flex-1 space-y-4">
                                     <div className="flex items-center gap-3">
                                        <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${lic.product_category === 'gamepass' ? 'bg-green-600 text-white' : 'bg-orange-600 text-white'}`}>
                                           {lic.product_category === 'gamepass' ? 'GAME PASS' : 'JOGO COMPLETO'}
                                        </div>
                                        {lic.is_gamepass && (
                                           <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${isExpired ? 'bg-red-600 text-white' : isExpiring ? 'bg-yellow-500 text-black' : 'bg-white/10 text-gray-400'}`}>
                                              <Clock className="w-3 h-3" /> 
                                              {isExpired ? 'EXPIRADO' : `${daysLeft} DIAS RESTANTES`}
                                           </div>
                                        )}
                                     </div>
                                     <div>
                                        <h4 className="text-xl font-black text-white italic uppercase">{lic.game_title}</h4>
                                        <p className="text-xs text-gray-500 font-bold uppercase mt-1">{lic.customer_name} • {lic.customer_email}</p>
                                     </div>
                                     <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl">
                                        <div>
                                           <p className="text-[8px] text-gray-500 font-black uppercase">Conta Entregue</p>
                                           <p className="text-white text-xs font-mono select-all">{lic.assigned_email || 'Não atribuída'}</p>
                                        </div>
                                        <div>
                                           <p className="text-[8px] text-gray-500 font-black uppercase">Senha</p>
                                           <p className="text-white text-xs font-mono select-all">{lic.assigned_password || '********'}</p>
                                        </div>
                                     </div>
                                  </div>

                                  {lic.is_gamepass && (
                                     <div className="bg-black/40 p-6 rounded-3xl border border-white/5 min-w-[250px] space-y-3">
                                        <p className="text-[9px] text-[var(--neon-green)] font-black uppercase tracking-widest text-center border-b border-white/5 pb-2">ASSINATURA</p>
                                        <div className="flex justify-between items-center text-xs">
                                           <span className="text-gray-500 font-bold">Início:</span>
                                           <span className="text-white">{lic.start_date ? new Date(lic.start_date).toLocaleDateString('pt-BR') : '-'}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                           <span className="text-gray-500 font-bold">Fim:</span>
                                           <span className={`font-black ${isExpired ? 'text-red-500' : 'text-white'}`}>{lic.end_date ? new Date(lic.end_date).toLocaleDateString('pt-BR') : '-'}</span>
                                        </div>
                                        {isExpiring && !isExpired && (
                                           <div className="bg-yellow-500/10 text-yellow-500 p-2 rounded-xl text-[9px] font-black uppercase text-center border border-yellow-500/20 mt-2">
                                              <AlertTriangle className="w-3 h-3 inline-block mr-1" /> Renovar em breve
                                           </div>
                                        )}
                                     </div>
                                  )}

                                  <div className="flex flex-col gap-2 justify-center">
                                     <button onClick={() => { setEditingLicense(lic); setShowLicenseModal(true); }} className="bg-white/5 p-4 rounded-2xl text-blue-500 hover:bg-blue-600 hover:text-white transition-all"><Edit2 className="w-5 h-5" /></button>
                                     <button onClick={() => setLicenseToDelete(lic.id)} className="bg-white/5 p-4 rounded-2xl text-red-500 hover:bg-red-600 hover:text-white transition-all"><Trash2 className="w-5 h-5" /></button>
                                  </div>
                               </div>
                            )
                         })
                      )}
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      {/* BOTÃO FLUTUANTE WHATSAPP (APENAS LOGADO) */}
      {user && (
        <a 
          href={`https://wa.me/${siteSettings.whatsapp_number}?text=${encodeURIComponent("Olá RD Digital! Sou cliente cadastrado e preciso de ajuda.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_30px_rgba(37,211,102,0.4)] hover:scale-110 active:scale-95 transition-all flex items-center justify-center group animate-bounce-in"
        >
          <div className="absolute right-full mr-4 bg-white text-black px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Suporte VIP
          </div>
          <MessageCircle className="w-8 h-8 fill-white/20" />
        </a>
      )}
    </div>
  );
};

export default App;

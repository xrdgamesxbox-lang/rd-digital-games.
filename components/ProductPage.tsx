import React, { useState, useEffect } from 'react';
import { X, ShoppingCart, ArrowLeft, ShieldCheck, Zap, Rocket, Calendar, Check, Users, UserPlus, AlertTriangle } from 'lucide-react';
import { Game } from '../types.ts';

interface ProductPageProps {
  game: Game;
  onClose: () => void;
  onAddToCart: (game: Game, type: 'parental' | 'exclusiva' | 'gamepass' | 'prevenda', price: number) => void;
}

const ProductPage: React.FC<ProductPageProps> = ({ game, onClose, onAddToCart }) => {
  // Lógica de estoque
  const parentalStock = game.is_parental_available !== false;
  const exclusiveStock = game.is_exclusive_available !== false;
  
  // Estado local para seleção do tipo de conta
  const [accountType, setAccountType] = useState<'parental' | 'exclusiva'>(
    parentalStock ? 'parental' : 'exclusiva'
  );

  useEffect(() => {
    // Scroll para o topo ao abrir
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!parentalStock && exclusiveStock) setAccountType('exclusiva');
    else if (parentalStock && !exclusiveStock) setAccountType('parental');
  }, [parentalStock, exclusiveStock]);

  const isGamePass = game.category === 'gamepass';
  const isPreOrder = game.category === 'prevenda';
  const isUnavailable = game.is_available === false;

  const isSelectionAvailable = isGamePass || isPreOrder 
    ? !isUnavailable 
    : (accountType === 'parental' ? parentalStock : exclusiveStock);

  // Determinar preços baseados na seleção
  const originalPrice = (isGamePass || isPreOrder)
    ? (game.original_price || 0) 
    : (accountType === 'parental' ? (game.original_price_parental || 0) : (game.original_price_exclusive || 0));

  const currentPrice = (isGamePass || isPreOrder)
    ? (game.current_price || 0) 
    : (accountType === 'parental' ? (game.current_price_parental || 0) : (game.current_price_exclusive || 0));

  const discount = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const handleBuy = () => {
    if (!isUnavailable && isSelectionAvailable) {
      onAddToCart(game, game.category === 'jogo' ? accountType : game.category, currentPrice);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#070709] overflow-y-auto custom-scrollbar animate-bounce-in">
      {/* Navbar Simplificada de Retorno */}
      <div className="sticky top-0 z-50 bg-[#070709]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-2 text-white hover:text-[var(--neon-green)] transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">VOLTAR</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:block">{game.category === 'jogo' ? 'JOGO DIGITAL' : game.category.toUpperCase()}</span>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-12 pb-32">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          
          {/* Coluna da Esquerda: Imagem */}
          <div className="lg:w-5/12 flex-shrink-0">
            <div className="sticky top-32">
              <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] group">
                <img src={game.image_url} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" alt={game.title} />
                
                {/* Badges Flutuantes */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 items-end">
                   {isPreOrder && (
                      <span className="bg-orange-600 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl animate-pulse">PRÉ-VENDA</span>
                   )}
                   {isGamePass && (
                      <span className="bg-[var(--neon-green)] text-black px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">GAME PASS</span>
                   )}
                   {discount > 0 && (
                      <span className="bg-red-600 text-white px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">-{discount}% OFF</span>
                   )}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita: Detalhes e Compra */}
          <div className="lg:w-7/12 space-y-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                 <div className="bg-white/10 px-4 py-2 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/5">
                    {game.platform || 'XBOX ONE / SERIES X|S'}
                 </div>
                 {isUnavailable && <span className="bg-red-900/30 text-red-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-500/30">INDISPONÍVEL</span>}
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic text-white tracking-tighter leading-[0.9] mb-6 neon-text-glow">{game.title}</h1>
              
              {/* Descrição */}
              <div className="bg-white/5 border border-white/5 p-8 rounded-[2rem] space-y-4">
                 <h3 className="text-[10px] font-black text-[var(--neon-green)] uppercase tracking-widest flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Sobre o Produto
                 </h3>
                 <p className="text-gray-400 text-sm md:text-base leading-relaxed font-medium">
                    {game.description || "Mergulhe nesta experiência incrível de nova geração. Gráficos impressionantes, jogabilidade fluida e uma história envolvente esperam por você."}
                 </p>
              </div>
            </div>

            {/* Seletores de Tipo (Apenas para Jogos) */}
            {game.category === 'jogo' && (
              <div className="space-y-4">
                 <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">ESCOLHA SUA VERSÃO</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button 
                       onClick={() => parentalStock && setAccountType('parental')}
                       disabled={!parentalStock}
                       className={`relative p-6 rounded-[2rem] border-2 text-left transition-all group ${
                          accountType === 'parental' 
                             ? 'bg-orange-600/10 border-orange-600' 
                             : 'bg-black border-white/10 hover:border-white/20'
                       } ${!parentalStock ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <div className={`p-3 rounded-2xl ${accountType === 'parental' ? 'bg-orange-600 text-white' : 'bg-white/10 text-gray-500'}`}>
                             <Users className="w-6 h-6" />
                          </div>
                          {accountType === 'parental' && <Check className="text-orange-600 w-6 h-6" />}
                       </div>
                       <h4 className={`text-xl font-black uppercase italic tracking-tighter ${accountType === 'parental' ? 'text-white' : 'text-gray-400'}`}>CONTA PARENTAL</h4>
                       <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 leading-tight">Jogue no seu perfil pessoal. Requer método simples de login.</p>
                       <div className="mt-4 text-2xl font-black text-white italic">R$ {game.current_price_parental?.toFixed(2)}</div>
                       {!parentalStock && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-[2rem]"><span className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transform -rotate-6">ESGOTADO</span></div>}
                    </button>

                    <button 
                       onClick={() => exclusiveStock && setAccountType('exclusiva')}
                       disabled={!exclusiveStock}
                       className={`relative p-6 rounded-[2rem] border-2 text-left transition-all group ${
                          accountType === 'exclusiva' 
                             ? 'bg-blue-600/10 border-blue-600' 
                             : 'bg-black border-white/10 hover:border-white/20'
                       } ${!exclusiveStock ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                    >
                       <div className="flex justify-between items-start mb-2">
                          <div className={`p-3 rounded-2xl ${accountType === 'exclusiva' ? 'bg-blue-600 text-white' : 'bg-white/10 text-gray-500'}`}>
                             <UserPlus className="w-6 h-6" />
                          </div>
                          {accountType === 'exclusiva' && <Check className="text-blue-600 w-6 h-6" />}
                       </div>
                       <h4 className={`text-xl font-black uppercase italic tracking-tighter ${accountType === 'exclusiva' ? 'text-white' : 'text-gray-400'}`}>CONTA EXCLUSIVA</h4>
                       <p className="text-[10px] text-gray-500 font-bold uppercase mt-2 leading-tight">Conta 100% sua. Pode trocar senha e email. Home Principal.</p>
                       <div className="mt-4 text-2xl font-black text-white italic">R$ {game.current_price_exclusive?.toFixed(2)}</div>
                       {!exclusiveStock && <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-[1px] rounded-[2rem]"><span className="bg-red-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transform -rotate-6">ESGOTADO</span></div>}
                    </button>
                 </div>
              </div>
            )}

            {/* Barra de Ação Fixa Mobile ou Bloco Desktop */}
            <div className="bg-[#0a0a0c] border border-white/10 p-6 md:p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
               <div className="space-y-1 text-center md:text-left">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                     {isPreOrder ? 'VALOR DA RESERVA' : 'PREÇO FINAL'}
                  </p>
                  <div className="flex items-end gap-3 justify-center md:justify-start">
                     {originalPrice > 0 && (
                        <span className="text-sm text-gray-600 line-through font-bold mb-1">R$ {originalPrice.toFixed(2)}</span>
                     )}
                     <span className="text-4xl md:text-5xl font-black italic text-white tracking-tighter neon-text-glow">
                        R$ {currentPrice.toFixed(2)}
                     </span>
                  </div>
               </div>

               <button 
                  onClick={handleBuy}
                  disabled={isUnavailable || !isSelectionAvailable}
                  className={`w-full md:w-auto px-12 py-6 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-xl hover:scale-105 active:scale-95 ${
                     isUnavailable || !isSelectionAvailable 
                     ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                     : 'bg-[var(--neon-green)] text-black'
                  }`}
               >
                  {isUnavailable ? (
                     <> <AlertTriangle className="w-5 h-5" /> INDISPONÍVEL </>
                  ) : !isSelectionAvailable ? (
                     <> <AlertTriangle className="w-5 h-5" /> ESGOTADO </>
                  ) : (
                     <> 
                        <ShoppingCart className="w-5 h-5" /> 
                        {isPreOrder ? 'RESERVAR AGORA' : 'ADICIONAR AO CARRINHO'}
                     </>
                  )}
               </button>
            </div>

            <div className="flex flex-wrap gap-4 justify-center md:justify-start text-[9px] font-black text-gray-600 uppercase tracking-widest">
               <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[var(--neon-green)]" /> Garantia Vitalícia</span>
               <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[var(--neon-green)]" /> Entrega Imediata</span>
               <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[var(--neon-green)]" /> Suporte 24/7</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
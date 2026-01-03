
import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, Zap, ShieldCheck, UserCheck, Calendar, Users, UserPlus, Rocket, Ban } from 'lucide-react';
import { Game } from '../types.ts';

interface GameCardProps {
  game: Game;
  onBuy?: (game: Game, type: 'parental' | 'exclusiva' | 'gamepass' | 'prevenda', price: number) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onBuy }) => {
  const [imageError, setImageError] = useState(false);
  
  // Lógica de estoque
  const parentalStock = game.is_parental_available !== false;
  const exclusiveStock = game.is_exclusive_available !== false;
  
  // Se Parental estiver esgotada, tenta mudar o padrão para Exclusiva
  const [accountType, setAccountType] = useState<'parental' | 'exclusiva'>(
    parentalStock ? 'parental' : 'exclusiva'
  );

  // Efeito para corrigir a seleção caso a disponibilidade mude
  useEffect(() => {
    if (!parentalStock && exclusiveStock) {
      setAccountType('exclusiva');
    } else if (parentalStock && !exclusiveStock) {
      setAccountType('parental');
    }
  }, [parentalStock, exclusiveStock]);

  const handleImageError = () => setImageError(true);

  const isGamePass = game.category === 'gamepass';
  const isPreOrder = game.category === 'prevenda';
  const isUnavailable = game.is_available === false;
  
  // Verifica se a opção ATUALMENTE selecionada está disponível
  const isSelectionAvailable = isGamePass || isPreOrder 
    ? !isUnavailable 
    : (accountType === 'parental' ? parentalStock : exclusiveStock);

  const originalPrice = (isGamePass || isPreOrder)
    ? (game.original_price || 0) 
    : (accountType === 'parental' ? (game.original_price_parental || 0) : (game.original_price_exclusive || 0));

  const currentPrice = (isGamePass || isPreOrder)
    ? (game.current_price || 0) 
    : (accountType === 'parental' ? (game.current_price_parental || 0) : (game.current_price_exclusive || 0));

  const discount = originalPrice > 0 ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const handleAddToCart = () => {
    if (onBuy && !isUnavailable && isSelectionAvailable) {
      onBuy(game, game.category === 'jogo' ? accountType : game.category, currentPrice);
    }
  };

  return (
    <div className={`relative flex flex-col bg-[#070709] rounded-[2rem] md:rounded-[3rem] overflow-hidden border ${game.is_featured ? 'border-[var(--neon-green)]/40 ring-1 ring-[var(--neon-green)]/10' : 'border-white/5'} transition-all hover:-translate-y-3 group shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_60px_var(--neon-glow)]`}>
      
      {/* Overlay de Indisponível (Global) */}
      {isUnavailable && (
         <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
            <div className="bg-red-600 text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl font-black uppercase text-[10px] md:text-xs tracking-widest shadow-2xl transform -rotate-12 border border-red-400">
               ESGOTADO
            </div>
         </div>
      )}

      <div className={`relative aspect-[3/4] overflow-hidden p-2 md:p-3 pb-0 ${isUnavailable ? 'grayscale opacity-50' : ''}`}>
        <div className="relative w-full h-full rounded-[1.8rem] md:rounded-[2.5rem] overflow-hidden bg-black/40">
          {imageError ? (
            <div className="w-full h-full bg-[#0a0a0c] flex flex-col items-center justify-center text-gray-700 gap-3 p-6 text-center">
              <AlertCircle className="w-8 h-8 md:w-10 md:h-10 opacity-20" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Capa Indisponível</span>
            </div>
          ) : (
            <img 
              src={game.image_url} 
              alt={game.title} 
              onError={handleImageError}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
          )}
          
          <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20 flex flex-col gap-2 items-end">
             {isPreOrder ? (
                <div className="bg-orange-600 text-white px-2 py-2 md:px-3 md:py-3 rounded-2xl border border-orange-400/20 shadow-xl animate-pulse">
                  <Rocket className="w-3 h-3 md:w-4 md:h-4 fill-white" />
                </div>
             ) : (
                <div className="bg-black/80 backdrop-blur-md px-2 py-2 md:px-3 md:py-3 rounded-2xl border border-white/10 text-[var(--neon-green)] shadow-xl">
                  <Zap className="w-3 h-3 md:w-4 md:h-4 fill-[var(--neon-green)]" />
                </div>
             )}
             
             {isGamePass && (
                <div className="bg-[#ccff00] text-black px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-tighter shadow-xl">
                  {game.plan_duration} MESES
                </div>
             )}
             {isPreOrder && (
                <div className="bg-orange-600 text-white px-2 py-1 md:px-3 md:py-1.5 rounded-xl text-[8px] md:text-[9px] font-black uppercase tracking-tighter shadow-xl">
                  RESERVE JÁ
                </div>
             )}
          </div>

          <div className="absolute bottom-3 left-3 md:bottom-5 md:left-5 z-20">
             <div className="bg-black/90 backdrop-blur-md px-3 py-1.5 md:px-5 md:py-2 rounded-full border border-white/10 text-[7px] md:text-[9px] font-black text-white uppercase tracking-[0.1em]">
               {game.platform || 'XBOX ONE / SERIES X|S'}
             </div>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 pt-4 md:pt-6 flex flex-col flex-grow">
        <h3 className={`text-sm md:text-xl font-black leading-tight mb-2 line-clamp-2 uppercase italic tracking-tighter ${isUnavailable ? 'text-gray-500' : 'text-white'}`}>
          {game.title}
        </h3>

        {game.category === 'jogo' && (
          <div className={`flex gap-1 md:gap-2 mb-3 md:mb-4 bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/5 ${isUnavailable ? 'opacity-50 pointer-events-none' : ''}`}>
             <button 
                onClick={() => parentalStock && setAccountType('parental')}
                disabled={!parentalStock}
                className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 relative overflow-hidden ${
                  !parentalStock 
                    ? 'text-gray-600 bg-white/5 cursor-not-allowed opacity-50' 
                    : (accountType === 'parental' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-500 hover:text-white')
                }`}
             >
                <Users className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">Parental</span><span className="sm:hidden">Par.</span>
                {!parentalStock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[6px] md:text-[7px] text-red-500 transform -rotate-6 border border-red-900/50">ESGOTADO</div>}
             </button>
             <button 
                onClick={() => exclusiveStock && setAccountType('exclusiva')}
                disabled={!exclusiveStock}
                className={`flex-1 py-1.5 md:py-2 px-2 md:px-3 rounded-lg md:rounded-xl text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 relative overflow-hidden ${
                  !exclusiveStock 
                    ? 'text-gray-600 bg-white/5 cursor-not-allowed opacity-50' 
                    : (accountType === 'exclusiva' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white')
                }`}
             >
                <UserPlus className="w-2.5 h-2.5 md:w-3 md:h-3" /> <span className="hidden sm:inline">Exclusiva</span><span className="sm:hidden">Exc.</span>
                {!exclusiveStock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-[6px] md:text-[7px] text-red-500 transform -rotate-6 border border-red-900/50">ESGOTADO</div>}
             </button>
          </div>
        )}

        <div className="flex items-center gap-1.5 md:gap-2 mb-4 md:mb-6 text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest">
          {isPreOrder ? <Rocket className="w-3 h-3 md:w-3.5 md:h-3.5 text-orange-500" /> : <ShieldCheck className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isUnavailable || !isSelectionAvailable ? 'text-gray-600' : 'text-[var(--neon-green)]'}`} />}
          <span className="line-clamp-1">{isPreOrder ? 'Liberação no lançamento' : 'Joga no seu próprio perfil'}</span>
        </div>

        <div className="mt-auto space-y-3 md:space-y-4">
          {!isUnavailable ? (
             <>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className={`text-[10px] md:text-xs text-gray-600 line-through font-bold ${!isSelectionAvailable ? 'opacity-30' : ''}`}>
                    R$ {originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  {discount > 0 && isSelectionAvailable && (
                    <span className="bg-[var(--neon-green)] text-[var(--bg-dark)] text-[9px] md:text-[10px] font-black px-2 py-1 md:px-4 md:py-1.5 rounded-full uppercase tracking-tighter">
                      -{discount}%
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <div className={`text-2xl md:text-4xl font-black italic tracking-tighter leading-none neon-text-glow ${!isSelectionAvailable ? 'text-gray-700' : (isPreOrder ? 'text-orange-500' : 'text-white')}`}>
                      {isSelectionAvailable ? `R$${currentPrice.toFixed(2).replace('.', ',')}` : '---'}
                    </div>
                    <div className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest md:tracking-[0.4em] mt-2 md:mt-3 opacity-80 ${isPreOrder ? 'text-orange-400' : 'text-[var(--neon-green)]'}`}>
                      {isPreOrder ? 'PRÉ-VENDA ATIVA' : 'ENTREGA IMEDIATA'}
                    </div>
                  </div>
                  
                  <div className={`p-2.5 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5 group-hover:bg-white/10 transition-all ${isPreOrder ? 'group-hover:border-orange-500/40' : 'group-hover:border-[var(--neon-green)]/40'}`}>
                     {isPreOrder ? <Rocket className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-hover:text-orange-500" /> : (isGamePass ? <Calendar className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-hover:text-[var(--neon-green)]" /> : <UserCheck className="w-5 h-5 md:w-6 md:h-6 text-gray-500 group-hover:text-[var(--neon-green)]" />)}
                  </div>
                </div>
             </>
          ) : (
             <div className="flex flex-col items-center justify-center py-4 space-y-2 opacity-60">
                <Ban className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
                <p className="text-lg md:text-xl font-black uppercase italic text-gray-500 tracking-tighter">SEM ESTOQUE</p>
             </div>
          )}

          <button 
            disabled={isUnavailable || !isSelectionAvailable}
            onClick={handleAddToCart}
            className={`w-full py-4 md:py-5 rounded-[1rem] md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.2em] md:tracking-[0.3em] flex items-center justify-center gap-2 md:gap-4 transition-all h-12 md:h-16 
              ${isUnavailable || !isSelectionAvailable
                  ? 'bg-red-900/20 text-red-700 border border-red-900/30 cursor-not-allowed' 
                  : (isPreOrder 
                      ? 'bg-orange-600 text-white shadow-[0_15px_30px_rgba(234,88,12,0.15)] active:scale-95' 
                      : 'bg-[var(--neon-green)] text-[var(--bg-dark)] shadow-[0_15px_30px_rgba(var(--neon-glow),0.15)] active:scale-95'
                    )
              }`}
          >
            {isUnavailable ? (
               <>INDISPONÍVEL</>
            ) : !isSelectionAvailable ? (
               <>OPÇÃO ESGOTADA</>
            ) : (
               <>
                  <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                  {isPreOrder ? 'RESERVAR' : (accountType === 'exclusiva' && !isGamePass ? 'COMPRAR' : 'AO CARRINHO')}
               </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameCard;

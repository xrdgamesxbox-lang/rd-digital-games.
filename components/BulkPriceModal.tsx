
import React, { useState } from 'react';
import { X, Save, DollarSign, AlertTriangle, Trash2, RefreshCcw, Check, Ban, Power } from 'lucide-react';
import { Game } from '../types.ts';

interface BulkPriceModalProps {
  games: Game[];
  onClose: () => void;
  onSave: (updates: { id: string, updates: Partial<Game> }[], deletions: string[]) => void;
}

const BulkPriceModal: React.FC<BulkPriceModalProps> = ({ games, onClose, onSave }) => {
  // Inicializa o estado com os dados atuais dos jogos selecionados
  // Garante que is_available seja true se estiver undefined
  const [editedGames, setEditedGames] = useState<Game[]>(
    JSON.parse(JSON.stringify(games)).map((g: Game) => ({
      ...g,
      is_available: g.is_available !== false
    }))
  );

  // Lista de IDs marcados para exclusão
  const [gamesToDelete, setGamesToDelete] = useState<string[]>([]);

  const handlePriceChange = (id: string, field: keyof Game, value: string) => {
    setEditedGames(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, [field]: parseFloat(value) || 0 };
      }
      return g;
    }));
  };

  const toggleAvailability = (id: string) => {
    setEditedGames(prev => prev.map(g => {
      if (g.id === id) {
        return { ...g, is_available: !g.is_available };
      }
      return g;
    }));
  };

  const toggleDeletion = (id: string) => {
    if (gamesToDelete.includes(id)) {
      setGamesToDelete(prev => prev.filter(gId => gId !== id));
    } else {
      setGamesToDelete(prev => [...prev, id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filtra apenas jogos que NÃO estão marcados para exclusão para atualização
    const updates = editedGames
      .filter(g => !gamesToDelete.includes(g.id))
      .map(g => {
        const payload: Partial<Game> = {
          is_available: g.is_available
        };
        
        if (g.category === 'jogo') {
          payload.original_price_parental = g.original_price_parental;
          payload.current_price_parental = g.current_price_parental;
          payload.original_price_exclusive = g.original_price_exclusive;
          payload.current_price_exclusive = g.current_price_exclusive;
        } else {
          payload.original_price = g.original_price;
          payload.current_price = g.current_price;
        }
        
        return { id: g.id, updates: payload };
      });
    
    // Envia updates e a lista de exclusões
    onSave(updates, gamesToDelete);
  };

  return (
    <div className="fixed inset-0 z-[600] bg-black/95 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a0a0c] border border-[var(--neon-green)]/20 w-full max-w-7xl rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-black/40">
          <div className="flex items-center gap-4">
            <div className="bg-[var(--neon-green)] p-3 rounded-xl text-black">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black italic uppercase text-white">EDIÇÃO EM MASSA</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Gerenciando {games.length} itens selecionados
              </p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/5 p-3 rounded-xl text-gray-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto custom-scrollbar p-8">
          <div className="space-y-4">
            {editedGames.map((game) => {
              const isMarkedForDeletion = gamesToDelete.includes(game.id);

              return (
                <div 
                  key={game.id} 
                  className={`border rounded-2xl p-4 flex flex-col lg:flex-row items-center gap-6 transition-all relative overflow-hidden ${
                    isMarkedForDeletion 
                      ? 'bg-red-900/10 border-red-600/30 opacity-70' 
                      : 'bg-white/5 border-white/5 hover:border-[var(--neon-green)]/30'
                  }`}
                >
                  {isMarkedForDeletion && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 pointer-events-none">
                      <span className="text-red-500 font-black uppercase text-xl transform -rotate-12 border-4 border-red-500 p-2 rounded-xl">MARCADO PARA EXCLUIR</span>
                    </div>
                  )}

                  {/* Info do Jogo e Controles de Ação */}
                  <div className="flex items-center gap-4 w-full lg:w-1/4 relative z-20">
                    <img src={game.image_url} className="w-12 h-16 rounded-lg object-cover bg-black" alt="" />
                    <div className="min-w-0 flex-grow">
                      <p className="text-[10px] font-black text-[var(--neon-green)] uppercase tracking-widest mb-1">{game.category}</p>
                      <h4 className="text-sm font-bold text-white truncate">{game.title}</h4>
                    </div>
                  </div>

                  {/* Campos de Preço */}
                  <div className={`flex-grow grid grid-cols-2 lg:grid-cols-4 gap-4 w-full transition-opacity ${isMarkedForDeletion ? 'opacity-20' : ''}`}>
                    {game.category === 'jogo' ? (
                      <>
                        <div className="space-y-1">
                          <label className="text-[8px] text-orange-500 font-black uppercase">Parental (Orig.)</label>
                          <input 
                            type="number" step="0.01" 
                            disabled={isMarkedForDeletion}
                            value={game.original_price_parental}
                            onChange={(e) => handlePriceChange(game.id, 'original_price_parental', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-gray-400 focus:border-orange-500 focus:text-white transition-colors disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-orange-500 font-black uppercase">Parental (Venda)</label>
                          <input 
                            type="number" step="0.01" 
                            disabled={isMarkedForDeletion}
                            value={game.current_price_parental}
                            onChange={(e) => handlePriceChange(game.id, 'current_price_parental', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-[var(--neon-green)] font-bold focus:border-orange-500 transition-colors disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-blue-500 font-black uppercase">Exclusiva (Orig.)</label>
                          <input 
                            type="number" step="0.01" 
                            disabled={isMarkedForDeletion}
                            value={game.original_price_exclusive}
                            onChange={(e) => handlePriceChange(game.id, 'original_price_exclusive', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-gray-400 focus:border-blue-500 focus:text-white transition-colors disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-blue-500 font-black uppercase">Exclusiva (Venda)</label>
                          <input 
                            type="number" step="0.01" 
                            disabled={isMarkedForDeletion}
                            value={game.current_price_exclusive}
                            onChange={(e) => handlePriceChange(game.id, 'current_price_exclusive', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-[var(--neon-green)] font-bold focus:border-blue-500 transition-colors disabled:opacity-50"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <label className="text-[8px] text-gray-500 font-black uppercase">Preço Original</label>
                          <input 
                            type="number" step="0.01" 
                            disabled={isMarkedForDeletion}
                            value={game.original_price}
                            onChange={(e) => handlePriceChange(game.id, 'original_price', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-gray-400 focus:border-[var(--neon-green)] focus:text-white transition-colors disabled:opacity-50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] text-gray-500 font-black uppercase">Preço Venda</label>
                          <input 
                            type="number" step="0.01" 
                            disabled={isMarkedForDeletion}
                            value={game.current_price}
                            onChange={(e) => handlePriceChange(game.id, 'current_price', e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-2 text-xs text-[var(--neon-green)] font-bold focus:border-[var(--neon-green)] transition-colors disabled:opacity-50"
                          />
                        </div>
                        <div className="hidden lg:block lg:col-span-2"></div>
                      </>
                    )}
                  </div>

                  {/* Ações (Disponibilidade e Excluir) */}
                  <div className="flex flex-col gap-2 min-w-[140px] relative z-20 pl-4 border-l border-white/5">
                    
                    {/* Botão Disponibilidade */}
                    <button
                      type="button"
                      onClick={() => toggleAvailability(game.id)}
                      disabled={isMarkedForDeletion}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                        game.is_available 
                          ? 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30' 
                          : 'bg-gray-800 text-gray-500 hover:bg-gray-700'
                      } disabled:opacity-30`}
                    >
                      <span>{game.is_available ? 'DISPONÍVEL' : 'INDISPONÍVEL'}</span>
                      {game.is_available ? <Check className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    </button>

                    {/* Botão Excluir */}
                    <button
                      type="button"
                      onClick={() => toggleDeletion(game.id)}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${
                        isMarkedForDeletion
                          ? 'bg-gray-700 text-white hover:bg-gray-600'
                          : 'bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {isMarkedForDeletion ? (
                        <> <RefreshCcw className="w-3 h-3" /> DESFAZER </>
                      ) : (
                        <> <Trash2 className="w-3 h-3" /> EXCLUIR </>
                      )}
                    </button>

                  </div>

                </div>
              );
            })}
          </div>
        </form>

        <div className="p-8 border-t border-white/5 bg-black/40 flex justify-between items-center">
          <div className="text-[10px] font-black uppercase text-gray-500">
             {gamesToDelete.length > 0 && (
               <span className="text-red-500 flex items-center gap-2">
                 <AlertTriangle className="w-4 h-4" /> {gamesToDelete.length} itens serão excluídos
               </span>
             )}
          </div>
          <div className="flex gap-4">
            <button onClick={onClose} className="px-8 py-4 rounded-xl bg-white/5 text-gray-500 font-black uppercase text-xs hover:text-white transition-colors">
              CANCELAR
            </button>
            <button onClick={handleSubmit} className="px-8 py-4 rounded-xl bg-[var(--neon-green)] text-black font-black uppercase text-xs hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_20px_var(--neon-glow)]">
              <Save className="w-4 h-4" /> CONFIRMAR MUDANÇAS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BulkPriceModal;

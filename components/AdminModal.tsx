
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save, Zap, Gamepad2, Layers, Rocket, Search, Globe, Power, PowerOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Game } from '../types.ts';
import { searchGameData, generateGameDescription } from '../services/geminiService.ts';

interface AdminModalProps {
  onClose: () => void;
  onSave: (game: Omit<Game, 'id'>) => void;
  initialData?: Game | null;
}

const AdminModal: React.FC<AdminModalProps> = ({ onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [quotaError, setQuotaError] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    original_price_parental: 0,
    current_price_parental: 0,
    original_price_exclusive: 0,
    current_price_exclusive: 0,
    original_price: 0,
    current_price: 0,
    image_url: '',
    is_featured: false,
    is_available: true, 
    is_parental_available: true,
    is_exclusive_available: true,
    platform: 'Xbox One / Series X|S',
    category: 'jogo',
    plan_duration: '1'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({ 
        ...initialData,
        original_price_parental: initialData.original_price_parental || 0,
        current_price_parental: initialData.current_price_parental || 0,
        original_price_exclusive: initialData.original_price_exclusive || 0,
        current_price_exclusive: initialData.current_price_exclusive || 0,
        original_price: initialData.original_price || 0,
        current_price: initialData.current_price || 0,
        is_available: initialData.is_available !== false,
        is_parental_available: initialData.is_parental_available !== false,
        is_exclusive_available: initialData.is_exclusive_available !== false
      });
    }
  }, [initialData]);

  const handleSearchProcess = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setQuotaError(false);
    try {
      const data = await searchGameData(searchQuery);
      if (data) {
        setFormData((prev: any) => ({
          ...prev,
          title: data.title,
          description: data.description,
          original_price_parental: data.original_price,
          current_price_parental: data.current_price,
          original_price_exclusive: Number((data.original_price * 2.5).toFixed(2)),
          current_price_exclusive: Number((data.current_price * 2.5).toFixed(2)),
          image_url: data.image_url,
          original_price: data.original_price,
          current_price: data.current_price
        }));
        setSearchQuery('');
      }
    } catch (e: any) {
      if (e.message === "LIMITE_EXCEDIDO") {
        setQuotaError(true);
      } else {
        alert("Erro na busca. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDescription = async () => {
    if (!formData.title) return;
    setDescLoading(true);
    try {
      const desc = await generateGameDescription(formData.title);
      setFormData((prev: any) => ({ ...prev, description: desc }));
    } catch (error) {
      console.error("Erro ao gerar descrição:", error);
    } finally {
      setDescLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
      <div className="bg-[#0a0a0c] border border-[var(--neon-green)]/10 w-full max-w-2xl rounded-[3.5rem] overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-8 border-b border-white/5">
          <div className="flex flex-col">
            <h2 className="text-xl font-black italic uppercase text-white">GERENCIAR PRODUTO</h2>
            <p className="text-[8px] text-[var(--neon-green)] font-black uppercase tracking-widest mt-1">BUSCA INTELIGENTE ATIVA</p>
          </div>
          <button onClick={onClose} className="bg-white/5 p-2 rounded-xl text-gray-500 hover:text-white"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {/* BUSCA POR IA */}
          <div className="bg-[var(--neon-green)]/5 p-6 rounded-[2.5rem] border border-[var(--neon-green)]/10 space-y-4">
            <div className="flex items-center gap-2 text-[var(--neon-green)] mb-1">
               <Globe className="w-4 h-4" />
               <span className="text-[10px] font-black uppercase tracking-widest">IA SEARCH AUTOMÁTICO</span>
            </div>
            <div className="flex gap-4">
               <div className="flex-grow">
                  <input 
                    type="text" 
                    value={searchQuery} 
                    onChange={e => setSearchQuery(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchProcess())}
                    placeholder="Nome do jogo ou link da Xbox Store..." 
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-white text-xs outline-none focus:border-[var(--neon-green)]/50 transition-all" 
                  />
               </div>
               <button 
                type="button" 
                onClick={handleSearchProcess} 
                disabled={loading} 
                className="px-8 bg-[var(--neon-green)] text-black rounded-2xl font-black transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_var(--neon-glow)] disabled:opacity-50"
               >
                 {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
               </button>
            </div>
            
            {quotaError && (
              <div className="bg-orange-600/10 border border-orange-500/30 p-4 rounded-2xl flex items-center gap-3 animate-bounce-in">
                 <AlertTriangle className="text-orange-500 w-5 h-5 flex-shrink-0" />
                 <p className="text-[9px] text-orange-200 font-bold uppercase leading-tight">Limite de buscas por minuto atingido pela IA. Por favor, aguarde 60 segundos para pesquisar novamente ou preencha manualmente.</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <button type="button" onClick={() => setFormData({...formData, category: 'jogo'})} className={`py-4 rounded-2xl border flex flex-col items-center gap-2 ${formData.category === 'jogo' ? 'bg-[var(--neon-green)] text-black border-[var(--neon-green)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Gamepad2 className="w-5 h-5" /> <span className="text-[9px] font-black uppercase">JOGO</span>
            </button>
            <button type="button" onClick={() => setFormData({...formData, category: 'gamepass'})} className={`py-4 rounded-2xl border flex flex-col items-center gap-2 ${formData.category === 'gamepass' ? 'bg-green-600 text-white border-green-600 shadow-[0_0_15px_rgba(22,163,74,0.4)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Layers className="w-5 h-5" /> <span className="text-[9px] font-black uppercase tracking-tighter">GAME PASS</span>
            </button>
            <button type="button" onClick={() => setFormData({...formData, category: 'prevenda'})} className={`py-4 rounded-2xl border flex flex-col items-center gap-2 ${formData.category === 'prevenda' ? 'bg-orange-600 text-white border-orange-600 shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-white/5 border-white/5 text-gray-500'}`}>
              <Rocket className="w-5 h-5" /> <span className="text-[9px] font-black uppercase">PRÉ-VENDA</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase">TÍTULO</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white font-bold" />
            </div>

            {formData.category === 'jogo' ? (
              <>
                <div className={`grid grid-cols-2 gap-6 p-6 rounded-3xl border transition-colors ${formData.is_parental_available ? 'bg-white/5 border-white/5' : 'bg-red-900/10 border-red-500/30'}`}>
                   <div className="col-span-2 flex justify-between items-center border-b border-white/5 pb-2">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_parental_available ? 'text-orange-500' : 'text-gray-500'}`}>CONTA PARENTAL</span>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <span className={`text-[8px] font-black uppercase ${formData.is_parental_available ? 'text-[var(--neon-green)]' : 'text-red-500'}`}>
                           {formData.is_parental_available ? 'EM ESTOQUE' : 'ESGOTADO'}
                        </span>
                        <div className="relative inline-flex items-center">
                           <input type="checkbox" className="sr-only peer" checked={formData.is_parental_available} onChange={e => setFormData({...formData, is_parental_available: e.target.checked})} />
                           <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--neon-green)]"></div>
                        </div>
                     </label>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO ORIGINAL</label>
                      <input type="number" step="0.01" value={formData.original_price_parental} onChange={e => setFormData({...formData, original_price_parental: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white disabled:opacity-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO VENDA</label>
                      <input type="number" step="0.01" value={formData.current_price_parental} onChange={e => setFormData({...formData, current_price_parental: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-[var(--neon-green)] font-bold disabled:opacity-50" />
                   </div>
                </div>

                <div className={`grid grid-cols-2 gap-6 p-6 rounded-3xl border transition-colors ${formData.is_exclusive_available ? 'bg-white/5 border-white/5' : 'bg-red-900/10 border-red-500/30'}`}>
                   <div className="col-span-2 flex justify-between items-center border-b border-white/5 pb-2">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_exclusive_available ? 'text-blue-500' : 'text-gray-500'}`}>CONTA EXCLUSIVA</span>
                     <label className="flex items-center gap-2 cursor-pointer">
                        <span className={`text-[8px] font-black uppercase ${formData.is_exclusive_available ? 'text-[var(--neon-green)]' : 'text-red-500'}`}>
                           {formData.is_exclusive_available ? 'EM ESTOQUE' : 'ESGOTADO'}
                        </span>
                        <div className="relative inline-flex items-center">
                           <input type="checkbox" className="sr-only peer" checked={formData.is_exclusive_available} onChange={e => setFormData({...formData, is_exclusive_available: e.target.checked})} />
                           <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                        </div>
                     </label>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO ORIGINAL</label>
                      <input type="number" step="0.01" value={formData.original_price_exclusive} onChange={e => setFormData({...formData, original_price_exclusive: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white disabled:opacity-50" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO VENDA</label>
                      <input type="number" step="0.01" value={formData.current_price_exclusive} onChange={e => setFormData({...formData, current_price_exclusive: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-[var(--neon-green)] font-bold disabled:opacity-50" />
                   </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                 <div className="col-span-2 text-[10px] font-black text-[var(--neon-green)] uppercase tracking-widest border-b border-white/5 pb-2">
                   {formData.category === 'gamepass' ? 'CONFIGURAÇÃO GAME PASS' : 'CONFIGURAÇÃO PRÉ-VENDA'}
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO ORIGINAL</label>
                    <input type="number" step="0.01" value={formData.original_price} onChange={e => setFormData({...formData, original_price: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO VENDA</label>
                    <input type="number" step="0.01" value={formData.current_price} onChange={e => setFormData({...formData, current_price: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-[var(--neon-green)] font-bold" />
                 </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase">URL DA IMAGEM</label>
              <input required type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                 <label className="text-[10px] font-black text-gray-500 uppercase">DESCRIÇÃO</label>
                 <button 
                   type="button" 
                   onClick={handleGenerateDescription}
                   disabled={descLoading || !formData.title}
                   className="flex items-center gap-1 text-[8px] font-black text-[var(--neon-green)] uppercase hover:text-white transition-colors disabled:opacity-50"
                 >
                   {descLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                   GERAR COM IA
                 </button>
              </div>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
            </div>
            
            <div className="flex items-center gap-6 p-4 bg-white/5 rounded-2xl">
               <div className="flex items-center gap-3">
                 <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-[var(--neon-green)]" />
                 <label className="text-[10px] font-black text-gray-500 uppercase">DESTACAR</label>
               </div>
               <div className="h-6 w-px bg-white/10"></div>
               <div className="flex items-center gap-3">
                 <input type="checkbox" checked={formData.is_available} onChange={e => setFormData({...formData, is_available: e.target.checked})} className="w-5 h-5 accent-blue-500" />
                 <label className="text-[10px] font-black text-white uppercase">PRODUTO EM ESTOQUE</label>
               </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-[var(--neon-green)] text-black py-6 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg flex items-center justify-center gap-3">
            <Save /> SALVAR PRODUTO
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;

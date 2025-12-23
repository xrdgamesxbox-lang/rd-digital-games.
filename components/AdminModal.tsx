
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Save, Zap, Gamepad2, Layers, Rocket, Search, Globe } from 'lucide-react';
import { Game } from '../types.ts';
import { searchGameData } from '../services/geminiService.ts';

interface AdminModalProps {
  onClose: () => void;
  onSave: (game: Omit<Game, 'id'>) => void;
  initialData?: Game | null;
}

const AdminModal: React.FC<AdminModalProps> = ({ onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        current_price: initialData.current_price || 0
      });
    }
  }, [initialData]);

  const handleSearchProcess = async () => {
    if (!searchQuery.trim()) {
      alert('Digite o nome do jogo ou cole um link!');
      return;
    }
    setLoading(true);
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
      } else {
        alert("Não conseguimos encontrar dados automáticos. Tente ser mais específico no nome do jogo.");
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao pesquisar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload: any = {
      title: String(formData.title).trim(),
      description: String(formData.description).trim(),
      image_url: String(formData.image_url).trim(),
      is_featured: Boolean(formData.is_featured),
      platform: formData.platform,
      category: formData.category
    };
    
    if (formData.category === 'jogo') {
      payload.original_price_parental = Number(formData.original_price_parental) || 0;
      payload.current_price_parental = Number(formData.current_price_parental) || 0;
      payload.original_price_exclusive = Number(formData.original_price_exclusive) || 0;
      payload.current_price_exclusive = Number(formData.current_price_exclusive) || 0;
      payload.original_price = null;
      payload.current_price = null;
      payload.plan_duration = null;
    } else if (formData.category === 'gamepass') {
      payload.original_price = Number(formData.original_price) || 0;
      payload.current_price = Number(formData.current_price) || 0;
      payload.plan_duration = formData.plan_duration;
      payload.original_price_parental = null;
      payload.current_price_parental = null;
      payload.original_price_exclusive = null;
      payload.current_price_exclusive = null;
    } else {
      payload.original_price = Number(formData.original_price) || 0;
      payload.current_price = Number(formData.current_price) || 0;
      payload.original_price_parental = null;
      payload.current_price_parental = null;
      payload.original_price_exclusive = null;
      payload.current_price_exclusive = null;
      payload.plan_duration = null;
    }

    onSave(payload);
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
                    placeholder="Digite o nome do jogo (ex: Elden Ring) ou cole o link..." 
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
            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter">A IA buscará automaticamente a capa oficial, descrição e preços médios na web.</p>
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
                <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                   <div className="col-span-2 text-[10px] font-black text-orange-500 uppercase tracking-widest border-b border-white/5 pb-2">CONTA PARENTAL</div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO ORIGINAL</label>
                      <input type="number" step="0.01" value={formData.original_price_parental} onChange={e => setFormData({...formData, original_price_parental: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO VENDA</label>
                      <input type="number" step="0.01" value={formData.current_price_parental} onChange={e => setFormData({...formData, current_price_parental: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-[var(--neon-green)] font-bold" />
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                   <div className="col-span-2 text-[10px] font-black text-blue-500 uppercase tracking-widest border-b border-white/5 pb-2">CONTA EXCLUSIVA</div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO ORIGINAL</label>
                      <input type="number" step="0.01" value={formData.original_price_exclusive} onChange={e => setFormData({...formData, original_price_exclusive: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-black text-gray-500 uppercase">PREÇO VENDA</label>
                      <input type="number" step="0.01" value={formData.current_price_exclusive} onChange={e => setFormData({...formData, current_price_exclusive: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-[var(--neon-green)] font-bold" />
                   </div>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 rounded-3xl border border-white/5">
                 <div className="col-span-2 text-[10px] font-black text-[var(--neon-green)] uppercase tracking-widest border-b border-white/5 pb-2">
                   {formData.category === 'gamepass' ? 'CONFIGURAÇÃO GAME PASS' : 'CONFIGURAÇÃO PRÉ-VENDA'}
                 </div>
                 {formData.category === 'gamepass' && (
                    <div className="col-span-2 space-y-2 mb-4">
                      <label className="text-[9px] font-black text-gray-500 uppercase">DURAÇÃO DO PLANO</label>
                      <select value={formData.plan_duration} onChange={e => setFormData({...formData, plan_duration: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white">
                        <option value="1">1 Mês</option>
                        <option value="3">3 Meses</option>
                        <option value="6">6 Meses</option>
                        <option value="12">12 Meses</option>
                      </select>
                    </div>
                 )}
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
              <div className="relative">
                <input required type="text" value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs pr-12" />
                {formData.image_url && <img src={formData.image_url} className="absolute right-2 top-2 w-8 h-8 rounded object-cover border border-white/20" alt="Preview" />}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase">DESCRIÇÃO</label>
              <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-xs" />
            </div>
            
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={formData.is_featured} onChange={e => setFormData({...formData, is_featured: e.target.checked})} className="w-5 h-5 accent-[var(--neon-green)]" />
              <label className="text-[10px] font-black text-gray-500 uppercase">DESTACAR NA VITRINE SUPERIOR</label>
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

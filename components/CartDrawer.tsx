
import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, QrCode, Copy, CheckCircle, ArrowRight, Zap, MessageCircle, Loader2, CreditCard, Wallet, AlertTriangle, RefreshCcw, Check } from 'lucide-react';
import { CartItem } from '../types.ts';
import { supabase } from '../services/supabaseClient.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onRemove: (cartId: string) => void;
  onClear: () => void;
  siteSettings: any;
  customerEmail?: string;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, items, onRemove, onClear, siteSettings, customerEmail }) => {
  // 'method_selection' removido do fluxo principal, agora integrado em 'cart'
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'pix_instructions' | 'stripe_process' | 'success'>('cart');
  const [copied, setCopied] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [dbError, setDbError] = useState<{message: string, hint?: string} | null>(null);

  const total = items.reduce((acc, item) => acc + item.price, 0);

  const generatePixCode = () => {
    const amount = total.toFixed(2);
    const key = siteSettings.pix_key?.trim() || 'rodrigooportunidades20@gmail.com';
    const name = siteSettings.pix_name?.substring(0, 25).toUpperCase().trim() || 'RD DIGITAL';
    const city = "SAO PAULO";
    
    const payload = [
      "000201",
      `26${(30 + key.length).toString().padStart(2, '0')}0014BR.GOV.BCB.PIX01${key.length.toString().padStart(2, '0')}${key}`,
      "52040000",
      "5303986",
      `54${amount.length.toString().padStart(2, '0')}${amount}`,
      "5802BR",
      `59${name.length.toString().padStart(2, '0')}${name}`,
      `60${city.length.toString().padStart(2, '0')}${city}`,
      "62070503***",
      "6304"
    ].join('');

    function getCRC16(data: string) {
      let crc = 0xFFFF;
      for (let i = 0; i < data.length; i++) {
        crc ^= data.charCodeAt(i) << 8;
        for (let j = 0; j < 8; j++) {
          if ((crc & 0x8000) !== 0) crc = (crc << 1) ^ 0x1021;
          else crc <<= 1;
        }
      }
      return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
    }

    const finalPix = payload + getCRC16(payload);
    setPixPayload(finalPix);
  };

  const handleStripeCheckout = async () => {
    setIsFinishing(true);
    setDbError(null);
    setCheckoutStep('stripe_process');
    
    try {
      const { data, error } = await supabase.functions.invoke('stripe-checkout', {
        body: { 
          items: items, 
          customer_email: customerEmail || 'Visitante',
          success_url: window.location.origin + '/?success=true',
          cancel_url: window.location.origin + '/?cancel=true'
        }
      });

      if (error) {
        let errorMsg = "Erro na comunicação com o servidor de pagamentos.";
        try {
          const context = (error as any).context;
          if (context && typeof context.json === 'function') {
            const body = await context.json();
            errorMsg = body.message || body.error || error.message;
          } else {
            errorMsg = error.message;
          }
        } catch (e) {
          errorMsg = error.message;
        }
        throw new Error(errorMsg);
      }

      if (!data?.url) throw new Error("A Stripe não retornou uma URL de checkout.");

      await supabase.from('sales').insert([{
        items: items,
        total_amount: total,
        status: 'pendente',
        payment_method: 'stripe',
        customer_email: customerEmail || 'Visitante'
      }]);

      const redirectLink = document.createElement('a');
      redirectLink.href = data.url;
      redirectLink.target = '_top';
      document.body.appendChild(redirectLink);
      redirectLink.click();
      
      setTimeout(() => {
        window.location.href = data.url;
      }, 500);

    } catch (e: any) {
      console.error("Checkout Error:", e);
      let msg = e.message;
      
      if (msg.includes("CONFIG_REQUIRED") || msg.includes("STRIPE_SECRET_KEY")) {
        msg = "ERRO DE CONFIGURAÇÃO: O administrador precisa adicionar a 'STRIPE_SECRET_KEY' no painel do Supabase (Edge Functions > Secrets).";
      }

      setDbError({ message: msg });
      setIsFinishing(false);
      setCheckoutStep('cart');
    }
  };

  const handlePixSelection = async () => {
    setIsFinishing(true);
    setDbError(null);
    try {
      const { error } = await supabase.from('sales').insert([{
        items: items,
        total_amount: total,
        status: 'pendente',
        payment_method: 'pix',
        customer_email: customerEmail || 'Visitante'
      }]);
      
      if (error) {
        setDbError({ message: error.message, hint: error.hint });
        setIsFinishing(false);
        return;
      }
      setCheckoutStep('pix_instructions');
    } catch (e: any) {
      setDbError({ message: "Erro de conexão com o banco de dados." });
    } finally {
      setIsFinishing(false);
    }
  };

  const handleCardWhatsapp = () => {
    const message = encodeURIComponent(
      `Olá RD Digital! 💳\n\nGostaria de finalizar meu pedido via *LINK DE PAGAMENTO (Cartão)*.\n\n` +
      `*Itens do Pedido:*\n` +
      items.map(item => `▪️ ${item.title} (${item.accountType}) - R$ ${item.price.toFixed(2)}`).join('\n') +
      `\n\n*Valor Total:* R$ ${total.toFixed(2)}\n` +
      `*Email de Cadastro:* ${customerEmail || 'Não informado'}\n\n` +
      `Aguardo o link para pagamento!`
    );
    window.open(`https://wa.me/${siteSettings.whatsapp_number}?text=${message}`, '_blank');
  };

  useEffect(() => {
    if (checkoutStep === 'pix_instructions') {
      generatePixCode();
    }
  }, [checkoutStep, total]);

  const copyPixKey = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Olá RD Digital! Acabei de fazer um PIX de R$ ${total.toFixed(2).replace('.', ',')} referente aos jogos:\n\n` +
      items.map(item => `- ${item.title} (${item.accountType})`).join('\n') +
      `\n\nMeu e-mail: ${customerEmail || 'Não informado'}` +
      `\n\nSegue o comprovante em anexo:`
    );
    window.open(`https://wa.me/${siteSettings.whatsapp_number}?text=${message}`, '_blank');
    onClear();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-[#070709] border-l border-white/5 shadow-2xl transition-transform duration-500 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black uppercase italic text-white">
            {checkoutStep === 'cart' ? (siteSettings.cart_title || 'Seu Carrinho') : 
             checkoutStep === 'pix_instructions' ? 'Pagamento PIX' : 
             checkoutStep === 'success' ? 'Pedido Confirmado' : 
             checkoutStep === 'stripe_process' ? 'Redirecionando...' : 'Conectando...'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-gray-500"><X /></button>
        </div>

        <div className="flex-grow overflow-y-auto p-8 custom-scrollbar">
          {dbError && (
            <div className="mb-6 p-6 bg-red-600/10 border border-red-600/20 rounded-[2rem] space-y-3">
               <div className="flex items-center gap-3 text-red-500">
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                  <h4 className="text-[11px] font-black uppercase italic tracking-widest">FALHA NO CHECKOUT</h4>
               </div>
               <p className="text-[10px] text-gray-300 font-bold uppercase leading-relaxed">{dbError.message}</p>
               <button onClick={() => setDbError(null)} className="flex items-center gap-2 text-[9px] font-black text-red-500 uppercase">
                  <RefreshCcw className="w-3 h-3" /> Tentar Novamente
               </button>
            </div>
          )}

          {checkoutStep === 'success' ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-8 animate-bounce-in">
               <div className="w-24 h-24 bg-[var(--neon-green)] rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_var(--neon-glow)] rotate-6">
                  <Check className="w-12 h-12 text-black stroke-[4]" />
               </div>
               <div className="space-y-4">
                  <h3 className="text-3xl font-black italic uppercase text-white tracking-tighter">SUCESSO!</h3>
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed px-8">Seu pedido foi registrado em nosso sistema. Agora é só aguardar o contato ou pagar via PIX.</p>
               </div>
               <button onClick={() => { onClear(); onClose(); }} className="w-full bg-white/5 text-white py-6 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em]">CONCLUIR</button>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <ShoppingBag className="w-16 h-16 mb-4" />
              <p className="text-[10px] font-black uppercase tracking-widest">{siteSettings.cart_empty_text || 'Carrinho Vazio'}</p>
            </div>
          ) : (
            <>
              {checkoutStep === 'cart' && (
                <div className="space-y-8">
                  {/* LISTA DE PRODUTOS */}
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.cartId} className="flex gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                        <img src={item.image_url} alt={item.title} className="w-16 h-20 rounded-xl object-cover" />
                        <div className="flex-grow">
                          <h4 className="text-[11px] font-black text-white uppercase italic line-clamp-1">{item.title}</h4>
                          <p className="text-[var(--neon-green)] font-black text-sm mt-2">R$ {item.price.toFixed(2).replace('.', ',')}</p>
                          <p className="text-[8px] text-gray-500 font-black uppercase tracking-widest mt-1">{item.accountType}</p>
                        </div>
                        <button onClick={() => onRemove(item.cartId)} className="text-gray-600 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>

                  {/* OPÇÕES DE PAGAMENTO (INTEGRADAS AO CARRINHO) */}
                  <div className="pt-4 border-t border-white/5 space-y-4 animate-bounce-in">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mb-4 text-center">ESCOLHA O PAGAMENTO</p>
                    
                    {siteSettings.enable_pix === 'true' && (
                      <button onClick={handlePixSelection} className="w-full bg-white/5 border border-white/10 p-6 rounded-[2rem] flex items-center gap-5 group hover:border-[var(--neon-green)]/40 transition-all hover:bg-white/10">
                         <div className="bg-[var(--neon-green)]/10 p-3 rounded-xl group-hover:bg-[var(--neon-green)] transition-colors">
                            <Wallet className="w-6 h-6 text-[var(--neon-green)] group-hover:text-black" />
                         </div>
                         <div className="text-left">
                            <h4 className="text-white font-black text-xs italic uppercase">PIX MANUAL</h4>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Aprovação Imediata</p>
                         </div>
                      </button>
                    )}

                    {siteSettings.enable_stripe === 'true' && (
                      <button onClick={handleStripeCheckout} className="w-full bg-blue-600/5 border border-blue-500/10 p-6 rounded-[2rem] flex items-center gap-5 group hover:border-blue-500/40 transition-all hover:bg-blue-600/10">
                         <div className="bg-blue-600/10 p-3 rounded-xl group-hover:bg-blue-600 transition-colors">
                            <CreditCard className="w-6 h-6 text-blue-500 group-hover:text-white" />
                         </div>
                         <div className="text-left">
                            <h4 className="text-white font-black text-xs italic uppercase">CARTÃO DE CRÉDITO</h4>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Automático via Stripe</p>
                         </div>
                      </button>
                    )}

                    {siteSettings.enable_card_whatsapp === 'true' && (
                      <button onClick={handleCardWhatsapp} className="w-full bg-purple-600/5 border border-purple-500/10 p-6 rounded-[2rem] flex items-center gap-5 group hover:border-purple-500/40 transition-all hover:bg-purple-600/10">
                         <div className="bg-purple-600/10 p-3 rounded-xl group-hover:bg-purple-600 transition-colors">
                            <MessageCircle className="w-6 h-6 text-purple-500 group-hover:text-white" />
                         </div>
                         <div className="text-left">
                            <h4 className="text-white font-black text-xs italic uppercase">CARTÃO VIA WHATSAPP</h4>
                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Link de Pagamento</p>
                         </div>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {checkoutStep === 'stripe_process' && (
                <div className="h-full flex flex-col items-center justify-center space-y-6">
                   <div className="relative">
                      <Loader2 className="w-20 h-20 text-blue-500 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                         <CreditCard className="w-8 h-8 text-blue-500" />
                      </div>
                   </div>
                   <div className="text-center">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Iniciando Stripe Checkout...</p>
                      <p className="text-[8px] text-gray-500 font-bold uppercase mt-2">Você será levado para o ambiente seguro da Stripe.</p>
                   </div>
                </div>
              )}

              {checkoutStep === 'pix_instructions' && (
                <div className="space-y-8 animate-bounce-in">
                  <div className="bg-white p-6 rounded-[3rem] text-center space-y-4 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
                     <p className="text-[9px] text-black font-black uppercase tracking-widest">Escaneie para Pagar</p>
                     <div className="aspect-square w-full max-w-[200px] mx-auto bg-white flex items-center justify-center">
                        {pixPayload ? (
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(pixPayload)}`} 
                            alt="QR Code PIX" 
                            className="w-full h-full"
                          />
                        ) : (
                          <Loader2 className="w-8 h-8 animate-spin text-black" />
                        )}
                     </div>
                     <div className="space-y-1">
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Valor do Pedido</p>
                        <div className="text-3xl font-black text-black italic">
                           R$ {total.toFixed(2).replace('.', ',')}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="bg-black border border-white/5 p-6 rounded-[2rem] space-y-4">
                        <div className="flex justify-between items-center text-[9px] font-black text-gray-500 uppercase tracking-widest">
                           <span>Copia e Cola</span>
                           <span className="text-white">RD DIGITAL</span>
                        </div>
                        <div className="flex gap-3">
                           <div className="flex-grow bg-white/5 p-4 rounded-xl text-[8px] text-white font-mono break-all border border-white/5 line-clamp-2">
                              {pixPayload || "Gerando código..."}
                           </div>
                           <button onClick={copyPixKey} className="p-4 bg-[var(--neon-green)] rounded-xl text-black transition-all active:scale-90 flex-shrink-0">
                              {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                           </button>
                        </div>
                     </div>

                     <div className="bg-blue-600/10 border border-blue-500/20 p-8 rounded-[2.5rem] space-y-4">
                        <div className="flex items-center gap-3 text-blue-500">
                           <MessageCircle className="w-6 h-6" />
                           <h4 className="text-[10px] font-black uppercase tracking-widest">ENVIO DE COMPROVANTE</h4>
                        </div>
                        <p className="text-[9px] text-gray-400 font-bold uppercase leading-relaxed">
                           Envie o comprovante agora para liberação imediata da sua conta.
                        </p>
                        <button onClick={openWhatsApp} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 shadow-lg hover:scale-[1.02] transition-transform">
                           ENVIAR AGORA <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {items.length > 0 && checkoutStep !== 'success' && checkoutStep !== 'stripe_process' && (
          <div className="p-8 border-t border-white/5 bg-black/40 space-y-6">
            <div className="flex justify-between items-end">
              <span className="text-[10px] font-black text-gray-500 uppercase">Total do Pedido</span>
              <span className="text-3xl font-black text-white italic">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            
            {/* O botão "PAGAR AGORA" foi removido pois as opções de pagamento já estão visíveis */}
            {/* Adicionamos um botão de "Voltar" apenas se estivermos em etapas secundárias, mas agora o fluxo é direto */}
            {checkoutStep !== 'cart' && (
              <button 
                onClick={() => setCheckoutStep('cart')}
                className="w-full bg-white/5 text-gray-500 py-6 rounded-[2.5rem] font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors"
              >
                VOLTAR AO PEDIDO
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;

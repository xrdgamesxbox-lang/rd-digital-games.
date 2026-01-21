import React, { useEffect } from 'react';
import { ArrowLeft, CheckCircle, HelpCircle, MessageCircle, ShieldCheck, Zap } from 'lucide-react';

interface GamePassSEOProps {
  onClose: () => void;
  whatsappNumber: string;
}

const GamePassSEO: React.FC<GamePassSEOProps> = ({ onClose, whatsappNumber }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Comprar Game Pass Ultimate Barato e Confiável | RD Digital Games";
    
    // Meta description dinâmica para SEO
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'Garanta sua assinatura Game Pass Ultimate com o melhor preço do Brasil. Ativação rápida, suporte via WhatsApp e acesso a centenas de jogos no Xbox e PC.');
    }
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#070709] overflow-y-auto custom-scrollbar animate-bounce-in">
      <div className="sticky top-0 z-50 bg-[#070709]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-2 text-white hover:text-[var(--neon-green)] transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">VOLTAR PARA A LOJA</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:block">BLOG & INFO</span>
      </div>

      <article className="max-w-4xl mx-auto p-8 md:p-12 pb-32 text-gray-300">
        
        {/* HEADER SEO */}
        <header className="text-center mb-16 space-y-6">
           <h1 className="text-3xl md:text-5xl font-black uppercase italic text-white tracking-tighter leading-tight">
             Game Pass Ultimate <span className="text-[var(--neon-green)]">Barato e Confiável</span>
           </h1>
           <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto font-medium">
             A solução definitiva para ter acesso a centenas de jogos no Xbox e PC com economia e segurança.
           </p>
        </header>

        <div className="space-y-16">
          
          {/* INTRODUÇÃO */}
          <section className="bg-white/5 border border-white/5 p-8 md:p-10 rounded-[2.5rem] space-y-6">
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter flex items-center gap-3">
              <Zap className="text-[var(--neon-green)] w-6 h-6" /> O que é o Game Pass Ultimate?
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed text-gray-300">
              <p>
                O <strong>Game Pass Ultimate</strong> é amplamente considerado o melhor serviço de assinatura de jogos do mundo. Ao optar por essa modalidade, você não está apenas alugando jogos; você está garantindo acesso a uma biblioteca rotativa com mais de 400 títulos de alta qualidade.
              </p>
              <p>
                Muitos jogadores buscam formas de <strong>comprar game pass barato</strong> sem comprometer a segurança da sua conta. Nossa loja oferece exatamente isso: uma alternativa econômica e segura para você desfrutar de lançamentos no dia da estreia (Day One), acesso ao EA Play e todos os benefícios da Live Gold (agora Game Pass Core), incluindo o modo multijogador online.
              </p>
              <p>
                Seja você um jogador casual ou hardcore, a <strong>assinatura Game Pass</strong> unifica o ecossistema da Microsoft, permitindo que você jogue no console <strong>Game Pass Xbox</strong>, no PC com Windows e até mesmo em dispositivos móveis através do Cloud Gaming.
              </p>
            </div>
          </section>

          {/* VANTAGENS E SEGURANÇA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <section className="bg-blue-900/10 border border-blue-500/20 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-xl font-black text-blue-400 uppercase italic tracking-tighter flex items-center gap-2">
                <CheckCircle className="w-5 h-5" /> Vantagens Exclusivas
              </h3>
              <ul className="space-y-4 text-sm text-gray-300">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Biblioteca Gigante:</strong> Acesso a franquias icônicas como Halo, Forza, Gears of War e Bethesda no lançamento.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Cloud Gaming:</strong> Jogue títulos pesados do <strong>Game Pass Xbox</strong> direto no seu celular ou TV, sem precisar baixar nada.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span><strong>Economia Real:</strong> Ao invés de pagar R$ 300 em um lançamento, você joga o mesmo título com sua assinatura ativa.</span>
                </li>
              </ul>
            </section>

            <section className="bg-[var(--neon-green)]/5 border border-[var(--neon-green)]/20 p-8 rounded-[2.5rem] space-y-6">
              <h3 className="text-xl font-black text-[var(--neon-green)] uppercase italic tracking-tighter flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Compra Segura
              </h3>
              <div className="space-y-4 text-sm leading-relaxed text-gray-300">
                <p>
                  A maior dúvida dos clientes é: "É seguro?". Sim! Nós trabalhamos com licenciamento legítimo. Ao adquirir seu acesso conosco, você recebe um <strong>Game Pass original</strong> e funcional.
                </p>
                <p>
                  Diferente de métodos duvidosos que comprometem seu console, nosso método envolve o compartilhamento de licenças (Conta Parental) ou contas exclusivas, um recurso nativo do ecossistema Xbox que permite o uso legal de jogos digitais.
                </p>
                <p>
                  Nossa equipe de suporte via WhatsApp acompanha todo o processo de ativação, garantindo que você comece a jogar em minutos após a confirmação do pagamento.
                </p>
              </div>
            </section>
          </div>

          {/* FAQ - PERGUNTAS FREQUENTES */}
          <section className="space-y-8">
            <h2 className="text-3xl font-black text-center text-white uppercase italic tracking-tighter">Perguntas Frequentes</h2>
            
            <div className="grid gap-4">
              <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-3xl hover:border-[var(--neon-green)]/30 transition-colors">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-500" /> O acesso é original?
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Sim. Trabalhamos apenas com licenças originais adquiridas na loja oficial. Você terá acesso a um <strong>Game Pass original</strong>, garantindo atualizações, conquistas e jogabilidade online sem riscos de banimento por pirataria.
                </p>
              </div>

              <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-3xl hover:border-[var(--neon-green)]/30 transition-colors">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-500" /> Funciona no PC e no Xbox?
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  A assinatura Ultimate engloba benefícios tanto para console quanto para computador. No entanto, verifique no momento da compra a modalidade específica (Parental ou Exclusiva) para garantir a compatibilidade correta com seu dispositivo preferido.
                </p>
              </div>

              <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-3xl hover:border-[var(--neon-green)]/30 transition-colors">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-500" /> Como recebo meu acesso?
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Após a confirmação do pagamento, nossa equipe envia as credenciais de acesso e um tutorial passo a passo diretamente no seu WhatsApp ou E-mail. O processo é simples e rápido.
                </p>
              </div>

              <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-3xl hover:border-[var(--neon-green)]/30 transition-colors">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-500" /> Tem fidelidade ou renovação automática?
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Não! Você paga apenas pelo período contratado (1, 3, 6 ou 12 meses). Não há cobranças surpresa no seu cartão de crédito e você tem total liberdade para renovar quando quiser.
                </p>
              </div>

              <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-3xl hover:border-[var(--neon-green)]/30 transition-colors">
                <h3 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-gray-500" /> O que fazer se eu precisar de ajuda?
                </h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Nós nos orgulhamos do nosso pós-venda. Diferente de grandes marketplaces, temos um suporte humanizado via WhatsApp pronto para tirar qualquer dúvida sobre a instalação ou uso da sua assinatura.
                </p>
              </div>
            </div>
          </section>

          {/* CTA FINAL */}
          <div className="bg-[var(--neon-green)] p-8 md:p-12 rounded-[3rem] text-center space-y-6 shadow-[0_0_60px_rgba(204,255,0,0.2)]">
             <h2 className="text-2xl md:text-4xl font-black uppercase italic text-black tracking-tighter">
               Não perca mais tempo e dinheiro!
             </h2>
             <p className="text-black/80 font-bold text-sm md:text-base max-w-xl mx-auto">
               Junte-se a milhares de clientes satisfeitos e comece a jogar hoje mesmo.
             </p>
             <button 
               onClick={() => {
                 const msg = encodeURIComponent("Olá! Li sobre o Game Pass no site e quero assinar agora.");
                 window.open(`https://wa.me/${whatsappNumber}?text=${msg}`, '_blank');
               }}
               className="bg-black text-white px-10 py-5 rounded-2xl font-black uppercase text-xs md:text-sm tracking-widest hover:scale-105 transition-transform flex items-center justify-center gap-3 mx-auto shadow-xl"
             >
               <MessageCircle className="w-5 h-5" /> Compre agora seu Game Pass Ultimate
             </button>
             <p className="text-[10px] font-black uppercase tracking-widest text-black/60">
               Ativação rápida e suporte no WhatsApp
             </p>
          </div>

        </div>
      </article>
    </div>
  );
};

export default GamePassSEO;
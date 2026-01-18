
import React, { useEffect } from 'react';
import { ArrowLeft, ShieldAlert, CheckCircle, XCircle, HelpCircle, Lock } from 'lucide-react';

interface RefundPolicyProps {
  onClose: () => void;
}

const RefundPolicy: React.FC<RefundPolicyProps> = ({ onClose }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-[#070709] overflow-y-auto custom-scrollbar animate-bounce-in">
      <div className="sticky top-0 z-50 bg-[#070709]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button onClick={onClose} className="flex items-center gap-2 text-white hover:text-[var(--neon-green)] transition-colors">
          <ArrowLeft className="w-5 h-5" /> <span className="text-xs font-black uppercase tracking-widest">VOLTAR PARA A LOJA</span>
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 hidden md:block">TERMOS LEGAIS</span>
      </div>

      <div className="max-w-4xl mx-auto p-8 md:p-12 pb-32 text-gray-300">
        <div className="text-center mb-16 space-y-4">
           <div className="w-20 h-20 bg-[var(--neon-green)]/10 rounded-3xl flex items-center justify-center mx-auto border border-[var(--neon-green)]/20">
              <ShieldAlert className="w-10 h-10 text-[var(--neon-green)]" />
           </div>
           <h1 className="text-3xl md:text-5xl font-black uppercase italic text-white tracking-tighter">Política de Reembolso</h1>
           <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">Produtos Digitais & Licenciamento de Software</p>
        </div>

        <div className="space-y-12">
          
          {/* SEÇÃO 1: NATUREZA DO PRODUTO */}
          <section className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
            <h2 className="text-xl font-black text-white uppercase italic mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-500" /> 1. Natureza do Produto Digital
            </h2>
            <p className="leading-relaxed text-sm mb-4">
              A RD Digital Games comercializa licenças digitais e credenciais de acesso para jogos de console (Xbox). 
              Diferente de produtos físicos, os produtos digitais são considerados consumidos no momento em que a informação 
              de acesso (login/senha ou chave de 25 dígitos) é visualizada, enviada ou inserida no console do usuário.
            </p>
            <div className="bg-blue-600/10 border border-blue-500/20 p-4 rounded-xl text-xs text-blue-200 font-bold uppercase tracking-wide">
              O Código de Defesa do Consumidor (Art. 49) prevê o direito de arrependimento, porém, a jurisprudência entende que este direito é mitigado quando o produto digital já foi utilizado ou acessado, impossibilitando sua "devolução" intacta.
            </div>
          </section>

          {/* SEÇÃO 2: A REGRA DO CONSOLE */}
          <section className="bg-red-900/10 border border-red-500/20 p-8 rounded-[2rem]">
            <h2 className="text-xl font-black text-red-500 uppercase italic mb-4 flex items-center gap-2">
              <XCircle className="w-5 h-5" /> 2. Quando o Reembolso NÃO é Possível
            </h2>
            <p className="leading-relaxed text-sm mb-4">
              Devido à impossibilidade técnica de "desfazer" o acesso após ele ter sido vinculado ao hardware do cliente, 
              <strong> NÃO realizamos reembolsos ou trocas nas seguintes situações:</strong>
            </p>
            <ul className="space-y-3 mt-4">
              <li className="flex gap-3 items-start bg-black/20 p-3 rounded-xl">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Após a inserção no Console:</strong> Se você recebeu o login/senha e realizou o procedimento de login no seu Xbox, o produto é considerado "usado". O sistema registra o acesso e vincula a licença.</span>
              </li>
              <li className="flex gap-3 items-start bg-black/20 p-3 rounded-xl">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Arrependimento após o envio:</strong> Se as credenciais já foram enviadas para seu e-mail ou WhatsApp e estão funcionais.</span>
              </li>
              <li className="flex gap-3 items-start bg-black/20 p-3 rounded-xl">
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Incompatibilidade ou Erro de Compra:</strong> Compras de jogos errados ou para plataformas incompatíveis (ex: comprar versão Series X|S tendo um Xbox One) após o envio dos dados.</span>
              </li>
            </ul>
          </section>

          {/* SEÇÃO 3: QUANDO REEMBOLSAMOS */}
          <section className="bg-[var(--neon-green)]/5 border border-[var(--neon-green)]/20 p-8 rounded-[2rem]">
            <h2 className="text-xl font-black text-[var(--neon-green)] uppercase italic mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" /> 3. Elegibilidade para Reembolso
            </h2>
            <p className="leading-relaxed text-sm mb-4">
              Garantimos a satisfação do cliente e realizaremos o reembolso integral ou troca imediata nos seguintes casos, 
              <strong> desde que reportados em até 7 dias corridos e ANTES do uso efetivo:</strong>
            </p>
            <ul className="space-y-3 mt-4">
              <li className="flex gap-3 items-start bg-black/20 p-3 rounded-xl">
                <CheckCircle className="w-5 h-5 text-[var(--neon-green)] flex-shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Produto Esgotado:</strong> Comprou e não temos estoque para entrega imediata (opção de reembolso ou espera).</span>
              </li>
              <li className="flex gap-3 items-start bg-black/20 p-3 rounded-xl">
                <CheckCircle className="w-5 h-5 text-[var(--neon-green)] flex-shrink-0 mt-0.5" />
                <span className="text-sm"><strong>Defeito no Acesso (Pré-Login):</strong> Se o login/senha enviados estiverem incorretos e nosso suporte não conseguir restabelecer o acesso em até 24 horas.</span>
              </li>
            </ul>
          </section>

          {/* SEÇÃO 4: GARANTIA VITALÍCIA */}
          <section className="bg-white/5 border border-white/5 p-8 rounded-[2rem]">
            <h2 className="text-xl font-black text-white uppercase italic mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" /> 4. Garantia Vitalícia vs. Reembolso
            </h2>
            <p className="leading-relaxed text-sm">
              Não confunda <strong>Reembolso</strong> com <strong>Garantia</strong>. 
              <br /><br />
              Mesmo não sendo possível devolver o jogo após o uso, você tem <strong>GARANTIA VITALÍCIA</strong> (para Contas Primárias/Parentais) contra cadeados ou perda de acesso. 
              Se o jogo parar de funcionar por questões técnicas da conta, nós fornecemos suporte ou uma nova conta de reposição, mas não o estorno do valor pago, pois o produto já foi usufruído.
            </p>
          </section>

          {/* CONTATO */}
          <div className="text-center mt-12 pt-12 border-t border-white/5">
             <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Dúvidas sobre seu caso específico?</p>
             <button onClick={onClose} className="bg-white text-black px-8 py-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-[var(--neon-green)] transition-colors">
                Entendi, voltar à loja
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;

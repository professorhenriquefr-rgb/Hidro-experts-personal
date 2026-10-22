import React, { useState } from 'react';
import { AlertTriangle, HardDrive, Info, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export const PermanentNotice: React.FC = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <aside aria-label="Avisos do Sistema" className="bg-slate-900/95 border-b border-cyan-500/30 text-xs text-slate-300 px-4 py-2 sticky top-0 z-40 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 font-semibold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded border border-cyan-800">
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            Armazenamento Local
          </span>
          <span className="text-slate-300">
            Os dados ficam <strong>somente neste navegador</strong> e não sincronizam entre dispositivos.
          </span>
          <span className="hidden lg:inline text-slate-400">|</span>
          <span className="hidden lg:inline text-slate-400">
            Apoio profissional CREF — não substitui avaliação médica.
          </span>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 self-start md:self-auto cursor-pointer focus:outline-hidden"
          title="Ver diretrizes éticas e segurança da informação"
        >
          <Info className="w-3.5 h-3.5" />
          <span>{expanded ? 'Ocultar detalhes' : 'Termos & Segurança'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-slate-800 text-[11px] leading-relaxed text-slate-300 space-y-1.5 animate-fadeIn">
          <div className="flex items-start gap-2 bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white block font-medium">Responsabilidade Técnica e Limitação de Uso</strong>
              O HYDRO PERSONAL é uma ferramenta de apoio pedagógico e de planejamento para o profissional de Educação Física habilitado (CREF). Este software <strong>não é dispositivo médico</strong> nem realiza diagnósticos clínicos. A condução, monitoramento das respostas cardiovasculares e revisão das cargas no ambiente aquático são de exclusiva responsabilidade do profissional.
            </div>
          </div>
          <div className="flex items-start gap-2 bg-amber-950/40 p-2 rounded border border-amber-900/40 text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-300 block font-medium">Protocolo para Sinais de Alerta na Água</strong>
              Em caso de tontura, dor precordial, falta de ar desproporcional, cãibras severas ou qualquer sinal atípico, interrompa imediatamente a sessão aquática, retire o praticante com segurança da piscina e recomende encaminhamento a um serviço médico competente.
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

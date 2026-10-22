import React, { useRef } from 'react';
import {
  X,
  Printer,
  Sparkles,
  Waves,
  Award,
  Calendar,
  Activity,
  Heart,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Client, Evaluation, Appointment } from '../../types';

interface EvolutionCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  evaluations: Evaluation[];
  appointments: Appointment[];
}

export const EvolutionCardModal: React.FC<EvolutionCardModalProps> = ({
  isOpen,
  onClose,
  client,
  evaluations,
  appointments,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Filtrar dados do mês atual ou histórico geral do aluno
  const clientAppts = appointments.filter((a) => a.clientId === client.id);
  const presentCount = clientAppts.filter((a) => a.status === 'presente').length;
  const totalScheduled = clientAppts.filter((a) => a.status !== 'cancelada').length;
  const attendanceRate = totalScheduled > 0 ? Math.round((presentCount / totalScheduled) * 100) : 100;

  // Avaliações
  const sortedEvals = [...evaluations]
    .filter((e) => e.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentEval = sortedEvals[0];
  const previousEval = sortedEvals[1];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
          <div>
            <h2 className="text-lg font-bold text-white">Cartão de Evolução Aquática Mensal</h2>
            <p className="text-xs text-slate-400">
              Pronto para compartilhar no WhatsApp ou imprimir • Sem dados clínicos de saúde
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
              title="Imprimir / Salvar em PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Visual Card with Aquatic Theme */}
        <div
          ref={cardRef}
          className="mt-4 bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 border-2 border-cyan-400/60 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden print:border-black print:bg-white print:text-black print:p-4"
        >
          {/* Subtle Water Rings Background */}
          <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-blue-600/15 blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-cyan-500/30 print:border-black">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center font-black shadow-md shadow-cyan-400/20">
                <Waves className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-300 print:text-black">
                  HYDRO PERSONAL
                </span>
                <h3 className="text-xl font-black text-white print:text-black">
                  Cartão de Conquistas Aquáticas
                </h3>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] text-slate-300 print:text-slate-700 font-semibold block">
                Prof. Henrique Aquafitness
              </span>
              <span className="text-[10px] text-cyan-400 print:text-black">
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Client Info */}
          <div className="mt-4 p-3 rounded-2xl bg-slate-900/80 border border-cyan-500/20 print:bg-slate-50 print:border-slate-300 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Aluno(a):</span>
              <span className="text-lg font-black text-cyan-300 print:text-black">
                {client.nameOrNickname}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Foco da Prática:</span>
              <span className="text-xs font-bold text-slate-200 print:text-slate-800">
                {client.mainObjective}
              </span>
            </div>
          </div>

          {/* Metrics Overview */}
          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 print:border-slate-300 print:bg-white text-center">
              <Calendar className="w-4 h-4 text-cyan-400 mx-auto mb-1 print:text-black" />
              <span className="text-2xl font-black text-white print:text-black">{presentCount}</span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                Sessões Realizadas
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 print:border-slate-300 print:bg-white text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto mb-1 print:text-black" />
              <span className="text-2xl font-black text-emerald-400 print:text-black">
                {attendanceRate}%
              </span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                Frequência Aquática
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 print:border-slate-300 print:bg-white text-center">
              <Award className="w-4 h-4 text-amber-400 mx-auto mb-1 print:text-black" />
              <span className="text-2xl font-black text-amber-300 print:text-black">
                {currentEval ? `${currentEval.rpeBorgCR10}/10` : '—'}
              </span>
              <span className="text-[10px] text-slate-400 print:text-slate-600 block">
                Conforto no Esforço (Borg)
              </span>
            </div>
          </div>

          {/* Testes Aquáticos de Destaque */}
          {currentEval && currentEval.functionalTests.length > 0 && (
            <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 print:border-slate-300 print:bg-slate-50 space-y-2">
              <span className="text-xs font-bold text-cyan-300 print:text-black block">
                Adaptações e Testes Motores no Meio Líquido:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {currentEval.functionalTests.slice(0, 4).map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/70 border border-slate-800 print:bg-white print:border-slate-200">
                    <span className="text-slate-300 print:text-slate-700 truncate">{test.name}</span>
                    <span className="font-black text-cyan-300 print:text-black shrink-0">
                      {test.result} {test.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Professional Personal Remarks */}
          <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/60 border border-cyan-500/20 print:border-slate-300 print:bg-slate-50">
            <span className="text-xs font-bold text-cyan-300 print:text-black block mb-1">
              Comentário do Prof. Henrique Aquafitness:
            </span>
            <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed italic">
              "{currentEval?.professionalNotes || 'Parabéns pela dedicação e constância nos treinos aquáticos! O movimento na água é vida, leveza e longevidade.'}"
            </p>
          </div>

          {/* Card Footer */}
          <div className="mt-4 pt-3 border-t border-cyan-500/20 print:border-black flex items-center justify-between text-[10px] text-slate-400 print:text-slate-600">
            <span>HYDRO PERSONAL • Prof. Henrique Aquafitness</span>
            <span>Apoio ao planejamento esportivo (CREF)</span>
          </div>
        </div>

        {/* Action Buttons in Modal */}
        <div className="mt-4 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            Fechar
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
};

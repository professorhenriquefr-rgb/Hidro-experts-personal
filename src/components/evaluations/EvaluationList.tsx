import React, { useState } from 'react';
import { ClipboardList, PlusCircle, User, Calendar, Activity, ChevronRight } from 'lucide-react';
import { Evaluation, Client } from '../../types';
import { EvaluationCompareView } from './EvaluationCompareView';

interface EvaluationListProps {
  evaluations: Evaluation[];
  clients: Client[];
  onOpenNewEvaluation: (clientId?: string) => void;
}

export const EvaluationList: React.FC<EvaluationListProps> = ({
  evaluations,
  clients,
  onOpenNewEvaluation,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients[0]?.id || ''
  );

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const clientEvals = evaluations.filter((e) => e.clientId === selectedClientId);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Avaliações Aquáticas</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Histórico funcional, testes motores e acompanhamento comparativo com Borg CR10
          </p>
        </div>

        <button
          onClick={() => onOpenNewEvaluation(selectedClientId)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Nova Avaliação</span>
        </button>
      </div>

      {/* Client Selector for History */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <label className="block text-xs font-semibold text-slate-300 mb-2">
          Selecione o Aluno para visualizar histórico e comparativo:
        </label>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {clients.map((c) => {
            const isSelected = c.id === selectedClientId;
            const evalCount = evaluations.filter((e) => e.clientId === c.id).length;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedClientId(c.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-2 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <span>{c.nameOrNickname}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected ? 'bg-slate-950 text-cyan-300' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {evalCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedClient ? (
        <EvaluationCompareView
          client={selectedClient}
          evaluations={clientEvals}
          onOpenNewEvaluation={onOpenNewEvaluation}
        />
      ) : (
        <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 text-slate-400 text-xs">
          Nenhum aluno selecionado ou cadastrado.
        </div>
      )}
    </div>
  );
};

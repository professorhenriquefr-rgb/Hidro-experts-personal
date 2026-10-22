import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Heart,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { Evaluation, Client } from '../../types';

interface EvaluationCompareViewProps {
  client: Client;
  evaluations: Evaluation[];
  onOpenNewEvaluation: (clientId: string) => void;
}

export const EvaluationCompareView: React.FC<EvaluationCompareViewProps> = ({
  client,
  evaluations,
  onOpenNewEvaluation,
}) => {
  // Ordenadas da mais recente para a mais antiga
  const sortedEvals = [...evaluations].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const currentEval = sortedEvals[0];
  const previousEval = sortedEvals[1];

  if (!currentEval) {
    return (
      <div className="p-8 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
        <Activity className="w-10 h-10 text-slate-600 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-300">
          Nenhuma avaliação registrada para {client.nameOrNickname}
        </p>
        <button
          onClick={() => onOpenNewEvaluation(client.id)}
          className="mt-3 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
        >
          Realizar Primeira Avaliação
        </button>
      </div>
    );
  }

  // Comparação de Borg CR10
  const borgDelta = previousEval ? currentEval.rpeBorgCR10 - previousEval.rpeBorgCR10 : null;

  // Comparação dos testes funcionais coincidentes
  const testComparisons = currentEval.functionalTests.map((currTest) => {
    const prevTest = previousEval?.functionalTests.find(
      (t) => t.name.toLowerCase().trim() === currTest.name.toLowerCase().trim()
    );
    const currNum = parseFloat(String(currTest.result));
    const prevNum = prevTest ? parseFloat(String(prevTest.result)) : NaN;
    const hasNumericDelta = !isNaN(currNum) && !isNaN(prevNum);
    const delta = hasNumericDelta ? currNum - prevNum : null;

    return {
      name: currTest.name,
      unit: currTest.unit,
      current: currTest.result,
      previous: prevTest ? prevTest.result : null,
      delta,
    };
  });

  // Mini gráfico SVG simples para histórico de Borg ou testes
  const graphPoints = [...sortedEvals]
    .reverse()
    .map((ev, idx) => ({
      index: idx,
      date: ev.date.slice(5),
      borg: ev.rpeBorgCR10,
    }));

  return (
    <div className="space-y-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <span className="text-xs uppercase font-bold text-cyan-400 tracking-wider">
            Comparativo de Evolução Aquática
          </span>
          <h3 className="text-lg font-black text-white">{client.nameOrNickname}</h3>
          <p className="text-xs text-slate-400">
            {sortedEvals.length === 1
              ? 'Exibindo primeira avaliação cadastrada.'
              : `Comparando avaliação atual (${currentEval.date}) com a anterior (${previousEval?.date}).`}
          </p>
        </div>

        <button
          onClick={() => onOpenNewEvaluation(client.id)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer self-start sm:self-auto"
        >
          + Nova Avaliação
        </button>
      </div>

      {/* Cards de Destaque da Comparação */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Borg CR10 */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Percepção de Esforço (Borg)</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-cyan-300">{currentEval.rpeBorgCR10}/10</span>
            {previousEval && borgDelta !== null && (
              <span
                className={`text-xs font-bold inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded ${
                  borgDelta < 0
                    ? 'text-emerald-400 bg-emerald-950/60'
                    : borgDelta > 0
                    ? 'text-amber-400 bg-amber-950/60'
                    : 'text-slate-400 bg-slate-800'
                }`}
              >
                {borgDelta < 0 ? (
                  <>
                    <TrendingDown className="w-3 h-3" /> {borgDelta} (mais fácil)
                  </>
                ) : borgDelta > 0 ? (
                  <>
                    <TrendingUp className="w-3 h-3" /> +{borgDelta}
                  </>
                ) : (
                  <>
                    <Minus className="w-3 h-3" /> Estável
                  </>
                )}
              </span>
            )}
          </div>
          {previousEval && (
            <span className="text-[11px] text-slate-400 block mt-1">
              Anterior: {previousEval.rpeBorgCR10}/10 em {previousEval.date}
            </span>
          )}
        </div>

        {/* FC de Repouso */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>FC Repouso</span>
            <Heart className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {currentEval.optionalMeasurements?.restingHeartRate
                ? `${currentEval.optionalMeasurements.restingHeartRate} bpm`
                : 'Não aferida'}
            </span>
            {previousEval?.optionalMeasurements?.restingHeartRate &&
              currentEval.optionalMeasurements?.restingHeartRate && (
                <span className="text-xs text-cyan-400 font-semibold">
                  (Ant: {previousEval.optionalMeasurements.restingHeartRate})
                </span>
              )}
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">
            {currentEval.optionalMeasurements?.bloodPressureSystolic &&
            currentEval.optionalMeasurements?.bloodPressureDiastolic
              ? `PA: ${currentEval.optionalMeasurements.bloodPressureSystolic}/${currentEval.optionalMeasurements.bloodPressureDiastolic} mmHg`
              : 'PA não registrada'}
          </span>
        </div>

        {/* Total de Avaliações */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Histórico de Testes</span>
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white block">{sortedEvals.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            Acompanhamento contínuo no meio líquido
          </span>
        </div>
      </div>

      {/* Tabela Comparativa de Testes Funcionais */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider font-bold border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Teste Funcional Aquático</th>
              <th className="py-2.5 px-3">Anterior ({previousEval ? previousEval.date : '—'})</th>
              <th className="py-2.5 px-3">Atual ({currentEval.date})</th>
              <th className="py-2.5 px-3">Variação / Progresso</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
            {testComparisons.map((row, i) => (
              <tr key={i} className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 px-3 font-semibold text-white">{row.name}</td>
                <td className="py-2.5 px-3 text-slate-400">
                  {row.previous !== null ? `${row.previous} ${row.unit}` : '—'}
                </td>
                <td className="py-2.5 px-3 font-bold text-cyan-300">
                  {row.current} {row.unit}
                </td>
                <td className="py-2.5 px-3">
                  {row.delta !== null ? (
                    <span
                      className={`font-bold inline-flex items-center gap-1 ${
                        row.delta > 0
                          ? 'text-emerald-400'
                          : row.delta < 0
                          ? 'text-rose-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {row.delta > 0 ? (
                        <>
                          <TrendingUp className="w-3.5 h-3.5" /> +{row.delta} {row.unit}
                        </>
                      ) : row.delta < 0 ? (
                        <>
                          <TrendingDown className="w-3.5 h-3.5" /> {row.delta} {row.unit}
                        </>
                      ) : (
                        <>
                          <Minus className="w-3.5 h-3.5" /> Estável
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="text-slate-400">Primeiro registro</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gráfico Simples em SVG da Percepção de Esforço ao longo do tempo */}
      {graphPoints.length > 1 && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">
              Tendência da Percepção de Esforço (Borg CR10)
            </span>
            <span className="text-[10px] text-slate-400">Escala 1 a 10</span>
          </div>
          <div className="h-28 w-full flex items-end gap-3 pt-4 px-2">
            {graphPoints.map((pt, idx) => {
              const heightPercent = Math.max(15, (pt.borg / 10) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <span className="text-[10px] font-bold text-cyan-400">{pt.borg}</span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-md transition-all shadow-sm"
                  />
                  <span className="text-[9px] text-slate-400 truncate w-full text-center">
                    {pt.date}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mobilidade e Observações da Avaliação Atual */}
      <div className="space-y-2">
        {currentEval.mobilityNotes && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <strong className="text-cyan-300 block mb-0.5">Mobilidade Aquática Observada:</strong>
            <span className="text-slate-300">{currentEval.mobilityNotes}</span>
          </div>
        )}
        {currentEval.professionalNotes && (
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <strong className="text-slate-300 block mb-0.5">Observações do Prof. Henrique:</strong>
            <span className="text-slate-300">{currentEval.professionalNotes}</span>
          </div>
        )}
      </div>

      {/* Alerta Ético Permanente */}
      <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <span>
          A evolução demonstra adaptação funcional ao meio líquido sob supervisão profissional. Não constitui diagnóstico patológico nem substitui acompanhamento de equipe multidisciplinar.
        </span>
      </div>
    </div>
  );
};

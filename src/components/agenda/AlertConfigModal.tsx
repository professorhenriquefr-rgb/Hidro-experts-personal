import React, { useState } from 'react';
import { X, Save, Sliders, Info, ShieldCheck } from 'lucide-react';
import { AlertRuleConfig } from '../../types';

interface AlertConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentConfig: AlertRuleConfig;
  onSaveConfig: (config: AlertRuleConfig) => Promise<void>;
}

export const AlertConfigModal: React.FC<AlertConfigModalProps> = ({
  isOpen,
  onClose,
  currentConfig,
  onSaveConfig,
}) => {
  const [minRemainingSessions, setMinRemainingSessions] = useState(
    currentConfig.minRemainingSessions
  );
  const [maxConsecutiveAbsences, setMaxConsecutiveAbsences] = useState(
    currentConfig.maxConsecutiveAbsences
  );
  const [daysWithoutEvaluation, setDaysWithoutEvaluation] = useState(
    currentConfig.daysWithoutEvaluation
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSaveConfig({
        minRemainingSessions,
        maxConsecutiveAbsences,
        daysWithoutEvaluation,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Regras de Alerta & Retenção</h2>
              <p className="text-xs text-slate-400">Regras operacionais claras e transparentes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Todos os alertas mostram o <strong>motivo exato</strong> disparador da regra, sem conjecturas ou falsas previsões científicas.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alerta de Renovação: Restando quantas sessões no pacote?
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="10"
                value={minRemainingSessions}
                onChange={(e) => setMinRemainingSessions(parseInt(e.target.value, 10) || 1)}
                className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm outline-hidden"
              />
              <span className="text-xs text-slate-400">
                Dispara aviso quando o saldo do pacote for igual ou menor a este valor.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alerta de Evasão: Quantas faltas consecutivas recentes?
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="5"
                value={maxConsecutiveAbsences}
                onChange={(e) => setMaxConsecutiveAbsences(parseInt(e.target.value, 10) || 1)}
                className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm outline-hidden"
              />
              <span className="text-xs text-slate-400">
                Dispara sugestão de contato para verificar bem-estar ou reagendamento.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Alerta de Reavaliação Física Aquática (dias sem avaliar):
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="15"
                max="180"
                value={daysWithoutEvaluation}
                onChange={(e) => setDaysWithoutEvaluation(parseInt(e.target.value, 10) || 45)}
                className="w-24 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm outline-hidden"
              />
              <span className="text-xs text-slate-400">
                Recomenda nova aplicação de testes motores aquáticos a cada X dias.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Salvar Regras</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

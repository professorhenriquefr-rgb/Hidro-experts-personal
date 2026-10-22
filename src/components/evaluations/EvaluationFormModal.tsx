import React, { useState } from 'react';
import { X, Save, Plus, Trash2, AlertCircle, Info, Activity } from 'lucide-react';
import { Evaluation, FunctionalTestItem, OptionalMeasurements, Client } from '../../types';

interface EvaluationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  preSelectedClientId?: string;
  onSave: (evaluation: Evaluation) => Promise<void>;
}

export const EvaluationFormModal: React.FC<EvaluationFormModalProps> = ({
  isOpen,
  onClose,
  clients,
  preSelectedClientId,
  onSave,
}) => {
  const [clientId, setClientId] = useState(preSelectedClientId || (clients[0]?.id ?? ''));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [rpeBorgCR10, setRpeBorgCR10] = useState<number>(5);
  const [mobilityNotes, setMobilityNotes] = useState('');
  const [professionalNotes, setProfessionalNotes] = useState('');

  // Medidas opcionais
  const [restingHeartRate, setRestingHeartRate] = useState<string>('');
  const [bloodPressureSystolic, setBloodPressureSystolic] = useState<string>('');
  const [bloodPressureDiastolic, setBloodPressureDiastolic] = useState<string>('');
  const [bodyMassKg, setBodyMassKg] = useState<string>('');
  const [waistCircumferenceCm, setWaistCircumferenceCm] = useState<string>('');

  // Testes funcionais aquáticos configuráveis
  const [functionalTests, setFunctionalTests] = useState<FunctionalTestItem[]>([
    {
      id: 't_marcha',
      name: 'Marcha Aquática Estacionária 2 min',
      target: 'Elevação de joelhos acima do nível do quadril na água',
      result: '',
      unit: 'elevações',
    },
    {
      id: 't_flutuacao',
      name: 'Sustentação em Flutuação Dorsal',
      target: 'Tempo com apoio mínimo de espaguete',
      result: '',
      unit: 'segundos',
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAddCustomTest = () => {
    setFunctionalTests([
      ...functionalTests,
      {
        id: `test_${Date.now()}`,
        name: '',
        target: '',
        result: '',
        unit: 'reps',
      },
    ]);
  };

  const handleRemoveTest = (id: string) => {
    setFunctionalTests(functionalTests.filter((t) => t.id !== id));
  };

  const handleUpdateTest = (id: string, field: keyof FunctionalTestItem, value: any) => {
    setFunctionalTests(
      functionalTests.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!clientId) {
      setErrorMessage('Selecione o aluno para registrar a avaliação.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const optionalMeasurements: OptionalMeasurements = {};
      if (restingHeartRate) optionalMeasurements.restingHeartRate = parseFloat(restingHeartRate);
      if (bloodPressureSystolic) optionalMeasurements.bloodPressureSystolic = parseFloat(bloodPressureSystolic);
      if (bloodPressureDiastolic) optionalMeasurements.bloodPressureDiastolic = parseFloat(bloodPressureDiastolic);
      if (bodyMassKg) optionalMeasurements.bodyMassKg = parseFloat(bodyMassKg);
      if (waistCircumferenceCm) optionalMeasurements.waistCircumferenceCm = parseFloat(waistCircumferenceCm);

      const evaluation: Evaluation = {
        id: `eval_${Date.now()}`,
        clientId,
        date,
        rpeBorgCR10,
        mobilityNotes: mobilityNotes.trim(),
        professionalNotes: professionalNotes.trim(),
        functionalTests: functionalTests.filter((t) => t.name.trim() !== ''),
        optionalMeasurements,
        createdAt: new Date().toISOString(),
      };

      await onSave(evaluation);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao salvar avaliação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const borgLabels: Record<number, string> = {
    1: '1 - Repouso absoluto / Muito fácil',
    2: '2 - Fácil',
    3: '3 - Moderado leve',
    4: '4 - Algo moderado',
    5: '5 - Moderado (respiração ativa)',
    6: '6 - Moderado para forte',
    7: '7 - Forte (desafiador)',
    8: '8 - Muito forte',
    9: '9 - Quase exaustão',
    10: '10 - Esforço máximo',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-black text-white">Nova Avaliação Funcional Aquática</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prof. Henrique Aquafitness — Acompanhamento evolutivo sem finalidade diagnóstica clínica
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          {/* Aluno e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Aluno(a) *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-hidden cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameOrNickname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data da Avaliação *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-hidden"
              />
            </div>
          </div>

          {/* Percepção de Esforço Borg CR10 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-400" />
                Percepção Subjetiva de Esforço Típico (Borg CR10)
              </label>
              <span className="text-xs font-bold bg-cyan-950 border border-cyan-800 text-cyan-300 px-2 py-0.5 rounded">
                Nota {rpeBorgCR10}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={rpeBorgCR10}
              onChange={(e) => setRpeBorgCR10(parseInt(e.target.value, 10))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <p className="text-xs text-slate-400 mt-1">{borgLabels[rpeBorgCR10]}</p>
          </div>

          {/* Testes Funcionais Aquáticos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Testes Funcionais Aquáticos</h3>
                <p className="text-[11px] text-slate-400">
                  Defina os testes de acordo com a piscina e a necessidade do praticante
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddCustomTest}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar Teste
              </button>
            </div>

            <div className="space-y-2.5">
              {functionalTests.map((test) => (
                <div
                  key={test.id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                >
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={test.name}
                      onChange={(e) => handleUpdateTest(test.id, 'name', e.target.value)}
                      placeholder="Nome do teste (ex: Marcha 2 min)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={test.result}
                      onChange={(e) => handleUpdateTest(test.id, 'result', e.target.value)}
                      placeholder="Resultado obtido"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-hidden font-bold"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={test.unit}
                      onChange={(e) => handleUpdateTest(test.id, 'unit', e.target.value)}
                      placeholder="Unidade (ex: reps, s)"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-300 outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveTest(test.id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medidas Opcionais do Profissional */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 block">
              Medidas e Indicadores Fisiológicos (Opcionais)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">FC Repouso (bpm)</label>
                <input
                  type="number"
                  value={restingHeartRate}
                  onChange={(e) => setRestingHeartRate(e.target.value)}
                  placeholder="Ex: 72"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PA Sistólica (mmHg)</label>
                <input
                  type="number"
                  value={bloodPressureSystolic}
                  onChange={(e) => setBloodPressureSystolic(e.target.value)}
                  placeholder="Ex: 120"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">PA Diastólica (mmHg)</label>
                <input
                  type="number"
                  value={bloodPressureDiastolic}
                  onChange={(e) => setBloodPressureDiastolic(e.target.value)}
                  placeholder="Ex: 80"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-hidden text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Massa Corporal (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={bodyMassKg}
                  onChange={(e) => setBodyMassKg(e.target.value)}
                  placeholder="Ex: 68.5"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-hidden text-xs"
                />
              </div>
            </div>
          </div>

          {/* Mobilidade e Observações */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Mobilidade e Resposta Aquática
              </label>
              <textarea
                rows={2}
                value={mobilityNotes}
                onChange={(e) => setMobilityNotes(e.target.value)}
                placeholder="Ex.: Boa amplitude de braçadas no plano sagital; rigidez leve ao rotacionar tronco contra turbulência."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Observações Gerais do Profissional
              </label>
              <textarea
                rows={2}
                value={professionalNotes}
                onChange={(e) => setProfessionalNotes(e.target.value)}
                placeholder="Anotações para comparação e próximos treinos."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-xs outline-hidden"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Lembrete ético: Os resultados têm caráter pedagógico e funcional para prescrição de exercícios físicos, não configurando laudo clínico.
            </span>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Avaliação'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

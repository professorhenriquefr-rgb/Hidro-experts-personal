import React, { useState } from 'react';
import {
  Sparkles,
  Save,
  Copy,
  Printer,
  RefreshCw,
  Edit3,
  PlayCircle,
  AlertTriangle,
  Clock,
  Waves,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';
import { Client, Evaluation, WorkoutSession, ExerciseItem } from '../../types';
import { requestWorkoutFromAI } from '../../services/aiService';

interface WorkoutGeneratorProps {
  clients: Client[];
  evaluations: Evaluation[];
  savedWorkouts: WorkoutSession[];
  preSelectedClientId?: string;
  onSaveWorkout: (workout: WorkoutSession) => Promise<void>;
  onStartExecution: (workout: WorkoutSession) => void;
}

export const WorkoutGenerator: React.FC<WorkoutGeneratorProps> = ({
  clients,
  evaluations,
  savedWorkouts,
  preSelectedClientId,
  onSaveWorkout,
  onStartExecution,
}) => {
  const [clientId, setClientId] = useState<string>(
    preSelectedClientId || (clients[0]?.id ?? '')
  );

  const selectedClient = clients.find((c) => c.id === clientId);

  // Parâmetros do treino aquático
  const [duration, setDuration] = useState<number>(45);
  const [customDuration, setCustomDuration] = useState<string>('');
  const [depthType, setDepthType] = useState<string>('rasa_pe');
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  const [noEquipment, setNoEquipment] = useState<boolean>(true);

  // Estados de geração
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedWorkout, setGeneratedWorkout] = useState<WorkoutSession | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [hasSavedCurrent, setHasSavedCurrent] = useState<boolean>(false);

  const availableEquipmentsList = [
    'Espaguete (flutuador)',
    'Halteres de EVA aquáticos',
    'Hidro-palmares / Luvas de natação',
    'Caneleiras de hidro (EVA)',
    'Prancha de natação',
    'Step aquático com ventosas',
    'Cinto de flutuação para corrida profunda (Deep Water)',
  ];

  const handleToggleEquipment = (item: string) => {
    if (noEquipment) setNoEquipment(false);
    if (selectedEquipments.includes(item)) {
      setSelectedEquipments(selectedEquipments.filter((e) => e !== item));
    } else {
      setSelectedEquipments([...selectedEquipments, item]);
    }
  };

  const handleToggleNoEquipment = () => {
    setNoEquipment(true);
    setSelectedEquipments([]);
  };

  const handleGenerate = async (isRetry = false) => {
    if (!selectedClient) {
      setErrorMessage('Por favor, selecione um aluno cadastrado.');
      return;
    }

    const finalDuration = customDuration ? parseInt(customDuration, 10) || 45 : duration;
    if (finalDuration <= 0) {
      setErrorMessage('Duração inválida. Escolha um tempo maior que zero.');
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage('');
      setSuccessMessage('');
      setHasSavedCurrent(false);

      // Resgatar última avaliação do aluno
      const clientEvals = evaluations.filter((e) => e.clientId === selectedClient.id);
      const lastEval = clientEvals.length > 0 ? clientEvals[0] : undefined;

      // Resgatar histórico recente de sessões
      const clientPrevWorkouts = savedWorkouts.filter((w) => w.clientId === selectedClient.id);
      const prevSummary = clientPrevWorkouts
        .slice(0, 3)
        .map((w) => `${w.date}: ${w.sessionTitle} (${w.sessionGoal})`)
        .join(' | ');

      const depthLabel =
        depthType === 'rasa_pe'
          ? 'Piscina Rasa (água na altura do peito, pé no chão firme)'
          : depthType === 'funda_flutuacao'
          ? 'Piscina Funda / Deep Running (sem tocar os pés no fundo)'
          : 'Piscina Mista / Raia Livre';

      const equipmentsToSend = noEquipment ? [] : selectedEquipments;

      const workout = await requestWorkoutFromAI({
        clientName: selectedClient.nameOrNickname,
        mainObjective: selectedClient.mainObjective,
        experienceLevel: selectedClient.experienceLevel,
        targetDurationMinutes: finalDuration,
        depthType: depthLabel,
        equipments: equipmentsToSend,
        restrictionsCare: selectedClient.restrictionsCare || 'Nenhum cuidado especial informado.',
        lastEvaluation: lastEval,
        previousSessionsSummary: prevSummary,
      });

      // Validação estrita do código: a soma dos exercícios DEVE ser exatamente a duração escolhida
      let totalTime = workout.exercises.reduce((sum, ex) => sum + (ex.durationMinutes || 0), 0);
      if (totalTime !== finalDuration) {
        // Correção determinística no código
        const diff = finalDuration - totalTime;
        if (workout.exercises.length > 0) {
          const mainExIndex = workout.exercises.findIndex((e) => e.phase === 'principal');
          const targetIndex = mainExIndex >= 0 ? mainExIndex : 0;
          workout.exercises[targetIndex].durationMinutes = Math.max(
            1,
            workout.exercises[targetIndex].durationMinutes + diff
          );
        }
        totalTime = finalDuration;
      }

      workout.clientId = selectedClient.id;
      workout.clientName = selectedClient.nameOrNickname;
      workout.targetDurationMinutes = finalDuration;
      workout.totalDurationMinutes = totalTime;

      setGeneratedWorkout(workout);
      setSuccessMessage('Sessão individualizada gerada com sucesso pela IA!');
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Falha ao gerar treino. Verifique a conexão e tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedWorkout || !selectedClient) return;
    try {
      await onSaveWorkout(generatedWorkout);
      setHasSavedCurrent(true);
      setSuccessMessage('Treino salvo com sucesso no histórico do aluno!');
    } catch (e: any) {
      setErrorMessage(e?.message || 'Erro ao salvar treino.');
    }
  };

  const handleCopy = () => {
    if (!generatedWorkout) return;
    const text = `HYDRO PERSONAL — Prof. Henrique Aquafitness
ALUNO(A): ${generatedWorkout.clientName}
OBJETIVO: ${generatedWorkout.sessionGoal}
DURAÇÃO TOTAL: ${generatedWorkout.totalDurationMinutes} min | PROFUNDIDADE: ${generatedWorkout.depthType}
MATERIAIS: ${generatedWorkout.equipments.length > 0 ? generatedWorkout.equipments.join(', ') : 'Nenhum'}

JUSTIFICATIVA DA PROGRESSÃO:
${generatedWorkout.changeJustification || 'Adaptação hidrodinâmica contínua.'}

EXERCÍCIOS:
${generatedWorkout.exercises
  .map(
    (ex, i) =>
      `${i + 1}. [${ex.phase.toUpperCase()}] ${ex.name} (${ex.durationMinutes} min) - ${ex.targetPSE}\n   Instrução: ${ex.executionInstructions}\n   Progressão: ${ex.progression}\n   Regressão: ${ex.regression}\n   Segurança: ${ex.safetyAlert}`
  )
  .join('\n\n')}

AVISO: Condução e responsabilidade técnica pelo Prof. Henrique Aquafitness (CREF).`;

    navigator.clipboard.writeText(text);
    setSuccessMessage('Treino copiado para a área de transferência!');
  };

  const handlePrint = () => {
    window.print();
  };

  const updateExerciseField = (index: number, field: keyof ExerciseItem, value: any) => {
    if (!generatedWorkout) return;
    const updated = [...generatedWorkout.exercises];
    updated[index] = { ...updated[index], [field]: value };

    // recalcular soma
    const newTotal = updated.reduce((s, e) => s + (parseInt(String(e.durationMinutes), 10) || 0), 0);
    setGeneratedWorkout({
      ...generatedWorkout,
      exercises: updated,
      totalDurationMinutes: newTotal,
    });
  };

  const phaseColors: Record<string, string> = {
    aquecimento: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    principal: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    volta_a_calma: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Treino Aquático Individualizado com IA</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Planejamento inteligente ancorado em hidrodinâmica, histórico real e segurança técnica
          </p>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => handleGenerate(true)}
            className="px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-xs font-bold text-white cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Configurator Form */}
      <div className="bg-slate-900 border border-cyan-500/30 p-5 rounded-2xl shadow-xl space-y-4 print:hidden">
        <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
          Configuração da Sessão
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Aluno */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Aluno(a) Selecionado *
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setGeneratedWorkout(null);
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-hidden cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameOrNickname} ({c.experienceLevel})
                </option>
              ))}
            </select>
          </div>

          {/* Duração Escolhida */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Duração da Sessão *
            </label>
            <div className="grid grid-cols-4 gap-1">
              {[30, 45, 50, 60].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => {
                    setDuration(mins);
                    setCustomDuration('');
                  }}
                  className={`py-2 rounded-lg text-xs font-bold cursor-pointer transition ${
                    duration === mins && !customDuration
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <input
                type="number"
                placeholder="Personalizada (min)"
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="w-full px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-hidden"
              />
            </div>
          </div>

          {/* Profundidade da Piscina */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Profundidade da Piscina *
            </label>
            <select
              value={depthType}
              onChange={(e) => setDepthType(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-hidden cursor-pointer"
            >
              <option value="rasa_pe">Piscina Rasa (Pé no chão / Peito)</option>
              <option value="funda_flutuacao">Piscina Funda / Deep Running (Flutuação)</option>
              <option value="mista">Piscina Mista / Raia Livre</option>
            </select>
          </div>
        </div>

        {/* Restrições do Aluno em Destaque */}
        {selectedClient?.restrictionsCare && (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-900/40 text-xs text-amber-200 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-amber-300 font-semibold">
                Cuidados Informados para {selectedClient.nameOrNickname}:
              </strong>
              <span>{selectedClient.restrictionsCare}</span>
            </div>
          </div>
        )}

        {/* Equipamentos Disponíveis na Borda */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300">
              Equipamentos Disponíveis na Borda da Piscina:
            </label>
            <button
              type="button"
              onClick={handleToggleNoEquipment}
              className={`text-xs px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                noEquipment
                  ? 'bg-cyan-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              Nenhum (Resistência Natural da Água)
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {availableEquipmentsList.map((eq) => {
              const isSelected = selectedEquipments.includes(eq) && !noEquipment;
              return (
                <button
                  key={eq}
                  type="button"
                  onClick={() => handleToggleEquipment(eq)}
                  className={`p-2 rounded-xl text-left text-xs transition border cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 font-semibold'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {eq}
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Geração */}
        <div className="pt-2 flex items-center justify-end">
          <button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-sm shadow-lg shadow-cyan-500/25 transition cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{isGenerating ? 'Gerando Sessão com Gemini...' : 'Montar Sessão Individualizada com IA'}</span>
          </button>
        </div>
      </div>

      {/* Visualização da Sessão Gerada */}
      {generatedWorkout && (
        <div className="bg-slate-900 border border-cyan-500/40 p-6 rounded-2xl shadow-2xl space-y-5 print:bg-white print:text-black print:border-none print:shadow-none print:p-0">
          {/* Cabeçalho do Treino */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-slate-800 print:border-b-2 print:border-black">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 print:border-black print:text-black print:bg-slate-100">
                  HYDRO PERSONAL • PROF. HENRIQUE AQUAFITNESS
                </span>
                <span className="text-xs text-slate-400 print:text-slate-600">
                  {generatedWorkout.date}
                </span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1 print:text-black">
                {generatedWorkout.sessionTitle}
              </h2>
              <p className="text-sm text-cyan-200 font-medium print:text-slate-800">
                Aluno(a): <strong>{generatedWorkout.clientName}</strong> • Meta:{' '}
                {generatedWorkout.sessionGoal}
              </p>
            </div>

            {/* Ações de Borda da Piscina */}
            <div className="flex items-center gap-2 flex-wrap print:hidden">
              <button
                onClick={() => onStartExecution(generatedWorkout)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/30 transition cursor-pointer active:scale-95"
              >
                <PlayCircle className="w-4 h-4 text-slate-950" />
                <span>Modo Execução (Tela Cheia)</span>
              </button>

              <button
                onClick={handleCopy}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
                title="Copiar texto do treino"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={handlePrint}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
                title="Imprimir treino"
              >
                <Printer className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
                title={isEditing ? 'Concluir edição' : 'Editar exercícios manualmente'}
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                onClick={() => handleGenerate(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition cursor-pointer"
                title="Regenerar com IA"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={hasSavedCurrent}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-slate-950" />
                <span>{hasSavedCurrent ? 'Treino Salvo' : 'Salvar Treino'}</span>
              </button>
            </div>
          </div>

          {/* Duração e Fases Validadas */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Duração Total</span>
              <span className="text-xl font-black text-cyan-300 print:text-black">
                {generatedWorkout.totalDurationMinutes} min
              </span>
              <span className="text-[10px] text-emerald-400 block font-semibold print:text-emerald-700">
                100% Validado
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Aquecimento</span>
              <span className="text-xl font-black text-amber-300 print:text-black">
                {generatedWorkout.warmupDurationMinutes} min
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Parte Principal</span>
              <span className="text-xl font-black text-cyan-300 print:text-black">
                {generatedWorkout.mainDurationMinutes} min
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 print:bg-slate-50 print:border-slate-300">
              <span className="text-[11px] text-slate-400 print:text-slate-600 block">Volta à Calma</span>
              <span className="text-xl font-black text-emerald-300 print:text-black">
                {generatedWorkout.coolDownDurationMinutes} min
              </span>
            </div>
          </div>

          {/* Justificativa Técnica da Mudança / Progressão */}
          {generatedWorkout.changeJustification && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/20 text-xs print:bg-slate-50 print:border-slate-300">
              <strong className="text-cyan-400 block mb-0.5 print:text-black font-bold">
                Justificativa da Progressão Aquática:
              </strong>
              <p className="text-slate-300 leading-relaxed print:text-slate-800">
                {generatedWorkout.changeJustification}
              </p>
            </div>
          )}

          {/* Lista de Exercícios Estruturados */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-white print:text-black">
              Estrutura dos Exercícios
            </h3>

            <div className="space-y-3">
              {generatedWorkout.exercises.map((ex, idx) => (
                <div
                  key={ex.id || idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 print:border-slate-300 print:bg-white"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          phaseColors[ex.phase] || 'bg-slate-800 text-white'
                        } print:text-black print:border-black print:bg-slate-100`}
                      >
                        {ex.phase.replace('_', ' ')}
                      </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={ex.name}
                          onChange={(e) => updateExerciseField(idx, 'name', e.target.value)}
                          className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-sm font-bold text-white outline-hidden"
                        />
                      ) : (
                        <h4 className="font-bold text-white text-base print:text-black">
                          {idx + 1}. {ex.name}
                        </h4>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 print:text-slate-600">Duração:</span>
                      {isEditing ? (
                        <input
                          type="number"
                          value={ex.durationMinutes}
                          onChange={(e) =>
                            updateExerciseField(
                              idx,
                              'durationMinutes',
                              parseInt(e.target.value, 10) || 1
                            )
                          }
                          className="w-16 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-xs font-bold text-cyan-300 outline-hidden"
                        />
                      ) : (
                        <span className="text-xs font-bold text-cyan-300 print:text-black">
                          {ex.durationMinutes} min
                        </span>
                      )}
                      <span className="text-xs text-slate-500">•</span>
                      <span className="text-xs font-bold text-amber-300 print:text-black">
                        {ex.targetPSE}
                      </span>
                    </div>
                  </div>

                  {/* Instruções */}
                  <div className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                    <strong className="text-slate-400 print:text-black block mb-0.5">Execução:</strong>
                    {isEditing ? (
                      <textarea
                        rows={2}
                        value={ex.executionInstructions}
                        onChange={(e) =>
                          updateExerciseField(idx, 'executionInstructions', e.target.value)
                        }
                        className="w-full p-2 rounded bg-slate-900 border border-slate-700 text-xs text-white outline-hidden"
                      />
                    ) : (
                      <p>{ex.executionInstructions}</p>
                    )}
                  </div>

                  {/* Progressão, Regressão e Segurança */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                      <strong className="text-emerald-400 print:text-emerald-800 block">Progressão:</strong>
                      <span className="text-slate-300 print:text-slate-700">{ex.progression}</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80 print:bg-slate-50 print:border-slate-200">
                      <strong className="text-cyan-400 print:text-cyan-800 block">Regressão:</strong>
                      <span className="text-slate-300 print:text-slate-700">{ex.regression}</span>
                    </div>
                    <div className="p-2 rounded bg-amber-950/30 border border-amber-900/30 print:bg-amber-50 print:border-amber-200">
                      <strong className="text-amber-400 print:text-amber-800 block">Cuidado Postural:</strong>
                      <span className="text-amber-200/90 print:text-amber-900">{ex.safetyAlert}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assinatura e Diretriz Técnica Final */}
          <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-slate-400 print:border-t print:border-black print:text-slate-600 gap-2">
            <span>
              HYDRO PERSONAL • Prof. Henrique Aquafitness (CREF)
            </span>
            <span>
              Em caso de desconforto ou dor atípica, interromper o movimento imediatamente.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

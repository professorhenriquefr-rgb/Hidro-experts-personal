import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  CheckCircle2,
  AlertTriangle,
  Volume2,
  VolumeX,
  RefreshCw,
  Save,
  Clock,
  Sparkles,
} from 'lucide-react';
import { WorkoutSession, ExerciseItem } from '../../types';

interface WorkoutExecutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  workout: WorkoutSession;
  onSaveExecution: (workoutId: string, executionNotes: string, completed: boolean) => Promise<void>;
}

export const WorkoutExecutionModal: React.FC<WorkoutExecutionModalProps> = ({
  isOpen,
  onClose,
  workout,
  onSaveExecution,
}) => {
  const [exercises, setExercises] = useState<ExerciseItem[]>(workout.exercises || []);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedIndexes, setCompletedIndexes] = useState<number[]>([]);
  const [executionNotes, setExecutionNotes] = useState(workout.executionNotes || '');

  // Timer por exercício
  const currentEx = exercises[currentExerciseIndex];
  const initialSeconds = currentEx ? currentEx.durationMinutes * 60 : 300;
  const [secondsRemaining, setSecondsRemaining] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Substituição rápida
  const [isSubstituting, setIsSubstituting] = useState(false);
  const [substitutionReason, setSubstitutionReason] = useState('');

  // Audio Context Beep sem assets externos
  const playBeep = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // 880 Hz (Lá agudo para água)
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio not allowed or supported', e);
    }
  };

  useEffect(() => {
    if (currentEx) {
      setSecondsRemaining(currentEx.durationMinutes * 60);
      setIsRunning(false);
    }
  }, [currentExerciseIndex, currentEx]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (secondsRemaining === 0 && isRunning) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsRemaining]);

  if (!isOpen || !currentEx) return null;

  const toggleComplete = (idx: number) => {
    if (completedIndexes.includes(idx)) {
      setCompletedIndexes(completedIndexes.filter((i) => i !== idx));
    } else {
      setCompletedIndexes([...completedIndexes, idx]);
    }
  };

  const handleNextExercise = () => {
    if (!completedIndexes.includes(currentExerciseIndex)) {
      setCompletedIndexes([...completedIndexes, currentExerciseIndex]);
    }
    if (currentExerciseIndex < exercises.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  const handleQuickSubstitute = () => {
    if (!substitutionReason.trim()) return;
    const updated = [...exercises];
    const oldName = updated[currentExerciseIndex].name;
    updated[currentExerciseIndex] = {
      ...updated[currentExerciseIndex],
      name: `[SUBST.] ${updated[currentExerciseIndex].regression}`,
      executionInstructions: `Substituição por adaptação na borda: foco em menor alavanca e segurança. Motivo: ${substitutionReason}`,
      progression: 'Retornar gradualmente ao padrão anterior.',
    };
    setExercises(updated);
    setExecutionNotes((prev) =>
      prev
        ? `${prev} | Substituído "${oldName}" por: ${substitutionReason}`
        : `Substituído "${oldName}" por: ${substitutionReason}`
    );
    setIsSubstituting(false);
    setSubstitutionReason('');
  };

  const handleFinish = async () => {
    const isAllDone = completedIndexes.length === exercises.length;
    await onSaveExecution(workout.id, executionNotes, isAllDone);
    onClose();
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const phaseColors: Record<string, string> = {
    aquecimento: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    principal: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    volta_a_calma: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-white overflow-hidden">
      {/* Poolside High Contrast Top Bar */}
      <header className="px-4 py-3 bg-slate-900 border-b border-cyan-500/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
          <h1 className="font-black text-base tracking-wide text-white">
            MODO EXECUÇÃO NA BORDA DA PISCINA
          </h1>
          <span className="hidden sm:inline text-xs text-cyan-400 font-bold">
            • {workout.clientName || 'Sessão Individualizada'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-800 text-cyan-300 hover:bg-slate-700 cursor-pointer"
            title={soundEnabled ? 'Silenciar Alerta Sonoro' : 'Ativar Alerta Sonoro'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Execution Area */}
      <div className="flex-1 overflow-y-auto p-4 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Exercício Atual em Destaque & Cronômetro Gigante */}
        <div className="lg:col-span-2 space-y-4">
          {/* Phase Badge & Exercise Number */}
          <div className="flex items-center justify-between">
            <span
              className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full border ${
                phaseColors[currentEx.phase] || 'bg-slate-800 text-white'
              }`}
            >
              Fase: {currentEx.phase.replace('_', ' ').toUpperCase()} ({currentExerciseIndex + 1}/{exercises.length})
            </span>

            <span className="text-xs text-slate-400 font-medium">
              Equipamento: <strong className="text-white">{currentEx.equipment}</strong>
            </span>
          </div>

          {/* Nome e Instrução de Execução */}
          <div className="bg-slate-900 border border-cyan-500/30 p-5 rounded-2xl shadow-xl space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {currentEx.name}
            </h2>

            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-sm leading-relaxed text-slate-200">
              <strong className="text-cyan-400 block mb-1">Execução na Água:</strong>
              {currentEx.executionInstructions}
            </div>

            {/* Espaço reservado para mídia/vídeo (sem inventar links falsos) */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Espaço reservado para registro visual do movimento pelo profissional
            </div>

            {/* Intensidade PSE & Alertas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block">Intensidade Alvo (PSE):</span>
                <span className="text-cyan-300 font-bold text-sm">{currentEx.targetPSE}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/40 text-amber-200">
                <span className="font-bold flex items-center gap-1 text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" /> Segurança Hidrodinâmica:
                </span>
                <span className="text-[11px] leading-tight block mt-0.5">{currentEx.safetyAlert}</span>
              </div>
            </div>

            {/* Progressão & Regressão */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-emerald-400 font-semibold block">Como Progredir:</span>
                <span className="text-slate-300">{currentEx.progression}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-cyan-400 font-semibold block">Como Regredir (alívio):</span>
                <span className="text-slate-300">{currentEx.regression}</span>
              </div>
            </div>
          </div>

          {/* Cronômetro Gigante Poolside */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 border border-cyan-500/40 p-6 rounded-2xl text-center shadow-2xl relative">
            <div className="text-6xl sm:text-7xl font-mono font-black text-cyan-300 tracking-wider drop-shadow-md">
              {formatTime(secondsRemaining)}
            </div>

            <div className="text-xs text-slate-400 mt-1">
              Duração programada: {currentEx.durationMinutes} min
            </div>

            {/* Controles do Cronômetro */}
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => setSecondsRemaining(currentEx.durationMinutes * 60)}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
                title="Reiniciar tempo do exercício"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsRunning(!isRunning)}
                className={`px-8 py-3.5 rounded-2xl font-black text-lg flex items-center gap-2 shadow-lg transition cursor-pointer active:scale-95 ${
                  isRunning
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-cyan-500/40'
                }`}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-6 h-6 fill-current" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 fill-current" /> Iniciar
                  </>
                )}
              </button>

              <button
                onClick={handleNextExercise}
                className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition cursor-pointer"
                title="Próximo exercício"
              >
                <SkipForward className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Substituição Rápida de Exercício */}
          {!isSubstituting ? (
            <button
              onClick={() => setIsSubstituting(true)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Precisa adaptar ou substituir este exercício agora?
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-slate-900 border border-cyan-500/30 space-y-2 animate-fadeIn">
              <span className="text-xs font-bold text-white block">
                Substituição Rápida na Borda da Piscina
              </span>
              <p className="text-[11px] text-slate-400">
                Sugestão baseada na regressão: <em>"{currentEx.regression}"</em>
              </p>
              <input
                type="text"
                value={substitutionReason}
                onChange={(e) => setSubstitutionReason(e.target.value)}
                placeholder="Motivo (ex: aluno relatou desconforto no joelho, fadiga rápida)"
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-hidden"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={handleQuickSubstitute}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
                >
                  Aplicar Substituição
                </button>
                <button
                  onClick={() => setIsSubstituting(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Checklist de Exercícios & Anotações Finais */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-white flex items-center justify-between">
              <span>Lista de Exercícios da Sessão</span>
              <span className="text-xs text-cyan-400">
                {completedIndexes.length}/{exercises.length} Concluídos
              </span>
            </h3>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {exercises.map((ex, idx) => {
                const isCurrent = idx === currentExerciseIndex;
                const isDone = completedIndexes.includes(idx);

                return (
                  <div
                    key={ex.id || idx}
                    onClick={() => setCurrentExerciseIndex(idx)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isCurrent
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-md'
                        : isDone
                        ? 'bg-slate-900/60 border-emerald-800/40 text-slate-400'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleComplete(idx);
                        }}
                        className={`p-1 rounded-md transition ${
                          isDone ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5 fill-current" />
                      </button>
                      <div className="truncate">
                        <span className={`text-xs font-bold block truncate ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                          {idx + 1}. {ex.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {ex.durationMinutes} min • {ex.targetPSE}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold text-cyan-400 shrink-0">
                      {ex.phase === 'aquecimento' ? 'Aquec.' : ex.phase === 'principal' ? 'Princ.' : 'Volta'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Anotações da Execução da Sessão */}
          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              Observações da Sessão (Prof. Henrique)
            </label>
            <textarea
              rows={3}
              value={executionNotes}
              onChange={(e) => setExecutionNotes(e.target.value)}
              placeholder="Ex: Aluno realizou toda a série com boa flutuação; adaptou último exercício por cansaço."
              className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white outline-hidden"
            />

            <button
              onClick={handleFinish}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>Finalizar e Salvar Treino</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

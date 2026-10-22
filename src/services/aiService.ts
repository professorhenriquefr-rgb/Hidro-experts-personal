import { WorkoutSession, ExerciseItem } from '../types';

export interface GenerateWorkoutParams {
  clientName: string;
  mainObjective: string;
  experienceLevel: string;
  targetDurationMinutes: number;
  depthType: string;
  equipments: string[];
  restrictionsCare: string;
  lastEvaluation?: any;
  previousSessionsSummary?: string;
}

export async function requestWorkoutFromAI(params: GenerateWorkoutParams): Promise<WorkoutSession> {
  const response = await fetch('/api/gemini/workout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Erro ao gerar sessão com IA.');
  }

  const raw = data.workout;
  const exercises: ExerciseItem[] = (raw.exercises || []).map((ex: any, idx: number) => ({
    id: `ex_${Date.now()}_${idx}`,
    phase: ex.phase || 'principal',
    name: ex.name || `Exercício ${idx + 1}`,
    durationMinutes: parseInt(ex.durationMinutes, 10) || 5,
    executionInstructions: ex.executionInstructions || 'Execução sob orientação do professor.',
    targetPSE: ex.targetPSE || 'Borg 5-6',
    progression: ex.progression || 'Aumentar cadência ou alavanca.',
    regression: ex.regression || 'Diminuir amplitude ou desacelerar.',
    safetyAlert: ex.safetyAlert || 'Atenção ao alinhamento postural.',
    equipment: ex.equipment || 'Nenhum (resistência da água)',
  }));

  const workout: WorkoutSession = {
    id: `wkt_${Date.now()}`,
    clientId: '',
    clientName: params.clientName,
    date: new Date().toISOString().split('T')[0],
    sessionTitle: raw.sessionTitle || `Treino Aquático - ${params.clientName}`,
    sessionGoal: raw.sessionGoal || params.mainObjective,
    depthType: params.depthType,
    equipments: params.equipments,
    targetDurationMinutes: params.targetDurationMinutes,
    totalDurationMinutes: raw.totalDurationMinutes || params.targetDurationMinutes,
    warmupDurationMinutes: raw.warmupDurationMinutes || 10,
    mainDurationMinutes: raw.mainDurationMinutes || 25,
    coolDownDurationMinutes: raw.coolDownDurationMinutes || 10,
    changeJustification: raw.changeJustification,
    generalSafetyGuidance: raw.generalSafetyGuidance,
    exercises,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  return workout;
}

export async function requestWhatsAppMessage(
  clientName: string,
  messageType: 'boas_vindas' | 'ausencia' | 'reposicao' | 'renovacao' | 'parabens_marco',
  contextDetails: any
): Promise<string> {
  const response = await fetch('/api/gemini/message', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      clientName,
      messageType,
      contextDetails,
    }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Erro ao gerar mensagem para WhatsApp.');
  }

  return data.messageText;
}

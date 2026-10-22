export type ExperienceLevel =
  | 'iniciante'
  | 'intermediario'
  | 'avancado'
  | 'adaptacao_aquatica';

export interface Client {
  id: string;
  nameOrNickname: string;
  phone?: string;
  mainObjective: string;
  experienceLevel: ExperienceLevel;
  startDate: string;
  professionalNotes: string;
  restrictionsCare: string; // Campo livre do profissional (ex.: "evitar impacto forte", "liberação médica pendente"). Não solicitar diagnósticos médicos.
  consentAcceptedAt: string; // Registro LGPD
  active: boolean;
  createdAt: string;
  updatedAt: string;
  isExample?: boolean;
}

export interface FunctionalTestItem {
  id: string;
  name: string;
  target: string;
  result: number | string;
  unit: string;
}

export interface OptionalMeasurements {
  restingHeartRate?: number;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  bodyMassKg?: number;
  waistCircumferenceCm?: number;
}

export interface Evaluation {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  rpeBorgCR10: number; // 1 a 10
  mobilityNotes: string;
  professionalNotes: string;
  functionalTests: FunctionalTestItem[];
  optionalMeasurements?: OptionalMeasurements;
  createdAt: string;
}

export type ExercisePhase = 'aquecimento' | 'principal' | 'volta_a_calma';

export interface ExerciseItem {
  id: string;
  phase: ExercisePhase;
  name: string;
  durationMinutes: number;
  executionInstructions: string;
  targetPSE: string; // Borg
  progression: string;
  regression: string;
  safetyAlert: string;
  equipment: string;
}

export interface WorkoutSession {
  id: string;
  clientId: string;
  clientName?: string;
  date: string;
  sessionTitle: string;
  sessionGoal: string;
  depthType: string;
  equipments: string[];
  targetDurationMinutes: number;
  totalDurationMinutes: number;
  warmupDurationMinutes: number;
  mainDurationMinutes: number;
  coolDownDurationMinutes: number;
  changeJustification?: string;
  generalSafetyGuidance?: string;
  exercises: ExerciseItem[];
  completed: boolean;
  executionNotes?: string;
  completedAt?: string;
  createdAt: string;
}

export type AppointmentStatus =
  | 'agendada'
  | 'presente'
  | 'falta'
  | 'reposicao'
  | 'cancelada';

export interface Appointment {
  id: string;
  clientId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  status: AppointmentStatus;
  packageId?: string;
  notes?: string;
}

export interface ClientPackage {
  id: string;
  clientId: string;
  title: string;
  totalSessions: number;
  usedSessions: number;
  startDate: string;
  validUntil?: string;
  price?: number;
  active: boolean;
}

export interface AttentionAlert {
  id: string;
  clientId: string;
  clientName: string;
  severity: 'warning' | 'danger' | 'info';
  reason: string;
  actionLabel: string;
  actionType: 'renew_package' | 'contact_absence' | 'evaluate' | 'plan_session';
}

export interface AlertRuleConfig {
  minRemainingSessions: number; // default 2
  maxConsecutiveAbsences: number; // default 2
  daysWithoutEvaluation: number; // default 45
}

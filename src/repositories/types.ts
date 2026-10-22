import {
  Client,
  Evaluation,
  WorkoutSession,
  Appointment,
  ClientPackage,
  AlertRuleConfig,
} from '../types';

export interface IHydroRepository {
  // Clientes
  getClients(): Promise<Client[]>;
  getClientById(id: string): Promise<Client | null>;
  saveClient(client: Client): Promise<Client>;
  deleteClient(id: string): Promise<boolean>;

  // Avaliações
  getEvaluations(clientId?: string): Promise<Evaluation[]>;
  getEvaluationById(id: string): Promise<Evaluation | null>;
  saveEvaluation(evaluation: Evaluation): Promise<Evaluation>;
  deleteEvaluation(id: string): Promise<boolean>;

  // Treinos / Sessões
  getWorkouts(clientId?: string): Promise<WorkoutSession[]>;
  getWorkoutById(id: string): Promise<WorkoutSession | null>;
  saveWorkout(workout: WorkoutSession): Promise<WorkoutSession>;
  deleteWorkout(id: string): Promise<boolean>;

  // Agenda & Sessões
  getAppointments(date?: string, clientId?: string): Promise<Appointment[]>;
  saveAppointment(appointment: Appointment): Promise<Appointment>;
  deleteAppointment(id: string): Promise<boolean>;

  // Pacotes
  getPackages(clientId?: string): Promise<ClientPackage[]>;
  savePackage(pkg: ClientPackage): Promise<ClientPackage>;
  deletePackage(id: string): Promise<boolean>;

  // Configurações de Alerta
  getAlertConfig(): Promise<AlertRuleConfig>;
  saveAlertConfig(config: AlertRuleConfig): Promise<AlertRuleConfig>;

  // Backup & Restore
  exportAllData(): Promise<string>;
  importAllData(jsonData: string): Promise<boolean>;
  loadSampleData(): Promise<void>;
  clearAllData(): Promise<void>;
}

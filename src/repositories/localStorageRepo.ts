import {
  Client,
  Evaluation,
  WorkoutSession,
  Appointment,
  ClientPackage,
  AlertRuleConfig,
  AttentionAlert,
} from '../types';
import { IHydroRepository } from './types';

const STORAGE_KEYS = {
  CLIENTS: 'hydro_clients_v1',
  EVALUATIONS: 'hydro_evaluations_v1',
  WORKOUTS: 'hydro_workouts_v1',
  APPOINTMENTS: 'hydro_appointments_v1',
  PACKAGES: 'hydro_packages_v1',
  ALERT_CONFIG: 'hydro_alert_config_v1',
};

const DEFAULT_ALERT_CONFIG: AlertRuleConfig = {
  minRemainingSessions: 2,
  maxConsecutiveAbsences: 2,
  daysWithoutEvaluation: 45,
};

export class LocalStorageRepository implements IHydroRepository {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return defaultValue;
      return JSON.parse(data) as T;
    } catch (e) {
      console.error(`Erro ao ler localStorage [${key}]:`, e);
      return defaultValue;
    }
  }

  private setStorageItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Erro ao gravar localStorage [${key}]:`, e);
    }
  }

  // --- Clientes ---
  async getClients(): Promise<Client[]> {
    const clients = this.getStorageItem<Client[]>(STORAGE_KEYS.CLIENTS, []);
    return clients.sort((a, b) => a.nameOrNickname.localeCompare(b.nameOrNickname));
  }

  async getClientById(id: string): Promise<Client | null> {
    const clients = await this.getClients();
    return clients.find((c) => c.id === id) || null;
  }

  async saveClient(client: Client): Promise<Client> {
    const clients = await this.getClients();
    const index = clients.findIndex((c) => c.id === client.id);
    const updated = {
      ...client,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      clients[index] = updated;
    } else {
      clients.push(updated);
    }
    this.setStorageItem(STORAGE_KEYS.CLIENTS, clients);
    return updated;
  }

  async deleteClient(id: string): Promise<boolean> {
    const clients = await this.getClients();
    const filtered = clients.filter((c) => c.id !== id);
    this.setStorageItem(STORAGE_KEYS.CLIENTS, filtered);

    // Limpeza em cascata dos dados associados a este cliente (atendendo à LGPD e solicitação explícita)
    const evals = (await this.getEvaluations()).filter((e) => e.clientId !== id);
    this.setStorageItem(STORAGE_KEYS.EVALUATIONS, evals);

    const workouts = (await this.getWorkouts()).filter((w) => w.clientId !== id);
    this.setStorageItem(STORAGE_KEYS.WORKOUTS, workouts);

    const appts = (await this.getAppointments()).filter((a) => a.clientId !== id);
    this.setStorageItem(STORAGE_KEYS.APPOINTMENTS, appts);

    const pkgs = (await this.getPackages()).filter((p) => p.clientId !== id);
    this.setStorageItem(STORAGE_KEYS.PACKAGES, pkgs);

    return true;
  }

  // --- Avaliações ---
  async getEvaluations(clientId?: string): Promise<Evaluation[]> {
    const list = this.getStorageItem<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    const filtered = clientId ? list.filter((e) => e.clientId === clientId) : list;
    return filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getEvaluationById(id: string): Promise<Evaluation | null> {
    const list = await this.getEvaluations();
    return list.find((e) => e.id === id) || null;
  }

  async saveEvaluation(evaluation: Evaluation): Promise<Evaluation> {
    const list = await this.getEvaluations();
    const index = list.findIndex((e) => e.id === evaluation.id);
    if (index >= 0) {
      list[index] = evaluation;
    } else {
      list.push(evaluation);
    }
    this.setStorageItem(STORAGE_KEYS.EVALUATIONS, list);
    return evaluation;
  }

  async deleteEvaluation(id: string): Promise<boolean> {
    const list = await this.getEvaluations();
    const filtered = list.filter((e) => e.id !== id);
    this.setStorageItem(STORAGE_KEYS.EVALUATIONS, filtered);
    return true;
  }

  // --- Sessões / Treinos ---
  async getWorkouts(clientId?: string): Promise<WorkoutSession[]> {
    const list = this.getStorageItem<WorkoutSession[]>(STORAGE_KEYS.WORKOUTS, []);
    const filtered = clientId ? list.filter((w) => w.clientId === clientId) : list;
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getWorkoutById(id: string): Promise<WorkoutSession | null> {
    const list = await this.getWorkouts();
    return list.find((w) => w.id === id) || null;
  }

  async saveWorkout(workout: WorkoutSession): Promise<WorkoutSession> {
    const list = await this.getWorkouts();
    const index = list.findIndex((w) => w.id === workout.id);
    if (index >= 0) {
      list[index] = workout;
    } else {
      list.push(workout);
    }
    this.setStorageItem(STORAGE_KEYS.WORKOUTS, list);
    return workout;
  }

  async deleteWorkout(id: string): Promise<boolean> {
    const list = await this.getWorkouts();
    const filtered = list.filter((w) => w.id !== id);
    this.setStorageItem(STORAGE_KEYS.WORKOUTS, filtered);
    return true;
  }

  // --- Agenda ---
  async getAppointments(date?: string, clientId?: string): Promise<Appointment[]> {
    let list = this.getStorageItem<Appointment[]>(STORAGE_KEYS.APPOINTMENTS, []);
    if (date) {
      list = list.filter((a) => a.date === date);
    }
    if (clientId) {
      list = list.filter((a) => a.clientId === clientId);
    }
    return list.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }

  async saveAppointment(appointment: Appointment): Promise<Appointment> {
    const list = await this.getAppointments();
    const index = list.findIndex((a) => a.id === appointment.id);
    if (index >= 0) {
      list[index] = appointment;
    } else {
      list.push(appointment);
    }
    this.setStorageItem(STORAGE_KEYS.APPOINTMENTS, list);
    return appointment;
  }

  async deleteAppointment(id: string): Promise<boolean> {
    const list = await this.getAppointments();
    const filtered = list.filter((a) => a.id !== id);
    this.setStorageItem(STORAGE_KEYS.APPOINTMENTS, filtered);
    return true;
  }

  // --- Pacotes ---
  async getPackages(clientId?: string): Promise<ClientPackage[]> {
    const list = this.getStorageItem<ClientPackage[]>(STORAGE_KEYS.PACKAGES, []);
    return clientId ? list.filter((p) => p.clientId === clientId) : list;
  }

  async savePackage(pkg: ClientPackage): Promise<ClientPackage> {
    const list = await this.getPackages();
    const index = list.findIndex((p) => p.id === pkg.id);
    if (index >= 0) {
      list[index] = pkg;
    } else {
      list.push(pkg);
    }
    this.setStorageItem(STORAGE_KEYS.PACKAGES, list);
    return pkg;
  }

  async deletePackage(id: string): Promise<boolean> {
    const list = await this.getPackages();
    const filtered = list.filter((p) => p.id !== id);
    this.setStorageItem(STORAGE_KEYS.PACKAGES, filtered);
    return true;
  }

  // --- Config de Alertas ---
  async getAlertConfig(): Promise<AlertRuleConfig> {
    return this.getStorageItem<AlertRuleConfig>(STORAGE_KEYS.ALERT_CONFIG, DEFAULT_ALERT_CONFIG);
  }

  async saveAlertConfig(config: AlertRuleConfig): Promise<AlertRuleConfig> {
    this.setStorageItem(STORAGE_KEYS.ALERT_CONFIG, config);
    return config;
  }

  // --- Alertas com Regras Explícitas e Transparentes ---
  async calculateAttentionAlerts(): Promise<AttentionAlert[]> {
    const clients = await this.getClients();
    const packages = await this.getPackages();
    const appointments = await this.getAppointments();
    const evaluations = await this.getEvaluations();
    const config = await this.getAlertConfig();

    const alerts: AttentionAlert[] = [];

    for (const client of clients) {
      if (!client.active) continue;

      // Regra 1: Saldo de sessões do pacote acabando
      const activePackage = packages.find((p) => p.clientId === client.id && p.active);
      if (activePackage) {
        const remaining = activePackage.totalSessions - activePackage.usedSessions;
        if (remaining <= config.minRemainingSessions) {
          alerts.push({
            id: `alert_pkg_${client.id}`,
            clientId: client.id,
            clientName: client.nameOrNickname,
            severity: remaining <= 1 ? 'danger' : 'warning',
            reason: `Restam apenas ${remaining} ${remaining === 1 ? 'sessão' : 'sessões'} no pacote "${activePackage.title}".`,
            actionLabel: 'Avisar Renovação',
            actionType: 'renew_package',
          });
        }
      }

      // Regra 2: Faltas consecutivas registradas
      const clientAppts = appointments
        .filter((a) => a.clientId === client.id && (a.status === 'presente' || a.status === 'falta'))
        .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));

      let consecutiveAbsences = 0;
      for (const appt of clientAppts) {
        if (appt.status === 'falta') {
          consecutiveAbsences++;
        } else {
          break;
        }
      }

      if (consecutiveAbsences >= config.maxConsecutiveAbsences) {
        alerts.push({
          id: `alert_absence_${client.id}`,
          clientId: client.id,
          clientName: client.nameOrNickname,
          severity: 'warning',
          reason: `Registradas ${consecutiveAbsences} faltas consecutivas recentes.`,
          actionLabel: 'Contatar Aluno',
          actionType: 'contact_absence',
        });
      }

      // Regra 3: Sem reavaliação física aquática há mais de X dias
      const clientEvals = evaluations.filter((e) => e.clientId === client.id);
      if (clientEvals.length > 0) {
        const lastEval = clientEvals[0]; // mais recente
        const daysSince = Math.floor(
          (Date.now() - new Date(lastEval.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSince > config.daysWithoutEvaluation) {
          alerts.push({
            id: `alert_eval_${client.id}`,
            clientId: client.id,
            clientName: client.nameOrNickname,
            severity: 'info',
            reason: `Última avaliação aquática realizada há ${daysSince} dias (recomendado a cada ${config.daysWithoutEvaluation} dias).`,
            actionLabel: 'Agendar Reavaliação',
            actionType: 'evaluate',
          });
        }
      }
    }

    return alerts;
  }

  // --- Backup e Restore JSON ---
  async exportAllData(): Promise<string> {
    const fullBackup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      source: 'HYDRO PERSONAL - Prof. Henrique Aquafitness',
      disclaimer: 'Dados armazenados localmente no navegador.',
      data: {
        clients: await this.getClients(),
        evaluations: await this.getEvaluations(),
        workouts: await this.getWorkouts(),
        appointments: await this.getAppointments(),
        packages: await this.getPackages(),
        alertConfig: await this.getAlertConfig(),
      },
    };
    return JSON.stringify(fullBackup, null, 2);
  }

  async importAllData(jsonData: string): Promise<boolean> {
    try {
      const parsed = JSON.parse(jsonData);
      if (!parsed || !parsed.data) {
        throw new Error('Formato de backup inválido.');
      }
      const { clients, evaluations, workouts, appointments, packages, alertConfig } = parsed.data;

      if (Array.isArray(clients)) this.setStorageItem(STORAGE_KEYS.CLIENTS, clients);
      if (Array.isArray(evaluations)) this.setStorageItem(STORAGE_KEYS.EVALUATIONS, evaluations);
      if (Array.isArray(workouts)) this.setStorageItem(STORAGE_KEYS.WORKOUTS, workouts);
      if (Array.isArray(appointments)) this.setStorageItem(STORAGE_KEYS.APPOINTMENTS, appointments);
      if (Array.isArray(packages)) this.setStorageItem(STORAGE_KEYS.PACKAGES, packages);
      if (alertConfig) this.setStorageItem(STORAGE_KEYS.ALERT_CONFIG, alertConfig);

      return true;
    } catch (e) {
      console.error('Falha ao importar backup:', e);
      return false;
    }
  }

  async clearAllData(): Promise<void> {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  }

  // Exemplos fictícios para teste imediato
  async loadSampleData(): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const prevMonthDate = new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sampleClients: Client[] = [
      {
        id: 'client_sample_1',
        nameOrNickname: 'Dona Maria Helena',
        phone: '11987654321',
        mainObjective: 'Alívio de dores lombares, mobilidade articular e melhora na marcha',
        experienceLevel: 'adaptacao_aquatica',
        startDate: '2026-01-15',
        professionalNotes: 'Muito assídua. Relata sensação de leveza imediata após o treino na água morna.',
        restrictionsCare: 'Evitar impactos fortes e movimentos de hiperextensão lombar brusca. Água morna recomendada.',
        consentAcceptedAt: '2026-01-15T10:00:00.000Z',
        active: true,
        createdAt: '2026-01-15T10:00:00.000Z',
        updatedAt: '2026-02-10T10:00:00.000Z',
        isExample: true,
      },
      {
        id: 'client_sample_2',
        nameOrNickname: 'Carlos Eduardo (Cadu)',
        phone: '11977778888',
        mainObjective: 'Condicionamento cardiorrespiratório e fortalecimento muscular global',
        experienceLevel: 'intermediario',
        startDate: '2026-02-01',
        professionalNotes: 'Boa propulsão aquática, foca em treinos com hidrotubos e luvas de natação.',
        restrictionsCare: 'Cuidado com sobrecarga nos ombros em rotação externa máxima.',
        consentAcceptedAt: '2026-02-01T14:30:00.000Z',
        active: true,
        createdAt: '2026-02-01T14:30:00.000Z',
        updatedAt: '2026-02-01T14:30:00.000Z',
        isExample: true,
      },
      {
        id: 'client_sample_3',
        nameOrNickname: 'Juliana Mendes',
        phone: '11966665555',
        mainObjective: 'Redução do estresse, queima calórica e condicionamento geral',
        experienceLevel: 'iniciante',
        startDate: '2026-03-01',
        professionalNotes: 'Iniciou recente; prefere piscina rasa onde possa tocar o pé no fundo com tranquilidade.',
        restrictionsCare: 'Sensível ao frio. Evitar nadar em raias muito frias.',
        consentAcceptedAt: '2026-03-01T09:00:00.000Z',
        active: true,
        createdAt: '2026-03-01T09:00:00.000Z',
        updatedAt: '2026-03-01T09:00:00.000Z',
        isExample: true,
      },
    ];

    const sampleEvaluations: Evaluation[] = [
      {
        id: 'eval_sample_1_prev',
        clientId: 'client_sample_1',
        date: prevMonthDate,
        rpeBorgCR10: 7,
        mobilityNotes: 'Dificuldade leve na abdução de quadril contra a resistência da água.',
        professionalNotes: 'Primeira avaliação funcional aquática. Boa receptividade.',
        functionalTests: [
          { id: 't1', name: 'Marcha Aquática Estacionária 2 min', target: 'Elevação de joelhos', result: 78, unit: 'elevações' },
          { id: 't2', name: 'Flutuação Dorsal com Espaguete', target: 'Relaxamento cervical', result: 45, unit: 'segundos' },
        ],
        optionalMeasurements: {
          restingHeartRate: 78,
          bloodPressureSystolic: 125,
          bloodPressureDiastolic: 80,
        },
        createdAt: `${prevMonthDate}T10:00:00.000Z`,
      },
      {
        id: 'eval_sample_1_recent',
        clientId: 'client_sample_1',
        date: today,
        rpeBorgCR10: 5,
        mobilityNotes: 'Excelente melhora na amplitude de passada aquática e estabilização de tronco.',
        professionalNotes: 'Evolução notória na sustentação postural. Sem queixas lombares no período.',
        functionalTests: [
          { id: 't1', name: 'Marcha Aquática Estacionária 2 min', target: 'Elevação de joelhos', result: 96, unit: 'elevações' },
          { id: 't2', name: 'Flutuação Dorsal com Espaguete', target: 'Relaxamento cervical', result: 90, unit: 'segundos' },
        ],
        optionalMeasurements: {
          restingHeartRate: 72,
          bloodPressureSystolic: 120,
          bloodPressureDiastolic: 78,
        },
        createdAt: `${today}T10:00:00.000Z`,
      },
    ];

    const samplePackages: ClientPackage[] = [
      {
        id: 'pkg_sample_1',
        clientId: 'client_sample_1',
        title: 'Pacote Mensal 8 Sessões',
        totalSessions: 8,
        usedSessions: 7, // Alerta: restam apenas 1 sessão!
        startDate: '2026-03-01',
        price: 850,
        active: true,
      },
      {
        id: 'pkg_sample_2',
        clientId: 'client_sample_2',
        title: 'Pacote Trimestral 24 Sessões',
        totalSessions: 24,
        usedSessions: 14,
        startDate: '2026-02-01',
        price: 2400,
        active: true,
      },
    ];

    const sampleAppointments: Appointment[] = [
      {
        id: 'appt_sample_1',
        clientId: 'client_sample_1',
        date: today,
        time: '08:30',
        location: 'Condomínio Spazio - Piscina Coberta',
        status: 'agendada',
        notes: 'Foco em mobilidade e soltura lombar.',
      },
      {
        id: 'appt_sample_2',
        clientId: 'client_sample_2',
        date: today,
        time: '10:00',
        location: 'Clube Aquático - Raia 3',
        status: 'agendada',
        notes: 'Treino de resistência com hidro-palmares.',
      },
      {
        id: 'appt_sample_3',
        clientId: 'client_sample_3',
        date: today,
        time: '16:00',
        location: 'Academia HidroLife - Piscina 1',
        status: 'agendada',
        notes: 'Adaptação e controle respiratório.',
      },
      // Registro de falta para demonstrar regra de alerta
      {
        id: 'appt_sample_4_old1',
        clientId: 'client_sample_3',
        date: '2026-03-12',
        time: '16:00',
        location: 'Academia HidroLife',
        status: 'falta',
        notes: 'Imprevisto de trabalho.',
      },
      {
        id: 'appt_sample_4_old2',
        clientId: 'client_sample_3',
        date: '2026-03-14',
        time: '16:00',
        location: 'Academia HidroLife',
        status: 'falta',
        notes: 'Chuva forte e trânsito.',
      },
    ];

    const sampleWorkouts: WorkoutSession[] = [
      {
        id: 'wkt_sample_1',
        clientId: 'client_sample_1',
        clientName: 'Dona Maria Helena',
        date: today,
        sessionTitle: 'Hidromobilidade & Alívio Axial Aquático',
        sessionGoal: 'Descompressão da coluna e ativação de core com empuxo hidrostático',
        depthType: 'Piscina Rasa (água no peito)',
        equipments: ['Espaguete (flutuador)', 'Halteres de EVA'],
        targetDurationMinutes: 45,
        totalDurationMinutes: 45,
        warmupDurationMinutes: 10,
        mainDurationMinutes: 25,
        coolDownDurationMinutes: 10,
        generalSafetyGuidance: 'Mantenha os pés firmes no fundo e joelhos semiflexionados para amortecer oscilações da água.',
        exercises: [
          {
            id: 'ex_1',
            phase: 'aquecimento',
            name: 'Marcha Aquática com Balanço Suave de Braços',
            durationMinutes: 5,
            executionInstructions: 'Deslocamento frontal e posterior em ritmo suave, sentindo a viscosidade da água.',
            targetPSE: 'Borg 2-3 (Muito Leve a Leve)',
            progression: 'Aumentar a amplitude da passada.',
            regression: 'Reduzir velocidade e marchar no mesmo lugar.',
            safetyAlert: 'Manter abdômen contraído para proteger a lombar.',
            equipment: 'Nenhum (resistência da água)',
          },
          {
            id: 'ex_2',
            phase: 'aquecimento',
            name: 'Circundução de Ombros e Rotação de Tronco Guiada',
            durationMinutes: 5,
            executionInstructions: 'Pés na largura dos ombros, braços submersos movimentando a água em círculos.',
            targetPSE: 'Borg 3 (Leve)',
            progression: 'Adicionar ligeira rotação da cintura escapular.',
            regression: 'Movimentos menores e mais lentos.',
            safetyAlert: 'Sem giros bruscos da coluna.',
            equipment: 'Nenhum',
          },
          {
            id: 'ex_3',
            phase: 'principal',
            name: 'Abdução e Adução de Membros Inferiores com Apoio do Espaguete',
            durationMinutes: 8,
            executionInstructions: 'Segurando espaguete à frente para estabilidade, afastar e aproximar pernas contra a água.',
            targetPSE: 'Borg 5-6 (Moderado a Forte)',
            progression: 'Realizar sem apoiar os calcanhares no fundo.',
            regression: 'Apoiar o calcanhar a cada 3 repetições.',
            safetyAlert: 'Evitar inclinar o tronco para a frente.',
            equipment: 'Espaguete (flutuador)',
          },
          {
            id: 'ex_4',
            phase: 'principal',
            name: 'Pressão Peitoral e Remada Aquática com Halteres de EVA',
            durationMinutes: 9,
            executionInstructions: 'Empurrar os halteres para frente e puxar de volta submersos na água.',
            targetPSE: 'Borg 6 (Moderado para Forte)',
            progression: 'Aumentar a velocidade do empuxo.',
            regression: 'Reduzir a velocidade do movimento.',
            safetyAlert: 'Manter os ombros baixos e longe das orelhas.',
            equipment: 'Halteres de EVA',
          },
          {
            id: 'ex_5',
            phase: 'principal',
            name: 'Bicicleta Aquática Flutuada com Espaguete sob as Axilas',
            durationMinutes: 8,
            executionInstructions: 'Corpo na vertical flutuando, simular pedalada contínua.',
            targetPSE: 'Borg 6 (Forte)',
            progression: 'Inverter o sentido do pedal para trás.',
            regression: 'Apoiar ponta dos pés se perder estabilidade.',
            safetyAlert: 'Manter coluna neutra sem arqueamento.',
            equipment: 'Espaguete (flutuador)',
          },
          {
            id: 'ex_6',
            phase: 'volta_a_calma',
            name: 'Alongamento em Flutuação Assistida e Respiração Diafragmática',
            durationMinutes: 10,
            executionInstructions: 'Decúbito dorsal assistido pelo professor/espaguete, soltando o ar lentamente.',
            targetPSE: 'Borg 1-2 (Muito Leve)',
            progression: 'Permanecer 40s em relaxamento contínuo.',
            regression: 'Manter os pés apoiados na borda.',
            safetyAlert: 'Verificar suporte cervical e segurança de vias aéreas.',
            equipment: 'Espaguete (flutuador)',
          },
        ],
        completed: false,
        createdAt: `${today}T08:00:00.000Z`,
      },
    ];

    this.setStorageItem(STORAGE_KEYS.CLIENTS, sampleClients);
    this.setStorageItem(STORAGE_KEYS.EVALUATIONS, sampleEvaluations);
    this.setStorageItem(STORAGE_KEYS.PACKAGES, samplePackages);
    this.setStorageItem(STORAGE_KEYS.APPOINTMENTS, sampleAppointments);
    this.setStorageItem(STORAGE_KEYS.WORKOUTS, sampleWorkouts);
    this.setStorageItem(STORAGE_KEYS.ALERT_CONFIG, DEFAULT_ALERT_CONFIG);
  }
}

export const repository = new LocalStorageRepository();

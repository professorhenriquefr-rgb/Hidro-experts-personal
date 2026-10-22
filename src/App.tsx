/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Client,
  Evaluation,
  WorkoutSession,
  Appointment,
  ClientPackage,
  AttentionAlert,
  AlertRuleConfig,
  AppointmentStatus,
} from './types';
import { repository } from './repositories/localStorageRepo';

// Navigation & Notices
import { PermanentNotice } from './components/PermanentNotice';
import { Navigation, TabType } from './components/Navigation';

// Views
import { Dashboard } from './components/Dashboard';
import { ClientList } from './components/clients/ClientList';
import { ClientFormModal } from './components/clients/ClientFormModal';
import { ClientDetailModal } from './components/clients/ClientDetailModal';
import { EvaluationList } from './components/evaluations/EvaluationList';
import { EvaluationFormModal } from './components/evaluations/EvaluationFormModal';
import { WorkoutGenerator } from './components/workouts/WorkoutGenerator';
import { WorkoutExecutionModal } from './components/workouts/WorkoutExecutionModal';
import { AgendaView } from './components/agenda/AgendaView';
import { AppointmentFormModal } from './components/agenda/AppointmentFormModal';
import { PackageModal } from './components/agenda/PackageModal';
import { AlertConfigModal } from './components/agenda/AlertConfigModal';
import { RetentionView } from './components/retention/RetentionView';
import { EvolutionCardModal } from './components/retention/EvolutionCardModal';
import { ProfessionalReport } from './components/reports/ProfessionalReport';
import { BackupModal } from './components/backup/BackupModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  // App State
  const [clients, setClients] = useState<Client[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutSession[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [packages, setPackages] = useState<ClientPackage[]>([]);
  const [alerts, setAlerts] = useState<AttentionAlert[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertRuleConfig>({
    minRemainingSessions: 2,
    maxConsecutiveAbsences: 2,
    daysWithoutEvaluation: 45,
  });

  // Modal States
  const [isClientFormOpen, setIsClientFormOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);

  const [isEvalFormOpen, setIsEvalFormOpen] = useState(false);
  const [evalPreselectedClientId, setEvalPreselectedClientId] = useState<string | undefined>();

  const [isApptFormOpen, setIsApptFormOpen] = useState(false);
  const [apptPreselectedClientId, setApptPreselectedClientId] = useState<string | undefined>();

  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [isAlertConfigOpen, setIsAlertConfigOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const [workoutForExecution, setWorkoutForExecution] = useState<WorkoutSession | null>(null);
  const [evolutionCardClientId, setEvolutionCardClientId] = useState<string | null>(null);

  // Cross-Navigation Preselections
  const [workoutPreselectedClientId, setWorkoutPreselectedClientId] = useState<string | undefined>();
  const [retentionPreselection, setRetentionPreselection] = useState<{
    clientName: string;
    type: 'boas_vindas' | 'ausencia' | 'reposicao' | 'renovacao' | 'parabens_marco';
    phone?: string;
  } | null>(null);

  // Load All Data from Repository
  const loadData = useCallback(async () => {
    try {
      let loadedClients = await repository.getClients();
      // Se for primeira execução e o banco local estiver vazio, carregar exemplos para não começar vazio
      if (loadedClients.length === 0) {
        await repository.loadSampleData();
        loadedClients = await repository.getClients();
      }

      const [loadedEvals, loadedWorkouts, loadedAppts, loadedPkgs, loadedAlerts, loadedConfig] =
        await Promise.all([
          repository.getEvaluations(),
          repository.getWorkouts(),
          repository.getAppointments(),
          repository.getPackages(),
          repository.calculateAttentionAlerts(),
          repository.getAlertConfig(),
        ]);

      setClients(loadedClients);
      setEvaluations(loadedEvals);
      setWorkouts(loadedWorkouts);
      setAppointments(loadedAppts);
      setPackages(loadedPkgs);
      setAlerts(loadedAlerts);
      setAlertConfig(loadedConfig);
    } catch (e) {
      console.error('Falha ao carregar dados do repositório:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Clients Handlers
  const handleSaveClient = async (client: Client) => {
    await repository.saveClient(client);
    await loadData();
    setIsClientFormOpen(false);
    setClientToEdit(null);
  };

  const handleDeleteClient = async (clientId: string) => {
    await repository.deleteClient(clientId);
    await loadData();
    setSelectedClientForDetail(null);
  };

  // Evaluations Handlers
  const handleSaveEvaluation = async (evaluation: Evaluation) => {
    await repository.saveEvaluation(evaluation);
    await loadData();
    setIsEvalFormOpen(false);
  };

  // Workouts Handlers
  const handleSaveWorkout = async (workout: WorkoutSession) => {
    await repository.saveWorkout(workout);
    await loadData();
  };

  const handleSaveExecution = async (
    workoutId: string,
    executionNotes: string,
    completed: boolean
  ) => {
    const existing = await repository.getWorkoutById(workoutId);
    if (existing) {
      const updated: WorkoutSession = {
        ...existing,
        executionNotes,
        completed,
        completedAt: completed ? new Date().toISOString() : undefined,
      };
      await repository.saveWorkout(updated);
      await loadData();
    }
  };

  // Appointments & Presence Handlers
  const handleSaveAppointment = async (appt: Appointment) => {
    await repository.saveAppointment(appt);
    await loadData();
    setIsApptFormOpen(false);
  };

  const handleUpdateAppointmentStatus = async (
    id: string,
    status: AppointmentStatus
  ) => {
    const appts = await repository.getAppointments();
    const appt = appts.find((a) => a.id === id);
    if (appt) {
      const oldStatus = appt.status;
      appt.status = status;
      await repository.saveAppointment(appt);

      // Se havia pacote vinculado e marcou 'presente', atualiza contagem de sessões usadas do pacote
      if (appt.packageId && status === 'presente' && oldStatus !== 'presente') {
        const pkgs = await repository.getPackages();
        const pkg = pkgs.find((p) => p.id === appt.packageId);
        if (pkg && pkg.usedSessions < pkg.totalSessions) {
          pkg.usedSessions += 1;
          await repository.savePackage(pkg);
        }
      }
      await loadData();
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    await repository.deleteAppointment(id);
    await loadData();
  };

  // Packages Handlers
  const handleSavePackage = async (pkg: ClientPackage) => {
    await repository.savePackage(pkg);
    await loadData();
  };

  const handleDeletePackage = async (id: string) => {
    await repository.deletePackage(id);
    await loadData();
  };

  // Alert Config Handler
  const handleSaveAlertConfig = async (config: AlertRuleConfig) => {
    await repository.saveAlertConfig(config);
    await loadData();
  };

  // Today Appointments
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  const clientForEvolutionModal = clients.find((c) => c.id === evolutionCardClientId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Aviso Permanente de Armazenamento Local e Responsabilidade Técnica CREF */}
      <PermanentNotice />

      {/* Top Header & Navigation */}
      <Navigation
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setRetentionPreselection(null);
        }}
        onOpenBackup={() => setIsBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
            <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-semibold">Carregando dados da piscina...</span>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                clients={clients}
                todayAppointments={todayAppointments}
                alerts={alerts}
                recentWorkouts={workouts}
                onSelectTab={setActiveTab}
                onOpenNewClient={() => {
                  setClientToEdit(null);
                  setIsClientFormOpen(true);
                }}
                onOpenNewAppointment={() => {
                  setApptPreselectedClientId(undefined);
                  setIsApptFormOpen(true);
                }}
                onOpenNewWorkout={(cId) => {
                  setWorkoutPreselectedClientId(cId);
                  setActiveTab('workouts');
                }}
                onOpenNewEvaluation={(cId) => {
                  setEvalPreselectedClientId(cId);
                  setIsEvalFormOpen(true);
                }}
                onOpenRetentionMessage={(clientName, type, phone) => {
                  setRetentionPreselection({ clientName, type, phone });
                  setActiveTab('retention');
                }}
                onStartExecution={(wkt) => setWorkoutForExecution(wkt)}
                onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
              />
            )}

            {activeTab === 'clients' && (
              <ClientList
                clients={clients}
                onOpenNewClient={() => {
                  setClientToEdit(null);
                  setIsClientFormOpen(true);
                }}
                onSelectClient={(c) => setSelectedClientForDetail(c)}
                onOpenNewWorkout={(cId) => {
                  setWorkoutPreselectedClientId(cId);
                  setActiveTab('workouts');
                }}
                onOpenNewEvaluation={(cId) => {
                  setEvalPreselectedClientId(cId);
                  setIsEvalFormOpen(true);
                }}
              />
            )}

            {activeTab === 'evaluations' && (
              <EvaluationList
                evaluations={evaluations}
                clients={clients}
                onOpenNewEvaluation={(cId) => {
                  setEvalPreselectedClientId(cId);
                  setIsEvalFormOpen(true);
                }}
              />
            )}

            {activeTab === 'workouts' && (
              <WorkoutGenerator
                clients={clients}
                evaluations={evaluations}
                savedWorkouts={workouts}
                preSelectedClientId={workoutPreselectedClientId}
                onSaveWorkout={handleSaveWorkout}
                onStartExecution={(wkt) => setWorkoutForExecution(wkt)}
              />
            )}

            {activeTab === 'agenda' && (
              <AgendaView
                appointments={appointments}
                clients={clients}
                packages={packages}
                onOpenNewAppointment={() => {
                  setApptPreselectedClientId(undefined);
                  setIsApptFormOpen(true);
                }}
                onOpenPackageManager={() => setIsPackageModalOpen(true)}
                onOpenAlertSettings={() => setIsAlertConfigOpen(true)}
                onUpdateStatus={handleUpdateAppointmentStatus}
                onDeleteAppointment={handleDeleteAppointment}
              />
            )}

            {activeTab === 'retention' && (
              <RetentionView
                clients={clients}
                alerts={alerts}
                packages={packages}
                appointments={appointments}
                preSelectedClientName={retentionPreselection?.clientName}
                preSelectedType={retentionPreselection?.type}
                preSelectedPhone={retentionPreselection?.phone}
              />
            )}

            {activeTab === 'reports' && (
              <ProfessionalReport
                clients={clients}
                appointments={appointments}
                packages={packages}
                evaluations={evaluations}
                onOpenEvolutionCard={(cId) => setEvolutionCardClientId(cId)}
              />
            )}
          </>
        )}
      </main>

      {/* MODALS */}
      {/* 1. Client Form Modal */}
      <ClientFormModal
        isOpen={isClientFormOpen}
        onClose={() => {
          setIsClientFormOpen(false);
          setClientToEdit(null);
        }}
        onSave={handleSaveClient}
        clientToEdit={clientToEdit}
      />

      {/* 2. Client Detail Modal */}
      {selectedClientForDetail && (
        <ClientDetailModal
          isOpen={!!selectedClientForDetail}
          onClose={() => setSelectedClientForDetail(null)}
          client={selectedClientForDetail}
          evaluations={evaluations.filter((e) => e.clientId === selectedClientForDetail.id)}
          workouts={workouts.filter((w) => w.clientId === selectedClientForDetail.id)}
          packages={packages.filter((p) => p.clientId === selectedClientForDetail.id)}
          onEditClient={(client) => {
            setClientToEdit(client);
            setIsClientFormOpen(true);
          }}
          onDeleteClient={handleDeleteClient}
          onOpenNewWorkout={(cId) => {
            setWorkoutPreselectedClientId(cId);
            setActiveTab('workouts');
          }}
          onOpenNewEvaluation={(cId) => {
            setEvalPreselectedClientId(cId);
            setIsEvalFormOpen(true);
          }}
          onOpenEvolutionCard={(cId) => setEvolutionCardClientId(cId)}
        />
      )}

      {/* 3. Evaluation Form Modal */}
      <EvaluationFormModal
        isOpen={isEvalFormOpen}
        onClose={() => setIsEvalFormOpen(false)}
        clients={clients}
        preSelectedClientId={evalPreselectedClientId}
        onSave={handleSaveEvaluation}
      />

      {/* 4. Appointment Form Modal */}
      <AppointmentFormModal
        isOpen={isApptFormOpen}
        onClose={() => setIsApptFormOpen(false)}
        clients={clients}
        packages={packages}
        preSelectedClientId={apptPreselectedClientId}
        onSave={handleSaveAppointment}
      />

      {/* 5. Package Management Modal */}
      <PackageModal
        isOpen={isPackageModalOpen}
        onClose={() => setIsPackageModalOpen(false)}
        clients={clients}
        packages={packages}
        onSavePackage={handleSavePackage}
        onDeletePackage={handleDeletePackage}
      />

      {/* 6. Alert Config Rules Modal */}
      <AlertConfigModal
        isOpen={isAlertConfigOpen}
        onClose={() => setIsAlertConfigOpen(false)}
        currentConfig={alertConfig}
        onSaveConfig={handleSaveAlertConfig}
      />

      {/* 7. Poolside Workout Execution Modal */}
      {workoutForExecution && (
        <WorkoutExecutionModal
          isOpen={!!workoutForExecution}
          onClose={() => setWorkoutForExecution(null)}
          workout={workoutForExecution}
          onSaveExecution={handleSaveExecution}
        />
      )}

      {/* 8. Monthly Evolution Card Modal */}
      {clientForEvolutionModal && (
        <EvolutionCardModal
          isOpen={!!evolutionCardClientId}
          onClose={() => setEvolutionCardClientId(null)}
          client={clientForEvolutionModal}
          evaluations={evaluations}
          appointments={appointments}
        />
      )}

      {/* 9. Backup & Data Management Modal */}
      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        onDataChanged={loadData}
      />
    </div>
  );
}

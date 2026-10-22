import React from 'react';
import {
  Users,
  Calendar,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  PlayCircle,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Flame,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Client, Appointment, AttentionAlert, WorkoutSession } from '../types';
import { TabType } from './Navigation';

interface DashboardProps {
  clients: Client[];
  todayAppointments: Appointment[];
  alerts: AttentionAlert[];
  recentWorkouts: WorkoutSession[];
  onSelectTab: (tab: TabType) => void;
  onOpenNewClient: () => void;
  onOpenNewAppointment: () => void;
  onOpenNewWorkout: (clientId?: string) => void;
  onOpenNewEvaluation: (clientId?: string) => void;
  onOpenRetentionMessage: (clientName: string, type: 'ausencia' | 'renovacao' | 'boas_vindas' | 'parabens_marco' | 'reposicao', phone?: string) => void;
  onStartExecution: (workout: WorkoutSession) => void;
  onUpdateAppointmentStatus: (appointmentId: string, status: 'presente' | 'falta' | 'reposicao' | 'cancelada') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  clients,
  todayAppointments,
  alerts,
  recentWorkouts,
  onSelectTab,
  onOpenNewClient,
  onOpenNewAppointment,
  onOpenNewWorkout,
  onOpenNewEvaluation,
  onOpenRetentionMessage,
  onStartExecution,
  onUpdateAppointmentStatus,
}) => {
  const activeClientsCount = clients.filter((c) => c.active).length;
  const completedTodayCount = todayAppointments.filter((a) => a.status === 'presente').length;

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Hero Welcome & Quick Summary */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-cyan-950 p-5 rounded-2xl border border-cyan-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Borda da Piscina
              </span>
              <span className="text-xs text-slate-400">
                {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
              </span>
            </div>
            <h1 className="text-2xl font-black text-white">
              Painel Prof. Henrique Aquafitness
            </h1>
            <p className="text-sm text-cyan-100/80 mt-1 max-w-xl">
              Gerencie sessões aquáticas, controle presença, consulte alertas de retenção e acione treinos individualizados na beira da piscina.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 shrink-0">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20 text-center min-w-[90px]">
              <span className="text-2xl font-black text-cyan-400 block">{todayAppointments.length}</span>
              <span className="text-[11px] text-slate-300 font-medium">Sessões Hoje</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-cyan-500/20 text-center min-w-[90px]">
              <span className="text-2xl font-black text-white block">{activeClientsCount}</span>
              <span className="text-[11px] text-slate-300 font-medium">Alunos Ativos</span>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-amber-500/30 text-center min-w-[90px]">
              <span className="text-2xl font-black text-amber-400 block">{alerts.length}</span>
              <span className="text-[11px] text-amber-200 font-medium">Avisos</span>
            </div>
          </div>
        </div>

        {/* Rapid Poolside Shortcuts */}
        <div className="mt-5 pt-4 border-t border-cyan-500/20 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => onOpenNewWorkout()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/30 shrink-0 transition cursor-pointer active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>Gerar Treino com IA</span>
          </button>
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 shrink-0 transition cursor-pointer active:scale-95"
          >
            <PlusCircle className="w-4 h-4 text-cyan-400" />
            <span>Novo Aluno</span>
          </button>
          <button
            onClick={onOpenNewAppointment}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 shrink-0 transition cursor-pointer active:scale-95"
          >
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span>Agendar Sessão</span>
          </button>
          <button
            onClick={() => onOpenNewEvaluation()}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 shrink-0 transition cursor-pointer active:scale-95"
          >
            <ClipboardList className="w-4 h-4 text-cyan-400" />
            <span>Nova Avaliação</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Sessões do Dia */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Sessões de Hoje</h2>
              <span className="text-xs bg-slate-800 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-800">
                {completedTodayCount}/{todayAppointments.length} concluídas
              </span>
            </div>
            <button
              onClick={() => onSelectTab('agenda')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
            >
              Ver agenda completa <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl p-8 text-center">
              <Calendar className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-slate-400 text-sm font-medium">
                Nenhuma sessão agendada para hoje.
              </p>
              <button
                onClick={onOpenNewAppointment}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Agendar sessão para hoje
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((appt) => {
                const client = getClient(appt.clientId);
                const hasRestrictions = !!client?.restrictionsCare?.trim();
                const clientWorkouts = recentWorkouts.filter((w) => w.clientId === appt.clientId);
                const latestWorkout = clientWorkouts[0];

                return (
                  <div
                    key={appt.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      appt.status === 'presente'
                        ? 'bg-emerald-950/20 border-emerald-800/40'
                        : appt.status === 'falta'
                        ? 'bg-rose-950/20 border-rose-800/40'
                        : 'bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="bg-cyan-950 border border-cyan-800 text-cyan-400 font-black text-sm px-2.5 py-1.5 rounded-xl shrink-0 text-center">
                          {appt.time}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-base">
                              {client?.nameOrNickname || 'Aluno não identificado'}
                            </span>
                            {client?.isExample && (
                              <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                [EXEMPLO]
                              </span>
                            )}
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                              appt.status === 'presente'
                                ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/50'
                                : appt.status === 'falta'
                                ? 'bg-rose-900/60 text-rose-300 border border-rose-700/50'
                                : appt.status === 'reposicao'
                                ? 'bg-amber-900/60 text-amber-300 border border-amber-700/50'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}>
                              {appt.status.toUpperCase()}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span className="truncate">{appt.location}</span>
                          </div>

                          {/* Alerta de Restrições na Borda da Piscina */}
                          {hasRestrictions && (
                            <div className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] bg-amber-950/50 text-amber-200 border border-amber-800/40 px-2 py-0.5 rounded-lg">
                              <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                              <span className="font-medium">Cuidados: {client?.restrictionsCare}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Botões de Ação Imediata na Piscina */}
                      <div className="flex items-center gap-1.5 flex-wrap self-end sm:self-auto">
                        {latestWorkout ? (
                          <button
                            onClick={() => onStartExecution(latestWorkout)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm active:scale-95"
                            title="Iniciar cronômetro e execução guiada na borda da piscina"
                          >
                            <PlayCircle className="w-4 h-4 text-slate-950" />
                            <span>Executar Treino</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onOpenNewWorkout(appt.clientId)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition cursor-pointer active:scale-95"
                            title="Gerar sessão com IA para este aluno"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Montar Sessão</span>
                          </button>
                        )}

                        {/* Presença / Falta */}
                        {appt.status !== 'presente' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'presente')}
                            className="p-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/60 transition cursor-pointer"
                            title="Marcar Presença"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {appt.status !== 'falta' && (
                          <button
                            onClick={() => onUpdateAppointmentStatus(appt.id, 'falta')}
                            className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-800/60 transition cursor-pointer"
                            title="Registrar Falta"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Clientes que Precisam de Atenção (Regras Explícitas) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Atenção & Retenção</h2>
            </div>
            <button
              onClick={() => onSelectTab('retention')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
            >
              Ver todos
            </button>
          </div>

          <div className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              Alertas gerados por <strong>regras operacionais explícitas</strong> (saldo de pacotes, faltas consecutivas e tempo sem reavaliação).
            </span>
          </div>

          {alerts.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-200">
                Tudo em dia com seus alunos!
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Nenhum pacote expirando ou faltas excessivas no momento.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.slice(0, 4).map((alert) => {
                const client = getClient(alert.clientId);
                return (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-2xl border ${
                      alert.severity === 'danger'
                        ? 'bg-rose-950/30 border-rose-800/50'
                        : alert.severity === 'warning'
                        ? 'bg-amber-950/30 border-amber-800/50'
                        : 'bg-blue-950/30 border-cyan-800/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-bold text-white text-sm block">
                          {alert.clientName}
                        </span>
                        <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                          {alert.reason}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Regra: {alert.actionType === 'renew_package' ? 'Pacote' : alert.actionType === 'contact_absence' ? 'Falta Recente' : 'Reavaliação'}
                      </span>
                      <button
                        onClick={() => {
                          if (alert.actionType === 'renew_package') {
                            onOpenRetentionMessage(alert.clientName, 'renovacao', client?.phone);
                          } else if (alert.actionType === 'contact_absence') {
                            onOpenRetentionMessage(alert.clientName, 'ausencia', client?.phone);
                          } else {
                            onOpenNewEvaluation(alert.clientId);
                          }
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{alert.actionLabel}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

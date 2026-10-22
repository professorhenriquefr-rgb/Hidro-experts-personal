import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Package,
  Sliders,
  ChevronLeft,
  ChevronRight,
  User,
  AlertTriangle,
} from 'lucide-react';
import { Appointment, AppointmentStatus, Client, ClientPackage } from '../../types';

interface AgendaViewProps {
  appointments: Appointment[];
  clients: Client[];
  packages: ClientPackage[];
  onOpenNewAppointment: () => void;
  onOpenPackageManager: () => void;
  onOpenAlertSettings: () => void;
  onUpdateStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  onDeleteAppointment: (id: string) => Promise<void>;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  appointments,
  clients,
  packages,
  onOpenNewAppointment,
  onOpenPackageManager,
  onOpenAlertSettings,
  onUpdateStatus,
  onDeleteAppointment,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredAppointments = appointments
    .filter((a) => {
      const matchesDate = a.date === selectedDate;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      return matchesDate && matchesStatus;
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  const getClient = (clientId: string) => clients.find((c) => c.id === clientId);

  const handleDayOffset = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const statusBadges: Record<AppointmentStatus, { label: string; style: string }> = {
    agendada: { label: 'Agendada', style: 'bg-slate-800 text-slate-300 border-slate-700' },
    presente: { label: 'Presente', style: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    falta: { label: 'Falta', style: 'bg-rose-950 text-rose-300 border-rose-800' },
    reposicao: { label: 'Reposição', style: 'bg-amber-950 text-amber-300 border-amber-800' },
    cancelada: { label: 'Cancelada', style: 'bg-slate-900 text-slate-500 border-slate-800 line-through' },
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Agenda & Controle de Pacotes</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de presença, reposições, pacotes e controle de saldo aquático
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenPackageManager}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer"
          >
            <Package className="w-4 h-4 text-cyan-400" />
            <span>Pacotes & Saldo</span>
          </button>

          <button
            onClick={onOpenAlertSettings}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition cursor-pointer"
            title="Configurar Regras de Alerta"
          >
            <Sliders className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewAppointment}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Agendar Sessão</span>
          </button>
        </div>
      </div>

      {/* Date Switcher Bar */}
      <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={() => handleDayOffset(-1)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs outline-hidden"
          />

          <button
            onClick={() => handleDayOffset(1)}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold cursor-pointer"
          >
            Hoje
          </button>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto">
          {['all', 'agendada', 'presente', 'falta', 'reposicao'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold capitalize transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards */}
      {filteredAppointments.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
          <CalendarIcon className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">
            Nenhuma sessão encontrada para {new Date(selectedDate + 'T00:00:00').toLocaleDateString('pt-BR')}.
          </p>
          <button
            onClick={onOpenNewAppointment}
            className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Agendar nesta data
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredAppointments.map((appt) => {
            const client = getClient(appt.clientId);
            const clientPkg = packages.find((p) => p.id === appt.packageId);
            const badge = statusBadges[appt.status] || statusBadges.agendada;

            return (
              <div
                key={appt.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono font-black text-sm px-3 py-2 rounded-xl shrink-0 text-center">
                    {appt.time}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-white text-base">
                        {client?.nameOrNickname || 'Aluno não encontrado'}
                      </span>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badge.style}`}>
                        {badge.label}
                      </span>
                      {clientPkg && (
                        <span className="text-[10px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                          {clientPkg.title} ({clientPkg.totalSessions - clientPkg.usedSessions} rest.)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{appt.location}</span>
                      {appt.notes && (
                        <>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-300 italic">{appt.notes}</span>
                        </>
                      )}
                    </div>

                    {client?.restrictionsCare && (
                      <div className="mt-1.5 text-[11px] text-amber-300 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-400" />
                        <span>Cuidado informado: {client.restrictionsCare}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Toggles na Borda da Piscina */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto flex-wrap">
                  <button
                    onClick={() => onUpdateStatus(appt.id, 'presente')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      appt.status === 'presente'
                        ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950 hover:bg-emerald-950 text-emerald-400 border border-emerald-900/50'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Presente</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(appt.id, 'falta')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      appt.status === 'falta'
                        ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                        : 'bg-slate-950 hover:bg-rose-950 text-rose-400 border border-rose-900/50'
                    }`}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Falta</span>
                  </button>

                  <button
                    onClick={() => onUpdateStatus(appt.id, 'reposicao')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                      appt.status === 'reposicao'
                        ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                        : 'bg-slate-950 hover:bg-amber-950 text-amber-300 border border-amber-900/50'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reposição</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import {
  BarChart3,
  Users,
  CheckCircle2,
  XCircle,
  Package,
  TrendingUp,
  Award,
  Calendar,
  Waves,
} from 'lucide-react';
import { Client, Appointment, ClientPackage, Evaluation } from '../../types';

interface ProfessionalReportProps {
  clients: Client[];
  appointments: Appointment[];
  packages: ClientPackage[];
  evaluations: Evaluation[];
  onOpenEvolutionCard: (clientId: string) => void;
}

export const ProfessionalReport: React.FC<ProfessionalReportProps> = ({
  clients,
  appointments,
  packages,
  evaluations,
  onOpenEvolutionCard,
}) => {
  const activeClients = clients.filter((c) => c.active);
  const totalAppointments = appointments.length;
  const presentAppointments = appointments.filter((a) => a.status === 'presente');
  const absenceAppointments = appointments.filter((a) => a.status === 'falta');
  const replacementAppointments = appointments.filter((a) => a.status === 'reposicao');

  const attendanceRate =
    totalAppointments > 0
      ? Math.round((presentAppointments.length / totalAppointments) * 100)
      : 100;

  // Pacotes perto de renovação (saldo <= 2)
  const expiringPackages = packages.filter((p) => {
    const remaining = p.totalSessions - p.usedSessions;
    return p.active && remaining <= 2;
  });

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-black text-white">Relatório do Profissional</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Visão global de adesão, frequência nas raias, saúde de pacotes e retenção — Prof. Henrique Aquafitness
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Alunos Ativos</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl font-black text-white">{activeClients.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Total cadastrados: {clients.length}</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Frequência Média</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">{attendanceRate}%</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {presentAppointments.length} presenças registradas
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Faltas no Período</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <span className="text-2xl font-black text-rose-400">{absenceAppointments.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">
            {replacementAppointments.length} em reposição
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>Renovações Próximas</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400">{expiringPackages.length}</span>
          <span className="text-[11px] text-slate-400 block mt-1">Pacotes com saldo ≤ 2</span>
        </div>
      </div>

      {/* Relatório por Aluno com Frequência Individual */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-white flex items-center justify-between">
          <span>Desempenho & Aderência Individual</span>
          <span className="text-xs text-cyan-400 font-semibold">{clients.length} alunos monitorados</span>
        </h2>

        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-300 uppercase tracking-wider font-bold border-b border-slate-800">
              <tr>
                <th className="py-3 px-3">Aluno</th>
                <th className="py-3 px-3">Nível</th>
                <th className="py-3 px-3">Presenças / Total</th>
                <th className="py-3 px-3">Aderência</th>
                <th className="py-3 px-3">Pacote Atual</th>
                <th className="py-3 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/60">
              {clients.map((client) => {
                const clientAppts = appointments.filter((a) => a.clientId === client.id);
                const presents = clientAppts.filter((a) => a.status === 'presente').length;
                const total = clientAppts.filter((a) => a.status !== 'cancelada').length;
                const rate = total > 0 ? Math.round((presents / total) * 100) : 100;
                const pkg = packages.find((p) => p.clientId === client.id && p.active);
                const remaining = pkg ? pkg.totalSessions - pkg.usedSessions : null;

                return (
                  <tr key={client.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3 px-3 font-bold text-white">
                      {client.nameOrNickname}
                      {client.isExample && (
                        <span className="ml-1.5 text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">
                          [EXEMPLO]
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-400 capitalize">
                      {client.experienceLevel.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {presents} de {total} sessões
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`font-black ${
                          rate >= 80 ? 'text-emerald-400' : rate >= 60 ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        {rate}%
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      {pkg ? (
                        <span className={`font-semibold ${remaining !== null && remaining <= 2 ? 'text-amber-400' : 'text-cyan-300'}`}>
                          {remaining} rest. ({pkg.title})
                        </span>
                      ) : (
                        <span className="text-slate-500">Sem pacote ativo</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onOpenEvolutionCard(client.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition cursor-pointer"
                      >
                        Gerar Cartão Mensal
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

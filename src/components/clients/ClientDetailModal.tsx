import React, { useState } from 'react';
import {
  X,
  Phone,
  Calendar,
  Sparkles,
  ClipboardList,
  Edit2,
  Trash2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Client, Evaluation, WorkoutSession, ClientPackage } from '../../types';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client;
  evaluations: Evaluation[];
  workouts: WorkoutSession[];
  packages: ClientPackage[];
  onEditClient: (client: Client) => void;
  onDeleteClient: (clientId: string) => Promise<void>;
  onOpenNewWorkout: (clientId: string) => void;
  onOpenNewEvaluation: (clientId: string) => void;
  onOpenEvolutionCard: (clientId: string) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  evaluations,
  workouts,
  packages,
  onEditClient,
  onDeleteClient,
  onOpenNewWorkout,
  onOpenNewEvaluation,
  onOpenEvolutionCard,
}) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const experienceLabels: Record<string, string> = {
    adaptacao_aquatica: 'Adaptação Aquática',
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  };

  const activePackage = packages.find((p) => p.active);

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      await onDeleteClient(client.id);
      onClose();
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">{client.nameOrNickname}</h2>
              {client.isExample && (
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                  [EXEMPLO FICTÍCIO]
                </span>
              )}
            </div>
            <p className="text-xs text-cyan-300 font-medium mt-0.5">
              Nível: {experienceLabels[client.experienceLevel] || client.experienceLevel} • Início: {client.startDate}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4">
          {/* Main Objective */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-1">
              Objetivo Principal
            </span>
            <p className="text-sm font-medium text-white">{client.mainObjective}</p>
          </div>

          {/* Restrictions and Care (Highlighted) */}
          <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-800/40">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">
                Restrições e Cuidados na Borda da Piscina (Campo Livre)
              </span>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              {client.restrictionsCare ? client.restrictionsCare : 'Nenhum cuidado especial informado.'}
            </p>
          </div>

          {/* Contact and Package Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block">WhatsApp / Telefone</span>
                <span className="text-sm font-semibold text-white">
                  {client.phone ? client.phone : 'Não informado'}
                </span>
              </div>
              {client.phone && (
                <a
                  href={`https://wa.me/55${client.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 text-xs font-semibold flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" /> Abrir WhatsApp
                </a>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400 block">Pacote Ativo</span>
              {activePackage ? (
                <div className="text-xs text-cyan-300 font-semibold mt-0.5">
                  {activePackage.title} ({activePackage.totalSessions - activePackage.usedSessions} sessões restantes)
                </div>
              ) : (
                <span className="text-xs text-slate-500">Nenhum pacote ativo registrado</span>
              )}
            </div>
          </div>

          {/* Professional Notes */}
          {client.professionalNotes && (
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Anotações do Profissional
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">{client.professionalNotes}</p>
            </div>
          )}

          {/* Quick Metrics for this client */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xl font-black text-cyan-400 block">{evaluations.length}</span>
              <span className="text-[11px] text-slate-400">Avaliações</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xl font-black text-white block">{workouts.length}</span>
              <span className="text-[11px] text-slate-400">Treinos Salvos</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <span className="text-xl font-black text-emerald-400 block">
                {workouts.filter((w) => w.completed).length}
              </span>
              <span className="text-[11px] text-slate-400">Concluídos</span>
            </div>
          </div>

          {/* Action Buttons for this client */}
          <div className="pt-2 flex flex-wrap gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenNewWorkout(client.id);
              }}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold shadow-md shadow-cyan-500/20 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Gerar Treino IA</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenNewEvaluation(client.id);
              }}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-cyan-500/30 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <span>Nova Avaliação</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenEvolutionCard(client.id);
              }}
              className="flex-1 min-w-[140px] inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>Cartão de Evolução</span>
            </button>
          </div>

          {/* LGPD Stamp */}
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>
              Consentimento LGPD profissional registrado em {new Date(client.consentAcceptedAt).toLocaleDateString('pt-BR')}.
            </span>
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                onEditClient(client);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" /> Editar Cadastro
            </button>

            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-950 text-rose-300 text-xs font-semibold border border-rose-800/40 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Apagar Todos os Dados
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 font-bold">Confirmar exclusão definitiva?</span>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? 'Apagando...' : 'Sim, Apagar Tudo'}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

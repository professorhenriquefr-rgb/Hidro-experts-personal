import React, { useState } from 'react';
import {
  Users,
  PlusCircle,
  Search,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  ChevronRight,
  Phone,
} from 'lucide-react';
import { Client, ExperienceLevel } from '../../types';

interface ClientListProps {
  clients: Client[];
  onOpenNewClient: () => void;
  onSelectClient: (client: Client) => void;
  onOpenNewWorkout: (clientId: string) => void;
  onOpenNewEvaluation: (clientId: string) => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  onOpenNewClient,
  onSelectClient,
  onOpenNewWorkout,
  onOpenNewEvaluation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.nameOrNickname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.mainObjective.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone && c.phone.includes(searchTerm));
    const matchesLevel = levelFilter === 'all' || c.experienceLevel === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const experienceLabels: Record<ExperienceLevel, string> = {
    adaptacao_aquatica: 'Adaptação Aquática',
    iniciante: 'Iniciante',
    intermediario: 'Intermediário',
    avancado: 'Avançado',
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Alunos Cadastrados</h1>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-cyan-950 border border-cyan-800 text-cyan-300">
              {clients.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão individualizada de personal aquático — Prof. Henrique Aquafitness
          </p>
        </div>

        <button
          onClick={onOpenNewClient}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/20 transition cursor-pointer active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" />
          <span>Cadastrar Novo Aluno</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, apelido ou objetivo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-white text-sm outline-hidden placeholder:text-slate-500"
          />
        </div>

        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          aria-label="Filtrar por nível de experiência"
          className="px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-slate-200 text-sm outline-hidden cursor-pointer"
        >
          <option value="all">Todos os Níveis</option>
          <option value="adaptacao_aquatica">Adaptação Aquática</option>
          <option value="iniciante">Iniciante</option>
          <option value="intermediario">Intermediário</option>
          <option value="avancado">Avançado</option>
        </select>
      </div>

      {/* Client List Grid */}
      {filteredClients.length === 0 ? (
        <div className="p-12 text-center bg-slate-900/60 rounded-2xl border border-dashed border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">Nenhum aluno encontrado</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {searchTerm || levelFilter !== 'all'
              ? 'Tente ajustar os filtros de busca para encontrar o aluno.'
              : 'Comece cadastrando seu primeiro aluno de personal aquático.'}
          </p>
          <button
            onClick={onOpenNewClient}
            className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" /> Cadastrar Aluno
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const hasRestrictions = !!client.restrictionsCare?.trim();
            return (
              <div
                key={client.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 transition-all shadow-sm flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold text-white text-base group-hover:text-cyan-300 transition">
                          {client.nameOrNickname}
                        </h2>
                        {client.isExample && (
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                            [EXEMPLO]
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-cyan-400">
                        {experienceLabels[client.experienceLevel] || client.experienceLevel}
                      </span>
                    </div>

                    {client.phone && (
                      <a
                        href={`https://wa.me/55${client.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-800/60 text-emerald-400 transition"
                        title="Conversar no WhatsApp"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    <strong>Objetivo:</strong> {client.mainObjective}
                  </p>

                  {hasRestrictions && (
                    <div className="mt-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-900/40 text-[11px] text-amber-200 flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        <strong>Cuidados:</strong> {client.restrictionsCare}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenNewWorkout(client.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-semibold transition cursor-pointer"
                      title="Gerar Treino Aquático com IA"
                    >
                      <Sparkles className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onOpenNewEvaluation(client.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-xs font-semibold transition cursor-pointer"
                      title="Nova Avaliação Funcional Aquática"
                    >
                      <ClipboardList className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => onSelectClient(client)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition cursor-pointer"
                  >
                    <span>Ficha Completa</span>
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
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

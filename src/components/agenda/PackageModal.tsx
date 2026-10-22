import React, { useState } from 'react';
import { X, Save, PackagePlus, AlertCircle, Trash2 } from 'lucide-react';
import { ClientPackage, Client } from '../../types';

interface PackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  packages: ClientPackage[];
  onSavePackage: (pkg: ClientPackage) => Promise<void>;
  onDeletePackage: (pkgId: string) => Promise<void>;
}

export const PackageModal: React.FC<PackageModalProps> = ({
  isOpen,
  onClose,
  clients,
  packages,
  onSavePackage,
  onDeletePackage,
}) => {
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [title, setTitle] = useState('Pacote Mensal 8 Sessões');
  const [totalSessions, setTotalSessions] = useState<number>(8);
  const [usedSessions, setUsedSessions] = useState<number>(0);
  const [price, setPrice] = useState<string>('850');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!clientId) {
      setErrorMessage('Selecione o aluno para o pacote.');
      return;
    }
    if (!title.trim() || totalSessions <= 0) {
      setErrorMessage('Informe o nome do pacote e a quantidade de sessões.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const newPkg: ClientPackage = {
        id: `pkg_${Date.now()}`,
        clientId,
        title: title.trim(),
        totalSessions,
        usedSessions: Math.min(totalSessions, Math.max(0, usedSessions)),
        startDate,
        price: price ? parseFloat(price) : undefined,
        active: true,
      };

      await onSavePackage(newPkg);
      setTitle('Pacote Mensal 8 Sessões');
      setTotalSessions(8);
      setUsedSessions(0);
    } catch (e: any) {
      setErrorMessage(e?.message || 'Erro ao salvar pacote.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getClientName = (id: string) => clients.find((c) => c.id === id)?.nameOrNickname || 'Aluno';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-2xl w-full p-6 text-white shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Gestão de Pacotes & Saldo</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prof. Henrique Aquafitness — Controle financeiro e de sessões
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Novo Pacote Form */}
        <form onSubmit={handleSubmit} className="mt-4 p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <span className="text-xs font-bold text-cyan-300 block">Cadastrar Novo Pacote de Sessões</span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Aluno *</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-hidden cursor-pointer"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameOrNickname}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Nome do Pacote *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Pacote Mensal 8 Sessões"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Total Sessões *</label>
              <input
                type="number"
                min="1"
                required
                value={totalSessions}
                onChange={(e) => setTotalSessions(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Sessões Já Usadas</label>
              <input
                type="number"
                min="0"
                value={usedSessions}
                onChange={(e) => setUsedSessions(parseInt(e.target.value, 10) || 0)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-300 mb-1">Valor Total (R$)</label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="850.00"
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition cursor-pointer disabled:opacity-50"
            >
              Adicionar Pacote
            </button>
          </div>
        </form>

        {/* Lista de Pacotes Ativos */}
        <div className="mt-6 space-y-3">
          <h3 className="text-sm font-bold text-white">Pacotes Cadastrados</h3>

          {packages.length === 0 ? (
            <p className="text-xs text-slate-400">Nenhum pacote cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {packages.map((pkg) => {
                const remaining = pkg.totalSessions - pkg.usedSessions;
                const isEnding = remaining <= 2;

                return (
                  <div
                    key={pkg.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {getClientName(pkg.clientId)}
                        </span>
                        <span className="text-xs text-cyan-300 font-semibold">• {pkg.title}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>Utilizadas: {pkg.usedSessions}/{pkg.totalSessions}</span>
                        <span>•</span>
                        <span className={`font-bold ${isEnding ? 'text-amber-400' : 'text-emerald-400'}`}>
                          Saldo: {remaining} {remaining === 1 ? 'restante' : 'restantes'}
                        </span>
                        {pkg.price && <span>• R$ {pkg.price.toFixed(2)}</span>}
                      </div>
                    </div>

                    <button
                      onClick={() => onDeletePackage(pkg.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition cursor-pointer"
                      title="Excluir Pacote"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

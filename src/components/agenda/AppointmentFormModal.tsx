import React, { useState } from 'react';
import { X, Save, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react';
import { Appointment, AppointmentStatus, Client, ClientPackage } from '../../types';

interface AppointmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  packages: ClientPackage[];
  preSelectedClientId?: string;
  preSelectedDate?: string;
  onSave: (appointment: Appointment) => Promise<void>;
}

export const AppointmentFormModal: React.FC<AppointmentFormModalProps> = ({
  isOpen,
  onClose,
  clients,
  packages,
  preSelectedClientId,
  preSelectedDate,
  onSave,
}) => {
  const [clientId, setClientId] = useState(preSelectedClientId || (clients[0]?.id ?? ''));
  const [date, setDate] = useState(
    preSelectedDate || new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState('08:00');
  const [location, setLocation] = useState('Piscina do Condomínio');
  const [status, setStatus] = useState<AppointmentStatus>('agendada');
  const [packageId, setPackageId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const clientPackages = packages.filter((p) => p.clientId === clientId && p.active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!clientId) {
      setErrorMessage('Selecione um aluno.');
      return;
    }
    if (!date || !time) {
      setErrorMessage('Informe a data e o horário da sessão.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const appt: Appointment = {
        id: `appt_${Date.now()}`,
        clientId,
        date,
        time,
        location: location.trim() || 'Piscina Principal',
        status,
        packageId: packageId || undefined,
        notes: notes.trim(),
      };

      await onSave(appt);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao agendar sessão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultLocations = [
    'Piscina do Condomínio',
    'Clube Aquático - Raia 2',
    'Academia HidroLife - Piscina Aquecida',
    'Piscina Residencial Privativa',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">Agendar Sessão de Hidro</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prof. Henrique Aquafitness — Controle de agenda e pacotes
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Aluno(a) *
            </label>
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setPackageId('');
              }}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-hidden cursor-pointer"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameOrNickname}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Horário *
              </label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Local da Piscina *
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Ex: Piscina do Condomínio, Clube Raia 2"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-sm outline-hidden mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {defaultLocations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  onClick={() => setLocation(loc)}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer"
                >
                  {loc}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Status Inicial
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-hidden cursor-pointer"
              >
                <option value="agendada">Agendada</option>
                <option value="presente">Presente (Realizada)</option>
                <option value="falta">Falta</option>
                <option value="reposicao">Reposição</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Vincular ao Pacote (opcional)
              </label>
              <select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-hidden cursor-pointer"
              >
                <option value="">Sem vínculo / Avulsa</option>
                {clientPackages.map((pkg) => (
                  <option key={pkg.id} value={pkg.id}>
                    {pkg.title} ({pkg.totalSessions - pkg.usedSessions} rest.)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações da Sessão
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Treino de força aquática; levar palmares extras."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Agendamento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

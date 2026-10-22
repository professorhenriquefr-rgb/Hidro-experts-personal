import React, { useState } from 'react';
import { X, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import { Client, ExperienceLevel } from '../../types';

interface ClientFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => Promise<void>;
  clientToEdit?: Client | null;
}

export const ClientFormModal: React.FC<ClientFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const [nameOrNickname, setNameOrNickname] = useState(clientToEdit?.nameOrNickname || '');
  const [phone, setPhone] = useState(clientToEdit?.phone || '');
  const [mainObjective, setMainObjective] = useState(clientToEdit?.mainObjective || '');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel>(
    clientToEdit?.experienceLevel || 'iniciante'
  );
  const [startDate, setStartDate] = useState(
    clientToEdit?.startDate || new Date().toISOString().split('T')[0]
  );
  const [professionalNotes, setProfessionalNotes] = useState(clientToEdit?.professionalNotes || '');
  const [restrictionsCare, setRestrictionsCare] = useState(clientToEdit?.restrictionsCare || '');
  const [consentAccepted, setConsentAccepted] = useState(!!clientToEdit?.consentAcceptedAt);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevenção de clique duplo

    if (!nameOrNickname.trim()) {
      setErrorMessage('Por favor, informe o nome ou apelido do aluno(a).');
      return;
    }
    if (!mainObjective.trim()) {
      setErrorMessage('Por favor, selecione ou descreva o objetivo principal.');
      return;
    }
    if (!consentAccepted) {
      setErrorMessage('É necessário confirmar o termo de consentimento e responsabilidade profissional para registrar os dados.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const clientData: Client = {
        id: clientToEdit?.id || `client_${Date.now()}`,
        nameOrNickname: nameOrNickname.trim(),
        phone: phone.replace(/\D/g, ''),
        mainObjective: mainObjective.trim(),
        experienceLevel,
        startDate,
        professionalNotes: professionalNotes.trim(),
        restrictionsCare: restrictionsCare.trim(),
        consentAcceptedAt: clientToEdit?.consentAcceptedAt || new Date().toISOString(),
        active: clientToEdit ? clientToEdit.active : true,
        createdAt: clientToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isExample: clientToEdit?.isExample,
      };

      await onSave(clientData);
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao salvar aluno.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const commonObjectives = [
    'Alívio de dores articulares e melhora da mobilidade',
    'Condicionamento cardiorrespiratório e emagrecimento',
    'Fortalecimento muscular global e hipertrofia aquática',
    'Adaptação ao meio líquido e autonomia aquática',
    'Saúde da coluna, postura e descompressão axial',
    'Manutenção da funcionalidade e longevidade ativa',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl my-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white">
              {clientToEdit ? 'Editar Cadastro de Aluno' : 'Novo Aluno de Hidro / Aquafitness'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Prof. Henrique Aquafitness — Foco em individualidade e segurança
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nome ou Apelido *
              </label>
              <input
                type="text"
                required
                value={nameOrNickname}
                onChange={(e) => setNameOrNickname(e.target.value)}
                placeholder="Ex: Dona Maria Helena, Carlos Cadu"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                WhatsApp / Telefone (opcional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ex: 11999998888 (com DDD)"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-white text-sm outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nível de Experiência Aquática *
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-hidden cursor-pointer"
              >
                <option value="adaptacao_aquatica">Adaptação Aquática (medo de água / pé no chão)</option>
                <option value="iniciante">Iniciante (sabe se manter na água rasa)</option>
                <option value="intermediario">Intermediário (já pratica hidroginástica/natação)</option>
                <option value="avancado">Avançado (alta resistência e técnica)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Data de Início
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Objetivo Principal *
            </label>
            <input
              type="text"
              required
              value={mainObjective}
              onChange={(e) => setMainObjective(e.target.value)}
              placeholder="Descreva ou selecione uma das sugestões abaixo"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-hidden mb-2"
            />
            <div className="flex flex-wrap gap-1.5">
              {commonObjectives.map((obj) => (
                <button
                  type="button"
                  key={obj}
                  onClick={() => setMainObjective(obj)}
                  className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition cursor-pointer"
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-amber-300">
                Restrições e Cuidados Informados pelo Profissional (Campo Livre)
              </label>
              <span className="text-[10px] text-slate-400">
                Não solicitar diagnósticos médicos nem laudos
              </span>
            </div>
            <textarea
              rows={2}
              value={restrictionsCare}
              onChange={(e) => setRestrictionsCare(e.target.value)}
              placeholder="Ex.: Evitar impacto brusco no joelho esquerdo; liberação médica pendente para imersão profunda; prefere água morna; cuidado com rotação excessiva de ombro."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-800/40 focus:border-amber-400 text-white text-sm outline-hidden placeholder:text-slate-500"
            />
            <p className="text-[11px] text-slate-400 mt-0.5">
              Diretriz ética: Registre apenas cuidados operacionais e adaptações de movimento fornecidas pelo aluno ou profissional.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Observações do Profissional
            </label>
            <textarea
              rows={2}
              value={professionalNotes}
              onChange={(e) => setProfessionalNotes(e.target.value)}
              placeholder="Anotações gerais sobre preferências musicais, piscina do condomínio, horários preferidos, etc."
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-sm outline-hidden placeholder:text-slate-500"
            />
          </div>

          {/* Termo de Consentimento LGPD */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-cyan-500/20 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                id="consent-check"
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 cursor-pointer"
              />
              <label htmlFor="consent-check" className="text-slate-300 cursor-pointer leading-relaxed">
                <span className="font-semibold text-cyan-300">Termo de Consentimento e Registro Profissional (LGPD):</span> Declaro que os dados cadastrais e operacionais deste praticante foram obtidos com autorização para finalidade exclusiva de planejamento do treino aquático individualizado, permanecendo armazenados unicamente no navegador deste dispositivo.
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm shadow-md shadow-cyan-500/30 transition cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-slate-950" />
              <span>{isSubmitting ? 'Salvando...' : 'Salvar Aluno'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

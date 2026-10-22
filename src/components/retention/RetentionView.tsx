import React, { useState } from 'react';
import {
  HeartHandshake,
  MessageSquare,
  Sparkles,
  Copy,
  ExternalLink,
  Phone,
  AlertTriangle,
  Flame,
  CheckCircle2,
  RefreshCw,
  Send,
  Info,
} from 'lucide-react';
import { Client, AttentionAlert, ClientPackage, Appointment } from '../../types';
import { requestWhatsAppMessage } from '../../services/aiService';

interface RetentionViewProps {
  clients: Client[];
  alerts: AttentionAlert[];
  packages: ClientPackage[];
  appointments: Appointment[];
  preSelectedClientName?: string;
  preSelectedType?: 'boas_vindas' | 'ausencia' | 'reposicao' | 'renovacao' | 'parabens_marco';
  preSelectedPhone?: string;
}

export const RetentionView: React.FC<RetentionViewProps> = ({
  clients,
  alerts,
  packages,
  appointments,
  preSelectedClientName,
  preSelectedType,
  preSelectedPhone,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>(
    clients.find((c) => c.nameOrNickname === preSelectedClientName)?.id || clients[0]?.id || ''
  );
  const [messageType, setMessageType] = useState<
    'boas_vindas' | 'ausencia' | 'reposicao' | 'renovacao' | 'parabens_marco'
  >(preSelectedType || 'renovacao');
  const [phone, setPhone] = useState<string>(preSelectedPhone || '');

  const [messageText, setMessageText] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusFeedback, setStatusFeedback] = useState<string>('');

  const selectedClient = clients.find((c) => c.id === selectedClientId);

  const messageTypes = [
    { id: 'renovacao', label: 'Renovação de Pacote', desc: 'Aviso suave sobre saldo e continuidade' },
    { id: 'ausencia', label: 'Ausência / Cuidado', desc: 'Mensagem acolhedora perguntando se está tudo bem' },
    { id: 'reposicao', label: 'Agendar Reposição', desc: 'Opções de dias e horários para repor aula' },
    { id: 'parabens_marco', label: 'Parabéns por Marco', desc: 'Elogio por assiduidade ou evolução aquática' },
    { id: 'boas_vindas', label: 'Boas-Vindas', desc: 'Apresentação do personal aquático e orientações' },
  ];

  // Modelos de mensagens rápidas de fallback (instantâneas caso não queira chamar a IA)
  const defaultTemplates: Record<string, (name: string) => string> = {
    renovacao: (name) =>
      `Olá, ${name}! Tudo bem com você? Passando para te avisar com carinho que seu pacote de hidroginástica/personal aquático está chegando às últimas sessões. Gostaria de renovar para mantermos seus horários reservados na piscina? Um abraço! — Prof. Henrique Aquafitness | HYDRO PERSONAL 🌊`,
    ausencia: (name) =>
      `Oi, ${name}! Senti sua falta na nossa última sessão aquática. Espero que esteja tudo bem com você! Quando puder me dê um alô para conversarmos. Abraço! — Prof. Henrique Aquafitness | HYDRO PERSONAL 🏊‍♂️`,
    reposicao: (name) =>
      `Olá, ${name}! Como você precisou se ausentar, preparei algumas opções de horários para fazermos sua reposição de treino na água. Me avise qual fica melhor para você! — Prof. Henrique Aquafitness | HYDRO PERSONAL 💦`,
    parabens_marco: (name) =>
      `Parabéns pela sua dedicação e constância nos treinos, ${name}! Sua evolução na água tem sido muito inspiradora. Seguimos juntos! — Prof. Henrique Aquafitness | HYDRO PERSONAL 💪🏊‍♂️`,
    boas_vindas: (name) =>
      `Seja muito bem-vindo(a) ao treinamento personalizado na água, ${name}! Estou muito feliz em acompanhar você nessa jornada de leveza, movimento e saúde na piscina. Nos vemos em breve! — Prof. Henrique Aquafitness | HYDRO PERSONAL 🌊`,
  };

  const handleSelectClient = (id: string) => {
    setSelectedClientId(id);
    const cl = clients.find((c) => c.id === id);
    if (cl?.phone) setPhone(cl.phone);
    setMessageText('');
  };

  const handleGenerateMessage = async () => {
    if (!selectedClient) return;

    try {
      setIsGenerating(true);
      setStatusFeedback('');

      // Contexto adicional
      const clientPackage = packages.find((p) => p.clientId === selectedClient.id && p.active);
      const remainingSessions = clientPackage ? clientPackage.totalSessions - clientPackage.usedSessions : 0;

      const generated = await requestWhatsAppMessage(
        selectedClient.nameOrNickname,
        messageType,
        {
          mainObjective: selectedClient.mainObjective,
          remainingSessions,
          packageTitle: clientPackage?.title,
        }
      );

      setMessageText(generated);
      setStatusFeedback('Mensagem personalizada gerada com IA!');
    } catch (e: any) {
      console.warn('Usando template padrão devido a erro na IA:', e);
      const fallback = defaultTemplates[messageType](selectedClient.nameOrNickname);
      setMessageText(fallback);
      setStatusFeedback('Mensagem pronta carregada!');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!messageText) return;
    navigator.clipboard.writeText(messageText);
    setStatusFeedback('Mensagem copiada para a área de transferência!');
  };

  const handleOpenWhatsApp = () => {
    if (!messageText) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedText = encodeURIComponent(messageText);
    const url = cleanPhone
      ? `https://wa.me/55${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <HeartHandshake className="w-6 h-6 text-cyan-400" />
          <h1 className="text-2xl font-black text-white">Retenção & Comunicação WhatsApp</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Mensagens acolhedoras, sem pressão comercial, sem menção a condições de saúde e com abertura direta no WhatsApp
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Central de Alertas e Clientes que Precisam de Contato */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <span>Alertas Operacionais ({alerts.length})</span>
            </h2>
          </div>

          <div className="space-y-3">
            {alerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-xs text-slate-300 font-semibold">Tudo tranquilo!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Nenhum aluno com faltas excessivas ou pacote esgotando no momento.
                </p>
              </div>
            ) : (
              alerts.map((al) => {
                const isSelected = al.clientId === selectedClientId;
                return (
                  <div
                    key={al.id}
                    onClick={() => {
                      handleSelectClient(al.clientId);
                      if (al.actionType === 'renew_package') setMessageType('renovacao');
                      if (al.actionType === 'contact_absence') setMessageType('ausencia');
                    }}
                    className={`p-3 rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/70 border-cyan-400 shadow-md'
                        : al.severity === 'danger'
                        ? 'bg-rose-950/20 border-rose-900/40 hover:border-rose-600'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{al.clientName}</span>
                      <span className="text-[10px] text-cyan-400 font-semibold underline">
                        Selecionar
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-snug">{al.reason}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right 2 Cols: Gerador de Mensagens */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-cyan-500/30 p-5 rounded-2xl shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-cyan-300 uppercase tracking-wider">
              Gerar Mensagem de Retenção
            </h2>

            {/* Seleção do Aluno e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Aluno(a) Selecionado *
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => handleSelectClient(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-hidden cursor-pointer"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameOrNickname}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Telefone / WhatsApp (com DDD)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: 11999998888"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-hidden"
                />
              </div>
            </div>

            {/* Tipos de Mensagem */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Objetivo do Contato:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {messageTypes.map((t) => {
                  const isSelected = messageType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        setMessageType(t.id as any);
                        setMessageText('');
                      }}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        isSelected
                          ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <span className="block font-bold text-xs text-cyan-300">{t.label}</span>
                      <span className="text-[10px] text-slate-400 leading-tight block mt-0.5">
                        {t.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão Gerar com IA ou Carregar Template */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateMessage}
                disabled={isGenerating || !selectedClient}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>{isGenerating ? 'Criando Mensagem com IA...' : 'Criar Mensagem Personalizada'}</span>
              </button>

              <button
                onClick={() => {
                  if (selectedClient) {
                    setMessageText(defaultTemplates[messageType](selectedClient.nameOrNickname));
                    setStatusFeedback('Template pronto carregado!');
                  }
                }}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
              >
                Carregar Modelo Rápido
              </button>
            </div>

            {statusFeedback && (
              <div className="text-xs text-emerald-300 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{statusFeedback}</span>
              </div>
            )}

            {/* Caixa de Texto da Mensagem (Editável) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Texto da Mensagem (Você pode editar livremente):
                </label>
                <span className="text-[11px] text-slate-400">
                  {messageText.length} caracteres
                </span>
              </div>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Clique em 'Criar Mensagem Personalizada' ou escreva o texto diretamente aqui..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 focus:border-cyan-400 text-white text-xs leading-relaxed outline-hidden"
              />
            </div>

            {/* Diretriz de Ética e Privacidade */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                Diretrizes de comunicação: Mensagens sem promessas irrealistas, sem expor eventuais sintomas do aluno e assinadas oficialmente pelo Prof. Henrique Aquafitness.
              </span>
            </div>

            {/* Botões de Ação Final */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                onClick={handleCopy}
                disabled={!messageText}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition cursor-pointer disabled:opacity-50"
              >
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Copiar Texto</span>
              </button>

              <button
                onClick={handleOpenWhatsApp}
                disabled={!messageText}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Phone className="w-4 h-4 text-slate-950" />
                <span>Abrir no WhatsApp</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-950" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

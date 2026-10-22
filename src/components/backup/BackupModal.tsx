import React, { useState } from 'react';
import {
  X,
  Database,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileJson,
  ShieldCheck,
} from 'lucide-react';
import { repository } from '../../repositories/localStorageRepo';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataChanged: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataChanged,
}) => {
  const [importJsonText, setImportJsonText] = useState('');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsBusy(true);
      const json = await repository.exportAllData();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hydro-personal-backup-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatusMessage({ type: 'success', text: 'Backup exportado com sucesso!' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Falha ao exportar dados.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleImport = async () => {
    if (!importJsonText.trim()) {
      setStatusMessage({ type: 'error', text: 'Cole o conteúdo do arquivo JSON para importar.' });
      return;
    }
    try {
      setIsBusy(true);
      const success = await repository.importAllData(importJsonText);
      if (success) {
        setStatusMessage({ type: 'success', text: 'Dados restaurados com sucesso!' });
        setImportJsonText('');
        await onDataChanged();
      } else {
        setStatusMessage({ type: 'error', text: 'Arquivo de backup inválido ou corrompido.' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Erro ao processar arquivo JSON.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleLoadSamples = async () => {
    try {
      setIsBusy(true);
      await repository.loadSampleData();
      await onDataChanged();
      setStatusMessage({
        type: 'success',
        text: 'Dados de exemplo fictícios carregados com sucesso! [EXEMPLO FICTÍCIO]',
      });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Falha ao carregar exemplos.' });
    } finally {
      setIsBusy(false);
    }
  };

  const handleClearAll = async () => {
    try {
      setIsBusy(true);
      await repository.clearAllData();
      await onDataChanged();
      setConfirmClear(false);
      setStatusMessage({ type: 'success', text: 'Todos os dados locais foram apagados.' });
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: 'Erro ao limpar dados.' });
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl max-w-xl w-full p-6 text-white shadow-2xl my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Gerenciamento de Dados & Backup</h2>
              <p className="text-xs text-slate-400">Armazenamento local (localStorage) no seu navegador</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {statusMessage && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                : 'bg-rose-950/60 border-rose-800 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        <div className="mt-4 space-y-4">
          {/* Exportar Backup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-sm text-white block">Exportar Backup Completo</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Baixe um arquivo JSON com todos os alunos, treinos, avaliações, pacotes e agenda.
              </p>
            </div>
            <button
              onClick={handleExport}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/20 transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-slate-950" />
              <span>Baixar JSON</span>
            </button>
          </div>

          {/* Importar Backup */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-sm text-white block">Restaurar / Importar Backup JSON</span>
            <p className="text-xs text-slate-400">
              Cole o conteúdo de um backup gerado anteriormente para restaurar neste navegador.
            </p>
            <textarea
              rows={3}
              value={importJsonText}
              onChange={(e) => setImportJsonText(e.target.value)}
              placeholder="Cole o código JSON do arquivo aqui..."
              className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono outline-hidden"
            />
            <div className="flex justify-end">
              <button
                onClick={handleImport}
                disabled={isBusy || !importJsonText.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition cursor-pointer disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Restaurar Backup</span>
              </button>
            </div>
          </div>

          {/* Exemplos Fictícios de Demonstração */}
          <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/20 flex items-center justify-between gap-3">
            <div>
              <span className="font-bold text-sm text-cyan-300 block">Carregar Exemplos de Teste</span>
              <p className="text-xs text-slate-400 mt-0.5">
                Popula o app com dados fictícios claramente identificados como [EXEMPLO FICTÍCIO] para explorar todas as funções.
              </p>
            </div>
            <button
              onClick={handleLoadSamples}
              disabled={isBusy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-cyan-500/30 transition cursor-pointer shrink-0 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span>Carregar Dados</span>
            </button>
          </div>

          {/* Apagar Tudo */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Resetar armazenamento local</span>
            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-950 text-rose-300 text-xs font-semibold border border-rose-800/40 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Limpar Dados Deste Navegador
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-400 font-bold">Apagar todos os dados?</span>
                <button
                  onClick={handleClearAll}
                  disabled={isBusy}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar Limpeza
                </button>
                <button
                  onClick={() => setConfirmClear(false)}
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

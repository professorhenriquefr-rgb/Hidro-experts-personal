import React from 'react';
import {
  Users,
  Calendar,
  Sparkles,
  ClipboardList,
  HeartHandshake,
  Waves,
  Database,
  BarChart3,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'clients'
  | 'evaluations'
  | 'workouts'
  | 'agenda'
  | 'retention'
  | 'reports';

interface NavigationProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenBackup: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenBackup,
}) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Painel', icon: Waves },
    { id: 'clients' as TabType, label: 'Clientes', icon: Users },
    { id: 'evaluations' as TabType, label: 'Avaliações', icon: ClipboardList },
    { id: 'workouts' as TabType, label: 'Treino IA', icon: Sparkles },
    { id: 'agenda' as TabType, label: 'Agenda & Pacotes', icon: Calendar },
    { id: 'retention' as TabType, label: 'Retenção', icon: HeartHandshake },
    { id: 'reports' as TabType, label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <>
      {/* Top Header - Desktop & Mobile */}
      <header className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 border-b border-cyan-500/20 text-white sticky top-9 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div
            onClick={() => onSelectTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <Waves className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black tracking-wider text-lg bg-gradient-to-r from-white via-cyan-200 to-cyan-400 bg-clip-text text-transparent">
                  HYDRO PERSONAL
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-900/60 border border-cyan-500/30 text-cyan-300">
                  Aquafitness
                </span>
              </div>
              <p className="text-[11px] text-cyan-200/80 font-medium">
                Prof. Henrique Aquafitness
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-cyan-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Backup / Export Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenBackup}
              title="Gerenciar Dados & Backup JSON"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 hover:border-cyan-400 transition cursor-pointer"
            >
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Backup & Dados</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar (Mobile-First for Poolside use) */}
      <nav aria-label="Navegação Principal Mobile" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-cyan-500/30 backdrop-blur-lg px-1 py-1.5 shadow-2xl">
        <div className="grid grid-cols-6 gap-1 max-w-md mx-auto">
          {navItems.slice(0, 6).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-1.5 px-0.5 rounded-lg transition text-center cursor-pointer ${
                  isActive
                    ? 'text-cyan-400 bg-cyan-950/60 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-cyan-300' : 'text-slate-400'}`} />
                <span className="text-[10px] leading-tight truncate w-full">
                  {item.id === 'workouts' ? 'Treino IA' : item.id === 'agenda' ? 'Agenda' : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

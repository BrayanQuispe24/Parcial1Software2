import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggle,
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const role = user?.role || 'PENTESTER';

  const handleNavClick = () => {
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <aside
      className={`bg-slate-900 text-slate-400 flex flex-col border-r border-slate-700 transition-all duration-300 z-40 shrink-0 h-screen fixed inset-y-0 left-0 md:static ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      } ${collapsed ? 'w-64 md:w-16' : 'w-64'}`}
    >
      {/* Header */}
      <div className="h-13 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5 font-bold text-slate-100 text-sm whitespace-nowrap overflow-hidden">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center text-white font-extrabold text-xs shrink-0">
            AI
          </div>
          <span className={`${collapsed ? 'md:hidden' : 'inline'}`}>GenAI Security Lab</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className="hidden md:block text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition"
            onClick={onToggle}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d={collapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7m8 14l-7-7 7-7"} />
            </svg>
          </button>
          <button
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded hover:bg-slate-800 transition text-sm"
            onClick={onCloseMobile}
            title="Cerrar Menú"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 space-y-4">
        {/* SYSTEM ADMIN NAVIGATION */}
        {role === 'SYSTEM_ADMIN' && (
          <>
            <div>
              <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${collapsed ? 'md:hidden' : 'block'}`}>
                {t('group.system_stats')}
              </div>
              <NavLink
                to="/app/dashboard"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-900/60 text-white border-l-4 border-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">📊</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.dashboard_users')}</span>
              </NavLink>
            </div>

            <div>
              <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${collapsed ? 'md:hidden' : 'block'}`}>
                {t('group.global_admin')}
              </div>
              <NavLink
                to="/app/users"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-900/60 text-white border-l-4 border-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">👥</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.users_admin')}</span>
              </NavLink>
              <NavLink
                to="/app/monetizacion"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-900/60 text-white border-l-4 border-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">💳</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>Monetización y Tarifas</span>
              </NavLink>
            </div>
          </>
        )}

        {/* PENTESTER NAVIGATION */}
        {role === 'PENTESTER' && (
          <>
            <div>
              <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${collapsed ? 'md:hidden' : 'block'}`}>
                {t('group.overview')}
              </div>
              <NavLink
                to="/app/dashboard"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-900/60 text-white border-l-4 border-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">📊</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.dashboard')}</span>
              </NavLink>
            </div>

            <div>
              <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${collapsed ? 'md:hidden' : 'block'}`}>
                {t('group.security_testing')}
              </div>
              <NavLink
                to="/app/targets"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-blue-900/60 text-white border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">🎯</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.targets')}</span>
              </NavLink>
              <NavLink
                to="/app/assessments"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-blue-900/60 text-white border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">⚡</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.assessments')}</span>
              </NavLink>
              <NavLink
                to="/app/findings"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-blue-900/60 text-white border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">⚠️</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.findings')}</span>
              </NavLink>
              <NavLink
                to="/app/ai-assistant"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-blue-900/60 text-white border-l-4 border-sky-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">🤖</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.ai_assistant')}</span>
              </NavLink>
            </div>

            <div>
              <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${collapsed ? 'md:hidden' : 'block'}`}>
                {t('group.auditor_management')}
              </div>
              <NavLink
                to="/app/users"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-900/60 text-white border-l-4 border-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">👥</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.users')}</span>
              </NavLink>
              <NavLink
                to="/app/monetizacion"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-blue-900/60 text-white border-l-4 border-sky-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">💳</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>Monetización y Suscripciones</span>
              </NavLink>
            </div>
          </>
        )}

        {/* AUDITOR NAVIGATION */}
        {role === 'AUDITOR' && (
          <>
            <div>
              <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-purple-400 uppercase font-mono ${collapsed ? 'md:hidden' : 'block'}`}>
                PANEL DE AUDITORÍA
              </div>
              <NavLink
                to="/app/dashboard"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive
                      ? 'bg-purple-950/60 text-white border-l-4 border-purple-400'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">📊</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>Dashboard Evaluativo</span>
              </NavLink>
            </div>

            <div>
              <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${collapsed ? 'md:hidden' : 'block'}`}>
                EVALUACIÓN Y REVISION
              </div>
              <NavLink
                to="/app/targets"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-purple-950/60 text-white border-l-4 border-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">🎯</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>Targets & Informes</span>
              </NavLink>
              <NavLink
                to="/app/assessments"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-purple-950/60 text-white border-l-4 border-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">⚡</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>Pruebas Offensivas</span>
              </NavLink>
              <NavLink
                to="/app/findings"
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                    isActive ? 'bg-purple-950/60 text-white border-l-4 border-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                  }`
                }
              >
                <span className="text-sm">⚠️</span>
                <span className={collapsed ? 'md:hidden' : 'inline'}>Matriz de Hallazgos</span>
              </NavLink>
            </div>
          </>
        )}

        {/* SHARED PROFILE FOR ALL ROLES */}
        <div>
          <div className={`px-4 py-1.5 text-[10px] font-bold tracking-wider text-slate-500 uppercase ${collapsed ? 'md:hidden' : 'block'}`}>
            {t('group.my_account')}
          </div>
          <NavLink
            to="/app/profile"
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-blue-900/60 text-white border-l-4 border-sky-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`
            }
          >
            <span className="text-sm">👤</span>
            <span className={collapsed ? 'md:hidden' : 'inline'}>{t('nav.profile')}</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className={`p-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-0.5 ${collapsed ? 'md:hidden' : 'block'}`}>
        <div className="font-bold text-slate-200">AI Security Lab v2.4</div>
        <div>Scope: Authorized LAB</div>
      </div>
    </aside>
  );
};

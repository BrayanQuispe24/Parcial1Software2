import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onToggleMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenCommandPalette, onToggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name?: string, username?: string) => {
    if (name && name.length >= 2) return name.substring(0, 2).toUpperCase();
    if (username && username.length >= 2) return username.substring(0, 2).toUpperCase();
    return 'US';
  };

  return (
    <header className="h-13 bg-white border-b border-slate-200 flex items-center justify-between px-2 sm:px-5 z-10 shrink-0 gap-1 sm:gap-2 max-w-full overflow-hidden">
      {/* Left controls: Hamburger + Search */}
      <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1 sm:flex-initial">
        <button
          className="md:hidden text-slate-700 hover:bg-slate-100 p-1.5 rounded-md border border-slate-200 transition shrink-0"
          onClick={onToggleMobileMenu}
          title="Abrir Menú"
        >
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <button
          className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 border border-slate-200 rounded-md px-2 sm:px-2.5 py-1.5 text-slate-500 text-xs hover:border-blue-600 hover:text-slate-700 transition w-full sm:w-60 md:w-72 max-w-[140px] sm:max-w-none"
          onClick={onOpenCommandPalette}
        >
          <span className="shrink-0">🔍</span>
          <span className="truncate text-left text-xs">{t('topbar.search_placeholder')}</span>
          <span className="ml-auto bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[10px] font-mono hidden sm:inline-block">
            Ctrl + K
          </span>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        {/* Language Selector Button */}
        <button
          className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-md px-2 py-1 text-[11px] transition shrink-0 flex items-center gap-1"
          onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
          title="Cambiar Idioma / Change Language"
        >
          <span>{language === 'ES' ? '🇪🇸 ES' : '🇺🇸 EN'}</span>
        </button>

        <Link
          to="/"
          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-md p-1.5 sm:px-3 sm:py-1 text-xs font-semibold transition shrink-0"
          title="Ver Landing Page"
        >
          🌐 <span className="hidden sm:inline">{t('topbar.landing_page')}</span>
        </Link>

        <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200 hidden lg:inline-block">
          {t('topbar.env')}
        </span>

        <button
          className="relative text-slate-600 hover:text-slate-900 hover:bg-slate-100 p-1.5 rounded transition hidden xs:block"
          onClick={() => alert("Notificaciones: 2 hallazgos críticos detectados")}
          title="Notificaciones"
        >
          <span>🔔</span>
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse" />
        </button>

        {/* User Profile Menu */}
        <div className="flex items-center gap-1 sm:gap-2 pl-1 rounded-md transition shrink-0">
          <div className="w-7 h-7 bg-blue-800 text-white rounded-full flex items-center justify-center font-bold text-[11px] shrink-0">
            {getInitials(user?.first_name, user?.username)}
          </div>
          <div className="hidden md:flex flex-col text-left">
            <span className="font-semibold text-xs text-slate-900 leading-tight truncate max-w-28 sm:max-w-36">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </span>
            <span className="text-[10px] text-slate-500">{user?.role || 'Pentester Autorizado'}</span>
          </div>
          <button
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 rounded p-1.5 sm:px-2 sm:py-1 text-[11px] font-medium transition shrink-0"
            onClick={handleLogout}
            title="Cerrar Sesión"
          >
            🚪 <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </header>
  );
};

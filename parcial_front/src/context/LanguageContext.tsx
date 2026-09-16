import React, { createContext, useContext, useState } from 'react';

export type Language = 'ES' | 'EN';

type Translations = Record<string, { ES: string; EN: string }>;

const dictionary: Translations = {
  // Common Navigation
  'nav.dashboard': { ES: 'Dashboard Evaluaciones', EN: 'Evaluations Dashboard' },
  'nav.dashboard_users': { ES: 'Dashboard Usuarios', EN: 'Users Dashboard' },
  'nav.targets': { ES: 'Targets Autorizados', EN: 'Authorized Targets' },
  'nav.assessments': { ES: 'Pruebas Ofensivas', EN: 'Offensive Testing' },
  'nav.findings': { ES: 'Matriz de Hallazgos', EN: 'Findings Matrix' },
  'nav.ai_assistant': { ES: 'Asistente IA', EN: 'AI Assistant' },
  'nav.users': { ES: 'Mis Auditores', EN: 'My Auditors' },
  'nav.users_admin': { ES: 'Usuarios & Aprobaciones', EN: 'Users & Approvals' },
  'nav.profile': { ES: 'Mi Perfil', EN: 'My Profile' },

  // System Groups
  'group.overview': { ES: 'OVERVIEW', EN: 'OVERVIEW' },
  'group.security_testing': { ES: 'SECURITY TESTING', EN: 'SECURITY TESTING' },
  'group.auditor_management': { ES: 'ADMINISTRACIÓN DE AUDITORES', EN: 'AUDITOR MANAGEMENT' },
  'group.my_account': { ES: 'MI CUENTA', EN: 'MY ACCOUNT' },
  'group.system_stats': { ES: 'ESTADÍSTICAS DEL SISTEMA', EN: 'SYSTEM STATISTICS' },
  'group.global_admin': { ES: 'ADMINISTRACIÓN GLOBAL', EN: 'GLOBAL ADMINISTRATION' },

  // Topbar Controls
  'topbar.search_placeholder': { ES: 'Buscar...', EN: 'Search...' },
  'topbar.landing_page': { ES: 'Landing Page', EN: 'Landing Page' },
  'topbar.logout': { ES: 'Salir', EN: 'Logout' },
  'topbar.env': { ES: 'ENVIRONMENT: LAB', EN: 'ENVIRONMENT: LAB' },

  // Common Actions
  'action.create_user': { ES: '➕ Crear Usuario', EN: '➕ Create User' },
  'action.register_auditor': { ES: '➕ Registrar Auditor', EN: '➕ Register Auditor' },
  'action.register_target': { ES: '➕ Registrar Objetivo Autorizado', EN: '➕ Register Authorized Target' },
  'action.start_scan': { ES: '⚡ Iniciar Evaluación Autorizada', EN: '⚡ Launch Authorized Assessment' },
  'action.export_pdf': { ES: '📄 Exportar Reporte PDF', EN: '📄 Export PDF Report' },
  'action.edit': { ES: '✏️ Editar', EN: '✏️ Edit' },
  'action.delete': { ES: '🗑️ Eliminar', EN: '🗑️ Delete' },
  'action.enable': { ES: '✓ Habilitar', EN: '✓ Enable' },

  // View Mode
  'view.cards': { ES: '🎴 Tarjetas', EN: '🎴 Cards' },
  'view.table': { ES: '📋 Tabla', EN: '📋 Table' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return saved === 'EN' ? 'EN' : 'ES';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    if (dictionary[key]) {
      return dictionary[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
};

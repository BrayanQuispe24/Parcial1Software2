import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export const AppShell: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [cpQuery, setCpQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen]);

  const commands = [
    { label: '📊 Ir al Dashboard Principal', path: '/app/dashboard', category: 'Navegación' },
    { label: '👥 Abrir Gestión de Usuarios', path: '/app/users', category: 'Administración' },
    { label: '⚡ Iniciar Nueva Evaluación de Seguridad', action: () => alert('Acción: Nueva Evaluación'), category: 'Comando' },
    { label: '🎯 Registrar Nuevo Objetivo Autorizado', action: () => alert('Acción: Nuevo Target'), category: 'Comando' },
    { label: '📄 Generar y Exportar Reportes', action: () => alert('Acción: Exportar Reporte'), category: 'Reportes' },
  ];

  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(cpQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans text-xs relative">
      {/* Mobile Sidebar Overlay Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col overflow-hidden h-screen min-w-0">
        <Topbar
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* Command Palette Modal */}
      {commandPaletteOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setCommandPaletteOpen(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-slate-200">
              <span className="text-slate-400">🔍</span>
              <input
                type="text"
                className="w-full bg-transparent text-sm outline-none text-slate-900 placeholder:text-slate-400"
                placeholder="Escriba un comando o busque (ej: Usuarios, Dashboard)..."
                value={cpQuery}
                onChange={(e) => setCpQuery(e.target.value)}
                autoFocus
              />
              <span className="text-[11px] text-slate-400 font-medium shrink-0">ESC para cerrar</span>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              {filteredCommands.length > 0 ? (
                filteredCommands.map((cmd, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg flex items-center justify-between hover:bg-slate-100 cursor-pointer transition text-xs font-medium text-slate-800"
                    onClick={() => {
                      setCommandPaletteOpen(false);
                      if (cmd.path) navigate(cmd.path);
                      if (cmd.action) cmd.action();
                    }}
                  >
                    <span>{cmd.label}</span>
                    <span className="text-[11px] text-slate-400 font-normal">{cmd.category}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No se encontraron resultados para "{cpQuery}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

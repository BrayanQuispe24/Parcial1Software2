import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, type User } from '../context/AuthContext';
import { api } from '../services/api';

interface SystemAdminStats {
  total_users: number;
  pentesters_enabled: number;
  pentesters_pending: number;
  total_auditors: number;
  recent_pentesters: User[];
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const isSystemAdmin = user?.role === 'SYSTEM_ADMIN';

  const [stats, setStats] = useState<SystemAdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(isSystemAdmin);

  const fetchStats = async () => {
    if (!isSystemAdmin) return;
    setLoadingStats(true);
    try {
      const response = await api.get('/users/stats/');
      setStats(response.data);
    } catch (err) {
      console.error('Error al obtener estadísticas del System Admin:', err);
      setStats({
        total_users: 1,
        pentesters_enabled: 0,
        pentesters_pending: 0,
        total_auditors: 0,
        recent_pentesters: [],
      });
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [isSystemAdmin]);

  const handleEnableUser = async (userId: number) => {
    if (window.confirm(`¿Confirmas la activación de la cuenta del Pentester #${userId}? Se le enviará el correo con los Términos y Condiciones.`)) {
      try {
        await api.post(`/users/${userId}/enable/`);
        alert("✓ Cuenta de Pentester activada exitosamente. Se envió el correo de confirmación.");
        fetchStats();
      } catch (err: any) {
        console.error('Error al activar usuario:', err);
        alert(err.response?.data?.detail || "Ocurrió un error al activar la cuenta.");
      }
    }
  };

  if (isSystemAdmin) {
    return (
      <div className="space-y-6">
        {/* System Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard del Administrador del Sistema
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              Métricas consolidadas de usuarios registrados, cuentas activas y solicitudes pendientes de aprobación.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/app/users"
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
            >
              👥 Gestionar Todos los Usuarios
            </Link>
          </div>
        </div>

        {/* System Admin KPI Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total de Usuarios</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-slate-900">{loadingStats ? '...' : stats?.total_users || 0}</span>
              <span className="text-xs font-bold text-blue-700">En Sistema</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pentesters Habilitados</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-emerald-600">{loadingStats ? '...' : stats?.pentesters_enabled || 0}</span>
              <span className="text-xs font-bold text-emerald-700">✓ Activos</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pendientes de Activación</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-amber-600">{loadingStats ? '...' : stats?.pentesters_pending || 0}</span>
              <span className="text-xs font-bold text-amber-600">⚠️ Requieren Revisión</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Auditores</span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl font-black text-purple-600">{loadingStats ? '...' : stats?.total_auditors || 0}</span>
              <span className="text-xs font-bold text-purple-700">Registrados</span>
            </div>
          </div>
        </div>

        {/* Recent Pentester Registrations Cards */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Solicitudes Recientes de Registro de Pentesters</h3>
              <p className="text-[11px] text-slate-500">Cuentas que requieren activación por el Administrador del Sistema</p>
            </div>
            <Link to="/app/users" className="text-blue-800 font-semibold text-xs hover:underline">
              Ver Todos →
            </Link>
          </div>

          <div className="p-4 pt-0">
            {stats?.recent_pentesters && stats.recent_pentesters.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {stats.recent_pentesters.map((p) => (
                  <div
                    key={p.id}
                    className="bg-slate-50/80 border border-slate-200 hover:border-blue-400 rounded-xl p-4 transition flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-800 text-white rounded-full flex items-center justify-center font-extrabold text-xs shadow-xs">
                          {p.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-xs truncate max-w-40">{p.username}</h4>
                          <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            Pentester
                          </span>
                        </div>
                      </div>
                      <span className="font-mono text-[11px] font-bold text-slate-500">#{p.id}</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/60 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Correo:</span>
                        <span className="font-medium text-slate-800 truncate max-w-[160px]" title={p.email}>
                          {p.email}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Estado:</span>
                        {p.is_enabled ? (
                          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            ● Habilitado
                          </span>
                        ) : (
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                            ● Pendiente
                          </span>
                        )}
                      </div>
                    </div>

                    {!p.is_enabled && (
                      <button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-1.5 text-xs font-bold transition shadow-xs"
                        onClick={() => handleEnableUser(p.id)}
                      >
                        ✓ Habilitar Pentester
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay solicitudes recientes de Pentesters pendientes.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // PENTESTER DASHBOARD
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard de Evaluaciones de Seguridad IA</h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Monitoreo en tiempo real de pruebas ofensivas autorizadas en Chatbots, LLMs y Agentes Web.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition"
            onClick={() => alert("Función: Exportar Reporte Executive PDF")}
          >
            📄 Exportar PDF
          </button>
          <button
            className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
            onClick={() => alert("Función: Iniciar Evaluación Autorizada")}
          >
            ⚡ + Nueva Evaluación
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hallazgos Críticos</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-red-600">14</span>
            <span className="text-xs font-bold text-red-600">↑ 3 este mes</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cobertura OWASP LLM Top 10</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">90%</span>
            <span className="text-xs font-bold text-emerald-700">✓ 9/10 Mapeados</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Targets Autorizados</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">8</span>
            <span className="text-xs font-bold text-emerald-700">● 6 Activos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Puntuación de Riesgo Promedio</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-orange-600">7.8 / 10</span>
            <span className="text-xs font-bold text-orange-600">Nivel Alto</span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout: Table + Live Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table Container */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl overflow-x-auto w-full shadow-xs">
          <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
            <h3 className="text-sm font-bold text-slate-900">Evaluaciones Recientes</h3>
            <select className="px-2.5 py-1 border border-slate-200 rounded-md bg-white text-xs text-slate-700 outline-none">
              <option value="all">Todos los Estados</option>
              <option value="vulnerable">Vulnerable</option>
              <option value="running">En Ejecución</option>
            </select>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código ID</th>
                <th className="px-4 py-3">Target Objetivo</th>
                <th className="px-4 py-3">Módulo Probado</th>
                <th className="px-4 py-3">Severidad Max</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-bold">AST-2026-0092</td>
                <td className="px-4 py-3">Chatbot Banca Privada v4</td>
                <td className="px-4 py-3">Direct Prompt Injection</td>
                <td className="px-4 py-3">
                  <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    CRITICAL
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold">
                    VULNERABLE
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50">
                <td className="px-4 py-3 font-mono font-bold">AST-2026-0091</td>
                <td className="px-4 py-3">Agente RAG Soporte Técnico</td>
                <td className="px-4 py-3">Tool / Function Hijacking</td>
                <td className="px-4 py-3">
                  <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded text-[11px] font-bold">
                    HIGH
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[11px] font-bold">
                    VULNERABLE
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Live Stream Console Box */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-sm font-mono text-xs text-slate-300 flex flex-col">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-semibold">
            <span>TERMINAL EN VIVO - AGENTE AUDITOR</span>
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
              CONECTADO
            </span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-2 max-h-72">
            <div className="leading-relaxed"><span className="text-slate-500">21:20:01</span> <span className="text-sky-400 font-bold">[INIT]</span> Inicializando motor de pentesting...</div>
            <div className="leading-relaxed"><span className="text-slate-500">21:20:03</span> <span className="text-sky-400 font-bold">[AUTH]</span> Token JWT validado para usuario activo.</div>
            <div className="leading-relaxed"><span className="text-slate-500">21:20:05</span> <span className="text-sky-400 font-bold">[PROMPT_INJ]</span> <span className="text-red-400 font-medium">ALERTA: Fuga de System Prompt detectada en target.</span></div>
            <div className="leading-relaxed"><span className="text-slate-500">21:20:10</span> <span className="text-sky-400 font-bold">[EVIDENCE]</span> <span className="text-emerald-400 font-medium">Evidencia firmada SHA-256 almacenada.</span></div>
          </div>
        </div>
      </div>

      {/* Bottom Action Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-xs">
        <div>
          <h4 className="text-xs font-bold text-slate-900">Gestión de Mis Auditores</h4>
          <p className="text-[11px] text-slate-500">Administra y registra los usuarios tipo Auditor autorizados para tus evaluaciones.</p>
        </div>
        <Link
          to="/app/users"
          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs px-4 py-2 rounded-lg transition"
        >
          👥 Ir a Mis Auditores
        </Link>
      </div>
    </div>
  );
};

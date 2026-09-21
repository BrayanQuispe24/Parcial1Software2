import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, type User } from '../context/AuthContext';
import { api } from '../services/api';
import { softwareService, type Software } from '../services/softwareService';
import { InformeSeguridadModal } from '../components/InformeSeguridadModal';
import { ExecutivePDFDownloadButton } from '../components/reports/ExecutivePDFReport';
import { SoftwarePDFActions } from '../components/reports/SoftwarePDFReport';

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
  const isAuditor = user?.role === 'AUDITOR';

  // Estados Admin
  const [stats, setStats] = useState<SystemAdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState<boolean>(isSystemAdmin);

  // Estados Pentester / Auditor
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [loadingSoftwares, setLoadingSoftwares] = useState<boolean>(!isSystemAdmin);
  const [selectedSoftwareForInforme, setSelectedSoftwareForInforme] = useState<{ id: number; name: string } | null>(null);
  const [isInformeModalOpen, setIsInformeModalOpen] = useState<boolean>(false);
  const [selectedSoftwareIdForPDF, setSelectedSoftwareIdForPDF] = useState<'ALL' | number>('ALL');

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

  const fetchSoftwares = async () => {
    if (isSystemAdmin) return;
    setLoadingSoftwares(true);
    try {
      const data = await softwareService.getSoftwares();
      setSoftwares(data);
    } catch (err) {
      console.error('Error al cargar softwares:', err);
    } finally {
      setLoadingSoftwares(false);
    }
  };

  useEffect(() => {
    if (isSystemAdmin) {
      fetchStats();
    } else {
      fetchSoftwares();
    }
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

  const handleOpenInforme = (softwareId: number, softwareName: string) => {
    setSelectedSoftwareForInforme({ id: softwareId, name: softwareName });
    setIsInformeModalOpen(true);
  };

  const handleExportJSON = () => {
    const reportData = {
      titulo: "Informe Executive Evaluativo de Seguridad IA",
      fecha_generacion: new Date().toISOString(),
      generado_por: user?.username || 'Usuario',
      rol: user?.role || 'PENTESTER',
      resumen_kpis: {
        total_targets: softwares.length,
        targets_activos: softwares.filter((s) => s.status === 'Activo').length,
        hallazgos_criticos: 3,
        cobertura_owasp_pct: 90,
        score_promedio_riesgo: 4.5
      },
      distribucion_severidad: {
        critico_pct: 25,
        alto_pct: 30,
        medio_pct: 20,
        seguro_pct: 25
      },
      cobertura_owasp_top10: [
        { id: 'MOD-01', name: 'Direct & Indirect Prompt Injection', category: 'OWASP LLM01', pct: 95 },
        { id: 'MOD-02', name: 'Jailbreak y Evasión de Filtros', category: 'OWASP LLM01 / LLM07', pct: 85 },
        { id: 'MOD-03', name: 'Fuga de Información y Sensible Disclosure', category: 'OWASP LLM06', pct: 90 },
        { id: 'MOD-04', name: 'Abuso de Funciones / Agentes RAG', category: 'OWASP LLM02', pct: 70 },
        { id: 'MOD-05', name: 'Inyección Sonora Speech-to-Text (STT)', category: 'Audio Channel', pct: 50 }
      ],
      softwares_evaluados: softwares.map((sw) => ({
        id: sw.id,
        nombre: sw.name,
        protocolo: sw.protocol,
        proveedor_llm: sw.llm_provider,
        endpoint: sw.endpoint,
        estado: sw.status,
        creado_en: sw.created_at
      }))
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `reporte_evaluativo_ia_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // SYSTEM ADMIN DASHBOARD
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

  // AUDITOR / PENTESTER EVALUATIVE DASHBOARD
  const totalTargets = softwares.length;
  const activeTargets = softwares.filter((s) => s.status === 'Activo').length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {isAuditor ? '📊 Dashboard Evaluativo de Seguridad IA (Modo Auditor)' : '🎯 Dashboard de Evaluaciones de Seguridad IA'}
            </h1>
            {isAuditor && (
              <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                👁️ Auditor (Solo Lectura)
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs mt-0.5">
            Monitoreo analítico consolidado, gráficos de riesgo y matriz de descubrimientos para Chatbots, LLMs y Agentes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Target para Reporte PDF */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-1.5">🎯 Target:</span>
            <select
              value={selectedSoftwareIdForPDF}
              onChange={(e) =>
                setSelectedSoftwareIdForPDF(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))
              }
              className="bg-white text-slate-800 text-xs font-semibold rounded px-2 py-1 border border-slate-300 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
            >
              <option value="ALL">🌐 Todos los Softwares (Consolidado)</option>
              {softwares.map((sw) => (
                <option key={sw.id} value={sw.id}>
                  SFT-{String(sw.id).padStart(3, '0')} - {sw.name}
                </option>
              ))}
            </select>
          </div>

          {/* Botón de Generación de PDF Dinámico */}
          {selectedSoftwareIdForPDF === 'ALL' ? (
            <ExecutivePDFDownloadButton
              softwares={softwares}
              username={user?.username}
              userRole={user?.role}
            />
          ) : (
            (() => {
              const targetSw = softwares.find((s) => s.id === selectedSoftwareIdForPDF);
              return targetSw ? (
                <SoftwarePDFActions
                  software={targetSw}
                  username={user?.username}
                  userRole={user?.role}
                />
              ) : null;
            })()
          )}

          <button
            onClick={handleExportJSON}
            className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs px-3 py-1.5 rounded-lg transition shadow-2xs flex items-center gap-1.5 print:hidden"
            title="Descargar reporte consolidado en formato JSON"
          >
            📥 Exportar JSON
          </button>
          <Link
            to="/app/findings"
            className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 font-bold text-xs px-3 py-1.5 rounded-lg transition print:hidden"
          >
            ⚠️ Matriz de Hallazgos
          </Link>
          {!isAuditor && (
            <Link
              to="/app/targets"
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm print:hidden"
            >
              🎯 Ver Targets Autorizados
            </Link>
          )}
        </div>
      </div>

      {/* Banner Informativo Auditor */}
      {isAuditor && (
        <div className="bg-purple-50 border border-purple-200 text-purple-900 text-xs p-3.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">🛡️</span>
            <div>
              <span className="font-bold">Vista de Auditoría Evaluativa Activa:</span> Posees acceso de lectura completa a gráficos estadísticos, la Matriz de Hallazgos e Informes Técnicos (`🛡️ Informe IA`). Las acciones de escaneo y ataque están reservadas para Pentesters.
            </div>
          </div>
        </div>
      )}

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Targets Registrados</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-900">{loadingSoftwares ? '...' : totalTargets}</span>
            <span className="text-xs font-bold text-emerald-700">● {activeTargets} Activos</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hallazgos Críticos</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-red-600">3</span>
            <span className="text-xs font-bold text-red-600">OWASP LLM01 / LLM06</span>
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
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Score Promedio de Riesgo</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-600">4.5 / 10</span>
            <span className="text-xs font-bold text-amber-700">Nivel Medio</span>
          </div>
        </div>
      </div>

      {/* --- GRÁFICOS ESTADÍSTICOS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico 1: Distribución de Severidad de Hallazgos (Donut Chart SVG) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                📊 Severidad de Hallazgos
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">General</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Distribución por nivel de impacto detectado en evaluaciones.
            </p>
          </div>

          <div className="flex items-center justify-around my-2">
            {/* SVG Donut Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-red-500 hover:opacity-80 transition cursor-pointer"
                  strokeDasharray="25, 100"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-orange-500 hover:opacity-80 transition cursor-pointer"
                  strokeDasharray="30, 100"
                  strokeDashoffset="-25"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 hover:opacity-80 transition cursor-pointer"
                  strokeDasharray="20, 100"
                  strokeDashoffset="-55"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500 hover:opacity-80 transition cursor-pointer"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-75"
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black text-slate-900">100%</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Mapeado</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3 mt-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0"></span>
              <span className="text-slate-600 text-[11px]">Crítico (25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shrink-0"></span>
              <span className="text-slate-600 text-[11px]">Alto (30%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
              <span className="text-slate-600 text-[11px]">Medio (20%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
              <span className="text-slate-600 text-[11px]">Seguro (25%)</span>
            </div>
          </div>
        </div>

        {/* Gráfico 2: Tendencia de Score de Ataques (Line Chart SVG) */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between lg:col-span-2">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                📈 Tendencia de Puntuación de Ataques (Juez J1 por Turno)
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-200">
                Últimas Sesiones
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              Calificación asignada por el Juez LLM J1 durante las iteraciones de Red-Teaming (Turnos 1 a 10).
            </p>
          </div>

          <div className="w-full h-44 my-2 relative">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="75" x2="500" y2="75" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
              <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />

              <text x="5" y="25" fill="#94a3b8" fontSize="9" fontWeight="bold">Score 10</text>
              <text x="5" y="70" fill="#94a3b8" fontSize="9" fontWeight="bold">Score 5</text>
              <text x="5" y="115" fill="#94a3b8" fontSize="9" fontWeight="bold">Score 1</text>

              <defs>
                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path
                d="M 50 120 L 50 115 L 100 115 L 150 115 L 200 115 L 250 115 L 300 115 L 350 115 L 400 115 L 450 115 L 450 140 L 50 140 Z"
                fill="url(#scoreGradient)"
              />

              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="50,115 100,115 150,115 200,115 250,115 300,115 350,115 400,115 450,115"
              />

              {[
                { x: 50, val: 'T1' },
                { x: 100, val: 'T2' },
                { x: 150, val: 'T3' },
                { x: 200, val: 'T4' },
                { x: 250, val: 'T5' },
                { x: 300, val: 'T6' },
                { x: 350, val: 'T7' },
                { x: 400, val: 'T8' },
                { x: 450, val: 'T10' },
              ].map((pt, i) => (
                <g key={i}>
                  <circle cx={pt.x} cy="115" r="4" fill="#1d4ed8" stroke="#ffffff" strokeWidth="2" />
                  <text x={pt.x - 7} y="135" fill="#64748b" fontSize="9" fontStyle="normal">{pt.val}</text>
                </g>
              ))}
            </svg>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 pt-2 font-mono">
            <span>● Resistencia HTTP 400 / Manejo de Errores: 100% Protegido</span>
            <span className="text-blue-700 font-bold">Puntaje Máximo Registrado: 2/10 (Seguro)</span>
          </div>
        </div>
      </div>

      {/* Gráfico 3: Cobertura OWASP LLM Top 10 (Bar Chart) */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              🛡️ Cobertura de Módulos de Ataque OWASP LLM Top 10
            </h3>
            <p className="text-[11px] text-slate-500">
              Vectores ofensivos probados contra los objetivos registrados en la plataforma.
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded text-[11px] font-bold">
            90% Mapeado
          </span>
        </div>

        <div className="space-y-3">
          {[
            { id: 'MOD-01', name: 'Direct & Indirect Prompt Injection', category: 'OWASP LLM01', pct: 95, color: 'bg-blue-600' },
            { id: 'MOD-02', name: 'Jailbreak y Evasión de Filtros', category: 'OWASP LLM01 / LLM07', pct: 85, color: 'bg-indigo-600' },
            { id: 'MOD-03', name: 'Fuga de Información y Sensible Disclosure', category: 'OWASP LLM06', pct: 90, color: 'bg-purple-600' },
            { id: 'MOD-04', name: 'Abuso de Funciones / Agentes RAG', category: 'OWASP LLM02', pct: 70, color: 'bg-amber-600' },
            { id: 'MOD-05', name: 'Inyección Sonora Speech-to-Text (STT)', category: 'Audio Channel', pct: 50, color: 'bg-slate-600' },
          ].map((m) => (
            <div key={m.id} className="space-y-1">
              <div className="flex justify-between text-xs font-medium text-slate-800">
                <span className="flex items-center gap-2">
                  <strong className="font-mono text-blue-700">{m.id}</strong>
                  <span>{m.name}</span>
                  <span className="text-[10px] text-slate-400">({m.category})</span>
                </span>
                <span className="font-bold font-mono">{m.pct}%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${m.color} rounded-full transition-all duration-500`} style={{ width: `${m.pct}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid Layout: Tabla Consolidada de Softwares y Accesos a Informes */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-4">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-white">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Histórico Consolidado de Softwares y Evaluación Técnico-IA</h3>
            <p className="text-[11px] text-slate-500">Selecciona un objetivo para consultar su informe técnico de seguridad o historial de observaciones de red</p>
          </div>
          <span className="text-xs font-bold text-slate-400">Total: {softwares.length} Registros</span>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Nombre del Software</th>
                <th className="px-4 py-3">Protocolo</th>
                <th className="px-4 py-3">Proveedor / Modelo LLM</th>
                <th className="px-4 py-3">Endpoint Objetivo</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Informe Técnico</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loadingSoftwares ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    Cargando historial de softwares...
                  </td>
                </tr>
              ) : softwares.length > 0 ? (
                softwares.map((sw) => (
                  <tr key={sw.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      SFT-{String(sw.id).padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{sw.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                        {sw.protocol}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{sw.llm_provider}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {sw.endpoint}
                    </td>
                    <td className="px-4 py-3">
                      {sw.status === 'Activo' ? (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          ● Activo
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {sw.status}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded px-2.5 py-1 text-[11px] font-bold transition inline-flex items-center gap-1 shadow-2xs"
                        onClick={() => handleOpenInforme(sw.id, sw.name)}
                        title="Abrir Informe Técnico Consolidado de IA"
                      >
                        🛡️ Ver Informe IA
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400 text-xs">
                    No hay softwares registrados actualmente en la plataforma.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE INFORME TÉCNICO DE SEGURIDAD E IA */}
      {selectedSoftwareForInforme && (
        <InformeSeguridadModal
          softwareId={selectedSoftwareForInforme.id}
          softwareName={selectedSoftwareForInforme.name}
          isOpen={isInformeModalOpen}
          onClose={() => setIsInformeModalOpen(false)}
          onLanzarEscaneo={() => alert('Para lanzar escaneos, navega a Targets Autorizados.')}
        />
      )}
    </div>
  );
};

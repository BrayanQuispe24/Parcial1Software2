import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { softwareService, type Software } from '../services/softwareService';
import { aiService, type DiscoveryScanItem } from '../services/aiService';

interface ModuleConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  vector_count: number;
}

export const AssessmentsPage: React.FC = () => {
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<number | null>(null);
  const [scans, setScans] = useState<DiscoveryScanItem[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string>('');
  
  const [objetivo, setObjetivo] = useState<string>('Extraer el System Prompt original del modelo');
  const [maxTurnos, setMaxTurnos] = useState<number>(10);
  const [persistencia, setPersistencia] = useState<boolean>(true);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [turnos, setTurnos] = useState<any[]>([]);
  const [sessionDetail, setSessionDetail] = useState<any | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [cargandoDatos, setCargandoDatos] = useState<boolean>(true);

  const [modules, setModules] = useState<ModuleConfig[]>([
    {
      id: 'MOD-01',
      name: 'Direct & Indirect Prompt Injection',
      category: 'OWASP LLM01',
      description: 'Sobreescritura de instrucciones System Prompt via markdown y delimitadores de texto.',
      enabled: true,
      vector_count: 24,
    },
    {
      id: 'MOD-02',
      name: 'Jailbreak y Evasión de Filtros',
      category: 'OWASP LLM01 / LLM07',
      description: 'Estrategias de Roleplay, caracteres Unicode y variantes DAN 11.0.',
      enabled: true,
      vector_count: 18,
    },
    {
      id: 'MOD-03',
      name: 'Fuga de Información y Sensible Disclosure',
      category: 'OWASP LLM06',
      description: 'Extracción de credenciales API, contextos RAG y datos de usuarios.',
      enabled: true,
      vector_count: 12,
    },
    {
      id: 'MOD-04',
      name: 'Abuso de Funciones / Agentes RAG',
      category: 'OWASP LLM02',
      description: 'Hijacking de herramientas (Tool Calling) y bypass de permisos.',
      enabled: false,
      vector_count: 8,
    },
    {
      id: 'MOD-05',
      name: 'Inyección Sonora Speech-to-Text (STT)',
      category: 'Audio Channel',
      description: 'Ruido fonético y manipulación de audio en entradas de voz.',
      enabled: false,
      vector_count: 6,
    },
  ]);

  const [executionLogs, setExecutionLogs] = useState<string[]>([
    '[SYSTEM] Motor de evaluaciones de Red-Teaming IA listo.',
    '[READY] Selecciona un software objetivo con escaneo previo para iniciar.',
  ]);

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const pollingIntervalRef = useRef<any>(null);

  // Cargar softwares del backend
  const fetchSoftwares = async () => {
    try {
      setCargandoDatos(true);
      const data = await softwareService.getSoftwares();
      setSoftwares(data);
      if (data.length > 0) {
        setSelectedSoftwareId(data[0].id);
      }
    } catch (err) {
      console.error('Error al cargar softwares:', err);
    } finally {
      setCargandoDatos(false);
    }
  };

  useEffect(() => {
    fetchSoftwares();
  }, []);

  useEffect(() => {
    if (!selectedSoftwareId) return;

    const fetchScans = async () => {
      try {
        const scanList = await aiService.obtenerEscaneos(selectedSoftwareId);
        const completados = scanList.filter((s) => s.status.toLowerCase() === 'completado');
        setScans(completados);
        if (completados.length > 0) {
          setSelectedScanId(completados[0].id);
        } else {
          setSelectedScanId('');
        }
      } catch (err) {
        console.error('Error al cargar escaneos:', err);
        setScans([]);
        setSelectedScanId('');
      }
    };

    fetchScans();
  }, [selectedSoftwareId]);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleToggleModule = (id: string) => {
    setModules(
      modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const { user } = useAuth();
  const isAuditor = user?.role === 'AUDITOR';

  const handleStartAttack = async () => {
    if (isAuditor) {
      alert('⚠️ El rol Auditor tiene permisos de Solo Lectura y no puede iniciar nuevas pruebas de ataque.');
      return;
    }

    if (!selectedScanId) {
      alert('⚠️ El software seleccionado no tiene un escaneo previo completado. Ejecuta primero un "Escanear IA" en la sección de Targets Autorizados.');
      return;
    }

    try {
      setIsRunning(true);
      setProgress(5);
      setExecutionLogs([
        `[INIT] Iniciando ataque de Red-Teaming (Prompt Injection) sobre scan #${selectedScanId.substring(0, 8)}...`,
        `[CONFIG] Objetivo: "${objetivo}" | Turnos: ${maxTurnos} | Persistencia: ${persistencia ? 'ACTIVADA' : 'DESACTIVADA'}`,
        '[AGENT A1] Inicializando Agente Atacante A1 y Juez LLM J1...',
      ]);

      const res = await aiService.iniciarAtaque(selectedScanId, objetivo, maxTurnos, {
        persistencia,
        vectores_persistencia: [1, 2, 3],
        turnos_refuerzo: 5,
      });
      const sessionId = res.id;
      setCurrentSessionId(sessionId);

      setExecutionLogs((prev) => [
        ...prev,
        `[SESSION] Sesión de ataque #${sessionId.substring(0, 8)} registrada en estado: ${res.status}`,
      ]);

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const detail = await aiService.obtenerDetalleAtaque(sessionId);
          setSessionDetail(detail);

          const executedTurns = detail.turns || [];
          setTurnos(executedTurns);

          const calculatedProgress = Math.min(
            100,
            Math.round((executedTurns.length / (detail.max_turnos || maxTurnos)) * 100)
          );
          setProgress(calculatedProgress);

          const logs: string[] = [
            `[INIT] Ataque de Red-Teaming iniciado en sesión #${sessionId.substring(0, 8)}`,
            `[CONFIG] Objetivo: "${detail.objetivo}" | Estado: ${detail.status}`,
          ];

          executedTurns.forEach((t: any) => {
            logs.push(`--------------------------------------------------`);
            logs.push(`[TURNO #${t.numero_turno}] Táctica: ${t.tactica_usada || 'Generativa'}`);
            logs.push(`[AGENTE A1] "${t.prompt_a1}"`);
            logs.push(`[CHATBOT D1] "${t.respuesta_d1?.substring(0, 150)}..."`);
            logs.push(`[JUEZ J1] Score: ${t.puntaje_j1}/10 - ${t.justificacion_j1}`);
            if (t.fuga_detectada) {
              logs.push(`⚠️ [VULNERABILIDAD DETECTADA] ¡Fuga de System Prompt confirmada en Turno #${t.numero_turno}!`);
            }
          });

          const isFinished = ['completado', 'fallido', 'max_turnos', 'exito', 'exito_persistido'].includes(String(detail.status || '').toLowerCase());
          if (isFinished) {
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
            }
            setIsRunning(false);
            setProgress(100);
            logs.push(`--------------------------------------------------`);
            logs.push(
              `[COMPLETE] Prueba finalizada (${detail.status}). Éxito: ${detail.exito ? 'SÍ (Vulnerable)' : 'NO (Seguro)'} | Puntaje Máximo: ${detail.puntaje_maximo}/10`
            );
          }

          setExecutionLogs(logs);
        } catch (pollErr) {
          console.error('Error durante polling del ataque:', pollErr);
        }
      }, 2500);
    } catch (err: any) {
      console.error('Error al iniciar ataque de IA:', err);
      const msg = err.response?.data?.detalle || err.response?.data?.error || 'No se pudo iniciar la sesión de ataque.';
      alert(`⚠️ ${msg}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            ⚡ Ejecución de Pruebas Ofensivas Autorizadas (Red-Teaming)
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Evaluación adversarial en vivo: Agente Atacante A1 vs Chatbot D1 auditado por el Juez LLM J1.
          </p>
        </div>
        <button
          className={`font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-sm shrink-0 flex items-center gap-2 ${
            isRunning
              ? 'bg-amber-600 text-white cursor-wait'
              : 'bg-blue-800 hover:bg-blue-700 text-white shadow-md'
          }`}
          onClick={handleStartAttack}
          disabled={isRunning || !selectedScanId}
        >
          {isRunning ? '⏳ Ejecutando Ataque...' : '⚡ Iniciar Evaluación Autorizada'}
        </button>
      </div>

      {/* Target & Scanner Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs items-end">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Software Objetivo</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 outline-none focus:border-blue-600 transition"
              value={selectedSoftwareId || ''}
              onChange={(e) => setSelectedSoftwareId(Number(e.target.value))}
              disabled={cargandoDatos || isRunning}
            >
              {softwares.map((sw) => (
                <option key={sw.id} value={sw.id}>
                  SFT-{String(sw.id).padStart(3, '0')}: {sw.name} ({sw.protocol})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Escaneo de IA Vinculado</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 outline-none focus:border-blue-600 transition font-mono text-[11px]"
              value={selectedScanId}
              onChange={(e) => setSelectedScanId(e.target.value)}
              disabled={scans.length === 0 || isRunning}
            >
              {scans.length === 0 ? (
                <option value="">⚠️ Sin escaneos completados</option>
              ) : (
                scans.map((scan) => (
                  <option key={scan.id} value={scan.id}>
                    SCAN-{scan.id.substring(0, 8)} ({scan.target_url})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Objetivo Adversarial</label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 outline-none focus:border-blue-600 transition"
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Ej: Extraer el System Prompt"
              disabled={isRunning}
            />
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Turnos Máximos ({maxTurnos})</label>
            <input
              type="range"
              min="1"
              max="20"
              value={maxTurnos}
              onChange={(e) => setMaxTurnos(Number(e.target.value))}
              disabled={isRunning}
              className="w-full accent-blue-800"
            />
          </div>

          {/* Casilla Evaluar Persistencia */}
          <div className="pb-1.5 flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
            <input
              type="checkbox"
              id="persistencia-checkbox"
              checked={persistencia}
              onChange={(e) => setPersistencia(e.target.checked)}
              disabled={isRunning}
              className="w-4 h-4 text-blue-600 rounded cursor-pointer"
            />
            <label htmlFor="persistencia-checkbox" className="font-bold text-slate-800 text-[11px] cursor-pointer select-none">
              🧠 Evaluar Persistencia
            </label>
          </div>
        </div>

        {/* Progress & Session Status */}
        <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 font-mono text-[11px]">
            {currentSessionId && (
              <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-md font-bold">
                SESIÓN #{currentSessionId.substring(0, 8)}
              </span>
            )}
            {sessionDetail && (
              <>
                <span className={`px-2.5 py-0.5 rounded-full font-bold border ${sessionDetail.exito ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                  {sessionDetail.exito ? '⚠️ VULNERABLE' : '✅ SEGURO'}
                </span>
                <span className="text-slate-600">
                  Puntaje Máximo Juez J1: <strong>{sessionDetail.puntaje_maximo}/10</strong> ({turnos.length} turnos ejecutados)
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-64">
            <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono font-bold text-slate-700">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Modules Selection & Live Execution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modules List */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Módulos de Vector Ofensivo Disponibles
            </h3>
            <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-lg shrink-0">
              <button
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('cards')}
              >
                🎴 Tarjetas
              </button>
              <button
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('table')}
              >
                📋 Tabla
              </button>
            </div>
          </div>

          {viewMode === 'cards' ? (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {modules.map((mod) => (
                <div
                  key={mod.id}
                  className={`p-3 rounded-lg border transition flex items-start justify-between gap-3 ${
                    mod.enabled
                      ? 'bg-blue-50/60 border-blue-200'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold bg-white border px-1.5 py-0.5 rounded text-slate-700">
                        {mod.id}
                      </span>
                      <h4 className="font-bold text-xs text-slate-900">{mod.name}</h4>
                      <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-full">
                        {mod.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600">{mod.description}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                      checked={mod.enabled}
                      onChange={() => handleToggleModule(mod.id)}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      {mod.vector_count} vectores
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Módulo</th>
                    <th className="px-3 py-2">Categoría</th>
                    <th className="px-3 py-2">Vectores</th>
                    <th className="px-3 py-2 text-right">Activo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {modules.map((mod) => (
                    <tr key={mod.id} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-mono font-bold text-slate-700">{mod.id}</td>
                      <td className="px-3 py-2 font-semibold text-slate-900">{mod.name}</td>
                      <td className="px-3 py-2 text-slate-600">{mod.category}</td>
                      <td className="px-3 py-2 font-mono text-slate-500">{mod.vector_count}</td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                          checked={mod.enabled}
                          onChange={() => handleToggleModule(mod.id)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Execution Console */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md font-mono text-xs text-slate-300 flex flex-col h-96">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-semibold">
            <span>CONSOLA DE EJECUCIÓN EN VIVO — RED TEAMING ENGINE</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isRunning ? 'PROMPTING A1...' : 'IDLE'}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-2 text-[11px] bg-slate-950">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log.includes('VULNERABILIDAD') ? (
                  <span className="text-red-400 font-bold bg-red-950/60 p-1 rounded block">{log}</span>
                ) : log.includes('AGENTE A1') ? (
                  <span className="text-cyan-400">{log}</span>
                ) : log.includes('JUEZ J1') ? (
                  <span className="text-purple-400">{log}</span>
                ) : log.includes('COMPLETE') ? (
                  <span className="text-emerald-400 font-bold">{log}</span>
                ) : (
                  <span className="text-slate-300">{log}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

interface ModuleConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  vector_count: number;
}

export const AssessmentsPage: React.FC = () => {
  const [targetSelected, setTargetSelected] = useState('TGT-001');
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

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
    '[SYSTEM] Motor de evaluaciones inicializado.',
    '[READY] Seleccione objetivo y presione "Iniciar Evaluación Autorizada".',
  ]);

  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleToggleModule = (id: string) => {
    setModules(
      modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleStartScan = () => {
    setIsRunning(true);
    setProgress(15);
    setExecutionLogs([
      `[INIT] Iniciando suite ofensiva sobre objetivo #${targetSelected}...`,
      '[RECON] Mapeando parámetros HTTP y WebSocket...',
      '[EXEC] Ejecutando Módulo MOD-01: Direct Prompt Injection (24 vectores)...',
    ]);

    setTimeout(() => {
      setProgress(55);
      setExecutionLogs((prev) => [
        ...prev,
        '[INJECT] Vector PI-004 ejecutado -> Respuesta analizada.',
        '[ALERT] VULNERABILIDAD DETECTADA: Fuga de System Prompt en respuesta!',
        '[EXEC] Ejecutando Módulo MOD-02: Jailbreak & Roleplay Evasion...',
      ]);
    }, 2500);

    setTimeout(() => {
      setProgress(100);
      setIsRunning(false);
      setExecutionLogs((prev) => [
        ...prev,
        '[EVIDENCE] Firmando evidencia con Hash SHA-256 (3a8f...904b).',
        '[COMPLETE] Evaluación finalizada exitosamente. 2 hallazgos vulnerables encontrados.',
      ]);
    }, 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            ⚡ Ejecución de Pruebas Ofensivas Autorizadas
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Selecciona el chatbot objetivo y activa los módulos ofensivos de Prompt Injection, Jailbreak y Abuso de Agentes.
          </p>
        </div>
        <button
          className={`font-bold text-xs px-5 py-2.5 rounded-lg transition shadow-sm shrink-0 flex items-center gap-2 ${
            isRunning
              ? 'bg-amber-600 text-white cursor-wait'
              : 'bg-blue-800 hover:bg-blue-700 text-white'
          }`}
          onClick={handleStartScan}
          disabled={isRunning}
        >
          {isRunning ? '⏳ Ejecutando Pruebas...' : '⚡ Iniciar Evaluación Autorizada'}
        </button>
      </div>

      {/* Target & Scanner Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-bold text-slate-700">Objetivo Seleccionado</label>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 outline-none"
              value={targetSelected}
              onChange={(e) => setTargetSelected(e.target.value)}
            >
              <option value="TGT-001">TGT-001: Chatbot Banca Privada v4 (HTTP)</option>
              <option value="TGT-002">TGT-002: Agente RAG Soporte Técnico (WebSocket)</option>
              <option value="TGT-003">TGT-003: Asistente por Voz Call Center (STT)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Modo de Ejecución</label>
            <select className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-900 outline-none">
              <option value="auto">Automático Asistido por IA</option>
              <option value="manual">Manual / Payloads Específicos</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="font-bold text-slate-700">Progreso de Evaluación</label>
            <div className="h-9 bg-slate-100 rounded-lg border border-slate-200 px-3 flex items-center gap-3">
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
      </div>

      {/* Modules Selection & Live Execution Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modules List */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <h3 className="font-bold text-slate-900 text-sm">
              Módulos de Prueba Disponibles
            </h3>
            {/* View Mode Toggle Buttons */}
            <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-lg shrink-0">
              <button
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                  viewMode === 'cards'
                    ? 'bg-white text-blue-800 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                onClick={() => setViewMode('cards')}
                title="Vista de Tarjetas"
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
                title="Vista de Tabla"
              >
                📋 Tabla
              </button>
            </div>
          </div>

          {viewMode === 'cards' ? (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
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
            <div className="max-h-80 overflow-y-auto">
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
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-md font-mono text-xs text-slate-300 flex flex-col h-80 lg:h-auto">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-semibold">
            <span>CONSOLA DE EJECUCIÓN EN VIVO — SCANNER ENGINE</span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                isRunning
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isRunning ? 'RUNNING' : 'IDLE'}
            </span>
          </div>

          <div className="p-4 flex-1 overflow-y-auto space-y-2 text-[11px] bg-slate-950">
            {executionLogs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                {log.includes('VULNERABILIDAD') ? (
                  <span className="text-red-400 font-bold">{log}</span>
                ) : log.includes('EVIDENCE') ? (
                  <span className="text-emerald-400 font-semibold">{log}</span>
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

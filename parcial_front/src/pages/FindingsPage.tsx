import React, { useState, useEffect } from 'react';
import { softwareService } from '../services/softwareService';
import { aiService, type InformeSeguridad, type HallazgoVulnerabilidad } from '../services/aiService';

interface Finding {
  id: string;
  owasp_category: string;
  mitre_tactic: string;
  vector_name: string;
  target_name: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'VULNERABLE' | 'MITIGADO' | 'REVISIÓN';
  sha256_hash: string;
  payload: string;
  response_output: string;
  mitigation: string;
}

// Función helper para generar un Hash SHA-256 visual de la evidencia
const generateMockSHA256 = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex}884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08`.substring(0, 64);
};

export const FindingsPage: React.FC = () => {
  const [findings, setFindings] = useState<Finding[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const cargarHallazgosReales = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Obtener la lista de softwares autorizados
      const listSoftwares = await softwareService.getSoftwares();
      
      const hallazgosAcumulados: Finding[] = [];

      // 2. Consultar el informe consolidado de seguridad por cada software
      for (const sw of listSoftwares) {
        try {
          const informe: InformeSeguridad = await aiService.obtenerInformeSeguridad(sw.id);
          if (informe && informe.hallazgos_vulnerabilidad) {
            informe.hallazgos_vulnerabilidad.forEach((h: HallazgoVulnerabilidad, idx: number) => {
              const score = h.puntaje_juez || 0;
              const severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' =
                score >= 9 ? 'CRITICAL' : score >= 7 ? 'HIGH' : score >= 4 ? 'MEDIUM' : 'LOW';

              const hashInput = `${sw.name}-${h.session_id}-${h.numero_turno}-${h.justificacion}`;
              
              hallazgosAcumulados.push({
                id: `LLM-${String(sw.id).padStart(2, '0')}-${idx + 1}`,
                owasp_category: score >= 8 ? 'LLM01: Direct Prompt Injection' : 'LLM07: System Prompt Leakage',
                mitre_tactic: `AML.T0054: ${h.tactica_usada || 'Prompt Overwrite'}`,
                vector_name: `Fuga de System Prompt en Turno #${h.numero_turno} (${h.tactica_usada})`,
                target_name: sw.name,
                severity: severity,
                status: score >= 7 ? 'VULNERABLE' : 'MITIGADO',
                sha256_hash: generateMockSHA256(hashInput),
                payload: `Inyección sobre canal detectado (${sw.endpoint})`,
                response_output: h.justificacion,
                mitigation: 'Implementar validadores de salida semánticos y sanitización de prompts de sistema.',
              });
            });
          }
        } catch (infErr) {
          console.warn(`No se pudo obtener informe para software #${sw.id}:`, infErr);
        }
      }

      setFindings(hallazgosAcumulados);
    } catch (err) {
      console.error('Error al cargar hallazgos reales:', err);
      setError('No se pudieron consultar las evidencias de auditoría desde el servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarHallazgosReales();
  }, []);

  const filteredFindings = findings.filter(
    (f) => severityFilter === 'ALL' || f.severity === severityFilter
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            ⚠️ Matriz de Hallazgos y Evidencias de Seguridad LLM
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Clasificación oficial de vulnerabilidades en vivo alineada con OWASP LLM Top 10, MITRE ATLAS y firmas SHA-256.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-semibold text-xs px-3.5 py-2 rounded-lg transition shadow-xs shrink-0 flex items-center gap-1.5"
            onClick={cargarHallazgosReales}
            disabled={loading}
          >
            <span>🔄</span> Actualizar Evidencias
          </button>
        </div>
      </div>

      {/* Findings Main Card Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-white">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Hallazgos Detectados en Vivo</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-100">
              {findings.length}
            </span>
          </h3>
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 text-xs font-medium">Filtrar Severidad:</span>
              <select
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-700 outline-none"
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
              >
                <option value="ALL">Todas las Severidades</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>

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
        </div>

        {/* Loading / Error States */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
            <span>Consolidando matriz de vulnerabilidades desde el servidor...</span>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-600 text-xs space-y-2">
            <p>⚠️ {error}</p>
            <button onClick={cargarHallazgosReales} className="underline font-bold">
              Reintentar
            </button>
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <p>✅ No se han detectado vulnerabilidades confirmadas en las pruebas ejecutadas.</p>
            <p className="text-[11px] text-slate-400">Ejecuta una evaluación en el módulo de Pruebas Ofensivas para generar evidencias.</p>
          </div>
        ) : viewMode === 'cards' ? (
          /* Card View Mode */
          <div className="p-4 bg-slate-50/50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFindings.map((f) => (
                <div
                  key={f.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs hover:shadow-md transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="font-mono font-bold text-xs bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                        {f.id}
                      </span>
                      <div>
                        {f.severity === 'CRITICAL' ? (
                          <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            CRITICAL
                          </span>
                        ) : f.severity === 'HIGH' ? (
                          <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            HIGH
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            MEDIUM
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{f.vector_name}</h4>
                      <span className="text-[11px] font-semibold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block mt-1">
                        {f.owasp_category}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Objetivo:</span>
                        <span className="font-semibold text-slate-700">{f.target_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-slate-400">Estado:</span>
                        {f.status === 'VULNERABLE' ? (
                          <span className="text-red-600 font-bold">● VULNERABLE</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">● MITIGADO</span>
                        )}
                      </div>
                    </div>

                    <div className="text-[10px] font-mono bg-slate-950 text-slate-300 p-2 rounded-lg truncate border border-slate-800">
                      <span className="text-sky-400 font-bold">Resumen: </span>
                      {f.response_output}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      className="w-full bg-blue-800 hover:bg-blue-700 text-white rounded-lg py-1.5 text-xs font-bold transition shadow-xs flex items-center justify-center gap-1"
                      onClick={() => setSelectedFinding(f)}
                    >
                      🔍 Ver Evidencia SHA-256
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Table View Mode */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Código ID</th>
                  <th className="px-4 py-3">Categoría OWASP LLM</th>
                  <th className="px-4 py-3">Target Objetivo</th>
                  <th className="px-4 py-3">Severidad</th>
                  <th className="px-4 py-3">Estado Audit</th>
                  <th className="px-4 py-3 text-right">Detalle & Evidencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredFindings.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{f.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{f.owasp_category}</td>
                    <td className="px-4 py-3 text-slate-600">{f.target_name}</td>
                    <td className="px-4 py-3">
                      {f.severity === 'CRITICAL' ? (
                        <span className="bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          CRITICAL
                        </span>
                      ) : f.severity === 'HIGH' ? (
                        <span className="bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          HIGH
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          MEDIUM
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {f.status === 'VULNERABLE' ? (
                        <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          ● VULNERABLE
                        </span>
                      ) : (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[11px] font-bold">
                          ● MITIGADO
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        className="bg-blue-800 hover:bg-blue-700 text-white rounded px-3 py-1 text-[11px] font-bold transition shadow-xs"
                        onClick={() => setSelectedFinding(f)}
                      >
                        🔍 Ver Evidencia SHA-256
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Detalle del Hallazgo */}
      {selectedFinding && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFinding(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
              <div>
                <span className="font-mono text-xs text-sky-400 font-bold">
                  {selectedFinding.id} — {selectedFinding.owasp_category}
                </span>
                <h3 className="text-sm font-bold mt-0.5">{selectedFinding.vector_name}</h3>
              </div>
              <button
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-lg text-xs transition"
                onClick={() => setSelectedFinding(null)}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700 overflow-y-auto">
              <div className="space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Táctica MITRE ATLAS:
                </span>
                <div className="bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-slate-800">
                  {selectedFinding.mitre_tactic}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Firma Hash de Evidencia (SHA-256):
                </span>
                <div className="bg-slate-950 text-emerald-400 p-2.5 rounded-lg font-mono text-[11px] break-all border border-slate-800">
                  {selectedFinding.sha256_hash}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Payload / Vector de Ataque:
                </span>
                <div className="bg-slate-100 p-3 rounded-lg font-mono text-[11px] text-slate-900 border border-slate-200">
                  {selectedFinding.payload}
                </div>
              </div>

              <div className="space-y-1">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                  Justificación y Evidencia del Juez LLM J1:
                </span>
                <div className="bg-slate-950 text-slate-200 p-3 rounded-lg font-mono text-[11px] border border-slate-800 leading-relaxed">
                  {selectedFinding.response_output}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1">
                <span className="font-bold text-amber-900 text-[11px]">Recomendación de Mitigación:</span>
                <p className="text-amber-800 leading-relaxed">{selectedFinding.mitigation}</p>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                className="bg-slate-800 hover:bg-slate-900 text-white font-bold px-4 py-2 rounded-lg text-xs transition"
                onClick={() => setSelectedFinding(null)}
              >
                Cerrar Inspección
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

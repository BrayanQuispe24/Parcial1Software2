import React, { useEffect, useState } from 'react';
import {
  aiService,
  type InformeSeguridad,
  type DiscoveryScanItem,
  type NetworkObservationItem,
} from '../services/aiService';

interface Props {
  softwareId: number;
  softwareName: string;
  isOpen: boolean;
  onClose: () => void;
  onLanzarEscaneo?: () => void;
}

export const InformeSeguridadModal: React.FC<Props> = ({
  softwareId,
  softwareName,
  isOpen,
  onClose,
  onLanzarEscaneo,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'escaneos' | 'hallazgos' | 'ataques'>('resumen');
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);
  const [informe, setInforme] = useState<InformeSeguridad | null>(null);
  const [escaneos, setEscaneos] = useState<DiscoveryScanItem[]>([]);
  const [cargando, setCargando] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Estado para desplegar observaciones de red sanitizadas por escaneo
  const [expandedScanId, setExpandedScanId] = useState<string | null>(null);
  const [observacionesMap, setObservacionesMap] = useState<Record<string, NetworkObservationItem[]>>({});
  const [cargandoObs, setCargandoObs] = useState<Record<string, boolean>>({});

  // Estado para desplegar detalle técnico individual del escaneo por su ID
  const [expandedDetailScanId, setExpandedDetailScanId] = useState<string | null>(null);
  const [detallesMap, setDetallesMap] = useState<Record<string, any>>({});
  const [cargandoDetalle, setCargandoDetalle] = useState<Record<string, boolean>>({});

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      const [dataInforme, dataEscaneos] = await Promise.all([
        aiService.obtenerInformeSeguridad(softwareId),
        aiService.obtenerEscaneos(softwareId),
      ]);
      setInforme(dataInforme);
      setEscaneos(dataEscaneos);
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.mensaje ||
        'No se pudo obtener el informe de seguridad.';
      setError(msg);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (isOpen && softwareId) {
      cargarDatos();
    }
  }, [isOpen, softwareId]);

  const handleToggleObservaciones = async (scanId: string) => {
    if (expandedScanId === scanId) {
      setExpandedScanId(null);
      return;
    }
    setExpandedScanId(scanId);
    if (!observacionesMap[scanId]) {
      try {
        setCargandoObs((prev) => ({ ...prev, [scanId]: true }));
        const obs = await aiService.obtenerObservaciones(scanId);
        setObservacionesMap((prev) => ({ ...prev, [scanId]: obs }));
      } catch (err) {
        console.error('Error al cargar tráfico de red del escaneo:', err);
      } finally {
        setCargandoObs((prev) => ({ ...prev, [scanId]: false }));
      }
    }
  };

  const handleToggleDetalle = async (scanId: string) => {
    if (expandedDetailScanId === scanId) {
      setExpandedDetailScanId(null);
      return;
    }
    setExpandedDetailScanId(scanId);
    if (!detallesMap[scanId]) {
      try {
        setCargandoDetalle((prev) => ({ ...prev, [scanId]: true }));
        const detalle = await aiService.obtenerDetalleEscaneo(scanId);
        setDetallesMap((prev) => ({ ...prev, [scanId]: detalle }));
      } catch (err) {
        console.error('Error al cargar el detalle técnico del escaneo:', err);
      } finally {
        setCargandoDetalle((prev) => ({ ...prev, [scanId]: false }));
      }
    }
  };

  if (!isOpen) return null;

  const getNivelRiesgo = (score: number) => {
    if (score === 0)
      return {
        label: 'SEGURO / SIN VULNERABILIDAD',
        dotClass: 'bg-emerald-500',
        badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      };
    if (score <= 3)
      return {
        label: 'RIESGO BAJO',
        dotClass: 'bg-blue-500',
        badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
      };
    if (score <= 6)
      return {
        label: 'RIESGO MEDIO',
        dotClass: 'bg-amber-500',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      };
    if (score <= 8)
      return {
        label: 'RIESGO ALTO',
        dotClass: 'bg-orange-500',
        badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
      };
    return {
      label: 'CRÍTICO - FUGA DE SYSTEM PROMPT',
      dotClass: 'bg-red-600 animate-pulse',
      badgeClass: 'bg-red-50 text-red-800 border-red-200',
    };
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completado':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Completado
          </span>
        );
      case 'pendiente':
      case 'escaneando':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
            Escaneando...
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
            {status}
          </span>
        );
    }
  };

  const nivelRiesgo = informe
    ? getNivelRiesgo(informe.resumen.puntaje_vulnerabilidad_maximo)
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/50 backdrop-blur-xs">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800">

        {/* Sub-Header / Breadcrumb Enterprise Bar */}
        <div className="px-6 pt-3.5 pb-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Evaluaciones</span>
            <span>/</span>
            <span>Software Targets</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">{softwareName}</span>
            <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              SFT-{String(softwareId).padStart(3, '0')}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition p-1 rounded-md hover:bg-slate-200"
            title="Cerrar modal (Esc)"
          >
            ✕
          </button>
        </div>

        {/* Header Principal */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              Informe Técnico de Seguridad e Inspección IA
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consolidado de descubrimiento de canales, inspección de tráfico y pruebas adversariales.
            </p>
          </div>

          {/* Badge de Riesgo Global Compacto */}
          {nivelRiesgo && (
            <div className={`px-3.5 py-2 rounded-xl border flex items-center gap-3 ${nivelRiesgo.badgeClass}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${nivelRiesgo.dotClass}`}></span>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block">Evaluación de Riesgo</span>
                <span className="text-xs font-bold">{nivelRiesgo.label}</span>
              </div>
              <div className="pl-3 border-l border-slate-200/80 text-right">
                <span className="text-[10px] opacity-75 block">Score</span>
                <span className="text-sm font-black">{informe?.resumen.puntaje_vulnerabilidad_maximo}/10</span>
              </div>
            </div>
          )}
        </div>

        {/* Tabs de Navegación Operativa */}
        <div className="px-6 bg-slate-50/80 border-b border-slate-200 flex items-center gap-1 text-xs">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-4 py-3 font-bold transition border-b-2 ${activeTab === 'resumen'
                ? 'border-blue-800 text-blue-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold'
              }`}
          >
            📊 Resumen & Canales IA
          </button>
          <button
            onClick={() => setActiveTab('escaneos')}
            className={`px-4 py-3 font-bold transition border-b-2 flex items-center gap-1.5 ${activeTab === 'escaneos'
                ? 'border-blue-800 text-blue-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold'
              }`}
          >
            <span>📜 Historial de Escaneos</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
              {escaneos.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('hallazgos')}
            className={`px-4 py-3 font-bold transition border-b-2 flex items-center gap-1.5 ${activeTab === 'hallazgos'
                ? 'border-blue-800 text-blue-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold'
              }`}
          >
            <span>⚠️ Vulnerabilidades</span>
            {informe && informe.hallazgos_vulnerabilidad.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                {informe.hallazgos_vulnerabilidad.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('ataques')}
            className={`px-4 py-3 font-bold transition border-b-2 flex items-center gap-1.5 ${activeTab === 'ataques'
                ? 'border-blue-800 text-blue-800 bg-white shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 font-semibold'
              }`}
          >
            <span>⚡ Sesiones de Ataque</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
              {informe?.sesiones_ataque?.length || informe?.resumen?.total_evaluaciones_ataque || 0}
            </span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
          {cargando && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <div className="w-8 h-8 border-3 border-blue-800 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-xs font-medium">Cargando reporte consolidado...</p>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
              <span>⚠️ <strong>Error:</strong> {error}</span>
              <button onClick={cargarDatos} className="underline font-semibold hover:text-red-900">
                Reintentar
              </button>
            </div>
          )}

          {!cargando && !error && informe && (
            <>
              {/* TAB 1: RESUMEN Y CANALES */}
              {activeTab === 'resumen' && (
                <div className="space-y-6">
                  {/* KPI Cards Enterprise */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Total Escaneos</span>
                      <div className="text-2xl font-bold text-blue-800 mt-1">{informe.resumen.total_escaneos}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Ejecutados localmente</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Canales IA Detectados</span>
                      <div className="text-2xl font-bold text-cyan-700 mt-1">{informe.resumen.canales_ia_identificados}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Confirmados con Playwright</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Pruebas de Ataque</span>
                      <div className="text-2xl font-bold text-purple-700 mt-1">{informe.resumen.total_evaluaciones_ataque}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Prompt Injection (A1)</span>
                    </div>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
                      <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block">Ataques Exitosos</span>
                      <div className="text-2xl font-bold text-red-600 mt-1">{informe.resumen.evaluaciones_exitosas_vulnerables}</div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Fugas de Prompt confirmadas</span>
                    </div>
                  </div>

                  {/* Canales de IA Identificados */}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                      <span>📡 Canales de Inteligencia Artificial Identificados ({informe.canales_descubiertos.length})</span>
                      <span className="text-slate-400 font-normal normal-case">Endpoints y protocolos mapeados</span>
                    </h3>

                    {informe.canales_descubiertos.length === 0 ? (
                      <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 italic">
                        No se han registrado canales de IA confirmados en este software objetivo.
                      </div>
                    ) : (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                            <tr>
                              <th className="px-4 py-3">Endpoint URL</th>
                              <th className="px-4 py-3">Tipo Canal</th>
                              <th className="px-4 py-3">Protocolo</th>
                              <th className="px-4 py-3">Método</th>
                              <th className="px-4 py-3">Modo Entrada</th>
                              <th className="px-4 py-3 text-right">Confianza</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {informe.canales_descubiertos.map((canal, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/80 transition font-mono text-[11px]">
                                <td className="px-4 py-3 font-bold text-blue-800">{canal.url}</td>
                                <td className="px-4 py-3 text-slate-700 font-sans">{canal.channel_type}</td>
                                <td className="px-4 py-3 text-slate-500">{canal.protocol}</td>
                                <td className="px-4 py-3 font-semibold text-slate-700">{canal.method}</td>
                                <td className="px-4 py-3 text-slate-600 font-sans">{canal.input_mode || 'texto'}</td>
                                <td className="px-4 py-3 text-right">
                                  <span className="px-2.5 py-0.5 rounded-full font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                                    {(canal.confidence * 100).toFixed(0)}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: HISTORIAL DE ESCANEOS INDIVIDUALES */}
              {activeTab === 'escaneos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Historial detallado por cada escaneo de Playwright y Ollama</span>
                    <span>Total: {escaneos.length} ejecuciones</span>
                  </div>

                  {escaneos.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 italic">
                      No se encuentran escaneos registrados para este software.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {escaneos.map((scan) => (
                        <div
                          key={scan.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[11px] font-bold text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                SCAN-{scan.id.substring(0, 8)}
                              </span>
                              {getStatusBadge(scan.status)}
                            </div>
                            <span className="text-slate-400 text-[11px] font-mono">
                              {new Date(scan.created_at).toLocaleString()}
                            </span>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/80 p-3 rounded-lg border border-slate-200/80 font-mono text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Target URL</span>
                              <span className="text-slate-800 truncate block font-medium">{scan.target_url}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Modelo Inspeccionador</span>
                              <span className="text-slate-800 truncate block font-medium">{scan.ia_modelo || 'Local Qwen2.5'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Marcador Canario</span>
                              <span className="text-emerald-700 font-bold truncate block">{scan.marcador || 'N/A'}</span>
                            </div>
                          </div>

                          {/* Canal Detectado en este escaneo */}
                          {scan.ai_channel && (
                            <div className="p-3 rounded-lg bg-cyan-50/60 border border-cyan-200/80 text-xs space-y-1 font-mono">
                              <div className="flex items-center justify-between text-cyan-900 font-bold">
                                <span>📡 Canal IA Confirmado: {scan.ai_channel.url}</span>
                                <span className="text-[11px]">Confianza: {(scan.ai_channel.confidence * 100).toFixed(0)}%</span>
                              </div>
                              <div className="text-[11px] text-cyan-700 flex gap-4">
                                <span>Protocolo: {scan.ai_channel.protocol}</span>
                                <span>Método: {scan.ai_channel.method}</span>
                                <span>Modo: {scan.ai_channel.input_mode || 'texto'}</span>
                              </div>
                            </div>
                          )}

                          {/* Botones de Acción para Inspeccionar el Escaneo */}
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/80 mt-2">
                            <button
                              onClick={() => handleToggleDetalle(scan.id)}
                              className="text-xs font-bold text-cyan-800 hover:text-cyan-900 transition flex items-center gap-1.5 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-lg border border-cyan-200 shadow-2xs"
                            >
                              <span>📄</span>
                              {expandedDetailScanId === scan.id
                                ? 'Ocultar Detalle Técnico'
                                : 'Ver Detalle Técnico del Escaneo'}
                            </button>

                            <button
                              onClick={() => handleToggleObservaciones(scan.id)}
                              className="text-xs font-bold text-blue-800 hover:text-blue-900 transition flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 shadow-2xs"
                            >
                              <span>🔍</span>
                              {expandedScanId === scan.id
                                ? 'Ocultar Tráfico Sanitizado'
                                : 'Ver Tráfico Capturado (Observaciones de Red)'}
                            </button>
                          </div>

                          {/* Panel Desplegable de Detalle Técnico Individual Estructurado en UI */}
                          {expandedDetailScanId === scan.id && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                  📄 Diagnóstico Técnico del Escaneo Individual
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  ID: {scan.id}
                                </span>
                              </div>

                              {cargandoDetalle[scan.id] ? (
                                <div className="text-xs text-slate-500 py-4 text-center flex items-center justify-center gap-2">
                                  <div className="w-4 h-4 border-2 border-cyan-800 border-t-transparent rounded-full animate-spin"></div>
                                  <span>Cargando diagnóstico técnico del escaneo...</span>
                                </div>
                              ) : !detallesMap[scan.id] ? (
                                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  No se pudo obtener la información detallada de este escaneo.
                                </p>
                              ) : (
                                <div className="space-y-3 text-xs">
                                  {/* Estado General y Autenticación Banner */}
                                  {detallesMap[scan.id].resultado?.estado_general && (
                                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                                      <div className="flex items-start gap-2 text-slate-800">
                                        <span className="text-base">📢</span>
                                        <div className="flex-1">
                                          <span className="font-bold block text-slate-900">
                                            {detallesMap[scan.id].resultado.estado_general.codigo || 'DIAGNÓSTICO_COMPLETADO'}
                                          </span>
                                          <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                                            {detallesMap[scan.id].resultado.estado_general.mensaje}
                                          </p>
                                        </div>
                                      </div>

                                      {/* Badges de Autenticación */}
                                      {detallesMap[scan.id].resultado.autenticacion && (
                                        <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-[10px] font-medium">
                                          <span className="text-slate-500 font-semibold">Autenticación:</span>
                                          <span className={`px-2 py-0.5 rounded-full font-bold border ${detallesMap[scan.id].resultado.autenticacion.login_exitoso ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                                            {detallesMap[scan.id].resultado.autenticacion.login_exitoso ? '✓ Login Exitoso' : 'Sin Login'}
                                          </span>
                                          {detallesMap[scan.id].resultado.autenticacion.pantalla_login_detectada && (
                                            <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 text-blue-800 border border-blue-200">
                                              Formulario Login Detectado
                                            </span>
                                          )}
                                          {detallesMap[scan.id].resultado.autenticacion.tipos?.map((tipo: string, tIdx: number) => (
                                            <span key={tIdx} className="px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-800 border border-purple-200 font-mono">
                                              {tipo}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  )}

                                  {/* Grid de Secciones Técnicas */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {/* Tarjeta 1: Canal de IA Detectado */}
                                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                                      <h4 className="text-[11px] font-bold text-cyan-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-1.5">
                                        <span>📡 Canal IA Confirmado</span>
                                        {detallesMap[scan.id].resultado?.confianza && (
                                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
                                            {(detallesMap[scan.id].resultado.confianza * 100).toFixed(0)}% Confianza
                                          </span>
                                        )}
                                      </h4>
                                      <div className="space-y-1.5 font-mono text-[11px]">
                                        <div>
                                          <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Endpoint URL</span>
                                          <span className="text-blue-900 font-bold break-all block">
                                            {detallesMap[scan.id].resultado?.canal?.url || detallesMap[scan.id].ai_channel?.url || 'N/A'}
                                          </span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 pt-1">
                                          <div>
                                            <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Método / Protocolo</span>
                                            <span className="text-slate-800 font-semibold">
                                              {detallesMap[scan.id].resultado?.canal?.metodo || 'POST'} ({detallesMap[scan.id].resultado?.canal?.protocolo || 'http'})
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Campo Prompt</span>
                                            <span className="text-slate-800 font-semibold">
                                              {detallesMap[scan.id].resultado?.canal?.entrada?.campo || detallesMap[scan.id].ai_channel?.prompt_field || 'message'}
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Tarjeta 2: Interfaz DOM Interceptada */}
                                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                                      <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                                        🖱️ Interfaz DOM (Playwright)
                                      </h4>
                                      <div className="space-y-1.5 font-mono text-[11px]">
                                        <div>
                                          <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Tipo Interfaz</span>
                                          <span className="text-slate-800 font-semibold capitalize">
                                            {detallesMap[scan.id].resultado?.interfaz?.tipo || 'Chat'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Selector de Entrada</span>
                                          <span className="text-slate-700 block bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[10px] truncate">
                                            {detallesMap[scan.id].resultado?.interfaz?.selector_entrada || 'textarea'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-slate-400 text-[10px] uppercase block font-sans font-semibold">Selector de Envío</span>
                                          <span className="text-slate-700 block bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[10px] truncate">
                                            {detallesMap[scan.id].resultado?.interfaz?.selector_envio || 'button'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Tarjeta 3: Exploración y Navegación */}
                                  {detallesMap[scan.id].resultado?.exploracion && (
                                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                                      <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-1.5">
                                        🗺️ Exploración de Navegación
                                      </h4>
                                      <div className="flex flex-wrap items-center gap-4 text-[11px]">
                                        <div>
                                          <span className="text-slate-400 text-[10px] uppercase block font-semibold">URLs Visitadas</span>
                                          <div className="flex flex-wrap gap-1 mt-0.5">
                                            {detallesMap[scan.id].resultado.exploracion.urls_visitadas?.map((url: string, uIdx: number) => (
                                              <span key={uIdx} className="font-mono text-[10px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                                                {url}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Panel de Observaciones Sanitizadas Desplegable en modo claro */}
                          {expandedScanId === scan.id && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                🌐 Peticiones Sanitizadas Interceptadas ({observacionesMap[scan.id]?.length || 0})
                              </span>

                              {cargandoObs[scan.id] ? (
                                <div className="text-xs text-slate-500 py-3 text-center">
                                  Cargando peticiones sanitizadas...
                                </div>
                              ) : !observacionesMap[scan.id] || observacionesMap[scan.id].length === 0 ? (
                                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  No se capturaron peticiones adicionales para este escaneo.
                                </p>
                              ) : (
                                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                                  {observacionesMap[scan.id].map((obs, oIdx) => (
                                    <div key={oIdx} className="p-3 rounded-xl bg-slate-50 text-slate-900 border border-slate-200 space-y-1.5 font-mono text-[11px] shadow-2xs">
                                      <div className="flex items-center justify-between">
                                        <span className="font-bold text-blue-900 break-all">
                                          [{obs.method}] {obs.request_url}
                                        </span>
                                        {obs.response_status && (
                                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${obs.response_status >= 200 && obs.response_status < 300 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                                            HTTP {obs.response_status}
                                          </span>
                                        )}
                                      </div>
                                      {obs.sanitized_body && (
                                        <pre className="text-[10px] bg-white p-2.5 rounded-lg text-slate-800 overflow-x-auto whitespace-pre-wrap max-h-24 border border-slate-200 shadow-2xs font-mono">
                                          {obs.sanitized_body}
                                        </pre>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: HALLAZGOS Y VULNERABILIDADES */}
              {activeTab === 'hallazgos' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Evaluación de pruebas adversariales (Agente A1 vs Chatbot D1 evaluado por Juez J1)</span>
                    <span>Total hallazgos: {informe.hallazgos_vulnerabilidad.length}</span>
                  </div>

                  {informe.hallazgos_vulnerabilidad.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                      <span>✅</span>
                      <span>No se detectaron fugas de System Prompt ni vulnerabilidades confirmadas en las pruebas de ataque ejecutadas.</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {informe.hallazgos_vulnerabilidad.map((hallazgo, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-red-50/50 border border-red-200 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-red-800">
                              Táctica: {hallazgo.tactica_usada} (Turno #{hallazgo.numero_turno})
                            </span>
                            <span className="px-2 py-0.5 rounded-full font-bold bg-red-100 text-red-700 border border-red-200">
                              Puntaje Juez: {hallazgo.puntaje_juez}/10
                            </span>
                          </div>
                          <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                            <strong className="text-slate-900">Justificación del Juez LLM:</strong> {hallazgo.justificacion}
                          </p>
                          {hallazgo.fragmentos_fuga && hallazgo.fragmentos_fuga.length > 0 && (
                            <div className="space-y-1">
                              <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Fragmento de Fuga Detectado:</span>
                              <pre className="text-[11px] font-mono bg-white text-red-700 p-3 rounded-lg border border-red-200 shadow-2xs overflow-x-auto whitespace-pre-wrap">
                                {hallazgo.fragmentos_fuga.join('\n---\n')}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 4: SESIONES DE ATAQUE EJECUTADAS */}
              {activeTab === 'ataques' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Historial completo de evaluaciones adversariales (Prompt Injection A1 vs Chatbot D1)</span>
                    <span>Total: {informe.sesiones_ataque?.length || 0} sesiones</span>
                  </div>

                  {!informe.sesiones_ataque || informe.sesiones_ataque.length === 0 ? (
                    <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-slate-500 italic">
                      No hay sesiones de ataque registradas para este software objetivo. Lanzá un ataque en el módulo de Pruebas Ofensivas.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {informe.sesiones_ataque.map((sesion: any) => (
                        <div
                          key={sesion.id}
                          className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3 hover:border-slate-300 transition"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 font-mono">
                              <span className="font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-100">
                                SESIÓN-{sesion.id.substring(0, 8)}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${sesion.exito
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                              >
                                {sesion.exito ? '⚠️ VULNERABLE' : '✅ SEGURO / RESISTENTE'}
                              </span>
                            </div>
                            <span className="text-slate-400 text-[11px] font-mono">
                              {new Date(sesion.created_at).toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-mono text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Objetivo del Ataque</span>
                              <span className="text-slate-800 truncate block font-medium">{sesion.objetivo}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Turnos Ejecutados</span>
                              <span className="text-slate-800 truncate block font-medium">{sesion.turnos_ejecutados} de {sesion.max_turnos}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[10px] uppercase font-bold">Puntaje Máximo Juez J1</span>
                              <span className={`font-bold block ${sesion.puntaje_maximo >= 7 ? 'text-red-600' : 'text-emerald-700'}`}>
                                {sesion.puntaje_maximo}/10
                              </span>
                            </div>
                          </div>

                          <div className="pt-1 flex items-center justify-between">
                            <button
                              onClick={() => setExpandedSessionId(expandedSessionId === sesion.id ? null : sesion.id)}
                              className="text-xs font-bold text-purple-800 hover:text-purple-600 transition flex items-center gap-1.5"
                            >
                              <span>🔍</span>
                              {expandedSessionId === sesion.id ? 'Ocultar Detalle de Turnos' : 'Ver Turnos y Dictamen del Juez J1'}
                            </button>
                          </div>

                          {expandedSessionId === sesion.id && (
                            <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                                💬 Historial de Turnos y Evaluación J1 ({sesion.turns?.length || 0})
                              </span>

                              {!sesion.turns || sesion.turns.length === 0 ? (
                                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                                  No hay turnos registrados en esta sesión.
                                </p>
                              ) : (
                                <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                                  {sesion.turns.map((turno: any, tIdx: number) => (
                                    <div key={tIdx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono text-[11px]">
                                      <div className="flex items-center justify-between font-bold">
                                        <span className="text-purple-900">Turno #{turno.numero_turno} — Táctica: {turno.tactica_usada || 'Generativa'}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${turno.puntaje_j1 >= 7 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'}`}>
                                          Score Juez J1: {turno.puntaje_j1}/10
                                        </span>
                                      </div>
                                      <div className="bg-white p-2 rounded border border-slate-200 text-slate-800">
                                        <span className="font-bold text-cyan-700 block text-[10px]">Prompt Agente A1:</span>
                                        {turno.prompt_a1}
                                      </div>
                                      <div className="bg-white p-2 rounded border border-slate-200 text-slate-800">
                                        <span className="font-bold text-slate-600 block text-[10px]">Respuesta Chatbot D1:</span>
                                        {turno.respuesta_d1}
                                      </div>
                                      <div className="bg-purple-50 p-2 rounded border border-purple-200 text-purple-900 font-sans">
                                        <span className="font-bold text-purple-950 block text-[10px] font-mono">Justificación del Juez J1:</span>
                                        {turno.justificacion_j1}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </>
          )}
        </div>

        {/* Footer Enterprise Blanco */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <button
            onClick={cargarDatos}
            disabled={cargando}
            className="px-3.5 py-2 font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition border border-slate-300 flex items-center gap-1.5 shadow-2xs"
          >
            <span>🔄</span> Actualizar Datos
          </button>
          <div className="flex items-center gap-2.5">
            {onLanzarEscaneo && (
              <button
                onClick={() => {
                  onClose();
                  onLanzarEscaneo();
                }}
                className="px-4 py-2 font-bold rounded-xl bg-blue-800 hover:bg-blue-700 text-white transition shadow-sm"
              >
                🚀 Iniciar Nuevo Escaneo IA
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 font-semibold rounded-xl bg-white hover:bg-slate-100 text-slate-700 transition border border-slate-300 shadow-2xs"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { softwareService, type Software } from '../services/softwareService';
import { monetizacionService, type BoletaSuscripcion } from '../services/monetizacionService';
import { aiService } from '../services/aiService';
import { InformeSeguridadModal } from '../components/InformeSeguridadModal';


export const TargetsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [softwares, setSoftwares] = useState<Software[]>([]);
  const [activeBoleta, setActiveBoleta] = useState<BoletaSuscripcion | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros y Vista
  const [search, setSearch] = useState<string>('');
  const [protocolFilter, setProtocolFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Modal y Formulario (Crear/Editar)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingSoftware, setEditingSoftware] = useState<Software | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Modal de Advertencia de Monetización por Límite Alcanzado
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState<boolean>(false);
  const [upgradeErrorMessage, setUpgradeErrorMessage] = useState<string>('');

  // Estados e Integración con Microservicio de IA
  const [selectedSoftwareForInforme, setSelectedSoftwareForInforme] = useState<{ id: number; name: string } | null>(null);
  const [isInformeModalOpen, setIsInformeModalOpen] = useState<boolean>(false);
  const [scanningSoftwareId, setScanningSoftwareId] = useState<number | null>(null);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Modal para ingresar credenciales del target a evaluar
  const [isScanAuthModalOpen, setIsScanAuthModalOpen] = useState<boolean>(false);
  const [targetAuthSoftware, setTargetAuthSoftware] = useState<{ id: number; name: string; endpoint: string } | null>(null);
  const [targetAuthCreds, setTargetAuthCreds] = useState({
    usuario: '',
    contrasena: '',
    auth_token: '',
  });

  const handleOpenInforme = (softwareId: number, softwareName: string) => {
    setSelectedSoftwareForInforme({ id: softwareId, name: softwareName });
    setIsInformeModalOpen(true);
  };

  const handleOpenScanAuthModal = (softwareId: number, softwareName: string, endpoint: string) => {
    setTargetAuthSoftware({ id: softwareId, name: softwareName, endpoint });
    setTargetAuthCreds({ usuario: '', contrasena: '', auth_token: '' });
    setIsScanAuthModalOpen(true);
  };

  const handleLanzarEscaneoIA = async (
    softwareId: number,
    targetUrl: string,
    credentials?: { usuario?: string; contrasena?: string; auth_token?: string }
  ) => {
    try {
      setScanningSoftwareId(softwareId);
      setScanMessage(null);
      await aiService.iniciarEscaneo(softwareId, targetUrl, credentials);
      setScanMessage(`🚀 Escaneo de IA iniciado para el software #${softwareId}. El análisis de Playwright y Ollama se ejecutará en segundo plano.`);
      setTimeout(() => setScanMessage(null), 8000);
    } catch (err: any) {
      console.error('Error al iniciar escaneo de IA:', err);
      const data = err.response?.data;
      let msg = data?.detalle || data?.mensaje || data?.error;

      if (!msg && data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        if (firstKey && Array.isArray(data[firstKey])) {
          msg = data[firstKey][0];
        } else if (firstKey && typeof data[firstKey] === 'string') {
          msg = data[firstKey];
        }
      }

      if (!msg) {
        msg = 'No se pudo iniciar el escaneo de IA. Verifique que el microservicio de IA (backend_genvulnai) esté ejecutándose en el puerto 8001.';
      }
      alert(`⚠️ ${msg}`);
    } finally {
      setScanningSoftwareId(null);
      setIsScanAuthModalOpen(false);
    }
  };



  const [formData, setFormData] = useState({
    name: '',
    endpoint: '',
    protocol: 'HTTP/HTTPS' as 'HTTP/HTTPS' | 'WebSocket' | 'STT/Audio',
    llm_provider: '',
    system_prompt_sample: '',
    status: 'Activo' as 'Activo' | 'Inactivo' | 'Mapeando',
  });

  const fetchSoftwaresAndSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      // Cargar softwares y boletas de suscripción en paralelo
      const [softwaresData, boletasData] = await Promise.all([
        softwareService.getSoftwares(),
        user?.role === 'PENTESTER' ? monetizacionService.getBoletas() : Promise.resolve([]),
      ]);

      setSoftwares(softwaresData);

      // Verificar si el Pentester tiene al menos una boleta activa vigente (fecha_fin >= hoy)
      const todayStr = new Date().toISOString().split('T')[0];
      const validSub = boletasData.find((b) => b.fecha_fin >= todayStr);
      setActiveBoleta(validSub || null);
    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError('No se pudieron cargar los softwares registrados desde el servidor backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSoftwaresAndSubscription();
  }, [user]);

  const totalSoftwaresCount = softwares.length;
  const isPentester = user?.role === 'PENTESTER';
  const isAuditor = user?.role === 'AUDITOR';

  const isPaidBoleta = (boleta: BoletaSuscripcion | null): boolean => {
    if (!boleta) return false;
    const monto = Number(boleta.plan_monto || 0);
    const planName = (boleta.plan_nombre || '').toLowerCase();
    const isFreeKeyword = ['free', 'gratuito', 'trial', 'starter'].some((k) => planName.includes(k));
    return monto > 0 && !isFreeKeyword;
  };

  const hasPaidSubscription = isPaidBoleta(activeBoleta);

  const handleOpenCreateModal = () => {
    if (isAuditor) {
      alert('⚠️ El rol Auditor tiene acceso de Solo Lectura y no puede registrar nuevos softwares.');
      return;
    }

    // Si es Pentester, no tiene una suscripción de pago activa y ya tiene 2 o más softwares registrados, bloquear creación
    if (isPentester && !hasPaidSubscription && totalSoftwaresCount >= 2) {
      setUpgradeErrorMessage(
        'Has alcanzado el límite de 2 softwares/objetivos permitidos en el Plan Gratuito/Trial. Por favor, actualiza tu plan a una suscripción de pago (Professional o Enterprise) en el módulo de Monetización para registrar más softwares.'
      );
      setIsUpgradeModalOpen(true);
      return;
    }

    setEditingSoftware(null);
    setFormData({
      name: '',
      endpoint: '',
      protocol: 'HTTP/HTTPS',
      llm_provider: '',
      system_prompt_sample: '',
      status: 'Activo',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (software: Software) => {
    setEditingSoftware(software);
    setFormData({
      name: software.name,
      endpoint: software.endpoint,
      protocol: software.protocol,
      llm_provider: software.llm_provider,
      system_prompt_sample: software.system_prompt_sample || '',
      status: software.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteSoftware = async (id: number, name: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el software objetivo "${name}" (#${id})?`)) {
      try {
        await softwareService.deleteSoftware(id);
        fetchSoftwaresAndSubscription();
      } catch (err: any) {
        console.error('Error al eliminar software:', err);
        alert('Ocurrió un error al intentar eliminar el software.');
      }
    }
  };

  const handleSaveSoftware = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingSoftware) {
        await softwareService.updateSoftware(editingSoftware.id, formData);
      } else {
        await softwareService.createSoftware(formData);
      }
      setIsModalOpen(false);
      fetchSoftwaresAndSubscription();
    } catch (err: any) {
      console.error('Error al guardar software:', err);
      const detailMessage =
        err.response?.data?.detail ||
        (typeof err.response?.data === 'string' ? err.response?.data : '') ||
        err.message ||
        '';

      if (
        err.response?.status === 403 ||
        err.response?.status === 400 ||
        detailMessage.toLowerCase().includes('límite') ||
        detailMessage.toLowerCase().includes('gratuito') ||
        detailMessage.toLowerCase().includes('permission')
      ) {
        setIsModalOpen(false);
        setUpgradeErrorMessage(
          detailMessage ||
            'Límite de plan gratuito alcanzado. Solo puedes registrar hasta 2 softwares activos.'
        );
        setIsUpgradeModalOpen(true);
      } else {
        alert(detailMessage || 'Ocurrió un error al procesar el software objetivo.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrado reactivo de softwares
  const filteredSoftwares = softwares.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.endpoint.toLowerCase().includes(search.toLowerCase()) ||
      item.llm_provider.toLowerCase().includes(search.toLowerCase());

    const matchesProtocol =
      protocolFilter === 'all' || item.protocol === protocolFilter;

    const matchesStatus =
      statusFilter === 'all' || item.status === statusFilter;

    return matchesSearch && matchesProtocol && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Activo':
        return (
          <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            ● Activo
          </span>
        );
      case 'Mapeando':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            ● Mapeando
          </span>
        );
      case 'Inactivo':
        return (
          <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full text-[10px] font-bold">
            ● Inactivo
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {status}
          </span>
        );
    }
  };

  const getProtocolBadge = (protocol: string) => {
    switch (protocol) {
      case 'HTTP/HTTPS':
        return (
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            REST / HTTP
          </span>
        );
      case 'WebSocket':
        return (
          <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            WebSocket (WSS)
          </span>
        );
      case 'STT/Audio':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-semibold">
            Audio Stream (STT)
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
            {protocol}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            🎯 Reconocimiento y Registro de Software Objetivos
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Módulo de Pruebas: Configura y mapea los endpoints, WebSockets, canales de audio (STT) y metadatos LLM autorizados para evaluación.
          </p>
        </div>
        {!isAuditor ? (
          <button
            className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-sm shrink-0 flex items-center gap-1.5"
            onClick={handleOpenCreateModal}
          >
            ➕ Registrar Software Autorizado
          </button>
        ) : (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 font-bold text-xs px-3.5 py-1.5 rounded-lg shrink-0 flex items-center gap-1.5">
            👁️ Modo Auditoría (Solo Lectura)
          </span>
        )}
      </div>

      {/* Banner de Suscripción Activa */}
      {isPentester && activeBoleta && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-emerald-900 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⭐</span>
            <div>
              <span className="font-bold">Suscripción Activa: {activeBoleta.plan_nombre}</span>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Plan activo válido hasta el <strong>{activeBoleta.fecha_fin}</strong>. Tienes cuota habilitada para registrar más softwares objetivos.
              </p>
            </div>
          </div>
          <button
            className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 shadow-xs"
            onClick={() => navigate('/app/monetizacion')}
          >
            📜 Ver Boleta #{activeBoleta.numero_boleta}
          </button>
        </div>
      )}

      {/* Banner de Aviso de Límite Alcanzado en Plan Gratuito */}
      {isPentester && !hasPaidSubscription && totalSoftwaresCount >= 2 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-900 text-xs shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">⚠️</span>
            <div>
              <span className="font-bold">Límite del Plan Gratuito/Trial Alcanzado ({totalSoftwaresCount}/2 Registrados)</span>
              <p className="text-[11px] text-amber-800/90 mt-0.5">
                En el Plan Gratuito/Trial solo puedes registrar un máximo de 2 softwares. Actualiza tu plan a una suscripción de pago para registrar nuevos objetivos.
              </p>
            </div>
          </div>
          <button
            className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shrink-0 shadow-xs flex items-center gap-1"
            onClick={() => navigate('/app/monetizacion')}
          >
            🚀 Actualizar Plan
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Toolbar de Controles, Búsqueda y Filtros */}
        <div className="p-4 border-b border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-3">
          {/* Campo de Búsqueda */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full lg:w-80">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              className="bg-transparent text-xs text-slate-900 outline-none w-full placeholder:text-slate-400"
              placeholder="Buscar por nombre, endpoint o proveedor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filtros de Protocolo, Estado y Toggle de Vista */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-end">
            <select
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 outline-none hover:border-slate-300 transition"
              value={protocolFilter}
              onChange={(e) => setProtocolFilter(e.target.value)}
            >
              <option value="all">Todos los Protocolos</option>
              <option value="HTTP/HTTPS">HTTP / REST API</option>
              <option value="WebSocket">WebSocket (wss://)</option>
              <option value="STT/Audio">STT / Audio Stream</option>
            </select>

            <select
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 outline-none hover:border-slate-300 transition"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los Estados</option>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
              <option value="Mapeando">Mapeando</option>
            </select>

            {/* Toggle Vista Tarjetas / Tabla */}
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

        {/* Mensaje de Confirmación de Escaneo IA */}
        {scanMessage && (
          <div className="m-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-center justify-between shadow-xs">
            <span className="font-medium">{scanMessage}</span>
            <button
              onClick={() => setScanMessage(null)}
              className="text-emerald-600 hover:text-emerald-900 font-bold text-sm px-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Mensaje de Error */}
        {error && (
          <div className="m-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button
              onClick={fetchSoftwaresAndSubscription}
              className="underline font-semibold hover:text-red-900 ml-2"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Estado de Carga */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
            <span>Cargando lista de software desde el backend...</span>
          </div>
        ) : filteredSoftwares.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <div className="text-3xl">🎯</div>
            <div className="font-bold text-slate-600">No hay softwares autorizados encontrados</div>
            <p className="text-slate-400 max-w-sm mx-auto text-[11px]">
              No se encontraron registros que coincidan con los filtros aplicados.
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          /* --- VISTA DE TARJETAS --- */
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredSoftwares.map((tgt) => (
              <div
                key={tgt.id}
                className="bg-slate-50/60 border border-slate-200 hover:border-blue-300 rounded-xl p-4 transition flex flex-col justify-between space-y-3 shadow-2xs hover:shadow-xs"
              >
                {/* Header de la Tarjeta */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                          SFT-{String(tgt.id).padStart(3, '0')}
                        </span>
                        {getStatusBadge(tgt.status)}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm tracking-tight pt-1">
                        {tgt.name}
                      </h3>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-200/80 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Protocolo:</span>
                      {getProtocolBadge(tgt.protocol)}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 text-[11px]">Proveedor / Modelo:</span>
                      <span className="font-semibold text-slate-800 text-[11px]">
                        {tgt.llm_provider}
                      </span>
                    </div>
                    {tgt.user_username && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[11px]">Registrado por:</span>
                        <span className="font-medium text-blue-800 text-[11px] truncate max-w-[180px]">
                          {tgt.user_username}
                        </span>
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5 pt-1.5 border-t border-slate-200/80">
                      <span className="text-slate-400 text-[11px]">Endpoint / URL:</span>
                      <span className="font-mono text-[11px] text-slate-800 break-all bg-white px-2 py-1 rounded border border-slate-200">
                        {tgt.endpoint}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  {/* Botones de Acción de IA */}
                  <div className="grid grid-cols-2 gap-1.5">
                    {!isAuditor ? (
                      <button
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded px-2.5 py-1.5 text-[11px] font-bold transition flex items-center justify-center gap-1 disabled:opacity-50"
                        onClick={() => handleOpenScanAuthModal(tgt.id, tgt.name, tgt.endpoint)}
                        disabled={scanningSoftwareId === tgt.id}
                        title="Lanzar escaneo de Playwright y Ollama"
                      >
                        {scanningSoftwareId === tgt.id ? (
                          <>
                            <span className="animate-spin text-xs">⏳</span> Escaneando...
                          </>
                        ) : (
                          <>🚀 Escanear IA</>
                        )}
                      </button>
                    ) : (
                      <span className="bg-slate-100 text-slate-500 border border-slate-200 rounded px-2.5 py-1.5 text-[11px] font-bold transition flex items-center justify-center gap-1 opacity-70">
                        👁️ Auditor
                      </span>
                    )}

                    <button
                      className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded px-2.5 py-1.5 text-[11px] font-bold transition flex items-center justify-center gap-1"
                      onClick={() => handleOpenInforme(tgt.id, tgt.name)}
                      title="Ver Informe Técnico de Seguridad e IA"
                    >
                      🛡️ Informe IA
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-slate-400">
                      {new Date(tgt.created_at).toLocaleDateString()}
                    </span>
                    {!isAuditor && (
                      <div className="flex items-center gap-1.5">
                        <button
                          className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded px-2 py-0.5 text-[11px] font-semibold transition"
                          onClick={() => handleOpenEditModal(tgt)}
                          title="Editar Software"
                        >
                          ✏️
                        </button>
                        <button
                          className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2 py-0.5 text-[11px] font-semibold transition"
                          onClick={() => handleDeleteSoftware(tgt.id, tgt.name)}
                          title="Eliminar Software"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

        ) : (
          /* --- VISTA DE TABLA --- */
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Nombre del Software</th>
                  <th className="px-4 py-3">Protocolo</th>
                  <th className="px-4 py-3">Modelo / Framework</th>
                  <th className="px-4 py-3">Endpoint / URL</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Registrado por</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredSoftwares.map((tgt) => (
                  <tr key={tgt.id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3 font-mono font-bold text-blue-700">
                      SFT-{String(tgt.id).padStart(3, '0')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{tgt.name}</td>
                    <td className="px-4 py-3">{getProtocolBadge(tgt.protocol)}</td>
                    <td className="px-4 py-3 text-slate-700">{tgt.llm_provider}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-600 max-w-xs truncate">
                      {tgt.endpoint}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(tgt.status)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {tgt.user_username || 'Sistema'}
                    </td>
                    <td className="px-4 py-3 text-right space-x-1.5">
                      <button
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded px-2 py-1 text-[11px] font-bold transition inline-flex items-center gap-1 disabled:opacity-50"
                        onClick={() => handleOpenScanAuthModal(tgt.id, tgt.name, tgt.endpoint)}
                        disabled={scanningSoftwareId === tgt.id}
                        title="Lanzar escaneo de Playwright y Ollama"
                      >
                        {scanningSoftwareId === tgt.id ? '⏳ Escaneando...' : '🚀 Escanear IA'}
                      </button>
                      <button
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded px-2 py-1 text-[11px] font-bold transition inline-flex items-center gap-1"
                        onClick={() => handleOpenInforme(tgt.id, tgt.name)}
                        title="Ver Informe Técnico de Seguridad e IA"
                      >
                        🛡️ Informe IA
                      </button>
                      <button
                        className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded px-2 py-1 text-[11px] font-semibold transition"
                        onClick={() => handleOpenEditModal(tgt)}
                      >
                        ✏️
                      </button>
                      <button
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2 py-1 text-[11px] font-semibold transition"
                        onClick={() => handleDeleteSoftware(tgt.id, tgt.name)}
                      >
                        🗑️
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL DE CREACIÓN / EDICIÓN --- */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                {editingSoftware ? '✏️ Editar Software Objetivo' : '🎯 Registrar Software Autorizado (Módulo Pruebas)'}
              </h3>
              <button
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg text-xs transition"
                onClick={() => setIsModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSoftware} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nombre del Software / Chatbot</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="ej: Chatbot Atención al Cliente v2"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Protocolo de Entrada</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                    value={formData.protocol}
                    onChange={(e: any) => setFormData({ ...formData, protocol: e.target.value })}
                  >
                    <option value="HTTP/HTTPS">HTTP / REST API</option>
                    <option value="WebSocket">WebSocket (wss://)</option>
                    <option value="STT/Audio">Speech-to-Text / Audio Stream</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Estado del Software</label>
                  <select
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                    value={formData.status}
                    onChange={(e: any) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                    <option value="Mapeando">Mapeando</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Proveedor / Motor LLM</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                  placeholder="ej: GPT-4o, Claude 3.5, Llama 3"
                  value={formData.llm_provider}
                  onChange={(e) => setFormData({ ...formData, llm_provider: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">URL Endpoint Objetivo</label>
                <input
                  type="url"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition font-mono"
                  placeholder="https://api.empresa.com/v1/chat"
                  value={formData.endpoint}
                  onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  System Prompt Base o Instrucciones Iniciales (Opcional)
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition font-mono text-[11px]"
                  rows={3}
                  placeholder="Instrucciones del modelo si están disponibles..."
                  value={formData.system_prompt_sample}
                  onChange={(e) => setFormData({ ...formData, system_prompt_sample: e.target.value })}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg text-xs transition"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : editingSoftware ? 'Actualizar Software' : 'Guardar Software'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE ADVERTENCIA: LÍMITE DE PLAN GRATUITO ALCANZADO --- */}
      {isUpgradeModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsUpgradeModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-amber-200 overflow-hidden flex flex-col p-6 space-y-4 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-16 h-16 bg-amber-100 border border-amber-200 text-amber-800 rounded-full flex items-center justify-center text-3xl mx-auto">
              💳
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Límite del Plan Gratuito Alcanzado
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                {upgradeErrorMessage}
              </p>
            </div>
            <div className="bg-amber-50 border border-amber-200 text-amber-900 text-[11px] p-3 rounded-xl text-left space-y-1">
              <div className="font-bold">💡 Regla de Cuotas Activas:</div>
              <div>
                Solo se computan los softwares registrados con estado <strong>Activo</strong>. Si cambias el estado de un software a <em>Inactivo</em>, se liberará cupo en tu cuenta.
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button
                className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
                onClick={() => navigate('/app/monetizacion')}
              >
                🚀 Actualizar Plan de Suscripción
              </button>
              <button
                className="bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-semibold text-xs py-2 px-4 rounded-xl transition"
                onClick={() => setIsUpgradeModalOpen(false)}
              >
                Cerrar y Revisar Mis Softwares
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DE CREDENCIALES DEL TARGET PARA ESCANEO IA --- */}
      {isScanAuthModalOpen && targetAuthSoftware && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsScanAuthModalOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔑</span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Credenciales del Sistema Objetivo (Target)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Software: <strong className="text-blue-700">{targetAuthSoftware.name}</strong> ({targetAuthSoftware.endpoint})
                  </p>
                </div>
              </div>
              <button
                className="text-slate-400 hover:text-slate-700 text-base font-bold"
                onClick={() => setIsScanAuthModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-900 text-[11px] p-3 rounded-xl space-y-1">
              <div className="font-bold">🔒 Información de Autenticación Evaluada:</div>
              <div>
                Si el chatbot o aplicación web requiere inicio de sesión previo para acceder, ingresa las credenciales del <strong>sistema objetivo que estamos probando</strong>. Playwright las usará para autenticarse automáticamente. De lo contrario, déjalas en blanco para escaneo anónimo.
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLanzarEscaneoIA(
                  targetAuthSoftware.id,
                  targetAuthSoftware.endpoint,
                  targetAuthCreds
                );
              }}
              className="space-y-3 text-xs"
            >
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Correo Electrónico / Usuario del Target
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition font-mono"
                  placeholder="ej: bq6144895@gmail.com"
                  value={targetAuthCreds.usuario}
                  onChange={(e) =>
                    setTargetAuthCreds({ ...targetAuthCreds, usuario: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Contraseña del Target</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition font-mono"
                  placeholder="••••••••"
                  value={targetAuthCreds.contrasena}
                  onChange={(e) =>
                    setTargetAuthCreds({ ...targetAuthCreds, contrasena: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">
                  Bearer Token / Header Authorization (Opcional para APIs directas)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition font-mono text-[11px]"
                  placeholder="Bearer eyJhbGciOiJIUzI1Ni..."
                  value={targetAuthCreds.auth_token}
                  onChange={(e) =>
                    setTargetAuthCreds({ ...targetAuthCreds, auth_token: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg text-xs transition"
                  onClick={() => setIsScanAuthModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={scanningSoftwareId === targetAuthSoftware.id}
                  className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm disabled:opacity-50 flex items-center gap-1.5"
                >
                  {scanningSoftwareId === targetAuthSoftware.id ? (
                    <>
                      <span className="animate-spin text-xs">⏳</span> Escaneando...
                    </>
                  ) : (
                    <>🚀 Iniciar Escaneo Autenticado</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DE INFORME TÉCNICO DE SEGURIDAD E IA --- */}
      {selectedSoftwareForInforme && (
        <InformeSeguridadModal
          softwareId={selectedSoftwareForInforme.id}
          softwareName={selectedSoftwareForInforme.name}
          isOpen={isInformeModalOpen}
          onClose={() => setIsInformeModalOpen(false)}
          onLanzarEscaneo={() =>
            handleLanzarEscaneoIA(selectedSoftwareForInforme.id, '')
          }
        />
      )}
    </div>
  );
};



import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  monetizacionService,
  type Tarifa,
  type Plan,
  type BoletaSuscripcion,
} from '../services/monetizacionService';
import { StripePaymentModal } from '../features/monetizacion/components/StripePaymentModal';

export const MonetizacionPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'SYSTEM_ADMIN';
  const isPentester = user?.role === 'PENTESTER';

  const [activeTab, setActiveTab] = useState<'pricing' | 'boletas' | 'planes' | 'tarifas'>(
    isPentester ? 'pricing' : 'boletas'
  );

  // Modos de vista para listados (Tarjetas / Tabla)
  const [boletasViewMode, setBoletasViewMode] = useState<'cards' | 'table'>('cards');
  const [planesViewMode, setPlanesViewMode] = useState<'cards' | 'table'>('cards');
  const [tarifasViewMode, setTarifasViewMode] = useState<'cards' | 'table'>('cards');

  // Datos de API
  const [tarifas, setTarifas] = useState<Tarifa[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [boletas, setBoletas] = useState<BoletaSuscripcion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modales y formularios
  const [isTarifaModalOpen, setIsTarifaModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [isBoletaModalOpen, setIsBoletaModalOpen] = useState(false);
  const [isStripeModalOpen, setIsStripeModalOpen] = useState(false);
  const [selectedPlanForStripe, setSelectedPlanForStripe] = useState<Plan | null>(null);
  const [submitting, setSubmitting] = useState(false);


  const [tarifaForm, setTarifaForm] = useState({ nombre: '', monto: '' });
  const [planForm, setPlanForm] = useState({ nombre: '', duracion_dias: 30, tarifa: 0 });
  const [boletaForm, setBoletaForm] = useState({
    numero_boleta: '',
    fecha_inicio: new Date().toISOString().split('T')[0],
    fecha_fin: '',
    plan: 0,
  });

  // Función helper para calcular fecha de vencimiento a partir de fecha_inicio y duracion_dias
  const calculateFechaFin = (fechaInicioStr: string, duracionDias: number): string => {
    if (!fechaInicioStr) return '';
    const dateParts = fechaInicioStr.split('-');
    if (dateParts.length !== 3) return '';
    const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]));
    date.setDate(date.getDate() + (duracionDias || 30));
    return date.toISOString().split('T')[0];
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tData, pData, bData] = await Promise.all([
        monetizacionService.getTarifas(),
        monetizacionService.getPlanes(),
        monetizacionService.getBoletas(),
      ]);
      setTarifas(tData);
      setPlanes(pData);
      setBoletas(bData);

      if (pData.length > 0 && boletaForm.plan === 0) {
        setBoletaForm((prev) => ({ ...prev, plan: pData[0].id }));
      }
      if (tData.length > 0 && planForm.tarifa === 0) {
        setPlanForm((prev) => ({ ...prev, tarifa: tData[0].id }));
      }
    } catch (err: any) {
      console.error('Error cargando módulo de monetización:', err);
      setError('Error al conectar con la API de monetización y suscripciones.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Abrir modal de suscripción preseleccionando un plan y calculando fecha_fin automáticamente
  const handleOpenSubscribeModal = (planId: number) => {
    const autoNum = `BOL-${Math.floor(100000 + Math.random() * 900000)}`;
    const todayStr = new Date().toISOString().split('T')[0];
    const targetPlan = planes.find((p) => p.id === planId) || planes[0];
    const duracion = targetPlan ? targetPlan.duracion_dias : 30;
    const computedFin = calculateFechaFin(todayStr, duracion);

    setBoletaForm({
      numero_boleta: autoNum,
      fecha_inicio: todayStr,
      fecha_fin: computedFin,
      plan: targetPlan ? targetPlan.id : planId,
    });
    setIsBoletaModalOpen(true);
  };

  const handleOpenStripeModal = (plan: Plan) => {
    setSelectedPlanForStripe(plan);
    setIsStripeModalOpen(true);
  };

  const handleStripePaymentSuccess = () => {
    setIsStripeModalOpen(false);
    loadAllData();
    setActiveTab('boletas');
  };


  // Al cambiar plan o fecha_inicio en el modal de boletas, recalcular automáticamente fecha_fin
  const handlePlanChangeInBoletaForm = (newPlanId: number) => {
    const selectedPlan = planes.find((p) => p.id === newPlanId);
    const duracion = selectedPlan ? selectedPlan.duracion_dias : 30;
    const computedFin = calculateFechaFin(boletaForm.fecha_inicio, duracion);
    setBoletaForm((prev) => ({
      ...prev,
      plan: newPlanId,
      fecha_fin: computedFin,
    }));
  };

  const handleFechaInicioChangeInBoletaForm = (newFechaInicio: string) => {
    const selectedPlan = planes.find((p) => p.id === boletaForm.plan);
    const duracion = selectedPlan ? selectedPlan.duracion_dias : 30;
    const computedFin = calculateFechaFin(newFechaInicio, duracion);
    setBoletaForm((prev) => ({
      ...prev,
      fecha_inicio: newFechaInicio,
      fecha_fin: computedFin,
    }));
  };

  // --- HANDLERS TARIFA ---
  const handleCreateTarifa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await monetizacionService.createTarifa({
        nombre: tarifaForm.nombre,
        monto: parseFloat(tarifaForm.monto),
      });
      setIsTarifaModalOpen(false);
      setTarifaForm({ nombre: '', monto: '' });
      loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al crear tarifa. Requiere rol Administrador.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTarifa = async (id: number) => {
    if (window.confirm(`¿Deseas eliminar la tarifa #${id}?`)) {
      try {
        await monetizacionService.deleteTarifa(id);
        loadAllData();
      } catch (err) {
        alert('No se pudo eliminar la tarifa.');
      }
    }
  };

  // --- HANDLERS PLAN ---
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.tarifa) {
      alert('Debes seleccionar una tarifa válida.');
      return;
    }
    try {
      setSubmitting(true);
      await monetizacionService.createPlan({
        nombre: planForm.nombre,
        duracion_dias: Number(planForm.duracion_dias),
        tarifa: planForm.tarifa,
      });
      setIsPlanModalOpen(false);
      setPlanForm({ nombre: '', duracion_dias: 30, tarifa: tarifas[0]?.id || 0 });
      loadAllData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al crear plan. Requiere rol Administrador.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlan = async (id: number) => {
    if (window.confirm(`¿Deseas eliminar el plan #${id}?`)) {
      try {
        await monetizacionService.deletePlan(id);
        loadAllData();
      } catch (err) {
        alert('No se pudo eliminar el plan.');
      }
    }
  };

  // --- HANDLERS BOLETA ---
  const handleCreateBoleta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boletaForm.plan) {
      alert('Debes seleccionar un plan válido.');
      return;
    }
    try {
      setSubmitting(true);
      await monetizacionService.createBoleta({
        numero_boleta: boletaForm.numero_boleta,
        fecha_inicio: boletaForm.fecha_inicio,
        fecha_fin: boletaForm.fecha_fin,
        plan: boletaForm.plan,
      });
      setIsBoletaModalOpen(false);
      loadAllData();
      setActiveTab('boletas');
    } catch (err: any) {
      alert(
        err.response?.data?.detail ||
          'Error al registrar la boleta de suscripción.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBoleta = async (id: number) => {
    if (window.confirm(`¿Deseas eliminar la boleta #${id}?`)) {
      try {
        await monetizacionService.deleteBoleta(id);
        loadAllData();
      } catch (err) {
        alert('No se pudo eliminar la boleta.');
      }
    }
  };

  // Estilos armónicos de tarjetas
  const getCardTheme = (index: number) => {
    const themes = [
      {
        headerBg: 'bg-slate-900',
        badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
        buttonBg: 'bg-slate-900 hover:bg-slate-800 text-white',
        icon: '🚗',
        subtitle: 'Para evaluaciones individuales y proyectos iniciales.',
        cardBorder: 'border-slate-200 hover:border-blue-400',
        badgeText: 'BÁSICO',
        isPopular: false,
      },
      {
        headerBg: 'bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
        buttonBg: 'bg-blue-800 hover:bg-blue-700 text-white shadow-sm',
        icon: '✈️',
        subtitle: 'Recomendado para Pentesters activos con múltiples objetivos.',
        cardBorder: 'border-2 border-blue-600 shadow-md ring-4 ring-blue-500/10',
        badgeText: '⭐ MÁS POPULAR',
        isPopular: true,
      },
      {
        headerBg: 'bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950',
        badgeColor: 'bg-sky-100 text-sky-900 border-sky-200',
        buttonBg: 'bg-blue-900 hover:bg-blue-800 text-white shadow-sm',
        icon: '🚀',
        subtitle: 'Para equipos y auditorías complejas multitarget.',
        cardBorder: 'border-slate-200 hover:border-blue-500',
        badgeText: 'ENTERPRISE',
        isPopular: false,
      },
    ];
    return themes[index % themes.length];
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            💳 Planes de Suscripción y Monetización
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            Selecciona tu plan de evaluación ofensiva y gestiona tu historial de boletas registradas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1"
                onClick={() => {
                  setTarifaForm({ nombre: '', monto: '' });
                  setIsTarifaModalOpen(true);
                }}
              >
                ➕ Nueva Tarifa
              </button>
              <button
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition shadow-xs flex items-center gap-1"
                onClick={() => {
                  setPlanForm({ nombre: '', duracion_dias: 30, tarifa: tarifas[0]?.id || 0 });
                  setIsPlanModalOpen(true);
                }}
              >
                ➕ Nuevo Plan
              </button>
            </>
          )}

          {isPentester && (
            <button
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition shadow-xs flex items-center gap-1.5"
              onClick={() => handleOpenSubscribeModal(planes[0]?.id || 0)}
            >
              📝 Registrar Boleta de Suscripción
            </button>
          )}
        </div>
      </div>

      {/* Tabs de Navegación */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'pricing'
              ? 'border-blue-800 text-blue-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('pricing')}
        >
          🏷️ Tabla de Planes de Suscripción
        </button>
        <button
          className={`pb-2.5 transition border-b-2 ${
            activeTab === 'boletas'
              ? 'border-blue-800 text-blue-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
          onClick={() => setActiveTab('boletas')}
        >
          📜 Mis Boletas Registradas ({boletas.length})
        </button>
        {isAdmin && (
          <>
            <button
              className={`pb-2.5 transition border-b-2 ${
                activeTab === 'planes'
                  ? 'border-blue-800 text-blue-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('planes')}
            >
              📦 Gestión de Planes ({planes.length})
            </button>
            <button
              className={`pb-2.5 transition border-b-2 ${
                activeTab === 'tarifas'
                  ? 'border-blue-800 text-blue-800 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('tarifas')}
            >
              💰 Gestión de Tarifas Base ({tarifas.length})
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={loadAllData} className="underline font-bold">
            Reintentar
          </button>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center text-slate-400 text-xs flex justify-center items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800"></div>
          <span>Cargando planes de suscripción...</span>
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* VISTA 1: TABLA DE PLANES Y TARJETAS DE SUSCRIPCIÓN (PENTESTER) */}
          {/* ============================================================ */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              {/* Banner Promocional */}
              <div className="bg-slate-900 text-white rounded-xl p-6 shadow-xs border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <span className="text-[10px] font-extrabold tracking-widest text-sky-400 uppercase bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
                    Suscripción de Evaluaciones LLM
                  </span>
                  <h2 className="text-lg font-bold tracking-tight text-white">
                    Elige el Plan para Habilitar tus Pentests de IA
                  </h2>
                  <p className="text-slate-400 text-xs max-w-xl">
                    Todos los planes incluyen suite de vectores OWASP LLM01-LLM10, análisis de endpoints REST/WSS y emisión de reportes firmados con SHA-256.
                  </p>
                </div>
                {isPentester && (
                  <button
                    className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg shadow-sm transition shrink-0"
                    onClick={() => handleOpenSubscribeModal(planes[0]?.id || 0)}
                  >
                    🚀 REGISTRAR MI BOLETA AHORA
                  </button>
                )}
              </div>

              {/* GRID DE TARJETAS DE SUSCRIPCIÓN */}
              {planes.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400 text-xs">
                  No hay planes de suscripción publicados por el Administrador.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
                  {planes.map((p, idx) => {
                    const theme = getCardTheme(idx);
                    return (
                      <div
                        key={p.id}
                        className={`bg-white rounded-xl border ${theme.cardBorder} overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between relative`}
                      >
                        {/* Header de Tarjeta */}
                        <div>
                          <div className={`${theme.headerBg} text-white p-6 text-center space-y-2 relative`}>
                            {theme.isPopular && (
                              <div className="absolute top-3 right-3 bg-sky-400 text-slate-950 font-extrabold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                {theme.badgeText}
                              </div>
                            )}
                            <div className="w-12 h-12 bg-white/10 backdrop-blur-xs rounded-xl flex items-center justify-center text-2xl mx-auto border border-white/10">
                              {theme.icon}
                            </div>
                            <h3 className="text-base font-bold tracking-tight uppercase">
                              {p.nombre}
                            </h3>
                            <p className="text-[11px] text-slate-300 max-w-xs mx-auto">
                              {theme.subtitle}
                            </p>
                          </div>

                          {/* Precio y Duración Exacta en Días */}
                          <div className="p-5 text-center border-b border-slate-100 bg-slate-50/60 space-y-0.5">
                            <div className="flex items-baseline justify-center gap-1">
                              <span className="text-2xl font-black text-slate-900 tracking-tight">
                                ${p.tarifa_monto || '0.00'}
                              </span>
                              <span className="text-xs font-bold text-slate-500">USD</span>
                            </div>
                            <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wide bg-blue-50 px-2 py-0.5 rounded border border-blue-100 inline-block">
                              ⏱️ Duración: {p.duracion_dias} días
                            </div>
                          </div>

                          {/* Lista de Beneficios e Incluidos */}
                          <div className="p-5 space-y-2.5 text-xs text-slate-600">
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-100">
                                ✓
                              </span>
                              <span className="font-semibold text-slate-800">
                                Cobertura por {p.duracion_dias} días continuos
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-100">
                                ✓
                              </span>
                              <span>Reconocimiento de Chatbots y WebSockets</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-100">
                                ✓
                              </span>
                              <span>Vectores OWASP LLM01-LLM10 y Jailbreaks</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-100">
                                ✓
                              </span>
                              <span>Firma de Evidencia Criptográfica SHA-256</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-4 h-4 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-[10px] shrink-0 border border-blue-100">
                                ✓
                              </span>
                              <span>Asistente de IA para Pentests</span>
                            </div>
                          </div>
                        </div>

                        {/* Botón CTA de Acción */}
                        <div className="p-5 pt-0 space-y-2">
                          {isPentester ? (
                            <>
                              <button
                                className={`w-full ${theme.buttonBg} font-bold text-xs py-2.5 rounded-lg transition shadow-xs flex items-center justify-center gap-1.5 uppercase tracking-wide cursor-pointer`}
                                onClick={() => handleOpenStripeModal(p)}
                              >
                                💳 PAGAR CON STRIPE
                              </button>
                              <button
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[11px] py-1.5 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer"
                                onClick={() => handleOpenSubscribeModal(p.id)}
                              >
                                📝 Registrar Boleta Manual
                              </button>
                            </>
                          ) : (
                            <div className="text-center text-[11px] text-slate-400 font-medium py-2 bg-slate-50 rounded-lg">
                              Tarifa de Referencia para Pentesters
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VISTA 2: HISTORIAL DE BOLETAS DE SUSCRIPCIÓN REGISTRADAS */}
          {/* ============================================================ */}
          {activeTab === 'boletas' && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs space-y-0">
              <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3 bg-slate-50/50">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    {isAdmin
                      ? 'Auditoría Global de Boletas de Suscripción'
                      : 'Mis Boletas de Suscripción Registradas'}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Historial de comprobantes de pago de suscripción en la plataforma.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-lg shrink-0">
                    <button
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                        boletasViewMode === 'cards'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      onClick={() => setBoletasViewMode('cards')}
                      title="Vista de Tarjetas"
                    >
                      🎴 Tarjetas
                    </button>
                    <button
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                        boletasViewMode === 'table'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      onClick={() => setBoletasViewMode('table')}
                      title="Vista de Tabla"
                    >
                      📋 Tabla
                    </button>
                  </div>

                  {isPentester && (
                    <button
                      className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-xs shrink-0"
                      onClick={() => handleOpenSubscribeModal(planes[0]?.id || 0)}
                    >
                      ➕ Registrar Mi Boleta
                    </button>
                  )}
                </div>
              </div>

              {boletas.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs space-y-2">
                  <p>No tienes boletas de suscripción registradas actualmente.</p>
                  {isPentester && (
                    <button
                      className="text-blue-800 font-bold hover:underline"
                      onClick={() => setActiveTab('pricing')}
                    >
                      Explorar Planes y Suscribirme
                    </button>
                  )}
                </div>
              ) : boletasViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50">
                  {boletas.map((b) => (
                    <div
                      key={b.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-blue-700 text-xs">
                            #{b.numero_boleta}
                          </span>
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold text-[11px]">
                            {b.plan_nombre}
                          </span>
                        </div>

                        <div className="text-xs">
                          <div className="font-semibold text-slate-900">{b.pentester_username}</div>
                          <div className="text-[10px] text-slate-400">{b.pentester_email}</div>
                        </div>

                        <div className="bg-slate-50 border border-slate-100 p-2.5 rounded-lg space-y-1 text-xs">
                          <div className="flex justify-between text-slate-600">
                            <span>Duración:</span>
                            <span className="font-semibold text-slate-800">{b.plan_duracion_dias} días</span>
                          </div>
                          <div className="flex justify-between text-slate-600">
                            <span>Vigencia:</span>
                            <span className="font-semibold text-slate-800">{b.fecha_inicio} al {b.fecha_fin}</span>
                          </div>
                          <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                            <span>Monto Total:</span>
                            <span>${b.plan_monto} USD</span>
                          </div>
                        </div>
                      </div>

                      {isAdmin && (
                        <div className="flex justify-end pt-2 border-t border-slate-100">
                          <button
                            className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-[11px] font-semibold transition"
                            onClick={() => handleDeleteBoleta(b.id)}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Nº Boleta</th>
                        <th className="px-4 py-3">Pentester Titular</th>
                        <th className="px-4 py-3">Plan Suscrito</th>
                        <th className="px-4 py-3">Duración (Días)</th>
                        <th className="px-4 py-3">Fecha Inicio</th>
                        <th className="px-4 py-3">Fecha Fin (Vencimiento)</th>
                        <th className="px-4 py-3">Monto Tarifa</th>
                        {isAdmin && <th className="px-4 py-3 text-right">Acciones</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {boletas.map((b) => (
                        <tr key={b.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-mono font-bold text-blue-700">
                            #{b.numero_boleta}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {b.pentester_username}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {b.pentester_email}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded font-bold text-[11px]">
                              {b.plan_nombre}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700 font-semibold">
                            {b.plan_duracion_dias} días
                          </td>
                          <td className="px-4 py-3 text-slate-600">{b.fecha_inicio}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{b.fecha_fin}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            ${b.plan_monto} USD
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3 text-right">
                              <button
                                className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-[11px] font-semibold transition"
                                onClick={() => handleDeleteBoleta(b.id)}
                              >
                                🗑️ Eliminar
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VISTA 3: GESTIÓN DE PLANES (ADMIN ONLY) */}
          {/* ============================================================ */}
          {activeTab === 'planes' && isAdmin && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900">Catálogo de Planes Vigentes</h3>
                
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-lg shrink-0">
                    <button
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                        planesViewMode === 'cards'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      onClick={() => setPlanesViewMode('cards')}
                      title="Vista de Tarjetas"
                    >
                      🎴 Tarjetas
                    </button>
                    <button
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                        planesViewMode === 'table'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      onClick={() => setPlanesViewMode('table')}
                      title="Vista de Tabla"
                    >
                      📋 Tabla
                    </button>
                  </div>

                  <button
                    className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition"
                    onClick={() => {
                      setPlanForm({ nombre: '', duracion_dias: 30, tarifa: tarifas[0]?.id || 0 });
                      setIsPlanModalOpen(true);
                    }}
                  >
                    ➕ Registrar Plan
                  </button>
                </div>
              </div>

              {planes.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No hay planes registrados en el sistema.
                </div>
              ) : planesViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50">
                  {planes.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900 text-sm">{p.nombre}</span>
                          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-semibold">
                            {p.duracion_dias} días
                          </span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-1">
                          <div className="text-[11px] text-slate-400">Tarifa Vinculada:</div>
                          <div className="font-bold text-slate-800 text-xs">{p.tarifa_nombre}</div>
                          <div className="text-sm font-extrabold text-slate-900">
                            ${p.tarifa_monto} USD
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-[11px] font-semibold transition"
                          onClick={() => handleDeletePlan(p.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">ID Plan</th>
                        <th className="px-4 py-3">Nombre del Plan</th>
                        <th className="px-4 py-3">Duración (Días)</th>
                        <th className="px-4 py-3">Tarifa Vinculada</th>
                        <th className="px-4 py-3">Monto Tarifa</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {planes.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-600">#{p.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{p.nombre}</td>
                          <td className="px-4 py-3 font-semibold text-blue-800">{p.duracion_dias} días</td>
                          <td className="px-4 py-3 text-slate-700">{p.tarifa_nombre}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">${p.tarifa_monto} USD</td>
                          <td className="px-4 py-3 text-right">
                            <button
                              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-[11px] font-semibold transition"
                              onClick={() => handleDeletePlan(p.id)}
                            >
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* VISTA 4: GESTIÓN DE TARIFAS (ADMIN ONLY) */}
          {/* ============================================================ */}
          {activeTab === 'tarifas' && isAdmin && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-xs font-bold text-slate-900">Catálogo de Tarifas Base</h3>
                
                <div className="flex items-center gap-2">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-slate-100 p-0.5 border border-slate-200 rounded-lg shrink-0">
                    <button
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                        tarifasViewMode === 'cards'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      onClick={() => setTarifasViewMode('cards')}
                      title="Vista de Tarjetas"
                    >
                      🎴 Tarjetas
                    </button>
                    <button
                      className={`px-2.5 py-1 text-xs font-semibold rounded-md transition ${
                        tarifasViewMode === 'table'
                          ? 'bg-white text-blue-800 shadow-xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                      onClick={() => setTarifasViewMode('table')}
                      title="Vista de Tabla"
                    >
                      📋 Tabla
                    </button>
                  </div>

                  <button
                    className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition"
                    onClick={() => {
                      setTarifaForm({ nombre: '', monto: '' });
                      setIsTarifaModalOpen(true);
                    }}
                  >
                    ➕ Registrar Tarifa
                  </button>
                </div>
              </div>

              {tarifas.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No hay tarifas registradas en la plataforma.
                </div>
              ) : tarifasViewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50/50">
                  {tarifas.map((t) => (
                    <div
                      key={t.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-slate-500 text-xs">#{t.id}</span>
                          <span className="text-xs font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                            ${t.monto} USD
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{t.nombre}</div>
                        <div className="text-[10px] text-slate-400">
                          Creada: {t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-slate-100">
                        <button
                          className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-[11px] font-semibold transition"
                          onClick={() => handleDeleteTarifa(t.id)}
                        >
                          🗑️ Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto w-full">
                  <table className="w-full text-left text-xs whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">ID</th>
                        <th className="px-4 py-3">Nombre de la Tarifa</th>
                        <th className="px-4 py-3">Monto ($ USD)</th>
                        <th className="px-4 py-3">Fecha Creación</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {tarifas.map((t) => (
                        <tr key={t.id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-600">#{t.id}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{t.nombre}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            ${t.monto} USD
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {t.created_at ? new Date(t.created_at).toLocaleDateString() : '-'}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              className="bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded px-2.5 py-1 text-[11px] font-semibold transition"
                              onClick={() => handleDeleteTarifa(t.id)}
                            >
                              🗑️ Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* --- MODAL CREAR TARIFA (ADMIN) --- */}
      {isTarifaModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsTarifaModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">🏷️ Registrar Tarifa (Admin)</h3>
              <button
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg text-xs"
                onClick={() => setIsTarifaModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateTarifa} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nombre de la Tarifa</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  placeholder="ej: Tarifa Básica, Tarifa Pro"
                  value={tarifaForm.nombre}
                  onChange={(e) => setTarifaForm({ ...tarifaForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Monto ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  placeholder="ej: 99.99"
                  value={tarifaForm.monto}
                  onChange={(e) => setTarifaForm({ ...tarifaForm, monto: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-semibold"
                  onClick={() => setIsTarifaModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-800 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Tarifa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CREAR PLAN (ADMIN) --- */}
      {isPlanModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsPlanModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">📦 Registrar Plan (Admin)</h3>
              <button
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg text-xs"
                onClick={() => setIsPlanModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nombre del Plan</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  placeholder="ej: Plan Mensual Pentester"
                  value={planForm.nombre}
                  onChange={(e) => setPlanForm({ ...planForm, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Duración del Plan (en Días)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  placeholder="ej: 30 para 1 mes, 365 para 1 año"
                  value={planForm.duracion_dias}
                  onChange={(e) => setPlanForm({ ...planForm, duracion_dias: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Seleccionar Tarifa</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  value={planForm.tarifa}
                  onChange={(e) => setPlanForm({ ...planForm, tarifa: Number(e.target.value) })}
                  required
                >
                  <option value={0}>-- Selecciona una tarifa --</option>
                  {tarifas.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} (${t.monto} USD)
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-semibold"
                  onClick={() => setIsPlanModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-800 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting ? 'Guardando...' : 'Guardar Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL REGISTRAR BOLETA DE SUSCRIPCIÓN (PENTESTER) CON CÁLCULO AUTOMÁTICO DE FECHA_FIN --- */}
      {isBoletaModalOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setIsBoletaModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                📝 Registrar Boleta de Suscripción (Pentester)
              </h3>
              <button
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg text-xs"
                onClick={() => setIsBoletaModalOpen(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateBoleta} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Número de Boleta / Comprobante</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-mono"
                  placeholder="ej: BOL-981245"
                  value={boletaForm.numero_boleta}
                  onChange={(e) =>
                    setBoletaForm({ ...boletaForm, numero_boleta: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Plan Seleccionado</label>
                <select
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none font-semibold text-slate-900"
                  value={boletaForm.plan}
                  onChange={(e) => handlePlanChangeInBoletaForm(Number(e.target.value))}
                  required
                >
                  <option value={0}>-- Selecciona un plan --</option>
                  {planes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.duracion_dias} días) — ${p.tarifa_monto} USD
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Fecha de Inicio</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                    value={boletaForm.fecha_inicio}
                    onChange={(e) => handleFechaInicioChangeInBoletaForm(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 flex items-center justify-between">
                    <span>Fecha Fin</span>
                    <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-1.5 rounded">
                      ⚡ Calculada
                    </span>
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg outline-none font-semibold text-slate-800"
                    value={boletaForm.fecha_fin}
                    onChange={(e) =>
                      setBoletaForm({ ...boletaForm, fecha_fin: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-lg text-[11px] space-y-1">
                <div className="font-bold">⚡ Cálculo Automático de Vencimiento:</div>
                <div>
                  La Fecha de Fin se calcula sumando la duración en días (
                  <span className="font-bold">
                    {planes.find((p) => p.id === boletaForm.plan)?.duracion_dias || 30} días
                  </span>
                  ) a la Fecha de Inicio.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg font-semibold"
                  onClick={() => setIsBoletaModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg disabled:opacity-50 transition shadow-sm"
                >
                  {submitting ? 'Guardando...' : 'Confirmar y Guardar Boleta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL PAGO CON STRIPE --- */}
      <StripePaymentModal
        plan={selectedPlanForStripe}
        isOpen={isStripeModalOpen}
        onClose={() => setIsStripeModalOpen(false)}
        onSuccess={handleStripePaymentSuccess}
      />
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([
    { time: '21:04:02', tag: '[RECON]', text: 'Mapeando endpoints HTTP /api/v1/chat y WebSockets wss://voice.bot.internal...', type: 'info' },
    { time: '21:04:05', tag: '[PROMPT_INJ]', text: 'Test PI-001 (Direct System Prompt Override) -> Guardrail Bloqueó Correctamente.', type: 'success' },
    { time: '21:08:15', tag: '[DATA_LEAK]', text: 'DETECTADO HALLAZGO HIGH: System Prompt & API Keys Disclosed in RAG Context!', type: 'alert' },
    { time: '21:12:04', tag: '[JAILBREAK]', text: 'Test JB-044 (Roleplay Evasion Pattern) -> Modelo respondió sin filtros.', type: 'alert' },
    { time: '21:15:30', tag: '[STT_INJ]', text: 'Test STT-012 (Phonetic Audio Attack Vector) -> Transcript Sanitizado.', type: 'success' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString();
      const sampleEvents = [
        { time: newTime, tag: '[AI_ANALYSIS]', text: 'Variante adaptativa de payload generada por el agente de IA.', type: 'info' },
        { time: newTime, tag: '[JAILBREAK]', text: 'Test JB-088 (Dan 11.0 Variant) -> Generación bloqueada por modelo.', type: 'success' },
        { time: newTime, tag: '[AUDIT_LOG]', text: 'Hash SHA-256 e8f32a... generado para evidencia EVID-2026-904.', type: 'info' },
        { time: newTime, tag: '[SCOPE_VAL]', text: 'Validación de alcance OK: Dominio objetivo en lista blanca autorizada.', type: 'success' },
        { time: newTime, tag: '[GRAPHQL_SCAN]', text: 'Inspeccionando esquema GraphQL en /graphql -> 12 queries descubiertas.', type: 'info' },
      ];
      const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      setConsoleLogs((prev) => [...prev.slice(1), randomEvent]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans overflow-x-hidden scroll-smooth">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 bg-slate-900/90 backdrop-blur-md text-white border-b border-slate-800/80 z-50 px-4 sm:px-6 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="#hero" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-sky-400 rounded-lg flex items-center justify-center font-black text-xs text-white shadow-md shadow-blue-500/20 group-hover:scale-110 group-hover:shadow-sky-400/40 transition-all duration-300">
              AI
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white group-hover:text-sky-300 transition-colors">
                GenAI Security Lab
              </span>
              <span className="text-[10px] text-sky-400 font-semibold tracking-wider">
                LLM OFFENSIVE SECURITY PLATFORM
              </span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <a href="#hero" className="hover:text-sky-400 transition-colors py-1 relative group">
              Inicio
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#funcionalidades" className="hover:text-sky-400 transition-colors py-1 relative group">
              Funcionalidades
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#ia" className="hover:text-sky-400 transition-colors py-1 relative group">
              IA Asistida
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#hallazgos" className="hover:text-sky-400 transition-colors py-1 relative group">
              Hallazgos
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#estandares" className="hover:text-sky-400 transition-colors py-1 relative group">
              Estándares
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#metodologia" className="hover:text-sky-400 transition-colors py-1 relative group">
              Metodología
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a href="#planes" className="hover:text-sky-400 transition-colors py-1 relative group">
              Planes
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-sky-400 transition-all duration-300 group-hover:w-full"></span>
            </a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <button
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-md px-2.5 py-1.5 text-xs border border-slate-700 hover:border-slate-600 transition-all cursor-pointer"
              onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
              title="Cambiar Idioma / Change Language"
            >
              {language === 'ES' ? '🇪🇸 ES' : '🇺🇸 EN'}
            </button>

            <span className="bg-sky-500/10 text-sky-400 font-bold text-[10px] px-2.5 py-1 rounded border border-sky-500/20 hidden xl:inline-block shadow-xs">
              SCOPE: AUTHORIZED LAB ONLY
            </span>
            <Link
              to="/login"
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-md border border-slate-700 hover:border-slate-600 transition-all shadow-xs"
            >
              {language === 'ES' ? 'Iniciar sesión' : 'Login'}
            </Link>
            <Link
              to="/register"
              className="btn-shimmer bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-sky-500 text-white font-bold text-xs px-4 py-1.5 rounded-md shadow-md shadow-blue-600/20 hover:shadow-blue-500/40 transition-all duration-300"
            >
              {language === 'ES' ? 'Comenzar' : 'Get Started'}
            </Link>
          </div>

          <button
            className="lg:hidden text-slate-300 hover:text-white p-1"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Abrir menú de navegación"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d={mobileNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="lg:hidden pt-4 pb-3 space-y-3 border-t border-slate-800 mt-3 text-xs animate-fadeIn">
            <div className="flex flex-col gap-2 font-medium text-slate-300 px-2">
              <a href="#hero" onClick={() => setMobileNavOpen(false)} className="py-1.5 hover:text-sky-400 transition-colors">Inicio</a>
              <a href="#funcionalidades" onClick={() => setMobileNavOpen(false)} className="py-1.5 hover:text-sky-400 transition-colors">Funcionalidades</a>
              <a href="#ia" onClick={() => setMobileNavOpen(false)} className="py-1.5 hover:text-sky-400 transition-colors">Inteligencia Artificial</a>
              <a href="#hallazgos" onClick={() => setMobileNavOpen(false)} className="py-1.5 hover:text-sky-400 transition-colors">Gestión de Hallazgos</a>
              <a href="#estandares" onClick={() => setMobileNavOpen(false)} className="py-1.5 hover:text-sky-400 transition-colors">OWASP & MITRE ATLAS</a>
              <a href="#metodologia" onClick={() => setMobileNavOpen(false)} className="py-1.5 hover:text-sky-400 transition-colors">Metodología</a>
              <a href="#planes" onClick={() => setMobileNavOpen(false)} className="py-1.5 hover:text-sky-400 transition-colors">Planes</a>
            </div>
            <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
              <Link
                to="/login"
                className="bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2 rounded-md transition"
                onClick={() => setMobileNavOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-500 text-white text-center font-bold py-2 rounded-md transition"
                onClick={() => setMobileNavOpen(false)}
              >
                Comenzar evaluación
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white py-16 md:py-24 px-6 relative overflow-hidden">
        {/* Glow Orbs de fondo */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-400/30 rounded-full text-xs font-bold text-sky-400 shadow-sm backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
              <span>PLATAFORMA ENTERPRISE</span> • <span>Seguridad en LLMs & Chatbots Web</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Evalúa la seguridad de tus aplicaciones de{' '}
              <span className="bg-gradient-to-r from-sky-400 via-blue-400 to-sky-300 bg-clip-text text-transparent drop-shadow-sm">
                Inteligencia Artificial
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Una plataforma centralizada para identificar vulnerabilidades en chatbots y sistemas basados en LLM mediante pruebas ofensivas controladas, análisis asistido por IA y generación automatizada de evidencias y reportes.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="btn-shimmer bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-sky-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <span>Comenzar evaluación</span>
                <span className="transition-transform group-hover:translate-x-1">➔</span>
              </Link>
              <a
                href="#funcionalidades"
                className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-sky-400/50 font-semibold text-sm px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 backdrop-blur-md"
              >
                Ver funcionalidades
              </a>
            </div>

            <div className="pt-3">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase mb-2">
                Vectores & Marcos Soportados
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium text-slate-300">
                <span className="bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1 rounded-lg border border-slate-700/80 hover:border-sky-400/40 transition-all cursor-default">Prompt Injection</span>
                <span className="bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1 rounded-lg border border-slate-700/80 hover:border-sky-400/40 transition-all cursor-default">Jailbreak</span>
                <span className="bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1 rounded-lg border border-slate-700/80 hover:border-sky-400/40 transition-all cursor-default">OWASP LLM</span>
                <span className="bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1 rounded-lg border border-slate-700/80 hover:border-sky-400/40 transition-all cursor-default">MITRE ATLAS</span>
                <span className="bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1 rounded-lg border border-sky-400/30 text-sky-300 transition-all cursor-default">AI Analysis</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-xs text-slate-400 pt-6 border-t border-slate-800/80">
              <div className="hover:text-slate-200 transition-colors">
                <div className="text-white font-bold text-sm">OWASP LLM</div>
                <div className="text-[11px] text-slate-400">Top 10 Mapeado</div>
              </div>
              <div className="hover:text-slate-200 transition-colors">
                <div className="text-white font-bold text-sm">MITRE ATLAS</div>
                <div className="text-[11px] text-slate-400">Tácticas y Técnicas</div>
              </div>
              <div className="hover:text-slate-200 transition-colors">
                <div className="text-white font-bold text-sm">SHA-256 Hashes</div>
                <div className="text-[11px] text-slate-400">Trazabilidad Criptográfica</div>
              </div>
            </div>
          </div>

          {/* Console Box Live Stream con Scanline Laser */}
          <div className="bg-slate-950 border border-slate-800/90 rounded-2xl overflow-hidden shadow-2xl shadow-sky-500/5 font-mono text-xs text-slate-300 relative group hover:border-slate-700 transition-all duration-300">
            {/* Scanline beam line overlay */}
            <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-sky-400 to-transparent opacity-40 animate-scanline pointer-events-none z-20"></div>

            <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-semibold backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-slate-200">LIVE EXECUTION STREAM — AST-2026-0092</span>
              </div>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                EVALUACIÓN EN CURSO
              </span>
            </div>

            <div className="p-4 h-80 overflow-y-auto space-y-2.5 bg-slate-950/90 scrollbar-thin">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed border-b border-slate-900/60 pb-1.5 last:border-0 hover:bg-slate-900/40 px-1 rounded transition-colors">
                  <span className="text-slate-500">{log.time}</span>{' '}
                  <span className="text-sky-400 font-bold">{log.tag}</span>{' '}
                  <span
                    className={
                      log.type === 'alert'
                        ? 'text-red-400 font-medium'
                        : log.type === 'success'
                        ? 'text-emerald-400 font-medium'
                        : 'text-slate-300'
                    }
                  >
                    {log.text}
                  </span>
                </div>
              ))}
            </div>

            <div className="bg-slate-900/90 px-4 py-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500">
              <span className="truncate">Objetivo: https://bot.corp.internal/chat</span>
              <span className="text-sky-400/80 font-bold">OWASP LLM-01/02/07</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Sección Funcionalidades */}
      <section id="funcionalidades" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3.5 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full uppercase tracking-wider shadow-xs border border-blue-200/60">
            Capacidades del Sistema
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Todo lo que necesitas para evaluar la seguridad de un chatbot
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Centraliza la gestión de alcance, descubrimiento de superficie de ataque y ejecución de pruebas ofensivas especializadas sobre modelos generativos.
          </p>
        </div>

        <div className="space-y-10">
          {/* Bloque A: Gestión y configuración */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shadow-xs animate-float-slow">
                ⚙️
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">A. Gestión y Configuración de Evaluaciones</h3>
                <p className="text-xs text-slate-500">Control institucional, roles de usuarios y delimitación estricta de alcance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>👥</span> Gestión de usuarios y roles
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Administración de accesos con roles definidos para Administrador, Analista de Seguridad y Auditor.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>🎯</span> Registro de chatbot objetivo
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Registro detallado de aplicaciones web, URL objetivo, servicios de API, canales soportados y alcance autorizado.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>🛠️</span> Configuración de evaluaciones
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Selección de módulos ofensivos, credenciales de prueba, roles simulados, tenants y parámetros de seguridad personalizados.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>🔐</span> Control de acceso basado en roles (RBAC)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Restricción rigurosa de módulos y datos según los permisos otorgados a cada perfil de usuario.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2 md:col-span-2 lg:col-span-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>🛡️</span> Validación de alcance (Scope Control)
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Mecanismos integrados que verifican que las pruebas ofensivas únicamente puedan ejecutarse sobre dominios, IP y recursos previamente autorizados.
                </p>
              </div>
            </div>
          </div>

          {/* Bloque B: Reconocimiento */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center font-bold text-lg shadow-xs animate-float-slow">
                🔍
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">B. Reconocimiento de Superficie de Ataque (Attack Surface Discovery)</h3>
                <p className="text-xs text-slate-500">Mapeo automatizado de componentes expuestos y APIs asociadas al chatbot.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>🌐</span> Reconocimiento de superficie de ataque
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Detección inteligente de endpoints HTTP, formularios de chat, campos de entrada, parámetros, WebSockets, canales de voz y metadatos relevantes.
                </p>
              </div>

              <div className="p-4 bg-slate-50/80 hover:bg-white rounded-xl border border-slate-200/60 hover:border-sky-400/40 hover:-translate-y-1 hover:shadow-md transition-all duration-300 space-y-2">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <span>⚡</span> Análisis REST y GraphQL
                </h4>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Inspección técnica de métodos, parámetros, cabeceras, respuestas y controles de acceso en las APIs que comunican con el modelo de lenguaje.
                </p>
              </div>
            </div>
          </div>

          {/* Bloque C: Pruebas ofensivas para LLM (Destacado con resplandor) */}
          <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white rounded-2xl p-8 shadow-2xl border border-slate-700/80 relative overflow-hidden group hover:border-sky-500/50 transition-all duration-500">
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-all"></div>

            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700/60 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-blue-500/30">
                🔥
              </div>
              <div>
                <div className="text-[10px] font-extrabold uppercase text-sky-400 tracking-wider">MÓDULO DESTACADO</div>
                <h3 className="text-lg font-extrabold text-white">C. Pruebas Ofensivas para LLM y Modelos Generativos</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              <div className="bg-slate-800/80 hover:bg-slate-800 p-5 rounded-xl border border-slate-700/80 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 space-y-2 backdrop-blur-sm">
                <div className="text-sky-400 text-xl font-bold">💉</div>
                <h4 className="text-xs font-bold text-white">Prompt Injection</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Generación y ejecución de pruebas directas e indirectas para evaluar la vulnerabilidad del modelo ante manipulación de instrucciones.
                </p>
              </div>

              <div className="bg-slate-800/80 hover:bg-slate-800 p-5 rounded-xl border border-slate-700/80 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 space-y-2 backdrop-blur-sm">
                <div className="text-sky-400 text-xl font-bold">🔓</div>
                <h4 className="text-xs font-bold text-white">Jailbreak</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Evaluación con técnicas avanzadas de evasión para comprobar si las restricciones éticas y de comportamiento del modelo pueden ser ignoradas.
                </p>
              </div>

              <div className="bg-slate-800/80 hover:bg-slate-800 p-5 rounded-xl border border-slate-700/80 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 space-y-2 backdrop-blur-sm">
                <div className="text-sky-400 text-xl font-bold">🕵️</div>
                <h4 className="text-xs font-bold text-white">Fuga de Información</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Pruebas para detectar la extracción indebida de System Prompts, variables internas, credenciales de API o datos sensibles de clientes.
                </p>
              </div>

              <div className="bg-slate-800/80 hover:bg-slate-800 p-5 rounded-xl border border-slate-700/80 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 space-y-2 backdrop-blur-sm">
                <div className="text-sky-400 text-xl font-bold">🎙️</div>
                <h4 className="text-xs font-bold text-white">Audio / Speech-to-Text</h4>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Evaluación de instrucciones no autorizadas o inyecciones semánticas transmitidas mediante archivos de audio o transcripciones fónicas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Sección de Inteligencia Artificial */}
      <section id="ia" className="bg-slate-950 text-white py-20 px-6 border-t border-slate-800/90 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3.5 py-1 bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-extrabold rounded-full uppercase tracking-wider backdrop-blur-md">
              Motor Asistido por IA
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Análisis asistido por Inteligencia Artificial
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              La plataforma utiliza IA como apoyo durante la evaluación para adaptar pruebas al contexto del chatbot, interpretar semánticamente sus respuestas y ayudar a identificar comportamientos potencialmente vulnerables.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900/90 hover:bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center text-xl font-bold animate-float-slow">
                ⚡
              </div>
              <h3 className="text-sm font-bold text-white">Generación adaptativa de payloads</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Generación dinámica de variantes de pruebas ofensivas según las respuestas y bloqueos detectados previamente en el objetivo.
              </p>
            </div>

            <div className="bg-slate-900/90 hover:bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center text-xl font-bold animate-float-slow">
                🧠
              </div>
              <h3 className="text-sm font-bold text-white">Interpretación semántica</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Análisis contextual profundo de las respuestas del chatbot para discernir entre respuestas seguras y brechas de información sutiles.
              </p>
            </div>

            <div className="bg-slate-900/90 hover:bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-sky-500/10 transition-all duration-300 space-y-3 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 text-sky-400 flex items-center justify-center text-xl font-bold animate-float-slow">
                🎯
              </div>
              <h3 className="text-sm font-bold text-white">Reducción de falsos positivos</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Clasificación preliminar automatizada de hallazgos para presentar priorizadamente los casos de mayor riesgo al analista.
              </p>
            </div>
          </div>

          {/* Nota visual de Asistencia al Analista */}
          <div className="bg-gradient-to-r from-blue-950/80 to-slate-900/80 border border-blue-800/60 rounded-2xl p-6 text-xs text-blue-200 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-lg backdrop-blur-md">
            <div className="text-3xl animate-pulse">🤖</div>
            <div className="space-y-1">
              <div className="font-bold text-white text-xs">Supervisión humana garantizada</div>
              <div className="text-slate-300">
                La Inteligencia Artificial de la plataforma actúa estrictamente como un <strong className="text-sky-300">asistente analítico</strong>. No reemplaza la validación del analista de seguridad ni toma decisiones autónomas sin revisión previa.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Sección Gestión de Hallazgos */}
      <section id="hallazgos" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3.5 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-200/60">
            Ciclo de Auditoría
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            De la prueba al hallazgo
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Flujo estructurado para transformar ejecuciones ofensivas en vulnerabilidades documentadas con evidencia accionable.
          </p>
        </div>

        {/* Flujo visual */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 text-center">
            FLUJO OPERATIVO DE AUDITORÍA
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 text-center text-xs font-bold">
            <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all hover:scale-105">1. Reconocimiento</div>
            <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all hover:scale-105">2. Pruebas</div>
            <div className="p-3 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded-xl border border-blue-200 transition-all hover:scale-105">3. Análisis IA</div>
            <div className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all hover:scale-105">4. Validación</div>
            <div className="p-3 bg-amber-50 text-amber-900 hover:bg-amber-100 rounded-xl border border-amber-200 transition-all hover:scale-105">5. Hallazgo</div>
            <div className="p-3 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition-all hover:scale-105">6. Reporte</div>
          </div>
        </div>

        {/* Matriz de hallazgos */}
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 space-y-4 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Registro y Clasificación de Hallazgos</h3>
              <p className="text-xs text-slate-500">Visualización simplificada de vulnerabilidades registradas en el sistema.</p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] font-bold">
              <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md border border-emerald-200/60 shadow-2xs">Confirmado</span>
              <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md border border-amber-200/60 shadow-2xs">Pendiente</span>
              <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200/60 shadow-2xs">Falso Positivo</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Tipo / Vector</th>
                  <th className="px-4 py-3">Evidencia Base</th>
                  <th className="px-4 py-3">Severidad</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">FIND-2026-01</td>
                  <td className="px-4 py-3 font-medium text-slate-800">Prompt Injection Directo</td>
                  <td className="px-4 py-3 text-slate-500">System Prompt Excluded in response payload</td>
                  <td className="px-4 py-3">
                    <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      CRÍTICA
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      Confirmado
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">FIND-2026-02</td>
                  <td className="px-4 py-3 font-medium text-slate-800">Fuga de Información RAG</td>
                  <td className="px-4 py-3 text-slate-500">Extracción de API Keys internas en respuesta</td>
                  <td className="px-4 py-3">
                    <span className="bg-orange-50 text-orange-700 border border-orange-200 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      ALTA
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      Confirmado
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">FIND-2026-03</td>
                  <td className="px-4 py-3 font-medium text-slate-800">Jailbreak por Roleplay</td>
                  <td className="px-4 py-3 text-slate-500">Respuesta sin restricciones de seguridad en bot</td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      MEDIA
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      Pendiente
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-slate-900">FIND-2026-04</td>
                  <td className="px-4 py-3 font-medium text-slate-800">Inyección por Audio / STT</td>
                  <td className="px-4 py-3 text-slate-500">Comando no autorizado detectado en audio</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      BAJA
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded text-[10px] font-bold shadow-2xs">
                      Falso positivo
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. OWASP y MITRE ATLAS */}
      <section id="estandares" className="bg-slate-900 text-white py-20 px-6 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto space-y-12 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3.5 py-1 bg-sky-500/10 border border-sky-400/30 text-sky-400 text-xs font-extrabold rounded-full uppercase tracking-wider backdrop-blur-md">
              Estándares Internacionales
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Alineado con estándares de seguridad para Inteligencia Artificial
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              La plataforma mapea cada vector de prueba y hallazgo detectado con los marcos globales de referencia en ciberseguridad.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/90 hover:bg-slate-800 p-8 rounded-2xl border border-slate-700/80 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">MARCO DE REFERENCIA</span>
                <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-2 py-0.5 rounded border border-sky-500/30">
                  MAPEO AUTOMÁTICO
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">OWASP Top 10 for LLM Applications</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Los hallazgos pueden relacionarse directamente con las categorías reconocidas de vulnerabilidades en aplicaciones basadas en modelos de lenguaje, facilitando la priorización de remediación.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-700/60">
                <li className="flex items-center gap-2">✓ Mapeo con <strong className="text-white">LLM01: Prompt Injection</strong></li>
                <li className="flex items-center gap-2">✓ Mapeo con <strong className="text-white">LLM02: Sensitive Information Disclosure</strong></li>
                <li className="flex items-center gap-2">✓ Mapeo con <strong className="text-white">LLM06: Excessive Agency & Tool Abuse</strong></li>
                <li className="flex items-center gap-2">✓ Mapeo con <strong className="text-white">LLM07: System Prompt Leakage</strong></li>
              </ul>
            </div>

            <div className="bg-slate-800/90 hover:bg-slate-800 p-8 rounded-2xl border border-slate-700/80 hover:border-sky-400/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">MATRIZ TÁCTICA</span>
                <span className="bg-blue-500/20 text-blue-300 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-500/30">
                  ALINEACIÓN TÁCTICA
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-white">MITRE ATLAS</h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                Los resultados pueden relacionarse con las tácticas y técnicas catalogadas en la matriz MITRE ATLAS para analizar amenazas específicas contra sistemas de Inteligencia Artificial y Machine Learning.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 pt-3 border-t border-slate-700/60">
                <li className="flex items-center gap-2">✓ Referencia a tácticas de <strong className="text-white">Reconnaissance & Initial Access</strong></li>
                <li className="flex items-center gap-2">✓ Referencia a técnicas de <strong className="text-white">LLM Prompt Injection (AML.T0051)</strong></li>
                <li className="flex items-center gap-2">✓ Referencia a <strong className="text-white">Exfiltration & Impact Analysis</strong></li>
                <li className="flex items-center gap-2">✓ Trazabilidad en informes ejecutivos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Reportes y evidencias */}
      <section id="reportes" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3.5 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-200/60">
            Auditoría y Trazabilidad
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Resultados preparados para análisis y auditoría
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Consolida informes ejecutivos, registros imborrables de actividad y paneles con métricas clave para la toma de decisiones.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shadow-xs animate-float-slow">
              📄
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Reportes técnicos</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Generación de informes exhaustivos con detalle de vulnerabilidades, nivel de riesgo, evidencia capturada y recomendaciones de remediación.
            </p>
            <div className="flex gap-2 text-[10px] font-bold text-slate-700 pt-2">
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">PDF</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">HTML</span>
              <span className="bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">JSON</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shadow-xs animate-float-slow">
              📜
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Historial de evaluaciones</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Consulta comparativa de evaluaciones previas para medir la evolución de la postura de seguridad y verificar parches aplicados.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-lg shadow-xs animate-float-slow">
              🔗
            </div>
            <h3 className="text-base font-extrabold text-slate-900">Registro de auditoría (Audit Logs)</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Trazabilidad completa de acciones de usuarios con firma de hashes criptográficos SHA-256 para cada prueba y evidencia registrada.
            </p>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 rounded-2xl border border-slate-800 shadow-2xl space-y-6 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white">Panel de Resultados — Dashboard de Seguridad</h3>
              <p className="text-xs text-slate-400">Resumen métrico de pruebas y hallazgos consolidado en tiempo real.</p>
            </div>
            <span className="bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs px-3 py-1 rounded font-mono font-bold shadow-xs">
              MÉTRICAS DEL SISTEMA
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 hover:border-sky-500/40 hover:scale-105 transition-all">
              <div className="text-2xl font-black text-sky-400">124</div>
              <div className="text-[11px] text-slate-400 font-medium">Total Evaluaciones</div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 hover:border-red-500/40 hover:scale-105 transition-all">
              <div className="text-2xl font-black text-red-400">18</div>
              <div className="text-[11px] text-slate-400 font-medium">Vulnerabilidades</div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 hover:border-amber-500/40 hover:scale-105 transition-all">
              <div className="text-2xl font-black text-amber-400">5</div>
              <div className="text-[11px] text-slate-400 font-medium">Hallazgos Críticos</div>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 hover:border-emerald-500/40 hover:scale-105 transition-all">
              <div className="text-2xl font-black text-emerald-400">84%</div>
              <div className="text-[11px] text-slate-400 font-medium">Tasa de Mitigación</div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Flujo de funcionamiento */}
      <section id="metodologia" className="bg-slate-100 py-20 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-3.5 py-1 bg-blue-100 text-blue-800 text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-200">
              Paso a Paso
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              ¿Cómo funciona?
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Un flujo claro de 6 pasos para auditar chatbots y servicios LLM de manera segura y metódica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-blue-500/20">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">Registra el objetivo</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                El analista registra el chatbot, aplicación web o API que será evaluada y define el alcance autorizado.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-blue-500/20">
                2
              </span>
              <h3 className="text-sm font-bold text-slate-900">Configura la evaluación</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Selecciona módulos de seguridad, credenciales, roles, canales y parámetros específicos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-blue-500/20">
                3
              </span>
              <h3 className="text-sm font-bold text-slate-900">Descubre la superficie</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                La plataforma identifica endpoints, formularios, APIs, WebSockets, audio y otros canales disponibles.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-blue-500/20">
                4
              </span>
              <h3 className="text-sm font-bold text-slate-900">Ejecuta las pruebas</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Se realizan pruebas controladas de Prompt Injection, jailbreak, fuga de información y otros vectores.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-blue-500/20">
                5
              </span>
              <h3 className="text-sm font-bold text-slate-900">Analiza los resultados</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                El módulo de IA ayuda a interpretar las respuestas obtenidas y detectar comportamientos anómalos.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 hover:border-sky-400/40 hover:-translate-y-1.5 hover:shadow-lg transition-all duration-300 space-y-2 relative">
              <span className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-sky-500 text-white flex items-center justify-center font-bold text-xs mb-3 shadow-md shadow-blue-500/20">
                6
              </span>
              <h3 className="text-sm font-bold text-slate-900">Obtén el reporte</h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Los hallazgos confirmados quedan registrados junto con sus evidencias, severidad y recomendaciones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Sección de planes */}
      <section id="planes" className="py-20 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-3.5 py-1 bg-blue-50 text-blue-700 text-xs font-extrabold rounded-full uppercase tracking-wider border border-blue-200/60">
            Opciones de Adopción
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Planes adaptados a cada equipo
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Escala tus evaluaciones de seguridad de IA desde proyectos individuales hasta operaciones enterprise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-4xl mx-auto">
          {/* Plan Versión Gratuita */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">PLAN GRATUITO</div>
                <h3 className="text-2xl font-extrabold text-slate-900">Versión Gratuita</h3>
                <div className="text-sm font-bold text-blue-600 mt-1">Para comenzar sin costo</div>
              </div>

              <ul className="text-xs text-slate-600 space-y-3 pt-4 border-t border-slate-100">
                <li className="flex items-center gap-2">✓ 1 usuario analista</li>
                <li className="flex items-center gap-2">✓ Registro y escaneo de chatbots</li>
                <li className="flex items-center gap-2">✓ Reconocimiento de superficie de ataque</li>
                <li className="flex items-center gap-2">✓ Pruebas iniciales de Prompt Injection</li>
                <li className="flex items-center gap-2">✓ Pruebas básicas de Jailbreak</li>
                <li className="flex items-center gap-2">✓ Registro de hallazgos y evidencias</li>
                <li className="flex items-center gap-2">✓ Exportación de datos en formato JSON</li>
                <li className="flex items-center gap-2">✓ Acceso al Dashboard evaluativo</li>
              </ul>
            </div>

            <Link
              to="/register"
              className="w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-xs"
            >
              Comenzar Gratis
            </Link>
          </div>

          {/* Plan Versión Pro (Recomendado con Resplandor) */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white p-8 rounded-2xl border-2 border-sky-400 shadow-2xl shadow-sky-500/20 hover:-translate-y-2 hover:shadow-sky-500/30 transition-all duration-300 flex flex-col justify-between space-y-6 relative group">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md tracking-wider animate-pulse">
              Recomendado
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">PLAN PROFESIONAL</div>
                <h3 className="text-2xl font-extrabold text-white">Versión Pro</h3>
                <div className="text-sm font-bold text-sky-300 mt-1">Para equipos de seguridad y auditores</div>
              </div>

              <ul className="text-xs text-slate-300 space-y-2.5 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">✓ Múltiples usuarios y equipos</li>
                <li className="flex items-center gap-2">✓ Gestión de Roles RBAC (Admin, Analista, Auditor)</li>
                <li className="flex items-center gap-2">✓ Escaneos ilimitados de objetivos</li>
                <li className="flex items-center gap-2">✓ Reconocimiento completo HTTP, REST y WebSocket</li>
                <li className="flex items-center gap-2">✓ Módulos ofensivos avanzadas de Prompt Injection</li>
                <li className="flex items-center gap-2">✓ Pruebas de Jailbreak & Fuga de System Prompt</li>
                <li className="flex items-center gap-2">✓ Evaluación de inyecciones fónicas (Audio / STT)</li>
                <li className="flex items-center gap-2 text-sky-300 font-semibold">✓ Dictámenes y análisis asistidos por IA</li>
                <li className="flex items-center gap-2">✓ Clasificación con OWASP LLM Top 10 & MITRE ATLAS</li>
                <li className="flex items-center gap-2">✓ Exportaciones completas de trazabilidad</li>
              </ul>
            </div>

            <Link
              to="/register"
              className="btn-shimmer w-full text-center bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-xs py-3.5 rounded-xl shadow-lg shadow-blue-600/40 transition-all duration-300"
            >
              Elegir Versión Pro
            </Link>
          </div>
        </div>
      </section>

      {/* 10. Sección Seguridad y autorización */}
      <section id="seguridad" className="bg-slate-900 text-white py-16 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="max-w-3xl space-y-3">
            <div className="inline-block px-3 py-1 bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 text-xs font-extrabold rounded-full uppercase tracking-wider shadow-xs">
              Control & Cumplimiento
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              Seguridad ofensiva dentro de un alcance autorizado
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              La plataforma está diseñada para realizar evaluaciones de seguridad sobre aplicaciones, dominios y recursos previamente autorizados. Cada evaluación mantiene trazabilidad del objetivo, configuración, ejecución y resultados obtenidos.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-sky-400/40 hover:-translate-y-1 transition-all space-y-1">
              <div className="text-sky-400 font-bold">Scope Validation</div>
              <div className="text-slate-400 text-[11px]">Control estricto de dominios y recursos autorizados.</div>
            </div>

            <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-sky-400/40 hover:-translate-y-1 transition-all space-y-1">
              <div className="text-sky-400 font-bold">Role Based Access</div>
              <div className="text-slate-400 text-[11px]">Permisos diferenciados por rol operativo.</div>
            </div>

            <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-sky-400/40 hover:-translate-y-1 transition-all space-y-1">
              <div className="text-sky-400 font-bold">Audit Logs</div>
              <div className="text-slate-400 text-[11px]">Registro de actividad y cambios de estado.</div>
            </div>

            <div className="bg-slate-800/80 hover:bg-slate-800 p-4 rounded-xl border border-slate-700 hover:border-sky-400/40 hover:-translate-y-1 transition-all space-y-1">
              <div className="text-sky-400 font-bold">Evidence Tracking</div>
              <div className="text-slate-400 text-[11px]">Hashes SHA-256 para verificación de hallazgos.</div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. CTA final */}
      <section id="cta" className="bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 text-white py-20 px-6 border-t border-slate-800 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Encuentra vulnerabilidades antes de que se conviertan en incidentes
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl mx-auto">
            Centraliza el reconocimiento, las pruebas ofensivas para LLM, el análisis asistido por IA y la generación de reportes en una sola plataforma.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="btn-shimmer bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold text-sm px-7 py-3.5 rounded-xl shadow-xl shadow-blue-600/30 hover:scale-105 transition-all duration-300"
            >
              Crear una evaluación
            </Link>
            <a
              href="#funcionalidades"
              className="bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 hover:border-sky-400/50 font-semibold text-sm px-7 py-3.5 rounded-xl hover:scale-105 transition-all duration-300 backdrop-blur-md"
            >
              Explorar funcionalidades
            </a>
          </div>
        </div>
      </section>

      {/* 12. Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-800/60">
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-sky-400 rounded flex items-center justify-center text-[10px] text-white">AI</div>
              GenAI Security Lab
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Plataforma para la evaluación de seguridad ofensiva autorizada de chatbots web y aplicaciones basadas en LLM.
            </p>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider">Producto</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Funcionalidades</a></li>
              <li><a href="#funcionalidades" className="hover:text-white transition-colors">Seguridad LLM</a></li>
              <li><a href="#reportes" className="hover:text-white transition-colors">Reportes</a></li>
              <li><a href="#planes" className="hover:text-white transition-colors">Planes</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider">Recursos</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#estandares" className="hover:text-white transition-colors">OWASP LLM</a></li>
              <li><a href="#estandares" className="hover:text-white transition-colors">MITRE ATLAS</a></li>
              <li><a href="#metodologia" className="hover:text-white transition-colors">Documentación</a></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="text-white font-bold text-xs uppercase tracking-wider">Plataforma</div>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link to="/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Crear cuenta</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
          <div>© 2026 GenAI Security Lab Enterprise. Todos los derechos reservados.</div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-slate-300 transition-colors">Acceso Seguro</Link>
            <span>•</span>
            <span className="text-sky-400">Versión 2.4 Enterprise</span>
          </div>
        </div>
      </footer>
    </div>
  );
};



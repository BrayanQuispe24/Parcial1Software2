import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const LandingPage: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState([
    { time: '21:04:02', tag: '[RECON]', text: 'Mapeando endpoints HTTP /api/chat y WebSockets wss://voice.banking.local...', type: 'info' },
    { time: '21:04:05', tag: '[PROMPT_INJ]', text: 'Test PI-001 (Direct Override) -> Guardrail Bloqueó Correctamente.', type: 'success' },
    { time: '21:08:15', tag: '[DATA_LEAK]', text: 'DETECTADO HALLAZGO HIGH: System Prompt Disclosed!', type: 'alert' },
    { time: '21:12:04', tag: '[TOOL_ABUSE]', text: 'DETECTADO HALLAZGO CRÍTICO: Unauthorized Function Executed!', type: 'alert' },
    { time: '21:15:30', tag: '[STT_INJ]', text: 'Test STT-012 (Phonetic Audio Payload) -> Sanitizado.', type: 'success' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTime = new Date().toLocaleTimeString();
      const sampleEvents = [
        { time: newTime, tag: '[AGENT_EXEC]', text: 'Test AG-102 (Tool Hijacking) -> Falló validación de roles.', type: 'alert' },
        { time: newTime, tag: '[JAILBREAK]', text: 'Test JB-088 (Dan 11.0 Variant) -> Generación bloqueada por modelo.', type: 'success' },
        { time: newTime, tag: '[AUDIT]', text: 'Hash SHA-256 generado para evidencia EVID-2026-904.', type: 'info' },
      ];
      const randomEvent = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      setConsoleLogs((prev) => [...prev.slice(1), randomEvent]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans overflow-x-hidden">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 bg-slate-900 text-white border-b border-slate-800 z-50 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-blue-700 rounded flex items-center justify-center font-extrabold text-xs text-white">
              AI
            </div>
            <span className="font-extrabold text-sm sm:text-base tracking-tight">GenAI Security Lab</span>
            <span className="text-[10px] text-sky-400 font-semibold hidden sm:inline ml-1">v2.4 Enterprise</span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-400">
            <a href="#problema" className="hover:text-white transition">Problema</a>
            <a href="#hallazgos" className="hover:text-white transition">Matriz Hallazgos</a>
          </nav>

          <div className="hidden sm:flex items-center gap-2.5">
            <button
              className="bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-md px-2.5 py-1 text-xs border border-slate-700 transition"
              onClick={() => setLanguage(language === 'ES' ? 'EN' : 'ES')}
              title="Cambiar Idioma / Change Language"
            >
              {language === 'ES' ? '🇪🇸 ES' : '🇺🇸 EN'}
            </button>

            <span className="bg-amber-100 text-amber-900 font-bold text-[10px] px-2 py-0.5 rounded border border-amber-200 hidden lg:inline-block">
              SCOPE: LAB
            </span>
            <Link
              to="/login"
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-md transition shadow-xs"
            >
              🛡️ {language === 'ES' ? 'Acceder' : 'Login'}
            </Link>
            <Link
              to="/register"
              className="bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 font-semibold text-xs px-3 py-1.5 rounded-md transition"
            >
              {language === 'ES' ? 'Registrarse' : 'Register'}
            </Link>
          </div>

          <button
            className="sm:hidden text-slate-300 hover:text-white p-1"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d={mobileNavOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileNavOpen && (
          <div className="sm:hidden pt-3 pb-2 space-y-2 border-t border-slate-800 mt-3">
            <div className="flex flex-col gap-2">
              <Link
                to="/login"
                className="bg-blue-800 hover:bg-blue-700 text-white text-center font-bold text-xs px-3.5 py-2 rounded-md transition"
                onClick={() => setMobileNavOpen(false)}
              >
                🛡️ Acceder a la Plataforma
              </Link>
              <Link
                to="/register"
                className="bg-white hover:bg-slate-100 text-slate-900 text-center font-semibold text-xs px-3 py-2 rounded-md transition"
                onClick={() => setMobileNavOpen(false)}
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-400/30 rounded-full text-xs font-bold text-sky-400">
              <span>SISTEMA BASADO EN IA</span> • <span>Seguridad en Chatbots & RAG</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Detección y Explotación Controlada de Vulnerabilidades en{' '}
              <span className="text-sky-400">Modelos Generativos Web</span>.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Plataforma enterprise para la evaluación ofensiva autorizada de chatbots web, APIs, agentes y canales de voz. Identifica Prompt Injection, Jailbreak, Fuga de Información y Abuso de Herramientas antes de salir a producción.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/login"
                className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-lg hover:shadow-blue-800/30 transition"
              >
                Acceder a la Plataforma ➔
              </Link>
              <a
                href="#hallazgos"
                className="bg-transparent hover:bg-slate-800 text-white border border-slate-700 font-semibold text-sm px-5 py-2.5 rounded-lg transition"
              >
                Ver Matriz de Hallazgos
              </a>
            </div>
            <div className="flex items-center gap-6 text-xs text-slate-500 pt-4 border-t border-slate-800">
              <div>✓ <strong className="text-slate-300">OWASP LLM Top 10</strong> Mapeado</div>
              <div>✓ <strong className="text-slate-300">MITRE ATLAS</strong> Tácticas</div>
              <div>✓ <strong className="text-slate-300">Hashes SHA-256</strong> en Evidencias</div>
            </div>
          </div>

          {/* Console Box Live Stream */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl font-mono text-xs text-slate-300">
            <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400 font-semibold">
              <span>LIVE EXECUTION STREAM — AST-2026-0092</span>
              <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                RUNNING (68%)
              </span>
            </div>
            <div className="p-4 max-h-64 overflow-y-auto space-y-2">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed">
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
          </div>
        </div>
      </section>

      {/* 3. Features & Problem Section */}
      <section id="problema" className="py-16 px-6 max-w-7xl mx-auto space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            El Problema: La Lógica Difusa de los LLMs no se Evalúa con Scanners Tradicionales
          </h2>
          <p className="text-slate-600 text-xs leading-relaxed">
            Los DAST convencionales no comprenden semántica, inyecciones de contexto ni abuso de herramientas en agentes de IA.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900">💉 Prompt Injection Directo e Indirecto</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Ataques que sobreescriben las instrucciones del System Prompt para forzar comportamientos no autorizados.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900">🛠️ Abuso de Funciones / Agentes</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Explotación de herramientas RAG y Function Calling sin validación adecuada de permisos y contextos de usuario.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <h3 className="text-sm font-bold text-slate-900">🎙️ Inyección Sonora en Speech-to-Text</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Vulnerabilidades fónicas transmitidas por voz que manipulan la transcripción para ejecutar comandos maliciosos.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Live Findings Matrix Preview */}
      <section id="hallazgos" className="bg-white py-16 px-6 border-t border-slate-200">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">Matriz de Hallazgos y Vulnerabilidades Detectables</h2>
            <p className="text-slate-500 text-xs">
              Listado real de vectores probados automáticamente por el motor GenAI Security Lab.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto w-full shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">ID Hallazgo</th>
                  <th className="px-4 py-3">Categoría OWASP LLM</th>
                  <th className="px-4 py-3">Vector de Ataque</th>
                  <th className="px-4 py-3">Severidad</th>
                  <th className="px-4 py-3">Estado Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold">LLM-01-2026</td>
                  <td className="px-4 py-3">LLM01: Direct Prompt Injection</td>
                  <td className="px-4 py-3">System Prompt Override via Delimitadores Markdown</td>
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
                  <td className="px-4 py-3 font-mono font-bold">LLM-02-2026</td>
                  <td className="px-4 py-3">LLM06: Sensitive Information Disclosure</td>
                  <td className="px-4 py-3">Fuga de credenciales API en respuesta de contexto RAG</td>
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
                <tr className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-bold">LLM-07-2026</td>
                  <td className="px-4 py-3">LLM07: System Prompt Leakage</td>
                  <td className="px-4 py-3">Extracción de instrucciones base mediante roleplay</td>
                  <td className="px-4 py-3">
                    <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">
                      MEDIUM
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                      MITIGADO
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-6 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div>© 2026 GenAI Security Lab Enterprise. Todos los derechos reservados.</div>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-white transition">Iniciar Sesión</Link>
            <Link to="/register" className="hover:text-white transition">Crear Cuenta</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'PENTESTER',
    accepted_terms: false,
  });
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.accepted_terms) {
      setError("Debe aceptar los Términos y Condiciones para continuar.");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      setSuccessMessage("✓ Registro exitoso. Tu cuenta de Pentester se encuentra en estado PENDIENTE DE ACTIVACIÓN. El Administrador del Sistema revisará y activará tu cuenta.");
      setTimeout(() => {
        navigate('/login');
      }, 3500);
    } catch (err: any) {
      console.error('Error en registro:', err);
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const messages = Object.entries(data)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
          .join(' | ');
        setError(messages || 'Error en los datos enviados.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('No se pudo conectar con el servidor Backend (Django). Verifica que esté en ejecución.');
      } else {
        setError(err.message || 'Error al registrar usuario. Comprueba tus datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-3 sm:p-4 font-sans text-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl p-5 sm:p-8 shadow-2xl border border-slate-700 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-extrabold text-sm text-white mx-auto shadow-md">
            GV
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Registro de Pentester</h2>
          <p className="text-slate-500 text-xs">Crea tu cuenta de evaluador en GenVuln AI (Sujeta a Activación por el Administrador del Sistema)</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium leading-relaxed">
            ⚠️ {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium leading-relaxed">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="first_name" className="block font-semibold text-slate-700 text-xs">
                Nombre
              </label>
              <input
                id="first_name"
                name="first_name"
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition"
                placeholder="ej: Andrés"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="last_name" className="block font-semibold text-slate-700 text-xs">
                Apellido
              </label>
              <input
                id="last_name"
                name="last_name"
                type="text"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition"
                placeholder="ej: Security"
                value={formData.last_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="username" className="block font-semibold text-slate-700 text-xs">
              Nombre de Usuario
            </label>
            <input
              id="username"
              name="username"
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition"
              placeholder="ej: andres_pentester"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="block font-semibold text-slate-700 text-xs">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition"
              placeholder="andres@empresa.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block font-semibold text-slate-700 text-xs">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition"
              placeholder="•••••••• (mínimo 6 caracteres)"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Checkbox Términos y Condiciones */}
          <div className="pt-2">
            <label className="flex items-start gap-2.5 cursor-pointer text-slate-700 text-xs">
              <input
                type="checkbox"
                name="accepted_terms"
                className="mt-0.5 rounded border-slate-300 text-blue-800 focus:ring-blue-600"
                checked={formData.accepted_terms}
                onChange={handleChange}
                required
              />
              <span>
                He leído y acepto los{' '}
                <button
                  type="button"
                  className="text-blue-800 font-bold underline hover:text-blue-900"
                  onClick={() => setShowTermsModal(true)}
                >
                  Términos y Condiciones del Sistema GenAI Security Lab
                </button>
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-md hover:shadow-blue-800/25 mt-3"
            disabled={loading}
          >
            {loading ? 'Registrando...' : 'Solicitar Registro de Pentester ➔'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 space-y-2">
          <div>
            ¿Ya tienes cuenta activa?{' '}
            <Link to="/login" className="text-blue-800 font-semibold hover:underline">
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Términos y Condiciones */}
      {showTermsModal && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowTermsModal(false)}
        >
          <div
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">📄 Términos y Condiciones del Sistema GenAI Security Lab</h3>
              <button
                className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg text-xs transition"
                onClick={() => setShowTermsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="p-6 text-xs text-slate-700 space-y-3 max-h-80 overflow-y-auto font-sans leading-relaxed">
              <p className="font-bold text-slate-900">1. USO AUTORIZADO Y EVALUACIÓN OFENSIVA:</p>
              <p>La plataforma GenAI Security Lab está diseñada exclusivamente para la evaluación de seguridad ofensiva autorizada en chatbots, LLMs y sistemas RAG. El usuario Pentester se compromete a realizar pruebas únicamente en activos para los cuales cuente con autorización explícita y por escrito.</p>

              <p className="font-bold text-slate-900">2. RESPONSABILIDAD SOBRE PAYLOADS Y EVIDENCIAS:</p>
              <p>El Pentester es plenamente responsable del uso de los comandos, pruebas de Prompt Injection, inyecciones de voz y explotación de herramientas. Toda evidencia generada cuenta con firmas hash SHA-256 e identificadores de auditoría.</p>

              <p className="font-bold text-slate-900">3. CONFIDENCIALIDAD Y MANEJO DE DATOS:</p>
              <p>Queda estrictamente prohibida la divulgación de credenciales, tokens JWT, prompts de sistema o datos sensibles extraídos durante los procesos de evaluación.</p>

              <p className="font-bold text-slate-900">4. ACTIVACIÓN POR EL ADMINISTRADOR DEL SISTEMA:</p>
              <p>Toda cuenta de Pentester registrada permanecerá en modo pendiente hasta ser revisada y activada por el Administrador del Sistema. Una vez activada, se enviará una copia completa de estos términos a su correo electrónico.</p>
            </div>
            <div className="flex justify-end px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-lg text-xs transition"
                onClick={() => {
                  setFormData((prev) => ({ ...prev, accepted_terms: true }));
                  setShowTermsModal(false);
                }}
              >
                Entendido y Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

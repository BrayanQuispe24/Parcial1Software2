import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login({ username, password });
      navigate('/app/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          'Error de autenticación. Verifica tus credenciales o el estado de la base de datos.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-3 sm:p-4 font-sans text-xs">
      <div className="bg-white w-full max-w-md rounded-2xl p-5 sm:p-8 shadow-2xl border border-slate-700 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center font-extrabold text-sm text-white mx-auto shadow-md">
            AI
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">GenAI Security Lab</h2>
          <p className="text-slate-500 text-xs">Plataforma de Evaluación de Seguridad en IA</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs font-medium">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="username" className="block font-semibold text-slate-700 text-xs">
              Nombre de Usuario o Correo Electrónico
            </label>
            <input
              id="username"
              type="text"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition"
              placeholder="ej: brayan26 o correo@ejemplo.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password font-semibold text-slate-700 text-xs">Contraseña</label>
            <input
              id="password"
              type="password"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-900 outline-none focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-600/10 transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition shadow-md hover:shadow-blue-800/25 mt-2"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar a la Plataforma ➔'}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 space-y-2">
          <div>
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="text-blue-800 font-semibold hover:underline">
              Regístrate aquí
            </Link>
          </div>
          <div>
            <Link to="/" className="text-slate-400 hover:text-slate-600 transition">
              ← Volver a la Landing Page
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import type { User } from '../../../context/AuthContext';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  initialData?: User | null;
  currentUserRole?: string;
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  currentUserRole,
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'AUDITOR',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        username: initialData.username || '',
        email: initialData.email || '',
        password: '',
        first_name: initialData.first_name || '',
        last_name: initialData.last_name || '',
        role: initialData.role || 'AUDITOR',
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: currentUserRole === 'SYSTEM_ADMIN' ? 'PENTESTER' : 'AUDITOR',
      });
    }
    setError(null);
  }, [initialData, isOpen, currentUserRole]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Ocurrió un error al guardar los datos del usuario.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">
            {initialData ? `Editar Usuario #${initialData.id}` : '➕ Registrar Usuario Auditor'}
          </h3>
          <button
            className="text-slate-400 hover:text-slate-700 bg-slate-100 p-1.5 rounded-lg text-xs transition"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col justify-between">
          <div className="p-6 space-y-4 text-xs">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium">
                ⚠️ {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Nombre</label>
                <input
                  type="text"
                  name="first_name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Apellido</label>
                <input
                  type="text"
                  name="last_name"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Nombre de Usuario</label>
              <input
                type="text"
                name="username"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Correo Electrónico</label>
              <input
                type="email"
                name="email"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">
                Contraseña {initialData && '(dejar en blanco para mantener actual)'}
              </label>
              <input
                type="password"
                name="password"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                value={formData.password}
                onChange={handleChange}
                required={!initialData}
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Rol asignado</label>
              {currentUserRole === 'SYSTEM_ADMIN' ? (
                <select
                  name="role"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-600 focus:bg-white transition"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="PENTESTER">Pentester / Evaluador</option>
                  <option value="AUDITOR">Auditor</option>
                  <option value="SYSTEM_ADMIN">Administrador del Sistema</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-600 outline-none"
                  value="Auditor (Creación exclusiva por el Pentester)"
                  disabled
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 px-6 py-4 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold px-4 py-2 rounded-lg text-xs transition"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-sm"
              disabled={loading}
            >
              {loading ? 'Guardando...' : initialData ? 'Guardar Cambios' : 'Crear Usuario Auditor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

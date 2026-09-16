import React from 'react';
import { useAuth } from '../context/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-3 py-1 rounded-full font-bold">Administrador del Sistema</span>;
      case 'PENTESTER':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-3 py-1 rounded-full font-bold">Pentester / Evaluador</span>;
      case 'AUDITOR':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-3 py-1 rounded-full font-bold">Auditor de Seguridad</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full font-bold">{role || 'Usuario'}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Mi Perfil de Usuario</h1>
        <p className="text-slate-500 text-xs mt-0.5">
          Información personal, rol asignado y estado de la cuenta en GenAI Security Lab.
        </p>
      </div>

      {/* Main Profile Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-slate-200">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-700 to-blue-900 text-white rounded-full flex items-center justify-center font-extrabold text-xl shadow-md">
            {user?.first_name ? user.first_name.substring(0, 2).toUpperCase() : user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : user?.username}
            </h2>
            <p className="text-slate-500 text-xs">{user?.email}</p>
            <div className="pt-1 flex items-center gap-2">
              {getRoleBadge(user?.role)}
              {user?.is_enabled !== false ? (
                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  ● Cuenta Habilitada
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  ● Pendiente de Activación
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Información de la Cuenta</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">ID de Usuario:</span>
                <span className="font-mono font-bold text-slate-900">#{user?.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nombre de Usuario:</span>
                <span className="font-semibold text-slate-900">{user?.username}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Correo Registrado:</span>
                <span className="font-medium text-slate-900">{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Permisos y Términos</h3>
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Rol del Sistema:</span>
                <span className="font-semibold text-slate-900">{user?.role || 'Pentester'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Términos y Condiciones:</span>
                <span className="text-emerald-700 font-bold">✓ Aceptados</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Activación del Administrador:</span>
                <span className="text-emerald-700 font-bold">✓ Confirmada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Info Banner */}
        <div className="p-4 bg-slate-900 text-slate-300 rounded-xl border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-white">
            <span>🛡️ Seguridad y Control de Accesos</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            Tu cuenta cuenta con firmas hash de auditoría para todas las acciones ejecutadas en el sistema. Para modificar tu contraseña o solicitar cambios de rol, contacta al Administrador del Sistema en <strong className="text-sky-400">brayansabinoquispearce2021@gmail.com</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

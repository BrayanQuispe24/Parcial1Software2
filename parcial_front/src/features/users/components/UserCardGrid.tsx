import React from 'react';
import type { User } from '../../../context/AuthContext';

interface UserCardGridProps {
  users: User[];
  loading: boolean;
  currentUserRole?: string;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onEnableUser?: (userId: number) => void;
}

export const UserCardGrid: React.FC<UserCardGridProps> = ({
  users,
  loading,
  currentUserRole,
  onEditUser,
  onDeleteUser,
  onEnableUser,
}) => {
  if (loading) {
    return (
      <div className="p-10 text-center text-slate-400 text-xs">
        ⏳ Cargando lista de usuarios desde la API...
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400 text-xs">
        No se encontraron usuarios en la plataforma.
      </div>
    );
  }

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'SYSTEM_ADMIN':
        return (
          <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0">
            Admin Sistema
          </span>
        );
      case 'PENTESTER':
        return (
          <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0">
            Pentester
          </span>
        );
      case 'AUDITOR':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0">
            Auditor
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shrink-0">
            {role || 'Usuario'}
          </span>
        );
    }
  };

  const getInitials = (name?: string, username?: string) => {
    if (name && name.length >= 2) return name.substring(0, 2).toUpperCase();
    if (username && username.length >= 2) return username.substring(0, 2).toUpperCase();
    return 'US';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 p-3 sm:p-4 w-full max-w-full">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-white border border-slate-200 hover:border-blue-400/80 rounded-xl p-3.5 sm:p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-3 min-w-0 max-w-full overflow-hidden"
        >
          {/* Header Info */}
          <div className="flex items-start justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-xs shrink-0 ${
                  user.role === 'SYSTEM_ADMIN'
                    ? 'bg-gradient-to-br from-purple-600 to-purple-800'
                    : user.role === 'PENTESTER'
                    ? 'bg-gradient-to-br from-blue-600 to-blue-800'
                    : 'bg-gradient-to-br from-amber-500 to-amber-700'
                }`}
              >
                {getInitials(user.first_name, user.username)}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight truncate" title={user.first_name || user.username}>
                  {user.first_name ? `${user.first_name} ${user.last_name || ''}` : user.username}
                </h4>
                <p className="text-slate-500 text-[11px] mt-0.5 truncate" title={`@${user.username}`}>
                  @{user.username}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center">
              {getRoleBadge(user.role)}
            </div>
          </div>

          {/* Details Box */}
          <div className="space-y-1.5 text-xs bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-100 min-w-0">
            <div className="flex items-center justify-between text-slate-600 gap-2 min-w-0">
              <span className="text-slate-400 text-[11px] shrink-0">✉️ Correo:</span>
              <span className="font-medium text-slate-800 truncate text-[11px] text-right" title={user.email}>
                {user.email}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600 gap-2 min-w-0">
              <span className="text-slate-400 text-[11px] shrink-0">🆔 ID Usuario:</span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">#{user.id}</span>
            </div>
            <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 gap-2 min-w-0">
              <span className="text-slate-400 text-[11px] shrink-0">Estado:</span>
              {user.is_enabled !== false ? (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                  ● Habilitado
                </span>
              ) : (
                <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                  ● Pendiente Activación
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 min-w-0">
            {currentUserRole === 'SYSTEM_ADMIN' && !user.is_enabled && onEnableUser && (
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-bold transition shadow-xs flex-1 text-center shrink-0"
                onClick={() => onEnableUser(user.id)}
              >
                ✓ Habilitar
              </button>
            )}
            <button
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition flex-1 text-center sm:flex-initial"
              onClick={() => onEditUser(user)}
            >
              ✏️ Editar
            </button>
            <button
              className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition flex-1 text-center sm:flex-initial"
              onClick={() => onDeleteUser(user.id)}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

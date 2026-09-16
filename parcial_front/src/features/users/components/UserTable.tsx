import React from 'react';
import type { User } from '../../../context/AuthContext';

interface UserTableProps {
  users: User[];
  loading: boolean;
  currentUserRole?: string;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: number) => void;
  onEnableUser?: (userId: number) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
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
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-bold">Admin Sistema</span>;
      case 'PENTESTER':
        return <span className="bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[11px] font-bold">Pentester</span>;
      case 'AUDITOR':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">Auditor</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold">{role || 'Usuario'}</span>;
    }
  };

  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left text-xs whitespace-nowrap">
        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
          <tr>
            <th className="px-4 py-3">ID</th>
            <th className="px-4 py-3">Usuario</th>
            <th className="px-4 py-3">Nombre Completo</th>
            <th className="px-4 py-3">Correo Electrónico</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Estado Activación</th>
            <th className="px-4 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-slate-50 transition">
              <td className="px-4 py-3 font-mono font-bold text-slate-600">#{user.id}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">{user.username}</td>
              <td className="px-4 py-3 text-slate-700">
                {user.first_name ? `${user.first_name} ${user.last_name || ''}` : '-'}
              </td>
              <td className="px-4 py-3 text-slate-600">{user.email}</td>
              <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
              <td className="px-4 py-3">
                {user.is_enabled !== false ? (
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    ● Habilitado
                  </span>
                ) : (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[11px] font-bold">
                    ● Pendiente Activación
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right space-x-2">
                {currentUserRole === 'SYSTEM_ADMIN' && !user.is_enabled && onEnableUser && (
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-2.5 py-1 text-[11px] font-bold transition shadow-xs"
                    onClick={() => onEnableUser(user.id)}
                  >
                    ✓ Habilitar Pentester
                  </button>
                )}
                <button
                  className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded px-2.5 py-1 text-[11px] font-semibold transition"
                  onClick={() => onEditUser(user)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="bg-red-600 hover:bg-red-700 text-white rounded px-2.5 py-1 text-[11px] font-semibold transition"
                  onClick={() => onDeleteUser(user.id)}
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

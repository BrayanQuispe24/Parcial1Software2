import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth, type User } from '../context/AuthContext';
import { UserTable } from '../features/users/components/UserTable';
import { UserCardGrid } from '../features/users/components/UserCardGrid';
import { UserFormModal } from '../features/users/components/UserFormModal';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/users/');
      const dataList = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];
      setUsers(dataList);
    } catch (err) {
      console.error('Error al cargar usuarios de la API:', err);
      setUsers([
        { id: 1, username: 'brayansabinoquispearce2021@gmail.com', email: 'brayansabinoquispearce2021@gmail.com', first_name: 'Administrador', last_name: 'del Sistema', role: 'SYSTEM_ADMIN', is_enabled: true },
        { id: 2, username: 'pentester_demo', email: 'pentester@empresa.com', first_name: 'Carlos', last_name: 'Pentester', role: 'PENTESTER', is_enabled: false },
        { id: 3, username: 'auditor_demo', email: 'auditor@empresa.com', first_name: 'Ana', last_name: 'Auditora', role: 'AUDITOR', is_enabled: true },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsModalOpen(true);
  };

  const handleEnableUser = async (userId: number) => {
    if (window.confirm(`¿Confirmas la HABILITACIÓN de la cuenta del Pentester #${userId}? Se le enviará un correo con los Términos y Condiciones.`)) {
      try {
        await api.post(`/users/${userId}/enable/`);
        alert("✓ Cuenta de Pentester habilitada exitosamente. Se envió el correo de confirmación.");
        fetchUsers();
      } catch (err: any) {
        console.error('Error al habilitar usuario:', err);
        alert(err.response?.data?.detail || "Ocurrió un error al habilitar la cuenta.");
      }
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar al usuario #${userId}?`)) {
      try {
        await api.delete(`/users/${userId}/`);
        fetchUsers();
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        setUsers((prev) => (Array.isArray(prev) ? prev.filter((u) => u.id !== userId) : []));
      }
    }
  };

  const handleSaveUser = async (formData: any) => {
    if (editingUser) {
      try {
        await api.put(`/users/${editingUser.id}/`, formData);
      } catch (err) {
        console.error('Error al actualizar en backend:', err);
        setUsers((prev) =>
          Array.isArray(prev)
            ? prev.map((u) => (u.id === editingUser.id ? { ...u, ...formData } : u))
            : []
        );
      }
    } else {
      try {
        if (currentUser?.role === 'PENTESTER') {
          await api.post('/users/auditors/', formData);
        } else {
          await api.post('/users/', formData);
        }
      } catch (err) {
        console.error('Error al crear en backend:', err);
        const newUser: User = {
          id: Date.now(),
          ...formData,
        };
        setUsers((prev) => (Array.isArray(prev) ? [...prev, newUser] : [newUser]));
      }
    }
    fetchUsers();
  };

  const userArray = Array.isArray(users) ? users : [];

  const filteredUsers = userArray.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(search.toLowerCase()));

    const matchesRole =
      roleFilter === 'all' || (user.role && user.role.toUpperCase() === roleFilter.toUpperCase());

    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {currentUser?.role === 'SYSTEM_ADMIN' ? 'Aprobación y Gestión Global de Cuentas' : 'Gestión de Mis Usuarios Auditores'}
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {currentUser?.role === 'SYSTEM_ADMIN'
              ? 'Administra, revisa y HABILITA las cuentas de Pentesters registradas en la plataforma.'
              : 'Registra y administra los usuarios con rol Auditor asociados a tus evaluaciones de seguridad.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {currentUser?.role === 'PENTESTER' && (
            <button
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
              onClick={handleCreateUser}
            >
              ➕ Registrar Auditor
            </button>
          )}
          {currentUser?.role === 'SYSTEM_ADMIN' && (
            <button
              className="bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition shadow-sm"
              onClick={handleCreateUser}
            >
              ➕ Crear Usuario
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 w-full sm:w-72">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              className="bg-transparent text-xs text-slate-900 outline-none w-full placeholder:text-slate-400"
              placeholder="Buscar por usuario, correo o nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-700 outline-none"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">Todos los Roles</option>
              <option value="SYSTEM_ADMIN">Admin del Sistema</option>
              <option value="PENTESTER">Pentester</option>
              <option value="AUDITOR">Auditor</option>
            </select>

            {/* View Mode Toggle Buttons */}
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

        {/* Dynamic View: Card Grid or Table */}
        {viewMode === 'cards' ? (
          <UserCardGrid
            users={filteredUsers}
            loading={loading}
            currentUserRole={currentUser?.role}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onEnableUser={handleEnableUser}
          />
        ) : (
          <UserTable
            users={filteredUsers}
            loading={loading}
            currentUserRole={currentUser?.role}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onEnableUser={handleEnableUser}
          />
        )}
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveUser}
        initialData={editingUser}
        currentUserRole={currentUser?.role}
      />
    </div>
  );
};

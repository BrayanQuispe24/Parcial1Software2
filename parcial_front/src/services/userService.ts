import { api } from './api';
import type { User } from '../context/AuthContext';

export interface CreateAuditorPayload {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface UserStats {
  total_users: number;
  pentesters_enabled: number;
  pentesters_pending: number;
  total_auditors: number;
  recent_pentesters: User[];
}

export const userService = {
  // Listar usuarios (para System Admin o Pentester)
  getUsers: async (): Promise<User[]> => {
    const response = await api.get<User[]>('/users/');
    return response.data;
  },

  // Crear usuario Auditor (por Pentester)
  createAuditor: async (payload: CreateAuditorPayload) => {
    const response = await api.post('/users/auditors/', payload);
    return response.data;
  },

  // Habilitar/Activar cuenta de Pentester (exclusivo System Admin)
  enableUser: async (userId: number) => {
    const response = await api.post(`/users/${userId}/enable/`);
    return response.data;
  },

  // Obtener estadísticas globales de usuarios (exclusivo System Admin)
  getUserStats: async (): Promise<UserStats> => {
    const response = await api.get<UserStats>('/users/stats/');
    return response.data;
  },
};

import { api } from './api';

export interface Software {
  id: number;
  name: string;
  endpoint: string;
  protocol: 'HTTP/HTTPS' | 'WebSocket' | 'STT/Audio';
  llm_provider: string;
  system_prompt_sample?: string;
  status: 'Activo' | 'Inactivo' | 'Mapeando';
  user?: number;
  user_username?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateSoftwareInput {
  name: string;
  endpoint: string;
  protocol: 'HTTP/HTTPS' | 'WebSocket' | 'STT/Audio';
  llm_provider: string;
  system_prompt_sample?: string;
  status?: 'Activo' | 'Inactivo' | 'Mapeando';
}

export const softwareService = {
  async getSoftwares(): Promise<Software[]> {
    const response = await api.get('/software/');
    // Manejar respuesta paginada o lista directa de DRF
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data.results || [];
  },

  async createSoftware(input: CreateSoftwareInput): Promise<Software> {
    const response = await api.post('/software/', input);
    return response.data;
  },

  async updateSoftware(id: number, input: Partial<CreateSoftwareInput>): Promise<Software> {
    const response = await api.patch(`/software/${id}/`, input);
    return response.data;
  },

  async deleteSoftware(id: number): Promise<void> {
    await api.delete(`/software/${id}/`);
  },
};

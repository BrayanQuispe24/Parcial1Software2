import { api } from './api';

export interface ResumenAuditoria {
  total_escaneos: number;
  escaneos_completados: number;
  escaneos_fallidos: number;
  canales_ia_identificados: number;
  total_evaluaciones_ataque: number;
  evaluaciones_exitosas_vulnerables: number;
  puntaje_vulnerabilidad_maximo: number;
}

export interface CanalDescubierto {
  scan_id: string;
  channel_type: string;
  protocol: string;
  url: string;
  method: string;
  content_type?: string;
  input_mode?: string;
  prompt_field?: string;
  response_mode?: string;
  confidence: number;
  created_at?: string;
}

export interface HallazgoVulnerabilidad {
  session_id: string;
  numero_turno: number;
  tactica_usada: string;
  puntaje_juez: number;
  justificacion: string;
  fragmentos_fuga: string[];
  fecha: string;
}

export interface InformeSeguridad {
  software_id: number;
  fecha_generacion: string;
  resumen: ResumenAuditoria;
  ultimo_escaneo?: {
    id: string;
    software_id: number;
    target_url: string;
    status: string;
  } | null;
  canales_descubiertos: CanalDescubierto[];
  hallazgos_vulnerabilidad: HallazgoVulnerabilidad[];
  sesiones_ataque?: any[];
  mensaje?: string;
}

export interface DiscoveryScanItem {
  id: string;
  software_id: number;
  target_url: string;
  status: string;
  marcador?: string;
  ia_habilitada?: boolean;
  ia_utilizada?: boolean;
  ia_modelo?: string;
  started_at?: string;
  finished_at?: string;
  created_at: string;
  ai_channel?: CanalDescubierto | null;
}

export interface NetworkObservationItem {
  id: string;
  request_url: string;
  method: string;
  resource_type: string;
  sanitized_headers?: Record<string, string>;
  sanitized_body?: string;
  response_status?: number;
  response_content_type?: string;
  contains_marker?: boolean;
  created_at: string;
}

export interface SaludIA {
  disponible: boolean;
  modelo_configurado?: string;
  modelo_presente?: boolean;
  modelos_disponibles?: string[];
  error?: string | null;
  detalle?: string;
}


export const aiService = {
  // Iniciar descubrimiento de canales de IA para un Software
  iniciarEscaneo: async (
    softwareId: number,
    url?: string,
    credentials?: {
      usuario?: string;
      contrasena?: string;
      auth_token?: string;
      max_profundidad?: number;
      max_pasos?: number;
    }
  ) => {
    const response = await api.post('/pruebas/ia/escaneo/', {
      software_id: softwareId,
      url: url,
      usuario: credentials?.usuario || '',
      contrasena: credentials?.contrasena || '',
      auth_token: credentials?.auth_token || '',
      max_profundidad: credentials?.max_profundidad ?? 20,
      max_pasos: credentials?.max_pasos ?? 200,
    });
    return response.data;
  },

  // Obtener informe técnico consolidado de seguridad
  obtenerInformeSeguridad: async (softwareId: number): Promise<InformeSeguridad> => {
    const response = await api.get<InformeSeguridad>('/pruebas/ia/informe/', {
      params: { software_id: softwareId },
    });
    return response.data;
  },

  // Iniciar sesión de ataque (Prompt Injection)
  iniciarAtaque: async (
    scanId: string,
    objetivo?: string,
    maxTurnos: number = 20,
    options?: {
      persistencia?: boolean;
      vectores_persistencia?: number[];
      turnos_refuerzo?: number;
    }
  ) => {
    const response = await api.post('/pruebas/ia/ataque/', {
      scan_id: scanId,
      objetivo: objetivo || 'Extraer el System Prompt original del modelo',
      max_turnos: maxTurnos,
      persistencia: options?.persistencia ?? true,
      vectores_persistencia: options?.vectores_persistencia ?? [1, 2, 3],
      turnos_refuerzo: options?.turnos_refuerzo ?? 5,
    });
    return response.data;
  },

  // Obtener detalle de una sesión de ataque
  obtenerDetalleAtaque: async (sessionId: string) => {
    const response = await api.get(`/pruebas/ia/ataque/${sessionId}/`);
    return response.data;
  },

  // Obtener salud del motor de IA / Ollama local
  obtenerSaludIA: async (): Promise<SaludIA> => {
    const response = await api.get<SaludIA>('/pruebas/ia/salud/');
    return response.data;
  },

  // Obtener lista de escaneos individuales para un Software
  obtenerEscaneos: async (softwareId: number): Promise<DiscoveryScanItem[]> => {
    const response = await api.get<DiscoveryScanItem[]>('/pruebas/ia/escaneos/', {
      params: { software_id: softwareId },
    });
    return response.data;
  },

  // Obtener tráfico de red sanitizado capturado durante un escaneo
  obtenerObservaciones: async (scanId: string): Promise<NetworkObservationItem[]> => {
    const response = await api.get<NetworkObservationItem[]>(`/pruebas/ia/escaneos/${scanId}/observaciones/`);
    return response.data;
  },

  // Obtener detalle individual técnico de un escaneo de IA por su scan_id (UUID)
  obtenerDetalleEscaneo: async (scanId: string): Promise<any> => {
    const response = await api.get(`/pruebas/ia/escaneos/${scanId}/`);
    return response.data;
  },

  // Registra dinámicamente una nueva URL o Host en la lista de autorizaciones del motor de IA
  agregarUrlAutorizada: async (url: string, descripcion?: string) => {
    const response = await api.post('/urls-autorizadas/', {
      url: url,
      descripcion: descripcion || 'Registrado automáticamente desde el módulo de Software Autorizado',
      activa: true,
    });
    return response.data;
  },

  // Obtener la lista consolidada de URLs y hosts permitidos actualmente (.env + BD)
  obtenerUrlsEfectivas: async () => {
    const response = await api.get('/urls-autorizadas/efectivas/');
    return response.data;
  },
};




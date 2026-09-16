import { api } from './api';

export interface Tarifa {
  id: number;
  nombre: string;
  monto: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface Plan {
  id: number;
  nombre: string;
  duracion_dias: number;
  tarifa: number;
  tarifa_nombre?: string;
  tarifa_monto?: string | number;
  created_at?: string;
  updated_at?: string;
}

export interface BoletaSuscripcion {
  id: number;
  numero_boleta: string;
  fecha_inicio: string;
  fecha_fin: string;
  pentester?: number;
  pentester_username?: string;
  pentester_email?: string;
  plan: number;
  plan_nombre?: string;
  plan_duracion_dias?: number;
  plan_monto?: string | number;
  created_at?: string;
  updated_at?: string;
}

export const monetizacionService = {
  // --- TARIFAS ---
  async getTarifas(): Promise<Tarifa[]> {
    const res = await api.get('/tarifas/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  async createTarifa(input: { nombre: string; monto: number }): Promise<Tarifa> {
    const res = await api.post('/tarifas/', input);
    return res.data;
  },

  async deleteTarifa(id: number): Promise<void> {
    await api.delete(`/tarifas/${id}/`);
  },

  // --- PLANES ---
  async getPlanes(): Promise<Plan[]> {
    const res = await api.get('/planes/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  async createPlan(input: { nombre: string; duracion_dias: number; tarifa: number }): Promise<Plan> {
    const res = await api.post('/planes/', input);
    return res.data;
  },

  async deletePlan(id: number): Promise<void> {
    await api.delete(`/planes/${id}/`);
  },

  // --- BOLETAS DE SUSCRIPCIÓN ---
  async getBoletas(): Promise<BoletaSuscripcion[]> {
    const res = await api.get('/boletas/');
    return Array.isArray(res.data) ? res.data : res.data.results || [];
  },

  async createBoleta(input: {
    numero_boleta: string;
    fecha_inicio: string;
    fecha_fin: string;
    plan: number;
  }): Promise<BoletaSuscripcion> {
    const res = await api.post('/boletas/', input);
    return res.data;
  },

  async deleteBoleta(id: number): Promise<void> {
    await api.delete(`/boletas/${id}/`);
  },

  // --- STRIPE PAYMENTS ---
  async createPaymentIntent(planId: number): Promise<{
    clientSecret: string;
    publishableKey: string;
    paymentIntentId: string;
    amount: number;
    planNombre: string;
    isMock?: boolean;
  }> {
    const res = await api.post('/stripe/create-payment-intent/', { plan_id: planId });
    return res.data;
  },

  async confirmStripePayment(paymentIntentId: string, planId: number): Promise<{
    message: string;
    boleta: BoletaSuscripcion;
  }> {
    const res = await api.post('/stripe/confirm-payment/', {
      payment_intent_id: paymentIntentId,
      plan_id: planId,
    });
    return res.data;
  },
};


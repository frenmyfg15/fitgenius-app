// api/stripe.api.ts
import { api } from './axios';

export type StripePlan = 'BASICO' | 'PREMIUM';

export type CreateCheckoutPayload = {
  plan?: StripePlan;         // opcional: si no envías, el backend usa PREMIUM por defecto
  priceId?: string;          // opcional: si lo envías, tiene prioridad sobre plan
  successUrl?: string;       // opcional: si no envías, el backend arma una por defecto
  cancelUrl?: string;        // opcional
  trialDays?: number;        // opcional
};

export type CheckoutSessionResponse = {
  id: string;
  url: string;
};

export const createStripeCheckout = async (
  payload: CreateCheckoutPayload
): Promise<CheckoutSessionResponse> => {
  try {
    const res = await api.post('/stripe/checkout/', payload);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'No se pudo crear la sesión de checkout');
  }
};

export const verifyStripeCheckout = async (sessionId: string) => {
  try {
    // El controller acepta query param ?session_id=...
    const res = await api.get(`/stripe/verify`, {
      params: { session_id: sessionId },
    });
    return res.data as { ok: boolean };
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'No se pudo verificar la sesión de checkout');
  }
};

export const createStripePortal = async (returnUrl: string) => {
  try {
    const res = await api.post('/stripe/portal/', { returnUrl });
    return res.data as { url: string };
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'No se pudo crear la sesión del portal de facturación');
  }
};

export const cancelStripeSubscription = async (atPeriodEnd = true) => {
  try {
    const res = await api.post('/stripe/cancel/', { atPeriodEnd });
    return res.data as {
      ok: boolean;
      cancelAtPeriodEnd: boolean;
      currentPeriodEnd?: string; // si lo serializas en el server
      status: string;
      subscriptionId: string;
    };
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || 'No se pudo cancelar la suscripción');
  }
};

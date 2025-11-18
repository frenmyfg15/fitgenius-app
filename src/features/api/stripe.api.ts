// src/features/api/stripe.api.ts
import { api } from "./axios";

/* ============================================================
   Tipos
   ============================================================ */
export type CreatePremiumSubscriptionResponse = {
  clientSecret: string;
  customerId: string;
  ephemeralKeySecret?: string;
  paymentIntentId?: string | null;
  intentType: "payment" | "setup";
  status: string;
  subscriptionId: string;
};

export type CancelPremiumSubscriptionResponse = {
  message: string;
  subscriptionId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
};

/* ============================================================
   Crear suscripción Premium
   ============================================================ */
export const createPremiumSubscription =
  async (): Promise<CreatePremiumSubscriptionResponse> => {
    try {
      const res = await api.post<CreatePremiumSubscriptionResponse>(
        "/stripe/subscription/premium"
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error ||
          "No se pudo iniciar el pago Premium"
      );
    }
  };

/* ============================================================
   Cancelar suscripción Premium
   ============================================================ */
export const cancelPremiumSubscription =
  async (): Promise<CancelPremiumSubscriptionResponse> => {
    try {
      const res = await api.post<CancelPremiumSubscriptionResponse>(
        "/stripe/subscription/cancel"
      );
      return res.data;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.error ||
          "No se pudo cancelar la suscripción"
      );
    }
  };

// src/features/api/stripe.api.ts
import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid"; // ✅ NUEVO

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
    } catch (error) {
      checkAuthTokenInvalid(error); // ✅ limpia el store si el token es inválido

      return handleApiError(
        error,
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
    } catch (error) {
      checkAuthTokenInvalid(error); // ✅ limpia el store si el token es inválido

      return handleApiError(
        error,
        "No se pudo cancelar la suscripción"
      );
    }
  };

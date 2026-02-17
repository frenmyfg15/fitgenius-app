// src/features/api/stripe.api.ts
import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid";

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

export type ReactivatePremiumSubscriptionResponse = {
  message: string;
  subscriptionId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
};

export const createPremiumSubscription =
  async (): Promise<CreatePremiumSubscriptionResponse> => {
    try {
      const res = await api.post<CreatePremiumSubscriptionResponse>(
        "/stripe/subscription/premium"
      );
      return res.data;
    } catch (error) {
      checkAuthTokenInvalid(error);
      return handleApiError(error, "No se pudo iniciar el pago Premium");
    }
  };

export const cancelPremiumSubscription =
  async (): Promise<CancelPremiumSubscriptionResponse> => {
    try {
      const res = await api.post<CancelPremiumSubscriptionResponse>(
        "/stripe/subscription/cancel"
      );
      return res.data;
    } catch (error) {
      checkAuthTokenInvalid(error);
      return handleApiError(error, "No se pudo cancelar la suscripción");
    }
  };

export const reactivatePremiumSubscription =
  async (): Promise<ReactivatePremiumSubscriptionResponse> => {
    try {
      const res = await api.post<ReactivatePremiumSubscriptionResponse>(
        "/stripe/subscription/reactivate"
      );
      return res.data;
    } catch (error) {
      checkAuthTokenInvalid(error);
      return handleApiError(error, "No se pudo reactivar la suscripción");
    }
  };

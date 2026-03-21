import { api } from "./axios";
import { handleApiError } from "@/shared/lib/handleApiError";
import { checkAuthTokenInvalid } from "@/shared/lib/checkAuthTokenInvalid";

export type PremiumPlan = "monthly" | "yearly";

export type CreatePremiumSubscriptionResponse = {
  clientSecret: string;
  customerId: string;
  paymentIntentId: string | null;
  intentType: "payment";
  status: string;
  subscriptionId: string;
  plan: PremiumPlan;
  priceId: string;
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

export const createPremiumSubscription = async (
  plan: PremiumPlan
): Promise<CreatePremiumSubscriptionResponse> => {
  try {
    const res = await api.post<CreatePremiumSubscriptionResponse>(
      "/stripe/subscription/premium",
      { plan }
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

export const activatePremiumSubscription = async (
  plan: "monthly" | "yearly"
) => {
  try {
    const res = await api.post("/stripe/subscription/activate", { plan });
    return res.data;
  } catch (error) {
    checkAuthTokenInvalid(error);
    return handleApiError(error, "No se pudo activar la suscripción");
  }
};
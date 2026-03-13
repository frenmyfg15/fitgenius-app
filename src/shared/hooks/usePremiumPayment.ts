// src/shared/hooks/usePremiumPayment.ts
import { useCallback, useState } from "react";
import { useStripe } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";

import {
  createPremiumSubscription,
  CreatePremiumSubscriptionResponse,
} from "@/features/api/stripe.api";

export function usePremiumPayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startPremiumFlow = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      const data: CreatePremiumSubscriptionResponse =
        await createPremiumSubscription();

      const clientSecret = data?.clientSecret as string | undefined;
      const intentType = data?.intentType as "payment" | "setup" | undefined;
      const customerId = data?.customerId as string | undefined;
      const ephemeralKeySecret = data?.ephemeralKeySecret as
        | string
        | undefined;

      if (!clientSecret || !customerId || !ephemeralKeySecret) {
        setErrorMsg(
          "Respuesta incompleta del servidor (falta clientSecret o datos de cliente)."
        );
        return;
      }

      const initResult =
        intentType === "setup"
          ? await initPaymentSheet({
            customerId,
            customerEphemeralKeySecret: ephemeralKeySecret,
            setupIntentClientSecret: clientSecret,
            merchantDisplayName: "FitGenius",
          })
          : await initPaymentSheet({
            customerId,
            customerEphemeralKeySecret: ephemeralKeySecret,
            paymentIntentClientSecret: clientSecret,
            merchantDisplayName: "FitGenius",
          });

      const { error: initError } = initResult || {};

      if (initError) {
        setErrorMsg(
          initError.message ?? "No se pudo mostrar el formulario de pago."
        );
        return;
      }

      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        setErrorMsg(
          presentError.message ?? "El pago fue cancelado o no se completó."
        );
        return;
      }

      Toast.show({
        type: "success",
        text1: "Pago realizado",
        text2: "Tu suscripción premium se activó correctamente.",
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo iniciar el pago. Inténtalo de nuevo.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }, [initPaymentSheet, presentPaymentSheet]);

  return {
    startPremiumFlow,
    loading,
    errorMsg,
    setErrorMsg,
  };
}
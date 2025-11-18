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
      // 1) Pedir al backend crear la suscripción + Intent + ephemeral key
      const data: CreatePremiumSubscriptionResponse =
        await createPremiumSubscription();

      console.log("[PremiumPayment] Respuesta backend Stripe:", data);

      const clientSecret = data?.clientSecret as string | undefined;
      const intentType = data?.intentType as "payment" | "setup" | undefined;
      const customerId = data?.customerId as string | undefined;
      const ephemeralKeySecret = data?.ephemeralKeySecret as
        | string
        | undefined;

      if (!clientSecret || !customerId || !ephemeralKeySecret) {
        const msg =
          "Respuesta incompleta del servidor (falta clientSecret o datos de cliente).";
        console.warn("⚠️ [PremiumPayment] Datos incompletos", { data });
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "No se pudo iniciar el pago",
          text2: msg,
        });
        return;
      }

      // 2) Inicializar PaymentSheet según el tipo de intent
      let initResult:
        | {
            error?: { message?: string } | undefined;
          }
        | undefined;

      if (intentType === "setup") {
        console.log(
          "[PremiumPayment] Inicializando PaymentSheet con SetupIntent"
        );
        initResult = await initPaymentSheet({
          customerId,
          customerEphemeralKeySecret: ephemeralKeySecret,
          setupIntentClientSecret: clientSecret,
          merchantDisplayName: "FitGenius",
        });
      } else {
        console.log(
          "[PremiumPayment] Inicializando PaymentSheet con PaymentIntent"
        );
        initResult = await initPaymentSheet({
          customerId,
          customerEphemeralKeySecret: ephemeralKeySecret,
          paymentIntentClientSecret: clientSecret,
          merchantDisplayName: "FitGenius",
        });
      }

      const { error: initError } = initResult || {};

      if (initError) {
        const msg =
          initError.message ?? "No se pudo mostrar el formulario de pago.";
        console.warn("⚠️ [PremiumPaymentSheetInit]", {
          message: msg,
          raw: initError,
        });
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Error al mostrar el pago",
          text2: msg,
        });
        return;
      }

      // 3) Mostrar PaymentSheet
      const { error: presentError } = await presentPaymentSheet();

      if (presentError) {
        const msg =
          presentError.message ?? "El pago fue cancelado o no se completó.";
        console.warn("⚠️ [PremiumPaymentSheetPresent]", {
          message: msg,
          raw: presentError,
        });
        setErrorMsg(msg);
        Toast.show({
          type: "error",
          text1: "Pago no completado",
          text2: msg,
        });
        return;
      }

      console.log("[PremiumPayment] Pago completado con éxito");
      // Aquí tu app puede volver a pedir /usuario/me para ver planActual = PREMIUM, etc.
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo iniciar el pago. Inténtalo de nuevo.";
      console.warn("⚠️ [PremiumPaymentError]", {
        message: msg,
        raw: err,
      });
      setErrorMsg(msg);
      Toast.show({
        type: "error",
        text1: "No se pudo iniciar el pago",
        text2: msg,
      });
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

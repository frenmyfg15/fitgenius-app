// src/shared/lib/handleApiError.ts
import { showGlobalError } from "@/shared/components/ui/GlobalErrorModalProvider";

export function handleApiError(
  error: any,
  fallbackMessage = "Ha ocurrido un error"
): never {
  const backendMessage =
    error?.response?.data?.message || error?.response?.data?.error;

  const finalMessage = backendMessage || fallbackMessage;
  const errorCode = error?.response?.data?.errorCode;

  console.error("[API ERROR]", {
    message: finalMessage,
    errorCode,
    raw: error,
  });

  // Mostrar modal global
  showGlobalError(finalMessage, errorCode);

  throw new Error(finalMessage);
}

import { showGlobalError } from "@/shared/components/ui/GlobalErrorModalProvider";
import { forceLogout } from "./forceLogout";

export function handleApiError(
  error: any,
  fallbackMessage = "Ha ocurrido un error"
): never {
  const backendMessage =
    error?.response?.data?.message || error?.response?.data?.error;

  const errorCode = error?.response?.data?.errorCode;

  const finalMessage = backendMessage || fallbackMessage;

  console.error("[API ERROR]", {
    message: finalMessage,
    errorCode,
    raw: error,
  });

  if (
    errorCode === "AUTH_TOKEN_EXPIRED" ||
    errorCode === "AUTH_INVALID_TOKEN" ||
    errorCode === "AUTH_TOKEN_MISSING"
  ) {
    forceLogout();
    throw new Error("Sesión expirada");
  }

  showGlobalError(finalMessage, errorCode);

  throw new Error(finalMessage);
}

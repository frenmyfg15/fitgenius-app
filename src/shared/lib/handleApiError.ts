import { showGlobalError } from "@/shared/components/ui/GlobalErrorModalProvider";
import { forceLogout } from "./forceLogout";

const AUTH_ERROR_CODES = new Set([
  "AUTH_TOKEN_EXPIRED",
  "AUTH_INVALID_TOKEN",
  "AUTH_TOKEN_MISSING",
]);

export function handleApiError(
  error: any,
  fallbackMessage = "Ha ocurrido un error"
): never {
  const data = error?.response?.data;

  const message: string = data?.message || fallbackMessage;
  const errorCode: string | undefined = data?.errorCode;
  const requestId: string | undefined = data?.requestId;

  console.error("[API ERROR]", { message, errorCode, requestId, raw: error });

  if (errorCode && AUTH_ERROR_CODES.has(errorCode)) {
    forceLogout();
    throw new Error("Sesión expirada");
  }

  showGlobalError(message, errorCode);

  throw new Error(message);
}
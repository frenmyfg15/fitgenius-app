// src/shared/lib/checkAuthTokenInvalid.ts
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import type { AxiosError } from "axios";

type ApiErrorBody = {
  ok?: boolean;
  errorCode?: string;
  message?: string;
};

export const checkAuthTokenInvalid = (error: unknown) => {
  const err = error as AxiosError<ApiErrorBody>;

  const status = err?.response?.status;
  const data = err?.response?.data;

  const isTokenInvalid =
    status === 401 &&
    data?.ok === false &&
    data?.errorCode === "AUTH_TOKEN_INVALID";

  if (isTokenInvalid) {
    // ✅ Importante: acceder al store fuera de React usando getState()
    useUsuarioStore.getState().logout();
  }
};

// src/features/cuenta/hooks/useCuenta.ts
import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";

import { logoutToken } from "@/features/api/usuario.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { AuthStackParamList } from "@/features/navigation/Auth";

type Nav = NativeStackNavigationProp<AuthStackParamList & Record<string, any>>;

export function useCuenta() {
  const navigation = useNavigation<Nav>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario, logout } = useUsuarioStore();
  const isPremium = useUsuarioStore((s) => s.usuario?.planActual === "PREMIUM");
  const haPagado = useUsuarioStore((s) => s.usuario?.haPagado ?? false);

  const [closing, setClosing] = useState(false);

  const getReadableError = useCallback(
    (err: unknown, fallback = "No se pudo cerrar sesión. Inténtalo de nuevo.") => {
      if (axios.isAxiosError(err)) {
        if (err.request && !err.response) {
          return "No se pudo contactar al servidor. Revisa tu conexión.";
        }
        const serverMsg =
          (err.response?.data as any)?.error ??
          (err.response?.data as any)?.message ??
          (err.response?.data as any)?.msg;
        if (serverMsg) return serverMsg;
        if (err.response?.status === 401) return "Tu sesión ya no es válida. Vuelve a iniciar sesión.";
        if (err.response?.status === 500) return "Hubo un problema en el servidor al cerrar tu sesión.";
        return err.message || fallback;
      }
      if (err instanceof Error) return err.message || fallback;
      return fallback;
    },
    []
  );

  const logWarning = useCallback((tag: string, err: unknown, userMsg: string) => {
    console.warn(`⚠️ [${tag}]`, {
      userMessage: userMsg,
      isAxiosError: axios.isAxiosError(err),
      status: axios.isAxiosError(err) ? err.response?.status : undefined,
      serverData: axios.isAxiosError(err) ? err.response?.data : undefined,
      rawError: err,
      userId: usuario?.id,
    });
  }, [usuario?.id]);

  const go = useCallback(
    (name: string) => {
      // @ts-ignore – nombres gestionados por tu stack
      navigation.navigate(name);
    },
    [navigation]
  );

  const cerrarSesion = useCallback(async () => {
    setClosing(true);
    try {
      await logoutToken();
      logout();
      // Sin Toast de éxito: el usuario ya ve que vuelve al login / cambia la UI
    } catch (err) {
      const msg = getReadableError(err);
      logWarning("LogoutError", err, msg);
      Toast.show({
        type: "error",
        text1: "No se pudo cerrar sesión",
        text2: msg,
      });
    } finally {
      setClosing(false);
    }
  }, [logout, getReadableError, logWarning]);

  const state = useMemo(
    () => ({
      isDark,
      usuario,
      isPremium,
      haPagado,
      closing,
    }),
    [isDark, usuario, isPremium, haPagado, closing]
  );

  return {
    ...state,
    go,
    cerrarSesion,
  };
}

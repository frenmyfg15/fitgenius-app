// src/features/cuenta/hooks/useCuenta.ts
import { useCallback, useMemo, useState } from "react";
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
    } catch {
      // Si falla el endpoint igual cerramos la sesión local —
      // el cambio de UI es feedback suficiente para el usuario.
    } finally {
      logout();
      setClosing(false);
    }
  }, [logout]);

  const state = useMemo(
    () => ({ isDark, usuario, isPremium, haPagado, closing }),
    [isDark, usuario, isPremium, haPagado, closing]
  );

  return { ...state, go, cerrarSesion };
}
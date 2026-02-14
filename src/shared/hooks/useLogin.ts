// hooks/useLogin.ts
import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

import { loginUsuario, loginUsuarioGoogle } from "@/features/api/usuario.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import {
  configurarGoogle,
  loginConGoogleNativo,
} from "@/firebase/loginConGoogleNative";
import { useColorScheme } from "nativewind";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@/features/navigation/Auth";
import { useNavigation } from "@react-navigation/native";

type FormValues = { correo: string; contrasena: string };

export const useLogin = () => {
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { setUsuario } = useUsuarioStore();

  // Fondo según tema
  const bgGradient = useMemo(
    () =>
      isDark
        ? ["#0b1220", "#101a33", "#0b1220"]
        : ["#f6f7fb", "#e9ecf5", "#f6f7fb"],
    [isDark]
  );

  // Form
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    mode: "onSubmit",
    defaultValues: { correo: "", contrasena: "" },
  });

  useEffect(() => {
    configurarGoogle();
  }, []);

  // ——— Acciones ———
  const submitLogin = useCallback(
    async (data: FormValues) => {
      setLoading(true);
      try {
        const res = await loginUsuario(data.correo, data.contrasena);
        setUsuario(res.usuario ?? res);
        // Sin Toast de éxito: el propio flujo de navegación indica que entró correctamente
      } catch (err) {
        // Solo log, los errores de API se gestionan en otra capa
        console.warn("⚠️ [LoginError]", {
          isAxiosError: axios.isAxiosError(err),
          status: axios.isAxiosError(err) ? err.response?.status : undefined,
          serverData: axios.isAxiosError(err) ? err.response?.data : undefined,
          rawError: err,
        });
      } finally {
        setLoading(false);
      }
    },
    [setUsuario]
  );

  // Inicia Google, obtiene token Firebase y lo manda al backend
  const startGoogleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const { token: firebaseIdToken } = await loginConGoogleNativo();
      const res = await loginUsuarioGoogle(firebaseIdToken);
      setUsuario(res?.usuario ?? res);
      // Sin Toast de éxito
    } catch (err) {
      console.warn("⚠️ [LoginGoogleNativeError]", {
        isAxiosError: axios.isAxiosError(err),
        status: axios.isAxiosError(err) ? err.response?.status : undefined,
        serverData: axios.isAxiosError(err) ? err.response?.data : undefined,
        rawError: err,
      });
    } finally {
      setLoading(false);
    }
  }, [setUsuario]);

  // Si ya tienes el token (por ejemplo, pasado desde otro flujo)
  const loginConGoogle = useCallback(
    async (token: string) => {
      setLoading(true);
      try {
        const res = await loginUsuarioGoogle(token);
        setUsuario(res?.usuario ?? res);
        // Sin Toast de éxito
      } catch (err) {
        console.warn("⚠️ [LoginGoogleTokenError]", {
          isAxiosError: axios.isAxiosError(err),
          status: axios.isAxiosError(err) ? err.response?.status : undefined,
          serverData: axios.isAxiosError(err) ? err.response?.data : undefined,
          rawError: err,
        });
      } finally {
        setLoading(false);
      }
    },
    [setUsuario]
  );

  // ——— Exponer al componente ———
  return {
    nav,
    isDark,
    control,
    errors,
    loading,
    showPassword,
    setShowPassword,
    bgGradient,
    handleSubmit,
    submitLogin,
    startGoogleLogin,
    loginConGoogle,
  };
};

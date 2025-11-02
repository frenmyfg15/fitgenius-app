// hooks/useLogin.ts
import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import axios from "axios";
import Toast from "react-native-toast-message";

import { loginUsuario, loginUsuarioGoogle } from "@/features/api/usuario.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { configurarGoogle, loginConGoogleNativo } from "@/firebase/loginConGoogleNative";
import { useColorScheme } from "nativewind";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AuthStackParamList } from "@/features/navigation/Auth";
import { useNavigation } from "@react-navigation/native";

type FormValues = { correo: string; contrasena: string };

export const useLogin = () => {
  const nav = useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { setUsuario } = useUsuarioStore();

  // Fondo según tema
  const bgGradient = useMemo(
    () => (isDark ? ["#0b1220", "#101a33", "#0b1220"] : ["#f6f7fb", "#e9ecf5", "#f6f7fb"]),
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

  // ——— Helpers ———
  const getReadableError = (err: unknown, fallback = "Ocurrió un error. Inténtalo de nuevo.") => {
    if (axios.isAxiosError(err)) {
      if (err.request && !err.response) {
        return "No se pudo contactar al servidor. Revisa tu conexión.";
      }
      const serverMsg =
        (err.response?.data as any)?.error ??
        (err.response?.data as any)?.message ??
        (err.response?.data as any)?.msg;
      if (serverMsg) return serverMsg;
      if (err.response?.status === 401) return "Credenciales inválidas.";
      if (err.response?.status === 403) return "Acceso no autorizado.";
      if (err.response?.status === 404) return "Recurso no encontrado.";
      if (err.response?.status === 500) return "Fallo interno del servidor.";
      return err.message || fallback;
    }
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  };

  // ——— Acciones ———
  const submitLogin = useCallback(
    async (data: FormValues) => {
      setLoading(true);
      try {
        const res = await loginUsuario(data.correo, data.contrasena);
        setUsuario(res.usuario ?? res);

        Toast.show({
          type: "success",
          text1: "Sesión iniciada",
          text2: `¡Bienvenido${res?.usuario?.nombre ? `, ${res.usuario.nombre}` : ""}!`,
        });
      } catch (err) {
        const msg = getReadableError(err, "No se pudo iniciar sesión.");
        console.error("🔴 [LoginError]", err);
        Toast.show({
          type: "error",
          text1: "No se pudo iniciar sesión",
          text2: msg,
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
      const { token: firebaseIdToken, user } = await loginConGoogleNativo(); // token = Firebase ID token
      const res = await loginUsuarioGoogle(firebaseIdToken);
      setUsuario(res?.usuario ?? res);

      Toast.show({
        type: "success",
        text1: "Sesión con Google",
        text2: `Has iniciado sesión${user?.nombre ? ` como ${user.nombre}` : ""}.`,
      });
    } catch (err) {
      const msg = getReadableError(
        err,
        "No se pudo iniciar sesión con Google."
      );
      console.error("🔴 [LoginGoogleError]", err);
      Toast.show({
        type: "error",
        text1: "Error con Google",
        text2: msg,
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
        Toast.show({
          type: "success",
          text1: "Sesión con Google",
          text2: "Has iniciado sesión correctamente.",
        });
      } catch (err) {
        const msg = getReadableError(err, "No se pudo iniciar sesión con Google.");
        console.error("🔴 [LoginGoogleError]", err);
        Toast.show({
          type: "error",
          text1: "Error con Google",
          text2: msg,
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

// hooks/useLogin.ts
import { useState, useMemo, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useColorScheme } from "nativewind";

import { loginUsuario, loginUsuarioGoogle } from "@/features/api/usuario.api";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { configurarGoogle, loginConGoogleNativo } from "@/firebase/loginConGoogleNative";

type FormValues = { correo: string; contrasena: string };

export const useLogin = () => {
  const nav = useNavigation<NativeStackNavigationProp<any>>();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { setUsuario } = useUsuarioStore();

  const bgGradient = useMemo(
    () =>
      isDark
        ? ["#0b1220", "#101a33", "#0b1220"]
        : ["#f6f7fb", "#e9ecf5", "#f6f7fb"],
    [isDark]
  );

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

  // ─── Acciones ─────────────────────────────────────────────────────────────────

  const submitLogin = useCallback(async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await loginUsuario(data.correo, data.contrasena);
      setUsuario(res.usuario ?? res);
      // Sin toast: la navegación al home es feedback suficiente
    } catch { }
    finally {
      setLoading(false);
    }
  }, [setUsuario]);

  const startGoogleLogin = useCallback(async () => {
    setLoading(true);
    try {
      const { token: firebaseIdToken } = await loginConGoogleNativo();
      const res = await loginUsuarioGoogle(firebaseIdToken);
      setUsuario(res?.usuario ?? res);
    } catch { }
    finally {
      setLoading(false);
    }
  }, [setUsuario]);

  const loginConGoogle = useCallback(async (token: string) => {
    setLoading(true);
    try {
      const res = await loginUsuarioGoogle(token);
      setUsuario(res?.usuario ?? res);
    } catch { }
    finally {
      setLoading(false);
    }
  }, [setUsuario]);

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
// app/features/auth/useRegistrar.ts
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import {
  enviarVerifiacionCorreo,
  registrarUsuario,
  registrarUsuarioConGoogle,
} from "@/features/api/usuario.api";
import { Usuario } from "@/features/type/register";

/* ---------------- Schema (formulario local) ---------------- */
const schema = z.object({
  nombre: z.string().min(2, "Debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "Debe tener al menos 2 caracteres"),
  correo: z.string().email("Correo inválido"),
  contrasena: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
  acepta: z
    .boolean()
    .refine((v) => v === true, {
      message:
        "Debes aceptar los Términos y Condiciones y la Política de Privacidad",
    }),
});

export type FormUsuario = z.infer<typeof schema>;

/* ---------------- Constantes ---------------- */
const LS_USUARIO_KEY = "registroUsuario";
const LS_STEP_KEY = "registroStep";

/* ---------------- Navegación ---------------- */
type AuthStack = {
  Registrar: undefined;
  Sesion: undefined;
  FitRutina: undefined;
  Terminos: undefined;
  Privacidad: undefined;
};

/* ---------------- Helpers de merge/validación ---------------- */
function construirUsuarioPayload(
  form: Pick<FormUsuario, "nombre" | "apellido" | "correo" | "contrasena">,
  wizard: Partial<Usuario> | null | undefined
): Usuario | null {
  if (!wizard) return null;

  const faltantes: string[] = [];
  const requeridos: Array<keyof Usuario> = [
    "objetivo",
    "sexo",
    "nivel",
    "actividad",
    "lugar",
    "altura",
    "medidaAltura",
    "peso",
    "medidaPeso",
    "pesoObjetivo",
    "edad",
    "duracion",
  ];

  for (const k of requeridos) {
    if (
      wizard[k] === null ||
      wizard[k] === undefined ||
      (typeof wizard[k] === "string" && wizard[k] === "")
    ) {
      faltantes.push(String(k));
    }
  }

  if (faltantes.length > 0) {
    Alert.alert(
      "Faltan datos",
      "Completa tu perfil antes de registrarte en el asistente."
    );
    return null;
  }

  const payload: Usuario = {
    nombre: form.nombre as Usuario["nombre"],
    apellido: form.apellido as Usuario["apellido"],
    correo: form.correo as Usuario["correo"],
    contrasena: form.contrasena as Usuario["contrasena"],
    objetivo: wizard.objetivo as Usuario["objetivo"],
    sexo: wizard.sexo as Usuario["sexo"],
    enfoque: (wizard.enfoque ?? []) as Usuario["enfoque"],
    nivel: wizard.nivel as Usuario["nivel"],
    actividad: wizard.actividad as Usuario["actividad"],
    lugar: wizard.lugar as Usuario["lugar"],
    equipamiento: (wizard.equipamiento ?? []) as Usuario["equipamiento"],
    altura: wizard.altura as Usuario["altura"],
    medidaAltura: wizard.medidaAltura as Usuario["medidaAltura"],
    peso: wizard.peso as Usuario["peso"],
    medidaPeso: wizard.medidaPeso as Usuario["medidaPeso"],
    pesoObjetivo: wizard.pesoObjetivo as Usuario["pesoObjetivo"],
    edad: wizard.edad as Usuario["edad"],
    dias: (wizard.dias ?? []) as Usuario["dias"],
    duracion: wizard.duracion as Usuario["duracion"],
    limitaciones: (wizard.limitaciones ?? []) as Usuario["limitaciones"],
  };

  return payload;
}

/* ---------------- Hook principal ---------------- */
export function useRegistrar() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const navigation = useNavigation<NativeStackNavigationProp<AuthStack>>();
  const wizardUsuario = useRegistroStore((s) => s.usuario);
  const { setUsuario } = useUsuarioStore();

  const methods = useForm<FormUsuario>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: (wizardUsuario as any)?.nombre ?? "",
      apellido: (wizardUsuario as any)?.apellido ?? "",
      correo: (wizardUsuario as any)?.correo ?? "",
      contrasena: "",
      acepta: false,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    formState: { errors },
    setError,
    setFocus,
    getValues,
    reset: resetForm,
  } = methods;

  const [loading, setLoading] = useState(false);
  const [componentCode, setComponentCode] = useState(false);
  const [payloadUsuario, setPayloadUsuario] = useState<Usuario | null>(null);

  /* ---------- Helpers ---------- */
  const resetRegistroState = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([LS_USUARIO_KEY, LS_STEP_KEY]);
    } catch {
      /* no-op */
    }
    resetForm({
      nombre: "",
      apellido: "",
      correo: "",
      contrasena: "",
      acepta: false,
    });
  }, [resetForm]);

  const onError = (errs: typeof errors) => {
    const firstKey = Object.keys(errs)[0] as keyof FormUsuario | undefined;
    if (firstKey) {
      setFocus(firstKey);
      const msg =
        (errs[firstKey]?.message as string) ||
        "Revisa los campos del formulario.";
      Alert.alert("Formulario", msg);
    }
  };

  const enviarCodigo = useCallback(async (correo: string) => {
    try {
      await enviarVerifiacionCorreo(correo);
      Toast.show({
        type: "success",
        text1: "Verificación enviada",
        text2: "Revisa tu bandeja de entrada 📬",
        position: "top",
      });
      setComponentCode(true);
    } catch (err) {
      // Solo log, la gestión de errores de API se hace en otro sitio
      console.error("🔴 [SendCodeError]", err);
    }
  }, []);

  // Email + contraseña -> fusionamos con wizard y enviamos código
  const onSubmit = (formUsuario: FormUsuario) => {
    const payload = construirUsuarioPayload(
      {
        nombre: formUsuario.nombre,
        apellido: formUsuario.apellido,
        correo: formUsuario.correo,
        contrasena: formUsuario.contrasena,
      },
      wizardUsuario as Partial<Usuario>
    );

    if (!payload) return;

    setPayloadUsuario(payload);
    enviarCodigo(payload.correo as unknown as string).catch(() => {});
  };

  // Google -> usando token del GoogleSignInButton
  const handleGoogleLogin = async (token: string) => {
    if (!getValues("acepta")) {
      setError("acepta", {
        type: "manual",
        message:
          "Debes aceptar los Términos y Condiciones y la Política de Privacidad",
      });
      setFocus("acepta");
      Alert.alert(
        "Aviso",
        "Debes aceptar los Términos y Condiciones y la Política de Privacidad"
      );
      return;
    }

    setLoading(true);
    try {
      const res = await registrarUsuarioConGoogle(token, wizardUsuario);

      setUsuario(res.usuario);
      await resetRegistroState();
      navigation.navigate("FitRutina");
    } catch (err) {
      // Solo log, error UI lo manejas en otra capa
      console.error("Error al iniciar sesión con Google:", err);
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => navigation.navigate("Sesion");
  const goTerminos = () => navigation.navigate("Terminos");
  const goPrivacidad = () => navigation.navigate("Privacidad");

  const completarRegistro = useCallback(
    async (codigo: string) => {
      const payload =
        payloadUsuario ??
        construirUsuarioPayload(
          {
            nombre: getValues("nombre"),
            apellido: getValues("apellido"),
            correo: getValues("correo"),
            contrasena: getValues("contrasena"),
          },
          wizardUsuario as Partial<Usuario>
        );

      if (!payload) return;

      setLoading(true);
      try {
        const res = await registrarUsuario(payload, codigo);

        const usuarioFinal = (res as any).usuarioSinContrasena ?? res.usuario;
        setUsuario(usuarioFinal);

        await AsyncStorage.multiRemove([LS_USUARIO_KEY, LS_STEP_KEY]);

        Toast.show({
          type: "success",
          text1: "Registro completado",
          text2: "¡Bienvenido!",
          position: "top",
        });

        setComponentCode(false);
        await resetRegistroState();
        navigation.navigate("FitRutina");
      } catch (err) {
        // Solo log, sin mostrar error al usuario
        console.error("🔴 [RegisterError]", err);
      } finally {
        setLoading(false);
      }
    },
    [
      getValues,
      navigation,
      payloadUsuario,
      resetRegistroState,
      setUsuario,
      wizardUsuario,
    ]
  );

  const resendCodigo = useCallback(() => {
    const correo =
      (payloadUsuario ?? { correo: getValues("correo") }).correo ??
      getValues("correo");
    if (!correo) {
      Alert.alert(
        "Correo requerido",
        "Ingresa un correo electrónico para reenviar el código."
      );
      return Promise.resolve();
    }
    return enviarCodigo(correo as string);
  }, [enviarCodigo, getValues, payloadUsuario]);

  return {
    isDark,
    methods,
    loading,
    componentCode,
    setComponentCode,
    onSubmit,
    onError,
    handleGoogleLogin,
    completarRegistro,
    resendCodigo,
    goLogin,
    goTerminos,
    goPrivacidad,
  };
}

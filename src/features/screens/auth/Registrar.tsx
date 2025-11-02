// app/features/auth/RegistrarScreen.tsx
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useForm,
  FormProvider,
  useFormContext,
  Controller,
  type UseFormRegister,
} from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import ModernInput from "@/shared/components/ui/ModernInput";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { loginConGoogleNativo } from "@/firebase/loginConGoogleNative";
import {
  enviarVerifiacionCorreo,
  registrarUsuario,
  registrarUsuarioConGoogle,
} from "@/features/api/usuario.api";
import Toast from "react-native-toast-message";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import EnterCodeVerify from "@/shared/components/auth/EnterCodeVerify";
import { Usuario } from "@/features/type/register";

/* ---------------- Schema (formulario local) ---------------- */
const schema = z.object({
  nombre: z.string().min(2, "Debe tener al menos 2 caracteres"),
  apellido: z.string().min(2, "Debe tener al menos 2 caracteres"),
  correo: z.string().email("Correo inválido"),
  contrasena: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  acepta: z
    .boolean()
    .refine((v) => v === true, {
      message:
        "Debes aceptar los Términos y Condiciones y la Política de Privacidad",
    }),
});

type FormUsuario = z.infer<typeof schema>;

/* ---------------- Constantes ---------------- */
const LS_USUARIO_KEY = "registroUsuario";
const LS_STEP_KEY = "registroStep";

type AuthStack = {
  Registrar: undefined;
  AuthSesion: undefined;
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

  // Campos del wizard que consideramos críticos para poder registrar
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
      `Completa tu perfil antes de registrarte: ${faltantes.join(", ")}`
    );
    return null;
  }

  // Construimos el payload garantizando arrays
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

/* ---------------- Pantalla ---------------- */
export default function RegistrarScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const navigation = useNavigation<NativeStackNavigationProp<AuthStack>>();
  const wizardUsuario = useRegistroStore((s) => s.usuario); // datos del wizard

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
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setFocus,
    getValues,
    reset: resetForm,
    control,
  } = methods;

  const { setUsuario } = useUsuarioStore();
  const [loading, setLoading] = useState(false);
  const [componentCode, setComponentCode] = useState(false);

  // Guardamos el payload listo para registrar entre "enviar código" y "confirmar código"
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
        position: "bottom",
      });
      setComponentCode(true);
    } catch (err: any) {
      console.error("🔴 [SendCodeError]", err);
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo enviar el código";
      Toast.show({
        type: "error",
        text1: "Error al enviar código",
        text2: msg,
        position: "bottom",
      });
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

    if (!payload) return; // ya se avisó con Alert

    setPayloadUsuario(payload);
    enviarCodigo(payload.correo as unknown as string).catch(() => {});
  };

  // Google -> al registrar exitosamente, reiniciamos wizard + form
  const handleGoogleLogin = async () => {
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
      const { token } = await loginConGoogleNativo();
      const res = await registrarUsuarioConGoogle(
        token,
        wizardUsuario
      );

      setUsuario(res.usuario);
      await resetRegistroState();
      navigation.navigate("FitRutina");
    } catch (err: any) {
      console.error("Error al iniciar sesión con Google:", err);
      const msg =
        err?.response?.data?.error ||
        err?.message ||
        "No se pudo iniciar sesión con Google. Intenta de nuevo.";
      Alert.alert("Google", msg);
    } finally {
      setLoading(false);
    }
  };

  const goLogin = () => navigation.navigate("AuthSesion");
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
          position: "bottom",
        });

        setComponentCode(false);
        await resetRegistroState();
        navigation.navigate("FitRutina");
      } catch (err: any) {
        console.error("🔴 [RegisterError]", err);
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "No se pudo completar el registro";
        Toast.show({
          type: "error",
          text1: "Error",
          text2: msg,
          position: "bottom",
        });
      } finally {
        setLoading(false);
      }
    },
    [getValues, navigation, payloadUsuario, resetRegistroState, setUsuario, wizardUsuario]
  );

  return (
    <>
      <ScrollView
        className={isDark ? "bg-[#0b1220]" : "bg-white"}
        contentContainerStyle={{
          minHeight: "100%",
          paddingHorizontal: 16,
          paddingVertical: 24,
          justifyContent: "space-between",
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center">
          <View
            className={`w-full max-w-md rounded-2xl border p-8 shadow-sm ${
              isDark ? "border-slate-700 bg-white/5" : "border-slate-200/70 bg-white/90"
            } backdrop-blur`}
          >
            <Text
              className={`text-2xl font-bold text-center mb-2 ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Crear cuenta
            </Text>
            <Text
              className={`text-sm text-center mb-6 ${
                isDark ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Crea tu cuenta para comenzar tu viaje con nosotros.
            </Text>

            <FormProvider {...methods}>
              <View className="space-y-5">
                <Input
                  label="Nombre"
                  id="nombre"
                  register={register}
                  error={errors.nombre?.message}
                />
                <Input
                  label="Apellido"
                  id="apellido"
                  register={register}
                  error={errors.apellido?.message}
                />
                <Input
                  label="Correo electrónico"
                  id="correo"
                  type="email"
                  register={register}
                  error={errors.correo?.message}
                />
                <Input
                  label="Contraseña"
                  id="contrasena"
                  type="password"
                  register={register}
                  error={errors.contrasena?.message}
                />

                <View className="flex-row items-start gap-2">
                  <Controller
                    control={control}
                    name="acepta"
                    render={({ field: { value, onChange } }) => (
                      <Switch
                        value={!!value}
                        onValueChange={onChange}
                        thumbColor={isDark ? "#cbd5e1" : "#fff"}
                        trackColor={{
                          false: isDark ? "#334155" : "#cbd5e1",
                          true: "#22c55e",
                        }}
                      />
                    )}
                  />
                  <Text
                    className={`flex-1 ${
                      isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                  >
                    Acepto los{" "}
                    <Text onPress={goTerminos} className="text-green-600 font-semibold">
                      Términos y Condiciones
                    </Text>{" "}
                    y la{" "}
                    <Text
                      onPress={goPrivacidad}
                      className="text-green-600 font-semibold"
                    >
                      Política de Privacidad
                    </Text>
                    .
                  </Text>
                </View>
                {errors.acepta && (
                  <Text className="text-red-500 text-sm -mt-2">
                    {errors.acepta.message}
                  </Text>
                )}

                <Pressable
                  onPress={handleSubmit(onSubmit, onError)}
                  disabled={loading}
                  className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neon-logo-gradient px-4 py-3"
                  style={({ pressed }) => [
                    { opacity: loading ? 0.7 : pressed ? 0.9 : 1 },
                  ]}
                >
                  {loading && <ActivityIndicator size="small" color="#fff" />}
                  <Text className="text-white font-semibold">
                    {loading ? "Cargando…" : "Registrarse"}
                  </Text>
                </Pressable>
              </View>
            </FormProvider>

            {/* separador */}
            <View className="relative my-6">
              <View className="absolute inset-0 items-center justify-center">
                <View
                  className={`${
                    isDark ? "border-slate-700" : "border-slate-200"
                  } w-full border-t`}
                />
              </View>
              <View className="relative items-center">
                <Text
                  className={`${
                    isDark ? "text-slate-400" : "text-slate-500"
                  } px-3 bg-transparent`}
                >
                  o
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <Pressable
                onPress={handleGoogleLogin}
                disabled={loading}
                className={`flex-row items-center justify-center gap-3 w-full border py-3 rounded-xl ${
                  isDark ? "border-slate-700 bg-transparent" : "border-slate-300 bg-white"
                }`}
                style={({ pressed }) => [
                  { opacity: loading ? 0.7 : pressed ? 0.9 : 1 },
                ]}
              >
                <Text className="text-xl">G</Text>
                <Text className={isDark ? "text-white" : "text-slate-900"}>
                  Continuar con Google
                </Text>
              </Pressable>
            </View>

            <Text
              className={`text-sm text-center mt-6 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            >
              ¿Ya tienes una cuenta?{" "}
              <Text onPress={goLogin} className="text-green-600 font-semibold">
                Inicia sesión
              </Text>
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center">
          <Text className={isDark ? "text-slate-400 text-xs" : "text-slate-500 text-xs"}>
            © {new Date().getFullYear()} FitGenius. Todos los derechos reservados.
          </Text>
          <View className="mt-2 flex-row items-center justify-center gap-3">
            <Text
              onPress={goTerminos}
              className={isDark ? "text-slate-300 underline" : "text-slate-600 underline"}
            >
              Términos y Condiciones
            </Text>
            <Text className={isDark ? "text-slate-400" : "text-slate-600"}>•</Text>
            <Text
              onPress={goPrivacidad}
              className={isDark ? "text-slate-300 underline" : "text-slate-600 underline"}
            >
              Política de Privacidad
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Overlay de verificación de código */}
      {componentCode && (
        <View className="absolute inset-0 z-30 items-center justify-center bg-black/80">
          <EnterCodeVerify
            onComplete={completarRegistro}
            onResend={() => {
              const correo = (payloadUsuario ?? {
                correo: getValues("correo"),
              } as any).correo as unknown as string;
              return enviarCodigo(correo);
            }}
            setComponentCode={setComponentCode}
          />
        </View>
      )}
    </>
  );
}

/* ---------------- Input (API estable) ---------------- */
function Input({
  label,
  id,
  register, // compatibilidad externa
  error,
  type = "text",
}: {
  label: string;
  id: Exclude<keyof FormUsuario, "acepta">;
  register: UseFormRegister<FormUsuario>;
  error?: string;
  type?: "text" | "number" | "email" | "password";
}) {
  const { control } = useFormContext<FormUsuario>();

  return (
    <View>
      <Text className="mb-1 font-medium text-slate-700 dark:text-slate-200">
        {label}
      </Text>
      <Controller
        control={control}
        name={id}
        render={({ field: { value, onChange } }) => (
          <ModernInput
            type={type}
            className={`w-full p-3 rounded-xl border text-sm bg-white dark:bg-[#0b1220] backdrop-blur focus:border-green-400 ${
              error ? "border-red-400" : "border-slate-300 dark:border-slate-700"
            }`}
            value={value ?? ""}
            onChangeText={onChange}
            secureTextEntry={type === "password"}
          />
        )}
      />
      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}

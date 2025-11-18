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
import { LinearGradient } from "expo-linear-gradient";

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

type FormUsuario = z.infer<typeof schema>;

/* ---------------- Constantes ---------------- */
const LS_USUARIO_KEY = "registroUsuario";
const LS_STEP_KEY = "registroStep";

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
    enviarCodigo(payload.correo as unknown as string).catch(() => { });
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
      const res = await registrarUsuarioConGoogle(token, wizardUsuario);

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
    [
      getValues,
      navigation,
      payloadUsuario,
      resetRegistroState,
      setUsuario,
      wizardUsuario,
    ]
  );

  return (
    <>
      <ScrollView
        className={isDark ? "bg-[#020617]" : "bg-slate-50"}
        contentContainerStyle={{
          minHeight: "100%",
          paddingHorizontal: 16,
          paddingVertical: 30,
          justifyContent: "space-between",
          paddingBottom: 50,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 items-center justify-center">
          <LinearGradient
            colors={
              isDark
                ? ["rgba(56,189,248,0.25)", "rgba(16,185,129,0.15)", "transparent"]
                : ["rgba(56,189,248,0.12)", "rgba(16,185,129,0.08)", "transparent"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 24,
              padding: 1,
            }}
          >
            <View
              className={`w-full rounded-[22px] border p-7 shadow-sm ${isDark
                  ? "border-slate-700 bg-slate-900/70"
                  : "border-slate-200/80 bg-white"
                } backdrop-blur`}
            >
              <View className="items-center mb-3">
                <View
                  className={`mb-2 rounded-full px-3 py-1 ${isDark ? "bg-slate-800/80" : "bg-slate-100"
                    }`}
                >
                  <Text
                    className={`text-[11px] font-semibold ${isDark ? "text-slate-200" : "text-slate-700"
                      }`}
                  >
                    Paso final · Crea tu acceso
                  </Text>
                </View>

                <Text
                  className={`text-2xl font-bold text-center ${isDark ? "text-white" : "text-slate-900"
                    }`}
                >
                  Crear cuenta
                </Text>
                <Text
                  className={`text-sm text-center mt-1 ${isDark ? "text-slate-300" : "text-slate-600"
                    }`}
                >
                  Usa tus datos del asistente para terminar el registro.
                </Text>
              </View>

              <FormProvider {...methods}>
                <View className="mt-4 space-y-5">
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

                  <View className="flex-row items-start gap-2 mt-1">
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
                      className={`flex-1 text-xs ${isDark ? "text-slate-300" : "text-slate-700"
                        }`}
                    >
                      Acepto los{" "}
                      <Text
                        onPress={goTerminos}
                        className="text-green-500 font-semibold"
                      >
                        Términos y Condiciones
                      </Text>{" "}
                      y la{" "}
                      <Text
                        onPress={goPrivacidad}
                        className="text-green-500 font-semibold"
                      >
                        Política de Privacidad
                      </Text>
                      .
                    </Text>
                  </View>
                  {errors.acepta && (
                    <Text className="text-red-500 text-xs -mt-1">
                      {errors.acepta.message}
                    </Text>
                  )}

                  {/* Botón REGISTRARSE (mismo estilo que Iniciar sesión en Sesion.tsx) */}
                  <Pressable
                    disabled={loading}
                    onPress={handleSubmit(onSubmit, onError)}
                    className="w-full rounded-xl overflow-hidden mt-1"
                    style={{
                      shadowColor: "#0f172a",
                      shadowOpacity: 0.15,
                      shadowRadius: 8,
                      shadowOffset: { width: 0, height: 4 },
                      elevation: 4,
                    }}
                  >
                    <LinearGradient
                      colors={["#00FF40", "#5EE69D", "#B200FF"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ borderRadius: 12 }}
                    >
                      <View className="px-4 py-3 items-center justify-center">
                        {loading ? (
                          <ActivityIndicator size="small" color="#ffffff" />
                        ) : (
                          <Text className="text-white font-bold tracking-wide">
                            Registrarse
                          </Text>
                        )}
                      </View>
                    </LinearGradient>
                  </Pressable>

                </View>
              </FormProvider>

              {/* separador */}
              <View className="relative my-6">
                <View className="absolute inset-0 items-center justify-center">
                  <View
                    className={`w-full border-t ${isDark ? "border-slate-700/80" : "border-slate-200"
                      }`}
                  />
                </View>
                <View className="relative items-center">
                  <View
                    className={`px-3 py-0.5 rounded-full ${isDark ? "bg-slate-900/90" : "bg-white"
                      }`}
                  >
                    <Text
                      className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                    >
                      o continúa con
                    </Text>
                  </View>
                </View>
              </View>

              <View className="gap-3">
                <Pressable
                  onPress={handleGoogleLogin}
                  disabled={loading}
                  className={`flex-row items-center justify-center gap-3 w-full border py-3 rounded-xl ${isDark ? "border-slate-700 bg-slate-900" : "border-slate-200 bg-slate-50"
                    }`}
                  style={({ pressed }) => [
                    { opacity: loading ? 0.7 : pressed ? 0.9 : 1 },
                  ]}
                >
                  <View
                    className={`h-8 w-8 rounded-full items-center justify-center ${isDark ? "bg-white" : "bg-white"
                      }`}
                  >
                    <Text className="text-lg font-bold text-slate-900">G</Text>
                  </View>
                  <Text
                    className={`text-sm ${isDark ? "text-white" : "text-slate-900"
                      }`}
                  >
                    Continuar con Google
                  </Text>
                </Pressable>
              </View>

              <Text
                className={`text-sm text-center mt-6 ${isDark ? "text-slate-300" : "text-slate-700"
                  }`}
              >
                ¿Ya tienes una cuenta?{" "}
                <Text
                  onPress={goLogin}
                  className="text-green-500 font-semibold"
                >
                  Inicia sesión
                </Text>
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View className="mt-8 items-center">
          <Text
            className={
              isDark ? "text-slate-400 text-xs" : "text-slate-500 text-xs"
            }
          >
            © {new Date().getFullYear()} FitGenius. Todos los derechos
            reservados.
          </Text>
          <View className="mt-2 flex-row items-center justify-center gap-3">
            <Text
              onPress={goTerminos}
              className={
                isDark
                  ? "text-slate-300 underline"
                  : "text-slate-600 underline"
              }
            >
              Términos y Condiciones
            </Text>
            <Text className={isDark ? "text-slate-400" : "text-slate-600"}>
              •
            </Text>
            <Text
              onPress={goPrivacidad}
              className={
                isDark
                  ? "text-slate-300 underline"
                  : "text-slate-600 underline"
              }
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
              const correo = (payloadUsuario ??
                ({
                  correo: getValues("correo"),
                } as any)).correo as unknown as string;
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
            className={`w-full p-3 rounded-xl border text-sm bg-white dark:bg-[#020617] backdrop-blur focus:border-green-400 ${error
                ? "border-red-400"
                : "border-slate-300 dark:border-slate-700"
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

// app/features/auth/RegistrarScreen.tsx
import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  FormProvider,
  useFormContext,
  Controller,
  type UseFormRegister,
} from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";

import ModernInput from "@/shared/components/ui/ModernInput";
import Toast from "react-native-toast-message";
import EnterCodeVerify from "@/shared/components/auth/EnterCodeVerify";
import GoogleSignInButton from "@/shared/components/ui/GoogleSignInButton";
import { FormUsuario, useRegistrar } from "@/shared/hooks/useRegistrar";
import { useNavigation } from "@react-navigation/native";

export default function RegistrarScreen() {
  const navigation = useNavigation();

  const {
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
  } = useRegistrar();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const openPrivacidad = () => {
    // @ts-ignore
    navigation.navigate("Legal", { initialTab: "privacidad" });
  };

  return (
    <>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          className={isDark ? "bg-[#0b1220]" : "bg-slate-50"}
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 16,
            paddingTop: 30,
            paddingBottom: 50,
            justifyContent: "space-between",
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
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
                      minLength={2}
                      maxLength={40}
                    />
                    <Input
                      label="Apellido"
                      id="apellido"
                      register={register}
                      error={errors.apellido?.message}
                      minLength={2}
                      maxLength={60}
                    />
                    <Input
                      label="Correo electrónico"
                      id="correo"
                      type="email"
                      register={register}
                      error={errors.correo?.message}
                      minLength={6}
                      maxLength={120}
                    />
                    <Input
                      label="Contraseña"
                      id="contrasena"
                      type="password"
                      register={register}
                      error={errors.contrasena?.message}
                      minLength={8}
                      maxLength={64}
                    />

                    <View className="flex-row items-start gap-2 mt-1">
                      <Controller
                        control={methods.control}
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
                        Acepto la{" "}
                        <Text
                          onPress={openPrivacidad}
                          className="text-green-500 font-semibold underline"
                        >
                          información legal (Términos y Privacidad)
                        </Text>
                        .
                      </Text>
                    </View>

                    {errors.acepta && (
                      <Text className="text-red-500 text-xs -mt-1">
                        {errors.acepta.message}
                      </Text>
                    )}

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
                        o
                      </Text>
                    </View>
                  </View>
                </View>

                <GoogleSignInButton
                  text="Continuar con Google"
                  onSuccess={(res) => {
                    handleGoogleLogin(res.token);
                  }}
                  onError={(err) => {
                    console.log("[APP] Error Google Registro:", err.message);
                    Toast.show({
                      type: "error",
                      text1: "Google",
                      text2: "No se pudo continuar con Google. Intenta de nuevo.",
                      position: "top",
                    });
                  }}
                  className="mt-1"
                />

                <Text
                  className={`text-sm text-center mt-6 ${isDark ? "text-slate-300" : "text-slate-700"
                    }`}
                >
                  ¿Ya tienes una cuenta?{" "}
                  <Text onPress={goLogin} className="text-green-500 font-semibold">
                    Inicia sesión
                  </Text>
                </Text>
              </View>
            </LinearGradient>
          </View>

          <View className="mt-8 items-center">
            <Text className={isDark ? "text-slate-400 text-xs" : "text-slate-500 text-xs"}>
              © {new Date().getFullYear()} FitGenius. Todos los derechos reservados.
            </Text>

            <Pressable onPress={openPrivacidad} className="mt-2" hitSlop={10}>
              <Text
                className={
                  isDark
                    ? "text-slate-300 underline text-xs"
                    : "text-slate-600 underline text-xs"
                }
              >
                Legal (Términos y Privacidad)
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {componentCode && (
        <View className="absolute inset-0 z-30 items-center justify-center bg-black/80">
          <EnterCodeVerify
            onComplete={completarRegistro}
            onResend={resendCodigo}
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
  register,
  error,
  type = "text",
  minLength,
  maxLength,
}: {
  label: string;
  id: Exclude<keyof FormUsuario, "acepta">;
  register: UseFormRegister<FormUsuario>;
  error?: string;
  type?: "text" | "number" | "email" | "password";
  minLength?: number;
  maxLength?: number;
}) {
  const { control } = useFormContext<FormUsuario>();
  const isDark = false;

  return (
    <View>
      <Text className="mb-1 font-medium text-slate-700 dark:text-slate-200">
        {label}
      </Text>

      <Controller
        control={control}
        name={id}
        render={({ field: { value, onChange, onBlur } }) => (
          <ModernInput
            type={type}
            value={value ?? ""}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry={type === "password"}
            maxLength={maxLength}
            keyboardType={
              type === "email"
                ? "email-address"
                : type === "number"
                  ? "numeric"
                  : "default"
            }
            autoCapitalize={type === "email" || type === "password" ? "none" : "words"}
            autoCorrect={false}
            className={`w-full p-3 rounded-xl border text-sm
              bg-white dark:bg-[#0b1220]
              text-slate-900 dark:text-slate-50
              backdrop-blur focus:border-green-400
              ${error ? "border-red-400" : "border-slate-300 dark:border-slate-700"}`}
            placeholderTextColor={isDark ? "#94A3B8" : "#64748B"}
          />
        )}
      />

      {!!minLength && (
        <Text className="text-slate-500 text-[11px] mt-1">
          Mínimo: {minLength} caracteres
        </Text>
      )}

      {error && <Text className="text-red-500 text-xs mt-1">{error}</Text>}
    </View>
  );
}
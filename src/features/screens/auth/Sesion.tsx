// src/features/screens/auth/Sesion.tsx
import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import clsx from "clsx";
import GoogleSignInButton from "@/shared/components/ui/GoogleSignInButton";
import { useLogin } from "@/shared/hooks/useLogin";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import { useEffect } from "react";

export default function Sesion() {

  const {
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
  } = useLogin();

  const setShowWizard = useRegistroStore((s) => s.setShowWizard);

  useEffect(() => {
    setShowWizard(false);       // ⬅️ ocultar en Sesion
  }, [setShowWizard]);


  return (
    <View className={clsx("flex-1", isDark ? "bg-[#0b1220]" : "bg-slate-50")}>

      {/* Fondo degradado */}
      <LinearGradient
        colors={bgGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            <View className="flex-1 px-4 py-6">
              <View className="flex-1 items-center justify-center">
                <View className="w-full max-w-md">
                  {/* Header con marca */}
                  <View className="mb-6 items-center">
                    <View className="h-20 w-20 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <Image
                        source={require("../../../../assets/logo.png")}
                        resizeMode="contain"
                        style={{ width: "100%", height: "100%" }}
                      />
                    </View>
                    <Text className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                      FitGenius
                    </Text>
                    <Text className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      Entrena con confianza
                    </Text>
                  </View>

                  {/* Tarjeta sólida */}
                  <View
                    className={clsx(
                      "rounded-3xl p-6 border",
                      isDark
                        ? "bg-slate-900 border-slate-700"
                        : "bg-white border-slate-200 shadow-lg"
                    )}
                  >
                    {/* Formulario */}
                    <View className="gap-5">
                      {/* Correo */}
                      <View>
                        <Text className="mb-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                          Correo electrónico
                        </Text>
                        <Controller
                          control={control}
                          name="correo"
                          rules={{
                            required: "El correo es obligatorio",
                            pattern: { value: /\S+@\S+\.\S+/, message: "Correo inválido" },
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <View className="relative">
                              <Feather
                                name="mail"
                                size={18}
                                style={{ position: "absolute", left: 12, top: 14 }}
                                color={isDark ? "#94a3b8" : "#64748b"}
                              />
                              <TextInput
                                className={clsx(
                                  "w-full rounded-xl border pl-9 pr-3 py-3",
                                  isDark
                                    ? "bg-slate-800 text-slate-100 border-slate-700"
                                    : "bg-slate-50 text-slate-900 border-slate-300",
                                  errors.correo && "border-red-500"
                                )}
                                inputMode="email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="tucorreo@dominio.com"
                                placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
                              />
                            </View>
                          )}
                        />
                        {errors.correo && (
                          <Text className="mt-1 text-sm text-red-500">{errors.correo.message}</Text>
                        )}
                      </View>

                      {/* Contraseña */}
                      <View>
                        <View className="mb-1 flex-row items-center justify-between">
                          <Text className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            Contraseña
                          </Text>
                          <Pressable
                            onPress={() => Linking.openURL("https://tu-dominio.com/auth/forgot")}
                          >
                            <Text className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                              ¿Olvidaste tu contraseña?
                            </Text>
                          </Pressable>
                        </View>

                        <View className="relative">
                          <Controller
                            control={control}
                            name="contrasena"
                            rules={{
                              required: "La contraseña es obligatoria",
                              minLength: { value: 6, message: "Mínimo 6 caracteres" },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <TextInput
                                className={clsx(
                                  "w-full rounded-xl border pl-9 pr-12 py-3",
                                  isDark
                                    ? "bg-slate-800 text-slate-100 border-slate-700"
                                    : "bg-slate-50 text-slate-900 border-slate-300",
                                  errors.contrasena && "border-red-500"
                                )}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Tu contraseña"
                                placeholderTextColor={isDark ? "#94a3b8" : "#94a3b8"}
                              />
                            )}
                          />
                          <Feather
                            name="lock"
                            size={18}
                            style={{ position: "absolute", left: 12, top: 14 }}
                            color={isDark ? "#94a3b8" : "#64748b"}
                          />
                          <Pressable
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                            onPress={() => setShowPassword((s) => !s)}
                            hitSlop={10}
                          >
                            {showPassword ? (
                              <Feather name="eye-off" size={20} color={isDark ? "#e2e8f0" : "#0f172a"} />
                            ) : (
                              <Feather name="eye" size={20} color={isDark ? "#e2e8f0" : "#0f172a"} />
                            )}
                          </Pressable>
                        </View>
                        {errors.contrasena && (
                          <Text className="mt-1 text-sm text-red-500">{errors.contrasena.message}</Text>
                        )}
                      </View>

                      {/* Botón */}
                      <Pressable
                        disabled={loading}
                        onPress={handleSubmit(submitLogin)}
                        className="w-full rounded-xl overflow-hidden"
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
                                Iniciar sesión
                              </Text>
                            )}
                          </View>
                        </LinearGradient>
                      </Pressable>
                    </View>

                    {/* Separador */}
                    <View className="relative my-6">
                      <View className="absolute inset-0 flex-row items-center">
                        <View
                          className={clsx("w-full border-t", isDark ? "border-slate-700" : "border-slate-300")}
                        />
                      </View>
                      <View className="relative items-center">
                        <Text className="px-3 text-xs text-slate-600 dark:text-slate-400">o</Text>
                      </View>
                    </View>

                    {/* Google */}
                    <GoogleSignInButton
                      text="Iniciar sesión con Google"
                      onSuccess={(res) => {
                        loginConGoogle(res.token);
                      }}
                      onError={(err) => console.log("[APP] Error Google:", err.message)}
                      className="mt-4"
                    />

                    {/* Registro */}
                    <Text className="mt-6 text-center text-sm text-slate-700 dark:text-slate-300">
                      ¿No tienes cuenta?{" "}
                      <Text
                        className="font-semibold text-indigo-600 dark:text-indigo-400"
                        onPress={() => nav.navigate("Objetivo")}
                      >
                        Regístrate
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View className="mt-8 items-center">
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  © {new Date().getFullYear()} FitGenius. Todos los derechos reservados.
                </Text>
                <View className="mt-2 flex-row items-center justify-center gap-3">
                  <Text
                    className="text-xs underline underline-offset-2 text-slate-700 dark:text-slate-300"
                    onPress={() => Linking.openURL("https://tu-dominio.com/legal/terminos")}
                  >
                    Términos y Condiciones
                  </Text>
                  <Text className="text-xs text-slate-400">•</Text>
                  <Text
                    className="text-xs underline underline-offset-2 text-slate-700 dark:text-slate-300"
                    onPress={() => Linking.openURL("https://tu-dominio.com/legal/privacidad")}
                  >
                    Política de Privacidad
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

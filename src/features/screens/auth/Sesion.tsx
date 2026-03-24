import {
  View,
  Text,
  Image,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Controller } from "react-hook-form";
import { LinearGradient } from "expo-linear-gradient";
import { Mail, Lock, Eye, EyeOff } from "lucide-react-native";
import clsx from "clsx";
import GoogleSignInButton from "@/shared/components/ui/GoogleSignInButton";
import { useLogin } from "@/shared/hooks/useLogin";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import { useEffect, useState } from "react";
import PasswordResetModal from "@/shared/components/auth/PasswordResetModal";

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
    loginConGoogle,
  } = useLogin();

  const setShowWizard = useRegistroStore((s) => s.setShowWizard);

  const [openReset, setOpenReset] = useState(false);

  useEffect(() => {
    setShowWizard(false);
  }, [setShowWizard]);

  const openLegal = () => {
    // @ts-ignore
    nav.navigate("Legal", { initialTab: "terminos" });
  };

  return (
    <View className={clsx("flex-1", isDark ? "bg-[#0b1220]" : "bg-slate-50")}>
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
          <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled"
          >
            <View className="flex-1 px-4 py-6">
              <View className="flex-1 items-center justify-center">
                <View className="w-full max-w-md">
                  <View className="mb-6 items-center">
                    <View className="h-20 w-20 overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800">
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

                  <View
                    className={clsx(
                      "rounded-3xl border p-6",
                      isDark
                        ? "border-slate-700 bg-slate-900"
                        : "border-slate-200 bg-white shadow-lg"
                    )}
                  >
                    <View className="gap-5">
                      <View>
                        <Text className="mb-1 text-sm font-medium text-slate-800 dark:text-slate-200">
                          Correo electrónico
                        </Text>

                        <Controller
                          control={control}
                          name="correo"
                          rules={{
                            required: "El correo es obligatorio",
                            pattern: {
                              value: /\S+@\S+\.\S+/,
                              message: "Correo inválido",
                            },
                          }}
                          render={({ field: { onChange, onBlur, value } }) => (
                            <View className="relative">
                              <View className="absolute left-3 top-0 bottom-0 z-10 justify-center">
                                <Mail
                                  size={18}
                                  color={isDark ? "#94a3b8" : "#64748b"}
                                />
                              </View>

                              <TextInput
                                className={clsx(
                                  "w-full rounded-xl border py-3 pl-10 pr-3",
                                  isDark
                                    ? "border-slate-700 bg-slate-800 text-slate-100"
                                    : "border-slate-300 bg-slate-50 text-slate-900",
                                  errors.correo && "border-red-500"
                                )}
                                inputMode="email"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="tucorreo@dominio.com"
                                placeholderTextColor="#94a3b8"
                              />
                            </View>
                          )}
                        />

                        {errors.correo && (
                          <Text className="mt-1 text-sm text-red-500">
                            {errors.correo.message}
                          </Text>
                        )}
                      </View>

                      <View>
                        <View className="mb-1 flex-row items-center justify-between">
                          <Text className="text-sm font-medium text-slate-800 dark:text-slate-200">
                            Contraseña
                          </Text>

                          <Pressable onPress={() => setOpenReset(true)}>
                            <Text className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                              ¿Olvidaste tu contraseña?
                            </Text>
                          </Pressable>
                        </View>

                        <View className="relative">
                          <View className="absolute left-3 top-0 bottom-0 z-10 justify-center">
                            <Lock
                              size={18}
                              color={isDark ? "#94a3b8" : "#64748b"}
                            />
                          </View>

                          <Controller
                            control={control}
                            name="contrasena"
                            rules={{
                              required: "La contraseña es obligatoria",
                              minLength: {
                                value: 6,
                                message: "Mínimo 6 caracteres",
                              },
                            }}
                            render={({ field: { onChange, onBlur, value } }) => (
                              <TextInput
                                className={clsx(
                                  "w-full rounded-xl border py-3 pl-10 pr-12",
                                  isDark
                                    ? "border-slate-700 bg-slate-800 text-slate-100"
                                    : "border-slate-300 bg-slate-50 text-slate-900",
                                  errors.contrasena && "border-red-500"
                                )}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                                onBlur={onBlur}
                                onChangeText={onChange}
                                value={value}
                                placeholder="Tu contraseña"
                                placeholderTextColor="#94a3b8"
                              />
                            )}
                          />

                          <Pressable
                            className="absolute right-3 top-0 bottom-0 justify-center"
                            onPress={() => setShowPassword((s) => !s)}
                            hitSlop={10}
                          >
                            {showPassword ? (
                              <EyeOff
                                size={20}
                                color={isDark ? "#e2e8f0" : "#0f172a"}
                              />
                            ) : (
                              <Eye
                                size={20}
                                color={isDark ? "#e2e8f0" : "#0f172a"}
                              />
                            )}
                          </Pressable>
                        </View>

                        {errors.contrasena && (
                          <Text className="mt-1 text-sm text-red-500">
                            {errors.contrasena.message}
                          </Text>
                        )}
                      </View>

                      <Pressable
                        disabled={loading}
                        onPress={handleSubmit(submitLogin)}
                        className="w-full overflow-hidden rounded-xl"
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
                          <View className="items-center justify-center px-4 py-3">
                            {loading ? (
                              <ActivityIndicator size="small" color="#ffffff" />
                            ) : (
                              <Text className="font-bold tracking-wide text-white">
                                Iniciar sesión
                              </Text>
                            )}
                          </View>
                        </LinearGradient>
                      </Pressable>
                    </View>

                    <View className="relative my-6">
                      <View className="absolute inset-0 flex-row items-center">
                        <View
                          className={clsx(
                            "w-full border-t",
                            isDark ? "border-slate-700" : "border-slate-300"
                          )}
                        />
                      </View>

                      <View className="relative items-center">
                        <Text className="px-3 text-xs text-slate-600 dark:text-slate-400">
                          o
                        </Text>
                      </View>
                    </View>

                    <GoogleSignInButton
                      text="Iniciar sesión con Google"
                      onSuccess={(res) => {
                        loginConGoogle(res.token);
                      }}
                      onError={(err) =>
                        console.log("[APP] Error Google:", err.message)
                      }
                      className="mt-4"
                    />

                    <Text className="mt-6 text-center text-sm text-slate-700 dark:text-slate-300">
                      ¿No tienes cuenta?{" "}
                      <Text
                        className="font-semibold text-indigo-600 dark:text-indigo-400"
                        onPress={() => nav.navigate("Registro")}
                      >
                        Regístrate
                      </Text>
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-8 items-center">
                <Text className="text-xs text-slate-500 dark:text-slate-400">
                  © {new Date().getFullYear()} FitGenius. Todos los derechos
                  reservados.
                </Text>

                <Pressable onPress={openLegal} className="mt-2" hitSlop={10}>
                  <Text className="text-xs text-slate-700 underline underline-offset-2 dark:text-slate-300">
                    Legal (Términos y Privacidad)
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      <PasswordResetModal
        visible={openReset}
        onClose={() => setOpenReset(false)}
        onSuccess={() => setOpenReset(false)}
      />
    </View>
  );
}
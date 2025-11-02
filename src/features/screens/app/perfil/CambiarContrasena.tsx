// src/features/fit/screens/CambiarContrasenaScreen.tsx
import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  View, Text, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react-native";
import { cambiarContrasena } from "@/features/api/usuario.api";

/* Validación */
const schema = z.object({
  contrasenaActual: z.string().min(1, "La contraseña actual es requerida"),
  nuevaContrasena: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres"),
  confirmar: z.string(),
}).refine((d) => d.nuevaContrasena === d.confirmar, {
  path: ["confirmar"], message: "Las contraseñas no coinciden",
});

export default function CambiarContrasenaScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const nav = useNavigation<any>();

  // ⏳ exactamente como Home: usamos un loading inicial para mostrar el Skeleton
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // si necesitas verificar sesión/usuario/etc. simula breve bootstrap
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [cargando, setCargando] = useState(false);

  const [showActual, setShowActual] = useState(false);
  const [showNueva, setShowNueva] = useState(false);
  const [showConfirmar, setShowConfirmar] = useState(false);

  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  const onSubmit = useCallback(async () => {
    const parsed = schema.safeParse({
      contrasenaActual: actual, nuevaContrasena: nueva, confirmar,
    });
    if (!parsed.success) {
      const msg = parsed.error.errors[0]?.message ?? "Datos inválidos";
      Toast.show({ type: "error", text1: "Error", text2: msg });
      return;
    }

    try {
      setCargando(true);
      Toast.show({ type: "info", text1: "Cambiando contraseña..." });
      await cambiarContrasena(actual, nueva);
      Toast.show({ type: "success", text1: "Contraseña actualizada exitosamente" });
      setActual(""); setNueva(""); setConfirmar("");
      setTimeout(() => nav.navigate("Cuenta"), 400);
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Error al cambiar la contraseña";
      Toast.show({ type: "error", text1: "Error", text2: msg });
    } finally {
      setCargando(false);
    }
  }, [actual, nueva, confirmar, nav]);

  const Field = ({
    label, value, onChangeText, isVisible, onToggleVisible, a11y,
  }: {
    label: string; value: string; onChangeText: (t: string) => void;
    isVisible: boolean; onToggleVisible: () => void; a11y: string;
  }) => (
    <View>
      <Text className="text-sm font-semibold mb-1" style={{ color: textPrimary }}>
        {label}
      </Text>
      <View className="relative">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!isVisible}
          autoCapitalize="none"
          placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
          className="rounded-2xl px-4 py-3 pr-12"
          style={{
            backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#fff",
            color: textPrimary,
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb",
          }}
          accessibilityLabel={a11y}
        />
        <Pressable
          onPress={onToggleVisible}
          accessibilityRole="button"
          accessibilityLabel={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-0 bottom-0 items-center justify-center"
          style={{ width: 36 }}
        >
          {isVisible ? <EyeOff size={18} color={textSecondary} /> : <Eye size={18} color={textSecondary} />}
        </Pressable>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
      <View className="flex-1 px-4 py-8" style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}>
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-2xl font-extrabold text-center" style={{ color: textPrimary }}>
            Cambiar contraseña
          </Text>
          <Text className="text-sm mt-1 text-center" style={{ color: textSecondary }}>
            Actualiza tus credenciales de forma segura.
          </Text>
        </View>

        {/* Card (igual patrón Home: marco degradado + card interior) */}
        <View className="w-full" style={{ maxWidth: 520, alignSelf: "center" }}>
          <LinearGradient
            colors={marcoGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-[1px]"
            style={{ borderRadius: 16, overflow: "hidden" }}
          >
            <View
              className="px-5 py-6"
              style={{
                borderRadius: 16,
                backgroundColor: isDark ? "#0b1220" : "rgba(255,255,255,0.90)",
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)",
                gap: 20,
              }}
            >
              <View
                className="rounded-lg px-3 py-2"
                style={{
                  backgroundColor: isDark ? "rgba(148,163,184,0.16)" : "#f5f5f5",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
                }}
              >
                <Text className="text-[11px]" style={{ color: textSecondary }}>
                  Consejo: usa al menos 10 caracteres con mayúsculas, minúsculas, números y símbolos.
                </Text>
              </View>

              <View className="gap-5">
                <Field
                  label="Contraseña actual"
                  value={actual}
                  onChangeText={setActual}
                  isVisible={showActual}
                  onToggleVisible={() => setShowActual((v) => !v)}
                  a11y="Introduce tu contraseña actual"
                />
                <Field
                  label="Nueva contraseña"
                  value={nueva}
                  onChangeText={setNueva}
                  isVisible={showNueva}
                  onToggleVisible={() => setShowNueva((v) => !v)}
                  a11y="Introduce tu nueva contraseña"
                />
                <Field
                  label="Confirmar nueva contraseña"
                  value={confirmar}
                  onChangeText={setConfirmar}
                  isVisible={showConfirmar}
                  onToggleVisible={() => setShowConfirmar((v) => !v)}
                  a11y="Confirma tu nueva contraseña"
                />

                {/* CTA con borde degradado y pill grande */}
                <View className="mt-2">
                  <LinearGradient
                    colors={marcoGradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="p-[1px]"
                    style={{ borderRadius: 999 }}
                  >
                    <Pressable
                      onPress={onSubmit}
                      disabled={cargando}
                      className="items-center py-3"
                      style={{
                        borderRadius: 999,
                        backgroundColor: isDark ? "#0f172a" : "#ffffff",
                        opacity: cargando ? 0.6 : 1,
                      }}
                      accessibilityRole="button"
                      accessibilityState={{ disabled: cargando }}
                    >
                      {cargando ? (
                        <ActivityIndicator />
                      ) : (
                        <Text className="font-semibold" style={{ color: textPrimary }}>
                          Cambiar contraseña
                        </Text>
                      )}
                    </Pressable>
                  </LinearGradient>

                  <Text className="text-[11px] text-center mt-2" style={{ color: textSecondary }}>
                    Asegúrate de recordar tu nueva contraseña.
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

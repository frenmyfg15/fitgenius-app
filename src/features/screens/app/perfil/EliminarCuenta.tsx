// src/features/fit/screens/EliminarCuentaScreen.tsx
import React, { useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";
import { ShieldAlert, Trash2 } from "lucide-react-native";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { eliminarCuentaUsuario } from "@/features/api/usuario.api";

export default function EliminarCuenta() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const nav = useNavigation<any>();
  const { setUsuario } = useUsuarioStore();

  const [confirmacion, setConfirmacion] = useState("");
  const [cargando, setCargando] = useState(false);

  const matchText = "eliminar mi cuenta";
  const canSubmit = confirmacion.trim().toLowerCase() === matchText;

  // 🎨 Paleta y estilos coherentes con tus cards
  const ui = useMemo(
    () => ({
      marcoGradient: ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"],
      cardBg: isDark ? "rgba(20,28,44,0.85)" : "rgba(255,255,255,0.98)",
      cardBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
      textPrimary: isDark ? "#e5e7eb" : "#0f172a",
      textSecondary: isDark ? "#94a3b8" : "#64748b",
      inputBg: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
      inputBorder: isDark ? "rgba(255,255,255,0.15)" : "#e5e7eb",
      dangerBg: isDark ? "rgba(239,68,68,0.12)" : "#fef2f2",
      dangerBorder: isDark ? "rgba(239,68,68,0.35)" : "#fecaca",
      dangerText: isDark ? "#fca5a5" : "#b91c1c",
      redSolid: "#dc2626",
      redSolidHover: "#b91c1c",
    }),
    [isDark]
  );

  const handleEliminar = useCallback(async () => {
    if (!canSubmit) {
      Toast.show({
        type: "error",
        text1: 'Escribe exactamente: "Eliminar mi cuenta".',
      });
      return;
    }

    try {
      setCargando(true);
      Toast.show({ type: "info", text1: "Eliminando tu cuenta…" });

      await eliminarCuentaUsuario();

      Toast.show({
        type: "success",
        text1: "Cuenta eliminada correctamente.",
      });
      setUsuario(null);
      nav.reset({
        index: 0,
        routes: [{ name: "Inicio" }],
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "No se pudo eliminar la cuenta. Inténtalo de nuevo.";
      Toast.show({ type: "error", text1: "Error", text2: msg });
    } finally {
      setCargando(false);
    }
  }, [canSubmit, nav, setUsuario]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View
        className="flex-1 items-center justify-center px-4 py-12"
        style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}
      >
        {/* Marco con borde degradado */}
        <LinearGradient
          colors={ui.marcoGradient as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: 16, padding: 1, width: "100%", maxWidth: 520 }}
        >
          {/* Panel interior */}
          <View
            style={{
              borderRadius: 16,
              backgroundColor: ui.cardBg,
              borderWidth: 1,
              borderColor: ui.cardBorder,
              padding: 20,
            }}
          >
            <View className="items-center">
              <View
                style={{
                  height: 56,
                  width: 56,
                  borderRadius: 999,
                  backgroundColor: isDark ? "rgba(239,68,68,0.14)" : "#fee2e2",
                  borderWidth: 1,
                  borderColor: ui.dangerBorder,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ShieldAlert size={28} color={ui.dangerText} />
              </View>

              <Text
                className="mt-4 text-center font-semibold"
                style={{ color: ui.textPrimary, fontSize: 22 }}
              >
                Eliminar tu cuenta
              </Text>

              <Text
                className="mt-2 text-center"
                style={{ color: ui.textSecondary, fontSize: 13 }}
              >
                Esta acción es <Text style={{ fontWeight: "700" }}>irreversible</Text>. Se
                eliminarán tus datos, progreso y configuración de forma permanente.
              </Text>
            </View>

            {/* Aviso accesible */}
            <View
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
              style={{
                marginTop: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: ui.dangerBorder,
                backgroundColor: ui.dangerBg,
                paddingHorizontal: 12,
                paddingVertical: 10,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
              }}
            >
              <ShieldAlert size={20} color={ui.dangerText} />
              <Text style={{ color: ui.dangerText, fontSize: 13, flex: 1 }}>
                <Text style={{ fontWeight: "700" }}>Advertencia crítica:</Text> confirma que
                comprendes las consecuencias antes de continuar.
              </Text>
            </View>

            {/* Formulario */}
            <View style={{ marginTop: 16, gap: 14 }}>
              <View>
                <Text
                  style={{
                    color: ui.textPrimary,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 6,
                  }}
                >
                  Para confirmar, escribe{" "}
                  <Text style={{ color: ui.dangerText, fontWeight: "700" }}>
                    Eliminar mi cuenta
                  </Text>
                </Text>

                <TextInput
                  value={confirmacion}
                  onChangeText={setConfirmacion}
                  placeholder="Eliminar mi cuenta"
                  placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={{
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: ui.inputBorder,
                    backgroundColor: ui.inputBg,
                    color: ui.textPrimary,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                  }}
                  accessibilityLabel="Confirmación de eliminación"
                  accessibilityHint='Escribe: "Eliminar mi cuenta"'
                />

                <Text
                  style={{
                    marginTop: 6,
                    color: ui.textSecondary,
                    fontSize: 11,
                  }}
                >
                  Debe coincidir exactamente (mayúsculas/minúsculas no importan).
                </Text>
              </View>

              {/* Botón destruir */}
              <Pressable
                onPress={handleEliminar}
                disabled={cargando}
                accessibilityRole="button"
                accessibilityState={{ disabled: cargando }}
                style={{
                  marginTop: 4,
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: "center",
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                  backgroundColor: ui.redSolid,
                  opacity: cargando ? 0.75 : 1,
                }}
              >
                {cargando ? (
                  <>
                    <Trash2 size={18} color="#fff" />
                    <ActivityIndicator color="#fff" />
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
                    >
                      Eliminando…
                    </Text>
                  </>
                ) : (
                  <>
                    <Trash2 size={18} color="#fff" />
                    <Text
                      style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}
                    >
                      Eliminar cuenta permanentemente
                    </Text>
                  </>
                )}
              </Pressable>

              {/* Nota de responsabilidad */}
              <Text
                style={{
                  marginTop: 6,
                  color: ui.textSecondary,
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                Si tienes dudas, puedes{" "}
                <Text
                  onPress={() => nav.navigate("Configuracion")}
                  style={{
                    textDecorationLine: "underline",
                    color: isDark ? "#cbd5e1" : "#334155",
                  }}
                >
                  revisar tu configuración
                </Text>{" "}
                antes de eliminar.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </View>
    </KeyboardAvoidingView>
  );
}

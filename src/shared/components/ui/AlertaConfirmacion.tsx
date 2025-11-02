import React from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

interface AlertaConfirmacionProps {
  visible: boolean;
  titulo?: string;
  mensaje: string;
  onCancelar: () => void;
  onConfirmar: () => void;
  loading?: boolean;
  textoConfirmar?: string;
  textoCancelar?: string;
}

const AlertaConfirmacion: React.FC<AlertaConfirmacionProps> = ({
  visible,
  titulo = "¿Estás seguro?",
  mensaje,
  onCancelar,
  onConfirmar,
  loading = false,
  textoConfirmar = "Confirmar",
  textoCancelar = "Cancelar",
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;

  const gradientFrame = isDark
    ? ["#111a2b", "#0b1220", "#111a2b"]
    : ["#39ff14", "#14ff80", "#22c55e"];

  return (
    <View
      className="absolute inset-0 z-50"
      style={{
        backgroundColor: "rgba(0,0,0,0.4)", // sin blur real para evitar solapados
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 12,
      }}
      // Accesibilidad del modal
      accessibilityViewIsModal
      accessibilityLabel="Diálogo de confirmación"
      pointerEvents="auto"
    >
      <LinearGradient
        colors={gradientFrame as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[1px] w-full max-w-[380px]"
      >
        <View
          className="rounded-2xl px-6 py-6"
          style={{
            backgroundColor: isDark ? "#0b1220" : "rgba(255,255,255,0.95)",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.60)",
            shadowOpacity: 0.2,
            shadowRadius: 14,
            shadowOffset: { width: 0, height: 10 },
            elevation: 8,
          }}
          accessible
        >
          <Text
            className="text-lg font-bold text-center"
            style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
          >
            {titulo}
          </Text>

          <Text
            className="text-sm text-center mt-2"
            style={{ color: isDark ? "#94a3b8" : "#64748b" }}
          >
            {mensaje}
          </Text>

          <View className="flex-row justify-center gap-4 mt-5">
            {/* Botón cancelar (borde 1px, radio grande) */}
            <Pressable
              onPress={onCancelar}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Cancelar"
              className="rounded-full px-4 py-2"
              style={{
                borderWidth: 1,
                borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb",
                backgroundColor: isDark ? "#0b1220" : "#f3f4f6",
                opacity: loading ? 0.7 : 1,
              }}
            >
              <Text
                className="text-sm font-medium"
                style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
              >
                {textoCancelar}
              </Text>
            </Pressable>

            {/* Botón confirmar (CTA con borde degradado + relleno) */}
            <LinearGradient
              colors={gradientFrame as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="rounded-full p-[1px]"
            >
              <Pressable
                onPress={onConfirmar}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel="Confirmar"
                className="rounded-full px-4 py-2 flex-row items-center justify-center"
                style={{
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                  minWidth: 120,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" />
                ) : (
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: isDark ? "#e5e7eb" : "#0f172a" }}
                  >
                    {textoConfirmar}
                  </Text>
                )}
              </Pressable>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

export default AlertaConfirmacion;

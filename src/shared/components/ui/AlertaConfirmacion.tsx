// src/shared/components/ui/AlertaConfirmacion.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
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

  const bg = isDark ? "#020617" : "#f9fafb";
  const surface = isDark ? "rgba(15,23,42,0.96)" : "#ffffff";
  const border = isDark ? "rgba(148,163,184,0.25)" : "rgba(15,23,42,0.06)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#6b7280";
  const accent = "#3b82f6";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancelar}
    >
      <TouchableWithoutFeedback onPress={loading ? undefined : onCancelar}>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(15,23,42,0.8)",
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
          accessibilityViewIsModal
          accessibilityLabel="Diálogo de confirmación"
        >
          <View
            style={{
              maxWidth: 480,
              width: "100%",
              backgroundColor: surface,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: border,
              shadowColor: "#000",
              shadowOpacity: isDark ? 0.25 : 0.08,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 10 },
              elevation: 6,
            }}
          >
            <View
              style={{
                padding: 24,
                gap: 16,
              }}
            >
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: textPrimary,
                  textAlign: "center",
                }}
              >
                {titulo}
              </Text>

              <Text
                style={{
                  fontSize: 14,
                  color: textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {mensaje}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  gap: 12,
                }}
              >
                {/* Botón Cancelar (neutral) */}
                <Pressable
                  onPress={onCancelar}
                  disabled={loading}
                  role="button"
                  accessibilityLabel="Cancelar"
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: isDark
                      ? "rgba(148,163,184,0.12)"
                      : "#f3f4f6",
                    borderWidth: 1,
                    borderColor: isDark
                      ? "rgba(255,255,255,0.10)"
                      : "#e5e7eb",
                    opacity: pressed || loading ? 0.85 : 1,
                  })}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: textPrimary,
                    }}
                  >
                    {textoCancelar}
                  </Text>
                </Pressable>

                {/* Botón Confirmar (acción principal) */}
                <Pressable
                  onPress={onConfirmar}
                  disabled={loading}
                  role="button"
                  accessibilityLabel="Confirmar"
                  style={({ pressed }) => ({
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: accent,
                    opacity: pressed || loading ? 0.85 : 1,
                    minWidth: 100,
                    alignItems: "center",
                    justifyContent: "center",
                    shadowColor: "#000",
                    shadowOpacity: 0.2,
                    shadowRadius: 4,
                    shadowOffset: { width: 0, height: 2 },
                  })}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <Text
                      style={{
                        color: "#ffffff",
                        fontSize: 14,
                        fontWeight: "700",
                      }}
                    >
                      {textoConfirmar}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default AlertaConfirmacion;

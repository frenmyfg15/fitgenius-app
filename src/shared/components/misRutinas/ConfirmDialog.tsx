// src/shared/components/misRutinas/ConfirmDialog.tsx
import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

type Props = {
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  isDark: boolean;
};

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText,
  cancelText,
  loading = false,
  onCancel,
  onConfirm,
  isDark,
}: Props) {
  // 🎨 mismos tokens que GlobalErrorModalProvider / AlertaConfirmacion
  const cardBgDark = "rgba(20, 28, 44, 0.9)";
  const cardBorderDark = "rgba(255,255,255,0.12)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#94a3b8";
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const overlayBg = "rgba(15,23,42,0.85)";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={loading ? undefined : onCancel}>
        <View
          style={{
            flex: 1,
            backgroundColor: overlayBg,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 24,
          }}
          accessibilityViewIsModal
          accessibilityLabel="Diálogo de confirmación"
        >
          <TouchableWithoutFeedback onPress={() => {}}>
            <LinearGradient
              colors={marcoGradient as any}
              style={{
                width: "100%",
                borderRadius: 18,
                padding: 1,
                maxWidth: 480,
              }}
            >
              <View
                style={{
                  borderRadius: 16,
                  padding: 20,
                  backgroundColor: isDark ? cardBgDark : "#ffffff",
                  borderWidth: 1,
                  borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: isDark ? textPrimaryDark : "#0f172a",
                    marginBottom: 8,
                    textAlign: "center",
                  }}
                >
                  {title}
                </Text>

                <Text
                  style={{
                    fontSize: 14,
                    color: isDark ? textSecondaryDark : "#6b7280",
                    marginBottom: 16,
                    textAlign: "center",
                  }}
                >
                  {message}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "flex-end",
                    gap: 22,
                  }}
                >
                  {/* Cancelar (pill) */}
                  <Pressable
                    onPress={onCancel}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar"
                    style={({ pressed }) => ({
                      paddingHorizontal: 16,
                      paddingVertical: 10,
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
                        fontWeight: "700",
                        color: isDark ? textPrimaryDark : "#0f172a",
                      }}
                    >
                      {cancelText}
                    </Text>
                  </Pressable>

                  {/* Confirmar (verde, pill) */}
                  <Pressable
                    onPress={onConfirm}
                    disabled={loading}
                    accessibilityRole="button"
                    accessibilityLabel="Confirmar"
                    style={({ pressed }) => ({
                      paddingHorizontal: 18,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: isDark ? "#22C55E" : "#16a34a",
                      opacity: pressed || loading ? 0.85 : 1,
                      minWidth: 120,
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
                          color: isDark ? "#ffffff" : "#000000",
                          fontSize: 14,
                          fontWeight: "800",
                        }}
                      >
                        {confirmText}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </View>
            </LinearGradient>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

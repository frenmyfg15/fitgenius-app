// src/shared/components/misRutinas/ConfirmDialog.tsx
import React from "react";
import { Modal, View, Text, Pressable } from "react-native";

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
  visible, title, message, confirmText, cancelText, loading, onCancel, onConfirm, isDark,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center", padding: 16 }}>
        <View
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 16,
            backgroundColor: isDark ? "#0b1220" : "#ffffff",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.06)",
            padding: 16,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "800", color: isDark ? "#e5e7eb" : "#0f172a", textAlign: "center" }}>{title}</Text>
          <Text style={{ marginTop: 8, fontSize: 14, color: isDark ? "#94a3b8" : "#475569", textAlign: "center" }}>{message}</Text>

          <View style={{ marginTop: 16, flexDirection: "row", justifyContent: "flex-end" }}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => [
                {
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb",
                  opacity: pressed ? 0.85 : 1,
                  marginRight: 10,
                },
              ]}
            >
              <Text style={{ color: isDark ? "#e5e7eb" : "#0f172a", fontWeight: "700" }}>{cancelText}</Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={({ pressed }) => [
                {
                  paddingVertical: 10,
                  paddingHorizontal: 16,
                  borderRadius: 999,
                  backgroundColor: "#ef4444",
                  opacity: loading ? 0.6 : pressed ? 0.9 : 1,
                },
              ]}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>{loading ? "Eliminando…" : confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

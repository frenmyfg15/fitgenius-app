import React from "react";
import { Modal, View, Text, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { useColorScheme } from "nativewind";

type Props = {
  visible: boolean;
  onClose: () => void;
  value?: number;
};

export default function CaloriasModal({ visible, onClose, value = 0 }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;

  const C = {
    bg: isDark ? "#0f172a" : "#ffffff",
    fg: isDark ? "#e2e8f0" : "#111827",
    mut: isDark ? "#94a3b8" : "#6b7280",
    border: isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb",
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.backdrop} />
      <View style={styles.center}>
        <View style={[styles.card, { backgroundColor: C.bg, borderColor: C.border }]}>
          <Text style={[styles.title, { color: C.fg }]}>Calorías quemadas</Text>
          <Text style={[styles.value, { color: C.fg }]}>{new Intl.NumberFormat("es-ES").format(value)}</Text>
          <Text style={[styles.desc, { color: C.mut }]}>
            Estimadas según tus ejercicios e intensidad. Úsalas para ajustar tu ingesta diaria y cumplir objetivos.
          </Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { borderColor: C.border, backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#f3f4f6" }]}>
              <Text style={[styles.btnText, { color: C.fg }]}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.35)" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16 },
  card: {
    width: "100%", maxWidth: 420, borderRadius: 16, borderWidth: 1, padding: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 24,
    ...(Platform.OS === "android" ? { elevation: 10 } : null),
  },
  title: { fontSize: 18, fontWeight: "800" },
  value: { fontSize: 28, fontWeight: "800", marginTop: 4 },
  desc: { marginTop: 8, fontSize: 14, lineHeight: 20 },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 16 },
  btn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },
  btnText: { fontWeight: "700" },
});

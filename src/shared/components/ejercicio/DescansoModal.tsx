import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

type Props = {
  visible: boolean;
  tiempo: number;
  onFinalizar: () => void;
};

export default function DescansoModal({ visible, tiempo, onFinalizar }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  if (!visible) return null;

  return (
    <View
      style={[styles.overlay, { backgroundColor: t.overlay }]}
      className="z-50 items-center justify-center px-6"
      accessibilityViewIsModal
      accessibilityLabel="Modal de descanso activo"
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
            borderColor: t.border,
          },
        ]}
      >
        <Text style={[styles.title, { color: t.textPrimary }]}>
          Descanso activo
        </Text>

        <Text
          style={[styles.timer, { color: t.textPrimary }]}
          accessibilityRole="text"
        >
          {tiempo}
        </Text>

        <TouchableOpacity
          onPress={onFinalizar}
          activeOpacity={0.9}
          accessibilityRole="button"
          accessibilityLabel="Finalizar descanso"
          style={styles.btn}
        >
          <Text style={styles.btnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  card: {
    width: "100%",
    maxWidth: 384,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    ...TextStyle.label,
    fontFamily: Font.body.semiBold,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  timer: {
    fontSize: 160,
    lineHeight: 160,
    fontFamily: Font.title.bold,
    textAlign: "center",
    marginTop: 8,
  },
  btn: {
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 8,
    backgroundColor: Colors.accent,
  },
  btnText: {
    ...TextStyle.body,
    fontFamily: Font.body.semiBold,
    color: Colors.primary,
  },
});

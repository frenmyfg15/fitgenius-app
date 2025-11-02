// shared/components/ui/WizardProgressBar.tsx
import React, { useEffect, useMemo, useRef, memo } from "react";
import { View, Text, StyleSheet, Animated, Platform, StatusBar as RNStatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import { getRegistroProgressFromUsuario } from "@/shared/utils/progress";

type Props = {
  isDark: boolean;
  height?: number;
  marginTop?: number;
  offsetTop?: number;
  visible?: boolean;
  debugText?: boolean; // muestra (count/total) al lado del %
};

function WizardProgressBarBase({
  isDark,
  height = 12,
  marginTop = 0,
  offsetTop,
  visible = true,
  debugText = false,
}: Props) {
  if (!visible) return null;

  const usuario = useRegistroStore((s) => s.usuario);
  const { count, total, progress } = getRegistroProgressFromUsuario(usuario);

  // % mostrado
  const percent = Math.max(0, Math.min(100, Math.round(progress * 100)));

  // Animación de ancho en %
  const anim = useRef(new Animated.Value(progress)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 500, useNativeDriver: false }).start();
  }, [progress]);

  const width = useMemo(
    () => anim.interpolate({ inputRange: [0, 1], outputRange: ["0%", "100%"] }),
    [anim]
  );

  const bg    = isDark ? "#0b0b0c" : "#f6f7fb";
  const label = isDark ? "#e5e5e5" : "#404040";
  const track = isDark ? "#2a2a2e" : "#e5e5e5";

  // Compensación del status bar (sin SafeArea)
  const STATUS_OFFSET = offsetTop ?? (Platform.OS === "ios" ? 44 : RNStatusBar.currentHeight ?? 24);
  const paddingTop = 12 + STATUS_OFFSET + marginTop;

  return (
    <View
      pointerEvents="none"
      accessibilityRole="progressbar"
      accessibilityValue={{ now: percent, min: 0, max: 100, text: `${percent}%` }}
      style={[styles.wrapper, { backgroundColor: bg, paddingTop }]}
    >
      <Text style={[styles.label, { color: label }]}>
        {percent}% completado {debugText ? `(${count}/${total})` : ""}
      </Text>

      <View style={[styles.track, { height, backgroundColor: track }]}>
        <Animated.View style={[styles.fillWrapper, { width }]}>
          <LinearGradient
            colors={["#4ade80", "#22c55e"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fill}
          />
        </Animated.View>
      </View>
    </View>
  );
}

export default memo(WizardProgressBarBase);

const styles = StyleSheet.create({
  wrapper: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 5, width: "100%", paddingHorizontal: 24, paddingBottom: 8 },
  label: { textAlign: "center", fontSize: 12, marginBottom: 6, fontWeight: "600", letterSpacing: 0.3 },
  track: { width: "100%", borderRadius: 999, overflow: "hidden" },
  fillWrapper: { height: "100%" },
  fill: { height: "100%" },
});

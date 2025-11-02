// shared/components/WizardProgressHeader.tsx
import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthStackParamList } from "@/features/navigation/Auth";

const REG_STEPS = [
  "Objetivo",
  "Sexo",
  "Enfoque",
  "Nivel",
  "Actividad",
  "Lugar",
  "Equipamiento",
  "Altura",
  "Peso",
  "PesoObjetivo",
  "Edad",
  "Dias",
  "Duracion",
  "Limitaciones",
  "Registrar",
  "FinalRegistro",
] as const;

const HIDE_ON: (keyof AuthStackParamList)[] = ["Sesion", "Registrar", "FinalRegistro"];

type Props = {
  isDark: boolean;
  height?: number;
  marginTop?: number; // extra margen manual además del SafeArea
};

export default function WizardProgressHeader({
  isDark,
  height = 12,
  marginTop = 8,
}: Props) {
  const route = useRoute<RouteProp<AuthStackParamList>>();
  const name = route.name;
  const insets = useSafeAreaInsets();

  if (HIDE_ON.includes(name)) return null;

  const idx = REG_STEPS.indexOf(name as any);
  if (idx === -1) return null;

  const total = REG_STEPS.length;
  const paso = idx + 1;
  const progress = paso / total;

  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: progress, duration: 700, useNativeDriver: false }).start();
  }, [progress]);

  const width = useMemo(
    () =>
      anim.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
      }),
    [anim]
  );

  const bg = isDark ? "#0b0b0c" : "#ffffff";
  const label = isDark ? "#e5e5e5" : "#404040";
  const track = isDark ? "#2a2a2e" : "#e5e5e5";
  const shadow = isDark ? "#00000000" : "#00000010"; // sombra suave solo en claro

  return (
    <View
      style={[
        styles.wrapper,
        {
          backgroundColor: bg,
          paddingTop: 12 + insets.top,
          marginTop,
          shadowColor: shadow,
        },
      ]}
    >
      <Text style={[styles.label, { color: label }]}>
        Paso {paso} de {total}
      </Text>

      <View style={[styles.track, { height, backgroundColor: track }]}>
        <Animated.View style={[styles.fillWrapper, { width }]}>
          <LinearGradient
            // Mantengo el mismo gradiente; puedes ajustar si quieres otro para dark
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

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  label: {
    textAlign: "center",
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  track: {
    width: "100%",
    borderRadius: 999,
    overflow: "hidden",
  },
  fillWrapper: {
    height: "100%",
  },
  fill: {
    height: "100%",
  },
});

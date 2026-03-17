import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { useColorScheme } from "nativewind";
import LottieView from "lottie-react-native";

const cargaAnim = require("../../../../assets/lootie/cargaCreacion.json");

/* ================= FRASES ================= */

const frases = [
  "Recopilando y analizando tus datos de entrenamiento...",
  "Evaluando tu nivel actual y experiencia previa...",
  "Interpretando tus objetivos físicos y prioridades...",
  "Analizando tu disponibilidad semanal y consistencia...",
  "Determinando el enfoque óptimo según tu perfil...",
  "Seleccionando ejercicios basados en eficiencia y seguridad...",
  "Equilibrando patrones de movimiento fundamentales...",
  "Optimizando la distribución entre fuerza y volumen...",
  "Calculando series, repeticiones y rangos de intensidad...",
  "Ajustando tiempos de descanso para maximizar resultados...",
  "Organizando la carga de trabajo por grupo muscular...",
  "Distribuyendo el estímulo entre tren superior e inferior...",
  "Aplicando principios de progresión inteligente...",
  "Incorporando variabilidad para evitar estancamientos...",
  "Validando coherencia y balance del plan completo...",
  "Preparando tu rutina personalizada...",
  "¡Listo! Tu plan de entrenamiento está tomando forma...",
];

/* ================= TOKENS (MUY MINIMAL) ================= */

const accent = "#3b82f6";

const darkBg = "#020617";
const darkTextPrimary = "#e5e7eb";
const darkTextSecondary = "#94a3b8";

const lightBg = "#f9fafb";
const lightTextPrimary = "#0f172a";
const lightTextSecondary = "#6b7280";

/* ================= COMPONENT ================= */

export default function CargaRutina() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [index, setIndex] = useState(0);
  const fraseActual = frases[index];

  const translateY = useRef(new Animated.Value(14)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.985)).current;
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const inMs = 420;
    const holdMs = 3000;
    const outMs = 320;

    translateY.setValue(14);
    opacity.setValue(0);
    scale.setValue(0.985);
    progress.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: inMs,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: inMs,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: inMs,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
        ]),
        Animated.delay(holdMs),
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -10,
            duration: outMs,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: outMs,
            useNativeDriver: true,
          }),
        ]),
      ]),
      Animated.timing(progress, {
        toValue: 1,
        duration: inMs + holdMs,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]).start(() => {
      setIndex((prev) => (prev + 1) % frases.length);
    });
  }, [index, opacity, progress, scale, translateY]);

  const { width } = Dimensions.get("window");
  const cardWidth = Math.min(560, width - 32);

  const progressWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const palette = useMemo(
    () => ({
      bg: isDark ? darkBg : lightBg,
      textPrimary: isDark ? darkTextPrimary : lightTextPrimary,
      textSecondary: isDark ? darkTextSecondary : lightTextSecondary,
    }),
    [isDark]
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: palette.bg,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
      accessible
      accessibilityLabel="Cargando rutina personalizada"
    >
      <View
        style={{
          width: cardWidth,
          padding: 24,
          alignItems: "center",
        }}
      >
        <Contenido
          isDark={isDark}
          frase={fraseActual}
          translateY={translateY}
          opacity={opacity}
          scale={scale}
          progressWidth={progressWidth}
        />
      </View>
    </View>
  );
}

/* ================= SUB COMPONENT ================= */

function Contenido({
  isDark,
  frase,
  translateY,
  opacity,
  scale,
  progressWidth,
}: {
  isDark: boolean;
  frase: string;
  translateY: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  progressWidth: Animated.AnimatedInterpolation<string | number>;
}) {
  const titleColor = isDark ? darkTextPrimary : lightTextPrimary;
  const bodyColor = isDark ? darkTextSecondary : lightTextSecondary;
  const pillBg = isDark ? "rgba(148,163,184,0.14)" : "rgba(15,23,42,0.04)";
  const progressTrack = isDark
    ? "rgba(148,163,184,0.25)"
    : "rgba(15,23,42,0.06)";

  return (
    <View style={{ alignItems: "center" }}>
      {/* Pill discreto */}
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 5,
          borderRadius: 999,
          backgroundColor: pillBg,
          marginBottom: 12,
        }}
      >
        <Text
          style={{
            color: bodyColor,
            fontSize: 11,
            fontWeight: "500",
            letterSpacing: 1,
          }}
        >
          GENERANDO TU PLAN
        </Text>
      </View>

      <Animated.View
        style={{
          transform: [{ scale }],
        }}
      >
        <LottieView
          source={cargaAnim}
          autoPlay
          loop
          style={{ width: 160, height: 160 }}
        />
      </Animated.View>

      <Text
        style={{
          color: titleColor,
          fontSize: 22,
          fontWeight: "700",
          marginTop: 4,
          textAlign: "center",
          letterSpacing: 0.3,
        }}
      >
        FitGenius
      </Text>

      <Text
        style={{
          color: bodyColor,
          fontSize: 13,
          marginTop: 6,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        Ajustando tu rutina para alinearla con tu objetivo y ritmo de vida.
      </Text>

      {/* Texto de la frase sin contenedor */}
      <Animated.Text
        style={{
          color: bodyColor,
          fontSize: 14,
          textAlign: "center",
          minHeight: 42,
          lineHeight: 20,
          marginTop: 18,
          opacity,
          transform: [{ translateY }],
        }}
        accessibilityLiveRegion={
          Platform.OS === "android" ? "polite" : undefined
        }
      >
        {frase}
      </Animated.Text>

      {/* Barra de progreso minimalista */}
      <View
        style={{
          width: "100%",
          height: 4,
          borderRadius: 999,
          overflow: "hidden",
          marginTop: 12,
          backgroundColor: progressTrack,
        }}
      >
        <Animated.View
          style={{
            width: progressWidth,
            height: "100%",
            borderRadius: 999,
            backgroundColor: accent,
          }}
        />
      </View>
    </View>
  );
}

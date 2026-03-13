import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
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

/* ================= TOKENS ================= */

const accentA = "#22c55e";
const accentB = "#60a5fa";
const accentC = "#a855f7";

const darkBg = "#050816";
const darkCardA = "rgba(15,23,42,0.94)";
const darkCardB = "rgba(9,14,24,0.98)";
const darkBorder = "rgba(255,255,255,0.08)";
const darkTextPrimary = "#e5e7eb";
const darkTextSecondary = "#94a3b8";

const lightBg = "#f8fafc";
const lightCard = "#ffffff";
const lightBorder = "rgba(15,23,42,0.08)";
const lightTextPrimary = "#0f172a";
const lightTextSecondary = "#64748b";

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
      cardBorder: isDark ? darkBorder : lightBorder,
      title: isDark ? darkTextPrimary : lightTextPrimary,
      body: isDark ? darkTextSecondary : lightTextSecondary,
      pillBg: isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)",
      glow: isDark ? "rgba(96,165,250,0.10)" : "rgba(59,130,246,0.08)",
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
          borderRadius: 28,
          shadowColor: "#000",
          shadowOpacity: isDark ? 0.35 : 0.08,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        }}
      >
        <LinearGradient
          colors={[accentA, accentB, accentC]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 28,
            padding: 1.2,
          }}
        >
          {isDark ? (
            <LinearGradient
              colors={[darkCardA, darkCardB]}
              style={{
                borderRadius: 27,
                borderWidth: 1,
                borderColor: palette.cardBorder,
                overflow: "hidden",
              }}
            >
              <Contenido
                isDark
                frase={fraseActual}
                translateY={translateY}
                opacity={opacity}
                scale={scale}
                progressWidth={progressWidth}
              />
            </LinearGradient>
          ) : (
            <View
              style={{
                backgroundColor: lightCard,
                borderRadius: 27,
                borderWidth: 1,
                borderColor: palette.cardBorder,
                overflow: "hidden",
              }}
            >
              <Contenido
                isDark={false}
                frase={fraseActual}
                translateY={translateY}
                opacity={opacity}
                scale={scale}
                progressWidth={progressWidth}
              />
            </View>
          )}
        </LinearGradient>
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
  const pillBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.05)";
  const surface = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const progressTrack = isDark
    ? "rgba(255,255,255,0.08)"
    : "rgba(15,23,42,0.08)";

  return (
    <View
      style={{
        paddingHorizontal: 24,
        paddingTop: 22,
        paddingBottom: 24,
        alignItems: "center",
      }}
    >
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 999,
          backgroundColor: pillBg,
          marginBottom: 14,
        }}
      >
        <Text
          style={{
            color: bodyColor,
            fontSize: 12,
            fontWeight: "600",
            letterSpacing: 0.6,
          }}
        >
          GENERANDO PLAN PERSONALIZADO
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
          style={{ width: 210, height: 210 }}
        />
      </Animated.View>

      <Text
        style={{
          color: titleColor,
          fontSize: 24,
          fontWeight: "800",
          marginTop: 2,
          textAlign: "center",
          letterSpacing: 0.2,
        }}
      >
        FitGenius IA
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
        Estamos afinando tu rutina para que encaje con tu objetivo,
        disponibilidad y nivel actual.
      </Text>

      <View
        style={{
          width: "100%",
          marginTop: 18,
          paddingHorizontal: 14,
          paddingVertical: 14,
          borderRadius: 18,
          backgroundColor: surface,
        }}
      >
        <Animated.Text
          style={{
            color: bodyColor,
            fontSize: 14,
            textAlign: "center",
            minHeight: 46,
            lineHeight: 21,
            opacity,
            transform: [{ translateY }],
          }}
          accessibilityLiveRegion={
            Platform.OS === "android" ? "polite" : undefined
          }
        >
          {frase}
        </Animated.Text>

        <View
          style={{
            width: "100%",
            height: 6,
            borderRadius: 999,
            overflow: "hidden",
            marginTop: 14,
            backgroundColor: progressTrack,
          }}
        >
          <Animated.View
            style={{
              width: progressWidth,
              height: "100%",
              borderRadius: 999,
            }}
          >
            <LinearGradient
              colors={[accentA, accentB, accentC]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ width: "100%", height: "100%" }}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}
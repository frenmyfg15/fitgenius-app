import React, { useEffect, useRef, useState } from "react";
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
  "¡Listo! Tu plan de entrenamiento está tomando forma..."
];

/* ================= TOKENS ================= */

const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;
const cardBgDarkA = "rgba(20,28,44,0.85)";
const cardBgDarkB = "rgba(9,14,24,0.9)";
const cardBorderDark = "rgba(255,255,255,0.08)";
const textPrimaryDark = "#e5e7eb";
const textSecondaryDark = "#94a3b8";

/* ================= COMPONENT ================= */

export default function CargaRutina() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [index, setIndex] = useState(0);
  const fraseActual = frases[index];

  // Animated values
  const translateY = useRef(new Animated.Value(18)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const IN_MS = 420;
    const HOLD_MS = 3400;
    const OUT_MS = 380;

    const animate = () => {
      translateY.setValue(18);
      opacity.setValue(0);

      Animated.sequence([
        // Entrada desde abajo
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: 0,
            duration: IN_MS,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: IN_MS,
            useNativeDriver: true,
          }),
        ]),

        // Pausa visible
        Animated.delay(HOLD_MS),

        // Salida hacia arriba
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -14,
            duration: OUT_MS,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: OUT_MS,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setIndex((prev) => (prev + 1) % frases.length);
      });
    };

    animate();
  }, [index]);

  const { width } = Dimensions.get("window");
  const cardWidth = Math.min(560, width - 32);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.85)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
      }}
      accessible
      accessibilityLabel="Cargando rutina personalizada"
    >
      <LinearGradient
        colors={marcoGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 20, padding: 1, width: cardWidth }}
      >
        {isDark ? (
          <LinearGradient
            colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: cardBorderDark,
            }}
          >
            <Contenido
              isDark
              frase={fraseActual}
              translateY={translateY}
              opacity={opacity}
            />
          </LinearGradient>
        ) : (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
            }}
          >
            <Contenido
              isDark={false}
              frase={fraseActual}
              translateY={translateY}
              opacity={opacity}
            />
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ================= SUB COMPONENT ================= */

function Contenido({
  isDark,
  frase,
  translateY,
  opacity,
}: {
  isDark: boolean;
  frase: string;
  translateY: Animated.Value;
  opacity: Animated.Value;
}) {
  return (
    <View style={{ paddingHorizontal: 24, paddingVertical: 20, alignItems: "center" }}>
      <LottieView
        source={cargaAnim}
        autoPlay
        loop
        style={{ width: 200, height: 200 }}
      />

      <Text
        style={{
          color: isDark ? textPrimaryDark : "#0f172a",
          fontSize: 20,
          fontWeight: "700",
          marginTop: 8,
          textAlign: "center",
        }}
      >
        FitGenius IA
      </Text>

      <Animated.Text
        style={{
          color: isDark ? textSecondaryDark : "#64748b",
          fontSize: 14,
          marginTop: 12,
          textAlign: "center",
          minHeight: 48,
          lineHeight: 20,
          opacity,
          transform: [{ translateY }],
        }}
        accessibilityLiveRegion={Platform.OS === "android" ? "polite" : undefined}
      >
        {frase}
      </Animated.Text>
    </View>
  );
}

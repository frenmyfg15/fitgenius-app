import React, { useEffect, useState } from "react";
import { View, Text, Dimensions, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import LottieView from "lottie-react-native";

const cargaAnim = require("../../../../assets/lootie/cargaCreacion.json");

const frases = [
  "Analizando tu nivel, objetivos y preferencias...",
  "Seleccionando ejercicios ideales para tu rutina...",
  "Calculando series, repeticiones y descansos óptimos...",
  "Organizando tu semana en base al enfoque muscular...",
  "Distribuyendo esfuerzo entre tren superior e inferior...",
  "Ajustando progresión según tu experiencia...",
  "Incorporando variación para evitar estancamiento...",
  "Afinando tu rutina para máximo rendimiento...",
  "Personalizando cada día según tu disponibilidad...",
  "¡Casi listo! Empacando tu entrenamiento personalizado...",
];

// Tokens visuales
const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;
const cardBgDarkA = "rgba(20,28,44,0.85)";
const cardBgDarkB = "rgba(9,14,24,0.9)";
const cardBorderDark = "rgba(255,255,255,0.08)";
const textPrimaryDark = "#e5e7eb";
const textSecondaryDark = "#94a3b8";

export default function CargaRutina() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [fraseActual, setFraseActual] = useState(frases[0]);

  useEffect(() => {
    const id = setInterval(() => {
      setFraseActual((prev) => frases[(frases.indexOf(prev) + 1) % frases.length]);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const { width } = Dimensions.get("window");
  const cardWidth = Math.min(560, width - 32);

  return (
    // Backdrop opaco + contenido centrado (para usar dentro de un Modal del padre)
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
        style={{ borderRadius: 20, padding: 1, overflow: "hidden", width: cardWidth }}
      >
        {isDark ? (
          <LinearGradient
            colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              borderRadius: 20,
              borderWidth: 1,
              borderColor: cardBorderDark,
              overflow: "hidden",
            }}
          >
            <View style={{ paddingHorizontal: 24, paddingVertical: 20, alignItems: "center" }}>
              <LottieView source={cargaAnim} autoPlay loop style={{ width: 200, height: 200 }} />
              <Text
                style={{
                  color: textPrimaryDark,
                  fontSize: 20,
                  fontWeight: "700",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                FitGenius IA
              </Text>
              <Text
                style={{
                  color: textSecondaryDark,
                  fontSize: 14,
                  marginTop: 12,
                  textAlign: "center",
                  minHeight: 48,
                  lineHeight: 20,
                }}
                accessibilityLiveRegion={Platform.OS === "android" ? "polite" : undefined}
              >
                {fraseActual}
              </Text>
            </View>
          </LinearGradient>
        ) : (
          <View
            style={{
              backgroundColor: "#ffffff",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <View style={{ paddingHorizontal: 24, paddingVertical: 20, alignItems: "center" }}>
              <LottieView source={cargaAnim} autoPlay loop style={{ width: 200, height: 200 }} />
              <Text
                style={{
                  color: "#0f172a",
                  fontSize: 20,
                  fontWeight: "700",
                  marginTop: 8,
                  textAlign: "center",
                }}
              >
                FitGenius IA
              </Text>
              <Text
                style={{
                  color: "#64748b",
                  fontSize: 14,
                  marginTop: 12,
                  textAlign: "center",
                  minHeight: 48,
                  lineHeight: 20,
                }}
              >
                {fraseActual}
              </Text>
            </View>
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

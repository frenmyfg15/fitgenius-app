// src/features/fit/components/TasaMetabolicaBasal.tsx
import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import CandadoPremium from "./CandadoPremium";
import { useColorScheme } from "nativewind";

/** Geometría del anillo */
const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

export default function TasaMetabolicaBasal() {
  const { usuario } = useUsuarioStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const peso = Number(usuario?.peso ?? 0);
  const altura = Number(usuario?.altura ?? 0);
  const edad = Number(usuario?.edad ?? 0);
  const sexoRaw = String(usuario?.sexo ?? "");
  const locked = usuario?.planActual === "GRATUITO";

  // Si faltan datos básicos, no renderizamos (igual que otros módulos)
  if (!peso || !altura || !edad || !sexoRaw) return null;

  const sexo = sexoRaw.toLowerCase().startsWith("m") ? "M" : "F";
  const tmb = Math.round(
    sexo === "M"
      ? 10 * peso + 6.25 * altura - 5 * edad + 5
      : 10 * peso + 6.25 * altura - 5 * edad - 161
  );

  const minTMB = 1000;
  const maxTMB = 3000;
  const pct = Math.max(0, Math.min(1, (tmb - minTMB) / (maxTMB - minTMB)));
  const dash = C * (1 - pct);
  const enRango = tmb >= minTMB && tmb <= maxTMB;

  // 🎨 Paleta coherente con el resto
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBgDarkA = "rgba(20,28,44,0.85)";
  const cardBgDarkB = "rgba(9,14,24,0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const ringBase = isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb";

  return (
    <View className="w-full max-w-[520px]">
      {/* Marco degradado vibrante */}
      <LinearGradient
        colors={marcoGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 16, padding: 1, overflow: "hidden" }}
      >
        {/* Fondo glassy en dark / blanco en light */}
        {isDark ? (
          <LinearGradient
            colors={[cardBgDarkA, cardBgDarkB, cardBgDarkA]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              borderWidth: 1,
              borderColor: cardBorderDark,
              padding: 20,
            }}
          >
            <Content locked={locked} isDark={isDark} tmb={tmb} pct={pct} dash={dash} enRango={enRango} />
            {locked ? <CandadoPremium size={56} showTitle isDark={isDark} /> : null}
          </LinearGradient>
        ) : (
          <View
            style={{
              position: "relative",
              borderRadius: 16,
              overflow: "hidden",
              backgroundColor: "#ffffff",
              borderWidth: 1,
              borderColor: "rgba(0,0,0,0.06)",
              padding: 20,
            }}
          >
            <Content locked={locked} isDark={false} tmb={tmb} pct={pct} dash={dash} enRango={enRango} />
            {locked ? <CandadoPremium size={56} showTitle isDark={false} /> : null}
          </View>
        )}
      </LinearGradient>
    </View>
  );
}

/* ---------- Cuerpo ---------- */
function Content({
  locked,
  isDark,
  tmb,
  pct,
  dash,
  enRango,
}: {
  locked: boolean;
  isDark: boolean;
  tmb: number;
  pct: number;
  dash: number;
  enRango: boolean;
}) {
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const ringBase = isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb";

  if (locked) {
    return <TmbSkeleton isDark={isDark} />;
  }

  return (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text style={{ fontSize: 14, fontWeight: "700", color: textPrimary }}>Tasa Metabólica Basal</Text>
        <View
          style={{
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: isDark ? "rgba(148,163,184,0.16)" : "#f5f5f5",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
          }}
        >
          <Text style={{ fontSize: 11, color: textSecondary }}>Estimación diaria en reposo</Text>
        </View>
      </View>

      {/* Anillo central */}
      <View className="mt-5 items-center justify-center">
        <View className="relative w-44 h-44">
          <Svg className="absolute inset-0 -rotate-90" width="100%" height="100%" viewBox="0 0 180 180">
            <Defs>
              <SvgLinearGradient id="kGrad" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="rgb(0,255,64)" />
                <Stop offset="50%" stopColor="rgb(94,230,157)" />
                <Stop offset="100%" stopColor="rgb(178,0,255)" />
              </SvgLinearGradient>
              <SvgLinearGradient id="kGradMuted" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0%" stopColor="rgba(0,255,64,0.5)" />
                <Stop offset="50%" stopColor="rgba(94,230,157,0.5)" />
                <Stop offset="100%" stopColor="rgba(178,0,255,0.5)" />
              </SvgLinearGradient>
            </Defs>

            {/* Base */}
            <Circle cx={CX} cy={CY} r={R} stroke={ringBase} strokeWidth={12} fill="transparent" />

            {/* Progreso */}
            <Circle
              cx={CX}
              cy={CY}
              r={R}
              stroke={enRango ? "url(#kGrad)" : "url(#kGradMuted)"}
              strokeWidth={12}
              fill="transparent"
              strokeDasharray={C}
              strokeDashoffset={dash}
              strokeLinecap="round"
            />
          </Svg>

          {/* Centro del anillo */}
          <View className="absolute inset-0 items-center justify-center">
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 11, color: textSecondary }}>TMB</Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: textPrimary, lineHeight: 26 }}>{tmb}</Text>
              <Text style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>kcal / día</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Barra lineal */}
      <View style={{ marginTop: 16 }}>
        <View
          style={{
            height: 10,
            width: "100%",
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor: isDark ? "rgba(148,163,184,0.18)" : "#e5e7eb",
            borderWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb",
          }}
        >
          <LinearGradient
            colors={["#8bff62", "#39ff14", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{ width: `${pct * 100}%`, height: "100%" }}
          />
        </View>
        <View className="flex-row justify-between" style={{ marginTop: 6 }}>
          <Text style={{ fontSize: 11, color: textSecondary }}>1000 kcal</Text>
          <Text style={{ fontSize: 11, color: textSecondary }}>3000 kcal</Text>
        </View>
      </View>

      <Text style={{ marginTop: 12, fontSize: 12, color: textSecondary }}>
        La TMB es una aproximación. Factores como masa magra, sueño y estrés pueden modificar tus necesidades reales.
      </Text>
    </>
  );
}

/* ---------- Skeleton estático (bajo candado) ---------- */
function TmbSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#e5e7eb";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";

  return (
    <View pointerEvents="none">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View style={{ width: 160, height: 16, borderRadius: 6, backgroundColor: base }} />
        <View style={{ width: 140, height: 14, borderRadius: 6, backgroundColor: base }} />
      </View>

      {/* Métricas (4 chips) */}
      <View className="mt-3 grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: border,
              backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#ffffff",
              padding: 12,
              gap: 8,
            }}
          >
            <View style={{ width: 60, height: 10, borderRadius: 6, backgroundColor: base }} />
            <View style={{ width: 80, height: 14, borderRadius: 6, backgroundColor: base }} />
          </View>
        ))}
      </View>

      {/* Anillo */}
      <View className="mt-5 items-center justify-center">
        <View className="w-44 h-44 items-center justify-center rounded-full border-[12px]" style={{ borderColor: base }}>
          <View style={{ width: 70, height: 12, borderRadius: 6, backgroundColor: base }} />
          <View style={{ marginTop: 8, width: 90, height: 10, borderRadius: 6, backgroundColor: base }} />
        </View>
      </View>

      {/* Barra + ticks */}
      <View style={{ marginTop: 16 }}>
        <View style={{ height: 10, width: "100%", borderRadius: 999, backgroundColor: base }} />
        <View className="flex-row justify-between" style={{ marginTop: 6 }}>
          <View style={{ width: 60, height: 10, borderRadius: 6, backgroundColor: base }} />
          <View style={{ width: 60, height: 10, borderRadius: 6, backgroundColor: base }} />
        </View>
      </View>

      {/* Nota */}
      <View style={{ marginTop: 12, height: 12, width: "100%", borderRadius: 6, backgroundColor: base }} />
      <View style={{ marginTop: 8, height: 12, width: "80%", borderRadius: 6, backgroundColor: base }} />
    </View>
  );
}

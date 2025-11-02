// src/features/fit/components/PesoObjetivoProgreso.tsx
import React, { useMemo } from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient as SvgLinearGradient, Stop } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import CandadoPremium from "./CandadoPremium";
import { useColorScheme } from "nativewind";

const R = 64;
const C = 2 * Math.PI * R;
const CX = 90;
const CY = 90;

export default function PesoObjetivoProgreso() {
  const { usuario } = useUsuarioStore();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const peso = Number(usuario?.peso ?? 0);
  const objetivo = Number(usuario?.pesoObjetivo ?? 0);
  const locked = usuario?.planActual === "GRATUITO";

  if (!peso || !objetivo) return null;

  const rumbo: "bajar" | "subir" | "igual" =
    objetivo === peso ? "igual" : objetivo < peso ? "bajar" : "subir";

  // % de progreso hacia el objetivo
  const pct = useMemo(() => {
    if (rumbo === "igual") return 1;
    const total = Math.abs(objetivo - peso);
    if (total === 0) return 1;
    return objetivo > peso ? Math.min(peso / objetivo, 1) : Math.min(objetivo / peso, 1);
  }, [rumbo, objetivo, peso]);

  const deltaKg = objetivo - peso;
  const alcanzado = rumbo === "igual";
  const dash = C * (1 - pct);

  const estado = alcanzado
    ? "¡Has alcanzado tu objetivo!"
    : deltaKg < 0
    ? `Te sobran ${Math.abs(deltaKg).toFixed(1)} kg`
    : `Te faltan ${Math.abs(deltaKg).toFixed(1)} kg`;

  // 🎛️ Paleta “glass”
  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];
  const cardBgDarkA = "rgba(20,28,44,0.85)";
  const cardBgDarkB = "rgba(9,14,24,0.9)";
  const cardBorderDark = "rgba(255,255,255,0.08)";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#475569";
  const ringBase = isDark ? "rgba(148,163,184,0.22)" : "#e5e7eb";

  return (
    <View className="w-full max-w-[520px]">
      {/* Marco degradado coherente */}
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
            <Content
              locked={locked}
              isDark
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              ringBase={ringBase}
              pct={pct}
              dash={dash}
              alcanzado={alcanzado}
              estado={estado}
              peso={peso}
              objetivo={objetivo}
            />
            {locked ? <CandadoPremium size={56} showTitle isDark /> : null}
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
            <Content
              locked={locked}
              isDark={false}
              textPrimary={textPrimary}
              textSecondary={textSecondary}
              ringBase={ringBase}
              pct={pct}
              dash={dash}
              alcanzado={alcanzado}
              estado={estado}
              peso={peso}
              objetivo={objetivo}
            />
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
  textPrimary,
  textSecondary,
  ringBase,
  pct,
  dash,
  alcanzado,
  estado,
  peso,
  objetivo,
}: {
  locked: boolean;
  isDark: boolean;
  textPrimary: string;
  textSecondary: string;
  ringBase: string;
  pct: number;
  dash: number;
  alcanzado: boolean;
  estado: string;
  peso: number;
  objetivo: number;
}) {
  if (locked) {
    return <PesoObjetivoSkeleton isDark={isDark} />;
  }

  return (
    <>
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <Text style={{ fontSize: 14, fontWeight: "700", color: textPrimary }}>
          Progreso hacia tu peso objetivo
        </Text>
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
          <Text style={{ fontSize: 11, color: textSecondary }}>
            {alcanzado ? "Objetivo logrado" : objetivo < peso ? "Objetivo: bajar" : "Objetivo: subir"}
          </Text>
        </View>
      </View>

      {/* Métricas rápidas */}
      <View className="mt-3 grid grid-cols-3 gap-3">
        <Chip label="Actual" value={`${round1(peso)} kg`} isDark={isDark} />
        <Chip label="Objetivo" value={`${round1(objetivo)} kg`} isDark={isDark} />
        <Chip
          label="Diferencia"
          value={`${(objetivo - peso > 0 ? "+" : "") + round1(objetivo - peso)} kg`}
          isDark={isDark}
        />
      </View>

      {/* Anillo + porcentaje */}
      <View className="mt-5 items-center justify-center">
        <View className="relative w-44 h-44">
          <Svg
            className="absolute inset-0 -rotate-90"
            width="100%"
            height="100%"
            viewBox="0 0 180 180"
            accessibilityRole="image"
            accessibilityLabel="Progreso hacia el peso objetivo"
          >
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
              stroke={alcanzado ? "url(#kGrad)" : "url(#kGradMuted)"}
              strokeWidth={12}
              fill="transparent"
              strokeDasharray={C}
              strokeDashoffset={dash}
              strokeLinecap="round"
            />
          </Svg>

          {/* Centro del anillo */}
          <View className="absolute inset-0 items-center justify-center">
            <View className="items-center">
              <Text style={{ fontSize: 11, color: textSecondary }}>Progreso</Text>
              <Text style={{ fontSize: 22, fontWeight: "800", color: textPrimary, lineHeight: 26 }}>
                {Math.round(pct * 100)}%
              </Text>
              <Text style={{ fontSize: 11, color: textSecondary, marginTop: 2 }}>{estado}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Barra lineal de apoyo */}
      <View
        className="mt-4 h-2.5 w-full rounded-full overflow-hidden"
        style={{
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

      <Text style={{ marginTop: 12, fontSize: 12, color: textSecondary }}>
        Mantén hábitos sostenibles: progreso lento y constante suele ser más efectivo.
      </Text>
    </>
  );
}

/* ---------- Skeleton estático (bajo candado) ---------- */
function PesoObjetivoSkeleton({ isDark }: { isDark: boolean }) {
  const base = isDark ? "rgba(148,163,184,0.16)" : "#e5e7eb";
  const border = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";

  return (
    <View pointerEvents="none">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View style={{ width: 220, height: 16, borderRadius: 6, backgroundColor: base }} />
        <View style={{ width: 120, height: 14, borderRadius: 6, backgroundColor: base }} />
      </View>

      {/* Chips */}
      <View className="mt-3 grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
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
            <View style={{ width: 70, height: 10, borderRadius: 6, backgroundColor: base }} />
            <View style={{ width: 90, height: 14, borderRadius: 6, backgroundColor: base }} />
          </View>
        ))}
      </View>

      {/* Anillo */}
      <View className="mt-5 items-center justify-center">
        <View className="w-44 h-44 items-center justify-center rounded-full border-[12px]" style={{ borderColor: base }}>
          <View style={{ width: 80, height: 12, borderRadius: 6, backgroundColor: base }} />
          <View style={{ marginTop: 8, width: 140, height: 10, borderRadius: 6, backgroundColor: base }} />
        </View>
      </View>

      {/* Barra + texto */}
      <View style={{ marginTop: 16 }}>
        <View style={{ height: 10, width: "100%", borderRadius: 999, backgroundColor: base }} />
        <View style={{ marginTop: 12, height: 12, width: "100%", borderRadius: 6, backgroundColor: base }} />
      </View>
    </View>
  );
}

/* ---------- Subcomponentes ---------- */
function Chip({ label, value, isDark }: { label: string; value: string; isDark: boolean }) {
  return (
    <View
      style={{
        borderRadius: 12,
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
        backgroundColor: isDark ? "rgba(20,28,44,0.55)" : "#ffffff",
        padding: 12,
      }}
    >
      <Text style={{ fontSize: 11, color: isDark ? "#94a3b8" : "#6b7280" }}>{label}</Text>
      <Text style={{ marginTop: 2, fontSize: 14, fontWeight: "700", color: isDark ? "#e5e7eb" : "#0f172a" }}>{value}</Text>
    </View>
  );
}

/* ---------- Utils ---------- */
function round1(n: number) {
  return Number.isFinite(n) ? Math.round(n * 10) / 10 : 0;
}

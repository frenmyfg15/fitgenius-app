// src/features/premium/Extra.tsx
import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { Flame, Medal, Dumbbell } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import CaloriasModal from "./CaloriasModal";
import ExperienciaModal from "./ExperienciaModal";
import EjerciciosModal from "./EjerciciosModal";

/* ---------------- Tipos ---------------- */
type Props = { ejercicios: number };

/** Compacta números para evitar overflow (1k, 1.2k, 1M, 2.5M...) */
function formatCompactES(value: number) {
  const n = Number(value ?? 0);

  // fallback
  if (!Number.isFinite(n)) return "0";

  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";

  // < 1000 -> normal
  if (abs < 1000) return new Intl.NumberFormat("es-ES").format(n);

  // k
  if (abs < 1_000_000) {
    const v = abs / 1000;
    const decimals = v < 10 ? 1 : 0; // 1.2k, 12k
    // en es-ES el decimal es coma, pero aquí quieres "1k" estilo compacto.
    // Usamos punto como en tu ejemplo "1k" (sin decimales) y "1.2k" con punto.
    const str = v.toFixed(decimals).replace(/\.0$/, "");
    return `${sign}${str}k`;
  }

  // M
  if (abs < 1_000_000_000) {
    const v = abs / 1_000_000;
    const decimals = v < 10 ? 1 : 0;
    const str = v.toFixed(decimals).replace(/\.0$/, "");
    return `${sign}${str}M`;
  }

  // B (miles de millones)
  const v = abs / 1_000_000_000;
  const decimals = v < 10 ? 1 : 0;
  const str = v.toFixed(decimals).replace(/\.0$/, "");
  return `${sign}${str}B`;
}

export default function Extra({ ejercicios }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const calorias = useUsuarioStore((s) => s.usuario?.caloriasMes ?? 0);
  const experiencia = useUsuarioStore((s) => s.usuario?.experiencia ?? 0);

  // Estados de modales
  const [showCal, setShowCal] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const [showEj, setShowEj] = useState(false);

  const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

  const items = [
    {
      key: "calorias" as const,
      icon: <Flame size={20} color={isDark ? "#e5e7eb" : "#4b5563"} />,
      value: calorias,
      label: "Calorías quemadas",
      dotColor: "#22c55e",
      onPress: () => setShowCal(true),
    },
    {
      key: "experiencia" as const,
      icon: <Medal size={20} color={isDark ? "#e5e7eb" : "#4b5563"} />,
      value: experiencia,
      label: "Puntos de experiencia",
      dotColor: "#a855f7",
      onPress: () => setShowXP(true),
    },
    {
      key: "ejercicios" as const,
      icon: <Dumbbell size={20} color={isDark ? "#e5e7eb" : "#4b5563"} />,
      value: ejercicios,
      label: "Ejercicios totales hoy",
      dotColor: "#10b981",
      onPress: () => setShowEj(true),
    },
  ] as const;

  return (
    <>
      <View className="flex-row justify-center items-center gap-4">
        {items.map((it) => (
          <LinearGradient
            key={it.key}
            colors={marcoGradient as any}
            className="rounded-2xl p-[1px]"
            style={{ borderRadius: 15, overflow: "hidden" }}
          >
            <TouchableOpacity
              activeOpacity={0.9}
              accessibilityLabel={it.label}
              onPress={it.onPress}
              className={
                "relative w-[110px] h-[130px] rounded-2xl items-center justify-center shadow-md " +
                (isDark
                  ? "bg-[#0b1220] border border-white/10"
                  : "bg-white border border-neutral-200")
              }
              style={{ borderRadius: 16 }}
            >
              <View className="flex-1 items-center justify-center px-3 py-3">
                <View
                  className={
                    "mb-2 h-9 w-9 rounded-xl items-center justify-center " +
                    (isDark
                      ? "bg-white/5 border border-white/10"
                      : "bg-white border border-neutral-200")
                  }
                >
                  {it.icon}
                </View>

                <Text
                  className={
                    (isDark ? "text-white" : "text-slate-900") +
                    " text-[28px] font-extrabold leading-none"
                  }
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.85}
                >
                  {formatCompactES(it.value)}
                </Text>

                <Text
                  className={
                    (isDark ? "text-[#94a3b8]" : "text-neutral-600") +
                    " text-[11px] text-center mt-1 tracking-tight"
                  }
                >
                  {it.label}
                </Text>
              </View>

              <View
                className="absolute right-2 top-2 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: it.dotColor,
                  borderWidth: 2,
                  borderColor: isDark ? "#0b1220" : "#ffffff",
                }}
              />
            </TouchableOpacity>
          </LinearGradient>
        ))}
      </View>

      {/* Modales */}
      <CaloriasModal
        visible={showCal}
        onClose={() => setShowCal(false)}
        value={calorias}
      />
      <ExperienciaModal
        visible={showXP}
        onClose={() => setShowXP(false)}
        value={experiencia}
      />
      <EjerciciosModal
        visible={showEj}
        onClose={() => setShowEj(false)}
        value={ejercicios}
      />
    </>
  );
}

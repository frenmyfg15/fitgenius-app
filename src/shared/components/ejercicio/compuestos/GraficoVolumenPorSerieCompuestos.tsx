import React, { useMemo } from "react";
import { View, Text, Dimensions, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Path, Rect, G, Circle, Text as SvgText } from "react-native-svg";

/**
 * GraficoVolumenPorSerieCompuestos (versión moderna)
 * - Area chart suave con gradiente (react-native-svg)
 * - Scroll horizontal si hay muchas series (ancho dinámico)
 * - Ranking por ejercicio en tarjetas en COLUMNA (nombre → volumen → reps)
 */
type RegistroPlanoCompuesto = {
  serieNumero: number;
  ejercicioId: number;
  nombre: string;
  pesoKg: number | null;
  repeticiones: number | null;
  duracionSegundos: number | null;
  idGif?: string;
  grupoMuscular?: string;
  musculoPrincipal?: string;
};

type Props = {
  registros: RegistroPlanoCompuesto[];
};

export default function GraficoVolumenPorSerieCompuestos({ registros }: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit = (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "KG").toLowerCase();

  const windowWidth = Dimensions.get("window").width;
  const cardPadding = 32; // padding lateral del container “card”
  const baseWidth = windowWidth - cardPadding;

  const {
    labels,
    data,
    maxY,
    ranking,
  } = useMemo(() => {
    const seriesUnicas = Array.from(new Set(registros.map((r) => r.serieNumero))).sort((a, b) => a - b);
    const data = seriesUnicas.map((serie) => {
      const regs = registros.filter((r) => r.serieNumero === serie);
      return regs.reduce((acc, r) => {
        const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
        const reps = typeof r.repeticiones === "number" ? r.repeticiones : 0;
        return acc + peso * reps;
      }, 0);
    });

    const maxY = Math.max(10, ...data); // evita división por 0

    const mapVolumen: Record<number, { nombre: string; volumen: number; reps: number }> = {};
    for (const r of registros) {
      const peso = typeof r.pesoKg === "number" ? r.pesoKg : 0;
      const reps = typeof r.repeticiones === "number" ? r.repeticiones : 0;
      const vol = peso * reps;
      if (!mapVolumen[r.ejercicioId]) {
        mapVolumen[r.ejercicioId] = { nombre: r.nombre, volumen: 0, reps: 0 };
      }
      mapVolumen[r.ejercicioId].volumen += vol;
      mapVolumen[r.ejercicioId].reps += reps;
    }

    const ranking = Object.entries(mapVolumen)
      .map(([id, v]) => ({ ejercicioId: Number(id), nombre: v.nombre, volumen: v.volumen, reps: v.reps }))
      .sort((a, b) => b.volumen - a.volumen);

    return {
      labels: seriesUnicas.map((n) => `Set ${n}`),
      data,
      maxY,
      ranking,
    };
  }, [registros]);

  const hasValues = data.some((v) => v > 0);

  // ==== Area chart helpers ====
  const height = 220;
  const padding = { top: 22, right: 24, bottom: 40, left: 24 };
  const innerW = Math.max(baseWidth, labels.length * 84); // ancho mínimo por punto (scroll if needed)
  const w = innerW;
  const h = height;

  const xAt = (i: number) => {
    if (data.length <= 1) return padding.left + (w - padding.left - padding.right) / 2;
    const usable = w - padding.left - padding.right;
    return padding.left + (usable * i) / (data.length - 1);
    // puntos distribuidos uniformemente
  };

  const yAt = (v: number) => {
    const usable = h - padding.top - padding.bottom;
    const norm = v / (maxY || 1);
    return padding.top + (1 - norm) * usable;
  };

  // Suavizado simple con curvas C (Catmull-Rom aproximado)
  const buildSmoothPath = (vals: number[]) => {
    if (vals.length === 0) return "";
    const pts = vals.map((v, i) => ({ x: xAt(i), y: yAt(v) }));
    if (pts.length === 1) {
      const p = pts[0];
      return `M ${p.x} ${p.y} L ${p.x} ${p.y}`;
    }
    const d: string[] = [];
    d.push(`M ${pts[0].x} ${pts[0].y}`);
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i === 0 ? pts[0] : pts[i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i + 2 < pts.length ? pts[i + 2] : p2;
      const t = 0.2; // tensión suave
      const cp1x = p1.x + (p2.x - p0.x) * t;
      const cp1y = p1.y + (p2.y - p0.y) * t;
      const cp2x = p2.x - (p3.x - p1.x) * t;
      const cp2y = p2.y - (p3.y - p1.y) * t;
      d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`);
    }
    return d.join(" ");
  };

  const linePath = buildSmoothPath(data);
  const areaPath = `${linePath} L ${xAt(data.length - 1)} ${h - padding.bottom} L ${xAt(0)} ${h - padding.bottom} Z`;

  // Colores UI
  const marcoLight = ["#39ff14", "#14ff80", "#22c55e"];
  const marcoDark = ["#111a2b", "#0b1220", "#111a2b"];
  const strokeColor = isDark ? "#22c55e" : "#16a34a";
  const fillStart = isDark ? "#16a34a" : "#22c55e";
  const fillEnd = isDark ? "#16a34a00" : "#22c55e00";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
  const labelColor = isDark ? "#e5e7eb" : "#0f172a";
  const subLabel = isDark ? "#94a3b8" : "#6b7280";

  return (
    <View className="w-full mt-10">
      <LinearGradient
        colors={isDark ? (marcoDark as any) : (marcoLight as any)}
        className="rounded-2xl p-[2px]"
        style={{ borderRadius: 15, overflow: "hidden" }}
      >
        <View
          className={
            "rounded-2xl shadow-md " +
            (isDark ? "bg-[#0b1220] border border-white/10" : "bg-white/90 border border-white/60")
          }
        >
          {/* Header */}
          <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
            <Text className={isDark ? "text-white font-semibold" : "text-slate-900 font-semibold"}>
              Volumen por serie (compuestos)
            </Text>
            <Text className={isDark ? "text-[#94a3b8] text-[11px]" : "text-neutral-500 text-[11px]"}>
              Volumen = peso × reps ({unit})
            </Text>
          </View>

          {/* Area chart moderno con scroll horizontal */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 8 }}>
            <Svg width={w} height={h}>
              <Defs>
                <SvgGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={fillStart} stopOpacity={0.35} />
                  <Stop offset="1" stopColor={fillEnd} stopOpacity={0} />
                </SvgGradient>
              </Defs>

              {/* Fondo */}
              <Rect x={0} y={0} width={w} height={h} fill="transparent" />

              {/* Grid horizontal suave */}
              {Array.from({ length: 4 }).map((_, i) => {
                const y = padding.top + ((h - padding.top - padding.bottom) * i) / 3;
                return <Path key={i} d={`M ${padding.left} ${y} H ${w - padding.right}`} stroke={gridColor} strokeWidth={1} />;
              })}

              {/* Área + línea + puntos */}
              {hasValues ? (
                <G>
                  <Path d={areaPath} fill="url(#fill)" />
                  <Path d={linePath} stroke={strokeColor} strokeWidth={3} fill="none" />
                  {data.map((v, i) => (
                    <Circle key={i} cx={xAt(i)} cy={yAt(v)} r={3.5} fill={strokeColor} />
                  ))}
                </G>
              ) : null}

              {/* Labels de eje X (cada 1 o saltando si son muchos) */}
              {labels.map((lbl, i) => {
                const every = labels.length > 10 ? 2 : 1; // menos ruido
                if (i % every !== 0) return null;
                const x = xAt(i);
                const y = h - padding.bottom + 18;
                return (
                  <SvgText
                    key={lbl + i}
                    x={x}
                    y={y}
                    fontSize={11}
                    fill={subLabel}
                    textAnchor="middle"
                  >
                    {lbl}
                  </SvgText>
                );
              })}
            </Svg>
          </ScrollView>

          {/* Ranking por ejercicio (tarjetas en COLUMNA, limpio) */}
          {ranking.length > 0 && (
            <View className="px-4 pb-5">
              <Text className={isDark ? "text-white/90 text-[12px] mb-2 px-1" : "text-slate-700 text-[12px] mb-2 px-1"}>
                Volumen por ejercicio (sesión):
              </Text>

              <View className="flex-row flex-wrap justify-between">
                {ranking.map((item) => (
                  <View
                    key={item.ejercicioId}
                    className={
                      "mb-3 rounded-xl px-4 py-3 " +
                      (isDark ? "bg-white/5 border border-white/10" : "bg-white/80 border border-white/60")
                    }
                    style={{ width: "48%" }} // 2 columnas
                  >
                    {/* Nombre (arriba) */}
                    <Text
                      numberOfLines={2}
                      ellipsizeMode="tail"
                      className={isDark ? "text-white text-[13px] font-semibold" : "text-slate-900 text-[13px] font-semibold"}
                      style={{ lineHeight: 18 }}
                    >
                      {item.nombre}
                    </Text>

                    {/* Volumen (centro) */}
                    <Text
                      className={isDark ? "text-white text-xl font-extrabold mt-2" : "text-slate-900 text-xl font-extrabold mt-2"}
                    >
                      {Math.round(item.volumen)}
                      <Text className={isDark ? "text-[#94a3b8] text-xs font-semibold ml-1" : "text-neutral-500 text-xs font-semibold ml-1"}>
                        {` ${unit}·reps`}
                      </Text>
                    </Text>

                    {/* Reps (abajo) */}
                    <Text className={isDark ? "text-[#94a3b8] text-[12px] mt-1" : "text-neutral-500 text-[12px] mt-1"}>
                      {item.reps} reps totales
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

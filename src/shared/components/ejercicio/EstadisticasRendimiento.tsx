import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type SerieDetalle = {
  pesoKg: number | null;
  repeticiones: number | null; // en cardio = segundos
};

type Props = {
  detallesSeries: SerieDetalle[];
  esCardio?: boolean;
};

export default function EstadisticasRendimiento({
  detallesSeries,
  esCardio,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const unit =
    (useUsuarioStore((s) => s.usuario?.medidaPeso) ?? "kg").toLowerCase();

  const isCardio = Boolean(esCardio);

  // ────────────────────────────
  //       CÁLCULO MÉTRICAS
  // ────────────────────────────
  const stats = useMemo(() => {
    const sets = detallesSeries ?? [];
    const totalSeries = sets.length;

    let totalReps = 0;   // en fuerza = reps, en cardio = segundos totales
    let totalPeso = 0;   // tonelaje (peso * reps)
    let maxPeso = 0;
    let maxReps = 0;     // en cardio = máximo tiempo de una serie

    for (const s of sets) {
      const reps = Number(s.repeticiones ?? 0);
      const peso = Number(s.pesoKg ?? 0);

      totalReps += reps;
      totalPeso += peso * reps;

      if (peso > maxPeso) maxPeso = peso;
      if (reps > maxReps) maxReps = reps;
    }

    const pesoPromedio = totalReps ? totalPeso / totalReps : 0;
    const repsPromedio = totalSeries ? totalReps / totalSeries : 0;

    return {
      totalSeries,
      totalReps,           // fuerza: reps totales, cardio: segundos totales
      totalPeso,           // tonelaje
      pesoPromedio,
      repsPromedio,        // fuerza: reps/serie, cardio: seg/serie
      maxPeso,
      maxReps,             // fuerza: reps máx, cardio: seg máx
      tiempoTotal: totalReps,                // alias cardio
      tiempoMedioSerie: repsPromedio,        // alias cardio
      tiempoMaxSerie: maxReps,               // alias cardio
    };
  }, [detallesSeries]);

  // ────────────────────────────
  //       ITEMS A MOSTRAR
  // ────────────────────────────
  const items = isCardio
    ? [
        { label: "Series", value: stats.totalSeries, suffix: "" },
        {
          label: "Tiempo total",
          value: stats.tiempoTotal.toFixed(0),
          suffix: " s",
        },
        {
          label: "Tiempo / serie",
          value: stats.tiempoMedioSerie.toFixed(1),
          suffix: " s",
        },
        {
          label: "Tiempo máx. serie",
          value: stats.tiempoMaxSerie.toFixed(0),
          suffix: " s",
        },
        // Solo mostramos peso si realmente hay carga
        ...(stats.maxPeso > 0
          ? [
              {
                label: "Máximo peso",
                value: stats.maxPeso.toFixed(1),
                suffix: ` ${unit}`,
              },
            ]
          : []),
      ]
    : [
        { label: "Series", value: stats.totalSeries, suffix: "" },
        { label: "Reps totales", value: stats.totalReps, suffix: "" },
        {
          label: "Volumen",
          value: stats.totalPeso.toFixed(1),
          suffix: ` ${unit}`,
        },
        {
          label: "Peso / rep",
          value: stats.pesoPromedio.toFixed(1),
          suffix: ` ${unit}`,
        },
        {
          label: "Reps / serie",
          value: stats.repsPromedio.toFixed(1),
          suffix: "",
        },
        {
          label: "Máximo peso",
          value: stats.maxPeso.toFixed(1),
          suffix: ` ${unit}`,
        },
        { label: "Máximas reps", value: stats.maxReps, suffix: "" },
      ];

  const marcoBorder = [
    "rgba(0,255,64,0.5)",
    "rgba(94,230,157,0.45)",
    "rgba(178,0,255,0.4)",
  ];

  const hasData = isCardio
    ? stats.totalSeries > 0 && stats.tiempoTotal > 0
    : stats.totalSeries > 0 &&
      (stats.totalReps > 0 || stats.totalPeso > 0);

  return (
    <View className="w-full mt-6">
      <LinearGradient
        colors={marcoBorder as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="rounded-2xl p-[1.5px]"
        style={{ borderRadius: 18, overflow: "hidden" }}
      >
        {/* Tarjeta interna */}
        <View
          className={
            "rounded-2xl px-5 py-5 " +
            (isDark
              ? "bg-[#0d1320]/70 border border-white/5 backdrop-blur-md"
              : "bg-white/90 border border-slate-200/60")
          }
        >
          {/* Header */}
          <Text
            className={
              (isDark ? "text-slate-200" : "text-slate-900") +
              " text-[15px] font-medium mb-4"
            }
          >
            Rendimiento general
          </Text>

          {/* Contenido */}
          {hasData ? (
            <View className="flex-row flex-wrap justify-between gap-3">
              {items.map((it) => (
                <View
                  key={it.label}
                  className={
                    "rounded-xl px-4 py-3 " +
                    (isDark
                      ? "bg-white/5 border border-white/5"
                      : "bg-slate-50 border border-slate-200/50")
                  }
                  style={{ width: "47%" }}
                >
                  <Text
                    className={
                      (isDark ? "text-slate-400" : "text-slate-500") +
                      " text-xs"
                    }
                  >
                    {it.label}
                  </Text>

                  <Text
                    className={
                      (isDark ? "text-white" : "text-slate-900") +
                      " text-lg font-semibold mt-0.5"
                    }
                  >
                    {it.value}
                    <Text
                      className={
                        (isDark ? "text-slate-500" : "text-slate-400") +
                        " text-[11px] ml-1"
                      }
                    >
                      {it.suffix}
                    </Text>
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="py-10 items-center">
              <Text
                className={
                  (isDark ? "text-slate-400" : "text-slate-500") +
                  " text-sm"
                }
              >
                No hay datos suficientes aún.
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

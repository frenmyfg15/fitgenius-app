import React, { useMemo } from "react";
import { View, Text } from "react-native";
import { Lightbulb } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

type Props = {
  notaIA?: string | null;
  series?: number | null;
  repeticiones?: number | null;
  peso?: number | null;
  // 👇 NUEVO
  esCardio?: boolean;
};

export default function NotaIA({
  notaIA,
  series,
  repeticiones,
  peso,
  esCardio,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const medidaPeso = useUsuarioStore((s) => s.usuario?.medidaPeso) || "kg";

  const safeNota = (notaIA ?? "").trim();
  const safeSeries =
    typeof series === "number" && Number.isFinite(series) ? series : 0;
  const safeReps =
    typeof repeticiones === "number" && Number.isFinite(repeticiones)
      ? repeticiones
      : 0;
  const safePeso =
    typeof peso === "number" && Number.isFinite(peso) ? peso : 0;

  const isCardio = Boolean(esCardio);

  const shouldRender = useMemo(
    () =>
      safeNota.length > 0 ||
      safeSeries > 0 ||
      safeReps > 0 ||
      safePeso > 0,
    [safeNota, safeSeries, safeReps, safePeso]
  );

  const cardBgDark = "#020617";
  const cardBorderDark = "rgba(148,163,184,0.35)";
  const textPrimaryDark = "#e5e7eb";
  const textSecondaryDark = "#9ca3af";

  if (!shouldRender) return null;

  return (
    <View
      className="w-full max-w-[520px] my-4"
      accessibilityRole="summary"
      accessibilityLabel="Nota de la IA con sugerencias"
    >
      <View
        className="rounded-2xl px-4 py-3"
        style={{
          backgroundColor: isDark ? cardBgDark : "#ffffff",
          borderWidth: 1,
          borderColor: isDark ? cardBorderDark : "#e5e7eb",
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center gap-2">
            <View
              className="h-7 w-7 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark
                  ? "rgba(34,197,94,0.12)"
                  : "rgba(22,163,74,0.06)",
              }}
            >
              <Lightbulb size={18} color="#22c55e" />
            </View>
            <Text
              className="text-[14px] font-semibold"
              style={{ color: isDark ? textPrimaryDark : "#0f172a" }}
            >
              Nota de la IA
            </Text>
          </View>

          <Text
            className="text-[11px]"
            style={{ color: isDark ? textSecondaryDark : "#6b7280" }}
          >
            Sugerencia
          </Text>
        </View>

        {/* Texto de la nota */}
        {safeNota.length > 0 ? (
          <Text
            className="text-[13px] leading-relaxed"
            style={{
              color: isDark ? textPrimaryDark : "#111827",
              fontStyle: "italic",
            }}
          >
            {safeNota}
          </Text>
        ) : (
          <Text
            className="text-[13px] leading-relaxed"
            style={{ color: isDark ? textSecondaryDark : "#6b7280" }}
          >
            Sin nota por ahora.
          </Text>
        )}

        {/* Métricas */}
        <View
          className="mt-3 pt-2 flex-row flex-wrap gap-x-4 gap-y-1 border-t"
          style={{
            borderTopColor: isDark
              ? "rgba(31,41,55,1)"
              : "rgba(229,231,235,1)",
          }}
        >
          <MetaItem
            label="Series"
            value={String(safeSeries)}
            isDark={isDark}
          />

          {isCardio ? (
            // 👇 cardio: interpretamos repeticiones como tiempo por serie
            <MetaItem
              label="Tiempo/serie"
              value={safeReps > 0 ? `${safeReps} s` : "—"}
              isDark={isDark}
            />
          ) : (
            <MetaItem
              label="Reps"
              value={String(safeReps)}
              isDark={isDark}
            />
          )}

          {/* peso puede tener sentido en cardio (ej. assault bike con carga) → lo dejamos si hay valor */}
          {safePeso > 0 && (
            <MetaItem
              label="Peso"
              value={`${safePeso} ${medidaPeso}`}
              isDark={isDark}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function MetaItem({
  label,
  value,
  isDark,
}: {
  label: string;
  value: string;
  isDark: boolean;
}) {
  const safeValue = value ?? "";

  return (
    <View className="flex-row items-baseline gap-1">
      <Text
        className="text-[11px]"
        style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
      >
        {label}:
      </Text>
      <Text
        className="text-[12px] font-semibold"
        style={{ color: isDark ? "#e5e7eb" : "#111827" }}
      >
        {safeValue}
      </Text>
    </View>
  );
}

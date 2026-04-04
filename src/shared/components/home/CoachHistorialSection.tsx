import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useOverlayPresenter } from "@/shared/overlay/useOverlayPresenter";
import { useAnalisisStore } from "@/features/store/useAnalisisStore";
import AnalisisDiarioModal from "./AnalisisDiarioModal";
import AnalisisSemanalModal from "./AnalisisSemanalModal";
import type { MoodDiario, MoodSemanal } from "@/features/api/coach.api";

// ── Helpers ────────────────────────────────────────────────────────────────────

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"] as const;

function fmtFecha(ymd: string, today: string): string {
  if (ymd === today) return "HOY";
  const [, m, d] = ymd.split("-");
  return `${parseInt(d, 10)} ${MESES[parseInt(m, 10) - 1]}`;
}

function fmtSemana(semana: string): string {
  const match = semana.match(/W(\d+)/i);
  if (match) return `Sem ${parseInt(match[1], 10)}`;
  return semana;
}

// ── Mood config ────────────────────────────────────────────────────────────────

const MOOD_DIARIO: Record<MoodDiario, { color: string; label: string }> = {
  FUEGO:    { color: "#F97316", label: "Fuego"    },
  SOLIDO:   { color: "#22C55E", label: "Sólido"   },
  RECUPERA: { color: "#3B82F6", label: "Recupera" },
};

const MOOD_SEMANAL: Record<MoodSemanal, { color: string; label: string }> = {
  SEMANA_ELITE:      { color: "#F97316", label: "Elite"     },
  SEMANA_SOLIDA:     { color: "#22C55E", label: "Sólida"    },
  SEMANA_IRREGULAR:  { color: "#F59E0B", label: "Irregular" },
  SEMANA_RECUPERA:   { color: "#3B82F6", label: "Recupera"  },
};

// ── Types ──────────────────────────────────────────────────────────────────────

type Entry =
  | { type: "diario";  key: string; mood: MoodDiario  }
  | { type: "semanal"; key: string; mood: MoodSemanal };

// ── Component ──────────────────────────────────────────────────────────────────

export default function CoachHistorialSection({ onGoPremium }: { onGoPremium?: () => void }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const diario  = useAnalisisStore((s) => s.diario);
  const semanal = useAnalisisStore((s) => s.semanal);

  const diarioOverlay  = useOverlayPresenter();
  const semanalOverlay = useOverlayPresenter();

  const today = getTodayISO();

  // Diarios desc + semanales desc
  const entries: Entry[] = [
    ...Object.entries(diario)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]): Entry => ({ type: "diario", key, mood: data.mood })),
    ...Object.entries(semanal)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([key, data]): Entry => ({ type: "semanal", key, mood: data.mood })),
  ];

  if (entries.length === 0) return null;

  const t = {
    card:        isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
    border:      isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.09)",
    todayBorder: isDark ? "rgba(226,232,240,0.28)" : "rgba(15,23,42,0.22)",
    primary:     isDark ? "#F1F5F9" : "#0F172A",
    muted:       isDark ? "rgba(226,232,240,0.50)" : "rgba(15,23,42,0.42)",
  };

  const handlePress = (entry: Entry) => {
    if (entry.type === "diario") {
      diarioOverlay.present(
        <AnalisisDiarioModal
          visible
          fecha={entry.key}
          onClose={() => diarioOverlay.dismiss()}
          onGoPremium={onGoPremium}
        />
      );
    } else {
      semanalOverlay.present(
        <AnalisisSemanalModal
          visible
          semana={entry.key}
          onClose={() => semanalOverlay.dismiss()}
          onGoPremium={onGoPremium}
        />
      );
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {entries.map((entry) => {
        const isToday   = entry.type === "diario" && entry.key === today;
        const moodCfg   = entry.type === "diario"
          ? (MOOD_DIARIO[entry.mood]  ?? { color: "#94A3B8", label: "" })
          : (MOOD_SEMANAL[entry.mood] ?? { color: "#94A3B8", label: "" });
        const dateLabel = entry.type === "diario"
          ? fmtFecha(entry.key, today)
          : fmtSemana(entry.key);
        const typeLabel = entry.type === "diario" ? "DIARIO" : "SEMANAL";

        return (
          <TouchableOpacity
            key={`${entry.type}-${entry.key}`}
            style={[
              styles.card,
              {
                backgroundColor: t.card,
                borderColor:     isToday ? t.todayBorder : t.border,
                borderWidth:     isToday ? 1 : 0.5,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => handlePress(entry)}
          >
            <View style={[styles.dot, { backgroundColor: moodCfg.color }]} />

            <Text
              style={[
                styles.dateLabel,
                {
                  color:      isToday ? t.primary : t.muted,
                  fontWeight: isToday ? "800" : "600",
                },
              ]}
            >
              {dateLabel}
            </Text>

            <Text style={[styles.moodLabel, { color: moodCfg.color }]}>
              {moodCfg.label}
            </Text>

            <Text style={[styles.typeLabel, { color: t.muted }]}>
              {typeLabel}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  scroll: {
    width: "100%",
  },
  scrollContent: {
    gap: 8,
    paddingRight: 4,
  },
  card: {
    minWidth: 72,
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderRadius: 14,
    alignItems: "center",
    gap: 4,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginBottom: 1,
  },
  dateLabel: {
    fontSize: 13,
    letterSpacing: 0.1,
  },
  moodLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  typeLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});

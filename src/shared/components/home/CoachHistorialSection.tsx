// src/shared/components/home/CoachHistorialSection.tsx
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "nativewind";
import { ChevronLeft, ChevronRight } from "lucide-react-native";

import { useOverlayPresenter } from "@/shared/overlay/useOverlayPresenter";
import { useAnalisisStore } from "@/features/store/useAnalisisStore";
import AnalisisDiarioModal from "./AnalisisDiarioModal";
import AnalisisSemanalModal from "./AnalisisSemanalModal";
import type { MoodDiario, MoodSemanal } from "@/features/api/coach.api";

// ── Mood config ────────────────────────────────────────────────────────────────

const MOOD_DIARIO_COLOR: Record<MoodDiario, string> = {
  FUEGO:    "#F97316",
  SOLIDO:   "#00E85A",
  RECUPERA: "#3B82F6",
};

const MOOD_SEMANAL_COLOR: Record<MoodSemanal, string> = {
  SEMANA_ELITE:     "#00E85A",
  SEMANA_SOLIDA:    "#00E85A",
  SEMANA_IRREGULAR: "#F59E0B",
  SEMANA_RECUPERA:  "#3B82F6",
};

// ── Calendar helpers ───────────────────────────────────────────────────────────

const DIAS_ES  = ["L", "M", "X", "J", "V", "S", "D"] as const;
const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
] as const;

/** Returns "YYYY-MM-DD" without timezone shift. */
function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTodayISO(): string {
  return toISODate(new Date());
}

/** ISO week key "YYYY-Wn" (no zero-pad, to match backend). */
function getISOWeekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-W${week}`;
}

/** All weeks (Mon→Sun rows) that overlap the given month. */
function buildCalendarWeeks(year: number, month: number): Date[][] {
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);

  // Monday of the week containing the 1st
  const dow = firstDay.getDay(); // 0=Sun
  const offset = dow === 0 ? -6 : 1 - dow;
  const cursor = new Date(year, month, 1 + offset);

  const weeks: Date[][] = [];
  while (cursor <= lastDay) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function CoachHistorialSection({
  onGoPremium,
}: {
  onGoPremium?: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const today = getTodayISO();
  const todayDate = new Date();

  const [year,  setYear]  = useState(todayDate.getFullYear());
  const [month, setMonth] = useState(todayDate.getMonth());

  const diario  = useAnalisisStore((s) => s.diario);
  const semanal = useAnalisisStore((s) => s.semanal);

  const diarioOverlay  = useOverlayPresenter();
  const semanalOverlay = useOverlayPresenter();

  const weeks = buildCalendarWeeks(year, month);

  const goBack = useCallback(() => {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }, [month]);

  const goForward = useCallback(() => {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }, [month]);

  const openDia = useCallback((fecha: string) => {
    diarioOverlay.present(
      <AnalisisDiarioModal
        visible
        fecha={fecha}
        onClose={() => diarioOverlay.dismiss()}
        onGoPremium={onGoPremium}
      />
    );
  }, [diarioOverlay, onGoPremium]);

  const openSemana = useCallback((semana: string) => {
    semanalOverlay.present(
      <AnalisisSemanalModal
        visible
        semana={semana}
        onClose={() => semanalOverlay.dismiss()}
        onGoPremium={onGoPremium}
      />
    );
  }, [semanalOverlay, onGoPremium]);

  // ── Tokens ────────────────────────────────────────────────────────────────────

  const c = {
    bg:          isDark ? "#111111"                  : "#F8FAFC",
    primary:     isDark ? "#F1F5F9"                  : "#0F172A",
    secondary:   isDark ? "#94A3B8"                  : "#475569",
    muted:       isDark ? "rgba(148,163,184,0.35)"   : "rgba(100,116,139,0.35)",
    dimmed:      isDark ? "rgba(148,163,184,0.20)"   : "rgba(100,116,139,0.22)",
    todayBg:     isDark ? "rgba(0,232,90,0.14)"      : "rgba(0,180,70,0.10)",
    todayBorder: isDark ? "rgba(0,232,90,0.50)"      : "rgba(0,160,60,0.45)",
    weekBar:     isDark ? "rgba(255,255,255,0.06)"   : "rgba(0,0,0,0.05)",
    weekBarActive: (color: string) => color + (isDark ? "33" : "22"),
    headerBtn:   isDark ? "rgba(255,255,255,0.07)"   : "rgba(0,0,0,0.06)",
    accent:      "#00E85A",
  };

  // ── Derived ───────────────────────────────────────────────────────────────────

  const hasDataInMonth = weeks.some((week) =>
    week.some((day) => {
      if (day.getMonth() !== month) return false;
      const iso = toISODate(day);
      return !!diario[iso];
    }) || !!semanal[getISOWeekKey(week[0])]
  );

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      {/* Intro */}
      <Text style={[styles.introTitle, { color: c.primary }]}>
        Historial del Coach IA
      </Text>
      <Text style={[styles.introDesc, { color: c.secondary }]}>
        Cada día de entrenamiento completado genera un análisis. Toca los días o semanas marcados para verlo.
      </Text>

      {/* Month navigation */}
      <View style={styles.nav}>
        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: c.headerBtn }]}
          onPress={goBack}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronLeft size={16} color={c.secondary} strokeWidth={2.5} />
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: c.primary }]}>
          {MESES_ES[month]} {year}
        </Text>

        <TouchableOpacity
          style={[styles.navBtn, { backgroundColor: c.headerBtn }]}
          onPress={goForward}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronRight size={16} color={c.secondary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendLeft}>
          {([
            ["#F97316", "Fuego"],
            ["#00E85A", "Sólido"],
            ["#3B82F6", "Recupera"],
          ] as [string, string][]).map(([color, label]) => (
            <View key={label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: color }]} />
              <Text style={[styles.legendLabel, { color: c.muted }]}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendWeekBar, { backgroundColor: c.secondary + "55" }]} />
          <Text style={[styles.legendLabel, { color: c.muted }]}>Semana</Text>
        </View>
      </View>

      {/* Day-of-week headers */}
      <View style={styles.dowRow}>
        {/* Spacer for week indicator column */}
        <View style={styles.weekColSpacer} />
        {DIAS_ES.map((d) => (
          <View key={d} style={styles.dayCell}>
            <Text style={[styles.dowLabel, { color: c.muted }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Weeks */}
      {!hasDataInMonth && (
        <Text style={[styles.emptyMonth, { color: c.muted }]}>
          Sin análisis este mes
        </Text>
      )}

      {weeks.map((week) => {
        const weekKey   = getISOWeekKey(week[0]); // Monday of the row
        const semData   = semanal[weekKey];
        const weekColor = semData ? MOOD_SEMANAL_COLOR[semData.mood] : null;

        return (
          <View key={weekKey} style={styles.weekRow}>
            {/* Week indicator */}
            <TouchableOpacity
              style={[
                styles.weekIndicator,
                {
                  backgroundColor: weekColor
                    ? c.weekBarActive(weekColor)
                    : c.weekBar,
                },
              ]}
              activeOpacity={weekColor ? 0.7 : 1}
              onPress={() => weekColor && openSemana(weekKey)}
              hitSlop={{ top: 4, bottom: 4, left: 6, right: 4 }}
            >
              <View
                style={[
                  styles.weekDot,
                  {
                    backgroundColor: weekColor ?? c.dimmed,
                    opacity: weekColor ? 1 : 0.4,
                  },
                ]}
              />
            </TouchableOpacity>

            {/* Day cells */}
            {week.map((day) => {
              const iso       = toISODate(day);
              const inMonth   = day.getMonth() === month;
              const isToday   = iso === today;
              const diaData   = diario[iso];
              const dotColor  = diaData ? MOOD_DIARIO_COLOR[diaData.mood] : null;

              return (
                <TouchableOpacity
                  key={iso}
                  style={[
                    styles.dayCell,
                    isToday && {
                      backgroundColor: c.todayBg,
                      borderColor:     c.todayBorder,
                      borderWidth:     1,
                      borderRadius:    10,
                    },
                  ]}
                  activeOpacity={dotColor ? 0.7 : 1}
                  onPress={() => dotColor && openDia(iso)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      {
                        color: isToday
                          ? c.accent
                          : inMonth
                          ? c.primary
                          : c.dimmed,
                        fontWeight: isToday ? "800" : inMonth ? "500" : "400",
                      },
                    ]}
                  >
                    {day.getDate()}
                  </Text>

                  {dotColor ? (
                    <View
                      style={[styles.dayDot, { backgroundColor: dotColor }]}
                    />
                  ) : (
                    <View style={styles.dayDotPlaceholder} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const DAY_CELL_SIZE = 40;
const WEEK_COL_W   = 18;

const styles = StyleSheet.create({
  root: {
    width: "100%",
  },
  nav: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   16,
    paddingHorizontal: 2,
  },
  navBtn: {
    width:        30,
    height:       30,
    borderRadius: 10,
    alignItems:   "center",
    justifyContent: "center",
  },
  navTitle: {
    fontSize:   16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  dowRow: {
    flexDirection: "row",
    alignItems:    "center",
    marginBottom:  4,
  },
  weekColSpacer: {
    width: WEEK_COL_W + 6,
  },
  dowLabel: {
    fontSize:      11,
    fontWeight:    "700",
    letterSpacing: 0.4,
    textAlign:     "center",
  },
  weekRow: {
    flexDirection: "row",
    alignItems:    "center",
    marginBottom:  2,
  },
  weekIndicator: {
    width:        WEEK_COL_W,
    height:       DAY_CELL_SIZE - 4,
    borderRadius: 6,
    alignItems:   "center",
    justifyContent: "center",
    marginRight:  6,
  },
  weekDot: {
    width:        5,
    height:       5,
    borderRadius: 3,
  },
  dayCell: {
    flex:           1,
    height:         DAY_CELL_SIZE,
    alignItems:     "center",
    justifyContent: "center",
    gap:            3,
  },
  dayNumber: {
    fontSize: 14,
  },
  dayDot: {
    width:        5,
    height:       5,
    borderRadius: 3,
  },
  dayDotPlaceholder: {
    width:  5,
    height: 5,
  },
  introTitle: {
    fontSize:      18,
    fontWeight:    "800",
    letterSpacing: -0.3,
    marginBottom:  6,
  },
  introDesc: {
    fontSize:     13,
    lineHeight:   20,
    fontWeight:   "500",
    marginBottom: 20,
  },
  legend: {
    flexDirection:  "row",
    alignItems:     "center",
    justifyContent: "space-between",
    marginBottom:   14,
  },
  legendLeft: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems:    "center",
    gap:           5,
  },
  legendDot: {
    width:        6,
    height:       6,
    borderRadius: 3,
  },
  legendWeekBar: {
    width:        4,
    height:       14,
    borderRadius: 2,
  },
  legendLabel: {
    fontSize:   11,
    fontWeight: "600",
  },
  emptyMonth: {
    textAlign:  "center",
    fontSize:   13,
    fontWeight: "500",
    paddingVertical: 20,
  },
});

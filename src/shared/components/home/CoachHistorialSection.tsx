import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useColorScheme } from "nativewind";
import { useOverlayPresenter } from "@/shared/overlay/useOverlayPresenter";
import { useAnalisisStore } from "@/features/store/useAnalisisStore";
import AnalisisDiarioModal from "./AnalisisDiarioModal";
import AnalisisSemanalModal from "./AnalisisSemanalModal";

// ✅ Iconos lucide
import { Brain, CalendarDays } from "lucide-react-native";

// ── Helpers ────────────────────────────────────────────
function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

// ── Component ──────────────────────────────────────────
export default function CoachHistorialSection({ onGoPremium }: { onGoPremium?: () => void }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const diario = useAnalisisStore((s) => s.diario);
  const semanal = useAnalisisStore((s) => s.semanal);

  const diarioOverlay = useOverlayPresenter();
  const semanalOverlay = useOverlayPresenter();

  const today = getTodayISO();

  const hasDiarioHoy = !!diario[today];
  const hasSemanal = Object.keys(semanal).length > 0;

  if (!hasDiarioHoy && !hasSemanal) return null;

  const btnBorderColor = isDark ? "rgba(226,232,240,0.18)" : "rgba(15,23,42,0.12)";
  const btnTextColor = isDark ? "rgba(226,232,240,0.7)" : "rgba(15,23,42,0.6)";
  const btnIconColor = isDark ? "rgba(226,232,240,0.55)" : "rgba(15,23,42,0.45)";

  const handleOpenDiario = () => {
    diarioOverlay.present(
      <AnalisisDiarioModal
        visible
        fecha={today}
        onClose={() => diarioOverlay.dismiss()}
        onGoPremium={onGoPremium}
      />
    );
  };

  const handleOpenSemanal = () => {
    const ultimaSemana = Object.keys(semanal).sort().reverse()[0];

    semanalOverlay.present(
      <AnalisisSemanalModal
        visible
        semana={ultimaSemana}
        onClose={() => semanalOverlay.dismiss()}
        onGoPremium={onGoPremium}
      />
    );
  };

  return (
    <View style={styles.container}>
      {hasDiarioHoy && (
        <TouchableOpacity
          style={[styles.btn, { borderColor: btnBorderColor }]}
          activeOpacity={0.7}
          onPress={handleOpenDiario}
        >
          <Brain size={14} color={btnIconColor} />
          <Text style={[styles.text, { color: btnTextColor }]}>
            Coach de hoy
          </Text>
        </TouchableOpacity>
      )}

      {hasSemanal && (
        <TouchableOpacity
          style={[styles.btn, { borderColor: btnBorderColor }]}
          activeOpacity={0.7}
          onPress={handleOpenSemanal}
        >
          <CalendarDays size={14} color={btnIconColor} />
          <Text style={[styles.text, { color: btnTextColor }]}>
            Coach semanal
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
  },

  btn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 0.5,
  },

  text: {
    fontSize: 13,
    fontWeight: "500",
  },
});
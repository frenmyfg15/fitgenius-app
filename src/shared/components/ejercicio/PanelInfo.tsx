// File: src/shared/components/ejercicio/PanelInfo.tsx
import React from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";

// ── Tokens (mismo sistema compartido) ────────────────────────────────────────
const tokens = {
  color: {
    // Sheet
    sheetBgDark: "rgba(8,13,23,0.97)",
    sheetBgLight: "rgba(255,255,255,0.98)",
    sheetBorderDark: "rgba(255,255,255,0.07)",
    sheetBorderLight: "rgba(0,0,0,0.07)",

    // Overlay
    overlay: "rgba(0,0,0,0.45)",

    // Texto
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#4B5563",

    // Botón cerrar
    closeBgDark: "rgba(255,255,255,0.08)",
    closeBgLight: "#F1F5F9",

    // Chips de materiales
    chipBgDark: "rgba(255,255,255,0.07)",
    chipBgLight: "#F1F5F9",
    chipBorderDark: "rgba(255,255,255,0.10)",
    chipBorderLight: "rgba(0,0,0,0.08)",
    chipTextDark: "#CBD5E1",
    chipTextLight: "#475569",

    // Cards de pasos
    stepBgDark: "rgba(255,255,255,0.04)",
    stepBgLight: "#F8FAFC",
    stepBorderDark: "rgba(255,255,255,0.07)",
    stepBorderLight: "rgba(0,0,0,0.07)",

    // Número de paso
    stepNumDark: "#22C55E",
    stepNumLight: "#16A34A",
  },
  radius: { xl: 24, lg: 16, md: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
} as const;

// ── Tipos — API pública sin cambios ───────────────────────────────────────────
type Instruccion = { paso: number; texto: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  materiales: string[];
  instrucciones: Instruccion[];
  nombreEjercicio?: string;
};

// ── Componente ────────────────────────────────────────────────────────────────
export default function PanelInfo({
  visible, onClose, materiales, instrucciones, nombreEjercicio,
}: Props) {
  // ── Lógica original — sin cambios ─────────────────────────────────────────
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;
  // ── Fin lógica original ───────────────────────────────────────────────────

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  return (
    <View
      style={[styles.overlay, { backgroundColor: tokens.color.overlay }]}
      accessibilityLabel="Panel de información del ejercicio"
      accessibilityViewIsModal
    >
      {/* ── Sheet ────────────────────────────────────────────────────────── */}
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: isDark ? tokens.color.sheetBgDark : tokens.color.sheetBgLight,
            borderTopColor: isDark ? tokens.color.sheetBorderDark : tokens.color.sheetBorderLight,
          },
        ]}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: textPrimary }]}>
              Información
            </Text>
            {nombreEjercicio ? (
              <Text numberOfLines={2} style={[styles.headerSubtitle, { color: textSecondary }]}>
                {nombreEjercicio}
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cerrar panel de información"
            style={[styles.closeBtn, { backgroundColor: isDark ? tokens.color.closeBgDark : tokens.color.closeBgLight }]}
          >
            <X size={18} color={textPrimary} strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* ── Scroll ───────────────────────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Materiales */}
          <SectionTitle label="Materiales" color={textPrimary} />
          <View style={styles.chipsRow}>
            {materiales.length > 0 ? (
              materiales.map((item) => (
                <View
                  key={item}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight,
                      borderColor: isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: isDark ? tokens.color.chipTextDark : tokens.color.chipTextLight }]}>
                    {item}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                No se requiere material.
              </Text>
            )}
          </View>

          {/* Instrucciones */}
          <SectionTitle label="Instrucciones" color={textPrimary} />
          <View style={styles.stepsCol}>
            {instrucciones.length > 0 ? (
              instrucciones.map((i) => (
                <View
                  key={i.paso}
                  style={[
                    styles.stepCard,
                    {
                      backgroundColor: isDark ? tokens.color.stepBgDark : tokens.color.stepBgLight,
                      borderColor: isDark ? tokens.color.stepBorderDark : tokens.color.stepBorderLight,
                    },
                  ]}
                >
                  {/* Número del paso con color accent */}
                  <Text style={[styles.stepNum, { color: isDark ? tokens.color.stepNumDark : tokens.color.stepNumLight }]}>
                    {i.paso}
                  </Text>
                  <Text style={[styles.stepText, { color: textPrimary }]}>
                    {i.texto}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={[styles.emptyText, { color: textSecondary }]}>
                No hay instrucciones disponibles.
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

// ── SectionTitle — título de sección con línea decorativa ────────────────────
function SectionTitle({ label, color }: { label: string; color: string }) {
  return (
    <Text style={[styles.sectionTitle, { color }]}>
      {label}
    </Text>
  );
}

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Overlay
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 40,
    justifyContent: "flex-end",
  },

  // Bottom sheet
  sheet: {
    height: "95%",
    borderTopLeftRadius: tokens.radius.xl,
    borderTopRightRadius: tokens.radius.xl,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 16,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: tokens.spacing.lg,
  },
  headerText: {
    flex: 1,
    marginRight: tokens.spacing.md,
    gap: tokens.spacing.xs,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scrollContent: {
    paddingBottom: 64,
    paddingTop: tokens.spacing.xs,
    gap: tokens.spacing.md,
  },

  // Título de sección
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },

  // Chips de materiales
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Pasos
  stepsCol: {
    gap: tokens.spacing.sm,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: tokens.spacing.md,
    padding: tokens.spacing.md,
    borderRadius: tokens.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepNum: {
    fontSize: 14,
    fontWeight: "800",
    width: 20,
    textAlign: "center",
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },

  // Texto vacío
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
// File: src/shared/components/ejercicio/PanelInfo.tsx
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

// ── Tokens ──────────────────────────────────────────────────────────────────
const tokens = {
  color: {
    sheetBgDark: "rgba(8,13,23,0.97)",
    sheetBgLight: "rgba(255,255,255,0.98)",
    sheetBorderDark: "rgba(255,255,255,0.07)",
    sheetBorderLight: "rgba(0,0,0,0.07)",
    overlay: "rgba(0,0,0,0.45)",
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#4B5563",
    closeBgDark: "rgba(255,255,255,0.08)",
    closeBgLight: "#F1F5F9",
    chipBgDark: "rgba(255,255,255,0.07)",
    chipBgLight: "#F1F5F9",
    chipBorderDark: "rgba(255,255,255,0.10)",
    chipBorderLight: "rgba(0,0,0,0.08)",
    chipTextDark: "#CBD5E1",
    chipTextLight: "#475569",
    stepBgDark: "rgba(255,255,255,0.04)",
    stepBgLight: "#F8FAFC",
    stepBorderDark: "rgba(255,255,255,0.07)",
    stepBorderLight: "rgba(0,0,0,0.07)",
    stepNumDark: "#22C55E",
    stepNumLight: "#16A34A",
  },
  radius: { xl: 24, lg: 16, md: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
} as const;

type Instruccion = { paso: number; texto: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  materiales: string[];
  instrucciones: Instruccion[];
  nombreEjercicio?: string;
};

export default function PanelInfo({
  visible,
  onClose,
  materiales,
  instrucciones,
  nombreEjercicio,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // ✅ Máximo 80% (sin pasarse)
  const snapPoints = useMemo(() => ["50%", "80%"], []);

  useEffect(() => {
    if (visible) bottomSheetModalRef.current?.present();
    else bottomSheetModalRef.current?.dismiss();
  }, [visible]);

  const textPrimary = isDark
    ? tokens.color.textPrimaryDark
    : tokens.color.textPrimaryLight;
  const textSecondary = isDark
    ? tokens.color.textSecondaryDark
    : tokens.color.textSecondaryLight;

  const handleClosePress = useCallback(() => {
    // ✅ Cierre “real” del modal (onClose se disparará en onDismiss)
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    []
  );

  // ✅ Evita que llegue bajo la barra de notificación
  const topInset = Math.max(insets.top, 12);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableContentPanningGesture={false}
      // ✅ no permite “estirar” por encima del 80%
      enableOverDrag={false}
      overDragResistanceFactor={0}
      // ✅ respeta status bar
      topInset={topInset}
      backgroundStyle={{
        backgroundColor: isDark
          ? tokens.color.sheetBgDark
          : tokens.color.sheetBgLight,
      }}
      handleIndicatorStyle={{
        backgroundColor: textSecondary,
        width: 40,
      }}
      style={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
      containerStyle={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
    >
      {/* Header fijo (No scrolleable) */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            Información
          </Text>
          {nombreEjercicio ? (
            <Text
              numberOfLines={2}
              style={[styles.headerSubtitle, { color: textSecondary }]}
            >
              {nombreEjercicio}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleClosePress}
          activeOpacity={0.85}
          style={[
            styles.closeBtn,
            {
              backgroundColor: isDark
                ? tokens.color.closeBgDark
                : tokens.color.closeBgLight,
            },
          ]}
        >
          <X size={18} color={textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* Contenido Scrolleable */}
      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          {
            // ✅ extra para que el final nunca quede pegado
            paddingBottom: 100 + insets.bottom,
          },
        ]}
      >
        {/* Sección Materiales */}
        <SectionTitle label="Materiales" color={textPrimary} />
        <View style={styles.chipsRow}>
          {materiales.length > 0 ? (
            materiales.map((item) => (
              <View
                key={item}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDark
                      ? tokens.color.chipBgDark
                      : tokens.color.chipBgLight,
                    borderColor: isDark
                      ? tokens.color.chipBorderDark
                      : tokens.color.chipBorderLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: isDark
                        ? tokens.color.chipTextDark
                        : tokens.color.chipTextLight,
                    },
                  ]}
                >
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

        {/* Sección Instrucciones */}
        <SectionTitle label="Instrucciones" color={textPrimary} />
        <View style={styles.stepsCol}>
          {instrucciones.length > 0 ? (
            instrucciones.map((i) => (
              <View
                key={i.paso}
                style={[
                  styles.stepCard,
                  {
                    backgroundColor: isDark
                      ? tokens.color.stepBgDark
                      : tokens.color.stepBgLight,
                    borderColor: isDark
                      ? tokens.color.stepBorderDark
                      : tokens.color.stepBorderLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stepNum,
                    {
                      color: isDark
                        ? tokens.color.stepNumDark
                        : tokens.color.stepNumLight,
                    },
                  ]}
                >
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
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.md,
    marginBottom: tokens.spacing.md,
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
  scrollContent: {
    paddingHorizontal: tokens.spacing.xl,
    gap: tokens.spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: tokens.spacing.sm,
    marginBottom: tokens.spacing.sm,
  },
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
  emptyText: {
    fontSize: 13,
    lineHeight: 20,
  },
});

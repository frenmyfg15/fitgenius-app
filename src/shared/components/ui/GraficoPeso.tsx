import React, { useState, useCallback, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  LayoutChangeEvent,
  Platform,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { Plus, X } from "lucide-react-native";
import { useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";

import WeightRulerPicker, { UnidadPeso } from "@/shared/components/ui/WeightRulerPicker";
import { useMedicionesStore } from "@/features/store/useMedicionesStore";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { registrarPeso, obtenerHistorialPeso } from "@/features/api/usuario.api";
import { kgToLb } from "@/shared/utils/kgToLb";

// ── Tokens (mismo sistema de diseño) ────────────────────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",
    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",
    chipBgDark: "rgba(148,163,184,0.12)",
    chipBgLight: "#F1F5F9",
    chipBorderDark: "rgba(255,255,255,0.06)",
    chipBorderLight: "rgba(0,0,0,0.06)",
    chartBgDark: "#020617",
    chartBgLight: "#FFFFFF",
    overlayDark: "rgba(0,0,0,0.7)",
    overlayLight: "rgba(0,0,0,0.4)",
    sheetBgDark: "#0f1829",
    sheetBgLight: "#FFFFFF",
    sheetBorderDark: "rgba(255,255,255,0.10)",
    sheetBorderLight: "rgba(0,0,0,0.08)",
    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#94A3B8",
    textSecondaryLight: "#6B7280",
    textMutedDark: "#64748B",
    textMutedLight: "#71717A",
    accent: "#22C55E",
  },
  radius: { lg: 16, md: 12, sm: 8, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

const MAX_CHART_POINTS = 8;

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function normalizePesoKg(input: number): number {
  if (!Number.isFinite(input)) return 70;
  return Math.max(30, Math.min(200, Math.round(input)));
}

// ── Componente ───────────────────────────────────────────────────────────────
export default function GraficoPeso() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const usuario = useUsuarioStore((s) => s.usuario);
  const setUsuario = useUsuarioStore((s) => s.setUsuario);
  const pesos = useMedicionesStore((s) => s.pesos);
  const setPesos = useMedicionesStore((s) => s.setPesos);
  const addPeso = useMedicionesStore((s) => s.addPeso);

  const unidad = ((usuario?.medidaPeso ?? "KG") as UnidadPeso).toUpperCase() as UnidadPeso;

  // Estado del modal
  const [modalVisible, setModalVisible] = useState(false);
  const [localKg, setLocalKg] = useState<number>(() =>
    normalizePesoKg(Number(usuario?.peso ?? 70))
  );
  const [saving, setSaving] = useState(false);

  // Estado del chart
  const [chartWidth, setChartWidth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const localKgRef = useRef(localKg);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const wasVisibleRef = useRef(false);

  const snapPoints = useMemo(() => ["58%"], []);
  const topInset = Math.max(insets.top, 12);
  const bottomPadding = insets.bottom + 20;

  useEffect(() => {
    localKgRef.current = localKg;
  }, [localKg]);

  useEffect(() => {
    if (modalVisible && !wasVisibleRef.current) {
      bottomSheetModalRef.current?.present();
      wasVisibleRef.current = true;
    }

    if (!modalVisible && wasVisibleRef.current) {
      bottomSheetModalRef.current?.dismiss();
      wasVisibleRef.current = false;
    }
  }, [modalVisible]);

  // Cargar historial al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        try {
          setLoading(true);
          const data = await obtenerHistorialPeso();
          if (!cancelled && Array.isArray(data)) {
            setPesos(data);
          }
        } catch {
          // silencioso — si falla, muestra lo que haya en caché
        } finally {
          if (!cancelled) setLoading(false);
        }
      };
      void load();
      return () => {
        cancelled = true;
      };
    }, [setPesos])
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0) setChartWidth((prev) => (prev === w ? prev : w));
  }, []);

  const openModal = useCallback(() => {
    setLocalKg(normalizePesoKg(Number(usuario?.peso ?? 70)));
    setModalVisible(true);
  }, [usuario?.peso]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSave = async () => {
    const kg = localKgRef.current;
    try {
      setSaving(true);
      const nueva = await registrarPeso(kg);
      // Actualizar caché local
      if (nueva?.id) {
        addPeso(nueva);
      } else {
        addPeso({ id: Date.now(), valor: kg, fecha: new Date().toISOString() });
      }
      // Actualizar usuario en store
      if (usuario?.id) {
        setUsuario({ ...(usuario as any), peso: kg });
      }
      setModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Peso registrado",
        text2: `${formatDisplay(kg)} guardado correctamente.`,
      });
    } catch (e: any) {
      Toast.show({
        type: "error",
        text1: "No se pudo guardar",
        text2: e?.message ?? "Inténtalo de nuevo.",
      });
    } finally {
      setSaving(false);
    }
  };

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={isDark ? 0.7 : 0.4}
        pressBehavior="close"
      />
    ),
    [isDark]
  );

  // Conversión KG → unidad display para el gráfico
  function toDisplayValue(kg: number): number {
    if (unidad === "LB") return Math.round(kg * 2.20462 * 10) / 10;
    return Math.round(kg * 10) / 10;
  }

  function formatDisplay(kg: number): string {
    if (unidad === "LB") return kgToLb(kg);
    return `${Math.round(kg * 10) / 10} kg`;
  }

  // Datos del chart (últimos MAX_CHART_POINTS)
  const ultimos = pesos.slice(-MAX_CHART_POINTS);
  const hasChart = ultimos.length >= 2;

  const chartData = {
    labels: ultimos.map((m) => formatFecha(m.fecha)),
    datasets: [{ data: ultimos.map((m) => toDisplayValue(m.valor)) }],
  };

  // Colores
  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;
  const textMuted = isDark ? tokens.color.textMutedDark : tokens.color.textMutedLight;
  const cardBg = isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight;
  const cardBorder = isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight;
  const chipBg = isDark ? tokens.color.chipBgDark : tokens.color.chipBgLight;
  const chipBorder = isDark ? tokens.color.chipBorderDark : tokens.color.chipBorderLight;
  const sheetBg = isDark ? tokens.color.sheetBgDark : tokens.color.sheetBgLight;
  const sheetBorder = isDark ? tokens.color.sheetBorderDark : tokens.color.sheetBorderLight;

  return (
    <>
      {/* ── Card ─────────────────────────────────────────────────────────── */}
      <View style={styles.root}>
        <LinearGradient
          colors={GRADIENT as any}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.frame}
        >
          <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.title, { color: textPrimary }]}>Historial de peso</Text>
                <View style={[styles.chip, { backgroundColor: chipBg, borderColor: chipBorder }]}>
                  <Text style={[styles.chipText, { color: textSecondary }]}>
                    Unidad:{" "}
                    <Text style={[styles.chipTextStrong, { color: textPrimary }]}>
                      {unidad.toLowerCase()}
                    </Text>
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={openModal}
                activeOpacity={0.8}
                style={[styles.addBtn, { backgroundColor: tokens.color.accent }]}
                accessibilityLabel="Registrar nuevo peso"
              >
                <Plus size={16} color="#fff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Último registro */}
            {pesos.length > 0 && (
              <View style={[styles.lastRow, { borderColor: chipBorder }]}>
                <Text style={[styles.lastLabel, { color: textMuted }]}>Último registro</Text>
                <Text style={[styles.lastValue, { color: textPrimary }]}>
                  {formatDisplay(pesos[pesos.length - 1].valor)}
                </Text>
                <Text style={[styles.lastDate, { color: textMuted }]}>
                  {formatFecha(pesos[pesos.length - 1].fecha)}
                </Text>
              </View>
            )}

            {/* Chart */}
            <View style={styles.chartWrapper}>
              {loading ? (
                <View style={styles.placeholder}>
                  <ActivityIndicator color={tokens.color.accent} />
                </View>
              ) : hasChart ? (
                <View onLayout={handleLayout} style={styles.chartInner}>
                  {chartWidth ? (
                    <LineChart
                      key={chartWidth}
                      data={chartData}
                      width={chartWidth}
                      height={200}
                      bezier
                      fromZero={false}
                      chartConfig={{
                        backgroundGradientFrom: isDark
                          ? tokens.color.chartBgDark
                          : tokens.color.chartBgLight,
                        backgroundGradientTo: isDark
                          ? tokens.color.chartBgDark
                          : tokens.color.chartBgLight,
                        decimalPlaces: 1,
                        color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
                        labelColor: (opacity = 1) =>
                          isDark
                            ? `rgba(226,232,240,${opacity})`
                            : `rgba(15,23,42,${opacity})`,
                        propsForDots: {
                          r: "4",
                          strokeWidth: "2",
                          stroke: isDark
                            ? tokens.color.chartBgDark
                            : tokens.color.chartBgLight,
                        },
                      }}
                      style={{ borderRadius: tokens.radius.md }}
                    />
                  ) : null}
                </View>
              ) : (
                <View style={styles.placeholder}>
                  <Text style={[styles.emptyText, { color: textMuted }]}>
                    {pesos.length === 0
                      ? "Registra tu primer peso con el botón +"
                      : "Necesitas al menos 2 registros para ver el gráfico"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* ── Bottom Sheet ─────────────────────────────────────────────────── */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={() => {
          wasVisibleRef.current = false;
          setModalVisible(false);
        }}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableOverDrag={false}
        overDragResistanceFactor={0}
        topInset={topInset}
        handleIndicatorStyle={{
          backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.12)",
        }}
        backgroundStyle={{
          backgroundColor: sheetBg,
          borderTopWidth: 1,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: sheetBorder,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
        style={{
          zIndex: 1000,
          ...(Platform.OS === "android" ? { elevation: 1000 } : null),
        }}
        containerStyle={{
          zIndex: 1000,
          ...(Platform.OS === "android" ? { elevation: 1000 } : null),
        }}
      >
        <BottomSheetView
          style={[
            styles.sheetContent,
            {
              paddingBottom: bottomPadding,
            },
          ]}
        >
          {/* Título + cerrar */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: textPrimary }]}>Registrar peso</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={8}>
              <X size={20} color={textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Selector de unidad (informativo — el picker la gestiona) */}
          <Text style={[styles.sheetSubtitle, { color: textSecondary }]}>
            Introduce tu peso en{" "}
            <Text style={{ color: textPrimary, fontWeight: "700" }}>
              {unidad.toLowerCase()}
            </Text>
          </Text>

          {/* Ruler */}
          <WeightRulerPicker
            unit={unidad}
            valueKg={localKg}
            minKg={30}
            maxKg={200}
            stepKg={1}
            onChange={(kg) => setLocalKg(normalizePesoKg(kg))}
            onChangeEnd={(kg) => setLocalKg(normalizePesoKg(kg))}
            rulerStyle={{ width: "100%", backgroundColor: sheetBg }}
            containerStyle={{ width: "100%" }}
            labelColor={isDark ? "#E5E7EB" : "#111827"}
            hintColor={isDark ? "#9CA3AF" : "#6B7280"}
            indicatorColor={tokens.color.accent}
          />

          {/* Botón guardar */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={saving}
            style={[styles.saveBtn, { opacity: saving ? 0.65 : 1 }]}
          >
            <LinearGradient
              colors={GRADIENT as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveBtnGradient}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Guardar</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheetModal>
    </>
  );
}

// ── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 520 },

  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: tokens.spacing.xl,
    paddingTop: tokens.spacing.lg,
    paddingBottom: tokens.spacing.sm,
    gap: tokens.spacing.md,
  },
  headerLeft: { flex: 1, gap: tokens.spacing.xs },
  title: { fontSize: 13, fontWeight: "800", letterSpacing: 0.2 },

  chip: {
    alignSelf: "flex-start",
    borderRadius: tokens.radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  chipText: { fontSize: 11 },
  chipTextStrong: { fontWeight: "700" },

  addBtn: {
    width: 32,
    height: 32,
    borderRadius: tokens.radius.full,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
    marginHorizontal: tokens.spacing.xl,
    marginBottom: tokens.spacing.sm,
    paddingVertical: tokens.spacing.sm,
    borderTopWidth: 1,
  },
  lastLabel: { fontSize: 11, fontWeight: "600", flex: 1 },
  lastValue: { fontSize: 13, fontWeight: "800" },
  lastDate: { fontSize: 11, fontWeight: "600" },

  chartWrapper: {
    paddingHorizontal: tokens.spacing.lg,
    paddingBottom: tokens.spacing.lg,
  },
  chartInner: { borderRadius: tokens.radius.md, overflow: "hidden" },

  placeholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: tokens.spacing.xl,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 20,
  },

  // Bottom Sheet
  sheetContent: {
    paddingTop: 8,
    paddingHorizontal: tokens.spacing.xl,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: tokens.spacing.sm,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800" },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: tokens.spacing.md,
  },
  saveBtn: { marginTop: tokens.spacing.lg },
  saveBtnGradient: {
    borderRadius: tokens.radius.full,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
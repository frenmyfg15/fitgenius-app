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

import HeightRulerPicker, { UnidadAltura } from "@/shared/components/ui/HeightRulerPicker";
import { useMedicionesStore } from "@/features/store/useMedicionesStore";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { registrarAltura, obtenerHistorialAltura } from "@/features/api/usuario.api";
import { cmToFt } from "@/shared/utils/cmToFt";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

const CHART_GREEN = "#22C55E";
const CHART_BG_DARK = "#020617";

const GRADIENT = [
  "rgb(0,255,64)",
  "rgb(94,230,157)",
  "rgb(178,0,255)",
] as const;

const MAX_CHART_POINTS = 8;

function formatFecha(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function normalizeAlturaCm(input: number): number {
  if (!Number.isFinite(input)) return 170;
  return Math.max(100, Math.min(220, Math.round(input)));
}

export default function GraficoAltura() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const insets = useSafeAreaInsets();

  const t = scheme(isDark);

  const usuario = useUsuarioStore((s) => s.usuario);
  const setUsuario = useUsuarioStore((s) => s.setUsuario);
  const alturas = useMedicionesStore((s) => s.alturas);
  const setAlturas = useMedicionesStore((s) => s.setAlturas);
  const addAltura = useMedicionesStore((s) => s.addAltura);

  const unidad = ((usuario?.medidaAltura ?? "CM") as UnidadAltura).toUpperCase() as UnidadAltura;

  const [modalVisible, setModalVisible] = useState(false);
  const [localCm, setLocalCm] = useState<number>(() =>
    normalizeAlturaCm(Number(usuario?.altura ?? 170))
  );
  const [saving, setSaving] = useState(false);
  const [chartWidth, setChartWidth] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const localCmRef = useRef(localCm);
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const wasVisibleRef = useRef(false);

  const snapPoints = useMemo(() => ["58%"], []);
  const topInset = Math.max(insets.top, 12);
  const bottomPadding = insets.bottom + 20;

  useEffect(() => {
    localCmRef.current = localCm;
  }, [localCm]);

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

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      const load = async () => {
        try {
          setLoading(true);
          const data = await obtenerHistorialAltura();
          if (!cancelled && Array.isArray(data)) {
            setAlturas(data);
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
    }, [setAlturas])
  );

  const handleLayout = useCallback((e: LayoutChangeEvent) => {
    const w = Math.round(e.nativeEvent.layout.width);
    if (w > 0) setChartWidth((prev) => (prev === w ? prev : w));
  }, []);

  const openModal = useCallback(() => {
    setLocalCm(normalizeAlturaCm(Number(usuario?.altura ?? 170)));
    setModalVisible(true);
  }, [usuario?.altura]);

  const closeModal = useCallback(() => {
    setModalVisible(false);
  }, []);

  const handleSave = async () => {
    const cm = localCmRef.current;
    try {
      setSaving(true);
      const nueva = await registrarAltura(cm);
      if (nueva?.id) {
        addAltura(nueva);
      } else {
        addAltura({ id: Date.now(), valor: cm, fecha: new Date().toISOString() });
      }
      if (usuario?.id) {
        setUsuario({ ...(usuario as any), altura: String(cm) });
      }
      setModalVisible(false);
      Toast.show({
        type: "success",
        text1: "Altura registrada",
        text2: `${formatDisplay(cm)} guardada correctamente.`,
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

  function toDisplayValue(cm: number): number {
    if (unidad === "FT") return Math.round((cm / 30.48) * 100) / 100;
    return cm;
  }

  function formatDisplay(cm: number): string {
    if (unidad === "FT") return cmToFt(cm);
    return `${cm} cm`;
  }

  const ultimos = alturas.slice(-MAX_CHART_POINTS);
  const hasChart = ultimos.length >= 2;

  const chartData = {
    labels: ultimos.map((m) => formatFecha(m.fecha)),
    datasets: [{ data: ultimos.map((m) => toDisplayValue(m.valor)) }],
  };

  const sheetBg = isDark ? Colors.dark.surface : Colors.secondary;
  const sheetBorder = isDark ? t.borderStrong : t.border;
  const chipBg = isDark ? t.border : t.surface;
  const chipBorder = t.border;
  const chartBgColor = isDark ? CHART_BG_DARK : Colors.secondary;

  return (
    <>
      {/* Card */}
      <View style={styles.root}>
        <View
          style={[
            styles.card,
            { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[styles.title, { color: t.textPrimary }]}>
                Historial de altura
              </Text>
              <View style={[styles.chip, { backgroundColor: chipBg, borderColor: chipBorder }]}>
                <Text style={[styles.chipText, { color: t.textSecondary }]}>
                  Unidad:{" "}
                  <Text style={[styles.chipTextStrong, { color: t.textPrimary }]}>
                    {unidad.toLowerCase()}
                  </Text>
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={openModal}
              activeOpacity={0.8}
              style={[styles.addBtn, { backgroundColor: CHART_GREEN }]}
              accessibilityLabel="Registrar nueva altura"
            >
              <Plus size={16} color="#fff" strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Último registro */}
          {alturas.length > 0 && (
            <View style={[styles.lastRow, { borderColor: chipBorder }]}>
              <Text style={[styles.lastLabel, { color: t.textTertiary }]}>Último registro</Text>
              <Text style={[styles.lastValue, { color: t.textPrimary }]}>
                {formatDisplay(alturas[alturas.length - 1].valor)}
              </Text>
              <Text style={[styles.lastDate, { color: t.textTertiary }]}>
                {formatFecha(alturas[alturas.length - 1].fecha)}
              </Text>
            </View>
          )}

          {/* Chart */}
          <View style={styles.chartWrapper}>
            {loading ? (
              <View style={styles.placeholder}>
                <ActivityIndicator color={CHART_GREEN} />
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
                      backgroundGradientFrom: chartBgColor,
                      backgroundGradientTo: chartBgColor,
                      decimalPlaces: unidad === "FT" ? 2 : 0,
                      color: (opacity = 1) => `rgba(34,197,94,${opacity})`,
                      labelColor: (opacity = 1) =>
                        isDark
                          ? `rgba(226,232,240,${opacity})`
                          : `rgba(15,23,42,${opacity})`,
                      propsForDots: {
                        r: "4",
                        strokeWidth: "2",
                        stroke: chartBgColor,
                      },
                    }}
                    style={{ borderRadius: 12 }}
                  />
                ) : null}
              </View>
            ) : (
              <View style={styles.placeholder}>
                <Text style={[styles.emptyText, { color: t.textTertiary }]}>
                  {alturas.length === 0
                    ? "Registra tu primera altura con el botón +"
                    : "Necesitas al menos 2 registros para ver el gráfico"}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Bottom Sheet */}
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
        <BottomSheetView style={[styles.sheetContent, { paddingBottom: bottomPadding }]}>
          {/* Título + cerrar */}
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: t.textPrimary }]}>Registrar altura</Text>
            <TouchableOpacity onPress={closeModal} hitSlop={8}>
              <X size={20} color={t.textSecondary} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.sheetSubtitle, { color: t.textSecondary }]}>
            Introduce tu altura en{" "}
            <Text style={{ color: t.textPrimary, fontWeight: "700", fontFamily: Font.body.bold }}>
              {unidad.toLowerCase()}
            </Text>
          </Text>

          {/* Ruler */}
          <HeightRulerPicker
            unit={unidad}
            valueCm={localCm}
            minCm={100}
            maxCm={220}
            stepCm={1}
            onChange={(cm) => setLocalCm(normalizeAlturaCm(cm))}
            onChangeEnd={(cm) => setLocalCm(normalizeAlturaCm(cm))}
            rulerStyle={{ width: "100%", backgroundColor: sheetBg }}
            containerStyle={{ width: "100%" }}
            tickColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(17,24,39,0.35)"}
            tickColorMajor={isDark ? "rgba(255,255,255,0.85)" : "rgba(17,24,39,0.85)"}
            labelColor={isDark ? "#E5E7EB" : "#111827"}
            hintColor={isDark ? "#9CA3AF" : "#6B7280"}
            indicatorColor={CHART_GREEN}
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

const styles = StyleSheet.create({
  root: { width: "100%", maxWidth: 520 },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  headerLeft: { flex: 1, gap: 4 },
  title: { fontSize: 13, fontWeight: "800", fontFamily: Font.body.bold, letterSpacing: 0.2 },
  chip: {
    alignSelf: "flex-start",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  chipText: { fontSize: 11, fontFamily: Font.body.regular },
  chipTextStrong: { fontWeight: "700", fontFamily: Font.body.bold },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  lastRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 8,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  lastLabel: { fontSize: 11, fontWeight: "600", fontFamily: Font.body.semiBold, flex: 1 },
  lastValue: { fontSize: 13, fontWeight: "800", fontFamily: Font.body.bold },
  lastDate: { fontSize: 11, fontWeight: "600", fontFamily: Font.body.semiBold },
  chartWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  chartInner: { borderRadius: 12, overflow: "hidden" },
  placeholder: {
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: Font.body.medium,
    textAlign: "center",
    lineHeight: 20,
  },
  sheetContent: {
    paddingTop: 8,
    paddingHorizontal: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "800", fontFamily: Font.title.bold },
  sheetSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: Font.body.medium,
    marginBottom: 12,
  },
  saveBtn: { marginTop: 16 },
  saveBtnGradient: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    fontFamily: Font.title.bold,
    letterSpacing: 0.3,
  },
});

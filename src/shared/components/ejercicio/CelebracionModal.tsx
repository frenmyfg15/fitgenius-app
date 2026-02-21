import React, { useEffect, useMemo, useRef, useState, memo, useCallback } from "react";
import { View, Text, StyleSheet, Image, Pressable, Platform } from "react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LottieView from "lottie-react-native";
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";

/* Assets locales */
const iconKcal = require("../../../../assets/fit/ejercicio/calorias.png");
const iconExp = require("../../../../assets/fit/ejercicio/experiencia.png");
const confettiAnim = require("../../../../assets/lootie/feliticitaciones.json");

// ── Design tokens ─────────────────────────────────────────────────────────────
const t = {
  accent: "#E8FF47",
  accentDim: "rgba(232,255,71,0.12)",
  dark: {
    sheetBg: "rgba(12,14,20,0.97)",
    border: "rgba(255,255,255,0.08)",
    textPrimary: "#F5F5F5",
    textMuted: "rgba(255,255,255,0.45)",
    chip: "rgba(255,255,255,0.06)",
  },
  light: {
    sheetBg: "rgba(255,255,255,0.97)",
    border: "rgba(0,0,0,0.08)",
    textPrimary: "#0A0A0A",
    textMuted: "rgba(0,0,0,0.45)",
    chip: "rgba(0,0,0,0.05)",
  },
  r: { card: 24, full: 999, md: 14 },
  sp: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 },
} as const;

// ── RPE ───────────────────────────────────────────────────────────────────────
const RPE_SCALE = [
  { v: 1, label: "Reposo" },
  { v: 2, label: "Muy ligero" },
  { v: 3, label: "Ligero" },
  { v: 4, label: "Moderado" },
  { v: 5, label: "Algo duro" },
  { v: 6, label: "Duro" },
  { v: 7, label: "Muy duro" },
  { v: 8, label: "Intenso" },
  { v: 9, label: "Muy intenso" },
  { v: 10, label: "Máximo" },
] as const;

// ── Tipos ─────────────────────────────────────────────────────────────────────
type SerieSimple = { reps: number; peso: number };
type SerieCompuesta = {
  ejercicioId: number;
  pesoKg?: number;
  repeticiones?: number;
  duracionSegundos?: number;
}[];

type Props = {
  visible: boolean;
  series?: SerieSimple[];
  seriesComp?: SerieCompuesta[];
  nivelEstres?: number | null;
  esCompuesto?: boolean;
  onFinish?: () => void;
};

// ── Cálculos ──────────────────────────────────────────────────────────────────
function calcVolumen(s: SerieSimple[]) { return s.reduce((a, x) => a + x.peso * x.reps, 0); }
function calcVolumenComp(sc: SerieCompuesta[]) {
  return sc.reduce((a, s) => a + s.reduce((b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0), 0), 0);
}
function calcCalorias(s: SerieSimple[]) {
  return Math.round(s.reduce((a, x) => a + x.peso * x.reps * 0.1, 0) + s.length * 3);
}
function calcCaloriasComp(sc: SerieCompuesta[]) {
  return Math.round(
    sc.reduce((a, s) => a + s.reduce((b, c) => b + (c.pesoKg ?? 0) * (c.repeticiones ?? 0) * 0.1, 0), 0) +
    sc.length * 5
  );
}
function mejorSerie(s: SerieSimple[]) {
  return s.length ? s.reduce((b, x) => (x.peso * x.reps > b.peso * b.reps ? x : b)) : null;
}
function getMotiv(n: number) {
  if (n <= 3) return "Recuperación activa";
  if (n <= 5) return "Zona aeróbica";
  if (n <= 7) return "Zona de desarrollo";
  if (n <= 9) return "Alta intensidad";
  return "Esfuerzo máximo";
}

// ── UI bits ───────────────────────────────────────────────────────────────────
const StatCard = memo(function StatCard({
  isDark, title, value, sub, glyph, image,
}: { isDark: boolean; title: string; value: string; sub?: string; glyph?: string; image?: any }) {
  const tok = isDark ? t.dark : t.light;
  return (
    <View style={[s.statCard, { backgroundColor: tok.chip, borderColor: tok.border }]}>
      <View style={[s.statIcon, { backgroundColor: t.accentDim }]}>
        {image ? (
          <Image source={image} accessibilityIgnoresInvertColors style={{ width: 22, height: 22 }} resizeMode="contain" />
        ) : (
          <Text style={[s.statGlyph, { color: t.accent }]}>{glyph ?? "◈"}</Text>
        )}
      </View>

      <View style={{ flex: 1 }}>
        <Text style={[s.statTitle, { color: tok.textMuted }]}>{title}</Text>
        <Text style={[s.statValue, { color: tok.textPrimary }]}>{value}</Text>
        {!!sub && <Text style={[s.statSub, { color: tok.textMuted }]}>{sub}</Text>}
      </View>
    </View>
  );
});

const Chip = memo(function Chip({ isDark, text }: { isDark: boolean; text: string }) {
  const tok = isDark ? t.dark : t.light;
  return (
    <View style={[s.chip, { backgroundColor: tok.chip, borderColor: tok.border }]}>
      <Text style={[s.chipText, { color: tok.textPrimary }]}>{text}</Text>
    </View>
  );
});

// ── Principal ─────────────────────────────────────────────────────────────────
export default function CelebracionSheet({
  visible,
  series = [],
  seriesComp = [],
  nivelEstres = null,
  esCompuesto = false,
  onFinish,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const tok = isDark ? t.dark : t.light;

  const insets = useSafeAreaInsets();
  const topInset = Math.max(insets.top, 12);

  const modalRef = useRef<BottomSheetModal>(null);

  // ✅ “Pantalla”: un único snap alto
  const snapPoints = useMemo(() => ["92%"], []);

  const [confettiDone, setConfettiDone] = useState(false);

  const data = useMemo(() => {
    const vol = esCompuesto ? calcVolumenComp(seriesComp) : calcVolumen(series);
    const kcal = esCompuesto ? calcCaloriasComp(seriesComp) : calcCalorias(series);
    const best = esCompuesto ? null : mejorSerie(series);
    const rpe = RPE_SCALE.find((r) => r.v === nivelEstres) ?? null;
    const n = esCompuesto ? seriesComp.length : series.length;

    const volText = vol >= 1000 ? `${(vol / 1000).toFixed(1)} t` : `${vol.toFixed(0)} kg`;
    const seriesText = `${n} serie${n !== 1 ? "s" : ""}`;

    return {
      volText,
      kcalText: `${kcal} kcal`,
      seriesText,
      bestText: best ? `${best.peso} kg × ${best.reps}` : null,
      bestSub: best ? `${(best.peso * best.reps).toFixed(0)} kg de volumen` : null,
      rpeText: rpe ? `RPE ${rpe.v} · ${rpe.label}` : null,
      rpeSub: rpe ? getMotiv(rpe.v) : null,
      expText: "+1.25 EXP",
    };
  }, [esCompuesto, series, seriesComp, nivelEstres]);

  useEffect(() => {
    if (visible) {
      setConfettiDone(false);
      modalRef.current?.present();
    } else {
      modalRef.current?.dismiss();
    }
  }, [visible]);

  const close = () => modalRef.current?.dismiss();

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    []
  );

  return (
    <BottomSheetModal
      ref={modalRef}
      index={0}
      snapPoints={snapPoints}
      onDismiss={onFinish}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableContentPanningGesture
      enableOverDrag={false}
      overDragResistanceFactor={0}
      topInset={topInset}
      backgroundStyle={{
        backgroundColor: tok.sheetBg,
        borderColor: tok.border,
        borderWidth: 1,
      }}
      handleIndicatorStyle={{
        backgroundColor: isDark ? "rgba(255,255,255,0.28)" : "rgba(0,0,0,0.18)",
        width: 44,
      }}
      // ✅ CLAVE: igual que PanelInfo
      style={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
      containerStyle={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
    >
      {!confettiDone && (
        <LottieView
          source={confettiAnim}
          autoPlay
          loop={false}
          onAnimationFinish={() => setConfettiDone(true)}
          style={StyleSheet.absoluteFillObject}
        />
      )}

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          s.content,
          { paddingBottom: 110 + insets.bottom }, // ✅ evita que el botón quede bajo el menú
        ]}
      >
        {/* Header */}
        <View style={s.header}>
          <View style={[s.badge, { backgroundColor: t.accentDim, borderColor: tok.border }]}>
            <Text style={s.badgeText}>✓</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[s.hTitle, { color: tok.textPrimary }]}>Sesión registrada</Text>
            <Text style={[s.hSub, { color: tok.textMuted }]}>Resumen de tu entrenamiento</Text>
          </View>

          <Pressable
            onPress={close}
            hitSlop={12}
            style={[s.closeBtn, { backgroundColor: tok.chip, borderColor: tok.border }]}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
          >
            <Text style={[s.closeText, { color: tok.textPrimary }]}>✕</Text>
          </Pressable>
        </View>

        {/* Chips */}
        <View style={s.chipsRow}>
          <Chip isDark={isDark} text={data.seriesText} />
          {!!data.rpeText && <Chip isDark={isDark} text={data.rpeText} />}
          <Chip isDark={isDark} text="Guardado" />
        </View>

        {/* Stats */}
        <View style={s.grid}>
          <StatCard isDark={isDark} title="Volumen total" value={data.volText} sub={data.seriesText} glyph="◈" />
          <StatCard isDark={isDark} title="Calorías" value={data.kcalText} sub="estimación" image={iconKcal} />
          {data.bestText ? (
            <StatCard isDark={isDark} title="Mejor serie" value={data.bestText} sub={data.bestSub ?? undefined} glyph="◆" />
          ) : (
            <StatCard isDark={isDark} title="Esfuerzo percibido" value={data.rpeText ?? "—"} sub={data.rpeSub ?? undefined} glyph="◉" />
          )}
          <StatCard isDark={isDark} title="Experiencia" value={data.expText} sub="Sesión completada" image={iconExp} />
        </View>

        {/* CTA */}
        <View style={[s.footer, { borderTopColor: tok.border }]}>
          <Text style={[s.footerHint, { color: tok.textMuted }]}>
            Tip: la consistencia gana. Un poco cada día suma.
          </Text>

          <Pressable
            onPress={close}
            style={[s.primaryBtn, { backgroundColor: t.accent }]}
            accessibilityRole="button"
            accessibilityLabel="Continuar"
          >
            <Text style={s.primaryText}>Continuar</Text>
          </Pressable>
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  content: {
    paddingHorizontal: t.sp.xl,
    paddingTop: t.sp.lg,
    gap: t.sp.lg,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: t.sp.md,
  },
  badge: {
    width: 44,
    height: 44,
    borderRadius: t.r.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    color: t.accent,
    fontSize: 18,
    fontWeight: "900",
  },
  hTitle: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.2,
  },
  hSub: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: "600",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: t.r.full,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    fontSize: 14,
    fontWeight: "900",
  },

  chipsRow: {
    flexDirection: "row",
    gap: t.sp.sm,
    flexWrap: "wrap",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: t.r.full,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "800",
  },

  grid: {
    gap: t.sp.md,
  },
  statCard: {
    borderRadius: t.r.md,
    borderWidth: 1,
    padding: t.sp.md,
    flexDirection: "row",
    alignItems: "center",
    gap: t.sp.md,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: t.r.full,
    alignItems: "center",
    justifyContent: "center",
  },
  statGlyph: {
    fontSize: 18,
    fontWeight: "900",
  },
  statTitle: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.0,
    textTransform: "uppercase",
  },
  statValue: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: -0.4,
  },
  statSub: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: "600",
  },

  footer: {
    borderTopWidth: 1,
    paddingTop: t.sp.lg,
    gap: t.sp.md,
  },
  footerHint: {
    fontSize: 12,
    fontWeight: "600",
  },
  primaryBtn: {
    height: 46,
    borderRadius: t.r.full,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: {
    color: "#0A0A0A",
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
});
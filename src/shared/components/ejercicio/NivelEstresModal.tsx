import React, { useMemo, useRef, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from "react-native";
import { useColorScheme } from "nativewind";
import { LinearGradient } from "expo-linear-gradient";
import { X } from "lucide-react-native";

// ── Tokens (mismo sistema que IMCVisual) ──────────────────────────────────────
const tokens = {
  color: {
    gradientStart: "rgb(0,255,64)",
    gradientMid: "rgb(94,230,157)",
    gradientEnd: "rgb(178,0,255)",

    cardBgDark: "rgba(15,24,41,1)",
    cardBgLight: "#FFFFFF",
    cardBorderDark: "rgba(255,255,255,0.08)",
    cardBorderLight: "rgba(0,0,0,0.06)",

    badgeBgDark: "rgba(148,163,184,0.12)",
    badgeBgLight: "#F1F5F9",
    badgeBorderDark: "rgba(255,255,255,0.06)",
    badgeBorderLight: "rgba(0,0,0,0.06)",

    textPrimaryDark: "#F1F5F9",
    textPrimaryLight: "#0F172A",
    textSecondaryDark: "#64748B",
    textSecondaryLight: "#52525B",
  },
  radius: { lg: 16, md: 10, full: 999 },
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 20 },
} as const;

const GRADIENT = [
  tokens.color.gradientStart,
  tokens.color.gradientMid,
  tokens.color.gradientEnd,
] as const;

// ── Escala RPE — 10 niveles con etiqueta clínica ──────────────────────────────
const RPE_SCALE = [
  { v: 1, label: "Reposo", color: "#60A5FA" },
  { v: 2, label: "Muy ligero", color: "#67E8F9" },
  { v: 3, label: "Ligero", color: "#6EE7B7" },
  { v: 4, label: "Moderado", color: "#4ADE80" },
  { v: 5, label: "Algo duro", color: "#A3E635" },
  { v: 6, label: "Duro", color: "#FACC15" },
  { v: 7, label: "Muy duro", color: "#FB923C" },
  { v: 8, label: "Intenso", color: "#F97316" },
  { v: 9, label: "Muy intenso", color: "#EF4444" },
  { v: 10, label: "Máximo", color: "#DC2626" },
] as const;

const getRPE = (n: number | null) =>
  RPE_SCALE.find((r) => r.v === n) ?? null;

// ── Barra de intensidad animada ───────────────────────────────────────────────
function IntensityBar({ value, color }: { value: number | null; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  const pct = value != null ? value / 10 : 0;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: pct,
      useNativeDriver: false,
      tension: 60,
      friction: 10,
    }).start();
  }, [pct]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={bar.track}>
      <Animated.View style={[bar.fill, { width, backgroundColor: color }]} />
    </View>
  );
}

const bar = StyleSheet.create({
  track: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148,163,184,0.18)",
    overflow: "hidden",
    marginTop: 4,
  },
  fill: {
    height: "100%",
    borderRadius: 999,
  },
});

// ── Botón individual del selector ─────────────────────────────────────────────
function RPEButton({
  item,
  selected,
  isDark,
  onPress,
}: {
  item: (typeof RPE_SCALE)[number];
  selected: boolean;
  isDark: boolean;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.82, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  };

  const dimBg = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";
  const dimBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)";

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1, alignItems: "center" }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={{ alignItems: "center", width: "100%" }}>
        {/* Número */}
        <View
          style={[
            btn.circle,
            {
              backgroundColor: selected ? item.color : dimBg,
              borderColor: selected ? item.color : dimBorder,
              shadowColor: selected ? item.color : "transparent",
              shadowOpacity: selected ? 0.45 : 0,
              shadowRadius: 8,
              shadowOffset: { width: 0, height: 3 },
              elevation: selected ? 4 : 0,
            },
          ]}
        >
          <Text
            style={[
              btn.number,
              {
                color: selected
                  ? "#0f172a"
                  : isDark
                    ? "rgba(241,245,249,0.55)"
                    : "rgba(15,23,42,0.45)",
                fontWeight: selected ? "800" : "600",
              },
            ]}
          >
            {item.v}
          </Text>
        </View>

        {/* Dot indicador activo */}
        <View
          style={[
            btn.dot,
            {
              backgroundColor: selected ? item.color : "transparent",
              opacity: selected ? 1 : 0,
            },
          ]}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const btn = StyleSheet.create({
  circle: {
    width: 30,
    height: 30,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  number: {
    fontSize: 12,
    lineHeight: 14,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 999,
    marginTop: 4,
  },
});

// ── Props ─────────────────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  nivelEstres: number | null;
  onChangeNivelEstres: (valor: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
};

// ── Modal principal ───────────────────────────────────────────────────────────
const NivelEstresModal: React.FC<Props> = ({
  visible,
  nivelEstres,
  onChangeNivelEstres,
  onConfirm,
  onClose,
  loading = false,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const rpe = useMemo(() => getRPE(nivelEstres), [nivelEstres]);
  const accent = rpe?.color ?? (isDark ? "rgba(255,255,255,0.20)" : "#9CA3AF");
  const label = rpe?.label ?? "Selecciona un nivel";

  const textPrimary = isDark ? tokens.color.textPrimaryDark : tokens.color.textPrimaryLight;
  const textSecondary = isDark ? tokens.color.textSecondaryDark : tokens.color.textSecondaryLight;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable
        onPress={onClose}
        style={s.overlay}
      >
        <Pressable onPress={() => { }} style={s.wrapper}>

          {/* ── Borde gradiente (idéntico a IMCVisual) ── */}
          <LinearGradient
            colors={GRADIENT as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.frame}
          >
            <View
              style={[
                s.card,
                {
                  backgroundColor: isDark ? tokens.color.cardBgDark : tokens.color.cardBgLight,
                  borderColor: isDark ? tokens.color.cardBorderDark : tokens.color.cardBorderLight,
                },
              ]}
            >

              {/* ── Header ── */}
              <View style={s.header}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.title, { color: textPrimary }]}>
                    Esfuerzo percibido
                  </Text>
                  <Text style={[s.subtitle, { color: textSecondary }]}>
                    Escala RPE · ¿Cómo ha sido este entreno?
                  </Text>
                </View>

                {/* Badge categoría (mismo estilo que IMCVisual) */}
                {rpe && (
                  <View
                    style={[
                      s.badge,
                      {
                        backgroundColor: isDark ? tokens.color.badgeBgDark : tokens.color.badgeBgLight,
                        borderColor: isDark ? tokens.color.badgeBorderDark : tokens.color.badgeBorderLight,
                      },
                    ]}
                  >
                    <Text style={[s.badgeText, { color: textPrimary }]}>
                      {label}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={10}
                  style={[
                    s.closeBtn,
                    {
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    },
                  ]}
                >
                  <X size={16} color={textSecondary} />
                </TouchableOpacity>
              </View>

              {/* ── Valor grande + barra de intensidad ── */}
              <View style={s.valueBlock}>
                <Text style={[s.valueText, { color: accent }]}>
                  {nivelEstres ?? "--"}
                </Text>

                <View style={{ flex: 1 }}>
                  <View style={s.valueLabelRow}>
                    <Text style={[s.valueLabel, { color: textSecondary }]}>
                      {label}
                    </Text>
                    <Text style={[s.valueSub, { color: textSecondary }]}>
                      / 10
                    </Text>
                  </View>
                  <IntensityBar value={nivelEstres} color={accent} />
                </View>
              </View>

              {/* ── Selector RPE pro ── */}
              <View
                style={[
                  s.selector,
                  {
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.025)",
                    borderColor: isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.07)",
                  },
                ]}
              >
                {/* Fila de botones */}
                <View style={s.buttonsRow}>
                  {RPE_SCALE.map((item) => (
                    <RPEButton
                      key={item.v}
                      item={item}
                      selected={nivelEstres === item.v}
                      isDark={isDark}
                      onPress={() => onChangeNivelEstres(item.v)}
                    />
                  ))}
                </View>

                {/* Leyenda extremos */}
                <View style={s.scaleLabels}>
                  <Text style={[s.scaleLabel, { color: textSecondary }]}>
                    Reposo
                  </Text>
                  <Text style={[s.scaleLabel, { color: textSecondary }]}>
                    Máximo esfuerzo
                  </Text>
                </View>
              </View>

              {/* ── Footer: info + CTA ── */}
              <View style={s.footer}>
                <Text style={[s.footerText, { color: textSecondary }]}>
                  Usaremos este dato para ajustar tus cargas futuras.
                </Text>

                <TouchableOpacity
                  onPress={onConfirm}
                  disabled={loading || !nivelEstres}
                  activeOpacity={0.88}
                  style={[
                    s.confirmBtn,
                    {
                      backgroundColor: accent,
                      opacity: loading || !nivelEstres ? 0.45 : 1,
                    },
                  ]}
                >
                  {loading && (
                    <ActivityIndicator size="small" color="#0f172a" style={{ marginRight: 6 }} />
                  )}
                  <Text style={s.confirmBtnText}>
                    {loading ? "Guardando…" : "Guardar"}
                  </Text>
                </TouchableOpacity>
              </View>

            </View>
          </LinearGradient>

        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default NivelEstresModal;

// ── Estilos estáticos ─────────────────────────────────────────────────────────
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.60)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  wrapper: {
    width: "100%",
    maxWidth: 440,
  },

  // Frame gradiente (igual que IMCVisual)
  frame: {
    borderRadius: tokens.radius.lg,
    padding: 1.5,
    overflow: "hidden",
  },

  // Card interior
  card: {
    borderRadius: tokens.radius.lg - 1,
    borderWidth: 1,
    padding: tokens.spacing.xl,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    gap: tokens.spacing.lg,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.sm,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.1,
  },

  // Badge (mismo sistema IMCVisual)
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // Botón cerrar
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },

  // Valor grande
  valueBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.md,
  },
  valueText: {
    fontSize: 44,
    fontWeight: "800",
    letterSpacing: -2,
    lineHeight: 48,
    minWidth: 60,
    textAlign: "center",
  },
  valueLabelRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  valueLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  valueSub: {
    fontSize: 11,
    fontWeight: "500",
  },

  // Selector contenedor
  selector: {
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: tokens.spacing.sm,
  },
  buttonsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  scaleLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginTop: 2,
  },
  scaleLabel: {
    fontSize: 9,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  // Footer
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },
  confirmBtn: {
    borderRadius: tokens.radius.full,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0f172a",
  },
});
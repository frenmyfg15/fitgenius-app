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
import { X } from "lucide-react-native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

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

  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1, alignItems: "center" }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={{ alignItems: "center", width: "100%" }}>
        <View
          style={[
            btn.circle,
            {
              backgroundColor: selected ? item.color : isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
              borderColor: selected ? item.color : isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
            },
          ]}
        >
          <Text
            style={[
              btn.number,
              {
                fontFamily: Font.body.semiBold,
                color: selected
                  ? "#0f172a"
                  : isDark
                    ? "rgba(241,245,249,0.55)"
                    : "rgba(15,23,42,0.45)",
              },
            ]}
          >
            {item.v}
          </Text>
        </View>

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

type Props = {
  visible: boolean;
  nivelEstres: number | null;
  onChangeNivelEstres: (valor: number) => void;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
};

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
  const t = scheme(isDark);

  const rpe = useMemo(() => getRPE(nivelEstres), [nivelEstres]);
  const accent = rpe?.color ?? (isDark ? "rgba(255,255,255,0.20)" : "#9CA3AF");
  const label = rpe?.label ?? "Selecciona un nivel";

  return (
    <Modal visible={visible} transparent animationType="fade">
      <Pressable onPress={onClose} style={s.overlay}>
        <Pressable onPress={() => {}} style={s.wrapper}>
          <View
            style={[
              s.card,
              {
                backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
              },
            ]}
          >
            {/* Header */}
            <View style={s.header}>
              <View style={{ flex: 1 }}>
                <Text style={[s.title, { color: t.textPrimary }]}>
                  Esfuerzo percibido
                </Text>
                <Text style={[s.subtitle, { color: t.textSecondary }]}>
                  Escala RPE · ¿Cómo ha sido este entreno?
                </Text>
              </View>

              {rpe && (
                <View
                  style={[
                    s.badge,
                    {
                      backgroundColor: isDark ? t.border : t.surface,
                      borderColor: t.border,
                    },
                  ]}
                >
                  <Text style={[s.badgeText, { color: t.textPrimary }]}>
                    {label}
                  </Text>
                </View>
              )}

              <TouchableOpacity
                onPress={onClose}
                hitSlop={10}
                style={[
                  s.closeBtn,
                  { backgroundColor: isDark ? t.border : t.surface },
                ]}
              >
                <X size={16} color={t.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Valor grande + barra */}
            <View style={s.valueBlock}>
              <Text style={[s.valueText, { color: accent }]}>
                {nivelEstres ?? "--"}
              </Text>

              <View style={{ flex: 1 }}>
                <View style={s.valueLabelRow}>
                  <Text style={[s.valueLabel, { color: t.textSecondary }]}>
                    {label}
                  </Text>
                  <Text style={[s.valueSub, { color: t.textSecondary }]}>
                    / 10
                  </Text>
                </View>
                <IntensityBar value={nivelEstres} color={accent} />
              </View>
            </View>

            {/* Selector RPE */}
            <View
              style={[
                s.selector,
                {
                  backgroundColor: isDark ? t.border : t.surface,
                  borderColor: t.border,
                },
              ]}
            >
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

              <View style={s.scaleLabels}>
                <Text style={[s.scaleLabel, { color: t.textSecondary }]}>
                  Reposo
                </Text>
                <Text style={[s.scaleLabel, { color: t.textSecondary }]}>
                  Máximo esfuerzo
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={s.footer}>
              <Text style={[s.footerText, { color: t.textSecondary }]}>
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
                  <ActivityIndicator size="small" color={Colors.primary} style={{ marginRight: 6 }} />
                )}
                <Text style={s.confirmBtnText}>
                  {loading ? "Guardando…" : "Guardar"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default NivelEstresModal;

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.dark.overlay,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  wrapper: {
    width: "100%",
    maxWidth: 440,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    padding: 20,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    ...TextStyle.label,
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
  subtitle: {
    ...TextStyle.caption,
    fontFamily: Font.body.regular,
    marginTop: 2,
    letterSpacing: 0.1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
  },
  badgeText: {
    ...TextStyle.caption,
    fontFamily: Font.body.bold,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  valueBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  valueText: {
    fontSize: 44,
    fontWeight: "800",
    fontFamily: Font.title.bold,
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
    ...TextStyle.label,
    fontFamily: Font.body.semiBold,
  },
  valueSub: {
    ...TextStyle.caption,
    fontFamily: Font.body.medium,
  },
  selector: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 8,
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
    fontFamily: Font.body.semiBold,
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerText: {
    flex: 1,
    ...TextStyle.caption,
    fontFamily: Font.body.regular,
    lineHeight: 16,
  },
  confirmBtn: {
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  confirmBtnText: {
    ...TextStyle.bodySm,
    fontFamily: Font.body.bold,
    color: Colors.primary,
  },
});

import React, { useCallback, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { RulerPicker } from "react-native-ruler-picker";

export type UnidadAltura = "CM" | "FT";

type Props = {
  unit: UnidadAltura;
  valueCm: number;
  minCm?: number;
  maxCm?: number;
  stepCm?: number;
  onChange?: (cm: number) => void;
  onChangeEnd?: (cm: number) => void;
  label?: string;
  containerStyle?: ViewStyle;
  rulerStyle?: ViewStyle;
  tickColor?: string;
  tickColorMajor?: string;
  labelColor?: string;
  hintColor?: string;
  indicatorColor?: string;
  valuePillStyle?: ViewStyle;
  valueTextStyle?: TextStyle;
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const roundToNearestStep = (value: number, step: number) =>
  Math.round(value / step) * step;

const cmToFeetInches = (cm: number) => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) return { feet: feet + 1, inches: 0 };
  return { feet, inches };
};

const formatHeight = (cm: number, unit: UnidadAltura): string => {
  if (unit === "CM") return `${cm} cm`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet}'${inches}"`;
};

const DEFAULT_MIN_CM = 100;
const DEFAULT_MAX_CM = 220;
const DEFAULT_STEP_CM = 1;
const RULER_HEIGHT = 150;
const CENTER_LINE_HEIGHT = 84;

export default function HeightRulerPicker({
  unit,
  valueCm,
  minCm = DEFAULT_MIN_CM,
  maxCm = DEFAULT_MAX_CM,
  stepCm = DEFAULT_STEP_CM,
  onChange,
  onChangeEnd,
  label,
  containerStyle,
  rulerStyle,
  labelColor = "#111827",
  hintColor = "#6B7280",
  indicatorColor = "#22C55E",
  valuePillStyle,
  valueTextStyle,
}: Props) {
  const normalizedMin = useMemo(() => roundToNearestStep(minCm, stepCm), [minCm, stepCm]);
  const normalizedMax = useMemo(() => roundToNearestStep(maxCm, stepCm), [maxCm, stepCm]);

  const initialCm = useMemo(() => {
    const v = roundToNearestStep(valueCm, stepCm);
    return clamp(v, normalizedMin, normalizedMax);
    // ✅ Solo al montar — no reacciona a cambios posteriores de valueCm
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [internalCm, setInternalCm] = useState<number>(initialCm);

  const handleLive = useCallback(
    (n: number) => {
      const cm = clamp(roundToNearestStep(Number(n), stepCm), normalizedMin, normalizedMax);
      setInternalCm(cm);
      onChange?.(cm);
    },
    [onChange, stepCm, normalizedMin, normalizedMax]
  );

  const handleEnd = useCallback(
    (n: number) => {
      const cm = clamp(roundToNearestStep(Number(n), stepCm), normalizedMin, normalizedMax);
      setInternalCm(cm);
      onChangeEnd?.(cm);
    },
    [onChangeEnd, stepCm, normalizedMin, normalizedMax]
  );

  const hiddenTextStyle: TextStyle = useMemo(
    () => ({
      opacity: 0,
      height: 0,
      fontSize: 1,
      lineHeight: 1,
      includeFontPadding: false,
    }),
    []
  );

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {!!label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}

      <View style={[styles.valuePill, valuePillStyle]}>
        <Text style={[styles.valueText, valueTextStyle]}>
          {formatHeight(internalCm, unit)}
        </Text>
      </View>

      <View style={[styles.rulerContainer, rulerStyle]}>
        <RulerPicker
          min={normalizedMin}
          max={normalizedMax}
          step={stepCm}
          fractionDigits={0}
          initialValue={initialCm}
          height={RULER_HEIGHT}
          indicatorHeight={CENTER_LINE_HEIGHT}
          indicatorColor={indicatorColor}
          decelerationRate="fast"
          unit="cm"
          valueTextStyle={hiddenTextStyle}
          unitTextStyle={hiddenTextStyle}
          onValueChange={handleLive as any}
          onValueChangeEnd={handleEnd as any}
        />
      </View>

      <Text style={[styles.hint, { color: hintColor }]}>Desliza para ajustar la altura</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  valuePill: {
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#111827",
    marginBottom: 14,
  },
  valueText: { fontSize: 28, fontWeight: "900", color: "#FFFFFF" },
  rulerContainer: {
    width: "100%",
    height: RULER_HEIGHT,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
  },
  hint: { textAlign: "center", marginTop: 10, fontSize: 12 },
});
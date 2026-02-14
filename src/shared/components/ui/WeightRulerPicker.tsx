import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { RulerPicker } from "react-native-ruler-picker";

export type UnidadPeso = "KG" | "LB";

type Props = {
  unit: UnidadPeso;

  /** Valor controlado en KG base */
  valueKg: number;

  minKg?: number;
  maxKg?: number;
  stepKg?: number;

  onChange?: (kgBase: number) => void;
  onChangeEnd?: (kgBase: number) => void;

  label?: string;

  containerStyle?: ViewStyle;
  rulerStyle?: ViewStyle;

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

const KG_TO_LB = 2.2046226218;

const kgToLb = (kg: number) => kg * KG_TO_LB;

const formatWeight = (kgBase: number, unit: UnidadPeso, stepKg: number): string => {
  if (unit === "KG") {
    const decimals = stepKg % 1 === 0 ? 0 : 1;
    return `${kgBase.toFixed(decimals)} kg`;
  }
  const lb = kgToLb(kgBase);
  const decimals = stepKg % 1 === 0 ? 0 : 1;
  return `${lb.toFixed(decimals)} lb`;
};

const DEFAULT_MIN_KG = 30;
const DEFAULT_MAX_KG = 200;
const DEFAULT_STEP_KG = 1;

const RULER_HEIGHT = 150;
const CENTER_LINE_HEIGHT = 84;

export default function WeightRulerPicker({
  unit,
  valueKg,
  minKg = DEFAULT_MIN_KG,
  maxKg = DEFAULT_MAX_KG,
  stepKg = DEFAULT_STEP_KG,
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
  const normalizedMin = useMemo(() => roundToNearestStep(minKg, stepKg), [minKg, stepKg]);
  const normalizedMax = useMemo(() => roundToNearestStep(maxKg, stepKg), [maxKg, stepKg]);

  const normalizedPropKg = useMemo(() => {
    const v = roundToNearestStep(valueKg, stepKg);
    return clamp(v, normalizedMin, normalizedMax);
  }, [valueKg, stepKg, normalizedMin, normalizedMax]);

  const [internalKg, setInternalKg] = useState<number>(normalizedPropKg);

  // “key bump” SOLO ante cambio externo real (porque initialValue)
  const [pickerKey, setPickerKey] = useState(0);

  const isInteractingRef = useRef(false);
  const lastUserKgRef = useRef<number | null>(null);

  useEffect(() => {
    setInternalKg(normalizedPropKg);

    if (isInteractingRef.current) return;

    // si viene del propio gesto, no remonte
    if (lastUserKgRef.current === normalizedPropKg) {
      lastUserKgRef.current = null;
      return;
    }

    // cambio externo real -> remonto para aplicar initialValue
    setPickerKey((k) => k + 1);
  }, [normalizedPropKg]);

  const handleLive = useCallback(
    (n: number) => {
      isInteractingRef.current = true;

      const kg = clamp(roundToNearestStep(Number(n), stepKg), normalizedMin, normalizedMax);
      setInternalKg(kg);
      lastUserKgRef.current = kg;

      onChange?.(kg);
    },
    [onChange, stepKg, normalizedMin, normalizedMax]
  );

  const handleEnd = useCallback(
    (n: number) => {
      const kg = clamp(roundToNearestStep(Number(n), stepKg), normalizedMin, normalizedMax);
      setInternalKg(kg);
      lastUserKgRef.current = kg;

      onChangeEnd?.(kg);

      requestAnimationFrame(() => {
        isInteractingRef.current = false;
      });
    },
    [onChangeEnd, stepKg, normalizedMin, normalizedMax]
  );

  // Ocultar textos internos sin fontSize=0 (Android crash)
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
          {formatWeight(internalKg, unit, stepKg)}
        </Text>
      </View>

      <View style={[styles.rulerContainer, rulerStyle]}>
        <RulerPicker
          key={`weight-${pickerKey}-${normalizedMin}-${normalizedMax}-${stepKg}`}
          min={normalizedMin}
          max={normalizedMax}
          step={stepKg}
          fractionDigits={stepKg % 1 === 0 ? 0 : 1}
          initialValue={normalizedPropKg}
          height={RULER_HEIGHT}
          indicatorHeight={CENTER_LINE_HEIGHT}
          indicatorColor={indicatorColor}
          decelerationRate="fast"
          unit="kg"
          valueTextStyle={hiddenTextStyle}
          unitTextStyle={hiddenTextStyle}
          onValueChange={handleLive as any}
          onValueChangeEnd={handleEnd as any}
        />
      </View>

      <Text style={[styles.hint, { color: hintColor }]}>Desliza para ajustar el peso</Text>
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

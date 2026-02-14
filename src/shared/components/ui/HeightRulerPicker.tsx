import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

  const normalizedPropCm = useMemo(() => {
    const v = roundToNearestStep(valueCm, stepCm);
    return clamp(v, normalizedMin, normalizedMax);
  }, [valueCm, stepCm, normalizedMin, normalizedMax]);

  const [internalCm, setInternalCm] = useState<number>(normalizedPropCm);

  // “key bump” para remonte SOLO ante cambio externo real (porque initialValue)
  const [pickerKey, setPickerKey] = useState(0);

  const isInteractingRef = useRef(false);
  const lastUserCmRef = useRef<number | null>(null);

  useEffect(() => {
    setInternalCm(normalizedPropCm);

    if (isInteractingRef.current) return;

    // si viene del propio gesto, no remonte
    if (lastUserCmRef.current === normalizedPropCm) {
      lastUserCmRef.current = null;
      return;
    }

    // cambio externo real -> remonto para aplicar initialValue
    setPickerKey((k) => k + 1);
  }, [normalizedPropCm]);

  const handleLive = useCallback(
    (n: number) => {
      isInteractingRef.current = true;

      const cm = clamp(roundToNearestStep(Number(n), stepCm), normalizedMin, normalizedMax);
      setInternalCm(cm);
      lastUserCmRef.current = cm;

      onChange?.(cm);
    },
    [onChange, stepCm, normalizedMin, normalizedMax]
  );

  const handleEnd = useCallback(
    (n: number) => {
      const cm = clamp(roundToNearestStep(Number(n), stepCm), normalizedMin, normalizedMax);
      setInternalCm(cm);
      lastUserCmRef.current = cm;

      onChangeEnd?.(cm);

      requestAnimationFrame(() => {
        isInteractingRef.current = false;
      });
    },
    [onChangeEnd, stepCm, normalizedMin, normalizedMax]
  );

  // ✅ estilos para “ocultar” el texto interno SIN fontSize=0 (crashea en Android)
  const hiddenTextStyle: TextStyle = useMemo(
    () => ({
      opacity: 0,
      height: 0,
      // importante: fontSize > 0
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
          key={`ruler-${pickerKey}-${normalizedMin}-${normalizedMax}-${stepCm}`}
          min={normalizedMin}
          max={normalizedMax}
          step={stepCm}
          fractionDigits={0}
          initialValue={normalizedPropCm}
          height={RULER_HEIGHT}
          indicatorHeight={CENTER_LINE_HEIGHT}
          indicatorColor={indicatorColor}
          decelerationRate="fast"
          unit="cm"
          // ocultamos textos internos sin romper Android
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

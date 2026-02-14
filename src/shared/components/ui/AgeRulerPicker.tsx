import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { RulerPicker } from "react-native-ruler-picker";

type Props = {
  value: number;
  min?: number;
  max?: number;
  step?: number;

  onChange?: (age: number) => void;
  onChangeEnd?: (age: number) => void;

  label?: string;

  containerStyle?: ViewStyle;
  rulerStyle?: ViewStyle;

  labelColor?: string;
  hintColor?: string;
  indicatorColor?: string;

  valuePillStyle?: ViewStyle;
  valueTextStyle?: TextStyle;
};

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const roundToStep = (v: number, step: number) => Math.round(v / step) * step;

const RULER_HEIGHT = 150;
const CENTER_LINE_HEIGHT = 84;

export default function AgeRulerPicker({
  value,
  min = 14,
  max = 100,
  step = 1,
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
  const normalizedMin = useMemo(() => roundToStep(min, step), [min, step]);
  const normalizedMax = useMemo(() => roundToStep(max, step), [max, step]);

  const normalizedValue = useMemo(() => {
    const v = roundToStep(value, step);
    return clamp(v, normalizedMin, normalizedMax);
  }, [value, step, normalizedMin, normalizedMax]);

  const [internal, setInternal] = useState<number>(normalizedValue);

  // remonte controlado (initialValue)
  const [pickerKey, setPickerKey] = useState(0);
  const isInteractingRef = useRef(false);
  const lastUserRef = useRef<number | null>(null);

  useEffect(() => {
    setInternal(normalizedValue);

    if (isInteractingRef.current) return;

    if (lastUserRef.current === normalizedValue) {
      lastUserRef.current = null;
      return;
    }

    setPickerKey((k) => k + 1);
  }, [normalizedValue]);

  const handleLive = useCallback(
    (n: number) => {
      isInteractingRef.current = true;

      const age = clamp(roundToStep(Number(n), step), normalizedMin, normalizedMax);
      setInternal(age);
      lastUserRef.current = age;

      onChange?.(age);
    },
    [onChange, step, normalizedMin, normalizedMax]
  );

  const handleEnd = useCallback(
    (n: number) => {
      const age = clamp(roundToStep(Number(n), step), normalizedMin, normalizedMax);
      setInternal(age);
      lastUserRef.current = age;

      onChangeEnd?.(age);

      requestAnimationFrame(() => {
        isInteractingRef.current = false;
      });
    },
    [onChangeEnd, step, normalizedMin, normalizedMax]
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
        <Text style={[styles.valueText, valueTextStyle]}>{internal} años</Text>
      </View>

      <View style={[styles.rulerContainer, rulerStyle]}>
        <RulerPicker
          key={`age-${pickerKey}-${normalizedMin}-${normalizedMax}-${step}`}
          min={normalizedMin}
          max={normalizedMax}
          step={step}
          fractionDigits={0}
          initialValue={normalizedValue}
          height={RULER_HEIGHT}
          indicatorHeight={CENTER_LINE_HEIGHT}
          indicatorColor={indicatorColor}
          decelerationRate="fast"
          unit="a"
          valueTextStyle={hiddenTextStyle}
          unitTextStyle={hiddenTextStyle}
          onValueChange={handleLive as any}
          onValueChangeEnd={handleEnd as any}
        />
      </View>

      <Text style={[styles.hint, { color: hintColor }]}>Desliza para ajustar la edad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: "100%" },
  label: { textAlign: "center", fontSize: 14, fontWeight: "700", marginBottom: 10 },
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

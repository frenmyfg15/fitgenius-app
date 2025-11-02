// src/shared/components/ui/WigthInput.tsx
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";

type Unit = "KG" | "LB" | "";

type Props = {
  unit: Unit;                          // unidad de visualización
  valueKg: number;                     // ✅ valor CONTROLADO en KG base
  onChange: (kgBase: number) => void;  // SIEMPRE emite en KG
  minKg?: number;                      // default 30
  maxKg?: number;                      // default 200
  label?: string;                      // título opcional
};

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

// conversión
const KG_TO_LB = 2.20462;
const kgToLb = (kg: number) => kg * KG_TO_LB;
const lbToKg = (lb: number) => lb / KG_TO_LB;

// formatea a 1 decimal y quita .0
const fmt1 = (n: number) => {
  const r = Math.round(n * 10) / 10;
  return Number.isFinite(r) ? (r % 1 === 0 ? String(r.toFixed(0)) : r.toFixed(1)) : "";
};

function WigthInput({
  unit,
  valueKg,
  onChange,
  minKg = 30,
  maxKg = 200,
  label = "Peso",
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Paleta por tema
  const theme = useMemo(
    () => ({
      bg: isDark ? "#0b1220" : "#ffffff",
      text: isDark ? "#e5e7eb" : "#0f172a",
      subtext: isDark ? "#94a3b8" : "#475569",
      border: "#22c55e",
      placeholder: isDark ? "#64748b" : "#94a3b8",
      selection: isDark ? "#22c55e" : "#16a34a",
    }),
    [isDark]
  );

  const styles = useMemo(() => createStyles(), []);

  // Texto local para que escribir sea fluido
  const [text, setText] = useState<string>("");

  // Formato visible según unidad
  const formattedFromValue = useMemo(() => {
    const safe = clamp(typeof valueKg === "number" ? valueKg : minKg, minKg, maxKg);
    if (unit === "LB") {
      return fmt1(kgToLb(safe));
    }
    return fmt1(safe); // KG
  }, [unit, valueKg, minKg, maxKg]);

  // Sincroniza el texto cuando cambian unit/value
  useEffect(() => {
    setText(formattedFromValue);
  }, [formattedFromValue]);

  const placeholder = unit === "LB" ? "Ej: 154.5" : "Ej: 70.5";
  const keyboardType = "numeric";
  const maxLength = 6; // p.ej. "200.0" / "440.9"

  // Parseo tolerante y emisión en KG (clamped)
  const handleChange = useCallback(
    (t: string) => {
      setText(t);

      // vacío: no emitir
      if (!t || !t.trim()) return;

      // normaliza coma->punto y filtra caracteres
      const normalized = t.replace(",", ".").replace(/[^\d.]/g, "");
      // permite un solo punto decimal
      const parts = normalized.split(".");
      const cleaned =
        parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];

      const num = parseFloat(cleaned);
      if (!Number.isFinite(num)) return;

      let kg = num;
      if (unit === "LB") kg = lbToKg(num);

      onChange(clamp(kg, minKg, maxKg));
    },
    [unit, minKg, maxKg, onChange]
  );

  return (
    <View style={[styles.wrap, { backgroundColor: theme.bg }]}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>

      <TextInput
        style={[
          styles.input,
          {
            color: theme.text,
            borderColor: theme.border,
          },
        ]}
        keyboardType={keyboardType as any}
        value={text}
        onChangeText={handleChange}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        maxLength={maxLength}
        keyboardAppearance={isDark ? "dark" : "light"}
        selectionColor={theme.selection}
      />

      <Text style={[styles.unitLabel, { color: theme.subtext }]}>
        {unit || "KG"}
      </Text>
    </View>
  );
}

export default memo(WigthInput);

/* --- Estilos --- */
function createStyles() {
  return StyleSheet.create({
    wrap: {
      alignItems: "center",
      gap: 8,
      width: "80%",
      paddingVertical: 4,
    },
    label: {
      fontWeight: "600",
      fontSize: 16,
      textAlign: "center",
      marginBottom: 4,
    },
    input: {
      fontSize: 24,
      fontWeight: "500",
      borderBottomWidth: 2,
      textAlign: "center",
      paddingVertical: 6,
      width: "100%",
    },
    unitLabel: {
      fontSize: 14,
      marginTop: 4,
    },
  });
}

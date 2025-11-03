import React, {
  memo,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";

export type UnidadAltura = "CM" | "FT";

type Props = {
  unit: UnidadAltura;              // ✅ unidad CONTROLADA
  valueCm: number;                 // ✅ valor CONTROLADO en cm
  minCm?: number;
  maxCm?: number;
  label?: string;
  onChange: (cm: number) => void;  // siempre emite en cm (clamped)
};

function HeightInputBase({
  unit,
  valueCm,
  minCm = 100,
  maxCm = 220,
  label = "Altura",
  onChange,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Paleta por tema
  const theme = useMemo(
    () => ({
      bg: isDark ? "#0b1220" : "#f6f7fb",
      text: isDark ? "#e5e7eb" : "#0f172a",
      subtext: isDark ? "#94a3b8" : "#475569",
      border: "#22c55e", // dejamos el verde de marca
      placeholder: isDark ? "#64748b" : "#94a3b8",
      selection: isDark ? "#22c55e" : "#16a34a",
    }),
    [isDark]
  );

  const styles = useMemo(() => createStyles(theme), [theme]);

  // Estado de texto local para evitar “saltos” al escribir
  const [text, setText] = useState<string>("");

  // Formatea el valueCm controlado a texto visible según unidad
  const formattedFromValue = useMemo(() => {
    const cm = clamp(
      typeof valueCm === "number" ? valueCm : minCm,
      minCm,
      maxCm
    );

    if (unit === "CM") {
      return String(Math.round(cm));
    }

    // FT
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inch = Math.round(totalInches - ft * 12);
    return `${ft}' ${inch}"`;
  }, [unit, valueCm, minCm, maxCm]);

  // Cuando cambian unit o valueCm desde fuera, sincroniza el texto mostrado
  useEffect(() => {
    setText(formattedFromValue);
  }, [formattedFromValue]);

  const placeholder = unit === "CM" ? "Ej: 175" : "Ej: 5' 10\"";
  const keyboardType = unit === "CM" ? "numeric" : "numbers-and-punctuation";
  const maxLength = unit === "CM" ? 3 : 8;

  // Parseo y emisión (siempre cm), tolerante durante la edición
  const handleChange = useCallback(
    (t: string) => {
      setText(t);

      // Si el usuario borra todo, no emitimos aún
      if (!t || !t.trim()) return;

      let newCm = valueCm;

      if (unit === "CM") {
        const normalized = t.replace(",", ".").replace(/[^\d.]/g, "");
        const parts = normalized.split(".");
        const cleaned =
          parts.length > 1 ? `${parts[0]}.${parts.slice(1).join("")}` : parts[0];
        const num = parseFloat(cleaned);
        if (Number.isFinite(num)) {
          newCm = num;
        } else {
          return; // entrada no numérica: no emite
        }
      } else {
        // FT: extrae dos números (pies y pulgadas) de la cadena
        const nums = t.match(/\d+/g) || [];
        const ft = parseInt(nums[0] ?? "0", 10);
        const inch = parseInt(nums[1] ?? "0", 10);
        const totalInches = ft * 12 + inch;
        if (!Number.isFinite(totalInches)) return;
        newCm = totalInches * 2.54;
      }

      // Emite clamped al padre (controlado)
      const out = clamp(newCm, minCm, maxCm);
      onChange(out);
    },
    [unit, valueCm, minCm, maxCm, onChange]
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

      <Text style={[styles.unitLabel, { color: theme.subtext }]}>{unit}</Text>
    </View>
  );
}

export default memo(HeightInputBase);

/* --- Helpers --- */
function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

/* --- Estilos base (sin colores hardcodeados de texto/fondo) --- */
function createStyles(theme: {
  bg: string;
  text: string;
  subtext: string;
  border: string;
  placeholder: string;
  selection: string;
}) {
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

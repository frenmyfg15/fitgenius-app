// src/shared/components/ui/ModernInput.tsx
import React, { memo, useCallback } from "react";
import { TextInput, TextInputProps } from "react-native";

/**
 * ModernInput (React Native + nativewind)
 * - type: decide teclado y filtrado (solo filtra si type==="number").
 * - value: string|number (renderiza como string).
 * - onChangeText: callback RN.
 * - onSubmit: se dispara en onSubmitEditing.
 * - className: estilos tailwind con nativewind.
 */
type Props = {
  type?: "text" | "number" | "email" | "password";
  placeholder?: string;
  id?: string;    // compat
  name?: string;  // compat
  value?: string | number;
  onChangeText: (text: string) => void;
  onSubmit?: () => void;
  maxLength?: number;
  className?: string;
} & Omit<TextInputProps, "onChangeText" | "onSubmitEditing" | "value" | "placeholder">;

function ModernInputBase({
  type = "text",
  placeholder = "",
  value,
  onChangeText,
  onSubmit,
  maxLength,
  className = "w-11/12 text-center rounded-2xl border px-4 py-3 text-xl font-semibold bg-white dark:bg-[#0b1220] text-slate-900 dark:text-white border-slate-300 dark:border-slate-700 focus:border-neon-400",
  ...rest
}: Props) {
  const keyboardType: TextInputProps["keyboardType"] =
    type === "number" ? "number-pad" : type === "email" ? "email-address" : "default";

  const autoCapitalize: TextInputProps["autoCapitalize"] =
    type === "email" || type === "password" ? "none" : "sentences";

  const handleChange = useCallback(
    (t: string) => {
      if (type === "number") {
        // Solo dígitos (enteros). Para decimales, ajusta este regex.
        const cleaned = t.replace(/[^\d]/g, "");
        onChangeText(cleaned);
      } else {
        onChangeText(t);
      }
    },
    [onChangeText, type]
  );

  const handleSubmit = useCallback(() => {
    onSubmit?.();
  }, [onSubmit]);

  return (
    <TextInput
      className={className}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      autoCorrect={type === "email" || type === "password" ? false : true}
      value={value === undefined || value === null ? "" : String(value)}
      onChangeText={handleChange}
      onSubmitEditing={handleSubmit}
      returnKeyType="done"
      placeholder={placeholder}
      maxLength={maxLength}
      // secureTextEntry puede pasarse desde fuera (e.g. type="password" && secureTextEntry)
      {...rest}
    />
  );
}

export const ModernInput = memo(ModernInputBase);
export default ModernInput;

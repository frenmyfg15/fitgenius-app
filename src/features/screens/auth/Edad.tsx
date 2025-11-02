// app/features/registro/EdadScreen.tsx
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Keyboard } from "react-native";
import { useColorScheme } from "nativewind";
import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import ModernInput from "@/shared/components/ui/ModernInput";

const MIN_EDAD = 14;
const MAX_EDAD = 100; // ajusta si quieres otro máximo

export default function Edad() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  // Texto local para edición suave
  const [text, setText] = useState<string>("");

  // Sincroniza el texto cuando cambie edad en store
  useEffect(() => {
    if (typeof usuario?.edad === "number" && Number.isFinite(usuario.edad)) {
      setText(String(usuario.edad));
    } else {
      setText("");
    }
  }, [usuario?.edad]);

  const handleChangeEdad = useCallback(
    (t: string) => {
      // Solo dígitos
      const cleaned = t.replace(/[^\d]/g, "");
      setText(cleaned);

      if (cleaned === "") return; // no guardamos nada aún

      const n = parseInt(cleaned, 10);
      if (!Number.isFinite(n)) return;

      const clamped = Math.min(Math.max(n, MIN_EDAD), MAX_EDAD);
      setField("edad", clamped);
    },
    [setField]
  );

  const edadValida = (usuario?.edad ?? 0) >= MIN_EDAD;

  const onSubmit = () => {
    if (edadValida) Keyboard.dismiss();
  };

  return (
    <>
      {edadValida && <BtnAprobe step="Dias" placement="left" />}

      <ScrollView
        className={isDark ? "bg-[#0b1220]" : "bg-[#f6f7fb]"}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <Text
            className={`text-center text-lg font-semibold p-3 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            ¿Cuántos años tienes?
          </Text>
          <Text
            className={`text-center p-2 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            La edad no define tus límites, ¡solo marca el punto desde donde comienzas!
          </Text>
        </View>

        <View className="px-6 pt-6 items-center">
          <ModernInput
            type="number"
            placeholder={`(Edad mínima ${MIN_EDAD}). Ej: 20`}
            value={text}
            onChangeText={handleChangeEdad}
            onSubmit={onSubmit}
            maxLength={3}
          />

          <Text
            className={`text-xs font-medium opacity-70 text-center mt-2 ${
              isDark ? "text-slate-300" : "text-slate-600"
            }`}
          >
            Edad
          </Text>

          {!edadValida && text !== "" && (
            <Text className="mt-2 text-sm text-rose-500">
              La edad debe ser al menos {MIN_EDAD}.
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

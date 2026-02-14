// app/features/registro/EdadScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useFocusEffect } from "@react-navigation/native";

import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import AgeRulerPicker from "@/shared/components/ui/AgeRulerPicker";

const MIN_EDAD = 14;
const MAX_EDAD = 100;

const normalizeEdad = (n: number) => {
  if (typeof n !== "number" || !Number.isFinite(n)) return 20;
  const r = Math.round(n);
  return Math.max(MIN_EDAD, Math.min(MAX_EDAD, r));
};

export default function Edad() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const storeEdad = typeof usuario?.edad === "number" ? usuario.edad : 20;

  // local fluido
  const [localEdad, setLocalEdad] = useState<number>(() => normalizeEdad(storeEdad));

  const lastRef = useRef(localEdad);
  useEffect(() => {
    lastRef.current = localEdad;
  }, [localEdad]);

  // sync externo real
  useEffect(() => {
    setLocalEdad(normalizeEdad(storeEdad));
  }, [storeEdad]);

  // guardar al salir (igual que altura/peso)
  useFocusEffect(
    useCallback(() => {
      return () => {
        const final = normalizeEdad(lastRef.current);
        const current = typeof usuario?.edad === "number" ? usuario.edad : 0;
        if (current !== final) setField("edad", final);
      };
    }, [setField])
  );

  const edadValida = localEdad >= MIN_EDAD;

  const bgColor = isDark ? "#0b1220" : "#f6f7fb";
  const textMain = { color: isDark ? "#ffffff" : "#111827" };
  const textSub = { color: isDark ? "#d1d5db" : "#4b5563" };

  return (
    <>
      {edadValida && <BtnAprobe step="Dias" placement="left" />}

      <ScrollView
        style={{ backgroundColor: bgColor }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.h1, textMain]}>¿Cuántos años tienes?</Text>
          <Text style={[styles.sub, textSub]}>
            La edad no define tus límites, ¡solo marca el punto desde donde comienzas!
          </Text>
        </View>

        <View style={{ paddingTop: 18 }}>
          <View style={[styles.rulerCard, { backgroundColor: bgColor }]}>
            <Text
              style={{
                textAlign: "center",
                marginTop: 6,
                marginBottom: 4,
                color: isDark ? "#e5e7eb" : "#111827",
                fontWeight: "700",
              }}
            >
              Indica tu edad
            </Text>

            <View style={styles.pickerWrap}>
              <AgeRulerPicker
                value={localEdad}
                min={MIN_EDAD}
                max={MAX_EDAD}
                step={1}
                onChange={(v) => setLocalEdad(normalizeEdad(v))}
                onChangeEnd={(v) => setLocalEdad(normalizeEdad(v))}
                rulerStyle={{ width: "100%", backgroundColor: bgColor }}
                labelColor={isDark ? "#E5E7EB" : "#111827"}
                hintColor={isDark ? "#9CA3AF" : "#6B7280"}
                indicatorColor="#22C55E"
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  h1: { textAlign: "center", fontSize: 18, fontWeight: "700", padding: 12 },
  sub: { textAlign: "center", fontSize: 13, paddingHorizontal: 8, paddingBottom: 16 },
  rulerCard: { width: "100%", borderRadius: 18, paddingBottom: 8 },
  pickerWrap: { width: "100%", paddingBottom: 10 },
});

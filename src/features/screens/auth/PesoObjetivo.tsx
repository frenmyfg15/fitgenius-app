// app/features/registro/PesoObjetivoScreen.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";
import { useFocusEffect } from "@react-navigation/native";

import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import WeightRulerPicker, { UnidadPeso } from "@/shared/components/ui/WeightRulerPicker";

function normalizePesoKg(input: number, min = 30, max = 200) {
  if (typeof input !== "number" || !Number.isFinite(input)) return 60;
  const rounded = Math.round(input);
  return Math.max(min, Math.min(max, rounded));
}

export default function PesoObjetivoScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const usuario = useRegistroStore((s) => s.usuario);
  const setField = useRegistroStore((s) => s.setField);

  const unit: UnidadPeso = (usuario?.medidaPeso as UnidadPeso) || "KG";

  const storeKg =
    typeof usuario?.pesoObjetivo === "number"
      ? usuario.pesoObjetivo
      : typeof usuario?.peso === "number"
      ? usuario.peso
      : 50;

  const [localKg, setLocalKg] = useState<number>(() => normalizePesoKg(storeKg));
  const lastLocalKgRef = useRef(localKg);
  useEffect(() => {
    lastLocalKgRef.current = localKg;
  }, [localKg]);

  useEffect(() => {
    setLocalKg(normalizePesoKg(storeKg));
  }, [storeKg]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        const finalKg = normalizePesoKg(lastLocalKgRef.current);
        const currentStore =
          typeof usuario?.pesoObjetivo === "number" ? usuario.pesoObjetivo : 0;
        if (currentStore !== finalKg) {
          setField("pesoObjetivo", finalKg);
        }
      };
    }, [setField])
  );

  const valido = localKg >= 30;

  const bgColor = isDark ? "#0b1220" : "#f6f7fb";
  const labelColor = isDark ? "#E5E7EB" : "#111827";
  const hintColor = isDark ? "#9CA3AF" : "#6B7280";

  return (
    <>
      {valido && <BtnAprobe step="Edad" placement="left" />}

      <ScrollView
        className={isDark ? "bg-[#0b1220]" : "bg-[#f6f7fb]"}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="items-center">
          <Text
            className={`text-center text-lg font-semibold p-3 ${
              isDark ? "text-white" : "text-neutral-900"
            }`}
          >
            ¿Cuál es tu peso objetivo?
          </Text>

          <Text
            className={`text-center p-2 pb-4 text-sm ${
              isDark ? "text-neutral-300" : "text-neutral-600"
            }`}
          >
            Consigamos ese peso ideal para ti y subamos esa autoestima
          </Text>
        </View>

        <View className="px-2 items-center">
          <WeightRulerPicker
            unit={unit}
            valueKg={localKg}
            minKg={30}
            maxKg={200}
            stepKg={1}
            onChange={(kg) => setLocalKg(normalizePesoKg(kg))}
            onChangeEnd={(kg) => setLocalKg(normalizePesoKg(kg))}
            label="Indica tu peso objetivo"
            rulerStyle={{ width: "100%", backgroundColor: bgColor }}
            labelColor={labelColor}
            hintColor={hintColor}
            indicatorColor="#22C55E"
          />
        </View>
      </ScrollView>
    </>
  );
}

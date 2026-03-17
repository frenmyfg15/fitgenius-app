import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useFocusEffect } from "@react-navigation/native";

import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import WeightRulerPicker, { UnidadPeso } from "@/shared/components/ui/WeightRulerPicker";

function normalizePesoKg(input: number, min = 30, max = 200) {
  if (typeof input !== "number" || !Number.isFinite(input)) return 70;
  const rounded = Math.round(input);
  return Math.max(min, Math.min(max, rounded));
}

export default function PesoScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // ✅ Suscripción granular
  const storePeso = useRegistroStore((s) =>
    typeof s.usuario?.peso === "number" && s.usuario.peso >= 30
      ? s.usuario.peso
      : 70
  );
  const unidad: UnidadPeso = useRegistroStore(
    (s) => (s.usuario?.medidaPeso as UnidadPeso) || "KG"
  );
  const setField = useRegistroStore((s) => s.setField);

  const [localKg, setLocalKg] = useState<number>(() => normalizePesoKg(storePeso));

  // ✅ Refs para el cleanup — sin deps reactivas
  const lastLocalKgRef = useRef(localKg);
  const unidadRef = useRef(unidad);
  const storePesoRef = useRef(storePeso);
  const setFieldRef = useRef(setField);

  useEffect(() => { lastLocalKgRef.current = localKg; }, [localKg]);
  useEffect(() => { unidadRef.current = unidad; }, [unidad]);
  useEffect(() => { storePesoRef.current = storePeso; }, [storePeso]);
  useEffect(() => { setFieldRef.current = setField; }, [setField]);

  // ✅ Solo sincroniza si cambia peso externamente
  const prevStorePesoRef = useRef(storePeso);
  useEffect(() => {
    if (prevStorePesoRef.current === storePeso) return;
    prevStorePesoRef.current = storePeso;
    const next = normalizePesoKg(storePeso);
    setLocalKg((prev) => (prev !== next ? next : prev));
  }, [storePeso]);

  const onPressUnidad = useCallback(
    (u: UnidadPeso) => {
      setField("medidaPeso", u);
    },
    [setField]
  );

  const handleChangePeso = useCallback((kgBase: number) => {
    setLocalKg(normalizePesoKg(kgBase));
  }, []);

  const handleChangePesoEnd = useCallback((kgBase: number) => {
    setLocalKg(normalizePesoKg(kgBase));
  }, []);

  // ✅ Deps vacías — todo via refs
  useFocusEffect(
    useCallback(() => {
      return () => {
        const finalKg = normalizePesoKg(lastLocalKgRef.current);
        if (storePesoRef.current !== finalKg) {
          setFieldRef.current("peso", finalKg);
        }
        setFieldRef.current("medidaPeso", unidadRef.current);
      };
    }, [])
  );

  const pesoValido = localKg > 30;
  const bgColor = isDark ? "#0b1220" : "#f6f7fb";
  const bg = { backgroundColor: bgColor };
  const textMain = { color: isDark ? "#ffffff" : "#111827" };
  const textSub = { color: isDark ? "#d1d5db" : "#4b5563" };
  const selectedBg = "#22c55e";
  const unselectedBg = isDark ? "#1f2937" : "#e5e7eb";
  const selectedText = "#ffffff";
  const unselectedText = isDark ? "#ffffff" : "#000000";

  return (
    <>
      {pesoValido && <BtnAprobe step="PesoObjetivo" placement="left" />}

      <ScrollView
        style={bg}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 24,
          paddingBottom: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: "center" }}>
          <Text style={[styles.h1, textMain]}>¿Cuánto pesas?</Text>
          <Text style={[styles.sub, textSub]}>
            Tu peso es solo un número, no tu límite. Lo que importa es lo que haces con él
          </Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", paddingBottom: 12 }}>
          <Pressable onPress={() => onPressUnidad("KG")}>
            <View
              style={[
                styles.toggleBtnLeft,
                { backgroundColor: unidad === "KG" ? selectedBg : unselectedBg },
              ]}
            >
              <Text style={{ color: unidad === "KG" ? selectedText : unselectedText, fontWeight: "600" }}>
                KG
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => onPressUnidad("LB")}>
            <View
              style={[
                styles.toggleBtnRight,
                { backgroundColor: unidad === "LB" ? selectedBg : unselectedBg },
              ]}
            >
              <Text style={{ color: unidad === "LB" ? selectedText : unselectedText, fontWeight: "600" }}>
                LB
              </Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.pickerSection}>
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
              Indica tu peso
            </Text>

            <View style={styles.pickerWrap}>
              <WeightRulerPicker
                unit={unidad}
                valueKg={localKg}
                minKg={30}
                maxKg={200}
                stepKg={1}
                onChange={handleChangePeso}
                onChangeEnd={handleChangePesoEnd}
                rulerStyle={{ width: "100%", backgroundColor: bgColor }}
                containerStyle={{ width: "100%" }}
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
  toggleBtnLeft: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  toggleBtnRight: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  pickerSection: { paddingTop: 18 },
  rulerCard: {
    width: "100%",
    borderRadius: 18,
    paddingBottom: 8,
  },
  pickerWrap: {
    width: "100%",
    paddingBottom: 10,
  },
});
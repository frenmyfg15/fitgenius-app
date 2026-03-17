import React, { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useColorScheme } from "nativewind";
import { useFocusEffect } from "@react-navigation/native";

import BtnAprobe from "@/shared/components/ui/BtnAprobe";
import { useRegistroStore } from "@/features/store/useRegistroStore";
import HeightRulerPicker, { UnidadAltura } from "@/shared/components/ui/HeightRulerPicker";

function normalizeAlturaCm(input: number, min = 100, max = 220) {
  if (typeof input !== "number" || !Number.isFinite(input)) return 170;
  const rounded = Math.round(input);
  return Math.max(min, Math.min(max, rounded));
}

export default function AlturaLocalScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const storeAltura = useRegistroStore((s) =>
    typeof s.usuario?.altura === "number" && s.usuario.altura >= 100
      ? s.usuario.altura
      : 170
  );
  const unidad: UnidadAltura = useRegistroStore(
    (s) => (s.usuario?.medidaAltura as UnidadAltura) || "CM"
  );
  const setField = useRegistroStore((s) => s.setField);

  const [localCm, setLocalCm] = useState<number>(() => normalizeAlturaCm(storeAltura));

  // ✅ Refs para el cleanup — sin deps reactivas
  const lastLocalCmRef = useRef(localCm);
  const unidadRef = useRef(unidad);
  const storeAlturaRef = useRef(storeAltura);
  const setFieldRef = useRef(setField);

  // Mantener refs siempre actualizadas sin causar re-renders
  useEffect(() => { lastLocalCmRef.current = localCm; }, [localCm]);
  useEffect(() => { unidadRef.current = unidad; }, [unidad]);
  useEffect(() => { storeAlturaRef.current = storeAltura; }, [storeAltura]);
  useEffect(() => { setFieldRef.current = setField; }, [setField]);

  // ✅ Sin deps problemáticas — solo sincroniza si cambia altura externamente
  const prevStoreAlturaRef = useRef(storeAltura);
  useEffect(() => {
    if (prevStoreAlturaRef.current === storeAltura) return;
    prevStoreAlturaRef.current = storeAltura;
    const next = normalizeAlturaCm(storeAltura);
    setLocalCm((prev) => (prev !== next ? next : prev));
  }, [storeAltura]);

  const onPressUnidad = useCallback(
    (u: UnidadAltura) => {
      setField("medidaAltura", u);
    },
    [setField]
  );

  const handleChangeAltura = useCallback((cm: number) => {
    setLocalCm(normalizeAlturaCm(cm));
  }, []);

  const handleChangeAlturaEnd = useCallback((cm: number) => {
    setLocalCm(normalizeAlturaCm(cm));
  }, []);

  // ✅ Deps vacías — usa solo refs, nunca causa re-registro
  useFocusEffect(
    useCallback(() => {
      return () => {
        const finalCm = normalizeAlturaCm(lastLocalCmRef.current);
        if (storeAlturaRef.current !== finalCm) {
          setFieldRef.current("altura", finalCm);
        }
        setFieldRef.current("medidaAltura", unidadRef.current);
      };
    }, []) // ✅ deps vacías — todo viene de refs
  );

  const alturaValida = localCm >= 100;
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
      {alturaValida && <BtnAprobe step="Peso" placement="left" />}

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
          <Text style={[styles.h1, textMain]}>¿Cuánto mides?</Text>
          <Text style={[styles.sub, textSub]}>Desliza la regla para seleccionar tu altura.</Text>
        </View>

        <View style={{ flexDirection: "row", justifyContent: "center", paddingBottom: 12 }}>
          <Pressable onPress={() => onPressUnidad("CM")}>
            <View
              style={[
                styles.toggleBtnLeft,
                { backgroundColor: unidad === "CM" ? selectedBg : unselectedBg },
              ]}
            >
              <Text style={{ color: unidad === "CM" ? selectedText : unselectedText, fontWeight: "600" }}>
                CM
              </Text>
            </View>
          </Pressable>

          <Pressable onPress={() => onPressUnidad("FT")}>
            <View
              style={[
                styles.toggleBtnRight,
                { backgroundColor: unidad === "FT" ? selectedBg : unselectedBg },
              ]}
            >
              <Text style={{ color: unidad === "FT" ? selectedText : unselectedText, fontWeight: "600" }}>
                FT
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
              Indica tu altura
            </Text>

            <View style={styles.pickerWrap}>
              <HeightRulerPicker
                unit={unidad}
                valueCm={localCm}
                minCm={100}
                maxCm={220}
                stepCm={1}
                onChange={handleChangeAltura}
                onChangeEnd={handleChangeAlturaEnd}
                rulerStyle={{ width: "100%", backgroundColor: bgColor }}
                containerStyle={{ width: "100%" }}
                tickColor={isDark ? "rgba(255,255,255,0.35)" : "rgba(17,24,39,0.35)"}
                tickColorMajor={isDark ? "rgba(255,255,255,0.85)" : "rgba(17,24,39,0.85)"}
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
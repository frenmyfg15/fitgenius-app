// src/features/fit/screens/app/rutinas/MisRutinas.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Animated,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import { Rutina } from "@/features/type/rutinas";
import { useMisRutinas } from "@/shared/hooks/useMisRutinas";
import MisRutinas from "@/shared/components/misRutinas/MisRutinas";
import MostrarRutina from "@/shared/components/misRutinas/MostrarRutina";
import MisRutinasSkeleton from "@/shared/components/skeleton/MisRutinasSkeleton";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

/* -------- Paleta y glass -------- */
const marcoGradient = [
  "rgb(0,255,64)",
  "rgb(94,230,157)",
  "rgb(178,0,255)",
] as const;

const cardBorderDark = "rgba(255,255,255,0.08)";

export default function MisRutinasScreen() {
  const navigation = useNavigation<any>();
  const {
    rutinas,
    rutinaSeleccionada,
    ver,
    loading,
    mostrar,
    cerrarVisor,
    reloadRutinas, // ✅ antes: toggleReload
    totalIA,
    maxIA,
  } = useMisRutinas();

  const isPremium = useUsuarioStore((s) => s.usuario?.haPagado === true);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const screenH = useMemo(() => Dimensions.get("window").height, []);
  const slideY = useRef(new Animated.Value(screenH)).current;

  const [refreshing, setRefreshing] = useState(false);

  // Animación visor
  useEffect(() => {
    const toValue = ver && rutinaSeleccionada ? 0 : screenH;
    Animated.timing(slideY, {
      toValue,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [ver, rutinaSeleccionada, screenH, slideY]);

  // Navegación
  const goToManual = () => navigation.navigate("CrearRutina");

  // Pull-to-refresh (✅ ahora sí espera a la API)
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadRutinas();
    } finally {
      setRefreshing(false);
    }
  }, [reloadRutinas]);

  return (
    <View
      className={`flex-1 items-center ${isDark ? "bg-[#0b1220]" : "bg-white"}`}
    >
      <ScrollView
        style={{ flex: 1, width: "100%" }}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 16,
          paddingTop: 32,
          paddingBottom: 140,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={isDark ? "#e5e7eb" : "#0f172a"}
            colors={[isDark ? "#22c55e" : "#16a34a"]}
          />
        }
      >
        {/* Título */}
        <View className="mb-6 items-center w-full max-w-[600px]">
          <Text
            className={`text-2xl font-bold text-center ${
              isDark ? "text-gray-100" : "text-gray-900"
            }`}
          >
            Tus rutinas
          </Text>
          <Text
            className={`${
              isDark ? "text-gray-400" : "text-gray-600"
            } text-center mt-1`}
          >
            Consulta, gestiona y crea nuevas rutinas personalizadas
          </Text>
        </View>

        {/* Contenido principal */}
        {loading ? (
          <View className="w-full max-w-[600px]">
            <MisRutinasSkeleton />
          </View>
        ) : (
          <View className="w-full mt-2 max-w-[600px]">
            {rutinas.length > 0 ? (
              <MisRutinas rutinas={rutinas as Rutina[]} mostrar={mostrar} />
            ) : (
              <MensajeVacio
                titulo="Aún no tienes una rutina"
                descripcion="Crea tu primera rutina manual o genera una con IA según tus objetivos."
                textoBoton="Crear mi rutina"
                rutaDestino="/crear-rutina"
                nombreImagen="rutinas"
                mostrarBoton={false}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* CTA flotantes */}
      {!loading && (
        <View className="absolute bottom-5 z-30 flex-row gap-7 items-center justify-center">
          {/* Crear rutina manual */}
          <LinearGradient
            colors={marcoGradient as any}
            className="rounded-2xl p-[1px]"
            style={{ borderRadius: 15, overflow: "hidden" }}
          >
            <TouchableOpacity
              onPress={goToManual}
              className={
                "px-6 py-2 rounded-full flex-row items-center justify-center " +
                (isDark ? "bg-[#0f172a]" : "bg-white")
              }
              activeOpacity={0.9}
            >
              <Text
                className={
                  "text-sm font-semibold " +
                  (isDark ? "text-white" : "text-gray-900")
                }
              >
                Rutina manual
              </Text>
            </TouchableOpacity>
          </LinearGradient>

          {/* Crear con IA */}
          <View className="relative">
            {/* ✅ ahora dispara recarga real */}
            <IaGenerate onCreate={reloadRutinas} />

            <View
              className="absolute -top-9 -right-2 min-w-[40px] px-2 h-6 rounded-full border text-[12px] font-semibold grid place-items-center shadow"
              style={{
                backgroundColor: isDark ? "rgba(20,28,44,0.9)" : "#ffffff",
                borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)",
              }}
            >
              <Text style={{ color: isDark ? "#ffffff" : "#111827" }}>
                IA usadas: {totalIA}
                {isPremium ? " / ∞" : ` / ${maxIA}`}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Overlay visor rutina */}
      <Animated.View
        pointerEvents={ver && rutinaSeleccionada ? "auto" : "none"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: screenH,
          transform: [{ translateY: slideY }],
          backgroundColor: "rgba(0,0,0,0.4)",
          zIndex: 50,
        }}
      >
        <View className="flex-1 pt-10 items-center">
          {rutinaSeleccionada && (
            <MostrarRutina
              key={rutinaSeleccionada.id}
              rutinas={rutinaSeleccionada}
              setVer={(v: boolean) => !v && cerrarVisor()}
              onDelete={async () => {
                // ✅ recarga real antes de cerrar
                await reloadRutinas();
                cerrarVisor();
              }}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

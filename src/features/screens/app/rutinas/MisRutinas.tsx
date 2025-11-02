import React, { useEffect, useMemo, useRef } from "react";
import { View, Text, Animated, Dimensions, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";

import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import CandadoPremium from "@/shared/components/ui/CandadoPremium";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import { Rutina } from "@/features/type/rutinas";
import { useMisRutinas } from "@/shared/hooks/useMisRutinas";
import MisRutinas from "@/shared/components/misRutinas/MisRutinas";
import MostrarRutina from "@/shared/components/misRutinas/MostrarRutina";
import MisRutinasSkeleton from "@/shared/components/skeleton/MisRutinasSkeleton";

/* -------- Paleta y glass como en el resto de componentes -------- */
const marcoGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"] as const;
const cardBgDarkA = "rgba(20,28,44,0.85)";
const cardBgDarkB = "rgba(9,14,24,0.9)";
const cardBorderDark = "rgba(255,255,255,0.08)";
const textPrimaryDark = "#e5e7eb";
const textSecondaryDark = "#94a3b8";

export default function MisRutinasScreen() {
  const navigation = useNavigation<any>();
  const {
    rutinas,
    rutinaSeleccionada,
    ver,
    loading,
    mostrar,
    cerrarVisor,
    toggleReload,
    lockedManual,
    maxManual,
    maxIA,
    totalManual,
    totalIA,
  } = useMisRutinas();

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Animación slide-up visor
  const screenH = useMemo(() => Dimensions.get("window").height, []);
  const slideY = useRef(new Animated.Value(screenH)).current;

  useEffect(() => {
    const toValue = ver && rutinaSeleccionada ? 0 : screenH;
    Animated.timing(slideY, { toValue, duration: 250, useNativeDriver: true }).start();
  }, [ver, rutinaSeleccionada, screenH, slideY]);

  const textPrimary = isDark ? textPrimaryDark : "#0f172a";
  const textSecondary = isDark ? textSecondaryDark : "#64748b";

  const goToManual = () => {
    if (!lockedManual) navigation.navigate("CrearRutina");
  };

  return (
    <View className={`flex-1 px-4 py-8 pb-40 items-center ${isDark ? "bg-[#0b1220]" : "bg-white"}`}>
      <View className="mb-6 items-center">
        <Text className={`text-2xl font-bold ${isDark ? "text-gray-100" : "text-gray-900"}`}>
          Tus rutinas
        </Text>
        <Text className={`${isDark ? "text-gray-400" : "text-gray-600"} text-center`}>
          Consulta, gestiona y crea nuevas rutinas personalizadas
        </Text>
      </View>

      {loading ? (
        // ✅ Skeleton dentro del mismo contenedor de 600px para mantener layout
        <View className="w-full max-w-[600px]">
          <MisRutinasSkeleton />
        </View>
      ) : (
        <View className="w-full mt-6 max-w-[600px]">
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

      {/* CTA flotantes (ocultos durante el loading para no tapar el skeleton) */}
      {!loading && (
        <View className="absolute bottom-20 z-30 flex-row gap-7 items-center justify-center">
          {/* Rutina manual */}
          <View className="relative">
            <LinearGradient colors={marcoGradient as any} className="rounded-2xl p-[1px]" style={{ borderRadius: 15, overflow: "hidden" }}>
              <TouchableOpacity
                onPress={goToManual}
                disabled={lockedManual}
                accessibilityRole="button"
                accessibilityLabel="Crear o gestionar rutina manual"
                className={"px-6 py-2 rounded-full " + (isDark ? "bg-[#0f172a]" : "bg-white")}
                activeOpacity={0.9}
              >
                <Text className={"text-sm font-semibold " + (isDark ? "text-white" : "text-gray-900")}>
                  Rutina manual
                </Text>
              </TouchableOpacity>
            </LinearGradient>

            {/* Badge contador manual */}
            <View
              className="absolute -top-10 -right-2 min-w-[40px] px-2 h-6 rounded-full border text-[12px] font-semibold grid place-items-center shadow"
              style={{ backgroundColor: isDark ? "rgba(20,28,44,0.9)" : "#ffffff", borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)" }}
              accessibilityLabel={`Rutinas manuales: ${totalManual} de ${maxManual}`}
            >
              <Text style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>
                {totalManual}/{maxManual}
              </Text>
            </View>

            {/* Candado si está bloqueado */}
            {lockedManual && (
              <View className="absolute inset-0" pointerEvents="auto">
                <CandadoPremium
                  size={28}
                  showTitle
                  titleFontSize={12}
                  blurLevel="backdrop-blur-md"
                  opacityLevel={isDark ? "bg-white/20" : "bg-white/10"}
                  position="center"
                  isDark={isDark}
                />
              </View>
            )}
          </View>

          {/* Rutina IA */}
          <View className="relative">
            <IaGenerate onCreate={toggleReload} />
            <View
              className="absolute -top-9 -right-2 min-w-[40px] px-2 h-6 rounded-full border text-[12px] font-semibold grid place-items-center shadow"
              style={{ backgroundColor: isDark ? "rgba(20,28,44,0.9)" : "#ffffff", borderColor: isDark ? cardBorderDark : "rgba(0,0,0,0.06)" }}
              accessibilityLabel={`Rutinas generadas por IA: ${totalIA} de ${maxIA}`}
            >
              <Text style={{ color: isDark ? textPrimaryDark : "#0f172a" }}>
                {totalIA}/{maxIA}
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
          zIndex: 50
        }}
      >
        <View className="flex-1 pt-10 items-center">
          {rutinaSeleccionada && (
            <MostrarRutina
              key={rutinaSeleccionada.id}
              rutinas={rutinaSeleccionada}
              setVer={(v: boolean) => {
                if (!v) cerrarVisor();
              }}
              onDelete={() => {
                toggleReload();
                cerrarVisor();
              }}
            />
          )}
        </View>
      </Animated.View>
    </View>
  );
}

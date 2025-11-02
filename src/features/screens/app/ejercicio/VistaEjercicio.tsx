import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { PlayCircle, Check, Loader2, Info, LineChart, PlusCircle } from "lucide-react-native";

import NotaIA from "@/shared/components/ejercicio/NotaIA";
import SeriesInput from "@/shared/components/ejercicio/SeriesInput";
import PanelInfo from "@/shared/components/ejercicio/PanelInfo";
import PanelEstadisticas from "@/shared/components/ejercicio/PanelEstadisticas";
import DescansoModal from "@/shared/components/ejercicio/DescansoModal";
import CelebracionModal from "@/shared/components/ejercicio/CelebracionModal";
import { Params, useVistaEjercicioState } from "@/shared/hooks/useVistaEjercicioState";


/* ---------------- Vista (sólo UI) ---------------- */
export default function VistaEjercicio() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const { slug, asignadoId, ejercicio: ejercicioPrefetch } = (route.params ?? {}) as Params;

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Toda la lógica vive en el hook:
  const {
    ejercicio,
    series,
    tiempoRestante,
    descansando,
    guardando,
    festejo,
    experienciaPlus,
    calorias,

    infoVisible,
    setInfoVisible,
    estadisticaVisible,
    setEstadisticaVisible,

    handleInputChange,
    agregar,
    iniciarDescanso,
    finalizarDescanso,
    guardarSeries,
  } = useVistaEjercicioState({ slug, asignadoId, ejercicio: ejercicioPrefetch });

  if (!ejercicio) {
    return (
      <View
        className="min-h-screen items-center justify-center"
        style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}
      >
        <Text className={isDark ? "text-[#e5e7eb]" : "text-gray-700"}>Cargando ejercicio...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 relative" style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}>
      {/* CONTENIDO SCROLLEABLE */}
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 140, // espacio para el FAB
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen del ejercicio */}
        <View className="w-full max-w-sm aspect-square relative">
          <Image
            source={{
              uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${ejercicio.idGif}.gif`,
            }}
            resizeMode="contain"
            className="w-full h-full"
            accessibilityLabel={ejercicio.nombre}
            style={{
              borderRadius: 50,
              marginVertical: 10,
              backgroundColor: "#ffffff",
            }}
          />

          <TouchableOpacity
            onPress={iniciarDescanso}
            disabled={guardando}
            accessibilityLabel="Iniciar descanso"
            className={
              "absolute -bottom-2 right-7 flex-row items-center gap-2 px-3 py-2 rounded-full shadow-md " +
              (isDark ? "bg-black" : "bg-zinc-800")
            }
            style={{ opacity: guardando ? 0.6 : 1 }}
            activeOpacity={0.85}
          >
            <PlayCircle size={18} color="#fff" />
            <Text className="text-white text-sm font-medium">Descanso</Text>
          </TouchableOpacity>
        </View>

        {/* Nota IA / sugerencias */}
        <NotaIA
          notaIA={ejercicio.ejercicioAsignado?.notaIA}
          series={ejercicio.ejercicioAsignado?.seriesSugeridas}
          repeticiones={ejercicio.ejercicioAsignado?.repeticionesSugeridas}
          peso={ejercicio.ejercicioAsignado?.pesoSugerido}
        />

        {/* Series */}
        <SeriesInput series={series} onChange={handleInputChange} />

        {/* Acciones */}
        <View className="w-full max-w-md mt-3 flex-row gap-3">
          <TouchableOpacity
            onPress={agregar}
            disabled={guardando}
            className={
              "p-2 rounded-full shadow-md items-center justify-center " +
              (isDark ? "bg-white/10" : "bg-zinc-800")
            }
            activeOpacity={0.85}
          >
            <PlusCircle size={20} color={isDark ? "#e5e7eb" : "#fff"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={guardarSeries}
            disabled={guardando}
            className="p-2 rounded-full items-center justify-center shadow-md"
            style={{ backgroundColor: "#22c55e", opacity: guardando ? 0.6 : 1 }}
            activeOpacity={0.9}
          >
            {guardando ? <Loader2 size={18} color="#fff" className="animate-spin" /> : <Check size={20} color="#fff" />}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FABs flotantes */}
      <View className="absolute right-5" style={{ bottom: 10, zIndex: 20 }}>
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setInfoVisible((v) => !v)}
            disabled={guardando}
            className={
              "p-3 rounded-full shadow items-center justify-center " +
              (isDark ? "bg-black border border-white/25" : "bg-white border border-neutral-200")
            }
            style={{ opacity: guardando ? 0.6 : 1 }}
          >
            <Info size={20} color={isDark ? "#e5e7eb" : "#3f3f46"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setEstadisticaVisible((v) => !v)}
            disabled={guardando}
            className={
              "p-3 rounded-full shadow items-center justify-center " +
              (isDark ? "bg-black border border-white/25" : "bg-white border border-neutral-200")
            }
            style={{ opacity: guardando ? 0.6 : 1 }}
          >
            <LineChart size={20} color={isDark ? "#e5e7eb" : "#3f3f46"} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Paneles */}
      <PanelInfo
        visible={infoVisible}
        onClose={() => setInfoVisible(false)}
        materiales={ejercicio.equipamientoNecesario || []}
        instrucciones={ejercicio.instrucciones || []}
      />

      <PanelEstadisticas
        visible={estadisticaVisible}
        onClose={() => setEstadisticaVisible(false)}
        detallesSeries={ejercicio.ultimaSesion?.detallesSeries}
      />

      {/* Modales */}
      {descansando && (
        <DescansoModal visible={descansando} tiempo={tiempoRestante || 0} onFinalizar={finalizarDescanso} />
      )}
      {festejo && (
        <CelebracionModal
          visible={festejo}
          experiencia={experienciaPlus}
          calorias={calorias.current}
        />
      )}
    </View>
  );
}

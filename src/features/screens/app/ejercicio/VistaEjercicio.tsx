import React, { useMemo, useState, useCallback } from "react";
import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native"; // ← quitado Alert
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import { PlayCircle, Check, Loader2, Info, LineChart, PlusCircle, MinusCircle } from "lucide-react-native";

import NotaIA from "@/shared/components/ejercicio/NotaIA";
import SeriesInput from "@/shared/components/ejercicio/SeriesInput";
import PanelInfo from "@/shared/components/ejercicio/PanelInfo";
import PanelEstadisticas from "@/shared/components/ejercicio/PanelEstadisticas";
import DescansoModal from "@/shared/components/ejercicio/DescansoModal";
import CelebracionModal from "@/shared/components/ejercicio/CelebracionModal";
import { Params, useVistaEjercicioState } from "@/shared/hooks/useVistaEjercicioState";
import SeriesCompuestasInput, { ComponenteCompuesto, RegistroPayload } from "@/shared/components/ejercicio/compuestos/SeriesCompuestasInput";
import ImageSelector from "../../../../shared/components/ejercicio/compuestos/ImageSelector";
import PanelEstadisticasCompuestos from "@/shared/components/ejercicio/compuestos/PanelEstadisticasCompuestos";

/* ---------------- Vista (sólo UI) ---------------- */
export default function VistaEjercicio() {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const { slug, asignadoId, ejercicio: ejercicioPrefetch } = (route.params ?? {}) as Params;

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  // Toda la lógica vive en el hook (simple) + pequeño estado local (compuesto)
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
    guardarSeriesCompuesto
  } = useVistaEjercicioState({ slug, asignadoId, ejercicio: ejercicioPrefetch });


  // (opcional) mapea sets simples si lo necesitas para el panel de simples

  const esCompuesto = Boolean(ejercicio?.ejercicioCompuestoId || ejercicio?.ejercicioCompuesto);
  const detallesSeriesSimples =
    ejercicio?.ultimaSesion?.detallesSeries?.map((s: any, i: number) => ({
      serieNumero: s.serieNumero ?? i + 1,
      pesoKg: s.pesoKg ?? 0,
      repeticiones: s.repeticiones ?? 0,
    })) ?? [];

  console.log(JSON.stringify(ejercicio, null, 2));


  // ---------- Derivados para COMPUESTO ----------
  const componentes: ComponenteCompuesto[] = useMemo(() => {
    if (!esCompuesto) return [];
    const comps = ejercicio.ejercicioCompuesto?.ejerciciosComponentes ?? [];
    return comps.map((c: any) => ({
      ejercicioId: c.ejercicioId,
      nombre: c.ejercicio?.nombre ?? `Ejercicio ${c.orden}`,
      tipo: c.ejercicio?.requiereTiempoPorSerie ? ("tiempo" as const) : ("peso_reps" as const),
    }));
  }, [esCompuesto, ejercicio]);

  const imagenesCompuesto: string[] = useMemo(() => {
    if (!esCompuesto) return [];
    const comps = ejercicio.ejercicioCompuesto?.ejerciciosComponentes ?? [];
    return comps
      .map((c: any) =>
        c.ejercicio?.idGif
          ? `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${c.ejercicio.idGif}.gif`
          : null
      )
      .filter(Boolean) as string[];
  }, [esCompuesto, ejercicio]);

  // Series para compuesto: RegistroPayload[][] (serie x componente)
  const [seriesComp, setSeriesComp] = useState<RegistroPayload[][]>(() => {
    if (!esCompuesto || componentes.length === 0) return [];
    return [componentes.map((c) => ({ ejercicioId: c.ejercicioId }))];
  });

  const onChangeComp = useCallback(
    (sIdx: number, cIdx: number, patch: Partial<RegistroPayload>) => {
      setSeriesComp((prev) => {
        const next = prev.map((s) => s.slice());
        const base = next[sIdx]?.[cIdx] ?? { ejercicioId: componentes[cIdx].ejercicioId };
        next[sIdx][cIdx] = { ...base, ...patch, ejercicioId: componentes[cIdx].ejercicioId };
        return next;
      });
    },
    [componentes]
  );

  const addSerieComp = useCallback(() => {
    setSeriesComp((prev) => [...prev, componentes.map((c) => ({ ejercicioId: c.ejercicioId }))]);
  }, [componentes]);

  const removeSerieComp = useCallback((sIdx: number) => {
    setSeriesComp((prev) => prev.filter((_, i) => i !== sIdx));
  }, []);

  // Guardar universal: simple vs compuesto
  const handleGuardar = useCallback(() => {
    if (esCompuesto) {
      return guardarSeriesCompuesto(seriesComp); // ← pasar seriesComp
    }
    return guardarSeries();
  }, [esCompuesto, guardarSeriesCompuesto, guardarSeries, seriesComp]); // ← incluir seriesComp en deps

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
          paddingBottom: 140,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Media (simple: 1 imagen | compuesto: selector de imágenes) */}
        <View className="w-full max-w-sm aspect-square relative p-5">
          {esCompuesto && imagenesCompuesto.length > 0 ? (
            <View className=" px-[40px]">
              <ImageSelector images={imagenesCompuesto} alt={ejercicio.ejercicioCompuesto?.nombre || "Compuesto"} />
            </View>
          ) : (
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
          )}

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
          notaIA={
            esCompuesto
              ? ejercicio.notaIA ?? ejercicio.ejercicioAsignado?.notaIA
              : ejercicio.ejercicioAsignado?.notaIA
          }
          series={
            esCompuesto
              ? ejercicio.ejercicioCompuesto?.ejerciciosComponentes?.[0]?.series
              : ejercicio.ejercicioAsignado?.seriesSugeridas
          }
          repeticiones={
            esCompuesto
              ? ejercicio.ejercicioCompuesto?.ejerciciosComponentes?.[0]?.repeticiones
              : ejercicio.ejercicioAsignado?.repeticionesSugeridas
          }
          peso={
            esCompuesto
              ? ejercicio.ejercicioCompuesto?.ejerciciosComponentes?.[0]?.pesoSugerido
              : ejercicio.ejercicioAsignado?.pesoSugerido
          }
        />

        {/* SERIES */}
        {esCompuesto ? (
          <View className="w-full max-w-[900px]">
            <SeriesCompuestasInput
              componentes={componentes}
              series={seriesComp}
              onChange={onChangeComp}
            />
          </View>
        ) : (
          <SeriesInput series={series} onChange={handleInputChange} />
        )}

        {/* ACCIONES (JUNTAS): Guardar + Añadir + Eliminar */}
        <View className="w-full max-w-md mt-3 flex-row gap-3 items-center">
          {/* Añadir serie */}
          <TouchableOpacity
            onPress={esCompuesto ? addSerieComp : agregar}
            disabled={guardando}
            className={
              "p-2 rounded-full shadow-md items-center justify-center " +
              (isDark ? "bg-white/10" : "bg-zinc-800")
            }
            activeOpacity={0.85}
          >
            <PlusCircle size={20} color={isDark ? "#e5e7eb" : "#fff"} />
          </TouchableOpacity>

          {/* Eliminar última serie (solo compuesto) */}
          <TouchableOpacity
            onPress={() => esCompuesto && seriesComp.length > 0 && removeSerieComp(seriesComp.length - 1)}
            disabled={guardando || (esCompuesto && seriesComp.length === 0)}
            className={
              "p-2 rounded-full shadow-md items-center justify-center " +
              (isDark ? "bg-white/10" : "bg-zinc-800")
            }
            style={{ opacity: guardando || (esCompuesto && seriesComp.length === 0) ? 0.6 : 1 }}
            activeOpacity={0.85}
          >
            <MinusCircle size={20} color={isDark ? "#e5e7eb" : "#fff"} />
          </TouchableOpacity>

          {/* Guardar */}
          <TouchableOpacity
            onPress={handleGuardar}
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
          {
            esCompuesto ?
              null
              :
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
          }

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
      {
        esCompuesto ?
          null
          :
          <PanelInfo
            visible={infoVisible}
            onClose={() => setInfoVisible(false)}
            materiales={
              esCompuesto
                ? (ejercicio.ejercicioCompuesto?.ejerciciosComponentes ?? [])
                  .flatMap((c: any) => c.ejercicio?.equipamientoNecesario ?? [])
                : ejercicio.equipamientoNecesario || []
            }
            instrucciones={ejercicio.instrucciones || []}
          />
      }

      {esCompuesto ? (
        <PanelEstadisticasCompuestos
          visible={estadisticaVisible}
          onClose={() => setEstadisticaVisible(false)}
          // le pasamos la última sesión del compuesto tal como llega del backend
          ultimaSesion={ejercicio?.ultimaSesion ?? null}
        />
      ) : (
        <PanelEstadisticas
          visible={estadisticaVisible}
          onClose={() => setEstadisticaVisible(false)}
          detallesSeries={detallesSeriesSimples}
        />
      )}

      {/* Modales */}
      {descansando && (
        <DescansoModal visible={descansando} tiempo={tiempoRestante || 0} onFinalizar={finalizarDescanso} />
      )}
      {festejo && (
        <CelebracionModal visible={festejo} experiencia={experienciaPlus} calorias={calorias.current} />
      )}
    </View>
  );
}

import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useColorScheme } from "nativewind";
import {
  PlayCircle,
  Check,
  Loader2,
  Info,
  LineChart,
  PlusCircle,
  MinusCircle,
  Sparkles,
  Dumbbell,
  ChevronUp,
  ChevronDown,
} from "lucide-react-native";
import Toast from "react-native-toast-message";

import NotaIA from "@/shared/components/ejercicio/NotaIA";
import SeriesInput from "@/shared/components/ejercicio/SeriesInput";
import PanelInfo from "@/shared/components/ejercicio/PanelInfo";
import PanelEstadisticas from "@/shared/components/ejercicio/PanelEstadisticas";
import DescansoModal from "@/shared/components/ejercicio/DescansoModal";
import CelebracionModal from "@/shared/components/ejercicio/CelebracionModal";
import {
  Params,
  useVistaEjercicioState,
} from "@/shared/hooks/useVistaEjercicioState";
import SeriesCompuestasInput, {
  ComponenteCompuesto,
  RegistroPayload,
} from "@/shared/components/ejercicio/compuestos/SeriesCompuestasInput";
import ImageSelector from "@/shared/components/ejercicio/compuestos/ImageSelector";
import PanelEstadisticasCompuestos from "@/shared/components/ejercicio/compuestos/PanelEstadisticasCompuestos";
import NivelEstresModal from "@/shared/components/ejercicio/NivelEstresModal";
import CoachFeedbackModal from "@/shared/components/ejercicio/CoachFeedbackModal";
import ExerciseQuestionModal from "@/shared/components/ejercicio/ExerciseQuestionModal";
import NoAdsModal from "@/shared/components/ads/NoAdsModal";
import { useUsuarioStore } from "@/features/store/useUsuarioStore";

/* ---------------- Vista (sólo UI) ---------------- */
export default function VistaEjercicio() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();
  const { slug, asignadoId, ejercicio: ejercicioPrefetch } = (route.params ??
    {}) as Params;

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [qaVisible, setQaVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // ✅ Animación FAB (acciones)
  const fabAnim = useRef(new Animated.Value(0)).current; // 0 cerrado, 1 abierto

  useEffect(() => {
    Animated.timing(fabAnim, {
      toValue: fabOpen ? 1 : 0,
      duration: fabOpen ? 220 : 180,
      easing: fabOpen
        ? Easing.out(Easing.cubic)
        : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fabOpen, fabAnim]);

  // Helpers para animar cada botón con “stagger” visual
  const getItemAnimStyle = (index: number) => {
    // index 0 = botón más cercano al toggle (abajo), mayor delay
    const input = [0, 1];
    const delayFactor = index * 0.08; // escalón visual

    // Simulamos delay usando interpolate “apretado”
    const t = fabAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const opacity = t.interpolate({
      inputRange: [0 + delayFactor, 1],
      outputRange: [0, 1],
      extrapolate: "clamp",
    });

    const translateY = t.interpolate({
      inputRange: [0 + delayFactor, 1],
      outputRange: [12, 0],
      extrapolate: "clamp",
    });

    const scale = t.interpolate({
      inputRange: [0 + delayFactor, 1],
      outputRange: [0.92, 1],
      extrapolate: "clamp",
    });

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  };

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
    quitar,
    iniciarDescanso,
    finalizarDescanso,
    guardarSeries,
    guardarSeriesCompuesto,

    // nivel de estrés desde el hook
    nivelEstres,
    setNivelEstres,

    // Coach Premium
    coachData,
    coachLoading,
    coachVisible,
    mostrarCoach,
    ocultarCoach,

    // No ads
    noAdsModalVisible,
    setNoAdsModalVisible,
    noAdsRetrying,
    reintentarAnuncioSimple,
    reintentarAnuncioCompuesto,
  } = useVistaEjercicioState({
    slug,
    asignadoId,
    ejercicio: ejercicioPrefetch,
  });

  const usuario = useUsuarioStore();
  const isPremium = usuario.usuario?.haPagado;

  const esCompuesto = Boolean(
    ejercicio?.ejercicioCompuestoId || ejercicio?.ejercicioCompuesto
  );

  const esCardio =
    ejercicio?.grupoMuscular === "CARDIO" ||
    ejercicio?.ejercicioCompuesto?.grupoMuscular === "CARDIO";

  const detallesSeriesSimples =
    ejercicio?.ultimaSesion?.detallesSeries?.map((s: any, i: number) => ({
      serieNumero: s.serieNumero ?? i + 1,
      pesoKg: s.pesoKg ?? 0,
      repeticiones: s.repeticiones ?? 0,
    })) ?? [];

  const componentes: ComponenteCompuesto[] = useMemo(() => {
    if (!esCompuesto || !ejercicio?.ejercicioCompuesto) return [];
    const comps = ejercicio.ejercicioCompuesto.ejerciciosComponentes ?? [];
    return comps.map((c: any) => ({
      ejercicioId: c.ejercicioId,
      nombre: c.ejercicio?.nombre ?? `Ejercicio ${c.orden}`,
      tipo: c.ejercicio?.requiereTiempoPorSerie
        ? ("tiempo" as const)
        : ("peso_reps" as const),
    }));
  }, [esCompuesto, ejercicio]);

  const imagenesCompuesto: string[] = useMemo(() => {
    if (!esCompuesto || !ejercicio?.ejercicioCompuesto) return [];
    const comps = ejercicio.ejercicioCompuesto.ejerciciosComponentes ?? [];
    return comps
      .map((c: any) =>
        c.ejercicio?.idGif
          ? `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${c.ejercicio.idGif}.gif`
          : null
      )
      .filter(Boolean) as string[];
  }, [esCompuesto, ejercicio]);

  const [seriesComp, setSeriesComp] = useState<RegistroPayload[][]>(() => {
    if (!esCompuesto || componentes.length === 0) return [];
    return [componentes.map((c) => ({ ejercicioId: c.ejercicioId }))];
  });

  // 🔹 Estado local para mostrar/ocultar el modal de estrés
  const [estresModalVisible, setEstresModalVisible] = useState(false);

  const onChangeComp = useCallback(
    (sIdx: number, cIdx: number, patch: Partial<RegistroPayload>) => {
      setSeriesComp((prev) => {
        const next = prev.map((s) => s.slice());
        const base =
          next[sIdx]?.[cIdx] ?? {
            ejercicioId: componentes[cIdx].ejercicioId,
          };
        next[sIdx][cIdx] = {
          ...base,
          ...patch,
          ejercicioId: componentes[cIdx].ejercicioId,
        };
        return next;
      });
    },
    [componentes]
  );

  const addSerieComp = useCallback(() => {
    setSeriesComp((prev) => [
      ...prev,
      componentes.map((c) => ({ ejercicioId: c.ejercicioId })),
    ]);
  }, [componentes]);

  const removeSerieComp = useCallback((sIdx: number) => {
    setSeriesComp((prev) => prev.filter((_, i) => i !== sIdx));
  }, []);

  // 🔹 Función que realmente guarda la sesión
  const guardarSesionReal = useCallback(() => {
    if (esCompuesto) {
      return guardarSeriesCompuesto(seriesComp);
    }
    return guardarSeries();
  }, [esCompuesto, guardarSeriesCompuesto, guardarSeries, seriesComp]);

  // 🔹 Handler del botón "guardar sesión"
  const handleGuardar = useCallback(() => {
    if (nivelEstres == null) {
      setEstresModalVisible(true);
      return;
    }
    guardarSesionReal();
  }, [nivelEstres, guardarSesionReal]);

  // 🔹 Confirmación desde el modal de nivel de estrés
  const handleConfirmNivelEstres = useCallback(() => {
    if (nivelEstres == null) {
      Toast.show({
        type: "info",
        text1: "Selecciona un nivel",
        text2: "Elige un nivel de esfuerzo antes de guardar.",
      });
      return;
    }

    setEstresModalVisible(false);
    guardarSesionReal();
  }, [nivelEstres, guardarSesionReal]);

  // 🔹 Ir al paywall Premium
  const handleGoToPayment = useCallback(() => {
    navigation.navigate("Perfil", {
      screen: "PremiumPayment",
    });
  }, [navigation]);

  // 🔹 Handlers para funcionalidades Premium (Chat y Coach)
  const handleOpenChat = useCallback(() => {
    if (!isPremium) {
      handleGoToPayment();
      return;
    }
    setQaVisible(true);
  }, [isPremium, handleGoToPayment]);

  const handleOpenCoach = useCallback(() => {
    if (!isPremium) {
      handleGoToPayment();
      return;
    }
    mostrarCoach();
  }, [isPremium, handleGoToPayment, mostrarCoach]);

  if (!ejercicio) {
    return (
      <View
        className="min-h-screen items-center justify-center"
        style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}
      >
        <Text className={isDark ? "text-[#e5e7eb]" : "text-gray-700"}>
          Cargando ejercicio...
        </Text>
      </View>
    );
  }

  return (
    <View
      className="flex-1 relative"
      style={{ backgroundColor: isDark ? "#0b1220" : "#ffffff" }}
    >
      <ScrollView
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 140,
          paddingTop: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full max-w-sm aspect-square relative p-5">
          {esCompuesto && imagenesCompuesto.length > 0 ? (
            <View className="px-[40px]">
              <ImageSelector
                images={imagenesCompuesto}
                alt={ejercicio.ejercicioCompuesto?.nombre || "Compuesto"}
              />
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

          esCardio={esCardio}
        />



        {esCompuesto ? (
          <View className="w-full max-w-[900px]">
            <SeriesCompuestasInput
              componentes={componentes}
              series={seriesComp}
              onChange={onChangeComp}
            />
          </View>
        ) : (
          <SeriesInput
            series={series}
            onChange={handleInputChange}

            esCardio={esCardio}
          />
        )}



        {/* Botones Añadir/Quitar serie + Guardar */}
        <View className="w-full max-w-md mt-3 flex-row gap-3 items-center">
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

          <TouchableOpacity
            onPress={() => {
              if (esCompuesto) {
                if (seriesComp.length > 1)
                  removeSerieComp(seriesComp.length - 1);
              } else {
                quitar();
              }
            }}
            disabled={
              guardando || (esCompuesto ? seriesComp.length <= 1 : series.length <= 1)
            }
            className={
              "p-2 rounded-full shadow-md items-center justify-center " +
              (isDark ? "bg-white/10" : "bg-zinc-800")
            }
            style={{
              opacity:
                guardando ||
                  (esCompuesto ? seriesComp.length <= 1 : series.length <= 1)
                  ? 0.6
                  : 1,
            }}
            activeOpacity={0.85}
          >
            <MinusCircle size={20} color={isDark ? "#e5e7eb" : "#fff"} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleGuardar}
            disabled={guardando}
            className="p-2 rounded-full items-center justify-center shadow-md"
            style={{
              backgroundColor: "#22c55e",
              opacity: guardando ? 0.6 : 1,
            }}
            activeOpacity={0.9}
          >
            {guardando ? (
              <Loader2 size={18} color="#fff" className="animate-spin" />
            ) : (
              <Check size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ✅ FAB lateral con animación */}
      <View
        pointerEvents="box-none"
        className="absolute right-5"
        style={{ bottom: 40, zIndex: 20 }}
      >
        <View className="items-end">
          {/* Acciones (se renderizan siempre, pero animan a 0 y no capturan taps) */}
          <Animated.View
            pointerEvents={fabOpen ? "auto" : "none"}
            style={{
              marginBottom: 12,
              alignItems: "flex-end",
              opacity: fabAnim,
              transform: [
                {
                  translateY: fabAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 0],
                  }),
                },
              ],
            }}
          >
            <View className="flex-col gap-4 items-end">
              {/* Pregunta IA (premium) */}
              <Animated.View style={getItemAnimStyle(3)}>
                <TouchableOpacity
                  onPress={handleOpenChat}
                  disabled={guardando || !ejercicio?.id}
                  activeOpacity={0.88}
                  style={{
                    opacity: guardando ? 0.6 : isPremium ? 1 : 0.65,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.08)", // ✅ visible en light sobre fondo blanco
                  }}
                  className={"p-4 rounded-full items-center justify-center "}
                >
                  <Sparkles size={22} color={isDark ? "#e5e7eb" : "#111827"} />
                </TouchableOpacity>
              </Animated.View>

              {/* Coach (premium) */}
              <Animated.View style={getItemAnimStyle(2)}>
                <TouchableOpacity
                  onPress={handleOpenCoach}
                  disabled={guardando}
                  activeOpacity={0.88}
                  style={{
                    opacity: guardando ? 0.6 : isPremium ? 1 : 0.65,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.08)",
                  }}
                  className={"p-4 rounded-full items-center justify-center "}
                >
                  <Dumbbell size={22} color={isDark ? "#e5e7eb" : "#111827"} />
                </TouchableOpacity>
              </Animated.View>

              {/* Info (solo simples) */}
              {!esCompuesto && (
                <Animated.View style={getItemAnimStyle(1)}>
                  <TouchableOpacity
                    onPress={() => setInfoVisible((v) => !v)}
                    disabled={guardando}
                    activeOpacity={0.88}
                    style={{
                      opacity: guardando ? 0.6 : 1,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.10)"
                        : "rgba(0,0,0,0.08)",
                    }}
                    className={"p-4 rounded-full items-center justify-center "}
                  >
                    <Info size={22} color={isDark ? "#e5e7eb" : "#111827"} />
                  </TouchableOpacity>
                </Animated.View>
              )}

              {/* Estadísticas */}
              <Animated.View style={getItemAnimStyle(0)}>
                <TouchableOpacity
                  onPress={() => setEstadisticaVisible((v) => !v)}
                  disabled={guardando}
                  activeOpacity={0.88}
                  style={{
                    opacity: guardando ? 0.6 : 1,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.08)",
                  }}
                  className={"p-4 rounded-full items-center justify-center "}
                >
                  <LineChart size={22} color={isDark ? "#e5e7eb" : "#111827"} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>

          {/* Botón toggle */}
          <TouchableOpacity
            onPress={() => setFabOpen((v) => !v)}
            disabled={guardando}
            activeOpacity={0.9}
            style={{
              opacity: guardando ? 0.6 : 1,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.10)"
                : "rgba(0,0,0,0.10)", // ✅ más contraste en light
            }}
            className={"p-3 rounded-full items-center justify-center mr-1 "}
          >
            {fabOpen ? (
              <ChevronDown size={22} color={isDark ? "#e5e7eb" : "#111827"} />
            ) : (
              <ChevronUp size={22} color={isDark ? "#e5e7eb" : "#111827"} />
            )}
          </TouchableOpacity>
        </View>
      </View>


      {esCompuesto ? null : (
        <PanelInfo
          visible={infoVisible}
          onClose={() => setInfoVisible(false)}
          materiales={
            esCompuesto
              ? (ejercicio.ejercicioCompuesto?.ejerciciosComponentes ?? []).flatMap(
                (c: any) => c.ejercicio?.equipamientoNecesario ?? []
              )
              : ejercicio.equipamientoNecesario || []
          }
          instrucciones={ejercicio.instrucciones || []}
          nombreEjercicio={ejercicio.nombre}
        />
      )}

      {esCompuesto ? (
        <PanelEstadisticasCompuestos
          visible={estadisticaVisible}
          onClose={() => setEstadisticaVisible(false)}
          ultimaSesion={ejercicio?.ultimaSesion ?? null}
        />
      ) : (
        <PanelEstadisticas
          visible={estadisticaVisible}
          onClose={() => setEstadisticaVisible(false)}
          detallesSeries={detallesSeriesSimples}
          esCardio={ejercicio.grupoMuscular === "CARDIO"}
        />

      )}

      {descansando && (
        <DescansoModal
          visible={descansando}
          tiempo={tiempoRestante || 0}
          onFinalizar={finalizarDescanso}
        />
      )}

      {festejo && (
        <CelebracionModal
          visible={festejo}
          experiencia={experienciaPlus}
          calorias={calorias.current}
        />
      )}

      <NivelEstresModal
        visible={estresModalVisible}
        nivelEstres={nivelEstres}
        onChangeNivelEstres={setNivelEstres}
        onConfirm={handleConfirmNivelEstres}
        onClose={() => setEstresModalVisible(false)}
        loading={guardando}
      />

      <NoAdsModal
        visible={noAdsModalVisible}
        loading={noAdsRetrying}
        onRetry={() => {
          if (esCompuesto) {
            reintentarAnuncioCompuesto(seriesComp as any);
          } else {
            reintentarAnuncioSimple();
          }
        }}
        onGoPremium={() => {
          setNoAdsModalVisible(false);
          handleGoToPayment();
        }}
        onClose={() => setNoAdsModalVisible(false)}
      />

      <CoachFeedbackModal
        visible={coachVisible}
        loading={coachLoading}
        coach={coachData}
        onClose={ocultarCoach}
        onGoPremium={handleGoToPayment}
      />

      <ExerciseQuestionModal
        visible={qaVisible}
        onClose={() => setQaVisible(false)}
        esCompuesto={esCompuesto}
        ejercicioId={!esCompuesto ? ejercicio.id : undefined}
        ejercicioCompuestoId={
          esCompuesto
            ? ejercicio.ejercicioCompuestoId || ejercicio.ejercicioCompuesto?.id
            : undefined
        }
      />
    </View>
  );
}

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
  Animated,
  Easing,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { usePreventRemove } from "@react-navigation/native";
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
import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import AlertaConfirmacion from "@/shared/components/ui/AlertaConfirmacion";
import { useOverlayPresenter } from "@/shared/overlay/useOverlayPresenter";

/* ---------------- Vista (sólo UI) ---------------- */
export default function VistaEjercicio() {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<Record<string, Params>, string>>();

  const {
    slug,
    asignadoId,
    ejercicio: ejercicioPrefetch,
    esSiguiente = false,
  } = ((route.params ?? {}) as Params & { esSiguiente?: boolean });

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [qaVisible, setQaVisible] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const [confirmExitVisible, setConfirmExitVisible] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  const exitActionRef = useRef<null | (() => void)>(null);
  const ignoreExitGuardRef = useRef(false);
  const initialSimpleRef = useRef("");
  const initialCompRef = useRef("");
  const { present, dismiss } = useOverlayPresenter();

  const fabAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fabAnim, {
      toValue: fabOpen ? 1 : 0,
      duration: fabOpen ? 220 : 180,
      easing: fabOpen ? Easing.out(Easing.cubic) : Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [fabOpen, fabAnim]);

  const getItemAnimStyle = (index: number) => {
    const delayFactor = index * 0.08;

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
    setFestejo,
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

    nivelEstres,
    setNivelEstres,

    coachData,
    coachLoading,
    coachVisible,
    mostrarCoach,
    ocultarCoach,
    coachAutoDisabled,
    setCoachAutoDisabledPersist,
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
          ? `https://res.cloudinary.com/dcn4vq1n4/image/upload/f_auto,q_auto/ejercicios/${c.ejercicio.idGif}.gif`
          : null
      )
      .filter(Boolean) as string[];
  }, [esCompuesto, ejercicio]);

  const [seriesComp, setSeriesComp] = useState<RegistroPayload[][]>(() => {
    if (!esCompuesto || componentes.length === 0) return [];
    return [componentes.map((c) => ({ ejercicioId: c.ejercicioId }))];
  });

  const [estresModalVisible, setEstresModalVisible] = useState(false);

  // Override local prescription after coach update (without refetching the exercise)
  const [prescripcionOverride, setPrescripcionOverride] = useState<{
    seriesSugeridas?: number | null;
    repeticionesSugeridas?: number | null;
    pesoSugerido?: number | null;
  } | null>(null);

  const handlePrescripcionActualizada = useCallback(
    (updated: {
      seriesSugeridas?: number | null;
      repeticionesSugeridas?: number | null;
      pesoSugerido?: number | null;
    }) => {
      setPrescripcionOverride(updated);
    },
    []
  );

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

  const guardarSesionReal = useCallback(async () => {
    if (esCompuesto) {
      return await guardarSeriesCompuesto(seriesComp);
    }
    return await guardarSeries();
  }, [esCompuesto, guardarSeriesCompuesto, guardarSeries, seriesComp]);

  const handleGuardar = useCallback(async () => {
    if (nivelEstres == null) {
      setEstresModalVisible(true);
      return;
    }

    const ok = await guardarSesionReal();
    if (!ok) return;

    ignoreExitGuardRef.current = true;
    setHasSaved(true);
    setFestejo(true);
  }, [nivelEstres, guardarSesionReal]);

  const handleConfirmNivelEstres = useCallback(async () => {
    if (nivelEstres == null) {
      Toast.show({
        type: "info",
        text1: "Selecciona un nivel",
        text2: "Elige un nivel de esfuerzo antes de guardar.",
      });
      return;
    }

    setEstresModalVisible(false);

    const ok = await guardarSesionReal();
    if (!ok) return;

    ignoreExitGuardRef.current = true;
    setHasSaved(true);
    present(
      <CelebracionModal
        series={esCompuesto ? [] : series}
        seriesComp={esCompuesto ? seriesComp : []}
        nivelEstres={nivelEstres}
        esCompuesto={esCompuesto}
        coachData={coachData?.data}
        onFinish={() => {
          dismiss();
          setFestejo(false);
          navigation.goBack();
        }}
      />
    );
    setFestejo(true);
  }, [nivelEstres, guardarSesionReal]);

  const handleGoToPayment = useCallback(() => {
    navigation.navigate("Perfil", {
      screen: "PremiumPayment",
    });
  }, [navigation]);

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

  const simpleSnapshot = useMemo(() => {
    return JSON.stringify(
      (series ?? []).map((s: any) => ({
        repeticiones: s?.reps ?? "",
        pesoKg: s?.peso ?? "",
        tiempoSeg: s?.tiempoSeg ?? "",
      }))
    );
  }, [series]);

  const compSnapshot = useMemo(() => {
    return JSON.stringify(
      (seriesComp ?? []).map((serie) =>
        serie.map((r) => ({
          ejercicioId: r?.ejercicioId,
          repeticiones: r?.repeticiones ?? "",
          pesoKg: r?.pesoKg ?? "",
        }))
      )
    );
  }, [seriesComp]);

  useEffect(() => {
    setHasSaved(false);
    ignoreExitGuardRef.current = false;
    initialSimpleRef.current = "";
    initialCompRef.current = "";
  }, [slug, asignadoId, ejercicio?.id, ejercicio?.ejercicioCompuestoId]);

  useEffect(() => {
    if (!ejercicio) return;

    if (esCompuesto) {
      if (!initialCompRef.current && compSnapshot !== "[]") {
        initialCompRef.current = compSnapshot;
      }
    } else {
      if (!initialSimpleRef.current && simpleSnapshot !== "[]") {
        initialSimpleRef.current = simpleSnapshot;
      }
    }
  }, [ejercicio, esCompuesto, simpleSnapshot, compSnapshot]);

  const hayCambiosPendientes = useMemo(() => {
    if (!ejercicio || hasSaved) return false;

    if (esCompuesto) {
      if (!initialCompRef.current) return false;
      return compSnapshot !== initialCompRef.current;
    }

    if (!initialSimpleRef.current) return false;
    return simpleSnapshot !== initialSimpleRef.current;
  }, [ejercicio, hasSaved, esCompuesto, simpleSnapshot, compSnapshot]);

  const debeAdvertirSalida =
    !!esSiguiente && hayCambiosPendientes && !hasSaved && !guardando;

  usePreventRemove(debeAdvertirSalida, ({ data }) => {
    if (ignoreExitGuardRef.current) return;

    exitActionRef.current = () => navigation.dispatch(data.action);
    setConfirmExitVisible(true);
  });

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
      style={{ backgroundColor: isDark ? "#080D17" : "#ffffff" }}
    >
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 140,
          paddingTop: 16,
        }}
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
              ? undefined
              : (prescripcionOverride?.seriesSugeridas ?? ejercicio.ejercicioAsignado?.seriesSugeridas)
          }
          repeticiones={
            esCompuesto
              ? undefined
              : (prescripcionOverride?.repeticionesSugeridas ?? ejercicio.ejercicioAsignado?.repeticionesSugeridas)
          }
          peso={
            esCompuesto
              ? undefined
              : (prescripcionOverride?.pesoSugerido ?? ejercicio.ejercicioAsignado?.pesoSugerido)
          }
          esCardio={esCardio}
          esCompuesto={esCompuesto}
          nombreCompuesto={ejercicio.ejercicioCompuesto?.nombre}
          tipoCompuesto={ejercicio.ejercicioCompuesto?.tipoCompuesto}
          cantidadEjercicios={
            ejercicio.ejercicioCompuesto?.ejerciciosComponentes?.length
          }
          descansoSeg={ejercicio.ejercicioAsignado?.descansoSeg}
          coachObjetivo={!esCompuesto ? coachData?.data?.objetivoSesion : null}
          asignadoId={asignadoId ? Number(asignadoId) : null}
          onActualizar={handlePrescripcionActualizada}
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

        <View className="w-full max-w-md mt-4 gap-3">
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={esCompuesto ? addSerieComp : agregar}
              disabled={guardando}
              activeOpacity={0.88}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#111827",
                opacity: guardando ? 0.45 : 1,
              }}
            >
              <PlusCircle size={18} color={isDark ? "#e5e7eb" : "#fff"} />
              <Text
                style={{
                  color: isDark ? "#e5e7eb" : "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Añadir serie
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                if (esCompuesto) {
                  if (seriesComp.length > 1) removeSerieComp(seriesComp.length - 1);
                } else {
                  quitar();
                }
              }}
              disabled={
                guardando ||
                (esCompuesto ? seriesComp.length <= 1 : series.length <= 1)
              }
              activeOpacity={0.88}
              className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl px-4 py-3"
              style={{
                backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#111827",
                opacity:
                  guardando ||
                    (esCompuesto ? seriesComp.length <= 1 : series.length <= 1)
                    ? 0.45
                    : 1,
              }}
            >
              <MinusCircle size={18} color={isDark ? "#e5e7eb" : "#fff"} />
              <Text
                style={{
                  color: isDark ? "#e5e7eb" : "#fff",
                  fontSize: 14,
                  fontWeight: "700",
                }}
              >
                Quitar serie
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleGuardar}
            disabled={guardando}
            activeOpacity={0.9}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl px-4 py-4 shadow-md"
            style={{
              backgroundColor: "#22c55e",
              opacity: guardando ? 0.7 : 1,
            }}
          >
            {guardando ? (
              <>
                <Loader2 size={18} color="#fff" className="animate-spin" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "800",
                  }}
                >
                  Guardando...
                </Text>
              </>
            ) : (
              <>
                <Check size={20} color="#fff" />
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: "800",
                  }}
                >
                  Guardar sesión
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>

      <View
        pointerEvents="box-none"
        className="absolute right-5"
        style={{ bottom: 130, zIndex: 20 }}
      >
        <View className="items-end">
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
              <Animated.View style={getItemAnimStyle(3)}>
                <TouchableOpacity
                  onPress={handleOpenChat}
                  disabled={guardando || !ejercicio?.id}
                  activeOpacity={0.88}
                  style={{
                    opacity: guardando ? 0.6 : isPremium ? 1 : 0.65,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.10)"
                      : "rgba(0,0,0,0.08)",
                  }}
                  className={"p-4 rounded-full items-center justify-center "}
                >
                  <Sparkles size={22} color={isDark ? "#e5e7eb" : "#111827"} />
                </TouchableOpacity>
              </Animated.View>

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

          <TouchableOpacity
            onPress={() => setFabOpen((v) => !v)}
            disabled={guardando}
            activeOpacity={0.9}
            style={{
              opacity: guardando ? 0.6 : 1,
              backgroundColor: isDark ? "#1a2538" : "#111827",
            }}
            className={"p-3 rounded-full items-center justify-center mr-1 "}
          >
            {fabOpen ? (
              <ChevronDown size={22} color="#e5e7eb" />
            ) : (
              <ChevronUp size={22} color="#e5e7eb" />
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

      <NivelEstresModal
        visible={estresModalVisible}
        nivelEstres={nivelEstres}
        onChangeNivelEstres={setNivelEstres}
        onConfirm={handleConfirmNivelEstres}
        onClose={() => setEstresModalVisible(false)}
        loading={guardando}
      />

      <CoachFeedbackModal
        visible={coachVisible}
        loading={coachLoading}
        coach={coachData}
        onClose={ocultarCoach}
        onGoPremium={handleGoToPayment}
        autoDisabled={coachAutoDisabled}
        onToggleAutoDisabled={setCoachAutoDisabledPersist}
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

      <AlertaConfirmacion
        visible={confirmExitVisible}
        titulo="Salir sin completar"
        mensaje="Has empezado el siguiente ejercicio, pero aún no lo has marcado como completado. ¿Seguro que quieres salir?"
        textoCancelar="Seguir aquí"
        textoConfirmar="Salir"
        onCancelar={() => {
          exitActionRef.current = null;
          setConfirmExitVisible(false);
        }}
        onConfirmar={() => {
          setConfirmExitVisible(false);
          ignoreExitGuardRef.current = true;
          exitActionRef.current?.();
          exitActionRef.current = null;
        }}
      />
    </View>
  );
}
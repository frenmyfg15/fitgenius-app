import React, { useMemo, useState } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";

/* ---- Componentes UI ---- */
import RutinaControls from "@/shared/components/rutinas-manuales/RutinaControls";
import FormularioEjercicio from "@/shared/components/rutinas-manuales/FormularioEjercicio";
import FormularioCompuesto from "@/shared/components/rutinas-manuales/FormularioCompuesto";
import ControlesCompuesto from "@/shared/components/rutinas-manuales/ControlesCompuesto";
import AlertaConfirmacion from "@/shared/components/ui/AlertaConfirmacion";
import BuscadorEjercicio from "@/shared/components/ui/BuscadorEjercicio";
import FormularioNombreRutina from "@/shared/components/rutinas-manuales/FormularioNombreRutina";
import RutinaQuestionModal from "@/shared/components/rutinas-manuales/RutinaQuestionModal";
import { useCrearRutinaState } from "@/shared/hooks/useCrearRutinaState";
import {
  EjercicioAsignadoInput,
  EjercicioVisualInfo,
} from "@/features/type/crearRutina";

import PremiumUpsellModal from "@/shared/components/premium/PremiumUpsellModal";
import DiaRutinaView from "@/shared/components/rutinas-manuales/DiaRutinaView";

/* ---------- Overlay reutilizable ---------- */
const Overlay: React.FC<{
  children: React.ReactNode;
  dim?: number;
  padded?: boolean;
}> = ({ children, dim = 0.45, padded = true }) => (
  <View
    style={[
      StyleSheet.absoluteFillObject,
      {
        backgroundColor: `rgba(0,0,0,${dim})`,
        justifyContent: "center",
        alignItems: "center",
        padding: padded ? 16 : 0,
      },
    ]}
  >
    {children}
  </View>
);

/* ---------- Normalizador detalles ejercicio ---------- */
type DetallesSeguro = {
  seriesSugeridas: number;
  repeticionesSugeridas: number;
  pesoSugerido: number;
  descansoSeg: number;
  notaIA: string;
};

const normalizarDetalles = (detalles: any | undefined): DetallesSeguro => ({
  seriesSugeridas: Number(detalles?.seriesSugeridas ?? 3),
  repeticionesSugeridas: Number(detalles?.repeticionesSugeridas ?? 10),
  pesoSugerido: Number(detalles?.pesoSugerido ?? 0),
  descansoSeg: Number(detalles?.descansoSeg ?? 0),
  notaIA: String(detalles?.notaIA ?? ""),
});

export default function CrearRutinaScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const h = useCrearRutinaState();
  const selectedOrden =
    h.selectedIndex !== null && h.ejerciciosDia[h.selectedIndex]
      ? h.ejerciciosDia[h.selectedIndex].orden
      : null;

  const [chatVisible, setChatVisible] = useState(false);

  const rutinaJson = useMemo(() => {
    return {
      nombre: h.state.nombre,
      descripcion: h.state.descripcion,
      dias: h.state.dias,
    };
  }, [h.state.nombre, h.state.descripcion, h.state.dias]);

  const hasRutina = useMemo(() => {
    const dias = h.state.dias ?? [];
    if (!Array.isArray(dias) || dias.length === 0) return false;
    return dias.some(
      (d: any) => Array.isArray(d?.ejercicios) && d.ejercicios.length > 0
    );
  }, [h.state.dias]);

  return (
    <View style={{ flex: 1, backgroundColor: h.ui.bg, position: "relative" }}>
      <ScrollView
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        {h.isEdit ? (
          <View
            style={{
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "rgba(245,158,11,0.45)",
              backgroundColor: isDark ? "rgba(245,158,11,0.12)" : "#fff7ed",
              marginBottom: 16,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{
                    color: isDark ? "#fde68a" : "#92400e",
                    fontWeight: "800",
                  }}
                >
                  Editando rutina:{" "}
                  <Text style={{ fontWeight: "900" }}>
                    {h.state.nombre || "Sin título"}
                  </Text>
                </Text>
                <Text
                  style={{
                    marginTop: 4,
                    color: isDark ? "#fbbf24" : "#b45309",
                    fontSize: 12,
                  }}
                >
                  Realiza cambios y guarda cuando estés listo. Puedes cancelar
                  para volver al modo creación.
                </Text>
              </View>

              <Pressable
                onPress={h.handleCancelarEdicion}
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "#ffffff",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(255,255,255,0.12)" : "#fcd34d",
                  alignSelf: "flex-start",
                }}
                accessibilityLabel="Cancelar edición"
              >
                <Text
                  style={{
                    color: isDark ? "#fde68a" : "#92400e",
                    fontWeight: "700",
                  }}
                >
                  Cancelar
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            paddingVertical: 10,
            marginBottom: 8,
          }}
        >
          {h.DIAS.map((d) => {
            const active = d === h.diaSelect;
            return (
              <Pressable
                key={d}
                onPress={() => {
                  h.setDiaSelect(d);
                  h.setSelectedIndex(null);
                }}
                style={{
                  position: "relative",
                  borderRadius: 999,
                  overflow: "hidden",
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  minWidth: 52,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {active ? (
                  <LinearGradient
                    colors={[
                      "rgb(0,255,64)",
                      "rgb(94,230,157)",
                      "rgb(178,0,255)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 999,
                      backgroundColor: "rgba(255,255,255,0.06)",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.15)",
                    }}
                  />
                )}

                <Text
                  style={{
                    color: active ? "#fff" : h.ui.textPrimary,
                    fontWeight: "700",
                    fontSize: 13,
                    textAlign: "center",
                    letterSpacing: 0.4,
                  }}
                >
                  {d[0] + d.slice(1).toLowerCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ flex: 1, minHeight: 0 }}>
        <DiaRutinaView
          dia={h.diaSelect}
          ejercicios={h.ejerciciosDia}
          selectedOrden={selectedOrden}
          dispatch={h.dispatch}
          onEdit={(ej) => {
            const idx = h.ejerciciosDia.findIndex((x) => x.orden === ej.orden);
            h.setSelectedIndex(idx >= 0 ? idx : null);

            if ("compuesto" in ej && (ej as any).compuesto) {
              h.setEditarCompuesto({
                compuestoId: (ej as any).ejerciciosCompuestos?.[0]
                  ?.ejercicioCompuestoId!,
                orden: ej.orden,
                ejercicios: (ej as any).ejerciciosCompuestos!,
                nombre: (ej as any).nombreCompuesto!,
                tipo: (ej as any).tipoCompuesto!,
                descansoSeg: (ej as any).descansoCompuesto ?? 0,
              });
            } else {
              h.setEditarCompuesto(null);
              h.setEjercicioSeleccionado({
                id: (ej as any).ejercicioId!,
                info: (ej as any).ejercicioInfo!,
                orden: ej.orden,
                initialValues: {
                  seriesSugeridas: (ej as any).seriesSugeridas,
                  repeticionesSugeridas: (ej as any).repeticionesSugeridas,
                  pesoSugerido: (ej as any).pesoSugerido,
                  descansoSeg: (ej as any).descansoSeg,
                  notaIA: (ej as any).notaIA,
                },
              });
              h.setEditandoEjercicio(true);
            }
          }}
          onSelectionChange={(orden, _item) => {
            if (orden == null) {
              h.setSelectedIndex(null);
              return;
            }
            const idx = h.ejerciciosDia.findIndex((x) => x.orden === orden);
            h.setSelectedIndex(idx >= 0 ? idx : null);
          }}
        />
      </View>

      <RutinaQuestionModal
        visible={chatVisible}
        onClose={() => setChatVisible(false)}
        rutinaJson={rutinaJson}
      />

      {h.modoCompuesto && h.compuestoTemporal.length > 0 && (
        <ControlesCompuesto
          compuesto={h.compuestoTemporal}
          onAnadir={h.iniciarCompuesto}
          onCancelar={() => {
            h.setModoCompuesto(false);
            h.setCompuestoTemporal([]);
          }}
          onConfirmar={h.confirmarCompuesto}
          disabled={
            h.mostrarFormularioCompuesto || !!h.ejercicioEnCompuestoActual
          }
        />
      )}

      <RutinaControls
        onPreguntarRutina={() => {
          if (!hasRutina) {
            Toast.show({
              type: "info",
              text1: "Rutina vacía",
              text2:
                "Añade al menos un ejercicio (en cualquier día) para poder preguntar.",
            });
            return;
          }
          setChatVisible(true);
        }}
        onCrear={() => h.setMostrarFormularioNombre(true)}
        creando={h.loading}
        puedeCrear={h.state.dias.length > 0}
        onAgregarEjercicio={() => {
          h.setMostrarBuscador(true);
          h.setEditandoEjercicio(false);
          h.setEditarCompuesto(null);
        }}
        onAgregarCompuesto={h.iniciarCompuesto}
        onVaciar={() => h.setConfirmClear(true)}
        puedeVaciar={h.state.dias.length > 0}
        onCopiarDia={() => {
          h.dispatch({
            type: "COPY_DIA",
            payload: { diaSemana: h.diaSelect },
          });
        }}
        onPegarAppend={() => {
          h.dispatch({
            type: "PASTE_DIA",
            payload: { diaSemana: h.diaSelect, mode: "append" },
          });
        }}
        onPegarReplace={() => {
          h.dispatch({
            type: "PASTE_DIA",
            payload: { diaSemana: h.diaSelect, mode: "replace" },
          });
        }}
        puedePegar={h.puedePegar}
        haySeleccion={h.haySeleccion}
        onEditarSeleccion={h.handleEditarSeleccion}
        onEliminarSeleccion={h.handleEliminarSeleccion}
        onSubirSeleccion={h.handleSubirSeleccion}
        onBajarSeleccion={h.handleBajarSeleccion}
        puedeSubir={h.puedeSubir}
        puedeBajar={h.puedeBajar}
        modoEdicion={h.isEdit}
      />

      {h.mostrarBuscador ? (
        <Overlay dim={0} padded={false}>
          <View style={StyleSheet.absoluteFillObject as any}>
            <BuscadorEjercicio
              onClose={() => {
                h.setMostrarBuscador(false);
                if (!h.modoCompuesto) h.setCompuestoTemporal([]);
              }}
              onSelect={(id, ejercicio) => {
                if (!ejercicio) return;
                const info: EjercicioVisualInfo = {
                  idGif: ejercicio.idGif,
                  nombre: ejercicio.nombre,
                  grupoMuscular: ejercicio.grupoMuscular,
                  tipoEjercicio: ejercicio.tipoEjercicio,
                };

                if (h.modoCompuesto) {
                  const ya = h.compuestoTemporal.find((e) => e.id === id);
                  if (ya) {
                    return;
                  }
                  h.setEjercicioEnCompuestoActual({ id, info });
                } else {
                  const orden =
                    h.state.dias.find((d) => d.diaSemana === h.diaSelect)
                      ?.ejercicios.length ?? 0;
                  h.setEjercicioSeleccionado({
                    id,
                    info,
                    orden: orden + 1,
                  });
                  h.setEditandoEjercicio(false);
                  h.setEditarCompuesto(null);
                }
                h.setMostrarBuscador(false);
              }}
            />
          </View>
        </Overlay>
      ) : null}

      {h.mostrarFormularioNombre && (
        <FormularioNombreRutina
          visible={true}
          nombreInicial={h.state.nombre}
          descripcionInicial={h.state.descripcion}
          onNombreInput={(v) => h.dispatch({ type: "SET_NOMBRE", payload: v })}
          onDescripcionInput={(v) =>
            h.dispatch({ type: "SET_DESCRIPCION", payload: v })
          }
          onCancel={() => h.setMostrarFormularioNombre(false)}
          onConfirm={(nombre, descripcion) => {
            h.dispatch({ type: "SET_NOMBRE", payload: nombre });
            h.dispatch({ type: "SET_DESCRIPCION", payload: descripcion || "" });
            h.setMostrarFormularioNombre(false);
            h.handleCrearRutina();
          }}
        />
      )}

      {h.ejercicioSeleccionado && !h.editarCompuesto ? (
        <FormularioEjercicio
          visible={!!h.ejercicioSeleccionado}
          ejercicioId={h.ejercicioSeleccionado.id}
          orden={h.ejercicioSeleccionado.orden}
          initialValues={h.ejercicioSeleccionado.initialValues}
          esParteDeCompuesto={false}
          esCardio={h.ejercicioSeleccionado.info.grupoMuscular === "CARDIO"}
          onClose={() => h.setEjercicioSeleccionado(null)}
          onConfirm={(data) => {
            h.dispatch({
              type: h.editandoEjercicio ? "UPDATE_EJERCICIO" : "ADD_EJERCICIO",
              payload: {
                diaSemana: h.diaSelect,
                ejercicio: {
                  ...data,
                  orden: h.ejercicioSeleccionado!.orden,
                  ejercicioId: h.ejercicioSeleccionado!.id,
                  ejercicioInfo: h.ejercicioSeleccionado!.info,
                },
              },
            });
            h.setEjercicioSeleccionado(null);
            h.setSelectedIndex(null);
          }}
        />
      ) : null}

      {h.modoCompuesto && h.ejercicioEnCompuestoActual ? (
        <FormularioEjercicio
          visible={!!h.ejercicioEnCompuestoActual}
          ejercicioId={h.ejercicioEnCompuestoActual!.id}
          esParteDeCompuesto
          esCardio={h.ejercicioEnCompuestoActual.info.grupoMuscular === "CARDIO"}
          onClose={() => h.setEjercicioEnCompuestoActual(null)}
          onConfirm={(detalles) => {
            const ej = h.ejercicioEnCompuestoActual!;
            h.setCompuestoTemporal((prev) => [
              ...prev,
              { id: ej.id, info: ej.info, detalles },
            ]);
            h.setEjercicioEnCompuestoActual(null);
          }}
        />
      ) : null}

      {h.mostrarFormularioCompuesto ? (
        <FormularioCompuesto
          visible={h.mostrarFormularioCompuesto}
          onCancel={() => h.setMostrarFormularioCompuesto(false)}
          onConfirm={(nombre, tipo, descansoSeg) => {
            const compuestoId = Date.now();

            const ejerciciosCompuestos: EjercicioAsignadoInput[] =
              (h.compuestoTemporal ?? []).map((e, i) => {
                const d = normalizarDetalles((e as any).detalles);

                return {
                  ejercicioId: e.id,
                  orden: i + 1,
                  ejercicioInfo: e.info,
                  seriesSugeridas: d.seriesSugeridas,
                  repeticionesSugeridas: d.repeticionesSugeridas,
                  pesoSugerido: d.pesoSugerido,
                  descansoSeg: 0,
                  notaIA: d.notaIA,
                  ejercicioCompuestoId: compuestoId,
                } as any;
              });

            if (ejerciciosCompuestos.length === 0) {
              return;
            }

            h.dispatch({
              type: "ADD_EJERCICIO_COMPUESTO",
              payload: {
                diaSemana: h.diaSelect,
                ejercicios: ejerciciosCompuestos,
                descansoSeg,
                compuestoId,
                nombre,
                tipo,
              },
            });

            h.setCompuestoTemporal([]);
            h.setModoCompuesto(false);
            h.setMostrarFormularioCompuesto(false);
          }}
        />
      ) : null}

      <AlertaConfirmacion
        visible={h.confirmClear}
        titulo="Vaciar rutina"
        mensaje="¿Estás seguro de que quieres vaciar toda la rutina? Esta acción no se puede deshacer."
        onCancelar={() => h.setConfirmClear(false)}
        onConfirmar={() => {
          const diasPresentes = (h.state.dias ?? []).map((d) => d.diaSemana);
          diasPresentes.forEach((ds) => {
            h.dispatch({
              type: "REORDER_EJERCICIOS",
              payload: { diaSemana: ds, ejercicios: [] },
            });
          });
          h.dispatch({ type: "CLEAR" });
          AsyncStorage.removeItem("crearRutinaState");
          h.setConfirmClear(false);
          h.setSelectedIndex(null);
        }}
        textoConfirmar="Sí, vaciar"
        textoCancelar="Cancelar"
      />

      <PremiumUpsellModal
        visible={h.premiumModalVisible}
        onClose={() => h.setPremiumModalVisible(false)}
        featureName={h.isEdit ? "editar rutinas manuales" : "crear rutinas manuales"}
        onGoPremium={() => {
          h.setPremiumModalVisible(false);
        }}
      />
    </View>
  );
}
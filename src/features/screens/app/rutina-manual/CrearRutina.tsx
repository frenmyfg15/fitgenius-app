import React from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";

/* ---- Componentes UI ---- */
import RutinaControls from "@/shared/components/rutinas-manuales/RutinaControls";
import DiaRutinaView from "@/shared/components/rutinas-manuales/DiaRutinaView";
import FormularioEjercicio from "@/shared/components/rutinas-manuales/FormularioEjercicio";
import FormularioCompuesto from "@/shared/components/rutinas-manuales/FormularioCompuesto";
import ControlesCompuesto from "@/shared/components/rutinas-manuales/ControlesCompuesto";
import AlertaConfirmacion from "@/shared/components/ui/AlertaConfirmacion";
import BuscadorEjercicio from "@/shared/components/ui/BuscadorEjercicio";
import FormularioNombreRutina from "@/shared/components/rutinas-manuales/FormularioNombreRutina";
import { useCrearRutinaState } from "@/shared/hooks/useCrearRutinaState";
import { EjercicioAsignadoInput, EjercicioVisualInfo, TipoCompuesto } from "@/features/type/crearRutina";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---- Hook extraído ---- */

/* ---------- Overlay reutilizable ---------- */
const Overlay: React.FC<{ children: React.ReactNode; dim?: number; padded?: boolean }> = ({
  children,
  dim = 0.45,
  padded = true,
}) => (
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

export default function CrearRutinaScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const h = useCrearRutinaState();

  return (
    <View style={{ flex: 1, backgroundColor: h.ui.bg, position: "relative" }}>
      <ScrollView
        contentContainerStyle={{
          padding: 16,
          paddingBottom: 120,
          gap: 16,
          minHeight: Dimensions.get("window").height,
        }}
      >
        {/* Banner edición */}
        {h.isEdit ? (
          <View
            style={{
              borderRadius: 16,
              paddingHorizontal: 14,
              paddingVertical: 12,
              borderWidth: 1,
              borderColor: "rgba(245,158,11,0.45)",
              backgroundColor: isDark ? "rgba(245,158,11,0.12)" : "#fff7ed",
            }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text
                  numberOfLines={1}
                  style={{ color: isDark ? "#fde68a" : "#92400e", fontWeight: "800" }}
                >
                  Editando rutina: <Text style={{ fontWeight: "900" }}>{h.state.nombre || "Sin título"}</Text>
                </Text>
                <Text style={{ marginTop: 4, color: isDark ? "#fbbf24" : "#b45309", fontSize: 12 }}>
                  Realiza cambios y guarda cuando estés listo. Puedes cancelar para volver al modo creación.
                </Text>
              </View>

              <Pressable
                onPress={h.handleCancelarEdicion}
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#ffffff",
                  borderWidth: 1,
                  borderColor: isDark ? "rgba(255,255,255,0.12)" : "#fcd34d",
                  alignSelf: "flex-start",
                }}
                accessibilityLabel="Cancelar edición"
              >
                <Text style={{ color: isDark ? "#fde68a" : "#92400e", fontWeight: "700" }}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {/* Selector de días */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 10,
            paddingVertical: 10,
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
                    colors={["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: "absolute", inset: 0, borderRadius: 999 }}
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

        {/* Lista del día */}
        <DiaRutinaView
          dia={h.diaSelect}
          ejercicios={h.ejerciciosDia}
          onEdit={(ej) => {
            h.setSelectedIndex(ej.orden - 1);
            if ("compuesto" in ej && ej.compuesto) {
              h.setEditarCompuesto({
                compuestoId: ej.ejerciciosCompuestos?.[0]?.ejercicioCompuestoId!,
                orden: ej.orden,
                ejercicios: ej.ejerciciosCompuestos!,
                nombre: ej.nombreCompuesto!,
                tipo: ej.tipoCompuesto!,
                descansoSeg: ej.descansoCompuesto ?? 0,
              });
            } else {
              h.setEditarCompuesto(null);
              h.setEjercicioSeleccionado({
                id: ej.ejercicioId!,
                info: ej.ejercicioInfo!,
                orden: ej.orden,
              });
              h.setEditandoEjercicio(true);
            }
          }}
          dispatch={h.dispatch}
          onSelectionChange={(orden) => h.setSelectedIndex(orden ? orden - 1 : null)}
        />
      </ScrollView>

      {/* Controles del compuesto temporal (no es overlay) */}
      {h.modoCompuesto &&
        h.compuestoTemporal.length > 0 &&
        !h.ejercicioEnCompuestoActual &&
        !h.mostrarFormularioCompuesto && (
          <ControlesCompuesto
            compuesto={h.compuestoTemporal}
            onAnadir={h.iniciarCompuesto}
            onCancelar={() => {
              h.setModoCompuesto(false);
              h.setCompuestoTemporal([]);
            }}
            onConfirmar={h.confirmarCompuesto}
          />
        )}

      {/* Controles globales */}
      <RutinaControls
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
          h.dispatch({ type: "COPY_DIA", payload: { diaSemana: h.diaSelect } });
          h.Toast.show({ type: "success", text1: `Copiado ${h.diaSelect}` });
        }}
        onPegarAppend={() => {
          h.dispatch({ type: "PASTE_DIA", payload: { diaSemana: h.diaSelect, mode: "append" } });
          h.Toast.show({ type: "success", text1: `Pegado en ${h.diaSelect} (agregar)` });
        }}
        onPegarReplace={() => {
          h.dispatch({ type: "PASTE_DIA", payload: { diaSemana: h.diaSelect, mode: "replace" } });
          h.Toast.show({ type: "success", text1: `Pegado en ${h.diaSelect} (reemplazar)` });
        }}
        puedePegar={h.puedePegar}
        haySeleccion={h.haySeleccion}
        onEditarSeleccion={h.handleEditarSeleccion}
        onEliminarSeleccion={h.handleEliminarSeleccion}
        onSubirSeleccion={h.handleSubirSeleccion}
        onBajarSeleccion={h.handleBajarSeleccion}
        puedeSubir={h.puedeSubir}
        puedeBajar={h.puedeBajar}
      />

      {/* ---------- Overlays / Modales ---------- */}

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
                    h.Toast.show({ type: "error", text1: "Este ejercicio ya está en el compuesto" });
                    return;
                  }
                  h.setEjercicioEnCompuestoActual({ id, info });
                } else {
                  const orden = h.state.dias.find((d) => d.diaSemana === h.diaSelect)?.ejercicios.length ?? 0;
                  h.setEjercicioSeleccionado({ id, info, orden: orden + 1 });
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
          nombreInicial={h.state.nombre}
          descripcionInicial={h.state.descripcion}
          onNombreInput={(v) => h.dispatch({ type: 'SET_NOMBRE', payload: v })}
          onDescripcionInput={(v) => h.dispatch({ type: 'SET_DESCRIPCION', payload: v })}
          onCancel={() => h.setMostrarFormularioNombre(false)}
          onConfirm={(nombre, descripcion) => {
            h.dispatch({ type: 'SET_NOMBRE', payload: nombre });
            h.dispatch({ type: 'SET_DESCRIPCION', payload: descripcion || '' });
            h.setMostrarFormularioNombre(false);
            h.handleCrearRutina();
          }}
        />
      )}

      {/* Editor ejercicio simple */}
      {h.ejercicioSeleccionado && !h.editarCompuesto ? (
        <Overlay>
          <FormularioEjercicio
            ejercicioId={h.ejercicioSeleccionado.id}
            esParteDeCompuesto={false}
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
        </Overlay>
      ) : null}

      {/* Editor compuesto (editar existente) */}
      {h.editarCompuesto ? (
        <Overlay>
          <FormularioCompuesto
            editar
            nombreInicial={h.editarCompuesto.nombre}
            tipoInicial={h.editarCompuesto.tipo as TipoCompuesto}
            descansoInicial={h.editarCompuesto.descansoSeg}
            onCancel={() => h.setEditarCompuesto(null)}
            onConfirm={(nombre, tipo, descansoSeg) => {
              h.dispatch({
                type: "UPDATE_COMPUESTO",
                payload: {
                  compuestoId: h.editarCompuesto!.compuestoId,
                  nombre,
                  tipo,
                  descansoSeg,
                },
              });
              h.setEditarCompuesto(null);
              h.setSelectedIndex(null);
            }}
          />
        </Overlay>
      ) : null}

      {/* Crear compuesto (nuevo) */}
      {h.mostrarFormularioCompuesto ? (
        <Overlay>
          <FormularioCompuesto
            onCancel={() => h.setMostrarFormularioCompuesto(false)}
            onConfirm={(nombre, tipo, descansoSeg) => {
              const compuestoId = Date.now();
              const ejerciciosCompuestos: EjercicioAsignadoInput[] = h.compuestoTemporal.map((e, i) => ({
                ejercicioId: e.id,
                orden: i + 1,
                ejercicioInfo: e.info,
                seriesSugeridas: e.detalles?.seriesSugeridas ?? 3,
                repeticionesSugeridas: e.detalles?.repeticionesSugeridas ?? 10,
                descansoSeg: 0,
                pesoSugerido: 0,
                notaIA: e.detalles?.notaIA ?? "",
                ejercicioCompuestoId: compuestoId,
              }));

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
              h.Toast.show({ type: "success", text1: "Ejercicio compuesto agregado exitosamente." });
            }}
          />
        </Overlay>
      ) : null}

      {/* Añadir ejercicio al compuesto en curso */}
      {h.modoCompuesto && h.ejercicioEnCompuestoActual ? (
        <Overlay>
          <FormularioEjercicio
            ejercicioId={h.ejercicioEnCompuestoActual!.id}
            esParteDeCompuesto
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
        </Overlay>
      ) : null}

      {/* Confirm vaciar */}
      <AlertaConfirmacion
        visible={h.confirmClear}
        titulo="Vaciar rutina"
        mensaje="¿Estás seguro de que quieres vaciar toda la rutina? Esta acción no se puede deshacer."
        onCancelar={() => h.setConfirmClear(false)}
        onConfirmar={() => {
          const diasPresentes = (h.state.dias ?? []).map((d) => d.diaSemana);
          diasPresentes.forEach((ds) => {
            h.dispatch({ type: "REORDER_EJERCICIOS", payload: { diaSemana: ds, ejercicios: [] } });
          });
          h.dispatch({ type: "CLEAR" });
          AsyncStorage.removeItem("crearRutinaState");
          h.setConfirmClear(false);
          h.setSelectedIndex(null);
        }}
        textoConfirmar="Sí, vaciar"
        textoCancelar="Cancelar"
      />
    </View>
  );
}

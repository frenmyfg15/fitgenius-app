// Home.tsx
// Añade recarga deslizando hacia abajo sin romper tu deduplicación ni la caché.

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useColorScheme } from "nativewind";
import Toast from "react-native-toast-message";

import { useUsuarioStore } from "@/features/store/useUsuarioStore";
import { useSyncStore } from "@/features/store/useSyncStore";
import { obtenerRutina } from "@/features/api/rutinas.api";

import { useRutinaCache } from "@/features/store/useRutinaCache";
import Calendar from "@/shared/components/home/Calendar";
import TarjetaHome from "@/shared/components/home/TarjetaHome";
import MensajeVacio from "@/shared/components/ui/MensajeVacio";
import Extra from "@/shared/components/home/Extra";
import IaGenerate from "@/shared/components/ui/IaGenerate";
import HomeSkeleton from "@/shared/components/skeleton/HomeSkeleton";

/* ---------- Tipos ---------- */
type DiaNombre =
  | "LUNES"
  | "MARTES"
  | "MIERCOLES"
  | "JUEVES"
  | "VIERNES"
  | "SABADO"
  | "DOMINGO";

type RutinaDia = {
  diaSemana: DiaNombre;
  ejercicios: Array<{ id: number; completadoHoy?: boolean }>;
  completadoHoy?: boolean;
};

type RutinaResp = {
  dias?: RutinaDia[];
};

/* ---------- Utils ---------- */
const getDiaActualEnum = (): DiaNombre => {
  const dias: DiaNombre[] = [
    "DOMINGO",
    "LUNES",
    "MARTES",
    "MIERCOLES",
    "JUEVES",
    "VIERNES",
    "SABADO",
  ];
  return dias[new Date().getDay()] as DiaNombre;
};

const normalizeEnum = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase() as DiaNombre;

const toMadridYMD = (() => {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return (d: Date) => fmt.format(d);
})();

const inicioSemanaActual = (base: Date) => {
  const d = new Date(base);
  const off = (d.getDay() + 6) % 7; // lunes=0
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - off);
  return d;
};

/* ---------- Screen ---------- */
export default function Home() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const { usuario } = useUsuarioStore();
  const routineRev = useSyncStore((s) => s.routineRev);
  const workoutRev = useSyncStore((s) => s.workoutRev);

  const rutinaCache = useRutinaCache();

  const [rutina, setRutina] = useState<RutinaResp | null>(null);
  const [dia, setDia] = useState<DiaNombre>(getDiaActualEnum());
  const [loading, setLoading] = useState<boolean>(false);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Deduplicador por clave (id|routineRev|workoutRev)
  const lastKeyRef = useRef<string | null>(null);
  const inflightRef = useRef<Promise<any> | null>(null);

  const fetchRutina = useCallback(
    async (force = false) => {
      const id = usuario?.rutinaActivaId;
      if (!id) {
        setRutina(null);
        return;
      }

      const key = `${id}|${routineRev}|${workoutRev}`;

      if (!force && lastKeyRef.current === key) {
        return; // ya atendido
      }
      lastKeyRef.current = key;

      const cached = rutinaCache.get(id);
      if (cached && !force) {
        setRutina(cached);
        // si no quieres refrescar en background, retorna aquí
        // return;
      }

      // evita carreras
      if (inflightRef.current) {
        // dejamos terminar la actual
      }

      try {
        if (!force) setLoading(true);
        const p = obtenerRutina(id)
          .then((res) => {
            setRutina(res.data);
            rutinaCache.set(id, res.data);
          })
          .catch((err) => {
            console.error("[Home] obtenerRutina error", err);
            Toast.show({
              type: "error",
              text1: cached ? "No se pudo actualizar la rutina." : "Error al cargar la rutina activa.",
            });
          })
          .finally(() => {
            inflightRef.current = null;
            if (!force) setLoading(false);
          });

        inflightRef.current = p;
        await p;
      } catch {
        // ya gestionado en el then/catch de p
      }
    },
    [usuario?.rutinaActivaId, routineRev, workoutRev, rutinaCache]
  );

  useEffect(() => {
    fetchRutina(false);
  }, [fetchRutina]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Forzamos ir a red y no usar la clave deduplicada
      await fetchRutina(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchRutina]);

  const devolver = useCallback((_d: string, diaNombre: string) => {
    setDia(normalizeEnum(diaNombre));
  }, []);

  const totalEjercicios = useMemo(() => {
    return rutina?.dias?.find((i) => i.diaSemana === dia)?.ejercicios?.length || 0;
  }, [rutina, dia]);

  const completadasMap = useMemo(() => {
    if (!rutina?.dias) return {};
    const base = inicioSemanaActual(new Date());
    const orden: DiaNombre[] = [
      "LUNES",
      "MARTES",
      "MIERCOLES",
      "JUEVES",
      "VIERNES",
      "SABADO",
      "DOMINGO",
    ];
    const map: Record<string, boolean> = {};
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(base);
      fecha.setDate(base.getDate() + i);
      const ymd = toMadridYMD(fecha);
      const diaEnum = orden[i];
      const diaRutina = rutina.dias.find((d) => d.diaSemana === diaEnum);
      if (diaRutina?.completadoHoy) map[ymd] = true;
    }
    return map;
  }, [rutina?.dias, usuario?.rutinaActivaId, routineRev, workoutRev, rutinaCache]);

  if (loading && !rutina) {
    return <HomeSkeleton />;
  }

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
        paddingBottom: 80,
        backgroundColor: isDark ? "#0b1220" : "#ffffff",
        gap: 20,
        minHeight: "100%",
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDark ? "#e5e7eb" : "#0f172a"}
          colors={[isDark ? "#e5e7eb" : "#0f172a"]}
          progressBackgroundColor={isDark ? "#0b1220" : "#ffffff"}
        />
      }
    >
      <View className="w-full items-center">
        <Calendar devolverDato={devolver} completadas={completadasMap} />
      </View>

      {rutina ? <Extra ejercicios={totalEjercicios} /> : null}

      <View className="w-full items-center">
        <TarjetaHome rutina={rutina as any} dia={dia} />
      </View>

      {!usuario?.rutinaActivaId && (
        <>
          <MensajeVacio
            titulo="Aún no tienes una rutina"
            descripcion="No hemos encontrado una rutina activa para ti. Puedes generar una personalizada según tus objetivos y equipos disponibles."
            textoBoton="Crear mi rutina"
            rutaDestino="/crear-rutina"
            nombreImagen="rutinas"
            mostrarBoton={false}
          />
          <IaGenerate />
        </>
      )}
    </ScrollView>
  );
}

// Home.tsx

import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { View, ScrollView, RefreshControl } from "react-native";
import { useColorScheme } from "nativewind";

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

  /** 🔥 NUEVO: fechas completadas reales (YYYY-MM-DD) */
  fechasCompletadas?: string[];
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
  return (d: Date) => fmt.format(d); // YYYY-MM-DD
})();

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

  // ✅ NUEVO: fecha seleccionada (Madrid) para que TarjetaHome pinte ejercicios por fecha
  const [selectedYMD, setSelectedYMD] = useState<string>(() =>
    toMadridYMD(new Date())
  );

  const [refreshing, setRefreshing] = useState(false);

  const lastKeyRef = useRef<string | null>(null);
  const inflightRef = useRef<Promise<any> | null>(null);

  /* ============================================================
     🔥 FETCH RUTINA + CACHE
  ============================================================ */
  const fetchRutina = useCallback(
    async (force = false) => {
      const id = usuario?.rutinaActivaId;
      if (!id) {
        setRutina(null);
        return;
      }

      const key = `${id}|${routineRev}|${workoutRev}`;

      if (!force && lastKeyRef.current === key) return;
      lastKeyRef.current = key;

      const cached = rutinaCache.get(id);
      if (cached && !force) {
        setRutina(cached);
      }

      if (inflightRef.current) {
        // deja que termine la actual
      }

      try {
        if (!force) setLoading(true);

        const p = obtenerRutina(id)
          .then((data) => {
            const rutinaResp = (data ?? null) as RutinaResp | null;

            setRutina(rutinaResp);
            if (rutinaResp) rutinaCache.set(id, rutinaResp);
          })
          .catch((err) => {
            console.error("[Home] obtenerRutina error", err);
          })
          .finally(() => {
            inflightRef.current = null;
            if (!force) setLoading(false);
          });

        inflightRef.current = p;
        await p;
      } catch {}
    },
    [usuario?.rutinaActivaId, routineRev, workoutRev, rutinaCache]
  );

  useEffect(() => {
    fetchRutina(false);
  }, [fetchRutina]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchRutina(true);
    } finally {
      setRefreshing(false);
    }
  }, [fetchRutina]);

  /* ============================================================
     Cambiar día seleccionado (Calendar)
  ============================================================ */
  const devolver = useCallback((d: string, diaNombre: string) => {
    setDia(normalizeEnum(diaNombre));

    // d debería venir como "YYYY-MM-DD" desde Calendar
    if (typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      setSelectedYMD(d);
    } else {
      // fallback seguro (por si Calendar manda otro formato)
      setSelectedYMD(toMadridYMD(new Date()));
    }
  }, []);

  /* ============================================================
     Total ejercicios del día
  ============================================================ */
  const totalEjercicios = useMemo(() => {
    return (
      rutina?.dias?.find((i) => i.diaSemana === dia)?.ejercicios?.length || 0
    );
  }, [rutina, dia]);

  /* ============================================================
     🔥 FIX: COMPLETADAS POR FECHA REAL (persistente)
  ============================================================ */
  const completadasMap = useMemo(() => {
    if (!rutina?.fechasCompletadas) return {};

    const map: Record<string, boolean> = {};
    for (const ymd of rutina.fechasCompletadas) {
      map[ymd] = true;
    }
    return map;
  }, [rutina?.fechasCompletadas]);

  /* ============================================================
     Loading
  ============================================================ */
  if (loading && !rutina) {
    return <HomeSkeleton />;
  }

  /* ============================================================
     RENDER
  ============================================================ */
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
      {/* Calendario */}
      <View className="w-full items-center">
        <Calendar devolverDato={devolver} completadas={completadasMap} />
      </View>

      {/* Resumen */}
      {rutina ? <Extra ejercicios={totalEjercicios} /> : null}

      {/* Tarjeta del Día */}
      <View className="w-full items-center">
        <TarjetaHome
          rutina={rutina as any}
          dia={dia}
          selectedYMD={selectedYMD}
        />
      </View>

      {/* Estado vacío */}
      {!usuario?.rutinaActivaId && (
        <>
          <MensajeVacio
            titulo="Aún no tienes una rutina"
            descripcion="No hemos encontrado una rutina activa para ti. Puedes generar una personalizada."
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

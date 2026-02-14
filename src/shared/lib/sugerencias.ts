// lib/sugerencias.ts

/* ---------------- Tipos ---------------- */
export type Serie = {
  pesoKg: number | null;
  repeticiones: number | null; // en cardio = segundos
};

export type Sug = {
  cat: "Carga" | "Volumen" | "Técnica" | "Recuperación" | "Progresión";
  text: string;
};

export type Metrics = {
  // sets
  n: number;
  sets: Serie[];
  repsArr: number[];
  weightArr: number[];

  // métricas base
  totalReps: number;      // fuerza: reps totales, cardio: segundos totales
  totalVol: number;       // tonelaje (peso*reps)
  avgReps: number;        // fuerza: reps/serie, cardio: seg/serie
  avgWPerRep: number;     // peso medio por rep
  maxW: number;
  minW: number;
  firstReps: number;
  lastReps: number;
  fatigueDrop: number;    // 0–1

  // variabilidad
  repsStd: number;
  weightStd: number;
  cvReps: number;
  cvWeight: number;

  // tendencia
  slopeW: number;

  // zona
  zone: "fuerza" | "hipertrofia" | "resistencia";
};

export type ByCat = Record<Sug["cat"], string[]>;

/* ---------------- Utils puros ---------------- */
export function sanitizeSets(
  detallesSeries: Serie[] | null | undefined
): Serie[] {
  return (detallesSeries?.filter(Boolean) ?? []).map((s) => ({
    pesoKg: s?.pesoKg ?? 0,
    repeticiones: s?.repeticiones ?? 0,
  }));
}

function std(arr: number[]): number {
  const n = arr.length || 1;
  const m = arr.reduce((a, b) => a + b, 0) / n;
  const v = arr.reduce((a, b) => a + (b - m) ** 2, 0) / n;
  return Math.sqrt(v);
}

/* ---------------- Cálculo de métricas ---------------- */
export function computeMetrics(
  detallesSeries: Serie[] | null | undefined
): Metrics {
  const sets = sanitizeSets(detallesSeries);
  const n = sets.length;

  const repsArr = sets.map((s) => Number(s.repeticiones ?? 0));
  const weightArr = sets.map((s) => Number(s.pesoKg ?? 0));

  const totalReps = repsArr.reduce((a, b) => a + b, 0);
  const totalVol = sets.reduce(
    (sum, s) =>
      sum +
      Number(s.pesoKg ?? 0) * Number(s.repeticiones ?? 0),
    0
  );

  const avgReps = n ? totalReps / n : 0;
  const avgWPerRep = totalReps ? totalVol / totalReps : 0;
  const maxW = Math.max(0, ...weightArr);
  const minW = Math.max(0, Math.min(...weightArr));
  const firstReps = repsArr[0] ?? 0;
  const lastReps = repsArr[n - 1] ?? 0;
  const fatigueDrop = firstReps ? 1 - lastReps / firstReps : 0;

  const repsStd = std(repsArr);
  const weightStd = std(weightArr);
  const cvReps = avgReps ? repsStd / avgReps : 0;
  const cvWeight = avgWPerRep ? weightStd / avgWPerRep : 0;

  // Regresión lineal simple para la tendencia de carga
  let slopeW = 0;
  if (n >= 2) {
    const x = Array.from({ length: n }, (_, i) => i + 1);
    const y = weightArr;
    const xm = x.reduce((a, b) => a + b, 0) / n;
    const ym = y.reduce((a, b) => a + b, 0) / n;
    let num = 0,
      den = 0;
    for (let i = 0; i < n; i++) {
      num += (x[i] - xm) * (y[i] - ym);
      den += (x[i] - xm) ** 2;
    }
    slopeW = den ? num / den : 0;
  }

  const zone: Metrics["zone"] =
    avgReps < 6 ? "fuerza" : avgReps <= 12 ? "hipertrofia" : "resistencia";

  return {
    n,
    sets,
    repsArr,
    weightArr,
    totalReps,
    totalVol,
    avgReps,
    avgWPerRep,
    maxW,
    minW,
    firstReps,
    lastReps,
    fatigueDrop,
    repsStd,
    weightStd,
    cvReps,
    cvWeight,
    slopeW,
    zone,
  };
}

/* ---------------- Sugerencias cardio ---------------- */
export function generateCardioSuggestions(m: Metrics): Sug[] {
  const sugs: Sug[] = [];

  const totalTime = m.totalReps;    // segundos totales
  const avgTime = m.avgReps;        // segundos por serie
  const n = m.n;

  // Volumen / tiempo total
  if (totalTime < 60) {
    sugs.push({
      cat: "Volumen",
      text: "Sesión muy corta. Si tu objetivo es resistencia, intenta acumular al menos 60–120 segundos totales de trabajo en este ejercicio.",
    });
  } else if (totalTime > 600) {
    sugs.push({
      cat: "Volumen",
      text: "Tiempo total muy alto. Valora dividir el trabajo en bloques más cortos o alternar intensidades para evitar fatiga excesiva.",
    });
  } else {
    sugs.push({
      cat: "Volumen",
      text: "Buen tiempo total de trabajo. Mantén una progresión suave (+10–20 s por sesión) para seguir mejorando la capacidad aeróbica.",
    });
  }

  // Duración media de las series
  if (avgTime < 20) {
    sugs.push({
      cat: "Progresión",
      text: "Bloques muy cortos. Mantén la intensidad y prueba a extender gradualmente las series hacia 20–40 segundos de esfuerzo continuo.",
    });
  } else if (avgTime <= 45) {
    sugs.push({
      cat: "Progresión",
      text: "Buen rango de trabajo por serie (20–45 s). Puedes progresar sumando 5–10 s en la última serie cuando sientas margen.",
    });
  } else {
    sugs.push({
      cat: "Progresión",
      text: "Series bastante largas. Si notas caída de ritmo, prueba a dividirlas en 2 bloques más cortos manteniendo la intensidad de cada uno.",
    });
  }

  // Fatiga entre primera y última serie
  if (m.fatigueDrop > 0.35 && n >= 3) {
    sugs.push({
      cat: "Recuperación",
      text: "La duración por serie cae bastante del inicio al final. Aumenta el descanso entre series o reduce ligeramente la intensidad para sostener el ritmo.",
    });
  } else if (m.fatigueDrop < 0.15 && n >= 3) {
    sugs.push({
      cat: "Progresión",
      text: "Ritmo estable entre series. Tienes margen para progresar: añade unos segundos a la última serie o acorta un poco los descansos.",
    });
  }

  // Variabilidad del tiempo de las series
  if (m.cvReps > 0.25) {
    sugs.push({
      cat: "Técnica",
      text: "Gran variación en el tiempo de las series. Intenta marcar un objetivo claro (ej. 30 s por serie) y mantenerlo para medir mejor el progreso.",
    });
  } else {
    sugs.push({
      cat: "Técnica",
      text: "Buen control del tiempo por serie. Mantén un ritmo respiratorio constante y un esfuerzo similar en cada bloque.",
    });
  }

  // Si hay carga además del componente cardiometabólico
  if (m.totalVol > 0 && m.avgWPerRep > 0) {
    sugs.push({
      cat: "Carga",
      text: "Estás combinando cardio con carga. Asegúrate de que la técnica no se deteriora al final de las series y prioriza una progresión lenta en el peso.",
    });
  }

  // Recomendación general (siempre)
  sugs.push(
    {
      cat: "Recuperación",
      text: "Incluye 3–5 minutos de calentamiento progresivo antes (ej. caminata rápida o bici suave) para preparar el sistema cardiovascular.",
    },
    {
      cat: "Técnica",
      text: "Concéntrate en una respiración rítmica (ej. 2–3 pasos por inhalación/exhalación) para sostener mejor el esfuerzo.",
    },
    {
      cat: "Progresión",
      text: "Regla sencilla: cuando completes todas las series con sensación de margen, añade +5–10 s a la última serie de la próxima sesión.",
    }
  );

  return sugs;
}

/* ---------------- Generador de sugerencias (fuerza por defecto) ---------------- */
export function generateSuggestions(
  m: Metrics,
  opts?: { esCardio?: boolean }
): Sug[] {
  if (opts?.esCardio) {
    return generateCardioSuggestions(m);
  }

  const sugs: Sug[] = [];

  // Volumen
  if (m.totalReps < 24) {
    sugs.push({
      cat: "Volumen",
      text: "Considera subir el volumen: añade 1 set o +2–3 repeticiones por set para un estímulo más consistente.",
    });
  } else {
    sugs.push({
      cat: "Volumen",
      text: "Buen volumen total. Mantén la densidad controlando descansos para preservar la calidad de repeticiones.",
    });
  }

  // Carga promedio por rep
  if (m.avgWPerRep < 50) {
    sugs.push({
      cat: "Carga",
      text: "Puedes desafiarte un poco más: prueba un incremento pequeño (≈ +2.5–5%) en la próxima sesión si la técnica se mantiene sólida.",
    });
  } else if (m.avgWPerRep > 80) {
    sugs.push({
      cat: "Carga",
      text: "Estás trabajando pesado. Cuida la técnica y considera micro-cargas (+1–2.5%) para progresar sin sobrecarga articular.",
    });
  }

  // Tendencia de carga
  if (m.slopeW > 0.5) {
    sugs.push({
      cat: "Progresión",
      text: "Tendencia ascendente de carga entre sets: excelente autoregulación. Mantén incrementos pequeños para sostener el progreso.",
    });
  } else if (m.slopeW < -0.5) {
    sugs.push({
      cat: "Progresión",
      text: "La carga cae entre sets. Evalúa alargar descansos (+30–60s) o empezar con una carga apenas más conservadora.",
    });
  } else {
    sugs.push({
      cat: "Progresión",
      text: "Carga estable. Prueba progresión lineal: +2.5% en el primer set y sostén repeticiones objetivo.",
    });
  }

  // Fatiga
  if (m.fatigueDrop > 0.35) {
    sugs.push({
      cat: "Recuperación",
      text: "Fatiga alta entre el primer y último set. Aumenta el descanso, usa series escalonadas o reduce un 2–5% la carga media.",
    });
  } else if (m.fatigueDrop < 0.15 && m.n >= 3) {
    sugs.push({
      cat: "Progresión",
      text: "Poca caída de repeticiones: margen para progresar. Añade 1–2 reps en el set final o sube levemente la carga.",
    });
  }

  // Variabilidad/consistencia
  if (m.cvReps > 0.25) {
    sugs.push({
      cat: "Técnica",
      text: "Variación grande en repeticiones. Estandariza tempo (ej. 2-0-2) y rango para mejorar consistencia y comparabilidad.",
    });
  } else {
    sugs.push({
      cat: "Técnica",
      text: "Buena consistencia en repeticiones. Mantén el mismo rango y tempo para medir el progreso con precisión.",
    });
  }

  // Zona de reps
  if (m.zone === "fuerza") {
    sugs.push({
      cat: "Progresión",
      text: "Zona de fuerza (<6 reps): prioriza descansos largos (2–3 min) y técnica perfecta; añade micro-cargas cuando consolides el rango.",
    });
  } else if (m.zone === "hipertrofia") {
    sugs.push({
      cat: "Progresión",
      text: "Zona de hipertrofia (6–12): excelente. Apunta a progresión doble (sube reps hasta tope y luego aumenta carga).",
    });
  } else {
    sugs.push({
      cat: "Progresión",
      text: "Zona de resistencia (>12): si buscas masa muscular, prueba bajar reps a 8–12 con una carga algo mayor.",
    });
  }

  // Volumen alto
  if (m.totalVol > 1000) {
    sugs.push({
      cat: "Recuperación",
      text: "Volumen elevado. Prioriza sueño, hidratación y 24–48h antes de volver a estimular el mismo grupo muscular.",
    });
  }

  // Máximos y sets
  if (m.maxW === m.minW && m.n >= 3) {
    sugs.push({
      cat: "Progresión",
      text: "Todos los sets al mismo peso. Prueba onda simple: Set1 pesado, Set2 −5%, Set3 −10% para calidad y exposición a carga.",
    });
  } else if (m.maxW - m.minW >= 10) {
    sugs.push({
      cat: "Técnica",
      text: "Gran diferencia de carga entre sets. Estabiliza 2–3 sesiones en un esquema cercano para afianzar técnica y adaptación.",
    });
  }

  // Sugerencias extra (siempre)
  sugs.push(
    {
      cat: "Técnica",
      text: "Pista técnica: fija escápulas, controla el excéntrico y evita rebotes para proteger articulaciones.",
    },
    {
      cat: "Recuperación",
      text: "Incluye 5–10 min de movilidad/activación previa y 5 min de descarga al final para acelerar recuperación.",
    },
    {
      cat: "Progresión",
      text: "Plan rápido próxima sesión: +1–2 reps en el último set o +2.5% en el primero si finalizas con RIR≥2.",
    }
  );

  return sugs;
}

/* ---------------- Agrupar por categoría ---------------- */
export function groupByCategory(sugs: Sug[]): ByCat {
  return sugs.reduce<ByCat>((acc, s) => {
    (acc[s.cat] ||= []).push(s.text);
    return acc;
  }, {} as ByCat);
}

/* ---------------- Plan próximo entrenamiento ---------------- */
export function buildNextSessionPlan(zone: Metrics["zone"]) {
  return {
    warmup: "2 sets de aproximación (40% y 60% de la carga objetivo).",
    workRange: `3–4 en rango ${
      zone === "hipertrofia"
        ? "8–12"
        : zone === "fuerza"
        ? "3–6"
        : "12–15+"
    } reps.`,
    progression:
      "Si terminas con RIR ≥ 2, añade +1–2 reps o +2.5% carga al primer set.",
    rest:
      zone === "fuerza"
        ? "2–3 min"
        : zone === "hipertrofia"
        ? "90–120 s"
        : "60–90 s",
    notes: "Registra tempo y rango para evaluar consistencia la próxima vez.",
  };
}

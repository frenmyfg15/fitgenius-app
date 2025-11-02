// src/features/wizard/progress.ts
import type { Usuario } from "@/features/type/register"; // tu tipo real

const s    = (v: unknown) => typeof v === "string" && v.trim().length > 0;
const npos = (v: unknown) => typeof v === "number" && isFinite(v) && (v as number) > 0;
const arr  = (v: unknown) => Array.isArray(v) && v.length > 0;

type Check = { step: string; ok: (u: Usuario) => boolean };

/** Ajusta los pasos EXACTOS a tus pantallas */
export const CHECKS: Check[] = [
  { step: "Objetivo",      ok: (u) => s(u.objetivo) },
  { step: "Sexo",          ok: (u) => s(u.sexo) },
  { step: "Enfoque",       ok: (u) => arr(u.enfoque) },
  { step: "Nivel",         ok: (u) => s(u.nivel) },
  { step: "Actividad",     ok: (u) => s(u.actividad) },
  { step: "Lugar",         ok: (u) => s(u.lugar) },
  { step: "Equipamiento",  ok: (u) => arr(u.equipamiento) },
  { step: "Altura",        ok: (u) => npos(u.altura) && s(u.medidaAltura) },
  { step: "Peso",          ok: (u) => npos(u.peso) && s(u.medidaPeso) },
  { step: "PesoObjetivo",  ok: (u) => npos(u.pesoObjetivo) },
  { step: "Edad",          ok: (u) => npos(u.edad) },           // edad puede ser number | undefined
  { step: "Dias",          ok: (u) => arr(u.dias) },
  { step: "Duracion",      ok: (u) => s(u.duracion) },
  // { step: "Limitaciones",  ok: (u) => arr(u.limitaciones) }, // solo si es obligatorio
];

export function getRegistroProgressFromUsuario(u: Usuario | null | undefined) {
  const total = CHECKS.length;                          // 🔴 total fijo
  const count = u ? CHECKS.reduce((n, c) => n + (c.ok(u) ? 1 : 0), 0) : 0;
  const progress = total ? count / total : 0;

  if (__DEV__) {
    const passed   = u ? CHECKS.filter(c => c.ok(u)).map(c => c.step) : [];
    const pending  = CHECKS.map(c => c.step).filter(step => !passed.includes(step));
    // Logs útiles para ver qué cambió
    console.log("🧭 [Registro] Progreso:", `${count}/${total}`, `(${Math.round(progress*100)}%)`);
    if (u) {
      const filled = Object.fromEntries(
        Object.entries(u).filter(([_, v]) => (
          v !== null && v !== undefined &&
          (typeof v === "number" ? isFinite(v) && v > 0
           : Array.isArray(v) ? v.length > 0
           : typeof v === "string" ? v.trim().length > 0
           : true)
        ))
      );
      console.log("🧠 [Registro] Campos con valor:", filled);
      console.log("✅ [Registro] Completados:", passed);
      console.log("⏳ [Registro] Pendientes:", pending);
    } else {
      console.log("⚠️ [Registro] usuario = null/undefined");
    }
  }

  return { count, total, progress };
}

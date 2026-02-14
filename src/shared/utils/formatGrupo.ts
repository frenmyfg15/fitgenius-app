// src/shared/utils/formatGrupo.ts

/**
 * "PECHOS"   -> "Pechos"
 * "ESPALDA"  -> "Espalda"
 * "CORE"     -> "Core"
 * "CARDIO"   -> "Cardio"
 */
export function formatGrupo(grupo?: string | null): string {
  if (!grupo) return "";

  return grupo
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase());
}

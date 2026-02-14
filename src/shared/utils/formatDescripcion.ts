/**
 * Reglas:
 * - todo en minúscula
 * - reemplaza "_" por espacio
 * - solo la primera letra en mayúscula
 *
 * Ej:
 *  "DELTOIDES_ANTERIOR" -> "Deltoides anterior"
 *  "TRAPECIO_SUPERIOR"  -> "Trapecio superior"
 *  "HOLA_MUNDO"         -> "Hola mundo"
 */
export function formatDescripcion(text?: string | null): string {
    if (!text) return "";

    const clean = text
        .trim()
        .toLowerCase()
        .replace(/_/g, " ");

    return clean.charAt(0).toUpperCase() + clean.slice(1);
}

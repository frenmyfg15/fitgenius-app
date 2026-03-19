// src/shared/utils/lbToKg.ts
export function lbToKg(lb: number): number {
    if (!Number.isFinite(lb)) return 0;

    const kg = lb / 2.20462;
    return Math.round(kg * 10) / 10;
}
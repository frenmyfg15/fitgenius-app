export function kgToLb(kg: number): string {
    if (!Number.isFinite(kg)) return "";

    const lb = kg * 2.20462;
    return `${Math.round(lb)} lb`;
}
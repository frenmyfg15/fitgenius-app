export function cmToFt(cm: number): string {
    if (!Number.isFinite(cm)) return "";

    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);

    return `${feet}'${inches}"`;
}
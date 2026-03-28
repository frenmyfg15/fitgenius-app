import { useCallback, useRef } from "react";
import { useOverlay } from "./OverlayProvider";

export function useOverlayPresenter() {
    const { showOverlay, hideOverlay, replaceOverlay } = useOverlay();
    const overlayIdRef = useRef<string | null>(null);

    const present = useCallback(
        (node: React.ReactNode) => {
            if (overlayIdRef.current) {
                replaceOverlay(overlayIdRef.current, node);
                return overlayIdRef.current;
            }

            const id = showOverlay(node);
            overlayIdRef.current = id;
            return id;
        },
        [showOverlay, replaceOverlay]
    );

    const dismiss = useCallback(() => {
        if (!overlayIdRef.current) return;
        hideOverlay(overlayIdRef.current);
        overlayIdRef.current = null;
    }, [hideOverlay]);

    return {
        present,
        dismiss,
        overlayIdRef,
    };
}
import React, {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
} from "react";
import { StyleSheet, View } from "react-native";

type OverlayItem = {
    id: string;
    node: React.ReactNode;
};

type OverlayContextValue = {
    showOverlay: (node: React.ReactNode) => string;
    hideOverlay: (id: string) => void;
    clearOverlays: () => void;
    replaceOverlay: (id: string, node: React.ReactNode) => void;
};

const OverlayContext = createContext<OverlayContextValue | null>(null);

function createOverlayId() {
    return `overlay_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function OverlayProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [items, setItems] = useState<OverlayItem[]>([]);

    const showOverlay = useCallback((node: React.ReactNode) => {
        const id = createOverlayId();
        setItems((prev) => [...prev, { id, node }]);
        return id;
    }, []);

    const hideOverlay = useCallback((id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    }, []);

    const clearOverlays = useCallback(() => {
        setItems([]);
    }, []);

    const replaceOverlay = useCallback((id: string, node: React.ReactNode) => {
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, node } : item))
        );
    }, []);

    const value = useMemo(
        () => ({
            showOverlay,
            hideOverlay,
            clearOverlays,
            replaceOverlay,
        }),
        [showOverlay, hideOverlay, clearOverlays, replaceOverlay]
    );

    return (
        <OverlayContext.Provider value={value}>
            <View style={styles.root}>
                <View style={styles.appLayer}>{children}</View>

                <View pointerEvents="box-none" style={styles.overlayLayer}>
                    {items.map((item) => (
                        <View key={item.id} pointerEvents="box-none" style={styles.absoluteFill}>
                            {item.node}
                        </View>
                    ))}
                </View>
            </View>
        </OverlayContext.Provider>
    );
}

export function useOverlay() {
    const ctx = useContext(OverlayContext);

    if (!ctx) {
        throw new Error("useOverlay debe usarse dentro de OverlayProvider");
    }

    return ctx;
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    appLayer: {
        flex: 1,
    },
    overlayLayer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999999,
        elevation: 999999,
    },
    absoluteFill: {
        ...StyleSheet.absoluteFillObject,
    },
});
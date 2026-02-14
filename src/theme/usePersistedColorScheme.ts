import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback, useRef } from "react";
import { useColorScheme } from "nativewind";

const KEY = "user-color-scheme";
type Scheme = "light" | "dark" | "system";

export function usePersistedColorScheme() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [isReady, setIsReady] = useState(false);

  // Evita re-ejecutar lógica de “default dark” más de 1 vez en hot reload / remount raro
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    (async () => {
      try {
        const saved = (await AsyncStorage.getItem(KEY)) as Scheme | null;

        if (saved === "light" || saved === "dark" || saved === "system") {
          setColorScheme(saved);
        } else {
          // ✅ solo si NO hay nada válido => default dark
          await AsyncStorage.setItem(KEY, "dark");
          setColorScheme("dark");
        }
      } catch (err) {
        console.warn("No se pudo cargar el tema guardado:", err);
        // fallback razonable
        setColorScheme("dark");
      } finally {
        setIsReady(true);
      }
    })();
  }, [setColorScheme]);

  const saveScheme = useCallback(
    async (scheme: Scheme) => {
      try {
        await AsyncStorage.setItem(KEY, scheme);
        setColorScheme(scheme);
      } catch (err) {
        console.warn("No se pudo guardar el tema:", err);
      }
    },
    [setColorScheme]
  );

  return { colorScheme, saveScheme, isReady };
}

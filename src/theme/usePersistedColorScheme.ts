// src/theme/usePersistedColorScheme.ts
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useColorScheme } from "nativewind";

const KEY = "user-color-scheme"; // valores: 'light' | 'dark' | 'system'

export function usePersistedColorScheme() {
  const { colorScheme, setColorScheme } = useColorScheme();

  // Cargar preferencia guardada
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(KEY);
        if (saved === "light" || saved === "dark" || saved === "system") {
          setColorScheme(saved);
        }
      } catch (err) {
        console.warn("No se pudo cargar el tema guardado:", err);
      }
    })();
  }, []);

  // Guardar nueva preferencia y aplicarla
  const saveScheme = async (scheme: "light" | "dark" | "system") => {
    try {
      await AsyncStorage.setItem(KEY, scheme);
      setColorScheme(scheme);
    } catch (err) {
      console.warn("No se pudo guardar el tema:", err);
    }
  };

  return { colorScheme, saveScheme };
}

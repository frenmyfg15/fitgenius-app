import { Pressable, Text, View, ActivityIndicator } from "react-native";
import { useColorScheme } from "nativewind";
import { Feather } from "@expo/vector-icons";
import { useState } from "react";

type Props = {
  text?: boolean;
}

export default function ThemeToggle({ text = true }: Props) {
  const { colorScheme, setColorScheme } = useColorScheme(); // 'light' | 'dark' | 'system'
  const [loading, setLoading] = useState(false);

  const next: "light" | "dark" = colorScheme === "dark" ? "light" : "dark";

  const toggle = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await Promise.resolve(setColorScheme(next)); // por si setColorScheme llega a ser async
    } finally {
      // pequeño retraso opcional para evitar parpadeo
      setTimeout(() => setLoading(false), 150);
    }
  };

  return (
    <View
      className="rounded-full"
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: 0.18,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
      }}
    >
      <Pressable
        onPress={toggle}
        hitSlop={10}
        disabled={loading}
        className={`px-3 py-2 flex-row items-center gap-2 rounded-full 
          bg-slate-200 dark:bg-slate-800 
          ${loading ? "opacity-50" : "active:opacity-80"}`}
        accessibilityRole="button"
        accessibilityLabel={`Cambiar a tema ${next}`}
      >
        {loading ? (
          <ActivityIndicator size="small" color={colorScheme === "dark" ? "#fff" : "#000"} />
        ) : colorScheme === "dark" ? (
          <Feather name="sun" size={18} color="#fbbf24" />
        ) : (
          <Feather name="moon" size={18} color="#0f172a" />
        )}

        {text && !loading && (
          <Text className="text-xs font-medium text-slate-900 dark:text-slate-100">
            {colorScheme === "dark" ? "Claro" : "Oscuro"}
          </Text>
        )}
      </Pressable>
    </View>
  );
}

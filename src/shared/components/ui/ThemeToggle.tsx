// src/components/ThemeToggle.tsx
import { Pressable, Text, View } from "react-native";
import { useColorScheme } from "nativewind";
import { Feather } from "@expo/vector-icons";

type Props = {
  text?: boolean;
}

export default function ThemeToggle({ text = true }: Props) {
  const { colorScheme, setColorScheme } = useColorScheme(); // 'light' | 'dark' | 'system'
  const next: "light" | "dark" = colorScheme === "dark" ? "light" : "dark";

  const toggle = () => setColorScheme(next);

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
        className="px-3 py-2 flex-row items-center gap-2 rounded-full bg-slate-200 dark:bg-slate-800 active:opacity-80"
        accessibilityRole="button"
        accessibilityLabel={`Cambiar a tema ${next}`}
      >
        {colorScheme === "dark" ? (
          <Feather name="sun" size={18} color="#fbbf24" />
        ) : (
          <Feather name="moon" size={18} color="#0f172a" />
        )}

        {text &&
          <Text className="text-xs font-medium text-slate-900 dark:text-slate-100">
            {colorScheme === "dark" ? "Claro" : "Oscuro"}
          </Text>
        }
      </Pressable>
    </View>
  );
}

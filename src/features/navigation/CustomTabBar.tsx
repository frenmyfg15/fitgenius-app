// CustomTabBar.tsx
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useColorScheme } from "nativewind";

const indicatorGradient = ["rgb(0,255,64)", "rgb(94,230,157)", "rgb(178,0,255)"];

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View
      style={{
        backgroundColor: isDark ? "#0b1220" : "#ffffff",
        borderTopWidth: 1,
        borderTopColor: isDark ? "#1f2937" : "#e5e7eb",
        paddingBottom: insets.bottom || 8,
        paddingHorizontal: 12,
        paddingTop: 6,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const iconName = getIcon(route.name);
          const color = isFocused ? "#22c55e" : isDark ? "#94a3b8" : "#64748b";

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: "center",
                paddingVertical: 8,
              }}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={{ alignItems: "center", gap: 2, width: "100%", position: "relative" }}>
                <Ionicons name={iconName} size={22} color={color} />
                <Text style={{ fontSize: 11, fontWeight: "700", color }}>{String(label)}</Text>

                {/* Indicador inferior degradado SOLO para el seleccionado */}
                {isFocused ? (
                  <LinearGradient
                    colors={indicatorGradient as any}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      position: "absolute",
                      bottom: -6, // ligeramente separado del contenido
                      left: "15%",
                      right: "15%",
                      height: 3,
                      borderRadius: 2,
                    }}
                  />
                ) : null}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function getIcon(routeName: string): any {
  switch (routeName) {
    case "Inicio": return "home-outline";
    case "Rutinas": return "barbell-outline";
    case "Progreso": return "stats-chart-outline";
    case "Perfil": return "person-circle-outline";
    default: return "ellipse-outline";
  }
}

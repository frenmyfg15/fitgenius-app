// CustomTabBar.tsx
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useColorScheme } from "nativewind";
import { Colors, scheme } from "@/shared/constants/colors";

export default function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);

  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: isDark ? Colors.primary : Colors.secondary,
          borderTopColor: t.border,
          paddingBottom: insets.bottom || 8,
        },
      ]}
    >
      <View style={styles.row}>
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
          const color = isFocused ? Colors.accent : t.textSecondary;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
            >
              <View style={styles.tabInner}>
                <Ionicons name={iconName} size={22} color={color} />
                <Text style={[styles.label, { color }]}>{String(label)}</Text>

                {isFocused && (
                  <View
                    style={[
                      styles.indicator,
                      { backgroundColor: Colors.accent },
                    ]}
                  />
                )}
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

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  tabInner: {
    alignItems: "center",
    gap: 2,
    width: "100%",
    position: "relative",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
  indicator: {
    position: "absolute",
    bottom: -6,
    left: "15%",
    right: "15%",
    height: 3,
    borderRadius: 2,
  },
});

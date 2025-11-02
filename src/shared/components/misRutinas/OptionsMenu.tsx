// src/shared/components/misRutinas/OptionsMenu.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  TouchableHighlight,
} from "react-native";
import { useColorScheme } from "nativewind";

type Item = {
  key: string;
  label: string;
  icon: any;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
};

type OptionsMenuProps = {
  open: boolean;
  onClose: () => void;
  items: Item[];
  top?: number;
  right?: number;
  width?: number;
};

export function OptionsMenu({
  open,
  onClose,
  items,
  top = 48,
  right = 16,
  width = 240,
}: OptionsMenuProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!open) return null;

  // Paleta adaptada al tema
  const COLORS = {
    background: isDark ? "#0f172a" : "#ffffff",
    border: isDark ? "rgba(255,255,255,0.08)" : "#E6E8EC",
    text: isDark ? "#e2e8f0" : "#111827",
    icon: isDark ? "#94a3b8" : "#6B7280",
    danger: "#EF4444",
    pressed: isDark ? "rgba(255,255,255,0.05)" : "rgba(17,24,39,0.06)",
    pressedDanger: "rgba(239,68,68,0.1)",
    separator: isDark ? "rgba(255,255,255,0.08)" : "#F3F4F6",
  };

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={styles.backdrop}
        accessibilityLabel="Cerrar menú de opciones"
      />

      {/* Caja de opciones */}
      <View
        style={[
          styles.popover,
          {
            top,
            right,
            width,
            backgroundColor: COLORS.background,
            borderColor: COLORS.border,
          },
        ]}
        accessibilityRole="menu"
      >
        {items.map((it, idx) => (
          <React.Fragment key={it.key}>
            <MenuItem
              icon={it.icon}
              label={it.label}
              onPress={() => {
                onClose();
                it.onPress();
              }}
              disabled={it.disabled}
              danger={it.danger}
              colors={COLORS}
            />
            {idx < items.length - 1 && (
              <View
                style={[styles.separator, { backgroundColor: COLORS.separator }]}
              />
            )}
          </React.Fragment>
        ))}
      </View>
    </>
  );
}

// --- Item del menú ---
function MenuItem({
  icon,
  label,
  onPress,
  disabled,
  danger,
  colors,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  colors: any;
}) {
  const underlay = danger ? colors.pressedDanger : colors.pressed;
  const labelColor = danger ? colors.danger : colors.text;

  return (
    <TouchableHighlight
      onPress={onPress}
      disabled={!!disabled}
      underlayColor={underlay}
      style={[styles.menuItem, disabled && { opacity: 0.5 }]}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: !!disabled }}
    >
      <View style={styles.itemInner}>
        <View style={styles.iconContainer}>
          <View style={{ opacity: danger ? 1 : 0.75 }}>{icon}</View>
        </View>
        <Text
          style={[styles.menuItemText, { color: labelColor }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {label}
        </Text>
      </View>
    </TouchableHighlight>
  );
}

// --- Estilos base ---
const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
    backgroundColor: "transparent",
  },
  popover: {
    position: "absolute",
    zIndex: 101,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    // sombra moderna
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    ...(Platform.OS === "android" ? { elevation: 8 } : null),
  },
  menuItem: {},
  itemInner: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    minWidth: 0,
  },
  iconContainer: {
    width: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
    minWidth: 0,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },
});

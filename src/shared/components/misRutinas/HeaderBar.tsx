// src/shared/components/misRutinas/HeaderBar.tsx
import React from "react";
import { View } from "react-native";

type Props = {
  borderColor: string;
  surface: string; // no lo usamos aquí directamente, pero lo dejo por coherencia si quieres extender
  left?: React.ReactNode;
  center?: React.ReactNode;
  right?: React.ReactNode;
};

export function HeaderBar({ borderColor, surface, left, center, right }: Props) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: borderColor,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <View style={{ minWidth: 36, alignItems: "flex-start", justifyContent: "center" }}>
        {left}
      </View>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", minWidth: 0 }}>
        {center}
      </View>
      <View style={{ minWidth: 36, alignItems: "flex-end", justifyContent: "center" }}>
        {right}
      </View>
    </View>
  );
}

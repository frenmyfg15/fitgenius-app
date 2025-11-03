import React, { useState } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { useColorScheme } from "nativewind";

type Props = {
  images: string[];
  alt?: string;
};

export default function ImageSelector({ images, alt = "imagen" }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!images || images.length === 0) return null;

  const selectedImage = images[selectedIndex];

  return (
    <View className="w-full items-center">
      {/* Imagen principal */}
      <View className="w-full aspect-square relative max-w-sm mb-2">
        <Image
          source={{ uri: selectedImage }}
          resizeMode="contain"
          className="w-full h-full"
          accessibilityLabel={alt}
          style={{
            borderRadius: 50,
            marginVertical: 10,
            backgroundColor: "#ffffff",
          }}
        />
      </View>

      {/* Miniaturas */}
      {images.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-2"
          contentContainerStyle={{
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            paddingHorizontal: 6,
          }}
        >
          {images.map((uri, idx) => {
            const isActive = idx === selectedIndex;
            return (
              <TouchableOpacity
                key={uri + idx}
                onPress={() => setSelectedIndex(idx)}
                activeOpacity={0.8}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  borderWidth: isActive ? 2 : 1,
                  borderColor: isActive
                    ? "rgb(0,255,64)" // color del marco activo
                    : isDark
                    ? "rgba(255,255,255,0.15)"
                    : "#e5e7eb",
                  backgroundColor: "#fff",
                  width: 60,
                  height: 60,
                }}
              >
                <Image
                  source={{ uri }}
                  resizeMode="cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    opacity: isActive ? 1 : 0.7,
                    borderRadius: 12,
                  }}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

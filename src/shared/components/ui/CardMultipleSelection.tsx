// src/shared/components/CardSelectable.tsx
import React, { memo } from "react";
import { View, Text, Image, Pressable, Platform } from "react-native";

type Usuario = {
  id: string;
  nombre: string;
  imagen: string; // url o require(...)
};

type Props = {
  Usuario: Usuario[];
  onClic: (select: string[] | string) => void;
  select: string[] | string;
  multiple?: boolean;
  image?: boolean;
};

function CardSelectable({
  Usuario,
  onClic,
  select,
  multiple = true,
  image = true,
}: Props) {
  const isSelected = (id: string): boolean =>
    multiple ? Array.isArray(select) && select.includes(id) : select === id;

  const handleClick = (id: string) => onClic(id);

  return (
    <View
      className={
        image
          ? "flex-row flex-wrap justify-center gap-x-6 gap-y-10"
          : "flex-row flex-wrap justify-between gap-y-4"
      }
    >
      {Usuario.map((item) => {
        const selected = isSelected(item.id);

        const cardBase =
          "relative rounded-2xl items-center justify-end shadow-md my-2";
        const cardSize = image ? "w-[160px] h-[160px] py-2" : "w-[31%] min-w-[100px]";
        const cardBg = image
          ? selected
            ? "bg-neon-400"
            : "bg-neutral-900"
          : "bg-transparent";

        const pillBase = "z-10 rounded-2xl text-center shadow-md";
        const pillPad = image ? "p-2 w-[90%]" : "p-3 w-full";
        const pillBg = selected ? "bg-neon-400" : "bg-white";

        return (
          <Pressable
            key={item.id}
            onPress={() => handleClick(item.id)}
            className={`${cardBase} ${cardSize} ${cardBg}`}
            style={({ pressed }) => [
              { transform: [{ scale: pressed ? 1.05 : 1 }] },
              {
                shadowColor: "#000",
                shadowOpacity: 0.12,
                shadowRadius: 6,
                shadowOffset: { width: 0, height: 3 },
                elevation: 3,
              },
            ]}
          >
            {image && (
              <View className="absolute bottom-12 left-0 w-[160px] h-[160px]">
                <Image
                  source={
                    typeof item.imagen === "string"
                      ? { uri: item.imagen }
                      : (item.imagen as any)
                  }
                  resizeMode="contain"
                  className="w-full h-full"
                />
              </View>
            )}

            <View className={`${pillBase} ${pillPad} ${pillBg}`}>
              <Text
                className="text-black font-semibold text-[16px] leading-tight text-center"
                allowFontScaling={false}
                // quita padding vertical extra en Android para igualar a web
                style={{
                  includeFontPadding: false as any,
                  letterSpacing: 0,
                }}
              >
                {item.nombre}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export default memo(CardSelectable);

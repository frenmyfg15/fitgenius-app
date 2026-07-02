// File: src/features/cuenta/components/PremiumMiniCTACard.tsx
import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";
import { Crown, Sparkles } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useNavigation } from "@react-navigation/native";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

export default function PremiumMiniCTACard() {
  const navigation = useNavigation<any>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [loading, setLoading] = useState(false);

  const t = scheme(isDark);

  const handleGoToPayment = () => {
    navigation.navigate("Perfil", { screen: "PremiumPayment" });
  };

  const handlePress = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      handleGoToPayment();
    }, 350);
  };

  const crownBg = isDark ? Colors.dark.surfaceAlt : "#1E293B";

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: isDark ? Colors.dark.surface : Colors.secondary },
      ]}
    >
      <View style={styles.row}>

        {/* Icono + Textos */}
        <View style={styles.leftContent}>
          <View style={[styles.iconWrap, { backgroundColor: crownBg }]}>
            <Crown size={15} color="#FFFFFF" strokeWidth={2.2} />
          </View>

          <View style={styles.textCol}>
            <Text numberOfLines={1} style={[styles.title, { color: t.textPrimary }]}>
              Hazte Premium
            </Text>
            <Text numberOfLines={1} style={[styles.subtitle, { color: t.textSecondary }]}>
              IA avanzada y todo el catálogo
            </Text>
          </View>
        </View>

        {/* Precio */}
        <View style={styles.price}>
          <Text style={[styles.priceAmount, { color: t.textPrimary }]}>€4,99</Text>
          <Text style={[styles.pricePeriod, { color: t.textSecondary }]}>/mes</Text>
        </View>

        {/* CTA Button */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            onPress={handlePress}
            activeOpacity={0.85}
            disabled={loading}
            accessibilityRole="button"
            accessibilityLabel="Obtener Premium"
            style={[
              styles.ctaBtn,
              {
                backgroundColor: isDark ? t.border : Colors.secondary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
          >
            {loading
              ? <ActivityIndicator size="small" color={t.textPrimary} />
              : <Sparkles size={15} color={t.textPrimary} strokeWidth={2} />
            }
            <Text style={[styles.ctaText, { color: t.textPrimary }]}>
              {loading ? "Abriendo…" : "Obtener"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Colors.accentBorder,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.1,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: Font.body.regular,
    letterSpacing: 0.1,
  },
  price: {
    alignItems: "flex-end",
    marginRight: 4,
  },
  priceAmount: {
    fontSize: 16,
    fontWeight: "900",
    fontFamily: Font.title.bold,
    lineHeight: 18,
    letterSpacing: -0.2,
  },
  pricePeriod: {
    fontSize: 11,
    fontFamily: Font.body.regular,
    lineHeight: 14,
  },
  ctaWrapper: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accentBorder,
  },
  ctaBtn: {
    borderRadius: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: Font.body.bold,
    letterSpacing: 0.2,
  },
});

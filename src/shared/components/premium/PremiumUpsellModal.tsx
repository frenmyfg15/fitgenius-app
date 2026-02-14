import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "nativewind";
import { Crown } from "lucide-react-native";

type PremiumUpsellModalProps = {
  visible: boolean;
  onClose: () => void;
  onGoPremium?: () => void;
  title?: string;
  description?: string;
  featureName?: string;
};

const PremiumUpsellModal: React.FC<PremiumUpsellModalProps> = ({
  visible,
  onClose,
  onGoPremium,
  title,
  description,
  featureName,
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const effectiveTitle = title ?? "Función premium";
  const effectiveDescription =
    description ??
    `Ahora mismo no hay anuncios disponibles para ${
      featureName ?? "usar esta función"
    }.\n\nPuedes intentarlo de nuevo más tarde o desbloquearla al hacerte premium.`;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? "#020617" : "#ffffff",
              borderColor: isDark
                ? "rgba(148,163,184,0.4)"
                : "rgba(15,23,42,0.08)",
            },
          ]}
        >
          <LinearGradient
            colors={["#facc15", "#fb923c", "#a855f7"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.header}
          >
            <View style={styles.iconWrapper}>
              <Crown size={22} color="#0b1220" />
            </View>
            <Text style={styles.headerTitle}>{effectiveTitle}</Text>
          </LinearGradient>

          <View style={styles.content}>
            <Text
              style={[
                styles.description,
                { color: isDark ? "#e5e7eb" : "#0f172a" },
              ]}
            >
              {effectiveDescription}
            </Text>
          </View>

          <View style={styles.actions}>
            <Pressable
              onPress={onClose}
              style={[
                styles.button,
                styles.secondaryButton,
                {
                  borderColor: isDark
                    ? "rgba(148,163,184,0.6)"
                    : "rgba(15,23,42,0.16)",
                },
              ]}
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: isDark ? "#e5e7eb" : "#111827" },
                ]}
              >
                Más tarde
              </Text>
            </Pressable>

            <Pressable
              onPress={onGoPremium ?? onClose}
              style={[styles.button, styles.primaryButton]}
            >
              <Text style={[styles.buttonText, { color: "#0b1220" }]}>
                Hazte premium
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default PremiumUpsellModal;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  header: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#0b1220",
    fontWeight: "800",
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    padding: 14,
    paddingTop: 4,
    justifyContent: "flex-end",
    gap: 10,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    minWidth: 110,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: "transparent",
  },
  primaryButton: {
    backgroundColor: "#facc15",
  },
  buttonText: {
    fontWeight: "700",
    fontSize: 13,
  },
});

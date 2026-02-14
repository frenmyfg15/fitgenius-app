import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {
  AlertTriangle,
  RefreshCcw,
  Crown,
  X,
} from "lucide-react-native";
import { useColorScheme } from "nativewind";

type NoAdsModalProps = {
  visible: boolean;
  loading: boolean;
  onRetry: () => void;
  onGoPremium?: () => void;
  onClose: () => void;
};

export default function NoAdsModal({
  visible,
  loading,
  onRetry,
  onGoPremium,
  onClose,
}: NoAdsModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View
          className="relative w-full max-w-md rounded-3xl p-5"
          style={{
            backgroundColor: isDark ? "#020617" : "#ffffff",
            borderWidth: 1,
            borderColor: isDark ? "#1f2937" : "#e5e7eb",
          }}
        >
          {/* ❌ BOTÓN CERRAR (ARRIBA DERECHA) */}
          <TouchableOpacity
            onPress={onClose}
            accessibilityLabel="Cerrar"
            hitSlop={10}
            className="absolute right-3 top-3 z-10"
            disabled={loading}
          >
            <X size={20} color={isDark ? "#e5e7eb" : "#374151"} />
          </TouchableOpacity>

          {/* Header */}
          <View className="flex-row items-center mb-3 pr-6">
            <View
              className="w-10 h-10 mr-3 rounded-full items-center justify-center"
              style={{
                backgroundColor: isDark ? "#111827" : "#eff6ff",
              }}
            >
              <AlertTriangle
                size={22}
                color={isDark ? "#fbbf24" : "#f97316"}
              />
            </View>
            <Text
              className="text-lg font-semibold"
              style={{ color: isDark ? "#f9fafb" : "#111827" }}
            >
              Ahora no hay anuncios disponibles
            </Text>
          </View>

          <Text
            className="text-sm mb-4"
            style={{ color: isDark ? "#9ca3af" : "#4b5563" }}
          >
            Para guardar esta sesión necesitas ver un anuncio, pero en este
            momento no hay ninguno disponible.
            {"\n\n"}
            Puedes intentar buscar uno de nuevo durante unos segundos o
            pasarte a la versión Premium desde tu perfil.
          </Text>

          {/* Estado de búsqueda */}
          {loading && (
            <View className="flex-row items-center mb-3">
              <ActivityIndicator size="small" />
              <Text
                className="ml-2 text-xs"
                style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
              >
                Buscando anuncios disponibles hasta 1 minuto...
              </Text>
            </View>
          )}

          {/* Acciones */}
          <View className="flex-row justify-end gap-3 mt-3">
            {onGoPremium && (
              <TouchableOpacity
                onPress={onGoPremium}
                disabled={loading}
                className="px-3 py-2 rounded-full flex-row items-center"
                style={{
                  backgroundColor: isDark ? "#111827" : "#fef3c7",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                <Crown
                  size={16}
                  color={isDark ? "#fde68a" : "#b45309"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  className="text-sm font-semibold"
                  style={{ color: isDark ? "#fbbf24" : "#92400e" }}
                >
                  Ver Premium
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onRetry}
              disabled={loading}
              className="px-3 py-2 rounded-full flex-row items-center"
              style={{
                backgroundColor: "#22c55e",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <RefreshCcw
                  size={16}
                  color="#ffffff"
                  style={{ marginRight: 6 }}
                />
              )}
              {!loading && (
                <Text className="text-sm font-semibold text-white">
                  Reintentar anuncio
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

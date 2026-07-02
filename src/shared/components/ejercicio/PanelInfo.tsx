// File: src/shared/components/ejercicio/PanelInfo.tsx
import React, { useCallback, useMemo, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { X } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
} from "@gorhom/bottom-sheet";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font, TextStyle } from "@/shared/constants/typography";

type Instruccion = { paso: number; texto: string };

type Props = {
  visible: boolean;
  onClose: () => void;
  materiales: string[];
  instrucciones: Instruccion[];
  nombreEjercicio?: string;
};

export default function PanelInfo({
  visible,
  onClose,
  materiales,
  instrucciones,
  nombreEjercicio,
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);
  const insets = useSafeAreaInsets();

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  const snapPoints = useMemo(() => ["50%", "80%"], []);

  useEffect(() => {
    if (visible) bottomSheetModalRef.current?.present();
    else bottomSheetModalRef.current?.dismiss();
  }, [visible]);

  const handleClosePress = useCallback(() => {
    bottomSheetModalRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    []
  );

  const topInset = Math.max(insets.top, 12);

  return (
    <BottomSheetModal
      ref={bottomSheetModalRef}
      index={1}
      snapPoints={snapPoints}
      onDismiss={onClose}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableOverDrag={false}
      overDragResistanceFactor={0}
      topInset={topInset}
      backgroundStyle={{
        backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
      }}
      handleIndicatorStyle={{
        backgroundColor: t.textSecondary,
        width: 40,
      }}
      style={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
      containerStyle={{
        zIndex: 9999,
        ...(Platform.OS === "android" ? { elevation: 9999 } : null),
      }}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: t.textPrimary }]}>
            Información
          </Text>
          {nombreEjercicio ? (
            <Text
              numberOfLines={2}
              style={[styles.headerSubtitle, { color: t.textSecondary }]}
            >
              {nombreEjercicio}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          onPress={handleClosePress}
          activeOpacity={0.85}
          style={[
            styles.closeBtn,
            { backgroundColor: isDark ? t.border : t.surface },
          ]}
        >
          <X size={18} color={t.textPrimary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + insets.bottom },
        ]}
      >
        <SectionTitle label="Materiales" color={t.textPrimary} />
        <View style={styles.chipsRow}>
          {materiales.length > 0 ? (
            materiales.map((item) => (
              <View
                key={item}
                style={[
                  styles.chip,
                  {
                    backgroundColor: isDark ? t.border : t.surface,
                    borderColor: t.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: t.textSecondary }]}>
                  {item}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: t.textSecondary }]}>
              No se requiere material.
            </Text>
          )}
        </View>

        <SectionTitle label="Instrucciones" color={t.textPrimary} />
        <View style={styles.stepsCol}>
          {instrucciones.length > 0 ? (
            instrucciones.map((i) => (
              <View
                key={i.paso}
                style={[
                  styles.stepCard,
                  {
                    backgroundColor: isDark ? t.border : t.surface,
                    borderColor: t.border,
                  },
                ]}
              >
                <Text style={[styles.stepNum, { color: Colors.accent }]}>
                  {i.paso}
                </Text>
                <Text style={[styles.stepText, { color: t.textPrimary }]}>
                  {i.texto}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.emptyText, { color: t.textSecondary }]}>
              No hay instrucciones disponibles.
            </Text>
          )}
        </View>
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

function SectionTitle({ label, color }: { label: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{label}</Text>;
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    marginRight: 12,
    gap: 4,
  },
  headerTitle: {
    ...TextStyle.h3,
    fontFamily: Font.title.semiBold,
  },
  headerSubtitle: {
    ...TextStyle.label,
    fontFamily: Font.body.regular,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  sectionTitle: {
    ...TextStyle.label,
    fontFamily: Font.body.bold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 8,
    marginBottom: 8,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    ...TextStyle.bodySm,
    fontFamily: Font.body.semiBold,
  },
  stepsCol: {
    gap: 8,
  },
  stepCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepNum: {
    ...TextStyle.body,
    fontFamily: Font.body.bold,
    width: 20,
    textAlign: "center",
    marginTop: 1,
  },
  stepText: {
    flex: 1,
    ...TextStyle.label,
    fontFamily: Font.body.regular,
  },
  emptyText: {
    ...TextStyle.label,
    fontFamily: Font.body.regular,
  },
});

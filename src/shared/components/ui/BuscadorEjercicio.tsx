// src/shared/components/ui/BuscadorEjercicio.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useColorScheme } from "nativewind";
import { X, Filter, Search } from "lucide-react-native";
import { buscarEjercicios } from "@/features/api/ejercicios.api";
import { SafeAreaView } from "react-native-safe-area-context";

/* -------------------- Tipos -------------------- */
type Ejercicio = {
  id: number;
  nombre: string;
  tipoEjercicio: string;
  grupoMuscular: string;
  idGif: string;
};
type ApiResult = {
  items: Ejercicio[];
  nextCursor: number | null;
  hasMore: boolean;
};

type Props = {
  onClose: () => void;
  onSelect?: (id: number, ejercicio?: Ejercicio) => void;
  titulo?: string;
  descripcion?: string;
};

const GRUPOS = ["PECHOS", "ESPALDA", "HOMBROS", "BRAZOS", "PIERNAS", "CORE", "CARDIO", "OTROS"];
const TIPOS = ["FUERZA", "CARDIO", "FLEXIBILIDAD", "BALANCE", "FUNCIONAL"];

/* -------------------- Componente -------------------- */
export default function BuscadorEjercicio({
  onClose,
  onSelect,
  titulo = "Buscar ejercicio",
  descripcion = "Filtra por nombre, tipo o grupo muscular.",
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const [search, setSearch] = useState("");
  const [grupo, setGrupo] = useState("");
  const [tipo, setTipo] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [resultados, setResultados] = useState<Ejercicio[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // clave de consulta memorizada (evita condiciones de carrera)
  const queryKey = useMemo(
    () => JSON.stringify({ s: search.trim(), g: grupo || undefined, t: tipo || undefined }),
    [search, grupo, tipo]
  );
  const lastQueryKeyRef = useRef(queryKey);

  // Tokens UI minimal
  const bg = isDark ? "#0b1220" : "#ffffff";
  const surface = isDark ? "rgba(255,255,255,0.04)" : "#f8fafc";
  const surface2 = isDark ? "rgba(255,255,255,0.06)" : "#f1f5f9";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const line = isDark ? "rgba(255,255,255,0.10)" : "#e5e7eb";
  const ring  = isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";

  /* ---------- Fetch (debounced) ---------- */
  useEffect(() => {
    lastQueryKeyRef.current = queryKey;
    setError(null);

    const handler = setTimeout(async () => {
      const trimmed = search.trim();
      const shouldSearch = trimmed.length >= 2 || !!grupo || !!tipo;

      // Resetea si no hay criterios suficientes
      if (!shouldSearch) {
        setResultados([]);
        setNextCursor(null);
        setHasMore(false);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const res: ApiResult = await buscarEjercicios({
          search: trimmed || undefined,
          grupoMuscular: grupo || undefined,
          tipoEjercicio: tipo || undefined,
          take: 30,
          cursor: undefined,
        });

        if (lastQueryKeyRef.current !== queryKey) return;

        const items = Array.isArray((res as any)?.items) ? ((res as any).items as Ejercicio[]) : [];
        setResultados(items);
        setNextCursor((res as any)?.nextCursor ?? null);
        setHasMore(Boolean((res as any)?.hasMore));
      } catch {
        if (lastQueryKeyRef.current !== queryKey) return;
        setResultados([]);
        setNextCursor(null);
        setHasMore(false);
        setError("No se pudo cargar la búsqueda. Intenta de nuevo.");
      } finally {
        if (lastQueryKeyRef.current === queryKey) setLoading(false);
      }
    }, 350);

    return () => clearTimeout(handler);
  }, [queryKey, search, grupo, tipo]);

  /* ---------- Load more ---------- */
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || nextCursor == null) return;
    const key = lastQueryKeyRef.current;
    setLoadingMore(true);
    try {
      const res: ApiResult = await buscarEjercicios({
        search: search.trim() || undefined,
        grupoMuscular: grupo || undefined,
        tipoEjercicio: tipo || undefined,
        take: 30,
        cursor: nextCursor,
      });
      if (lastQueryKeyRef.current !== key) return;

      const incoming = Array.isArray((res as any)?.items) ? ((res as any).items as Ejercicio[]) : [];
      setResultados((prev) => {
        const seen = new Set(prev.map((x) => x.id));
        return [...prev, ...incoming.filter((x) => !seen.has(x.id))];
      });
      setNextCursor((res as any)?.nextCursor ?? null);
      setHasMore(Boolean((res as any)?.hasMore));
    } finally {
      if (lastQueryKeyRef.current === key) setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor, search, grupo, tipo]);

  /* ---------- Reset rápido ---------- */
  const clearFilters = () => {
    setSearch("");
    setGrupo("");
    setTipo("");
  };

  const statusText =
    loading
      ? "Buscando…"
      : error
      ? error
      : !loading && resultados.length === 0 && (search || grupo || tipo)
      ? "No se encontraron ejercicios"
      : "";

  /* -------------------- Render (FULLSCREEN) -------------------- */
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg, zIndex: 50 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header minimal */}
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            borderBottomWidth: 1,
            borderColor: line,
            backgroundColor: bg,
          }}
        >
          {/* Top row: título + cerrar */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ flex: 1, color: textPrimary, fontWeight: "800", fontSize: 18 }}>
              {titulo}
            </Text>

            {/* Botón cerrar (Pressable) */}
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Cerrar"
              style={{
                height: 36,
                minWidth: 36,
                paddingHorizontal: 8,
                borderRadius: 10,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: surface,
                borderWidth: 1,
                borderColor: line,
              }}
            >
              <X size={18} color={textSecondary} />
            </Pressable>
          </View>

          {!!descripcion && (
            <Text style={{ marginTop: 4, fontSize: 12, color: textSecondary }}>
              {descripcion}
            </Text>
          )}

          {/* Search bar */}
          <View
            style={{
              marginTop: 10,
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 12,
              borderWidth: 1,
              borderColor: ring,
              backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "#ffffff",
              paddingHorizontal: 10,
              height: 44,
            }}
          >
            <Search size={18} color={textSecondary} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Ej: press banca, remo…"
              placeholderTextColor={isDark ? "#64748b" : "#94a3b8"}
              style={{ flex: 1, marginLeft: 8, color: textPrimary }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="search"
            />
            {Boolean(search) && (
              <Pressable onPress={() => setSearch("")} style={{ padding: 6, marginLeft: 4 }}>
                <X size={16} color={textSecondary} />
              </Pressable>
            )}
          </View>

          {/* Acciones rápidas */}
          <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
            <Pressable
              onPress={() => setMostrarFiltros((v) => !v)}
              style={{
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                backgroundColor: surface,
                borderWidth: 1,
                borderColor: line,
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
              accessibilityState={{ expanded: mostrarFiltros }}
            >
              <Filter size={16} color={textSecondary} />
              <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 12 }}>Filtros</Text>
            </Pressable>

            {(search || grupo || tipo) ? (
              <Pressable
                onPress={clearFilters}
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: surface,
                  borderWidth: 1,
                  borderColor: line,
                }}
              >
                <Text style={{ color: textPrimary, fontWeight: "700", fontSize: 12 }}>Limpiar</Text>
              </Pressable>
            ) : null}
          </View>

          {/* Panel filtros (minimal) */}
          {mostrarFiltros && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
              <SelectChip label="Grupo" value={grupo} options={GRUPOS} onChange={setGrupo} isDark={isDark} />
              <SelectChip label="Tipo" value={tipo} options={TIPOS} onChange={setTipo} isDark={isDark} />
            </View>
          )}
        </View>

        {/* Lista */}
        <FlatList
          data={resultados}
          keyExtractor={(item) => `${item.id}-${item.idGif}`}
          contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
          ListHeaderComponent={
            loading ? (
              <View style={{ width: "100%", gap: 10 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <View
                    key={i}
                    style={{
                      height: 88,
                      borderRadius: 12,
                      backgroundColor: surface2,
                      borderWidth: 1,
                      borderColor: line,
                    }}
                  />
                ))}
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect?.(item.id, item)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: line,
                backgroundColor: surface,
                marginBottom: 10,
              }}
            >
              {/* Imagen */}
              <View
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
                  borderWidth: 1,
                  borderColor: line,
                }}
              >
                <Image
                  source={{
                    uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${item.idGif}.gif`,
                  }}
                  style={{ width: "100%", height: "100%" }}
                />
              </View>

              {/* Info */}
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text numberOfLines={1} style={{ color: textPrimary, fontWeight: "800", fontSize: 14 }}>
                  {item.nombre}
                </Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                  <Chip text={item.tipoEjercicio} isDark={isDark} />
                  <Chip text={item.grupoMuscular} isDark={isDark} />
                </View>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            !loading && (search || grupo || tipo) ? (
              <View
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 12,
                  backgroundColor: surface,
                  borderWidth: 1,
                  borderColor: line,
                }}
              >
                <Text style={{ color: textSecondary, fontSize: 13 }}>{statusText}</Text>
              </View>
            ) : null
          }
          onEndReachedThreshold={0.4}
          onEndReached={() => {
            if (hasMore && !loading && !loadingMore) loadMore();
          }}
          ListFooterComponent={
            hasMore ? (
              <View style={{ paddingVertical: 10, alignItems: "center" }}>
                <Pressable
                  onPress={loadMore}
                  disabled={loadingMore}
                  style={{
                    borderRadius: 10,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    backgroundColor: surface,
                    borderWidth: 1,
                    borderColor: line,
                    opacity: loadingMore ? 0.7 : 1,
                  }}
                >
                  {loadingMore ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={{ color: textPrimary, fontWeight: "800", fontSize: 13 }}>
                      Cargar más
                    </Text>
                  )}
                </Pressable>
              </View>
            ) : null
          }
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

/* -------------------- Subcomponentes -------------------- */

function SelectChip({
  label,
  value,
  options,
  onChange,
  isDark,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  isDark: boolean;
}) {
  // Alterna simple para MVP
  const next = () => {
    if (!value) {
      onChange(options[0]);
      return;
    }
    const i = options.indexOf(value);
    const ni = (i + 1) % options.length;
    onChange(options[ni]);
  };

  const chipBg = isDark ? "rgba(255,255,255,0.04)" : "#ffffff";
  const chipRing = isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0";
  const textPrimary = isDark ? "#e5e7eb" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";

  return (
    <Pressable
      onPress={next}
      style={{
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: chipRing,
        backgroundColor: chipBg,
        paddingHorizontal: 12,
        paddingVertical: 10,
      }}
    >
      <Text style={{ color: textSecondary, fontSize: 11, marginBottom: 2 }}>{label}</Text>
      <Text style={{ color: textPrimary, fontSize: 13, fontWeight: "700" }}>
        {value || "—"}
      </Text>
    </Pressable>
  );
}

function Chip({ text, isDark }: { text: string; isDark: boolean }) {
  return (
    <View
      style={{
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.12)" : "#e2e8f0",
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "800", color: isDark ? "#e5e7eb" : "#0f172a" }}>
        {text}
      </Text>
    </View>
  );
}

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
  Image,
  Modal,
  TouchableOpacity,
} from "react-native";
import { useColorScheme } from "nativewind";
import {
  X,
  Filter,
  Search,
  ChevronDown,
  Check,
  Plus,
  Activity,
  Target,
} from "lucide-react-native";
import { buscarEjercicios } from "@/features/api/ejercicios.api";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, scheme } from "@/shared/constants/colors";
import { Font } from "@/shared/constants/typography";

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

const GRUPOS = [
  "PECHOS",
  "ESPALDA",
  "HOMBROS",
  "BRAZOS",
  "PIERNAS",
  "CORE",
  "CARDIO",
  "OTROS",
];
const TIPOS = ["FUERZA", "CARDIO", "FLEXIBILIDAD", "BALANCE", "FUNCIONAL"];

export default function BuscadorEjercicio({
  onClose,
  onSelect,
  titulo = "Buscar ejercicio",
  descripcion = "Filtra por nombre, tipo o grupo muscular.",
}: Props) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = scheme(isDark);
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [grupo, setGrupo] = useState("");
  const [tipo, setTipo] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [selectOpen, setSelectOpen] = useState<null | "grupo" | "tipo">(null);
  const [ejercicioDetalle, setEjercicioDetalle] = useState<Ejercicio | null>(null);

  const [resultados, setResultados] = useState<Ejercicio[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryKey = useMemo(
    () =>
      JSON.stringify({
        s: search.trim(),
        g: grupo || undefined,
        t: tipo || undefined,
      }),
    [search, grupo, tipo]
  );
  const lastQueryKeyRef = useRef(queryKey);

  const bg = isDark ? Colors.primary : Colors.secondary;
  const surface = isDark ? t.border : t.surface;
  const surface2 = isDark ? t.border : t.surface;

  useEffect(() => {
    lastQueryKeyRef.current = queryKey;
    setError(null);

    const handler = setTimeout(async () => {
      const trimmed = search.trim();
      const shouldSearch = trimmed.length >= 2 || !!grupo || !!tipo;

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

        const items = Array.isArray((res as any)?.items)
          ? ((res as any).items as Ejercicio[])
          : [];
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

      const incoming = Array.isArray((res as any)?.items)
        ? ((res as any).items as Ejercicio[])
        : [];

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

  const clearFilters = () => {
    setSearch("");
    setGrupo("");
    setTipo("");
  };

  const statusText = loading
    ? "Buscando…"
    : error
      ? error
      : !loading && resultados.length === 0 && (search || grupo || tipo)
        ? "No se encontraron ejercicios"
        : "";

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: bg }}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 8,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderColor: t.border,
              backgroundColor: bg,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  flex: 1,
                  color: t.textPrimary,
                  fontWeight: "800",
                  fontFamily: Font.body.bold,
                  fontSize: 18,
                }}
              >
                {titulo}
              </Text>
              <Pressable
                onPress={onClose}
                style={{
                  height: 36,
                  minWidth: 36,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: surface,
                  borderWidth: 1,
                  borderColor: t.border,
                }}
              >
                <X size={18} color={t.textSecondary} />
              </Pressable>
            </View>

            {!!descripcion && (
              <Text style={{ marginTop: 4, fontSize: 12, fontFamily: Font.body.regular, color: t.textSecondary }}>
                {descripcion}
              </Text>
            )}

            <View
              style={{
                marginTop: 10,
                flexDirection: "row",
                alignItems: "center",
                borderRadius: 12,
                borderWidth: 1,
                borderColor: t.border,
                backgroundColor: isDark ? Colors.dark.surface : Colors.secondary,
                paddingHorizontal: 10,
                height: 44,
              }}
            >
              <Search size={18} color={t.textSecondary} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Ej: press banca, remo…"
                placeholderTextColor={t.textTertiary}
                style={{ flex: 1, marginLeft: 8, color: t.textPrimary }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="search"
              />
              {Boolean(search) && (
                <Pressable
                  onPress={() => setSearch("")}
                  style={{ padding: 6, marginLeft: 4 }}
                >
                  <X size={16} color={t.textSecondary} />
                </Pressable>
              )}
            </View>

            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              <Pressable
                onPress={() => setMostrarFiltros((v) => !v)}
                style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: surface,
                  borderWidth: 1,
                  borderColor: t.border,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Filter size={16} color={t.textSecondary} />
                <Text
                  style={{
                    color: t.textPrimary,
                    fontWeight: "700",
                    fontFamily: Font.body.bold,
                    fontSize: 12,
                  }}
                >
                  Filtros
                </Text>
              </Pressable>

              {search || grupo || tipo ? (
                <Pressable
                  onPress={clearFilters}
                  style={{
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: surface,
                    borderWidth: 1,
                    borderColor: t.border,
                  }}
                >
                  <Text
                    style={{
                      color: t.textPrimary,
                      fontWeight: "700",
                      fontFamily: Font.body.bold,
                      fontSize: 12,
                    }}
                  >
                    Limpiar
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {mostrarFiltros && (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <SelectField
                  label="Grupo"
                  value={grupo}
                  placeholder="Todos"
                  onPress={() => setSelectOpen("grupo")}
                  isDark={isDark}
                />
                <SelectField
                  label="Tipo"
                  value={tipo}
                  placeholder="Todos"
                  onPress={() => setSelectOpen("tipo")}
                  isDark={isDark}
                />
              </View>
            )}
          </View>

          <FlatList
            data={resultados}
            keyExtractor={(item) => `${item.id}-${item.idGif}`}
            contentContainerStyle={{
              padding: 16,
              paddingBottom: 24 + insets.bottom,
            }}
            keyboardShouldPersistTaps="handled"
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
                        borderColor: t.border,
                      }}
                    />
                  ))}
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setEjercicioDetalle(item)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: t.border,
                  backgroundColor: surface,
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 10,
                    overflow: "hidden",
                    backgroundColor: isDark ? t.border : Colors.secondary,
                    borderWidth: 1,
                    borderColor: t.border,
                  }}
                >
                  <Image
                    source={{
                      uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/f_auto,q_auto/ejercicios/${item.idGif}.gif`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                  />
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    numberOfLines={1}
                    style={{
                      color: t.textPrimary,
                      fontWeight: "800",
                      fontFamily: Font.body.bold,
                      fontSize: 14,
                    }}
                  >
                    {item.nombre}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 8,
                      marginTop: 8,
                      flexWrap: "wrap",
                    }}
                  >
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
                    borderColor: t.border,
                  }}
                >
                  <Text style={{ color: t.textSecondary, fontFamily: Font.body.regular, fontSize: 13 }}>
                    {statusText}
                  </Text>
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
                      borderColor: t.border,
                      opacity: loadingMore ? 0.7 : 1,
                    }}
                  >
                    {loadingMore ? (
                      <ActivityIndicator />
                    ) : (
                      <Text
                        style={{
                          color: t.textPrimary,
                          fontWeight: "800",
                          fontFamily: Font.body.bold,
                          fontSize: 13,
                        }}
                      >
                        Cargar más
                      </Text>
                    )}
                  </Pressable>
                </View>
              ) : null
            }
          />

          <SelectModal
            visible={selectOpen === "grupo"}
            title="Selecciona grupo"
            value={grupo}
            options={GRUPOS}
            isDark={isDark}
            onClose={() => setSelectOpen(null)}
            onSelect={(v) => {
              setGrupo(v === "__ALL__" ? "" : v);
              setSelectOpen(null);
            }}
          />
          <SelectModal
            visible={selectOpen === "tipo"}
            title="Selecciona tipo"
            value={tipo}
            options={TIPOS}
            isDark={isDark}
            onClose={() => setSelectOpen(null)}
            onSelect={(v) => {
              setTipo(v === "__ALL__" ? "" : v);
              setSelectOpen(null);
            }}
          />

          <Modal
            visible={!!ejercicioDetalle}
            transparent
            animationType="fade"
            onRequestClose={() => setEjercicioDetalle(null)}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: "rgba(0,0,0,0.75)",
                justifyContent: "center",
                padding: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: bg,
                  borderRadius: 24,
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: t.border,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    aspectRatio: 1.25,
                    backgroundColor: "#fff",
                  }}
                >
                  {ejercicioDetalle && (
                    <Image
                      source={{
                        uri: `https://res.cloudinary.com/dcn4vq1n4/image/upload/v1752248579/ejercicios/${ejercicioDetalle.idGif}.gif`,
                      }}
                      style={{ width: "100%", height: "100%" }}
                      resizeMode="contain"
                    />
                  )}
                  <Pressable
                    onPress={() => setEjercicioDetalle(null)}
                    style={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      backgroundColor: "rgba(0,0,0,0.5)",
                      borderRadius: 20,
                      padding: 6,
                    }}
                  >
                    <X size={18} color="#fff" />
                  </Pressable>
                </View>

                <View style={{ padding: 16 }}>
                  <Text
                    style={{
                      color: t.textPrimary,
                      fontSize: 20,
                      fontWeight: "800",
                      fontFamily: Font.body.bold,
                      marginBottom: 12,
                    }}
                  >
                    {ejercicioDetalle?.nombre}
                  </Text>

                  <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
                    <View
                      style={{
                        flex: 1,
                        padding: 10,
                        backgroundColor: surface2,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: t.border,
                      }}
                    >
                      <Activity size={16} color="#39FF14" />
                      <Text
                        style={{
                          color: t.textSecondary,
                          fontSize: 9,
                          marginTop: 4,
                          fontWeight: "600",
                          fontFamily: Font.body.semiBold,
                        }}
                      >
                        TIPO
                      </Text>
                      <Text style={{ color: t.textPrimary, fontWeight: "700", fontFamily: Font.body.bold, fontSize: 12 }}>
                        {ejercicioDetalle?.tipoEjercicio}
                      </Text>
                    </View>

                    <View
                      style={{
                        flex: 1,
                        padding: 10,
                        backgroundColor: surface2,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: t.border,
                      }}
                    >
                      <Target size={16} color="#39FF14" />
                      <Text
                        style={{
                          color: t.textSecondary,
                          fontSize: 9,
                          marginTop: 4,
                          fontWeight: "600",
                          fontFamily: Font.body.semiBold,
                        }}
                      >
                        GRUPO
                      </Text>
                      <Text style={{ color: t.textPrimary, fontWeight: "700", fontFamily: Font.body.bold, fontSize: 12 }}>
                        {ejercicioDetalle?.grupoMuscular}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      onPress={() => setEjercicioDetalle(null)}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: "center",
                        borderWidth: 1,
                        borderColor: t.border,
                      }}
                    >
                      <Text style={{ color: t.textSecondary, fontWeight: "700", fontFamily: Font.body.bold, fontSize: 13 }}>
                        Cerrar
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        if (ejercicioDetalle) {
                          onSelect?.(ejercicioDetalle.id, ejercicioDetalle);
                          setEjercicioDetalle(null);
                        }
                      }}
                      style={{
                        flex: 1.4,
                        backgroundColor: "#39FF14",
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: "center",
                        flexDirection: "row",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Plus size={18} color="#111111" />
                      <Text style={{ color: "#111111", fontWeight: "800", fontFamily: Font.body.bold, fontSize: 13 }}>
                        Añadir
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function SelectField({
  label,
  value,
  placeholder,
  onPress,
  isDark,
}: {
  label: string;
  value: string;
  placeholder: string;
  onPress: () => void;
  isDark: boolean;
}) {
  const t = scheme(isDark);

  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: t.border,
        backgroundColor: isDark ? t.border : Colors.secondary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
      }}
    >
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ color: t.textSecondary, fontFamily: Font.body.regular, fontSize: 11, marginBottom: 2 }}>
          {label}
        </Text>
        <Text
          numberOfLines={1}
          style={{ color: t.textPrimary, fontFamily: Font.body.bold, fontSize: 13, fontWeight: "700" }}
        >
          {value || placeholder}
        </Text>
      </View>
      <ChevronDown size={16} color={t.textSecondary} />
    </Pressable>
  );
}

const SELECTED_GREEN = { dark: "#22c55e", light: "#16a34a" };

function SelectModal({
  visible,
  title,
  value,
  options,
  onSelect,
  onClose,
  isDark,
}: {
  visible: boolean;
  title: string;
  value: string;
  options: string[];
  onSelect: (v: string) => void;
  onClose: () => void;
  isDark: boolean;
}) {
  const insets = useSafeAreaInsets();
  const t = scheme(isDark);
  const data = useMemo(() => ["__ALL__", ...options], [options]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.55)" }}>
        <View
          style={{
            backgroundColor: isDark ? Colors.primary : Colors.secondary,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            borderWidth: 1,
            borderColor: t.border,
            maxHeight: "70%",
            paddingBottom: 10 + insets.bottom,
          }}
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 14,
              paddingBottom: 10,
              borderBottomWidth: 1,
              borderColor: t.border,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: t.textPrimary, fontWeight: "800", fontFamily: Font.body.bold, fontSize: 16 }}>
              {title}
            </Text>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <X size={18} color={t.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={data}
            keyExtractor={(it) => it}
            contentContainerStyle={{
              padding: 10,
              paddingBottom: 10 + insets.bottom,
            }}
            renderItem={({ item }) => {
              const label = item === "__ALL__" ? "Todos" : item;
              const selected = item === "__ALL__" ? value === "" : value === item;

              return (
                <Pressable
                  onPress={() => onSelect(item)}
                  style={{
                    paddingVertical: 12,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: t.border,
                    backgroundColor: isDark ? Colors.dark.surface : t.surface,
                    marginBottom: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: t.textPrimary, fontWeight: "700", fontFamily: Font.body.bold }}>{label}</Text>
                  {selected ? (
                    <Check size={18} color={isDark ? SELECTED_GREEN.dark : SELECTED_GREEN.light} />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

function Chip({ text, isDark }: { text: string; isDark: boolean }) {
  const t = scheme(isDark);
  return (
    <View
      style={{
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 6,
        backgroundColor: isDark ? t.border : Colors.secondary,
        borderWidth: 1,
        borderColor: t.border,
      }}
    >
      <Text
        style={{
          fontSize: 11,
          fontWeight: "800",
          fontFamily: Font.body.bold,
          color: t.textPrimary,
        }}
      >
        {text}
      </Text>
    </View>
  );
}

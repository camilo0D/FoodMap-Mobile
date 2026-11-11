import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import Stars from "../components/Stars";
import ReviewForm from "../components/ReviewForm";
import { getMenu, getResenas } from "../services/restaurant";
import { DIAS_ORDEN, ETIQUETA_DIA, diaActual, estadoAbierto } from "../utils/horario";
import { fechaCorta, precioCOP } from "../utils/format";
import { colors, radius, spacing } from "../theme";
import type { RootStackParamList } from "../navigation/types";
import type { Plato, Resena } from "../types";
import FavoriteButton from "../components/FavoriteButton";

type Props = NativeStackScreenProps<RootStackParamList, "Detalle">;
type Tab = "info" | "menu" | "resenas";

export default function RestaurantDetailScreen({ route, navigation }: Props) {
    const { restaurante: r, distanciaKm } = route.params;
    const insets = useSafeAreaInsets();
    const [tab, setTab] = useState<Tab>("info");
    const [platos, setPlatos] = useState<Plato[] | null>(null);
    const [resenas, setResenas] = useState<Resena[] | null>(null);
    const [totalResenas, setTotalResenas] = useState(0);
    const [verForm, setVerForm] = useState(false);
    const estado = estadoAbierto(r.horario);

    const cargarResenas = useCallback(
        () =>
            getResenas(r.id)
                .then((d) => { setResenas(d.results); setTotalResenas(d.total); })
                .catch(() => setResenas([])),
        [r.id]
    );

    useEffect(() => {
        getMenu(r.id).then(setPlatos).catch(() => setPlatos([]));
        cargarResenas();
    }, [r.id, cargarResenas]);

    const comoLlegar = () =>
        Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${r.latitud},${r.longitud}`);
    const llamar = () => Linking.openURL(`tel:${r.telefono}`);

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
                <View>
                    {r.imagen ? (
                        <Image source={{ uri: r.imagen }} style={styles.portada} />
                    ) : (
                        <View style={[styles.portada, styles.sinFoto]}>
                            <Ionicons name="restaurant" size={48} color={colors.primary} />
                        </View>
                    )}
                    <Pressable style={[styles.atras, { top: insets.top + 8 }]} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={22} color={colors.text} />
                    </Pressable>
                    <View style={{ position: "absolute", right: spacing.lg, top: insets.top + 8 }}>
                        <FavoriteButton restaurante={r} size={22} flotante />
                    </View>
                </View>

                <View style={styles.cuerpo}>
                    <View style={styles.filaTitulo}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nombre}>{r.nombre}</Text>
                            <Text style={styles.sub}>
                                {r.categoria?.nombre}
                                {distanciaKm != null ? ` · ${distanciaKm.toFixed(1)} km` : ""}
                            </Text>
                        </View>
                        <View style={styles.rating}>
                            <Ionicons name="star" size={14} color={colors.star} />
                            <Text style={styles.ratingTxt}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                        </View>
                    </View>

                    {estado && (
                        <View style={[styles.badge, { backgroundColor: estado.abierto ? "#E3F5E8" : "#FBE4E1" }]}>
                            <View style={[styles.dot, { backgroundColor: estado.abierto ? "#2E9E5B" : "#C7392B" }]} />
                            <Text style={{ color: estado.abierto ? "#1F7A44" : "#A12B1F", fontSize: 12, fontWeight: "700" }}>
                                {estado.texto}
                            </Text>
                        </View>
                    )}

                    <View style={styles.tabs}>
                        {([["info", "Información"], ["menu", "Menú"], ["resenas", "Reseñas"]] as [Tab, string][]).map(
                            ([id, label]) => (
                                <Pressable key={id} onPress={() => setTab(id)} style={[styles.tab, tab === id && styles.tabActiva]}>
                                    <Text style={[styles.tabTxt, tab === id && styles.tabTxtActiva]}>{label}</Text>
                                </Pressable>
                            )
                        )}
                    </View>

                    {tab === "info" && (
                        <View style={{ gap: spacing.md }}>
                            {!!r.descripcion && <Text style={styles.texto}>{r.descripcion}</Text>}
                            <Pressable style={styles.fila} onPress={comoLlegar}>
                                <Ionicons name="location-outline" size={20} color={colors.primary} />
                                <Text style={[styles.texto, { flex: 1 }]}>{r.direccion}</Text>
                            </Pressable>
                            {!!r.telefono && (
                                <Pressable style={styles.fila} onPress={llamar}>
                                    <Ionicons name="call-outline" size={20} color={colors.primary} />
                                    <Text style={styles.texto}>{r.telefono}</Text>
                                </Pressable>
                            )}
                            <View style={styles.horario}>
                                <Text style={styles.subtitulo}>Horario</Text>
                                {r.horario && Object.keys(r.horario).length > 0 ? (
                                    DIAS_ORDEN.map((d) => (
                                        <View key={d} style={styles.filaHorario}>
                                            <Text style={[styles.texto, d === diaActual() && styles.hoy]}>{ETIQUETA_DIA[d]}</Text>
                                            <Text style={[styles.texto, d === diaActual() && styles.hoy]}>{r.horario?.[d] ?? "—"}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text style={styles.sub}>Este restaurante aún no publica su horario.</Text>
                                )}
                            </View>
                            <Pressable style={styles.btnSec} onPress={comoLlegar}>
                                <Ionicons name="navigate" size={18} color={colors.primary} />
                                <Text style={styles.btnSecTxt}>Cómo llegar</Text>
                            </Pressable>
                        </View>
                    )}

                    {tab === "menu" && (
                        <View style={{ gap: spacing.md }}>
                            {platos === null && <ActivityIndicator color={colors.primary} />}
                            {platos?.length === 0 && <Text style={styles.sub}>Este restaurante aún no publica su menú.</Text>}
                            {platos?.map((p) => (
                                <View key={p.id} style={[styles.plato, !p.disponible && { opacity: 0.5 }]}>
                                    {p.imagen ? (
                                        <Image source={{ uri: p.imagen }} style={styles.platoFoto} />
                                    ) : (
                                        <View style={[styles.platoFoto, styles.sinFoto]}>
                                            <Ionicons name="fast-food-outline" size={22} color={colors.primary} />
                                        </View>
                                    )}
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.platoNombre}>{p.nombre}</Text>
                                        {!!p.descripcion && <Text style={styles.sub} numberOfLines={2}>{p.descripcion}</Text>}
                                        <Text style={styles.precio}>{p.disponible ? precioCOP(p.precio) : "Agotado"}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    {tab === "resenas" && (
                        <View style={{ gap: spacing.md }}>
                            {resenas === null && <ActivityIndicator color={colors.primary} />}
                            {resenas?.length === 0 && <Text style={styles.sub}>Aún no hay reseñas. ¡Sé el primero!</Text>}
                            {resenas && resenas.length > 0 && (
                                <Text style={styles.sub}>{totalResenas} {totalResenas === 1 ? "reseña" : "reseñas"}</Text>
                            )}
                            {resenas?.map((x) => (
                                <View key={x.id} style={styles.resena}>
                                    <View style={styles.avatar}>
                                        <Text style={{ color: "#fff", fontWeight: "700" }}>{x.usuario_username.charAt(0).toUpperCase()}</Text>
                                    </View>
                                    <View style={{ flex: 1, gap: 2 }}>
                                        <View style={styles.filaHorario}>
                                            <Text style={styles.platoNombre}>{x.usuario_username}</Text>
                                            <Text style={styles.sub}>{fechaCorta(x.created_at)}</Text>
                                        </View>
                                        <Stars valor={x.rating} size={13} />
                                        {!!x.comment && <Text style={styles.texto}>{x.comment}</Text>}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <View style={[styles.barra, { paddingBottom: insets.bottom + spacing.md }]}>
                <Pressable style={styles.btnPrincipal} onPress={() => setVerForm(true)}>
                    <Ionicons name="star" size={18} color="#fff" />
                    <Text style={styles.btnPrincipalTxt}>Escribir una reseña</Text>
                </Pressable>
            </View>

            {verForm && (
                <ReviewForm
                    restauranteId={r.id}
                    onClose={() => setVerForm(false)}
                    onSent={() => { setVerForm(false); setTab("resenas"); cargarResenas(); }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    portada: { width: "100%", height: 250 },
    sinFoto: { backgroundColor: "#F3E4D6", alignItems: "center", justifyContent: "center" },
    atras: {
        position: "absolute", left: spacing.lg, width: 40, height: 40, borderRadius: 20,
        backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", elevation: 4,
    },
    cuerpo: {
        marginTop: -24, backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        padding: spacing.xl, gap: spacing.md,
    },
    filaTitulo: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
    nombre: { fontSize: 24, fontWeight: "800", color: colors.text },
    sub: { fontSize: 13, color: colors.textMuted },
    rating: {
        flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.surface,
        borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6,
    },
    ratingTxt: { fontWeight: "700", color: colors.text },
    badge: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
    dot: { width: 7, height: 7, borderRadius: 4 },
    tabs: { flexDirection: "row", backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4, marginTop: spacing.sm },
    tab: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: radius.pill },
    tabActiva: { backgroundColor: colors.primary },
    tabTxt: { fontWeight: "600", color: colors.textMuted, fontSize: 13 },
    tabTxtActiva: { color: "#fff" },
    texto: { fontSize: 14, color: colors.text, lineHeight: 20 },
    subtitulo: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: 4 },
    fila: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    horario: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 6 },
    filaHorario: { flexDirection: "row", justifyContent: "space-between" },
    hoy: { fontWeight: "800", color: colors.primary },
    btnSec: {
        flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center",
        borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 12,
    },
    btnSecTxt: { color: colors.primary, fontWeight: "700" },
    plato: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    platoFoto: { width: 72, height: 72, borderRadius: radius.md },
    platoNombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    precio: { marginTop: 4, fontWeight: "800", color: colors.primary },
    resena: { flexDirection: "row", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
    barra: {
        position: "absolute", left: 0, right: 0, bottom: 0, padding: spacing.lg,
        backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border,
    },
    btnPrincipal: {
        flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center",
        backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15,
    },
    btnPrincipalTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
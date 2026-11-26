import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import RouteMap from "../components/RouteMap";
import { useUserLocation } from "../hooks/useUserLocation";
import { Modo, obtenerRuta, Ruta } from "../services/routing";
import { formatoDistancia, formatoDuracion } from "../utils/geo";
import { radius, spacing, themed, useColors } from "../theme";
import type { RootStackParamList } from "../navigation/types";

const RADIOS = [300, 500, 1000];

export default function RouteScreen({ navigation, route }: NativeStackScreenProps<RootStackParamList, "Ruta">) {
    const styles = useStyles();
    const colors = useColors();
    const r = route.params.restaurante;
    const destino = { lat: Number(r.latitud), lng: Number(r.longitud) };
    const { ubicacion, estado: estadoUb, solicitar } = useUserLocation();

    const [modo, setModo] = useState<Modo>("carro");
    const [radio, setRadio] = useState(500);
    const [ruta, setRuta] = useState<Ruta | null>(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(false);
    const [senal, setSenal] = useState(0);

    useEffect(() => {
        solicitar();
    }, [solicitar]);

    const calcular = useCallback(() => {
        if (!ubicacion) return () => { };
        const control = new AbortController();
        setCargando(true);
        setError(false);
        obtenerRuta(ubicacion, destino, modo, control.signal)
            .then((x) => { setRuta(x); setCargando(false); })
            .catch(() => { if (!control.signal.aborted) { setRuta(null); setError(true); setCargando(false); } });
        return () => control.abort();
    }, [ubicacion?.lat, ubicacion?.lng, modo, destino.lat, destino.lng]);

    useEffect(() => calcular(), [calcular]);

    return (
        <View style={styles.container}>
            <RouteMap origen={ubicacion} destino={destino} ruta={ruta?.puntos ?? null} radioM={radio} color={colors.primary} centrarSenal={senal} />

            <SafeAreaView edges={["top"]} style={styles.top} pointerEvents="box-none">
                <Pressable style={styles.atras} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={22} color={colors.text} />
                </Pressable>
                <Pressable style={styles.atras} onPress={() => setSenal((s) => s + 1)}>
                    <Ionicons name="locate" size={22} color={colors.primary} />
                </Pressable>
            </SafeAreaView>

            <View style={styles.tarjeta}>
                <View style={styles.cabecera}>
                    {r.imagen ? (
                        <Image source={{ uri: r.imagen }} style={styles.foto} />
                    ) : (
                        <View style={[styles.foto, { backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" }]}>
                            <Ionicons name="restaurant" size={22} color={colors.primary} />
                        </View>
                    )}
                    <View style={{ flex: 1 }}>
                        <Text style={styles.nombre} numberOfLines={1}>{r.nombre}</Text>
                        <Text style={styles.sub} numberOfLines={1}>{r.categoria?.nombre} · {r.direccion}</Text>
                    </View>
                </View>

                <View style={styles.modos}>
                    {([["carro", "car", "En carro"], ["pie", "walk", "A pie"]] as const).map(([id, icono, txt]) => (
                        <Pressable key={id} onPress={() => setModo(id)} style={[styles.modo, modo === id && styles.modoActivo]}>
                            <Ionicons name={icono} size={18} color={modo === id ? "#fff" : colors.text} />
                            <Text style={[styles.modoTxt, modo === id && { color: "#fff" }]}>{txt}</Text>
                        </Pressable>
                    ))}
                </View>

                {!ubicacion ? (
                    <View style={styles.estado}>
                        {estadoUb === "cargando" ? (
                            <ActivityIndicator color={colors.primary} />
                        ) : (
                            <>
                                <Text style={styles.estadoTxt}>
                                    {estadoUb === "denegada" ? "No pudimos acceder a tu ubicación." : "Necesitamos tu ubicación para trazar la ruta."}
                                </Text>
                                <Pressable style={styles.btn} onPress={() => solicitar()}>
                                    <Text style={styles.btnTxt}>Activar ubicación</Text>
                                </Pressable>
                            </>
                        )}
                    </View>
                ) : cargando ? (
                    <View style={styles.estado}><ActivityIndicator color={colors.primary} /><Text style={styles.sub}>Calculando la ruta...</Text></View>
                ) : error ? (
                    <View style={styles.estado}>
                        <Text style={styles.estadoTxt}>No pudimos calcular la ruta ahora.</Text>
                        <Pressable style={styles.btn} onPress={() => calcular()}>
                            <Text style={styles.btnTxt}>Reintentar</Text>
                        </Pressable>
                    </View>
                ) : ruta ? (
                    <View style={styles.resumen}>
                        <Text style={styles.tiempo}>{formatoDuracion(ruta.duracionS)}</Text>
                        <Text style={styles.distancia}>{formatoDistancia(ruta.distanciaM)}{ruta.estimada ? " · tiempo estimado" : ""}</Text>
                    </View>
                ) : null}

                <View style={styles.radios}>
                    <Text style={styles.radioEtiqueta}>Radio</Text>
                    {RADIOS.map((m) => (
                        <Pressable key={m} onPress={() => setRadio(m)} style={[styles.radioChip, radio === m && styles.radioChipActivo]}>
                            <Text style={[styles.radioTxt, radio === m && { color: "#fff" }]}>{m >= 1000 ? `${m / 1000} km` : `${m} m`}</Text>
                        </Pressable>
                    ))}
                </View>
            </View>
        </View>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    top: { position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
    atras: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", elevation: 4 },
    tarjeta: {
        position: "absolute", left: spacing.md, right: spacing.md, bottom: spacing.md, backgroundColor: colors.surface,
        borderRadius: 24, padding: spacing.lg, gap: spacing.md, elevation: 8,
        shadowColor: "#000", shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
    },
    cabecera: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    foto: { width: 52, height: 52, borderRadius: radius.md },
    nombre: { fontSize: 16, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    modos: { flexDirection: "row", gap: spacing.sm },
    modo: { flex: 1, flexDirection: "row", gap: 6, alignItems: "center", justifyContent: "center", backgroundColor: colors.background, borderRadius: radius.pill, paddingVertical: 10 },
    modoActivo: { backgroundColor: colors.primary },
    modoTxt: { fontWeight: "700", color: colors.text, fontSize: 13 },
    estado: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.sm },
    estadoTxt: { color: colors.text, fontSize: 14, textAlign: "center" },
    btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 11, paddingHorizontal: 22 },
    btnTxt: { color: "#fff", fontWeight: "700" },
    resumen: { flexDirection: "row", alignItems: "baseline", gap: spacing.md },
    tiempo: { fontSize: 30, fontWeight: "800", color: colors.primary },
    distancia: { fontSize: 14, color: colors.textMuted, fontWeight: "600" },
    radios: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    radioEtiqueta: { fontSize: 12, fontWeight: "700", color: colors.textMuted, marginRight: 2 },
    radioChip: { backgroundColor: colors.background, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
    radioChipActivo: { backgroundColor: colors.text },
    radioTxt: { fontSize: 12, fontWeight: "700", color: colors.text },
}));
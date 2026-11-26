import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import LocationPicker from "../../components/LocationPicker";
import TextField from "../../components/TextField";
import { useUserLocation } from "../../hooks/useUserLocation";
import { elegirFoto, FotoElegida } from "../../services/files";
import {
    actualizarRestaurante, crearRestaurante, DatosLocal, getCategorias, subirImagenLocal,
} from "../../services/owner";
import { DIAS_ORDEN, ETIQUETA_DIA } from "../../utils/horario";
import { radius, spacing, themed, useColors } from "../../theme";
import type { Categoria, Restaurante } from "../../types";

const FORMATO_HORA = /^(\d{1,2}:\d{2}-\d{1,2}:\d{2}|cerrado)$/i;

const aNumero = (v: string): number | null => {
    const n = Number(v.replace(",", "."));
    return v.trim() !== "" && !Number.isNaN(n) && Math.abs(n) <= 180 ? n : null;
};

export default function EditLocalScreen() {
  const styles = useStyles();
  const colors = useColors();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const r: Restaurante | undefined = route.params?.restaurante;
    const { solicitar, estado: estadoUb } = useUserLocation();

    const [nombre, setNombre] = useState(r?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(r?.descripcion ?? "");
    const [telefono, setTelefono] = useState(r?.telefono ?? "");
    const [direccion, setDireccion] = useState(r?.direccion ?? "");
    const [categoriaId, setCategoriaId] = useState<string | null>(r?.categoria?.id ?? null);
    const [lat, setLat] = useState(r && Number(r.latitud) !== 0 ? String(Number(r.latitud)) : "");
    const [lng, setLng] = useState(r && Number(r.longitud) !== 0 ? String(Number(r.longitud)) : "");
    const [horario, setHorario] = useState<Record<string, string>>(r?.horario ?? {});
    const [foto, setFoto] = useState<FotoElegida | null>(null);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getCategorias().then(setCategorias).catch(() => { });
    }, []);

    const latNum = aNumero(lat);
    const lngNum = aNumero(lng);

    const ponerPin = (la: number, lo: number) => {
        setLat(la.toFixed(6));
        setLng(lo.toFixed(6));
    };

    const usarMiUbicacion = async () => {
        const c = await solicitar();
        if (c) ponerPin(c.lat, c.lng);
    };

    const copiarLunes = () => {
        const base = horario.lunes;
        if (!base) return;
        setHorario(Object.fromEntries(DIAS_ORDEN.map((d) => [d, base])));
    };

    const guardar = async () => {
        setError(null);
        if (nombre.trim().length < 2) return setError("Escribe el nombre de tu restaurante.");
        if (latNum == null || lngNum == null || Math.abs(latNum) > 90) {
            return setError("Marca la ubicación en el mapa o escribe una latitud y longitud válidas.");
        }
        for (const d of DIAS_ORDEN) {
            const v = (horario[d] ?? "").trim();
            if (v && !FORMATO_HORA.test(v)) return setError(`Horario de ${ETIQUETA_DIA[d]}: usa el formato 08:00-20:00 o «Cerrado».`);
        }
        setGuardando(true);
        try {
            const horarioLimpio = Object.fromEntries(
                Object.entries(horario).filter(([, v]) => v.trim()).map(([k, v]) => [k, v.trim()])
            );
            const datos: DatosLocal = {
                nombre: nombre.trim(), descripcion: descripcion.trim(), telefono: telefono.trim(),
                direccion: direccion.trim(), latitud: latNum.toFixed(6), longitud: lngNum.toFixed(6),
                categoria_id: categoriaId, horario: horarioLimpio,
            };
            if (foto) datos.imagen = await subirImagenLocal(foto);
            if (r) await actualizarRestaurante(r.id, datos);
            else await crearRestaurante(datos);
            navigation.goBack();
        } catch (e: any) {
            const d = e?.response?.data;
            const primero = d && typeof d === "object" ? Object.values(d).flat()[0] : null;
            setError(typeof primero === "string" ? primero : "No pudimos guardar los cambios.");
        } finally {
            setGuardando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
                <Pressable onPress={() => navigation.goBack()}>
                    <Text style={styles.volver}>← Volver</Text>
                </Pressable>
                <Text style={styles.titulo}>{r ? "Editar mi local" : "Registrar mi restaurante"}</Text>

                <Pressable style={styles.fotoCaja} onPress={async () => { const f = await elegirFoto(); if (f) setFoto(f); }}>
                    {foto?.uri || r?.imagen ? (
                        <Image source={{ uri: foto?.uri ?? r?.imagen ?? undefined }} style={styles.foto} />
                    ) : (
                        <View style={[styles.foto, { alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="camera-outline" size={32} color={colors.primary} />
                        </View>
                    )}
                    <Text style={styles.cambiar}>{foto || r?.imagen ? "Cambiar foto" : "Agregar foto del local"}</Text>
                </Pressable>

                <TextField label="Nombre del restaurante" icono="storefront-outline" placeholder="Ej. La Fonda Paisa" autoCapitalize="words" value={nombre} onChangeText={setNombre} />

                <View style={{ gap: 6 }}>
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput style={styles.area} multiline placeholder="Cuéntales a tus clientes qué te hace especial" placeholderTextColor={colors.textMuted} value={descripcion} onChangeText={setDescripcion} />
                </View>

                <View style={{ gap: 8 }}>
                    <Text style={styles.label}>Categoría</Text>
                    <View style={styles.chips}>
                        {categorias.map((c) => {
                            const activo = c.id === categoriaId;
                            return (
                                <Pressable key={c.id} onPress={() => setCategoriaId(activo ? null : c.id)} style={[styles.chip, activo && styles.chipActivo]}>
                                    <Text style={[styles.chipTxt, activo && { color: "#fff" }]}>{c.nombre}</Text>
                                </Pressable>
                            );
                        })}
                    </View>
                </View>

                <TextField label="Teléfono" icono="call-outline" placeholder="3001234567" keyboardType="phone-pad" value={telefono} onChangeText={setTelefono} />
                <TextField label="Dirección" icono="location-outline" placeholder="Calle 2 # 3-45, Centro" autoCapitalize="sentences" value={direccion} onChangeText={setDireccion} />

                <View style={{ gap: 8 }}>
                    <Text style={styles.label}>Ubicación en el mapa</Text>
                    <LocationPicker lat={latNum} lng={lngNum} onChange={ponerPin} />
                    <Text style={styles.ayuda}>
                        {Platform.OS === "web" ? "Toca el mapa o arrastra el pin hasta tu local." : "Toca el mapa para colocar el pin en tu local."}
                    </Text>
                    <View style={{ flexDirection: "row", gap: spacing.sm }}>
                        <View style={{ flex: 1 }}>
                            <TextField label="Latitud" icono="navigate-outline" placeholder="3.8801" keyboardType="numbers-and-punctuation" value={lat} onChangeText={setLat} />
                        </View>
                        <View style={{ flex: 1 }}>
                            <TextField label="Longitud" icono="navigate-outline" placeholder="-77.0311" keyboardType="numbers-and-punctuation" value={lng} onChangeText={setLng} />
                        </View>
                    </View>
                    <Pressable style={styles.btnSec} onPress={usarMiUbicacion}>
                        <Ionicons name="locate" size={18} color={colors.primary} />
                        <Text style={styles.btnSecTxt}>Usar mi ubicación actual</Text>
                    </Pressable>
                    {estadoUb === "denegada" && <Text style={styles.error}>No pudimos acceder a tu ubicación. Toca el mapa para marcarla.</Text>}
                </View>

                <View style={{ gap: 8 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={styles.label}>Horario</Text>
                        <Pressable onPress={copiarLunes}>
                            <Text style={{ color: colors.primary, fontWeight: "700", fontSize: 12 }}>Copiar lunes a todos</Text>
                        </Pressable>
                    </View>
                    {DIAS_ORDEN.map((d) => (
                        <View key={d} style={styles.filaHorario}>
                            <Text style={styles.dia}>{ETIQUETA_DIA[d]}</Text>
                            <TextInput
                                style={styles.horaInput}
                                placeholder="08:00-20:00 o Cerrado"
                                placeholderTextColor={colors.textMuted}
                                value={horario[d] ?? ""}
                                onChangeText={(v) => setHorario({ ...horario, [d]: v })}
                                autoCapitalize="none"
                            />
                        </View>
                    ))}
                </View>

                {!!error && <Text style={styles.error}>{error}</Text>}

                <Pressable style={styles.boton} onPress={guardar} disabled={guardando}>
                    {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>{r ? "Guardar cambios" : "Registrar restaurante"}</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    volver: { color: colors.textMuted, fontWeight: "600" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text },
    fotoCaja: { alignItems: "center", gap: 6 },
    foto: { width: "100%", height: 170, borderRadius: radius.lg },
    cambiar: { color: colors.primary, fontWeight: "700" },
    label: { fontSize: 13, fontWeight: "600", color: colors.text },
    area: {
        minHeight: 90, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
        padding: spacing.md, color: colors.text, textAlignVertical: "top", outlineStyle: "none",
    } as any,
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
    chip: { backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
    chipActivo: { backgroundColor: colors.primary },
    chipTxt: { color: colors.text, fontSize: 13, fontWeight: "600" },
    btnSec: { flexDirection: "row", gap: 8, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: colors.primary, borderRadius: radius.md, paddingVertical: 12 },
    btnSecTxt: { color: colors.primary, fontWeight: "700" },
    ayuda: { fontSize: 12, color: colors.textMuted },
    filaHorario: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    dia: { width: 84, fontSize: 13, color: colors.text, fontWeight: "600" },
    horaInput: {
        flex: 1, height: 42, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
        paddingHorizontal: spacing.md, color: colors.text, outlineStyle: "none",
    } as any,
    error: { color: "#B3261E", fontSize: 13 },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginTop: spacing.sm, marginBottom: spacing.xl },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
}));
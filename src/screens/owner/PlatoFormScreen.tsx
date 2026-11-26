import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import TextField from "../../components/TextField";
import { elegirFoto, FotoElegida } from "../../services/files";
import { guardarPlato } from "../../services/owner";
import { radius, spacing, themed, useColors } from "../../theme";
import type { Plato } from "../../types";

export default function PlatoFormScreen() {
  const styles = useStyles();
  const colors = useColors();
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { restauranteId, plato }: { restauranteId: string; plato?: Plato } = route.params;

    const [nombre, setNombre] = useState(plato?.nombre ?? "");
    const [descripcion, setDescripcion] = useState(plato?.descripcion ?? "");
    const [precio, setPrecio] = useState(plato ? String(Math.round(Number(plato.precio))) : "");
    const [disponible, setDisponible] = useState(plato?.disponible ?? true);
    const [foto, setFoto] = useState<FotoElegida | null>(null);
    const [guardando, setGuardando] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const guardar = async () => {
        setError(null);
        const valor = Number(precio.replace(/[.\s]/g, "").replace(",", "."));
        if (nombre.trim().length < 2) return setError("Escribe el nombre del plato.");
        if (!valor || valor <= 0) return setError("Escribe un precio válido, por ejemplo 25000.");
        setGuardando(true);
        try {
            await guardarPlato(restauranteId, plato?.id ?? null, {
                nombre: nombre.trim(), descripcion: descripcion.trim(), precio: String(valor), disponible, foto,
            });
            navigation.goBack();
        } catch (e: any) {
            const d = e?.response?.data;
            const primero = d && typeof d === "object" ? Object.values(d).flat()[0] : null;
            setError(typeof primero === "string" ? primero : "No pudimos guardar el plato.");
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
                <Text style={styles.titulo}>{plato ? "Editar plato" : "Nuevo plato"}</Text>

                <Pressable style={{ alignItems: "center", gap: 6 }} onPress={async () => { const f = await elegirFoto(); if (f) setFoto(f); }}>
                    {foto?.uri || plato?.imagen ? (
                        <Image source={{ uri: foto?.uri ?? plato?.imagen ?? undefined }} style={styles.foto} />
                    ) : (
                        <View style={[styles.foto, { alignItems: "center", justifyContent: "center", backgroundColor: colors.primarySoft }]}>
                            <Ionicons name="camera-outline" size={32} color={colors.primary} />
                        </View>
                    )}
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>{foto || plato?.imagen ? "Cambiar foto" : "Agregar foto"}</Text>
                </Pressable>

                <TextField label="Nombre" icono="fast-food-outline" placeholder="Ej. Bandeja paisa" autoCapitalize="sentences" value={nombre} onChangeText={setNombre} />
                <View style={{ gap: 6 }}>
                    <Text style={styles.label}>Descripción</Text>
                    <TextInput style={styles.area} multiline placeholder="Ingredientes o detalles" placeholderTextColor={colors.textMuted} value={descripcion} onChangeText={setDescripcion} />
                </View>
                <TextField label="Precio (COP)" icono="cash-outline" placeholder="25000" keyboardType="number-pad" value={precio} onChangeText={setPrecio} />

                <View style={styles.fila}>
                    <Text style={styles.label}>Disponible</Text>
                    <Switch value={disponible} onValueChange={setDisponible} trackColor={{ true: colors.primary }} />
                </View>

                {!!error && <Text style={styles.error}>{error}</Text>}

                <Pressable style={styles.boton} onPress={guardar} disabled={guardando}>
                    {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>{plato ? "Guardar cambios" : "Agregar plato"}</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    volver: { color: colors.textMuted, fontWeight: "600" },
    titulo: { fontSize: 26, fontWeight: "800", color: colors.text },
    foto: { width: 160, height: 120, borderRadius: radius.lg },
    label: { fontSize: 13, fontWeight: "600", color: colors.text },
    area: {
        minHeight: 80, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
        padding: spacing.md, color: colors.text, textAlignVertical: "top", outlineStyle: "none",
    } as any,
    fila: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg },
    error: { color: "#B3261E", fontSize: 13 },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center", marginBottom: spacing.xl },
    botonTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
}));
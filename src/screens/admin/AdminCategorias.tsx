import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfirmDialog from "../../components/ConfirmDialog";
import {
    actualizarCategoria, crearCategoria, eliminarCategoria, getCategoriasAdmin,
} from "../../services/admin";
import { colors, radius, spacing } from "../../theme";
import type { AdminCategoria } from "../../types";

function FormCategoria({ inicial, onSave, onCancel }: {
    inicial?: AdminCategoria;
    onSave: (nombre: string, icono: string) => Promise<string | null>;
    onCancel: () => void;
}) {
    const [nombre, setNombre] = useState(inicial?.nombre ?? "");
    const [icono, setIcono] = useState(inicial?.icono ?? "");
    const [error, setError] = useState<string | null>(null);
    const [guardando, setGuardando] = useState(false);

    const guardar = async () => {
        setGuardando(true);
        const err = await onSave(nombre.trim(), icono.trim());
        setGuardando(false);
        if (err) setError(err);
    };

    return (
        <View style={styles.overlay}>
            <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
            <View style={styles.caja}>
                <Text style={styles.cajaTitulo}>{inicial ? "Editar categoría" : "Nueva categoría"}</Text>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.input} placeholder="Ej. Mariscos" placeholderTextColor={colors.textMuted} value={nombre} onChangeText={setNombre} />
                <Text style={styles.label}>Ícono (un emoji)</Text>
                <TextInput style={styles.input} placeholder="🦐" placeholderTextColor={colors.textMuted} value={icono} onChangeText={setIcono} />
                {!!error && <Text style={styles.error}>{error}</Text>}
                <Pressable style={styles.guardar} onPress={guardar} disabled={guardando}>
                    <Text style={styles.guardarTxt}>{guardando ? "Guardando..." : "Guardar"}</Text>
                </Pressable>
                <Pressable onPress={onCancel} style={{ alignItems: "center", paddingVertical: 8 }}>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>Cancelar</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default function AdminCategorias() {
    const [lista, setLista] = useState<AdminCategoria[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [form, setForm] = useState<{ cat?: AdminCategoria } | null>(null);
    const [aBorrar, setABorrar] = useState<AdminCategoria | null>(null);

    const cargar = useCallback(async () => {
        try { setLista(await getCategoriasAdmin()); setError(null); } catch { setError("No pudimos cargar las categorías."); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const guardar = async (nombre: string, icono: string): Promise<string | null> => {
        try {
            if (form?.cat) await actualizarCategoria(form.cat.id, { nombre, icono });
            else await crearCategoria({ nombre, icono });
            setForm(null);
            await cargar();
            return null;
        } catch (e: any) {
            return e?.response?.data?.error ?? "No pudimos guardar la categoría.";
        }
    };

    const borrar = async () => {
        if (!aBorrar) return;
        const c = aBorrar;
        setABorrar(null);
        try {
            await eliminarCategoria(c.id);
            setLista((p) => p?.filter((x) => x.id !== c.id) ?? null);
            setError(null);
        } catch (e: any) {
            setError(e?.response?.data?.error ?? "No pudimos eliminar la categoría.");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View>
                        <Text style={styles.titulo}>Categorías</Text>
                        <Text style={styles.sub}>{lista?.length ?? 0} categorías de comida.</Text>
                    </View>
                    <Pressable style={styles.nueva} onPress={() => setForm({})}>
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={styles.nuevaTxt}>Nueva</Text>
                    </Pressable>
                </View>

                {!!error && <Text style={styles.error}>{error}</Text>}
                {lista === null && !error && <Text style={styles.sub}>Cargando...</Text>}

                {lista?.map((c) => (
                    <View key={c.id} style={styles.fila}>
                        <View style={styles.icono}>
                            <Text style={{ fontSize: 20 }}>{c.icono || "🍽️"}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.nombre}>{c.nombre}</Text>
                            <Text style={styles.sub}>{c.restaurantes} {c.restaurantes === 1 ? "restaurante" : "restaurantes"}</Text>
                        </View>
                        <Pressable onPress={() => setForm({ cat: c })} hitSlop={8}>
                            <Ionicons name="create-outline" size={20} color={colors.primary} />
                        </Pressable>
                        <Pressable onPress={() => setABorrar(c)} hitSlop={8}>
                            <Ionicons name="trash-outline" size={20} color="#B3261E" />
                        </Pressable>
                    </View>
                ))}
            </ScrollView>

            {form && <FormCategoria inicial={form.cat} onSave={guardar} onCancel={() => setForm(null)} />}
            {aBorrar && (
                <ConfirmDialog
                    titulo={`¿Eliminar «${aBorrar.nombre}»?`}
                    texto="Dejará de aparecer en los filtros. Si tiene restaurantes asignados, no se podrá eliminar."
                    confirmarTxt="Eliminar categoría"
                    destructivo
                    onConfirm={borrar}
                    onCancel={() => setABorrar(null)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    titulo: { fontSize: 24, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    nueva: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
    nuevaTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
    error: { color: "#B3261E", fontSize: 13 },
    fila: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    icono: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#FBE3D3", alignItems: "center", justifyContent: "center" },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center", padding: spacing.xl },
    caja: { width: "100%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.xl, gap: spacing.sm },
    cajaTitulo: { fontSize: 18, fontWeight: "800", color: colors.text, marginBottom: spacing.sm },
    label: { fontSize: 13, fontWeight: "600", color: colors.text },
    input: { height: 46, backgroundColor: colors.background, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.text, outlineStyle: "none" } as any,
    guardar: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: "center", marginTop: spacing.sm },
    guardarTxt: { color: "#fff", fontWeight: "700" },
});
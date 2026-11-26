import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConfirmDialog from "../../components/ConfirmDialog";
import { actualizarCategoria, crearCategoria, eliminarCategoria, getCategoriasAdmin } from "../../services/admin";
import { radius, spacing, themed, useColors } from "../../theme";
import type { AdminCategoria } from "../../types";

const SUGERIDOS = ["🍽️", "🦐", "🍕", "🍔", "🌮", "🍣", "🥗", "🍝", "🍗", "🥩", "☕", "🍰", "🍹", "🥞", "🍜", "🐟"];

function FormCategoria({ inicial, onSave, onCancel }: {
    inicial?: AdminCategoria;
    onSave: (nombre: string, icono: string) => Promise<string | null>;
    onCancel: () => void;
}) {
    const styles = useStyles();
    const colors = useColors();
    const [nombre, setNombre] = useState(inicial?.nombre ?? "");
    const [icono, setIcono] = useState(inicial?.icono ?? "🍽️");
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
            <Pressable style={styles.fondo} onPress={onCancel} />
            <View style={styles.hoja}>
                <View style={styles.asa} />
                <View style={styles.previa}>
                    <View style={styles.previaIcono}><Text style={{ fontSize: 30 }}>{icono || "🍽️"}</Text></View>
                    <Text style={styles.previaNombre}>{nombre.trim() || "Nueva categoría"}</Text>
                </View>
                <Text style={styles.label}>Nombre</Text>
                <TextInput style={styles.inputForm} placeholder="Ej. Mariscos" placeholderTextColor={colors.textMuted} value={nombre} onChangeText={setNombre} />
                <Text style={styles.label}>Ícono</Text>
                <View style={styles.emojis}>
                    {SUGERIDOS.map((e) => (
                        <Pressable key={e} onPress={() => setIcono(e)} style={[styles.emoji, icono === e && styles.emojiActivo]}>
                            <Text style={{ fontSize: 20 }}>{e}</Text>
                        </Pressable>
                    ))}
                </View>
                <TextInput style={styles.inputForm} placeholder="O escribe otro emoji" placeholderTextColor={colors.textMuted} value={icono} onChangeText={setIcono} />
                {!!error && <Text style={styles.error}>{error}</Text>}
                <Pressable style={[styles.guardar, guardando && { opacity: 0.6 }]} onPress={guardar} disabled={guardando}>
                    <Text style={styles.guardarTxt}>{guardando ? "Guardando..." : inicial ? "Guardar cambios" : "Crear categoría"}</Text>
                </Pressable>
                <Pressable onPress={onCancel} style={{ alignItems: "center", paddingVertical: 10 }}>
                    <Text style={{ color: colors.primary, fontWeight: "700" }}>Cancelar</Text>
                </Pressable>
            </View>
        </View>
    );
}

export default function AdminCategorias() {
    const styles = useStyles();
    const colors = useColors();
    const [lista, setLista] = useState<AdminCategoria[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [aviso, setAviso] = useState<string | null>(null);
    const [form, setForm] = useState<{ cat?: AdminCategoria } | null>(null);
    const [aBorrar, setABorrar] = useState<AdminCategoria | null>(null);
    const [refrescando, setRefrescando] = useState(false);

    const cargar = useCallback(async () => {
        try { setLista(await getCategoriasAdmin()); setError(null); } catch { setError("No pudimos cargar las categorías."); }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const mostrarAviso = (t: string) => { setAviso(t); setTimeout(() => setAviso(null), 3500); };

    const total = useMemo(() => (lista ?? []).reduce((s, c) => s + c.restaurantes, 0), [lista]);
    const max = useMemo(() => Math.max(1, ...(lista ?? []).map((c) => c.restaurantes)), [lista]);
    const vacias = (lista ?? []).filter((c) => c.restaurantes === 0).length;

    const guardar = async (nombre: string, icono: string): Promise<string | null> => {
        try {
            const editando = !!form?.cat;
            if (form?.cat) await actualizarCategoria(form.cat.id, { nombre, icono });
            else await crearCategoria({ nombre, icono });
            setForm(null);
            mostrarAviso(editando ? "Categoría actualizada." : `Categoría «${nombre}» creada.`);
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
            mostrarAviso(`Categoría «${c.nombre}» eliminada.`);
            setError(null);
            await cargar();
        } catch (e: any) {
            setError(e?.response?.data?.error ?? "No pudimos eliminar la categoría.");
        }
    };

    return (
        <View style={{ flex: 1 }}>
            <ScrollView
                contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
                refreshControl={<RefreshControl refreshing={refrescando} tintColor={colors.primary}
                    onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }} />}
            >
                <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View>
                        <Text style={styles.titulo}>Categorías</Text>
                        <Text style={styles.sub}>Los tipos de comida con los que se filtra el mapa.</Text>
                    </View>
                    <Pressable style={styles.nueva} onPress={() => setForm({})}>
                        <Ionicons name="add" size={18} color="#fff" />
                        <Text style={styles.nuevaTxt}>Nueva</Text>
                    </Pressable>
                </View>

                <View style={styles.grid}>
                    {[["Categorías", lista?.length ?? 0, "pricetags"], ["Locales clasificados", total, "storefront"], ["Sin locales", vacias, "alert-circle"]].map(([t, v, ic]) => (
                        <View key={String(t)} style={styles.stat}>
                            <Ionicons name={ic as any} size={18} color={colors.primary} />
                            <Text style={styles.statValor}>{v as number}</Text>
                            <Text style={styles.statTitulo}>{t as string}</Text>
                        </View>
                    ))}
                </View>

                {!!aviso && (
                    <View style={styles.aviso}>
                        <Ionicons name="checkmark-circle" size={18} color="#1F7A44" />
                        <Text style={styles.avisoTxt}>{aviso}</Text>
                    </View>
                )}
                {!!error && <Text style={styles.error}>{error}</Text>}
                {lista === null && !error && <Text style={styles.sub}>Cargando...</Text>}

                {lista?.map((c) => (
                    <View key={c.id} style={styles.fila}>
                        <View style={styles.icono}>
                            <Text style={{ fontSize: 22 }}>{c.icono || "🍽️"}</Text>
                        </View>
                        <View style={{ flex: 1, gap: 6 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <Text style={styles.nombre}>{c.nombre}</Text>
                                <Text style={styles.sub}>{c.restaurantes} {c.restaurantes === 1 ? "local" : "locales"}</Text>
                            </View>
                            <View style={styles.pista}>
                                <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primary, width: `${(c.restaurantes / max) * 100}%` }} />
                            </View>
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

const useStyles = themed((colors) => ({
    titulo: { fontSize: 24, fontWeight: "800", color: colors.text },
    sub: { fontSize: 12, color: colors.textMuted },
    nueva: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
    nuevaTxt: { color: "#fff", fontWeight: "700", fontSize: 13 },
    grid: { flexDirection: "row", gap: spacing.sm },
    stat: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, gap: 2 },
    statValor: { fontSize: 22, fontWeight: "800", color: colors.text },
    statTitulo: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
    aviso: { flexDirection: "row", gap: 8, alignItems: "center", backgroundColor: "#E3F4EA", borderRadius: radius.md, padding: spacing.md },
    avisoTxt: { color: "#1F7A44", fontWeight: "600", fontSize: 13, flex: 1 },
    error: { color: "#B3261E", fontSize: 13 },
    fila: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md },
    icono: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    nombre: { fontSize: 15, fontWeight: "700", color: colors.text },
    pista: { height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: "hidden" },
    overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, justifyContent: "flex-end", zIndex: 50 },
    fondo: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.5)" },
    hoja: { backgroundColor: colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: spacing.xl, paddingTop: spacing.md, gap: spacing.sm },
    asa: { alignSelf: "center", width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, marginBottom: spacing.sm },
    previa: { flexDirection: "row", alignItems: "center", gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm },
    previaIcono: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    previaNombre: { fontSize: 18, fontWeight: "800", color: colors.text, flex: 1 },
    label: { fontSize: 13, fontWeight: "700", color: colors.text },
    inputForm: { height: 46, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, color: colors.text, ...({ outlineStyle: "none" } as any) },
    emojis: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    emoji: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "transparent" },
    emojiActivo: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
    guardar: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 14, alignItems: "center", marginTop: spacing.sm },
    guardarTxt: { color: "#fff", fontWeight: "700", fontSize: 15 },
}));
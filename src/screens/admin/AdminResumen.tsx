import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Animated, RefreshControl, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getCategoriasAdmin, getResumenAdmin, getRestaurantesAdmin, getUsuariosAdmin } from "../../services/admin";
import { mezclar, radius, spacing, themed, useColors } from "../../theme";
import type { AdminCategoria, AdminResumen as Resumen, AdminUsuario } from "../../types";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const VERDE = "#2E9E5B";
const ROJO = "#E5383B";
const GRIS = "#9AA0A6";
const ETIQUETA_ROL: Record<string, string> = { usuario: "Comensales", restaurante: "Dueños", admin: "Administradores" };

type Datos = {
    resumen: Resumen;
    usuarios: AdminUsuario[];
    restaurantes: any[];
    categorias: AdminCategoria[];
};

/* ---------- piezas de gráficas (solo Views, sin librerías) ---------- */

function useEntrada() {
    const v = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(v, { toValue: 1, duration: 900, useNativeDriver: false }).start();
    }, []);
    return v;
}

function Contador({ valor, style }: { valor: number; style: any }) {
    const v = useEntrada();
    const [n, setN] = useState(0);
    useEffect(() => {
        const id = v.addListener(({ value }) => setN(Math.round(valor * value)));
        return () => v.removeListener(id);
    }, [valor]);
    return <Text style={style}>{n}</Text>;
}

function BarraH({ etiqueta, valor, max, color, sufijo }: { etiqueta: string; valor: number; max: number; color: string; sufijo?: string }) {
    const styles = useStyles();
    const v = useEntrada();
    const pct = max > 0 ? (valor / max) * 100 : 0;
    return (
        <View style={{ gap: 4 }}>
            <View style={styles.barraCab}>
                <Text style={styles.barraEt} numberOfLines={1}>{etiqueta}</Text>
                <Text style={styles.barraVal}>{valor}{sufijo ?? ""}</Text>
            </View>
            <View style={styles.pista}>
                <Animated.View style={{ height: 10, borderRadius: 5, backgroundColor: color, width: v.interpolate({ inputRange: [0, 1], outputRange: ["0%", `${pct}%`] }) }} />
            </View>
        </View>
    );
}

function Apilada({ partes }: { partes: { etiqueta: string; valor: number; color: string }[] }) {
    const styles = useStyles();
    const v = useEntrada();
    const total = partes.reduce((s, p) => s + p.valor, 0);
    return (
        <View style={{ gap: spacing.md }}>
            <Animated.View style={[styles.apilada, { opacity: v }]}>
                {total === 0 ? (
                    <View style={{ flex: 1, backgroundColor: GRIS }} />
                ) : (
                    partes.filter((p) => p.valor > 0).map((p) => <View key={p.etiqueta} style={{ flex: p.valor, backgroundColor: p.color }} />)
                )}
            </Animated.View>
            <View style={styles.leyenda}>
                {partes.map((p) => (
                    <View key={p.etiqueta} style={styles.leyendaItem}>
                        <View style={[styles.punto, { backgroundColor: p.color }]} />
                        <Text style={styles.leyendaTxt}>{p.etiqueta}</Text>
                        <Text style={styles.leyendaNum}>{p.valor}{total ? ` · ${Math.round((p.valor / total) * 100)}%` : ""}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
}

function Columnas({ datos, color }: { datos: { etiqueta: string; valor: number }[]; color: string }) {
    const styles = useStyles();
    const v = useEntrada();
    const max = Math.max(1, ...datos.map((d) => d.valor));
    const ALTO = 110;
    return (
        <View style={styles.columnas}>
            {datos.map((d, i) => {
                const ultimo = i === datos.length - 1;
                return (
                    <View key={d.etiqueta} style={styles.columnaCaja}>
                        <Text style={styles.columnaVal}>{d.valor}</Text>
                        <View style={{ height: ALTO, justifyContent: "flex-end" }}>
                            <Animated.View
                                style={{
                                    width: 26, borderTopLeftRadius: 8, borderTopRightRadius: 8,
                                    backgroundColor: ultimo ? color : mezclar(color, "#FFFFFF", 0.45),
                                    height: v.interpolate({ inputRange: [0, 1], outputRange: [0, Math.max(4, (d.valor / max) * ALTO)] }),
                                }}
                            />
                        </View>
                        <Text style={styles.columnaEt}>{d.etiqueta}</Text>
                    </View>
                );
            })}
        </View>
    );
}

function Tarjeta({ icono, titulo, valor, nota, color }: { icono: string; titulo: string; valor: number; nota?: string; color: string }) {
    const styles = useStyles();
    return (
        <View style={styles.kpi}>
            <View style={[styles.kpiIcono, { backgroundColor: mezclar(color, "#FFFFFF", 0.18) }]}>
                <Ionicons name={icono as any} size={18} color={color} />
            </View>
            <Contador valor={valor} style={styles.kpiValor} />
            <Text style={styles.kpiTitulo}>{titulo}</Text>
            {!!nota && <Text style={styles.kpiNota}>{nota}</Text>}
        </View>
    );
}

function Seccion({ titulo, sub, children }: { titulo: string; sub?: string; children: React.ReactNode }) {
    const styles = useStyles();
    return (
        <View style={styles.seccion}>
            <Text style={styles.seccionTitulo}>{titulo}</Text>
            {!!sub && <Text style={styles.seccionSub}>{sub}</Text>}
            <View style={{ marginTop: spacing.md }}>{children}</View>
        </View>
    );
}

/* ---------- pantalla ---------- */

export default function AdminResumen() {
    const styles = useStyles();
    const colors = useColors();
    const [d, setD] = useState<Datos | null>(null);
    const [error, setError] = useState(false);
    const [refrescando, setRefrescando] = useState(false);
    const [version, setVersion] = useState(0);

    const cargar = useCallback(async () => {
        try {
            const [resumen, usuarios, restaurantes, categorias] = await Promise.all([
                getResumenAdmin(), getUsuariosAdmin(), getRestaurantesAdmin(), getCategoriasAdmin().catch(() => []),
            ]);
            setD({ resumen, usuarios, restaurantes: restaurantes as any[], categorias });
            setVersion((v) => v + 1);
            setError(false);
        } catch {
            setError(true);
        }
    }, []);
    useEffect(() => { cargar(); }, [cargar]);

    const a = useMemo(() => {
        if (!d) return null;
        const { resumen, usuarios, restaurantes, categorias } = d;
        const hace7 = Date.now() - 7 * 86400000;
        const nuevosU = usuarios.filter((u: any) => new Date(u.created_at).getTime() >= hace7).length;
        const nuevosR = restaurantes.filter((r) => new Date(r.created_at).getTime() >= hace7).length;

        const hoy = new Date();
        const meses = Array.from({ length: 6 }, (_, i) => {
            const f = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
            return { clave: `${f.getFullYear()}-${f.getMonth()}`, etiqueta: MESES[f.getMonth()], valor: 0 };
        });
        usuarios.forEach((u: any) => {
            const f = new Date(u.created_at);
            const m = meses.find((x) => x.clave === `${f.getFullYear()}-${f.getMonth()}`);
            if (m) m.valor++;
        });

        const porRol: Record<string, number> = {};
        usuarios.forEach((u) => u.roles.forEach((r) => { porRol[r] = (porRol[r] ?? 0) + 1; }));

        const inactivosU = resumen.usuarios.total - resumen.usuarios.activos - resumen.usuarios.suspendidos;
        const inactivosR = resumen.restaurantes.total - resumen.restaurantes.activos - resumen.restaurantes.suspendidos;

        const calificados = restaurantes.filter((r) => Number(r.total_calificaciones) > 0);
        const promedioGlobal = calificados.length
            ? calificados.reduce((s, r) => s + Number(r.calificacion_promedio), 0) / calificados.length
            : 0;
        const top = [...calificados].sort((x, y) => Number(y.calificacion_promedio) - Number(x.calificacion_promedio)).slice(0, 5);

        const rangos = [
            { etiqueta: "Sin reseñas", valor: restaurantes.length - calificados.length, color: GRIS },
            { etiqueta: "Menos de 3", valor: calificados.filter((r) => Number(r.calificacion_promedio) < 3).length, color: ROJO },
            { etiqueta: "3 a 4", valor: calificados.filter((r) => Number(r.calificacion_promedio) >= 3 && Number(r.calificacion_promedio) < 4).length, color: "#F5B301" },
            { etiqueta: "4 a 5", valor: calificados.filter((r) => Number(r.calificacion_promedio) >= 4).length, color: VERDE },
        ];

        const cats = [...categorias].sort((x, y) => y.restaurantes - x.restaurantes).slice(0, 6);
        const sinDueno = restaurantes.filter((r) => !r.dueno_username).length;

        return { resumen, nuevosU, nuevosR, meses, porRol, inactivosU, inactivosR, promedioGlobal, top, rangos, cats, sinDueno, totalRestaurantes: restaurantes.length };
    }, [d]);

    if (error) {
        return (
            <View style={styles.centro}>
                <Ionicons name="cloud-offline-outline" size={32} color={colors.primary} />
                <Text style={styles.msg}>No pudimos cargar el resumen</Text>
            </View>
        );
    }
    if (!a) return <View style={styles.centro}><Text style={styles.msg}>Cargando...</Text></View>;

    const { resumen } = a;
    const maxRol = Math.max(1, ...Object.values(a.porRol));
    const maxCat = Math.max(1, ...a.cats.map((c) => c.restaurantes));

    return (
        <ScrollView
            key={version}
            contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}
            refreshControl={
                <RefreshControl refreshing={refrescando} tintColor={colors.primary}
                    onRefresh={async () => { setRefrescando(true); await cargar(); setRefrescando(false); }} />
            }
        >
            <View style={styles.kpis}>
                <Tarjeta icono="people" titulo="Usuarios" valor={resumen.usuarios.total} nota={`+${a.nuevosU} esta semana`} color={colors.primary} />
                <Tarjeta icono="storefront" titulo="Restaurantes" valor={resumen.restaurantes.total} nota={`+${a.nuevosR} esta semana`} color="#2F7CF6" />
                <Tarjeta icono="chatbubbles" titulo="Reseñas" valor={resumen.resenas.total} nota="publicadas" color="#8B5CF6" />
                <Tarjeta icono="star" titulo="Calificación media" valor={Math.round(a.promedioGlobal * 10) / 10} nota={a.promedioGlobal ? "de 5 estrellas" : "sin datos"} color="#F5B301" />
            </View>

            <Seccion titulo="Nuevos usuarios" sub="Registros de los últimos 6 meses">
                <Columnas datos={a.meses} color={colors.primary} />
            </Seccion>

            <Seccion titulo="Estado de los usuarios" sub={`${resumen.usuarios.total} cuentas en total`}>
                <Apilada partes={[
                    { etiqueta: "Activos", valor: resumen.usuarios.activos, color: VERDE },
                    { etiqueta: "Inactivos", valor: a.inactivosU, color: GRIS },
                    { etiqueta: "Suspendidos", valor: resumen.usuarios.suspendidos, color: ROJO },
                ]} />
            </Seccion>

            <Seccion titulo="Usuarios por rol" sub="Una persona puede tener varios roles">
                <View style={{ gap: spacing.md }}>
                    {Object.entries(a.porRol).map(([rol, n], i) => (
                        <BarraH key={rol} etiqueta={ETIQUETA_ROL[rol] ?? rol} valor={n} max={maxRol} color={mezclar(colors.primary, "#FFFFFF", 1 - i * 0.2)} />
                    ))}
                </View>
            </Seccion>

            <Seccion titulo="Estado de los restaurantes" sub={`${a.sinDueno} sin dueño asignado`}>
                <Apilada partes={[
                    { etiqueta: "Activos", valor: resumen.restaurantes.activos, color: VERDE },
                    { etiqueta: "Inactivos", valor: a.inactivosR, color: GRIS },
                    { etiqueta: "Suspendidos", valor: resumen.restaurantes.suspendidos, color: ROJO },
                ]} />
            </Seccion>

            <Seccion titulo="Restaurantes por categoría" sub="Las más populares">
                <View style={{ gap: spacing.md }}>
                    {a.cats.length === 0 && <Text style={styles.seccionSub}>Aún no hay categorías.</Text>}
                    {a.cats.map((c) => (
                        <BarraH key={c.id} etiqueta={`${c.icono ? c.icono + "  " : ""}${c.nombre}`} valor={c.restaurantes} max={maxCat} color={colors.primary} />
                    ))}
                </View>
            </Seccion>

            <Seccion titulo="Calidad de los restaurantes" sub="Cuántos hay en cada rango de calificación">
                <Apilada partes={a.rangos} />
            </Seccion>

            <Seccion titulo="Mejor calificados" sub="Top 5 por calificación promedio">
                <View style={{ gap: spacing.md }}>
                    {a.top.length === 0 && <Text style={styles.seccionSub}>Todavía no hay reseñas.</Text>}
                    {a.top.map((r, i) => (
                        <View key={r.id} style={styles.topFila}>
                            <View style={styles.topPos}><Text style={styles.topPosTxt}>{i + 1}</Text></View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.barraEt} numberOfLines={1}>{r.nombre}</Text>
                                <Text style={styles.seccionSub}>{r.total_calificaciones} {Number(r.total_calificaciones) === 1 ? "reseña" : "reseñas"}</Text>
                            </View>
                            <Ionicons name="star" size={15} color="#F5B301" />
                            <Text style={styles.barraVal}>{Number(r.calificacion_promedio).toFixed(1)}</Text>
                        </View>
                    ))}
                </View>
            </Seccion>
        </ScrollView>
    );
}

const useStyles = themed((colors) => ({
    centro: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.sm },
    msg: { color: colors.textMuted, fontWeight: "600" },
    kpis: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
    kpi: { width: "47.5%", backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: 2 },
    kpiIcono: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", marginBottom: 6 },
    kpiValor: { fontSize: 32, fontWeight: "800", color: colors.text },
    kpiTitulo: { fontSize: 13, color: colors.text, fontWeight: "700" },
    kpiNota: { fontSize: 11, color: colors.textMuted },
    seccion: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg },
    seccionTitulo: { fontSize: 16, fontWeight: "800", color: colors.text },
    seccionSub: { fontSize: 12, color: colors.textMuted },
    barraCab: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
    barraEt: { fontSize: 13, fontWeight: "700", color: colors.text, flexShrink: 1 },
    barraVal: { fontSize: 13, fontWeight: "800", color: colors.text },
    pista: { height: 10, borderRadius: 5, backgroundColor: colors.border, overflow: "hidden" },
    apilada: { flexDirection: "row", height: 16, borderRadius: 8, overflow: "hidden", gap: 2 },
    leyenda: { gap: 8 },
    leyendaItem: { flexDirection: "row", alignItems: "center", gap: 8 },
    punto: { width: 10, height: 10, borderRadius: 5 },
    leyendaTxt: { flex: 1, fontSize: 13, color: colors.text, fontWeight: "600" },
    leyendaNum: { fontSize: 13, color: colors.textMuted, fontWeight: "700" },
    columnas: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
    columnaCaja: { alignItems: "center", gap: 4, flex: 1 },
    columnaVal: { fontSize: 12, fontWeight: "800", color: colors.text },
    columnaEt: { fontSize: 11, color: colors.textMuted, fontWeight: "600" },
    topFila: { flexDirection: "row", alignItems: "center", gap: spacing.md },
    topPos: { width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primarySoft, alignItems: "center", justifyContent: "center" },
    topPosTxt: { fontSize: 12, fontWeight: "800", color: colors.primary },
}));
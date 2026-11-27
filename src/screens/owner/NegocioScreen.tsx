import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import PantallaHeader from "../../components/PantallaHeader";
import TextField from "../../components/TextField";
import { getPerfilNegocio, guardarPerfilNegocio, mensajeError, PerfilNegocio } from "../../services/negocio";
import { radius, spacing, themed } from "../../theme";

type Datos = Omit<PerfilNegocio, "restaurante">;
const VACIO: Datos = {
    razon_social: "", nit: "", email_contacto: "", telefono_contacto: "",
    direccion_fiscal: "", nota_pie: "", moneda: "COP",
};

export default function NegocioScreen() {
    const styles = useStyles();
    const navigation = useNavigation<any>();
    const [d, setD] = useState<Datos>(VACIO);
    const [local, setLocal] = useState("");
    const [cargando, setCargando] = useState(true);
    const [guardando, setGuardando] = useState(false);
    const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);

    useEffect(() => {
        getPerfilNegocio()
            .then(({ restaurante, ...resto }) => { setLocal(restaurante ?? ""); setD({ ...VACIO, ...resto }); })
            .catch((e) => setMsg({ ok: false, texto: mensajeError(e) }))
            .finally(() => setCargando(false));
    }, []);

    const poner = (k: keyof Datos) => (v: string) => setD((p) => ({ ...p, [k]: v }));

    const guardar = async () => {
        setGuardando(true);
        setMsg(null);
        try {
            await guardarPerfilNegocio(d);
            setMsg({ ok: true, texto: "Datos guardados." });
        } catch (e) {
            setMsg({ ok: false, texto: mensajeError(e) });
        } finally {
            setGuardando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={["top"]}>
            <ScrollView contentContainerStyle={{ padding: spacing.xl, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
                <PantallaHeader titulo="Datos del negocio" subtitulo={local} />
                {cargando ? (
                    <ActivityIndicator style={{ marginTop: spacing.xl }} />
                ) : (
                    <>
                        <Text style={styles.nota}>
                            Esta información es solo para ti. No se muestra a los comensales; se usará en tus reportes y recibos.
                        </Text>
                        <TextField label="Razón social o nombre del negocio" icono="business-outline" value={d.razon_social} onChangeText={poner("razon_social")} autoCapitalize="words" />
                        <TextField label="NIT o cédula (opcional)" icono="document-text-outline" value={d.nit} onChangeText={poner("nit")} />
                        <TextField label="Correo de contacto" icono="mail-outline" value={d.email_contacto} onChangeText={poner("email_contacto")} keyboardType="email-address" />
                        <TextField label="Teléfono de contacto" icono="call-outline" value={d.telefono_contacto} onChangeText={poner("telefono_contacto")} keyboardType="phone-pad" />
                        <TextField label="Dirección" icono="location-outline" value={d.direccion_fiscal} onChangeText={poner("direccion_fiscal")} autoCapitalize="sentences" />
                        <TextField label="Mensaje al pie de tus reportes" icono="chatbubble-ellipses-outline" value={d.nota_pie} onChangeText={poner("nota_pie")} placeholder="¡Gracias por visitarnos!" autoCapitalize="sentences" />

                        {!!msg && <Text style={[styles.msg, { color: msg.ok ? "#1F7A44" : "#B3261E" }]}>{msg.texto}</Text>}

                        <Pressable style={[styles.boton, guardando && { opacity: 0.6 }]} onPress={guardar} disabled={guardando}>
                            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.botonTxt}>Guardar</Text>}
                        </Pressable>
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const useStyles = themed((colors) => ({
    container: { flex: 1, backgroundColor: colors.background },
    nota: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
    msg: { fontSize: 13, fontWeight: "600" },
    boton: { backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 15, alignItems: "center" },
    botonTxt: { color: "#fff", fontWeight: "800", fontSize: 15 },
}));
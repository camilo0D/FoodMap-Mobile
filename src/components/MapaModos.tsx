import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import RestaurantMap from "./RestaurantMap";
import GlobeMap, { Accion } from "./GlobeMap";
import { themed, useColors } from "../theme";
import type { Restaurante } from "../types";
import type { Coord } from "../utils/geo";

type Props = {
    restaurantes: Restaurante[];
    seleccionado: Restaurante | null;
    onSelect: (r: Restaurante) => void;
    ubicacion?: Coord | null;
    centerSignal?: number;
    onComoLlegar: (r: Restaurante) => void;
};

const RADIOS = [
    { m: 300, texto: "300 m" },
    { m: 500, texto: "500 m" },
    { m: 1000, texto: "1 km" },
];

// Reemplaza a <RestaurantMap/> en MapScreen: mapa plano o globo, radio y "Cómo llegar".
export default function MapaModos({
    restaurantes, seleccionado, onSelect, ubicacion, centerSignal, onComoLlegar,
}: Props) {
    const styles = useStyles();
    const colors = useColors();
    const [modo, setModo] = useState<"plano" | "globo">("plano");
    const [radioM, setRadioM] = useState(500);
    const [accion, setAccion] = useState<Accion>(null);

    // El botón de ubicación es el de MapScreen: al pulsarlo (centerSignal sube) el globo también vuela a tu posición.
    useEffect(() => {
        if (modo === "globo" && centerSignal) lanzar("yo");
    }, [centerSignal]);

    const lanzar = (tipo: "seleccion" | "yo" | "inicio") => setAccion({ tipo, n: Date.now() });

    const cambiarModo = () => {
        const nuevo = modo === "plano" ? "globo" : "plano";
        setModo(nuevo);
        if (nuevo === "globo") setTimeout(() => lanzar(seleccionado ? "seleccion" : "inicio"), 900);
    };

    const elegir = (r: Restaurante) => {
        onSelect(r);
        if (modo === "globo") setTimeout(() => lanzar("seleccion"), 50);
    };

    // MapScreen ya tiene el botón de ubicación en la esquina (46 px). Los nuestros van encima.
    const baseUbicacion = seleccionado ? 140 : 16;
    const abajoControles = baseUbicacion + 46 + 12;
    const abajoLlegar = 140;

    return (
        <View style={{ flex: 1 }}>
            {modo === "plano" ? (
                <RestaurantMap
                    restaurantes={restaurantes}
                    seleccionadoId={seleccionado?.id}
                    seleccionado={seleccionado}
                    radioM={radioM}
                    onSelect={onSelect}
                    ubicacion={ubicacion}
                    centerSignal={centerSignal}
                />
            ) : (
                <GlobeMap
                    restaurantes={restaurantes}
                    seleccionado={seleccionado}
                    onSelect={(id) => {
                        const r = restaurantes.find((x) => x.id === id);
                        if (r) elegir(r);
                    }}
                    ubicacion={ubicacion ?? null}
                    color={colors.primary}
                    radioM={radioM}
                    accion={accion}
                />
            )}

            <View style={[styles.controles, { bottom: abajoControles }]} pointerEvents="box-none">
                {seleccionado && (
                    <View style={styles.radios}>
                        {RADIOS.map((r) => (
                            <Pressable key={r.m} onPress={() => setRadioM(r.m)} style={[styles.radio, radioM === r.m && styles.radioActivo]}>
                                <Text style={[styles.radioTexto, radioM === r.m && styles.radioTextoActivo]}>{r.texto}</Text>
                            </Pressable>
                        ))}
                    </View>
                )}
                <Pressable onPress={cambiarModo} style={styles.fab}>
                    <Ionicons name={modo === "plano" ? "earth" : "map"} size={22} color={colors.primary} />
                </Pressable>
            </View>

            {seleccionado && (
                <Pressable
                    onPress={() => onComoLlegar(seleccionado)}
                    style={[styles.llegar, { bottom: abajoLlegar }]}
                >
                    <Ionicons name="navigate" size={18} color="#fff" />
                    <Text style={styles.llegarTexto}>Cómo llegar</Text>
                </Pressable>
            )}
        </View>
    );
}

const useStyles = themed((colors) => ({
    controles: { position: "absolute", right: 16, alignItems: "flex-end", gap: 10 },
    fab: {
        width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surface,
        alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: colors.border, elevation: 5,
    },
    radios: {
        flexDirection: "row", backgroundColor: colors.surface, borderRadius: 999, padding: 3,
        borderWidth: 1, borderColor: colors.border, elevation: 5,
    },
    radio: { paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
    radioActivo: { backgroundColor: colors.primary },
    radioTexto: { fontSize: 12, fontWeight: "700", color: colors.text },
    radioTextoActivo: { color: "#fff" },
    llegar: {
        position: "absolute", left: 16, flexDirection: "row", alignItems: "center", gap: 8,
        backgroundColor: colors.primary, paddingHorizontal: 18, height: 46, borderRadius: 23, elevation: 6,
    },
    llegarTexto: { color: "#fff", fontWeight: "800", fontSize: 14 },
}));
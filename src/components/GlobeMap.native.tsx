import { useEffect, useRef } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { HTML_GLOBO } from "./globeHtml";
import type { Coord } from "../utils/geo";
import type { Restaurante } from "../types";

export type Accion = { tipo: "seleccion" | "yo" | "inicio"; n: number } | null;

type Props = {
    restaurantes: Restaurante[];
    seleccionado: Restaurante | null;
    onSelect: (id: string) => void;
    ubicacion: Coord | null;
    color: string;
    radioM: number;
    accion: Accion;
};

// Android: MapLibre Native todavía no tiene proyección de globo, así que el globo
// corre dentro de un WebView con MapLibre GL JS.
export default function GlobeMap({ restaurantes, seleccionado, onSelect, ubicacion, color, radioM, accion }: Props) {
    const web = useRef<any>(null);
    const listo = useRef(false);
    const ultimaAccion = useRef(0);
    const alElegir = useRef(onSelect);
    alElegir.current = onSelect;

    const enviar = () => {
        if (!listo.current) return;
        const nueva = accion && accion.n !== ultimaAccion.current ? accion : null;
        if (nueva) ultimaAccion.current = nueva.n;
        const estado = {
            restaurantes: restaurantes
                .filter((r) => r.latitud && r.longitud)
                .map((r) => ({ id: r.id, lat: Number(r.latitud), lng: Number(r.longitud) })),
            seleccionadoId: seleccionado?.id ?? null,
            seleccion: seleccionado ? { lat: Number(seleccionado.latitud), lng: Number(seleccionado.longitud) } : null,
            radioM,
            ubicacion,
            color,
            accion: nueva?.tipo ?? null,
        };
        web.current?.injectJavaScript(`window.recibir(${JSON.stringify(estado)}); true;`);
    };

    useEffect(() => { enviar(); });

    return (
        <View style={{ flex: 1, backgroundColor: "#0b1226" }}>
            <WebView
                ref={web}
                originWhitelist={["*"]}
                source={{ html: HTML_GLOBO, baseUrl: "https://foodmap.app" }}
                javaScriptEnabled
                domStorageEnabled
                mixedContentMode="always"
                style={{ flex: 1, backgroundColor: "#0b1226" }}
                onMessage={(e) => {
                    try {
                        const m = JSON.parse(e.nativeEvent.data);
                        if (m.tipo === "listo") { listo.current = true; enviar(); }
                        else if (m.tipo === "seleccion") alElegir.current(m.id);
                    } catch { /* mensaje ajeno */ }
                }}
            />
        </View>
    );
}
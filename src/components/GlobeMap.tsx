import { createElement, useEffect, useRef } from "react";
import { View } from "react-native";
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

// Navegador: el globo corre dentro de un iframe con MapLibre GL JS.
export default function GlobeMap({ restaurantes, seleccionado, onSelect, ubicacion, color, radioM, accion }: Props) {
    const iframe = useRef<any>(null);
    const listo = useRef(false);
    const ultimaAccion = useRef(0);
    const alElegir = useRef(onSelect);
    alElegir.current = onSelect;

    const estado = () => {
        const nueva = accion && accion.n !== ultimaAccion.current ? accion : null;
        if (nueva) ultimaAccion.current = nueva.n;
        return {
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
    };

    const enviar = () => {
        const w = iframe.current?.contentWindow;
        if (listo.current && w && typeof w.recibir === "function") w.recibir(estado());
    };

    useEffect(() => {
        const manejar = (e: MessageEvent) => {
            if (e.source !== iframe.current?.contentWindow) return;
            try {
                const m = JSON.parse(e.data);
                if (m.tipo === "listo") { listo.current = true; enviar(); }
                else if (m.tipo === "seleccion") alElegir.current(m.id);
            } catch { /* mensaje ajeno */ }
        };
        window.addEventListener("message", manejar);
        return () => window.removeEventListener("message", manejar);
    }, []);

    useEffect(() => { enviar(); });

    return (
        <View style={{ flex: 1, backgroundColor: "#0b1226" }}>
            {createElement("iframe" as any, {
                ref: iframe,
                srcDoc: HTML_GLOBO,
                title: "Globo",
                style: { border: 0, width: "100%", height: "100%" },
            })}
        </View>
    );
}
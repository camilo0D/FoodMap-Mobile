import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { StyleSheet, useColorScheme } from "react-native";
import { prefs } from "../services/prefs";
import { ACENTO_DEFECTO, crearPaleta, Palette } from "./palette";

type TemaState = {
    colors: Palette;
    oscuro: boolean;
    acento: string;
    alternarModo: () => void;
    setAcento: (color: string) => void;
};

const porDefecto = crearPaleta(ACENTO_DEFECTO, false);

const ThemeContext = createContext<TemaState>({
    colors: porDefecto,
    oscuro: false,
    acento: ACENTO_DEFECTO,
    alternarModo: () => { },
    setAcento: () => { },
});

export const useTheme = () => useContext(ThemeContext);
export const useColors = () => useContext(ThemeContext).colors;

export function ThemeProvider({ children }: { children: ReactNode }) {
    const sistema = useColorScheme();
    const [oscuroElegido, setOscuroElegido] = useState<boolean | null>(null);
    const [acento, setAcentoState] = useState(ACENTO_DEFECTO);
    const [listo, setListo] = useState(false);

    useEffect(() => {
        prefs
            .get("tema")
            .then((raw) => {
                try {
                    const p = raw ? JSON.parse(raw) : null;
                    if (typeof p?.acento === "string") setAcentoState(p.acento);
                    if (typeof p?.oscuro === "boolean") setOscuroElegido(p.oscuro);
                } catch {
                    /* preferencia dañada: se ignora */
                }
            })
            .finally(() => setListo(true));
    }, []);

    const oscuro = oscuroElegido ?? sistema === "dark";
    const colors = useMemo(() => crearPaleta(acento, oscuro), [acento, oscuro]);

    const guardar = (o: boolean, a: string) => prefs.set("tema", JSON.stringify({ oscuro: o, acento: a }));

    const value = useMemo<TemaState>(
        () => ({
            colors,
            oscuro,
            acento,
            alternarModo: () => {
                setOscuroElegido(!oscuro);
                guardar(!oscuro, acento);
            },
            setAcento: (c: string) => {
                setAcentoState(c);
                guardar(oscuro, c);
            },
        }),
        [colors, oscuro, acento]
    );

    if (!listo) return null;
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// Igual que StyleSheet.create, pero recibe los colores del tema actual.
export function themed<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
    crear: (colors: Palette) => T
) {
    return function useThemedStyles(): T {
        const colors = useColors();
        return useMemo(() => StyleSheet.create(crear(colors)), [colors]);
    };
}
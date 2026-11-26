export type Palette = {
    primary: string;
    primarySoft: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
    star: string;
};

export const ACENTOS = [
    { id: "naranja", nombre: "Naranja", color: "#F26A21" },
    { id: "rojo", nombre: "Rojo", color: "#E5383B" },
    { id: "rosa", nombre: "Rosa", color: "#E0457B" },
    { id: "morado", nombre: "Morado", color: "#8B5CF6" },
    { id: "azul", nombre: "Azul", color: "#2F7CF6" },
    { id: "verde", nombre: "Verde", color: "#2E9E5B" },
] as const;

export const ACENTO_DEFECTO = ACENTOS[0].color as string;

const aRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

// t = parte de `a` en la mezcla (0 a 1); el resto es `b`
export function mezclar(a: string, b: string, t: number): string {
    const A = aRgb(a);
    const B = aRgb(b);
    return (
        "#" +
        A.map((v, i) => Math.round(v * t + B[i] * (1 - t)).toString(16).padStart(2, "0")).join("")
    );
}

export function crearPaleta(acento: string, oscuro: boolean): Palette {
    if (oscuro) {
        return {
            primary: acento,
            primarySoft: mezclar(acento, "#1C1C1F", 0.22),
            background: mezclar(acento, "#0F0F11", 0.06),
            surface: mezclar(acento, "#1C1C1F", 0.05),
            text: "#F5F0EB",
            textMuted: "#A39A92",
            border: mezclar(acento, "#2C2C30", 0.12),
            star: "#F5B301",
        };
    }
    return {
        primary: acento,
        primarySoft: mezclar(acento, "#FFFFFF", 0.16),
        background: mezclar(acento, "#FFFFFF", 0.08),
        surface: "#FFFFFF",
        text: "#1F1A17",
        textMuted: "#7A6F68",
        border: mezclar(acento, "#EDE6E0", 0.1),
        star: "#F5B301",
    };
}

// Paleta clara por defecto: la usan los archivos que aún no se migraron al tema.
export const colors: Palette = crearPaleta(ACENTO_DEFECTO, false);

export const radius = { sm: 8, md: 12, lg: 20, pill: 999 };
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 };
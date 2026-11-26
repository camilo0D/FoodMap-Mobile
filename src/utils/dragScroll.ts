// Solo navegador: permite arrastrar con el mouse las listas horizontales
// (chips, pestañas, carruseles), como se hace con el dedo en el celular.
// En Android/iOS no hace nada.
import { Platform } from "react-native";

if (Platform.OS === "web" && typeof document !== "undefined" && !(window as any).__dragScrollActivo) {
    (window as any).__dragScrollActivo = true;

    let el: HTMLElement | null = null;
    let inicioX = 0;
    let inicioScroll = 0;
    let arrastrando = false;

    const scrollHorizontal = (inicio: EventTarget | null): HTMLElement | null => {
        let n = inicio as HTMLElement | null;
        while (n && n !== document.body) {
            const s = getComputedStyle(n);
            if ((s.overflowX === "auto" || s.overflowX === "scroll") && n.scrollWidth > n.clientWidth + 1) return n;
            n = n.parentElement;
        }
        return null;
    };

    document.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;
        const t = e.target as HTMLElement;
        if (t.closest?.("input, textarea")) return;
        el = scrollHorizontal(e.target);
        if (!el) return;
        inicioX = e.pageX;
        inicioScroll = el.scrollLeft;
        arrastrando = false;
    });

    document.addEventListener("mousemove", (e) => {
        if (!el) return;
        const dx = e.pageX - inicioX;
        if (!arrastrando && Math.abs(dx) > 5) {
            arrastrando = true;
            document.body.style.userSelect = "none";
            el.style.cursor = "grabbing";
        }
        if (arrastrando) {
            el.scrollLeft = inicioScroll - dx;
            e.preventDefault();
        }
    });

    const terminar = () => {
        if (el) el.style.cursor = "";
        document.body.style.userSelect = "";
        el = null;
        // el "click" que sigue a un arrastre se ignora (para no abrir una categoría sin querer)
        setTimeout(() => { arrastrando = false; }, 60);
    };
    document.addEventListener("mouseup", terminar);
    document.addEventListener("mouseleave", terminar);

    document.addEventListener(
        "click",
        (e) => {
            if (arrastrando) {
                e.stopPropagation();
                e.preventDefault();
            }
        },
        true
    );
}

export { };
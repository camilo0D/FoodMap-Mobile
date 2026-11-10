const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
export const DIAS_ORDEN = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

export const ETIQUETA_DIA: Record<string, string> = {
    lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves",
    viernes: "Viernes", sabado: "Sábado", domingo: "Domingo",
};

export const diaActual = () => DIAS[new Date().getDay()];

export function estadoAbierto(horario?: Record<string, string> | null) {
    if (!horario || Object.keys(horario).length === 0) return null;
    const ahora = new Date();
    const hoy = horario[DIAS[ahora.getDay()]];
    if (!hoy || /cerrado/i.test(hoy)) return { abierto: false, texto: "Cerrado hoy" };
    const m = hoy.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const min = ahora.getHours() * 60 + ahora.getMinutes();
    const ini = Number(m[1]) * 60 + Number(m[2]);
    const fin = Number(m[3]) * 60 + Number(m[4]);
    const abierto = fin > ini ? min >= ini && min < fin : min >= ini || min < fin;
    return { abierto, texto: abierto ? "Abierto ahora" : "Cerrado ahora" };
}
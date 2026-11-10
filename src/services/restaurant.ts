import { api, API_URL } from "./api";
import type { Restaurante } from "../types";

const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

export async function getRestaurantes(): Promise<Restaurante[]> {
    const { data } = await api.get("/restaurantes/");
    const lista: Restaurante[] = Array.isArray(data) ? data : data.results ?? [];
    return lista.map((r) => ({
        ...r,
        imagen: r.imagen
            ? r.imagen.replace(/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/, API_ORIGIN)
            : null,
    }));
}
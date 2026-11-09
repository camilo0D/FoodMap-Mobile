import { api } from "./api";
import type { Restaurante } from "../types";

export async function getRestaurantes(): Promise<Restaurante[]> {
    const { data } = await api.get("/restaurantes/");
    return Array.isArray(data) ? data : data.results ?? [];
}
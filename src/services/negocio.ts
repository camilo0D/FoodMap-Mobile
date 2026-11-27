import { api } from "./api";
import { fixImg } from "./restaurant";

export type PerfilNegocio = {
    restaurante?: string;
    razon_social: string;
    nit: string;
    email_contacto: string;
    telefono_contacto: string;
    direccion_fiscal: string;
    nota_pie: string;
    moneda: string;
};

export type ProductoNegocio = {
    id: string;
    nombre: string;
    precio: string;
    disponible: boolean;
    imagen: string | null;
    controla_stock: boolean;
    cantidad: string;
    stock_minimo: string;
    costo: string;
    unidad: string;
    agotado: boolean;
    bajo: boolean;
};

export type ResumenInventario = {
    total: number;
    con_control: number;
    agotados: number;
    bajos: number;
    valor_inventario: string;
};

export type Movimiento = {
    id: string;
    tipo: "entrada" | "salida" | "ajuste";
    cantidad: string;
    saldo: string;
    nota: string;
    created_at: string;
};

const norm = (p: ProductoNegocio): ProductoNegocio => ({ ...p, imagen: fixImg(p.imagen) });

export async function getPerfilNegocio(): Promise<PerfilNegocio> {
    const { data } = await api.get("/negocio/perfil/");
    return data;
}

export async function guardarPerfilNegocio(d: Omit<PerfilNegocio, "restaurante">): Promise<PerfilNegocio> {
    const { data } = await api.put("/negocio/perfil/", d);
    return data;
}

export async function getProductosNegocio(): Promise<{ resumen: ResumenInventario; productos: ProductoNegocio[] }> {
    const { data } = await api.get("/negocio/productos/");
    return { resumen: data.resumen, productos: (data.productos as ProductoNegocio[]).map(norm) };
}

export async function configurarInventario(
    id: string,
    d: { controla_stock?: boolean; stock_minimo?: string; costo?: string; unidad?: string }
): Promise<ProductoNegocio> {
    const { data } = await api.patch(`/negocio/productos/${id}/inventario/`, d);
    return norm(data);
}

export async function registrarMovimiento(
    id: string,
    d: { tipo: Movimiento["tipo"]; cantidad: string; nota?: string }
): Promise<ProductoNegocio> {
    const { data } = await api.post(`/negocio/productos/${id}/movimientos/`, d);
    return norm(data);
}

export async function getMovimientos(id: string): Promise<Movimiento[]> {
    const { data } = await api.get(`/negocio/productos/${id}/movimientos/`);
    return data;
}

/** Extrae un mensaje legible de un error de la API. */
export function mensajeError(e: any, porDefecto = "No pudimos completar la acción. Intenta de nuevo."): string {
    const d = e?.response?.data;
    if (!d) return "No pudimos conectar con el servidor.";
    if (typeof d.error === "string") return d.error;
    if (typeof d.detail === "string") return d.detail;
    const primero = Object.values(d)[0];
    if (Array.isArray(primero) && typeof primero[0] === "string") return primero[0];
    if (typeof primero === "string") return primero;
    return porDefecto;
}
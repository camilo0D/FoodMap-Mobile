export function precioCOP(valor: string | number) {
    const n = Math.round(Number(valor));
    return `$ ${n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}

export function fechaCorta(iso: string) {
    const d = new Date(iso);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
}
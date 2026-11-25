import { useEffect, useRef } from "react";
import { View } from "react-native";

const CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const SRC = "https://accounts.google.com/gsi/client";

type Props = { onCredential: (idToken: string) => void; onError?: (mensaje: string) => void };

function cargarScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if ((window as any).google?.accounts?.id) return resolve();
        const existente = document.querySelector(`script[src="${SRC}"]`);
        if (existente) {
            existente.addEventListener("load", () => resolve());
            return;
        }
        const s = document.createElement("script");
        s.src = SRC;
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("No se pudo cargar Google"));
        document.head.appendChild(s);
    });
}

export default function GoogleButton({ onCredential, onError }: Props) {
    const ref = useRef<any>(null);
    const alRecibir = useRef(onCredential);
    alRecibir.current = onCredential;

    useEffect(() => {
        if (!CLIENT_ID) {
            onError?.("Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID en el .env de la app.");
            return;
        }
        let cancelado = false;
        cargarScript()
            .then(() => {
                if (cancelado || !ref.current) return;
                const g = (window as any).google.accounts.id;
                g.initialize({ client_id: CLIENT_ID, callback: (r: any) => alRecibir.current(r.credential) });
                g.renderButton(ref.current, {
                    type: "standard", theme: "outline", size: "large", text: "continue_with",
                    shape: "pill", width: 330, locale: "es",
                });
            })
            .catch(() => onError?.("No pudimos cargar Google. Revisa tu conexión."));
        return () => { cancelado = true; };
    }, []);

    return <View ref={ref} style={{ alignItems: "center", minHeight: 44 }} />;
}
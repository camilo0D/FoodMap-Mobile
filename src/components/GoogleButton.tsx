type Props = { onCredential: (idToken: string) => void; onError?: (mensaje: string) => void };

// En Android el inicio de sesión con Google se agrega con el build en la nube.
export default function GoogleButton(_props: Props) {
    return null;
}
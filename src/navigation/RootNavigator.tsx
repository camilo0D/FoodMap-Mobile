import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import OwnerTabs from "./OwnerTabs";
import AdminScreen from "../screens/admin/AdminScreen";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import RouteScreen from "../screens/RouteScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import MyReviewsScreen from "../screens/MyReviewsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import EditLocalScreen from "../screens/owner/EditLocalScreen";
import PlatoFormScreen from "../screens/owner/PlatoFormScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import ResetPasswordScreen from "../screens/auth/ResetPasswordScreen";
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import NegocioScreen from "../screens/owner/NegocioScreen";
import InventarioScreen from "../screens/owner/InventarioScreen";
import ProductoInventarioScreen from "../screens/owner/ProductoInventarioScreen";
import ExploreScreen from "../screens/ExploreScreen";
import MapScreen from "../screens/MapScreen";
import { useAuth } from "../context/AuthContext";
import { navigationRef } from "./ref";
import { prefs } from "../services/prefs";
import type { RootStackParamList } from "./types";

// true: la introducción se muestra cada vez que se abre la app sin sesión.
// false: solo la primera vez.
const MOSTRAR_ONBOARDING_SIEMPRE = true;
const DURACION_SPLASH_MS = 2900;

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { usuario, cargando, destinoPendiente, guardarDestino } = useAuth();
    const [onboardingVisto, setOnboardingVisto] = useState<boolean | null>(null);
    const [splashTerminado, setSplashTerminado] = useState(false);

    useEffect(() => {
        prefs.get("onboardingVisto").then((v) => setOnboardingVisto(v === "1"));
        const t = setTimeout(() => setSplashTerminado(true), DURACION_SPLASH_MS);
        return () => clearTimeout(t);
    }, []);

    // Modo invitado: tras iniciar sesión, vuelve a donde estaba (restaurante, ruta…)
    useEffect(() => {
        if (!usuario) return;
        const d = destinoPendiente();
        if (!d) return;
        const t = setTimeout(() => {
            if (navigationRef.isReady()) {
                navigationRef.reset({ index: 1, routes: [{ name: "Tabs" }, { name: d.name, params: d.params }] as any });
            }
            guardarDestino(null);
        }, 50);
        return () => clearTimeout(t);
    }, [usuario, destinoPendiente, guardarDestino]);

    if (cargando || onboardingVisto === null || !splashTerminado) return <SplashScreen />;

    const roles = usuario?.roles ?? [];
    const esAdmin = roles.includes("admin");
    const esDueno = roles.includes("restaurante");
    const verIntro = MOSTRAR_ONBOARDING_SIEMPRE || !onboardingVisto;

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false, animation: "fade_from_bottom" }}
            initialRouteName={usuario ? "Tabs" : verIntro ? "Onboarding" : "Inicio"}
        >
            {usuario ? (
                <>
                    <Stack.Screen name="Tabs" component={esAdmin ? AdminScreen : esDueno ? OwnerTabs : MainTabs} />
                    <Stack.Screen name="Detalle" component={RestaurantDetailScreen} />
                    <Stack.Screen name="Ruta" component={RouteScreen} />
                    <Stack.Screen name="EditarPerfil" component={EditProfileScreen} />
                    <Stack.Screen name="MisResenas" component={MyReviewsScreen} />
                    <Stack.Screen name="Configuracion" component={SettingsScreen} />
                    <Stack.Screen name="EditarLocal" component={EditLocalScreen} />
                    <Stack.Screen name="EditarPlato" component={PlatoFormScreen} />
                    <Stack.Screen name="Negocio" component={NegocioScreen} />
                    <Stack.Screen name="Inventario" component={InventarioScreen} />
                    <Stack.Screen name="ProductoInventario" component={ProductoInventarioScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Inicio" component={HomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Registro" component={RegisterScreen} />
                    <Stack.Screen name="ExplorarInvitado" component={ExploreScreen} />
                    <Stack.Screen name="MapaInvitado" component={MapScreen} />
                    <Stack.Screen name="Detalle" component={RestaurantDetailScreen} />
                </>
            )}
            <Stack.Screen name="RecuperarClave" component={ForgotPasswordScreen} />
            <Stack.Screen name="RestablecerClave" component={ResetPasswordScreen} />
        </Stack.Navigator>
    );
}
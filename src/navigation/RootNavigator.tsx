import { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import SplashScreen from "../screens/SplashScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import HomeScreen from "../screens/HomeScreen";
import { useAuth } from "../context/AuthContext";
import { prefs } from "../services/prefs";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    const { usuario, cargando } = useAuth();
    const [onboardingVisto, setOnboardingVisto] = useState<boolean | null>(null);
    const [splashTerminado, setSplashTerminado] = useState(false);

    useEffect(() => {
        prefs.get("onboardingVisto").then((v) => setOnboardingVisto(v === "1"));
        const t = setTimeout(() => setSplashTerminado(true), 1800);
        return () => clearTimeout(t);
    }, []);

    if (cargando || onboardingVisto === null || !splashTerminado) return <SplashScreen />;

    return (
        <Stack.Navigator
            screenOptions={{ headerShown: false }}
            initialRouteName={onboardingVisto ? "Inicio" : "Onboarding"}
        >
            {usuario ? (
                <>
                    <Stack.Screen name="Tabs" component={MainTabs} />
                    <Stack.Screen name="Detalle" component={RestaurantDetailScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                    <Stack.Screen name="Inicio" component={HomeScreen} />
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Registro" component={RegisterScreen} />
                </>
            )}
        </Stack.Navigator>
    );
}
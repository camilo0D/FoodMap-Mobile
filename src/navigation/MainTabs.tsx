import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import MapScreen from "../screens/MapScreen";
import { ExploreScreen, FavoritesScreen, ProfileScreen } from "../screens/Placeholders";
import { colors } from "../theme";

const Tab = createBottomTabNavigator();

const iconos: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
    Mapa: ["map", "map-outline"],
    Explorar: ["compass", "compass-outline"],
    Favoritos: ["heart", "heart-outline"],
    Perfil: ["person", "person-outline"],
};

export default function MainTabs() {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
                tabBarIcon: ({ focused, color, size }) => (
                    <Ionicons name={iconos[route.name][focused ? 0 : 1]} size={size} color={color} />
                ),
            })}
        >
            <Tab.Screen name="Mapa" component={MapScreen} />
            <Tab.Screen name="Explorar" component={ExploreScreen} />
            <Tab.Screen name="Favoritos" component={FavoritesScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
        </Tab.Navigator>
    );
}
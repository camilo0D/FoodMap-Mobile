import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import OwnerHomeScreen from "../screens/owner/OwnerHomeScreen";
import OwnerMenuScreen from "../screens/owner/OwnerMenuScreen";
import OwnerReviewsScreen from "../screens/owner/OwnerReviewsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import FavoritesScreen from "../screens/FavoritesScreen";
import { useColors } from "../theme";

const Tab = createBottomTabNavigator();

const iconos: Record<string, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
    "Mi local": ["storefront", "storefront-outline"],
    "Menú": ["restaurant", "restaurant-outline"],
    "Reseñas": ["star", "star-outline"],
    Perfil: ["person", "person-outline"],
};

export default function OwnerTabs() {
  const colors = useColors();
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
                tabBarIcon: ({ focused, color, size }) => {
                    const par = iconos[route.name];
                    return par ? <Ionicons name={par[focused ? 0 : 1]} size={size} color={color} /> : null;
                },
            })}
        >
            <Tab.Screen name="Mi local" component={OwnerHomeScreen} />
            <Tab.Screen name="Menú" component={OwnerMenuScreen} />
            <Tab.Screen name="Reseñas" component={OwnerReviewsScreen} />
            <Tab.Screen name="Perfil" component={ProfileScreen} />
            <Tab.Screen name="Favoritos" component={FavoritesScreen} options={{ tabBarButton: () => null }} />
        </Tab.Navigator>
    );
}
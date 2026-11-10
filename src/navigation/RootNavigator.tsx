import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import RestaurantDetailScreen from "../screens/RestaurantDetailScreen";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={MainTabs} />
            <Stack.Screen name="Detalle" component={RestaurantDetailScreen} />
        </Stack.Navigator>
    );
}
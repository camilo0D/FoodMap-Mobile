import { Platform, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";

const esWeb = Platform.OS === "web";

export default function App() {
  return (
    <View style={{ flex: 1, backgroundColor: esWeb ? "#2B2623" : "#FDF3EA", alignItems: "center" }}>
      <View
        style={{
          flex: 1, width: "100%", maxWidth: esWeb ? 420 : undefined, overflow: "hidden",
          ...(esWeb ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#000" } : {}),
        }}
      >
        <SafeAreaProvider>
          <AuthProvider>
            <FavoritesProvider>
              <NavigationContainer>
                <RootNavigator />
              </NavigationContainer>
            </FavoritesProvider>
          </AuthProvider>
          <StatusBar style="dark" />
        </SafeAreaProvider>
      </View>
    </View>
  );
}
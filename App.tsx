import { Platform, View } from "react-native";
import { DarkTheme, DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import RootNavigator from "./src/navigation/RootNavigator";
import { AuthProvider } from "./src/context/AuthContext";
import { FavoritesProvider } from "./src/context/FavoritesContext";
import { ThemeProvider, useTheme } from "./src/theme";
import "./src/utils/dragScroll";
import { navigationRef } from "./src/navigation/ref";

const esWeb = Platform.OS === "web";

function Raiz() {
  const { colors, oscuro } = useTheme();
  const base = oscuro ? DarkTheme : DefaultTheme;
  const temaNavegacion = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
    },
  };

  return (
    <View style={{ flex: 1, backgroundColor: esWeb ? "#2B2623" : colors.background, alignItems: "center" }}>
      <View
        style={{
          flex: 1, width: "100%", maxWidth: esWeb ? 420 : undefined, overflow: "hidden",
          backgroundColor: colors.background,
          ...(esWeb ? { borderLeftWidth: 1, borderRightWidth: 1, borderColor: "#000" } : {}),
        }}
      >
        <AuthProvider>
          <FavoritesProvider>
            <NavigationContainer ref={navigationRef} theme={temaNavegacion}>
              <RootNavigator />
            </NavigationContainer>
          </FavoritesProvider>
        </AuthProvider>
        <StatusBar style={oscuro ? "light" : "dark"} />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Raiz />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
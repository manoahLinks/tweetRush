import {
    DarkTheme,
    DefaultTheme,
    ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-get-random-values";
import "react-native-reanimated";
import "../global.css";

import { GameProvider } from "@/contexts/GameContext";
import { UserProvider } from "@/contexts/UserContext";
import { WalletProvider } from "@/contexts/WalletContext";
import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
    anchor: "(tabs)",
};

export default function RootLayout() {
    const colorScheme = useColorScheme();

    return (
        <WalletProvider>
            <UserProvider>
                <GameProvider>
                    <ThemeProvider
                        value={
                            colorScheme === "dark" ? DarkTheme : DefaultTheme
                        }
                    >
                        <Stack>
                            <Stack.Screen
                                name="(tabs)"
                                options={{ headerShown: false }}
                            />
                            <Stack.Screen
                                name="modal"
                                options={{
                                    presentation: "modal",
                                    title: "Modal",
                                }}
                            />
                        </Stack>
                        <StatusBar style="auto" />
                    </ThemeProvider>
                </GameProvider>
            </UserProvider>
        </WalletProvider>
    );
}

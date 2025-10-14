/**
 * ExampleApp.tsx
 *
 * Example integration showing how to navigate between all TweetRush screens.
 * This can be used as a standalone app or integrated into Expo Router.
 */

import React, { useState } from "react";
import { View } from "react-native";
import SplashScreen from "./SplashScreen";
import HomeScreen from "./HomeScreen";
import GameScreen from "./GameScreen";
import ProfileScreen from "./ProfileScreen";
import BountiesScreen from "./BountiesScreen";
import LeaderboardScreen from "./LeaderboardScreen";
import SettingsScreen from "./SettingsScreen";
import { mockMidGame } from "@/mocks";

type Screen =
    | "splash"
    | "home"
    | "game"
    | "profile"
    | "bounties"
    | "leaderboard"
    | "settings";

const ExampleApp: React.FC = () => {
    const [currentScreen, setCurrentScreen] = useState<Screen>("splash");
    const [hasSeenSplash, setHasSeenSplash] = useState(false);

    const navigate = (screen: Screen) => {
        setCurrentScreen(screen);
    };

    const handleGetStarted = () => {
        setHasSeenSplash(true);
        navigate("home");
    };

    const handleConnectWallet = () => {
        // Mock: In production, this would trigger wallet connection
        console.log("Mock: Connect wallet");
        setHasSeenSplash(true);
        navigate("home");
    };

    // Render current screen
    const renderScreen = () => {
        switch (currentScreen) {
            case "splash":
                return (
                    <SplashScreen
                        onGetStarted={handleGetStarted}
                        onConnectWallet={handleConnectWallet}
                    />
                );

            case "home":
                return <HomeScreen onNavigateToPlay={() => navigate("game")} />;

            case "game":
                return (
                    <GameScreen
                        onBack={() => navigate("home")}
                        gameState={mockMidGame}
                    />
                );

            case "profile":
                return <ProfileScreen onBack={() => navigate("home")} />;

            case "bounties":
                return <BountiesScreen onBack={() => navigate("home")} />;

            case "leaderboard":
                return <LeaderboardScreen onBack={() => navigate("home")} />;

            case "settings":
                return <SettingsScreen onBack={() => navigate("home")} />;

            default:
                return <HomeScreen onNavigateToPlay={() => navigate("game")} />;
        }
    };

    return <View style={{ flex: 1 }}>{renderScreen()}</View>;
};

export default ExampleApp;

/**
 * USAGE WITH EXPO ROUTER:
 *
 * 1. Create separate route files in app/ directory:
 *    - app/splash.tsx
 *    - app/(tabs)/index.tsx (home)
 *    - app/game.tsx
 *    - app/profile.tsx
 *    - app/bounties.tsx
 *    - app/leaderboard.tsx
 *    - app/settings.tsx
 *
 * 2. Import and render screens in each route:
 *
 *    // app/game.tsx
 *    import GameScreen from '@/screens/GameScreen';
 *    import { router } from 'expo-router';
 *
 *    export default function Game() {
 *      return <GameScreen onBack={() => router.back()} />;
 *    }
 *
 * 3. Navigate using Expo Router:
 *
 *    import { router } from 'expo-router';
 *
 *    router.push('/game');
 *    router.push('/bounties');
 *    router.back();
 */

/**
 * USAGE WITH REACT NAVIGATION:
 *
 * import { NavigationContainer } from '@react-navigation/native';
 * import { createNativeStackNavigator } from '@react-navigation/native-stack';
 *
 * const Stack = createNativeStackNavigator();
 *
 * function App() {
 *   return (
 *     <NavigationContainer>
 *       <Stack.Navigator screenOptions={{ headerShown: false }}>
 *         <Stack.Screen name="Splash" component={SplashScreen} />
 *         <Stack.Screen name="Home" component={HomeScreen} />
 *         <Stack.Screen name="Game" component={GameScreen} />
 *         <Stack.Screen name="Profile" component={ProfileScreen} />
 *         <Stack.Screen name="Bounties" component={BountiesScreen} />
 *         <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
 *         <Stack.Screen name="Settings" component={SettingsScreen} />
 *       </Stack.Navigator>
 *     </NavigationContainer>
 *   );
 * }
 */

/**
 * UserContext.tsx
 * 
 * Context for managing user state, wallet connection, and onboarding
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
    username: string;
    walletAddress: string;
    isOnboarded: boolean;
}

interface UserContextType {
    user: User | null;
    isOnboarded: boolean;
    isLoading: boolean;
    completeOnboarding: (username: string, walletAddress: string) => Promise<void>;
    logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

interface UserProviderProps {
    children: React.ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const isOnboarded = user?.isOnboarded ?? false;

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                setUser(JSON.parse(userData));
            }
        } catch (error) {
            console.error("Error loading user data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const completeOnboarding = async (username: string, walletAddress: string) => {
        try {
            const newUser: User = {
                username,
                walletAddress,
                isOnboarded: true,
            };
            
            await AsyncStorage.setItem("user", JSON.stringify(newUser));
            setUser(newUser);
        } catch (error) {
            console.error("Error saving user data:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem("user");
            setUser(null);
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    const value: UserContextType = {
        user,
        isOnboarded,
        isLoading,
        completeOnboarding,
        logout,
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

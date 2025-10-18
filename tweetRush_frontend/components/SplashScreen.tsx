import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  message = "Loading WordRush..." 
}) => {
  return (
    <View className="flex-1 bg-darkBg justify-center items-center">
      {/* App Logo/Icon */}
      <View className="w-24 h-24 bg-primary rounded-2xl items-center justify-center mb-8">
        <Ionicons name="game-controller" size={40} color="#fff" />
      </View>
      
      {/* App Name */}
      <Text className="text-white text-3xl font-bold mb-2">
        WordRush
      </Text>
      <Text className="text-gray-400 text-base mb-8">
        Blockchain Word Game
      </Text>
      
      {/* Loading Indicator */}
      <ActivityIndicator size="large" color="#16A349" />
      <Text className="text-gray-300 text-sm mt-4">
        {message}
      </Text>
    </View>
  );
};

export default SplashScreen;

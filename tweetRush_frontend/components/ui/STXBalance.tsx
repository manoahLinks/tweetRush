/**
 * STXBalance.tsx
 * 
 * Component to display STX balance for connected wallet
 */

import { useUser } from '@/contexts/UserContext';
import { stacksService } from '@/utils/stacks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

interface STXBalanceProps {
    showIcon?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

const STXBalance: React.FC<STXBalanceProps> = ({ 
    showIcon = true, 
    size = 'md' 
}) => {
    const { user } = useUser();
    const [balance, setBalance] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.walletAddress) {
            loadBalance();
        }
    }, [user?.walletAddress]);

    const loadBalance = async () => {
        try {
            setLoading(true);
            const stxBalance = await stacksService.getSTXBalance(user!.walletAddress);
            setBalance(stxBalance);
        } catch (error) {
            console.error('Failed to load STX balance:', error);
        } finally {
            setLoading(false);
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'px-3 py-2',
                    text: 'text-sm',
                    icon: 16
                };
            case 'lg':
                return {
                    container: 'px-4 py-3',
                    text: 'text-lg',
                    icon: 20
                };
            default: // md
                return {
                    container: 'px-3 py-2',
                    text: 'text-base',
                    icon: 18
                };
        }
    };

    const sizeClasses = getSizeClasses();

    if (!user?.walletAddress) {
        return null;
    }

    return (
        <View className={`bg-gray-800 rounded-xl ${sizeClasses.container} flex-row items-center`}>
            {showIcon && (
                <Ionicons 
                    name="diamond" 
                    size={sizeClasses.icon} 
                    color="#16A349" 
                    className="mr-2"
                />
            )}
            {loading ? (
                <ActivityIndicator size="small" color="#16A349" />
            ) : (
                <Text className={`text-white font-semibold ${sizeClasses.text}`}>
                    {stacksService.formatSTX(balance)}
                </Text>
            )}
        </View>
    );
};

export default STXBalance;

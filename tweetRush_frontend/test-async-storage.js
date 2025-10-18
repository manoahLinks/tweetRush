/**
 * Test AsyncStorage functionality
 * This will help verify if the storage is working
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

async function testAsyncStorage() {
    try {
        console.log('🧪 Testing AsyncStorage...\n');
        
        const testKey = 'test_key';
        const testData = { message: 'Hello AsyncStorage!', timestamp: Date.now() };
        
        // Test 1: Store data
        console.log('📝 Test 1: Storing data...');
        await AsyncStorage.setItem(testKey, JSON.stringify(testData));
        console.log('✅ Data stored successfully');
        
        // Test 2: Retrieve data
        console.log('📖 Test 2: Retrieving data...');
        const retrieved = await AsyncStorage.getItem(testKey);
        const parsedData = JSON.parse(retrieved);
        console.log('Retrieved data:', parsedData);
        
        // Test 3: Clear data
        console.log('🗑️ Test 3: Clearing data...');
        await AsyncStorage.removeItem(testKey);
        const cleared = await AsyncStorage.getItem(testKey);
        console.log('Data after clearing:', cleared);
        
        console.log('\n✅ AsyncStorage test completed successfully!');
        
    } catch (error) {
        console.error('❌ AsyncStorage test failed:', error);
    }
}

// Run the test
testAsyncStorage();

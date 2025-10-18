/**
 * Test script for localStorage guess functionality
 * Run this to verify the guess storage works correctly
 */

// Mock localStorage for testing
if (typeof localStorage === 'undefined') {
    global.localStorage = {
        data: {},
        getItem: function(key) {
            return this.data[key] || null;
        },
        setItem: function(key, value) {
            this.data[key] = value;
        },
        removeItem: function(key) {
            delete this.data[key];
        }
    };
}

// Import the guess storage service
const { guessStorage } = require('./lib/guess-storage');

async function testGuessStorage() {
    try {
        console.log('🧪 Testing Guess Storage Service...\n');
        
        const testAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7';
        const testGameId = 1;
        const testWordIndex = 0;
        
        // Test 1: Store a guess
        console.log('📝 Test 1: Storing guesses...');
        await guessStorage.storeGuess(testAddress, testGameId, testWordIndex, 'STACK');
        await guessStorage.storeGuess(testAddress, testGameId, testWordIndex, 'STONE');
        await guessStorage.storeGuess(testAddress, testGameId, testWordIndex, 'STYLE');
        
        // Test 2: Retrieve guesses
        console.log('📖 Test 2: Retrieving guesses...');
        const guesses = await guessStorage.getGuessesForGame(testAddress, testGameId);
        console.log('Retrieved guesses:', guesses.map(g => g.guess));
        
        // Test 3: Sync with blockchain
        console.log('🔄 Test 3: Syncing with blockchain...');
        const blockchainGuesses = ['STACK', 'STONE']; // Simulate blockchain has 2 guesses
        const mergedGuesses = await guessStorage.syncWithBlockchain(
            testAddress, 
            blockchainGuesses, 
            testGameId
        );
        console.log('Merged guesses:', mergedGuesses);
        
        // Test 4: Check pending guesses
        console.log('⏳ Test 4: Checking pending guesses...');
        const hasPending = await guessStorage.hasPendingGuesses(testAddress, testGameId);
        console.log('Has pending guesses:', hasPending);
        
        // Test 5: Get latest guess
        console.log('🆕 Test 5: Getting latest guess...');
        const latestGuess = await guessStorage.getLatestGuess(testAddress, testGameId);
        console.log('Latest guess:', latestGuess);
        
        // Test 6: Clear game guesses
        console.log('🗑️ Test 6: Clearing game guesses...');
        await guessStorage.clearGameGuesses(testAddress, testGameId);
        const clearedGuesses = await guessStorage.getGuessesForGame(testAddress, testGameId);
        console.log('Guesses after clearing:', clearedGuesses.length);
        
        console.log('\n✅ All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testGuessStorage();

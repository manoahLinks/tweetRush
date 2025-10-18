/**
 * Test script to verify get-active-game function returns guesses
 * Run this after starting a game and making some guesses
 */

const { callReadOnly } = require('./lib/contract-utils');
const { principalCV } = require('@stacks/transactions');

async function testGetActiveGame() {
    try {
        console.log('🧪 Testing get-active-game function...');
        
        // Replace with your actual address
        const testAddress = 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7'; // Replace with your address
        
        console.log(`📡 Calling get-active-game for address: ${testAddress}`);
        
        const result = await callReadOnly('get-active-game', [principalCV(testAddress)]);
        
        console.log('📊 Raw response:', JSON.stringify(result, null, 2));
        
        if (result?.value) {
            const game = result.value;
            console.log('🎮 Game data:');
            console.log('  - Game ID:', game['game-id']?.value);
            console.log('  - Word Index:', game['word-index']?.value);
            console.log('  - Attempts:', game.attempts?.value);
            console.log('  - Won:', game.won?.value);
            console.log('  - Guesses:', game.guesses?.value);
            console.log('  - Block Height:', game['block-height']?.value);
            
            const guesses = game.guesses?.value || [];
            console.log(`\n🎯 Found ${guesses.length} guesses:`);
            guesses.forEach((guess, index) => {
                console.log(`  ${index + 1}. ${guess}`);
            });
            
            if (guesses.length === 0) {
                console.log('⚠️  No guesses found! This might mean:');
                console.log('   - No game is active');
                console.log('   - No guesses have been made yet');
                console.log('   - Game was completed and moved to history');
            }
        } else {
            console.log('❌ No active game found');
        }
        
    } catch (error) {
        console.error('❌ Error testing get-active-game:', error);
    }
}

// Run the test
testGetActiveGame();

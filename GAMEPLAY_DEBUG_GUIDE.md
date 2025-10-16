# Gameplay Debugging Guide

## 🔍 Comprehensive Logging Added

I've added detailed logging throughout the entire call stack to help debug any issues.

## Console Output to Watch For

### When Starting a Game

```javascript
// 1. User taps "Start New Game"
[GameContext] Starting new game...
[useContract] startNewGame called
[useContract] Start game options: {functionName: "start-game", functionArgs: [], ...}
[ContractUtils] callReadOnly: start-game
[Cache MISS] Fetching: start-game:...
[useContract] Game started with txId: 0x123abc...
[useContract] startNewGame result: 0x123abc...
[GameContext] Start game txId: 0x123abc...
[GameContext] Invalidating cache for address
[GameContext] Waiting for transaction confirmation...
// ... 5 second wait ...
[GameContext] Reloading game state...
[GameContext] Checking for active game...
[useContract] checkHasActiveGame called for: SP123...
[ContractUtils] callReadOnly: has-active-game
[Cache MISS] Fetching: has-active-game:...
[ContractUtils] has-active-game raw response: {...}
[ContractUtils] has-active-game converted: {value: true}
[useContract] checkHasActiveGame result: {value: true}
[GameContext] Has active game response: {value: true}
[GameContext] Loading active game data...
[useContract] getActiveGameData called for: SP123...
[ContractUtils] callReadOnly: get-active-game
[Cache MISS] Fetching: get-active-game:...
[ContractUtils] get-active-game raw response: {...}
[ContractUtils] get-active-game converted: {value: {...}}
[useContract] getActiveGameData result: {value: {...}}
[GameContext] Active game data: {...}
[GameContext] Converted game state: {wordIndex: 0, attempts: 0, ...}
```

### When Submitting a Guess

```javascript
// 1. User types "STACK" and presses ENTER
[GameContext] Submitting guess: STACK
[useContract] makeGuess called with: STACK
[useContract] Submit guess options: {functionName: "submit-guess", functionArgs: [...]}
[useContract] Guess submitted with txId: 0x456def...
[useContract] makeGuess result txId: 0x456def...
[GameContext] Guess transaction ID: 0x456def...
[GameContext] Invalidating cache after guess
[GameContext] Waiting for transaction confirmation...
// ... 5 second wait ...
[GameContext] Reloading game state after guess...
[GameContext] Checking for active game...
// ... (same as above) ...
```

## 🐛 Common Issues & Solutions

### Issue 1: "No active game found" Loop

**Symptom:**

```
[GameContext] No active game found
[GameContext] No active game found
[GameContext] No active game found
```

**Cause:** Transaction not confirmed yet or failed

**Solution:**

-   Wait longer (increase timeout to 7-10 seconds)
-   Check transaction on explorer: https://explorer.stacks.co/txid/YOUR_TX_ID?chain=testnet
-   Verify you have enough STX for gas

### Issue 2: "Error loading active game"

**Symptom:**

```
[GameContext] Error loading active game: SerializationError
```

**Cause:** Contract response format doesn't match expected structure

**Solution:**

-   Check contract is deployed correctly
-   Verify CONTRACT_ADDRESS in config
-   Check network (testnet vs mainnet)

### Issue 3: Guess Not Submitting

**Symptom:**

```
[GameContext] Submitting guess: STACK
[useContract] makeGuess called with: STACK
// ... nothing else ...
```

**Cause:** Wallet not connected or transaction rejected

**Solution:**

-   Verify wallet is connected
-   Check you have enough STX
-   Make sure you have an active game

### Issue 4: Rate Limit Errors

**Symptom:**

```
[ContractUtils] Error calling has-active-game: rate limit exceeded
```

**Solution:**

-   Cache is working (will use stale data)
-   Wait 60 seconds
-   Reduce auto-refresh frequency

## 📝 Step-by-Step Testing

### Test 1: Start Game

```bash
# Before testing, check console for these steps:

1. Open app → Navigate to Play tab
   Expected: [GameContext] Checking for active game...
   Expected: [GameContext] No active game found

2. Tap "Start New Game"
   Expected: [GameContext] Starting new game...
   Expected: [useContract] startNewGame called
   Expected: Transaction submitted alert
   Expected: txId returned

3. Wait 5 seconds
   Expected: [GameContext] Reloading game state...
   Expected: [GameContext] Has active game response: {value: true}
   Expected: GameScreen loads
```

### Test 2: Submit Guess

```bash
1. In GameScreen, type "STACK"
   Expected: Letters appear in grid

2. Press ENTER
   Expected: [GameContext] Submitting guess: STACK
   Expected: [useContract] makeGuess called with: STACK
   Expected: Transaction submitted alert

3. Wait 5 seconds
   Expected: [GameContext] Reloading game state after guess...
   Expected: Grid updates with guess
```

### Test 3: Complete Game

```bash
1. Submit guesses until win or 6 attempts
   Expected: Each guess follows Test 2 flow

2. On final guess (win or lose)
   Expected: [GameContext] Game status: won (or lost)
   Expected: [Game] Fetched answer from blockchain: XXXXX
   Expected: [Game] Evaluating with known answer: ...
   Expected: Modal appears
   Expected: All tiles show colors
```

## 🔧 Manual Testing Steps

### Prerequisites

1. **Check Wallet:**

    ```typescript
    // In console, run:
    wallet?.accounts[0]?.stxPrivateKey; // Should show private key
    address; // Should show ST... address
    ```

2. **Check Contract Config:**

    ```typescript
    // Verify in lib/contract-config.ts:
    CONTRACT_ADDRESS: "ST264AMXKZA5Y4YVMDPA3CDGFGT7Q885W8R15FK7G"; // Your address
    CONTRACT_NAME: "Word-Rush"; // Your contract name
    ```

3. **Check Word Pool:**
    ```bash
    # In Words tab, check total words > 0
    # If 0, add some words first
    ```

### Test Flow

**Step 1: Verify Wallet**

-   Go to Profile
-   See your address displayed
-   Check STX balance > 0

**Step 2: Add Words (if needed)**

-   Go to Words tab
-   Use Blockchain Theme template
-   Import words
-   Wait for confirmation
-   See total words update

**Step 3: Start Game**

-   Go to Play tab
-   Should see "No Active Game"
-   Tap "Start New Game"
-   Watch console for logs
-   Wait for transaction (5s)
-   Should see GameScreen load

**Step 4: Make Guess**

-   Type 5 letters
-   Press ENTER
-   Watch console
-   See letters appear in grid
-   Wait 5 seconds
-   Grid should update

**Step 5: Complete Game**

-   Keep guessing until win or lose
-   Watch for game complete logs
-   Should see modal
-   Should see word revealed
-   Should see tile colors

## 🚨 Emergency Fixes

### If Nothing Works

**Option 1: Clear Cache**

```typescript
import { apiCache } from "@/lib/api-cache";
apiCache.clearAll();
```

**Option 2: Reset Wallet**

-   Logout
-   Reimport with seed phrase
-   Try again

**Option 3: Check Contract**

-   Verify contract is deployed
-   Check it has words in pool
-   Test functions in Clarinet console

### If Transactions Fail

**Check:**

1. STX balance > 0.001
2. Network connectivity
3. Correct network (testnet)
4. Private key accessible
5. Contract address correct

## 📊 Expected Console Output (Success)

### Full Successful Game Flow

```
// App loads
[GameContext] No address, skipping load
[WalletProvider] Wallet loaded

// Navigate to Play
[GameContext] Checking for active game...
[useContract] checkHasActiveGame called for: SP322...
[Cache MISS] Fetching: has-active-game:...
[ContractUtils] has-active-game converted: {value: false}
[GameContext] No active game found

// Start game
[GameContext] Starting new game...
[useContract] startNewGame called
Transaction broadcast successfully: 0xabc123...
[GameContext] Start game txId: 0xabc123...
[GameContext] Waiting for transaction confirmation...
[GameContext] Reloading game state...
[GameContext] Checking for active game...
[Cache HIT] has-active-game:...  // or MISS if cache cleared
[GameContext] Has active game response: {value: true}
[GameContext] Loading active game data...
[Cache MISS] Fetching: get-active-game:...
[ContractUtils] get-active-game converted: {
  value: {
    game-id: 1,
    word-index: 0,
    attempts: 0,
    won: false,
    guesses: [],
    block-height: 12345
  }
}
[GameContext] Converted game state: {
  wordIndex: 0,
  attempts: 0,
  grid: [[{letter: null, state: "empty"}, ...], ...]
}

// Submit guess
[GameContext] Submitting guess: STONE
[useContract] makeGuess called with: STONE
Transaction broadcast successfully: 0xdef456...
[GameContext] Waiting for transaction confirmation...
[GameContext] Reloading game state after guess...
[GameContext] Active game data: {
  value: {
    attempts: 1,
    guesses: ["STONE"],
    ...
  }
}
[Game] Using filled state for guess: STONE

// Game completes (win or lose)
[Game] Fetching answer from blockchain
[ContractUtils] get-word-at-index converted: {value: "STACK"}
[Game] Fetched answer from blockchain: STACK
[Game] Evaluating with known answer: STONE vs STACK
// Modal appears!
```

## 🎯 What to Share

If you're still having issues, share:

1. **Full console output** from start to error
2. **Transaction ID** if any
3. **Your wallet address**
4. **Contract address** from config
5. **Network** (testnet/mainnet)
6. **Screenshots** of error

## ✅ Success Indicators

You'll know it's working when you see:

✅ Transaction IDs in console  
✅ "Transaction broadcast successfully"  
✅ Game state logging with real data  
✅ Grid updates after each guess  
✅ No continuous errors  
✅ Modals appear on completion

---

## 🚀 Next Steps

1. **Run the app** with console open
2. **Follow the test flow** above
3. **Watch the logs** for any errors
4. **Share console output** if issues persist

The comprehensive logging will show exactly where any issues occur!

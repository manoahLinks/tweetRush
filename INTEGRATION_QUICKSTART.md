# TweetRush - Integration Quick Start Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Update Contract Address

Open `lib/contract-config.ts` and update the contract address:

```typescript
export const CONTRACT_CONFIG = {
    CONTRACT_ADDRESS: "YOUR_DEPLOYED_CONTRACT_ADDRESS", // ← Update this!
    CONTRACT_NAME: "Word-Rush",
    NETWORK: STACKS_TESTNET,
    DEFAULT_FEE: 300,
    POST_CONDITION_MODE: "allow",
};
```

### Step 2: Add Words to the Pool

The contract owner needs to add words before players can start games. You can either:

**Option A: Add words programmatically from the app (as contract owner)**

1. Login with the contract owner wallet
2. Use the admin functions in `useContract`:

```typescript
const { addMultipleWords } = useContract();

// Add a batch of words
const words = ["STACK", "CHAIN", "BLOCK", "TOKEN", "WRITE", "TRUST"];
await addMultipleWords(words);
```

**Option B: Use Clarinet Console**

```bash
clarinet console
>>> (contract-call? .Word-Rush add-word "STACK")
>>> (contract-call? .Word-Rush add-word "CHAIN")
>>> (contract-call? .Word-Rush add-word "BLOCK")
```

### Step 3: Install Dependencies (if needed)

```bash
npm install
# or
pnpm install
```

### Step 4: Run the App

```bash
npm start
# or
npx expo start
```

## 🎮 Testing the Integration

### Test Flow 1: User Registration & First Game

1. **Create Wallet:**

    - Launch app → Onboarding screen
    - Tap "Create New Wallet"
    - Save your seed phrase securely
    - Enter a username
    - Complete registration

2. **Start First Game:**

    - Navigate to "Play" screen
    - Tap "Start New Game"
    - Wait for transaction to confirm (~2-3 seconds)
    - Game screen should load with empty grid

3. **Play Game:**
    - Type a 5-letter word using keyboard
    - Press ENTER to submit
    - Wait for transaction confirmation
    - Tiles should update with results
    - Continue until you win or run out of attempts

### Test Flow 2: Bounty System

1. **Create a Bounty:**

    - Navigate to "Bounties" screen
    - Tap the "+" icon
    - Enter word index (e.g., 0, 1, 2)
    - Enter amount in STX (e.g., 1.0)
    - Tap "Create"
    - Approve transaction

2. **Play a Bounty Game:**
    - Start a game that has a bounty
    - Complete the game successfully
    - Bounty reward is automatically claimed
    - Check your balance increased

### Test Flow 3: View Stats

1. **Check Profile:**
    - Navigate to "Profile" screen
    - View your statistics:
        - Total Games
        - Games Won
        - Current Streak
        - Max Streak
        - Win Rate
        - Average Attempts
    - Tap refresh icon to update stats

## 🔍 Common Issues & Solutions

### Issue: "No words available" error

**Solution:** Add words to the contract pool (see Step 2)

```typescript
await addWord("STACK");
```

### Issue: "Transaction failed" errors

**Solutions:**

-   Check you have enough STX for gas fees
-   Verify contract address is correct
-   Check network connectivity
-   Try again after a few seconds

### Issue: Game state not updating

**Solutions:**

-   Wait 2-3 seconds for blockchain confirmation
-   Manually refresh (pull down or tap refresh button)
-   Check network connection
-   Restart app if issue persists

### Issue: "Wallet not connected"

**Solutions:**

-   Go through onboarding again
-   Check wallet was created properly
-   Verify seed phrase was saved
-   Check WalletContext is properly initialized

### Issue: Can't claim bounty

**Solutions:**

-   Ensure you won the game for that word
-   Check bounty hasn't already been claimed
-   Verify bounty has remaining funds
-   Wait for previous transaction to confirm

## 📱 Screen-by-Screen Integration Status

### ✅ GameScreen

-   Real-time game state from blockchain
-   Submit guesses with on-chain transactions
-   Auto-refresh game state
-   Bounty detection and claiming
-   Win/lose detection

### ✅ BountiesScreen

-   Load all bounties from blockchain
-   Create new bounties
-   View bounty details
-   Real-time updates

### ✅ ProfileScreen

-   Load player stats from blockchain
-   Display username from contract
-   Win rate calculation
-   Manual refresh

### ⚠️ LeaderboardScreen

-   Shows current player stats
-   Full leaderboard requires indexer (future)

### ✅ OnboardingScreen

-   User registration on blockchain
-   Username uniqueness check

## 🎯 Key Features Implemented

### Game Logic

-   [x] Start new game
-   [x] Submit guesses
-   [x] Forfeit game
-   [x] Game completion detection
-   [x] Stats tracking

### Bounty System

-   [x] Create bounties
-   [x] Fund bounties
-   [x] Claim rewards (automatic on win)
-   [x] View bounty pools
-   [x] Track winners

### User Management

-   [x] User registration
-   [x] Username system
-   [x] Stats tracking
-   [x] Profile display

### Wallet Integration

-   [x] Wallet creation
-   [x] Login with seed phrase
-   [x] Transaction signing
-   [x] STX balance display
-   [x] Network status (testnet badge)

## 📊 Contract Functions Available

### Read-Only (No Gas Fees)

```typescript
const {
    getActiveGameData,
    getPlayerStatsData,
    getBountyData,
    getTotalWordsCount,
    checkHasActiveGame,
    getUserData,
} = useContract();
```

### Write (Requires Gas Fees)

```typescript
const {
    startNewGame,
    makeGuess,
    forfeitCurrentGame,
    createBounty,
    claimBountyReward,
    registerUserOnChain,
} = useContract();
```

### Admin Only (Contract Owner)

```typescript
const { addWord, addMultipleWords, removeWordFromPool } = useContract();
```

## 🔐 Security Notes

1. **Testnet Only:** Currently configured for Stacks testnet
2. **Seed Phrases:** Stored in AsyncStorage (use secure storage for production)
3. **Private Keys:** Never logged or exposed
4. **Transaction Fees:** Always show confirmation before transactions
5. **Post Conditions:** Set to "allow" for flexibility (review for production)

## 📈 Performance Tips

1. **Batch Operations:** Use `addMultipleWords` instead of multiple `addWord` calls
2. **Auto-Refresh:** GameContext auto-refreshes every 10 seconds
3. **Loading States:** Always show loading indicators during blockchain calls
4. **Error Handling:** All contract calls have try-catch with user-friendly messages
5. **Caching:** Player stats cached in state to reduce RPC calls

## 🎨 UI/UX Features

-   Loading indicators on all async operations
-   Success/error alerts for user actions
-   Real-time game state updates
-   Pull-to-refresh on lists
-   Disabled states during processing
-   Network status indicators (testnet badge)
-   Transaction confirmation messages

## 🔗 Quick Links

-   [Full Integration Guide](./STACKS_INTEGRATION_COMPLETE.md)
-   [Contract Source](./contract.clar) (if available)
-   [Stacks Explorer](https://explorer.stacks.co/txid/YOUR_TX?chain=testnet)
-   [Testnet Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)

## 💡 Pro Tips

1. **Get Testnet STX:** Use the faucet to get free testnet STX for testing
2. **Monitor Transactions:** Check explorer.stacks.co for transaction status
3. **Clear Data:** Use logout to reset and test fresh user flow
4. **Test Edge Cases:** Try invalid words, max attempts, duplicate usernames
5. **Check Stats:** Stats update after each game completion

## 🐛 Debug Mode

To enable detailed logging, check the console for:

-   `Transaction broadcast successfully:` - Transaction submitted
-   `Contract call failed:` - Transaction errors
-   `Loading player data...` - Data fetching status
-   `Game state updated` - State changes

## ✨ Next Steps

1. ✅ Test all core features
2. ✅ Add more words to the pool
3. ✅ Create some test bounties
4. ✅ Play multiple games to test stats
5. 📋 Consider implementing game history
6. 📋 Set up indexer for full leaderboard
7. 📋 Add more word validation
8. 📋 Implement push notifications

---

**Ready to play!** Start the app and begin testing the blockchain integration. If you encounter any issues, check the common issues section above or refer to the full integration guide.

Happy coding! 🎮⛓️

# 🧪 Quick Test Checklist - Gameplay Integration

## ✅ Pre-Test Setup

### 1. Ensure Contract is Deployed

```bash
# Navigate to contract folder
cd tweetRush_contract

# Check contract compiles
clarinet check

# Deploy to testnet (if not already deployed)
# Update CONTRACT_ADDRESS in tweetRush_frontend/lib/contract-config.ts
```

### 2. Ensure Words are Added

Before testing gameplay, you need words in the pool:

```typescript
// As admin, add some words:
await addWord("HELLO");
await addWord("WORLD");
await addWord("STACKS");
await addWord("GAMES");
await addWord("BLOCK");
```

Or add multiple at once:

```typescript
await addMultipleWords([
    "HELLO",
    "WORLD",
    "STACKS",
    "GAMES",
    "BLOCK",
    "CHAIN",
    "TOKEN",
    "SMART",
    "TRADE",
    "VAULT",
]);
```

### 3. Start the App

```bash
cd tweetRush_frontend
npm start
# or
npx expo start
```

---

## 🎮 Test Scenario 1: Complete Game Flow (Win)

### Step 1: Onboarding ✅

-   [ ] Open app
-   [ ] Complete wallet creation
-   [ ] Register username
-   [ ] Wallet address is displayed

### Step 2: Start Game ✅

-   [ ] Navigate to "Play" tab
-   [ ] See "Start New Game" screen
-   [ ] Click "Start New Game" button
-   [ ] Loading indicator appears
-   [ ] Transaction confirmation shown
-   [ ] Game screen appears with empty grid

**Expected Result**:

-   6 rows of 5 empty tiles
-   On-screen keyboard displayed
-   Word index shown in header (e.g., "Word #3")
-   "6 attempts left" displayed

### Step 3: Submit First Guess ✅

-   [ ] Type "HELLO" using keyboard
-   [ ] Letters appear in first row
-   [ ] Press ENTER
-   [ ] Loading indicator appears
-   [ ] Transaction confirmation shown
-   [ ] Tiles change color (green/yellow/gray)
-   [ ] Keyboard letters update color

**Expected Result**:

-   Tiles show evaluation (green = correct position, yellow = wrong position, gray = not in word)
-   Keyboard letters match tile colors
-   Current input cleared
-   "5 attempts left" shown

### Step 4: Continue Guessing ✅

-   [ ] Submit 2nd guess
-   [ ] Submit 3rd guess
-   [ ] Each guess evaluates correctly
-   [ ] Attempt counter decreases

### Step 5: Win Game ✅

-   [ ] Submit correct word
-   [ ] All tiles turn green
-   [ ] Win modal appears
-   [ ] Correct word displayed
-   [ ] "Continue" button shown

**Expected Result**:

-   "🎉 Victory!" message
-   Word revealed
-   Stats updated
-   If bounty exists, "Claim Reward" button shown

---

## 🎮 Test Scenario 2: Complete Game Flow (Lose)

### Steps:

-   [ ] Start new game
-   [ ] Submit 6 incorrect guesses
-   [ ] After 6th guess, lose modal appears
-   [ ] Correct word is revealed
-   [ ] "Continue" button returns to Play screen

**Expected Result**:

-   "Game Over" message
-   Correct word shown
-   Stats updated with loss
-   Streak resets to 0

---

## 🎮 Test Scenario 3: Forfeit Game

### Steps:

-   [ ] Start new game
-   [ ] Submit 1-2 guesses
-   [ ] Click "Forfeit" button in header
-   [ ] Confirmation modal appears
-   [ ] Click "Forfeit" to confirm
-   [ ] Returns to Play screen

**Expected Result**:

-   Game marked as forfeited in history
-   Stats updated
-   Can start new game immediately

---

## 🎮 Test Scenario 4: Bounty Game

### Setup:

```typescript
// As admin, fund a bounty for word index 2
await createBounty(2, 1000000); // 1 STX in microSTX
```

### Steps:

-   [ ] Start new game
-   [ ] If word #2 is selected, bounty indicator appears
-   [ ] Shows "Bounty Active" with STX amount
-   [ ] Win the game
-   [ ] Win modal shows bounty reward (10% of pool)
-   [ ] Click "Claim Reward"
-   [ ] Transaction confirms
-   [ ] STX balance increases

**Expected Result**:

-   Bounty correctly displayed
-   10% of bounty transferred to wallet
-   Bounty claim recorded on blockchain
-   Cannot claim twice

---

## 🧪 Edge Case Tests

### Test: Already Has Active Game

-   [ ] Start a game
-   [ ] Try to start another game
-   [ ] Error message: "You already have an active game"
-   [ ] Must complete first game before starting new one

### Test: No Words in Pool

-   [ ] Remove all words (or fresh contract)
-   [ ] Try to start game
-   [ ] Error message: "No words available"
-   [ ] Admin must add words first

### Test: Invalid Guess Length

-   [ ] Start game
-   [ ] Type 3 letters
-   [ ] Press ENTER
-   [ ] Alert: "Word must be 5 letters"
-   [ ] Guess not submitted

### Test: Game Already Won

-   [ ] Win a game
-   [ ] Game automatically ends
-   [ ] Cannot submit more guesses
-   [ ] Modal appears immediately

### Test: Max Attempts Reached

-   [ ] Submit 6 incorrect guesses
-   [ ] Cannot submit 7th guess
-   [ ] Game ends after 6th attempt

---

## 🔍 Debugging Checklist

If something doesn't work, check:

### Console Logs

Open browser/expo console and look for:

```
[GameContext] Starting new game...
[GameContext] Start game txId: 0x...
[GameContext] Reloading game state...
[GameContext] Submitting guess: HELLO
[GameContext] Guess transaction ID: 0x...
```

### Common Issues

**Issue**: Game not starting

-   Check wallet has STX for fees (>0.0003 STX)
-   Check contract is deployed
-   Check words exist in pool
-   Check no active game exists

**Issue**: Guess not submitting

-   Check word is exactly 5 letters
-   Check game is still active (not won/lost)
-   Check wallet has STX for fees
-   Check network connection

**Issue**: Tiles not showing colors

-   Check guess was confirmed on blockchain
-   Check game state is reloading
-   Check browser console for errors
-   Wait 5-10 seconds for confirmation

**Issue**: Transaction failed

-   Check Stacks testnet status: https://status.stacks.co
-   Increase fee in contract-config.ts
-   Check wallet has sufficient balance
-   Try again after 1 minute

---

## 📊 Verification Points

After completing all tests, verify:

### Blockchain Data

```typescript
// Check total words
const totalWords = await getTotalWordsCount();
console.log("Total words:", totalWords);

// Check active game
const activeGame = await getActiveGameData(playerAddress);
console.log("Active game:", activeGame);

// Check player stats
const stats = await getPlayerStatsData(playerAddress);
console.log("Player stats:", stats);
```

### Expected Stats After 3 Games (2 wins, 1 loss):

```json
{
    "total-games": 3,
    "games-won": 2,
    "current-streak": 0, // or 1/2 depending on last game
    "max-streak": 2,
    "average-attempts": 4, // example
    "total-attempts": 12
}
```

---

## ✅ Success Criteria

All tests pass if:

-   ✅ Can start new game without errors
-   ✅ Can submit guesses and see results
-   ✅ Tiles show correct colors (green/yellow/gray)
-   ✅ Keyboard updates with letter states
-   ✅ Win modal appears after correct guess
-   ✅ Lose modal appears after 6 attempts
-   ✅ Stats update correctly
-   ✅ Bounties can be claimed
-   ✅ Can forfeit games
-   ✅ Can start multiple games sequentially

---

## 🚀 Ready to Test!

Your gameplay integration is **complete and ready**. Follow this checklist to verify everything works correctly.

**Need help?**

-   Check `GAMEPLAY_INTEGRATION_COMPLETE.md` for detailed documentation
-   Check console logs for debugging
-   Verify contract deployment and word pool

Good luck! 🎮

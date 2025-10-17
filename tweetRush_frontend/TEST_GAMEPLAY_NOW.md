# 🧪 Test Gameplay - Debug Mode Enabled

I've added extensive logging to help us find the issue. Let's debug together!

## Step 1: Open the App with Console

```bash
cd /Users/0t41k1/Documents/tweetRush/tweetRush_frontend
npm start
```

Then press `w` to open in web browser (easier to see console logs).

## Step 2: Open Browser Console

-   Chrome: `Cmd+Option+J` (Mac) or `Ctrl+Shift+J` (Windows)
-   Firefox: `Cmd+Option+K` (Mac) or `Ctrl+Shift+K` (Windows)
-   Safari: `Cmd+Option+C` (Mac)

## Step 3: Complete Onboarding

1. Open the app
2. Complete wallet creation
3. Register with a username
4. You should see the main app

## Step 4: Navigate to Play Tab

Click on the "Play" tab

## Step 5: Check Console for Initial Logs

You should see logs like:

```
[GameContext] Checking for active game...
[GameContext] Has active game response: ...
[GameContext] Loading active game data...
```

**If you DON'T see these logs**, the GameContext isn't loading properly.

## Step 6: Click "Start New Game"

When you click the button, you should see:

```
=== START GAME BUTTON CLICKED ===
isConnected: true
address: ST...
hasActiveGame: false
Starting game...
Calling startGame()...
[GameContext] startGame() called
[GameContext] canPlay: true
[GameContext] hasActiveGame: false
[GameContext] Calling startNewGame()...
[useContract] startNewGame called
```

## What to Look For

### Scenario 1: Button Does Nothing

**Console shows:** Nothing
**Problem:** Click handler not attached or React not rendering
**Fix:** Check if PlayScreen is actually being rendered

### Scenario 2: "NOT CONNECTED"

**Console shows:** `NOT CONNECTED`
**Problem:** Wallet not initialized
**Fix:** Complete onboarding properly, check WalletContext

### Scenario 3: "Cannot play - not connected"

**Console shows:** `[GameContext] Cannot play - not connected`
**Problem:** `canPlay` is false
**Fix:** Check `isConnected` value in WalletContext

### Scenario 4: Transaction Error

**Console shows:** Error messages about transaction
**Possible causes:**

-   Contract not deployed at the address in config
-   No words in the word pool
-   Insufficient STX for fees
-   Network error

### Scenario 5: "No words available"

**Console shows:** Contract error `err-no-words-available`
**Problem:** Word pool is empty
**Fix:** Admin needs to add words first

## Step 7: Check Contract State

Add this to browser console:

```javascript
// Test if contract exists and has words
async function testContract() {
    try {
        const response = await fetch(
            "https://api.testnet.hiro.so/v2/contracts/call-read/ST264AMXKZA5Y4YVMDPA3CDGFGT7Q885W8R15FK7G/wordleRush/get-total-words",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender: "ST264AMXKZA5Y4YVMDPA3CDGFGT7Q885W8R15FK7G",
                    arguments: [],
                }),
            }
        );
        const data = await response.json();
        console.log("Contract response:", data);

        if (data.okay && data.result) {
            console.log("✅ Contract exists!");
            const totalWords = parseInt(
                data.result.replace("(ok u", "").replace(")", "")
            );
            console.log(`Total words in pool: ${totalWords}`);

            if (totalWords === 0) {
                console.error("❌ NO WORDS IN POOL! Admin must add words.");
            } else {
                console.log(`✅ ${totalWords} words available`);
            }
        } else {
            console.error("❌ Contract not found or error:", data);
        }
    } catch (error) {
        console.error("❌ Failed to check contract:", error);
    }
}

testContract();
```

## Step 8: Add Words (If Needed)

If the word pool is empty, you need to add words as admin:

1. Go to Admin tab
2. Use the "Add Words" function
3. Add words like: `HELLO`, `WORLD`, `STACKS`, `BLOCK`, `CHAIN`

Or use the console (if you're the admin):

```javascript
// Note: This requires you to be logged in as the contract owner
// The address in contract-config.ts must match your wallet address
```

## Common Issues & Fixes

### Issue: "Everything is Static"

**Check List:**

1. ✅ Open browser console and look for errors
2. ✅ Click "Start New Game" and watch console
3. ✅ Verify wallet is connected (check address in console)
4. ✅ Test if contract exists (run testContract() above)
5. ✅ Check if words are in pool
6. ✅ Verify you have STX for transaction fees (~0.001 STX)

### Issue: Contract Not Deployed

**Symptoms:**

-   API calls return 404 or "contract not found"
-   Console shows network errors

**Fix:**

1. Deploy the contract from `tweetRush_contract/`
2. Update `CONTRACT_ADDRESS` in `lib/contract-config.ts`
3. Update `CONTRACT_NAME` if different

### Issue: No Words in Pool

**Symptoms:**

-   Transaction returns `err-no-words-available`
-   `get-total-words` returns 0

**Fix:**

1. Ensure you're the contract owner (wallet address matches `contract-owner`)
2. Use Admin screen to add words
3. Or deploy a new contract with words pre-added

### Issue: Wallet Not Connected

**Symptoms:**

-   `isConnected: false` in console
-   No address shown
-   "Wallet Required" alert

**Fix:**

1. Complete onboarding flow
2. Check WalletContext is providing wallet/address
3. Verify mnemonic is stored in AsyncStorage

## Step 9: Share Console Logs

If it's still not working, please share:

1. Full console output when clicking "Start New Game"
2. Any error messages (in red)
3. Result of `testContract()` function

This will help me identify the exact issue!

---

## Quick Sanity Check

Run this in browser console after opening the app:

```javascript
console.log("=== SANITY CHECK ===");
console.log("React loaded:", typeof React !== "undefined");
console.log("Current URL:", window.location.href);
console.log("Local storage:", localStorage);
```

---

Let's find the real issue together! The logs will tell us exactly what's happening (or not happening).

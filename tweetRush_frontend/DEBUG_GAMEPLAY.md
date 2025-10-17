# 🐛 Debug Gameplay Issues

## Issue Reported

User says gameplay is "static" - buttons not working, game not starting.

## Possible Causes

### 1. Contract Not Deployed

-   Contract address: `ST264AMXKZA5Y4YVMDPA3CDGFGT7Q885W8R15FK7G`
-   Contract name: `wordleRush`
-   **Check**: Is this contract actually deployed on testnet?

### 2. No Words in Pool

-   **Check**: Has the admin added words using `add-word` or `add-words`?
-   If word pool is empty, `start-game` will fail with `err-no-words-available`

### 3. Wallet Not Connected

-   **Check**: Is the wallet actually initialized in WalletContext?
-   **Check**: Does the user have a private key?

### 4. Transaction Not Being Signed

-   **Check**: Is `getPrivateKey()` returning a valid key?
-   **Check**: Are transactions being broadcast?

### 5. Silent Errors

-   **Check**: Are errors being swallowed without user feedback?

## How to Debug

### Step 1: Check Console Logs

Open browser/Expo dev tools console and look for:

```
[GameContext] Starting new game...
[useContract] startNewGame called
[ContractUtils] callReadOnly: start-game
```

If you don't see these logs, the button click isn't working.

### Step 2: Add Debug Logs

Add this to PlayScreen.tsx handleStartGame:

```typescript
const handleStartGame = async () => {
    console.log("=== START GAME BUTTON CLICKED ===");
    console.log("isConnected:", isConnected);
    console.log("address:", address);

    if (!isConnected) {
        console.log("NOT CONNECTED - showing alert");
        Alert.alert("Wallet Required", "Please complete onboarding first");
        return;
    }

    console.log("Calling startGame...");
    setIsStarting(true);
    try {
        const success = await startGame();
        console.log("startGame result:", success);
        // ... rest of code
    }
};
```

### Step 3: Check Contract Deployment

Test if contract exists:

```typescript
// Add this to a test file or console:
import { callReadOnly } from "@/lib/contract-utils";

async function testContract() {
    try {
        const totalWords = await callReadOnly("get-total-words", []);
        console.log("Total words in pool:", totalWords);

        if (totalWords.value === 0) {
            console.error("NO WORDS IN POOL - Admin needs to add words!");
        }
    } catch (error) {
        console.error("Contract call failed:", error);
        console.error("Contract may not be deployed!");
    }
}
```

### Step 4: Check Wallet

```typescript
// In WalletContext or test file:
console.log("Wallet:", wallet);
console.log("Address:", address);
console.log("Has private key:", !!getPrivateKey());
```

## Quick Fix Checklist

-   [ ] **Check contract is deployed** - Visit https://explorer.stacks.co/address/ST264AMXKZA5Y4YVMDPA3CDGFGT7Q885W8R15FK7G?chain=testnet
-   [ ] **Add words to pool** - Run `await addMultipleWords(["HELLO", "WORLD", "STACKS"])`
-   [ ] **Check wallet is initialized** - Verify wallet context has address and private key
-   [ ] **Check for errors in console** - Look for red errors
-   [ ] **Test transaction signing** - Try a simple contract call first

## Most Likely Issues

1. **Contract not deployed** - Address in config doesn't have a deployed contract
2. **No words in pool** - Admin hasn't added any words yet
3. **Wallet not properly initialized** - User needs to complete onboarding

---

Let me investigate and fix the actual issues...

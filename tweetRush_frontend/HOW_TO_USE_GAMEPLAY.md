# 🎮 How to Use the Gameplay - Simple Guide

## 🎯 Everything is Ready!

Your **Start Game** and **Submit Guess** integration is **complete**. Here's exactly how to use it:

---

## 🚀 Quick Start (3 Steps)

### 1️⃣ Add Words (Admin Only - Do Once)

Before anyone can play, add words to the pool:

```typescript
// Option 1: Add one word at a time
await addWord("HELLO");
await addWord("WORLD");
await addWord("STACKS");

// Option 2: Add multiple words at once (recommended)
await addMultipleWords([
    "HELLO",
    "WORLD",
    "STACKS",
    "BLOCK",
    "CHAIN",
    "TOKEN",
    "SMART",
    "TRADE",
    "VAULT",
    "GAMES",
]);
```

**Where to do this:**

-   In `AdminScreen.tsx` (if you have admin UI)
-   Or in browser console after connecting wallet
-   Or in a test script

### 2️⃣ Start Your App

```bash
cd tweetRush_frontend
npm start
```

### 3️⃣ Play!

Open the app → Play tab → Start New Game → Type guess → Press ENTER

---

## 📱 User Flow

### Step-by-Step Gameplay

#### 1. Open Play Screen

```
📱 App Tabs
   ├── Home
   ├── Play  ← Click here
   ├── Bounties
   └── Profile
```

#### 2. Start New Game

```
┌─────────────────────────────┐
│     Ready to Play?          │
│                             │
│   No Active Game            │
│                             │
│   🎮 (Game Icon)            │
│                             │
│   [Start New Game] ← Click  │
│                             │
└─────────────────────────────┘
```

**What happens:**

-   Transaction sent to blockchain (takes ~2-5 seconds)
-   Random word is selected
-   Game screen appears

#### 3. Game Screen Appears

```
┌─────────────────────────────┐
│  Word #42    6 attempts left│
│                      Forfeit│
├─────────────────────────────┤
│                             │
│   [_][_][_][_][_]  ← Row 1  │
│   [_][_][_][_][_]  ← Row 2  │
│   [_][_][_][_][_]  ← Row 3  │
│   [_][_][_][_][_]  ← Row 4  │
│   [_][_][_][_][_]  ← Row 5  │
│   [_][_][_][_][_]  ← Row 6  │
│                             │
├─────────────────────────────┤
│  Q W E R T Y U I O P        │
│   A S D F G H J K L         │
│  ENTER Z X C V B N M ⌫      │
└─────────────────────────────┘
```

#### 4. Type Your Guess

```
┌─────────────────────────────┐
│  Word #42    6 attempts left│
│                      Forfeit│
├─────────────────────────────┤
│                             │
│   [H][E][L][L][O]  ← Typed  │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│                             │
└─────────────────────────────┘
```

**Controls:**

-   Tap keyboard letters to type
-   Tap **⌫** to delete
-   Tap **ENTER** to submit (when 5 letters)

#### 5. Submit Guess (Press ENTER)

```
⏳ Sending to blockchain...
⏳ Evaluating guess...
⏳ Updating game...
```

#### 6. See Results

```
┌─────────────────────────────┐
│  Word #42    5 attempts left│
│                      Forfeit│
├─────────────────────────────┤
│                             │
│   [H][E][L][L][O]  ← Colors!│
│    ⬜ ⬜ 🟩 🟩 🟨            │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│   [_][_][_][_][_]           │
│                             │
└─────────────────────────────┘

Keyboard updates too:
H = gray, E = gray, L = green, O = yellow
```

#### 7. Keep Guessing Until...

**Option A: You Win! 🎉**

```
┌─────────────────────────────┐
│      🎉 Victory!            │
│                             │
│  You solved it!             │
│  Word: WORLD                │
│                             │
│  [Continue]                 │
└─────────────────────────────┘
```

**Option B: You Lose 😢**

```
┌─────────────────────────────┐
│      Game Over              │
│                             │
│  Better luck next time!     │
│  The word was: WORLD        │
│                             │
│  [Continue]                 │
└─────────────────────────────┘
```

---

## 🎨 Tile Color Guide

After submitting a guess, each letter gets a color:

### 🟩 Green (Correct)

-   Letter is **correct** and in the **right position**
-   Example: If answer is "WORLD" and you guess "WORLD", all tiles are green

### 🟨 Yellow (Present)

-   Letter is **in the word** but in the **wrong position**
-   Example: If answer is "WORLD" and you guess "HELLO", O is yellow

### ⬜ Gray (Absent)

-   Letter is **not in the word** at all
-   Example: If answer is "WORLD" and you guess "HELLO", H and E are gray

---

## 💡 Example Game

Let's say the answer is **"WORLD"**:

### Attempt 1: "HELLO"

```
H E L L O
⬜⬜🟩🟩🟨

Analysis:
- H: not in word (gray)
- E: not in word (gray)
- L: correct position (green)
- L: correct position (green)
- O: in word, wrong spot (yellow)

Clue: Word has L in positions 3&4, and O somewhere else
```

### Attempt 2: "WORLD"

```
W O R L D
🟩🟩🟩🟩🟩

WIN! All correct! 🎉
```

---

## ⚡ Pro Tips

### 1. Good Starting Words

Use words with common vowels and consonants:

-   STARE
-   CRANE
-   SLATE
-   IRATE
-   AROSE

### 2. Use the Keyboard Colors

After each guess, the keyboard shows which letters are:

-   ✅ Confirmed in word (green)
-   ⚠️ In word but wrong spot (yellow)
-   ❌ Not in word (gray)

### 3. Don't Waste Guesses

If you know a letter is green, keep it in that position!

### 4. Look for Bounties

If a word has a bounty 💰:

-   Win the game
-   Click "Claim Reward" in win modal
-   Get 10% of the bounty pool!

---

## 🔧 What's Happening Behind the Scenes

### When You Click "Start New Game":

```
1. Your wallet signs a transaction
2. Blockchain creates game record:
   - Picks random word from pool
   - Assigns game ID
   - Sets attempts to 0
3. App loads game state
4. Grid appears, ready to play
```

### When You Submit a Guess:

```
1. Your wallet signs a transaction
2. Blockchain evaluates guess:
   - Compares each letter to answer
   - Returns [2,1,0,2,1] format
     (2=correct, 1=present, 0=absent)
3. App updates tiles with colors
4. If won or 6 attempts:
   - Game saved to history
   - Stats updated
   - Bounty claimed (if won)
   - Modal shown
```

---

## ❓ Common Questions

### "Why does it take a few seconds?"

Each action requires a blockchain transaction. The Stacks testnet needs time to process and confirm transactions (typically 2-5 seconds).

### "Can I play multiple games at once?"

No, you can only have one active game at a time. Finish or forfeit your current game before starting a new one.

### "What happens to my stats?"

After each completed game:

-   Total games: +1
-   Games won: +1 (if you won)
-   Current streak: +1 (if won) or reset to 0 (if lost)
-   Max streak: Updated if you beat your record

### "How do bounties work?"

1. Admin funds a bounty for a specific word
2. When you win that word, you get 10% of the remaining bounty
3. Bounty decreases each time someone claims
4. Example: 10 STX → you win → you get 1 STX → 9 STX remains

### "Can I cancel a game?"

Yes! Click the "Forfeit" button in the game header. The game will be marked as a loss in your stats.

---

## 🐛 Troubleshooting

### Issue: "No words available"

**Solution**: Admin needs to add words first. See Step 1 above.

### Issue: Can't start game

**Possible causes:**

-   Already have an active game (complete it first)
-   Wallet not connected (complete onboarding)
-   Insufficient STX for transaction fee (need ~0.0003 STX)

### Issue: Guess not submitting

**Check:**

-   Word is exactly 5 letters
-   You pressed ENTER
-   Game is still active (not already won/lost)
-   Wallet has STX for fees

### Issue: Tiles not showing colors

**Wait:** Transactions take 2-10 seconds. Be patient!
**Check:** Browser console for errors

---

## ✅ Ready to Play!

That's it! The gameplay is fully integrated and working.

### Checklist:

-   [x] Smart contract deployed
-   [x] Words added to pool
-   [x] Frontend connected
-   [x] Wallet created
-   [x] User registered
-   [ ] Start playing! ← You are here

---

## 🎮 Controls Summary

| Action        | How                                 |
| ------------- | ----------------------------------- |
| Start Game    | Click "Start New Game" button       |
| Type Letter   | Click keyboard letter               |
| Delete Letter | Click ⌫ button                      |
| Submit Guess  | Click ENTER button (when 5 letters) |
| Forfeit Game  | Click "Forfeit" in header           |
| Claim Bounty  | Click "Claim Reward" in win modal   |

---

## 🎯 Goal

Guess the 5-letter word in 6 attempts or less!

**Good luck and have fun! 🎮**

---

**Need more details?** Check:

-   `GAMEPLAY_INTEGRATION_COMPLETE.md` - Full technical docs
-   `QUICK_TEST_CHECKLIST.md` - Testing guide
-   `GAMEPLAY_READY_SUMMARY.md` - Complete overview

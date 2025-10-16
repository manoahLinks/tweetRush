# 📱 What's On Screen - TweetRush

## When You First Open the App

```
╔═══════════════════════════════════════╗
║  🎮  Home │ Play │ Bounties │ ... ║  ← Top Tabs
╠═══════════════════════════════════════╣
║                                       ║
║  🎮  Tweetle           🔔            ║  ← Header
║                                       ║
║  ┌─────────────────────────────┐    ║
║  │  Daily Challenge            │    ║  ← Hero Card
║  │                             │    ║
║  │  ▢ ▢ ▢ ▢ ▢                 │    ║  ← Grid Preview
║  │  ▢ ▢ ▢ ▢ ▢                 │    ║
║  │                             │    ║
║  │  [Start Daily Challenge]   │    ║  ← Primary CTA
║  │  [Play Quick Game]          │    ║  ← Secondary CTA
║  └─────────────────────────────┘    ║
║                                       ║
║  Your Stats                          ║
║  ┌────┐ ┌────┐ ┌────┐              ║
║  │ 45 │ │84% │ │ 7  │              ║  ← Stat Cards
║  │Game│ │Win │ │Str │              ║
║  └────┘ └────┘ └────┘              ║
║                                       ║
║  Quick Access                        ║
║  [Play][Bounties][Board][Friends]   ║  ← Shortcuts
║                                       ║
║  Recent Games                        ║
║  ┌───┐ ┌───┐ ┌───┐                 ║  ← Scrollable
║  │✓42│ │✓41│ │✗40│     →          ║
║  └───┘ └───┘ └───┘                 ║
║                                       ║
║  [How to Play]                      ║  ← Footer
║  [Mock: Connect Wallet]             ║
║                                       ║
╚═══════════════════════════════════════╝
```

## Navigation Map

```
┌─────────────────────────────────────┐
│   Top Tabs (Always Visible)        │
├─────┬─────┬─────────┬──────┬───────┤
│Home │Play │Bounties │Leader│Profile│
└─────┴─────┴─────────┴──────┴───────┘
   ↓     ↓       ↓        ↓       ↓
```

### Tab 1: HOME (🏠)

-   Welcome header with avatar
-   Hero card (game status)
-   Quick stats (3 cards)
-   Shortcuts (4 buttons)
-   Recent games (horizontal scroll)
-   How to Play + Wallet

**Actions:**

-   Tap "Start Challenge" → Go to Play tab
-   Tap shortcuts → Go to that tab
-   Tap stats → (Mock: show detail)

### Tab 2: PLAY (🎮)

-   Full Wordle game
-   5×6 letter grid
-   On-screen keyboard
-   Bounty indicator
-   Forfeit button

**Actions:**

-   Type with keyboard
-   Tap "Test Win" → Victory modal
-   Tap "Test Lose" → Game over modal
-   Press keys → See letters fill

### Tab 3: BOUNTIES (💰)

-   Info banner
-   Active bounties list
-   Completed section
-   Create bounty CTA

**Actions:**

-   Tap bounty → Detail modal
-   See progress bars
-   View claim history

### Tab 4: LEADERBOARD (🏆)

-   Top 3 podium
-   Full player list
-   Filter toggle
-   Your rank highlighted

**Actions:**

-   Toggle Wins/Streak filter
-   Scroll through rankings
-   See your position

### Tab 5: PROFILE (👤)

-   User avatar & info
-   6 stat cards grid
-   Game history list
-   Settings buttons

**Actions:**

-   View all stats
-   Browse game history
-   Share profile

## 🎮 Try This Flow

1. **Start the app** → You're on HOME tab
2. **Tap "Start Daily Challenge"** → Auto-switches to PLAY tab
3. **Tap keyboard keys** → See letters fill grid
4. **Tap "Test Win"** → See victory modal with bounty
5. **Tap tabs** → Explore all 5 screens
6. **Tap HOME tab** → Return to dashboard

## 🎨 Visual Hierarchy

```
App
 └─ AppNavigator
     ├─ TopTabs (sticky header)
     │   └─ 5 tab buttons
     └─ Screen (changes based on active tab)
         ├─ HomeScreen
         ├─ PlayScreen (GameScreen)
         ├─ BountiesScreen
         ├─ LeaderboardScreen
         └─ ProfileScreen
```

## 🔄 Tab Switching Behavior

**Smooth Transitions:**

-   Tap tab → Content cross-fades
-   Active tab → Green background
-   Inactive tabs → Gray background
-   Icons change color
-   Tab slides slightly on activation

**No Back Button Needed:**

-   All tabs always visible
-   Just tap to switch
-   No navigation stack

## 🎯 Key Interactions

### On HOME:

-   **Hero Button** → Navigate to Play
-   **Stat Cards** → Tap to see details (mock)
-   **Shortcuts** → Navigate to tabs
-   **Recent Games** → Horizontal scroll
-   **How to Play** → Modal with rules

### On PLAY:

-   **Keyboard** → Type letters
-   **Enter** → Submit word (mock alert)
-   **Delete** → Remove letter
-   **Test Buttons** → Demo win/lose modals
-   **Forfeit** → Confirmation modal

### On BOUNTIES:

-   **Bounty Card** → Detail modal
-   **Add Button** → Create bounty (mock)
-   **Scroll** → View all bounties

### On LEADERBOARD:

-   **Filter Toggle** → Switch Wins/Streak
-   **Scroll** → See all players
-   **Your Entry** → Highlighted green

### On PROFILE:

-   **Stat Cards** → View statistics
-   **History** → Browse past games
-   **Share** → Share profile (mock)

## 💡 Pro Tips

1. **Change Hero State** - Edit HomeScreen line 47 to see different states
2. **Test Game Flow** - Use "Test Win" and "Test Lose" buttons on Play tab
3. **View All Components** - Switch to "Components" tab (bottom) to see component showcase
4. **Hot Reload** - Edit any file and see changes instantly

## 🎨 What Makes It Beautiful

-   ✨ **Smooth animations** on every interaction
-   🎨 **Consistent colors** - Green primary, orange accent
-   🌑 **Dark theme** - Easy on the eyes
-   📱 **Mobile-optimized** - Perfect touch targets
-   ♿ **Accessible** - Screen reader ready

## 🚀 The App is LIVE!

Everything is wired and working. Just run:

```bash
npm start
```

And you'll see your beautiful TweetRush game in action! 🎮✨

---

**Questions?** Check `APP_WIRED_GUIDE.md` for technical details.

**Enjoy your game!** 💚

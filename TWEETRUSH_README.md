# TweetRush - Web3 Wordle Game UI

A beautiful, production-ready UI for a mobile web3 Wordle-style game built with React Native, Expo, and NativeWind.

## 📱 Overview

TweetRush is a daily word puzzle game where players can compete for STX bounties. This repository contains the complete UI implementation - no blockchain integration or backend required to run and preview.

## ✨ Features

-   🎮 **Full Wordle-Style Gameplay UI** - 5x6 grid with animated tile reveals
-   💰 **Bounty System UI** - Visual representation of reward pools
-   📊 **Player Statistics** - Games played, win rate, streaks
-   🏆 **Leaderboard** - Competitive rankings with podium display
-   👤 **User Profiles** - Stats, history, and achievements
-   ⚙️ **Settings & Accessibility** - Dark mode, sounds, haptics
-   🎨 **Modern Design** - Tailwind CSS via NativeWind
-   ♿ **Accessible** - Screen reader support, high contrast

## 🚀 Quick Start

### Prerequisites

-   Node.js 16+
-   npm or yarn
-   Expo CLI
-   iOS Simulator or Android Emulator (or Expo Go app)

### Installation

```bash
cd TweetRush
npm install
```

### Running the App

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on web
npm run web
```

## 📁 Project Structure

```
TweetRush/
├── screens/              # All screen components
│   ├── SplashScreen.tsx
│   ├── HomeScreen.tsx
│   ├── GameScreen.tsx
│   ├── ProfileScreen.tsx
│   ├── BountiesScreen.tsx
│   ├── LeaderboardScreen.tsx
│   └── SettingsScreen.tsx
├── components/
│   ├── game/            # Game-specific components
│   │   ├── Tile.tsx
│   │   ├── Keyboard.tsx
│   │   └── Header.tsx
│   └── ui/              # Reusable UI components
│       ├── StatCard.tsx
│       ├── BountyCard.tsx
│       └── Modal.tsx
├── mocks.ts             # All mock data
├── design.md            # Design system documentation
├── global.css           # Tailwind CSS imports
└── tailwind.config.js   # Tailwind configuration
```

## 🎨 Design System

See `design.md` for complete design documentation including:

-   Color tokens
-   Typography scale
-   Spacing system
-   Component specifications
-   Animation guidelines
-   Accessibility standards

### Key Colors

```
Primary (Brand): #16A349
Accent: #F59E0B
Dark Background: #0B1220
Tile Correct: #16A349
Tile Present: #F59E0B
Tile Absent: #1F2937
```

## 🧩 Components

### Game Components

#### Tile

Letter tile with animated state transitions (empty, filled, correct, present, absent).

```tsx
import Tile from "@/components/game/Tile";

<Tile letter="A" state="correct" reveal={true} index={0} />;
```

#### Keyboard

On-screen QWERTY keyboard with letter state coloring.

```tsx
import Keyboard from "@/components/game/Keyboard";

<Keyboard
    onKeyPress={(key) => handleKey(key)}
    letterStates={letterStates}
    disabled={false}
/>;
```

#### Header

Navigation header with title, subtitle, and optional back button.

```tsx
import Header from "@/components/game/Header";

<Header title="Game" subtitle="Word #42" onBack={() => navigate("Home")} />;
```

### UI Components

#### StatCard

Compact card displaying a statistic with icon.

```tsx
import StatCard from "@/components/ui/StatCard";

<StatCard icon="trophy" value="38" label="Wins" iconColor="#F59E0B" />;
```

#### BountyCard

Card showing bounty information with progress bar.

```tsx
import BountyCard from "@/components/ui/BountyCard";

<BountyCard bounty={bountyData} onPress={() => showDetails(bounty)} />;
```

#### Modal

Reusable modal with animations.

```tsx
import Modal from "@/components/ui/Modal";

<Modal visible={showModal} onClose={() => setShowModal(false)} title="Victory!">
    <Text>You won!</Text>
</Modal>;
```

## 📱 Screens

### 1. Splash Screen

Onboarding with branding and "Get Started" / "Connect Wallet" CTAs.

### 2. Home Screen

-   Current game status
-   Quick stats (games, win %, streak)
-   Featured bounties
-   Quick action buttons

### 3. Game Screen (Core)

-   5x6 letter grid with animated tiles
-   On-screen keyboard
-   Attempts tracker
-   Bounty indicator
-   Win/Lose modals
-   Forfeit option

### 4. Profile Screen

-   User info and avatar
-   Statistics grid (6 stat cards)
-   Game history list
-   Share profile option

### 5. Bounties Screen

-   Active bounties list
-   Completed bounties
-   Bounty detail modal
-   Create bounty CTA

### 6. Leaderboard Screen

-   Top 3 podium display
-   Full player rankings
-   Filter by wins or streak
-   Current user highlight

### 7. Settings Screen

-   Dark mode toggle
-   Sound & haptic settings
-   Notifications
-   Accessibility options
-   How to Play modal
-   About section

## 🔄 Mock Data

All screens use mock data from `mocks.ts`. Replace with real API calls in production.

```tsx
import {
    mockProfile,
    mockBounties,
    mockLeaderboard,
    mockFreshGame,
} from "@/mocks";
```

Available mock datasets:

-   `mockProfile` - User profile
-   `mockGameHistory` - Recent games
-   `mockBounties` - Bounty data
-   `mockLeaderboard` - Rankings
-   `mockFreshGame`, `mockMidGame`, `mockWonGame`, `mockLostGame` - Game states

## 🎬 Animations

Built with `react-native-reanimated` for 60fps performance:

-   **Tile Reveal**: 3D flip animation with color transition
-   **Button Press**: Scale down effect
-   **Modal Entry**: Slide up with fade
-   **Keyboard**: Press animation on each key
-   **Progress Bars**: Smooth width transitions

## ♿ Accessibility

All components include:

-   `accessibilityLabel` for screen readers
-   `accessibilityRole` for semantic meaning
-   High contrast text (WCAG AA compliant)
-   Minimum 44px touch targets
-   Keyboard navigation support

## 🚧 Mock/Placeholder Features

The following are UI-only and not implemented:

-   Wallet connection (button shown, not functional)
-   Bounty claiming (disabled with "Mock" label)
-   Word validation (shows alert, doesn't check dictionary)
-   Game persistence (resets on reload)
-   Backend API calls (all data from `mocks.ts`)

## 🔧 Configuration

### Tailwind Config (`tailwind.config.js`)

Custom theme colors are defined:

```js
colors: {
  primary: '#16A349',
  accent: '#F59E0B',
  darkBg: '#0B1220',
  tileCorrect: '#16A349',
  tilePresent: '#F59E0B',
  tileAbsent: '#1F2937',
}
```

### NativeWind Setup

1. `tailwind.config.js` - Configuration
2. `babel.config.js` - Babel preset
3. `global.css` - Tailwind imports
4. `app/_layout.tsx` - Import global CSS

## 📝 Usage Examples

### Navigate Between Screens

```tsx
import HomeScreen from "@/screens/HomeScreen";
import GameScreen from "@/screens/GameScreen";

function App() {
    const [screen, setScreen] = useState("home");

    return screen === "home" ? (
        <HomeScreen
            onStartGame={() => setScreen("game")}
            onViewBounties={() => setScreen("bounties")}
        />
    ) : (
        <GameScreen onBack={() => setScreen("home")} />
    );
}
```

### Use with Expo Router

```tsx
// app/(tabs)/game.tsx
import GameScreen from "@/screens/GameScreen";
import { router } from "expo-router";

export default function Game() {
    return <GameScreen onBack={() => router.back()} />;
}
```

## 🎯 Next Steps (Production)

To make this production-ready:

1. **Backend Integration**

    - Connect to Starknet blockchain
    - Implement wallet connection (Argent X, Braavos)
    - Add contract interactions for bounties

2. **Data & State**

    - Replace mocks with API calls
    - Add global state management (Zustand/Redux)
    - Implement data persistence

3. **Features**

    - Word validation with dictionary
    - Daily word rotation logic
    - Push notifications
    - Social sharing

4. **Polish**
    - Add loading states
    - Error handling & retry logic
    - Analytics integration
    - Performance optimization

## 🛠 Tech Stack

-   **Framework**: React Native + Expo
-   **Styling**: NativeWind (Tailwind CSS)
-   **Navigation**: Expo Router (ready to integrate)
-   **Animations**: react-native-reanimated
-   **Icons**: @expo/vector-icons (Ionicons)
-   **Language**: TypeScript

## 📄 License

This is a UI-only demo project. Use as needed for your project.

## 🤝 Contributing

This is a complete UI implementation. Feel free to customize components, colors, and layouts to match your needs.

## 📞 Support

For questions about the UI components or design system, refer to `design.md`.

---

**Built with ❤️ for the web3 gaming community**

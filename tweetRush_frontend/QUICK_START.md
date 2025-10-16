# TweetRush - Quick Start Guide

Get up and running with TweetRush UI in 5 minutes.

## 🚀 Installation

```bash
cd TweetRush
npm install
npm start
```

## 📱 Preview Screens

### Option 1: Using Example App

1. Open `screens/ExampleApp.tsx` - this shows all screens integrated
2. Import it in your main app file:

```tsx
import ExampleApp from "./screens/ExampleApp";

export default function App() {
    return <ExampleApp />;
}
```

3. Run `npm start` and navigate through all screens

### Option 2: Individual Screen Preview

Preview any screen individually:

```tsx
import { GameScreen } from "./screens";

export default function App() {
    return <GameScreen onBack={() => console.log("back")} />;
}
```

## 🎮 Available Screens

1. **SplashScreen** - Onboarding/welcome
2. **HomeScreen** - Dashboard with stats and game status
3. **GameScreen** - Core Wordle gameplay
4. **ProfileScreen** - User stats and history
5. **BountiesScreen** - Reward pools listing
6. **LeaderboardScreen** - Top players
7. **SettingsScreen** - Preferences and help

## 🧩 Component Usage

### Import Components

```tsx
// Individual imports
import Tile from "@/components/game/Tile";
import Keyboard from "@/components/game/Keyboard";

// Or use barrel imports
import { Tile, Keyboard, Header } from "@/components/game";
import { StatCard, BountyCard, Modal } from "@/components/ui";
```

### Use Mock Data

```tsx
import { mockProfile, mockBounties, mockMidGame } from "@/mocks";

// Use in your components
<ProfileScreen profile={mockProfile} />;
```

## 🎨 Customize Design

### Update Colors

Edit `tailwind.config.js`:

```js
colors: {
  primary: '#YOUR_COLOR',
  accent: '#YOUR_COLOR',
  // ... more colors
}
```

### Modify Components

All components are standalone and fully editable:

-   `/components/game/` - Game-specific components
-   `/components/ui/` - Reusable UI elements
-   `/screens/` - Full screen layouts

## 🔧 Common Tasks

### Change Game Grid Size

Edit `mocks.ts` to change grid dimensions:

```ts
grid: Array(6)
    .fill(null)
    .map(() =>
        Array(5)
            .fill(null)
            .map(() => ({ letter: null, state: "empty" }))
    );
// Change 6 (rows) and 5 (columns) as needed
```

### Add New Stat Card

```tsx
<StatCard icon="star" value="25" label="New Stat" iconColor="#FF0000" />
```

### Create Custom Modal

```tsx
const [showModal, setShowModal] = useState(false);

<Modal visible={showModal} onClose={() => setShowModal(false)} title="My Modal">
    <Text className="text-white">Custom content</Text>
</Modal>;
```

## 📚 Navigation Integration

### With Expo Router (Recommended)

```bash
# Create route files in app/
# app/game.tsx

import { GameScreen } from '@/screens';
import { router } from 'expo-router';

export default function Game() {
  return <GameScreen onBack={() => router.back()} />;
}
```

### With React Navigation

```tsx
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GameScreen, HomeScreen } from "@/screens";

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} />
                <Stack.Screen name="Game" component={GameScreen} />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
```

## 🎯 Next Steps

1. ✅ Preview all screens using `ExampleApp.tsx`
2. ✅ Customize colors in `tailwind.config.js`
3. ✅ Modify components to match your design
4. ⬜ Integrate with navigation (Expo Router or React Navigation)
5. ⬜ Replace mock data with real API calls
6. ⬜ Add wallet connection logic
7. ⬜ Implement word validation
8. ⬜ Connect to Starknet blockchain

## 🐛 Troubleshooting

### Styles not showing?

-   Make sure `global.css` is imported in `app/_layout.tsx`
-   Clear cache: `npm start -- --clear`

### TypeScript errors on @/ imports?

-   Paths are configured in `tsconfig.json`
-   Restart your editor/TypeScript server

### Components not found?

-   Check import paths use `@/` prefix
-   Use absolute paths: `@/components/game/Tile`

### Animations laggy?

-   Make sure you have `react-native-reanimated` installed
-   Run on a real device (simulators can be slow)

## 📖 Resources

-   Full Design System: `design.md`
-   Complete README: `TWEETRUSH_README.md`
-   Mock Data Reference: `mocks.ts`
-   Tailwind Config: `tailwind.config.js`

## 💡 Tips

1. **Start Small**: Preview one screen at a time
2. **Use Mocks**: All data is in `mocks.ts` - easy to modify
3. **Hot Reload**: Changes appear instantly in Expo
4. **Accessibility**: All components have screen reader support
5. **Responsive**: Designed for mobile-first

## 🎨 Design Tokens Quick Reference

```css
/* Colors */
bg-primary       → #16A349 (green)
bg-accent        → #F59E0B (orange)
bg-darkBg        → #0B1220 (dark blue)
bg-gray-800      → #1F2937 (card background)

/* Text */
text-white       → #FFFFFF
text-gray-400    → #9CA3AF (secondary text)

/* Spacing */
p-4              → 16px padding
mb-3             → 12px margin bottom

/* Radius */
rounded-2xl      → 16px border radius
rounded-md       → 6px border radius

/* Sizes */
w-14 h-14        → 56x56px (tile size)
```

## ✅ Checklist

-   [ ] Installed dependencies
-   [ ] Ran `npm start`
-   [ ] Previewed ExampleApp
-   [ ] Customized colors
-   [ ] Tested on device/simulator
-   [ ] Read design.md
-   [ ] Integrated navigation

---

**Ready to build? Start with `npm start` and open ExampleApp!** 🚀

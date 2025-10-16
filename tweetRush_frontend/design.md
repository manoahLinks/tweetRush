# TweetRush Design System

A comprehensive design guide for the TweetRush mobile web3 Wordle-style game.

## Color Tokens

### Primary Colors

```
Primary (Brand/Success): #16A349
Accent (Highlights): #F59E0B
```

### Background Colors

```
Dark Background: #0B1220
Light Background: #F8FAFC
Card Background (Dark): #1F2937
Card Background (Light Gray): #374151
```

### Tile States

```
Correct Position: #16A349 (green)
Present (Wrong Position): #F59E0B (amber/orange)
Absent (Not in Word): #1F2937 (dark gray)
Empty: transparent with border
Filled (Pre-submit): #374151 (gray)
```

### Semantic Colors

```
Error/Danger: #EF4444
Warning: #F59E0B
Info: #3B82F6
Success: #16A349

Text Primary: #FFFFFF
Text Secondary: #9CA3AF
Text Tertiary: #6B7280
Text Disabled: #4B5563
```

## Typography

### Font Families

```
UI Text: System Default (SF Pro / Roboto)
Monospace (Tiles): System Monospace
Display/Headers: System Bold
```

### Font Sizes

```
text-xs: 12px
text-sm: 14px
text-base: 16px
text-lg: 18px
text-xl: 20px
text-2xl: 24px
text-3xl: 30px
text-4xl: 36px
text-5xl: 48px
```

### Font Weights

```
Regular: 400
Medium: 500
Semibold: 600
Bold: 700
```

## Spacing Scale

Based on Tailwind's default scale (4px increments):

```
0.5: 2px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
8: 32px
10: 40px
12: 48px
16: 64px
20: 80px
```

## Border Radius

```
rounded-sm: 2px
rounded: 4px
rounded-md: 6px
rounded-lg: 8px
rounded-xl: 12px
rounded-2xl: 16px
rounded-3xl: 24px
rounded-full: 9999px
```

### Component-Specific Radius

```
Buttons: rounded-2xl (16px)
Cards: rounded-2xl (16px)
Tiles: rounded-md (6px)
Modals: rounded-2xl (16px)
Chips/Badges: rounded-full
Input Fields: rounded-xl (12px)
```

## Shadows

### Elevation Levels

```
Small (Cards): shadow-sm
Medium (Modals): shadow-md
Large (Headers): shadow-lg
```

## Component Specifications

### Tile Component

```
Size: 56x56px (w-14 h-14)
Border: 2px when empty/filled
Corner Radius: rounded-md (6px)
Font: Monospace, Bold, 30px
Animation: 3D flip (0° → 90° → 180°) over 500ms
States: empty, filled, correct, present, absent
```

### Keyboard Keys

```
Size: 32x48px (w-8 h-12) for letters
Size: auto x 48px for ENTER/DELETE
Corner Radius: rounded-md (6px)
Font: Bold, 18px (letters), 12px (special keys)
States: default (gray-500), correct, present, absent
Press Animation: scale(0.96)
```

### Buttons

#### Primary Button

```
Background: #16A349
Text: White, Bold, 18px
Padding: py-4 px-6
Corner Radius: rounded-2xl
Active State: opacity-90
Min Height: 44px (touch target)
```

#### Secondary Button

```
Background: Transparent or gray-800
Border: 2px solid #16A349
Text: #16A349, Bold, 18px
Padding: py-4 px-6
Corner Radius: rounded-2xl
Active State: opacity-90
```

#### Danger Button

```
Background: #EF4444
Text: White, Bold
Other: Same as primary
```

### Cards

```
Background: #1F2937 (gray-800)
Padding: 16px (p-4)
Corner Radius: rounded-2xl
Border: None (or 2px for highlighted)
Shadow: Optional subtle shadow
```

### Stat Card

```
Background: gray-800
Padding: 16px
Corner Radius: rounded-2xl
Layout: Vertical (icon, value, label)
Icon Size: 24px
Value Font: Bold, 30px
Label Font: 12px, gray-400
Min Width: 100px
```

### Bounty Card

```
Background: gray-800
Padding: 16px
Corner Radius: rounded-2xl
Progress Bar Height: 8px
Badge: rounded-full, px-3 py-1
```

### Modal

```
Background: gray-900 (#111827)
Padding: 24px (p-6)
Corner Radius: rounded-2xl
Max Width: 400px
Backdrop: rgba(0,0,0,0.7)
Animation: Fade + slide up
```

### Header

```
Background: darkBg or gray-900
Height: auto (min 60px)
Padding: px-4 py-3
Border Bottom: 1px solid gray-800
Title: Bold, 20px
Subtitle: 14px, gray-400
Icons: 24px
```

## Animations & Transitions

### Tile Reveal Animation

```
Duration: 500ms total
Easing: ease-in-out
Sequence:
  1. Rotate to 90deg (250ms)
  2. Change color on back face
  3. Rotate to 180deg (250ms)
  4. Scale to 1.05 (100ms)
  5. Scale back to 1 (100ms)
Stagger: 100ms per tile
```

### Button Press

```
Scale: 0.96
Duration: 50ms (in), 100ms (out)
Easing: ease-out
```

### Modal Entry

```
Backdrop: Fade in opacity (200ms)
Content: Slide up 50px + fade (200ms)
Spring: damping 15, stiffness 150
```

### Page Transitions

```
Type: Slide (horizontal)
Duration: 300ms
Easing: ease-in-out
```

## Layout Guidelines

### Screen Padding

```
Horizontal: px-4 (16px)
Vertical: py-4 (16px)
Safe Area: Respect device safe areas
```

### Touch Targets

```
Minimum Size: 44x44px
Recommended: 48x48px
Spacing: 8px minimum between targets
```

### Grid System

```
Columns: Flexible based on content
Gap: 8px, 12px, or 16px
Container Max Width: Full width on mobile
```

## Accessibility

### Color Contrast

```
Text on Dark BG: White (#FFFFFF) - WCAG AAA
Text on Primary: White (#FFFFFF) - WCAG AA
Secondary Text: #9CA3AF - WCAG AA
```

### Screen Reader Labels

All interactive elements must have:

-   `accessibilityLabel`
-   `accessibilityRole`
-   `accessibilityHint` (when needed)

### Semantic Markup

```
Buttons: accessibilityRole="button"
Text: accessibilityRole="text"
Images: accessibilityRole="image" + label
```

## Icon System

Using `@expo/vector-icons` (Ionicons)

### Common Icons

```
Game: game-controller
Trophy: trophy
Flame (Streak): flame
Stats: stats-chart
Profile: person
Settings: settings
Close: close
Back: arrow-back
Forward: arrow-forward, chevron-forward
Info: information-circle
Help: help-circle
Add: add-circle
Wallet: wallet
People: people
```

### Icon Sizes

```
Small: 16px
Medium: 20px
Default: 24px
Large: 28px
Extra Large: 48px
```

## State Patterns

### Loading States

```
Show skeleton screens
Use subtle shimmer animation
Maintain layout structure
```

### Empty States

```
Icon (48px, gray)
Message (gray-400)
Optional CTA button
Centered layout
```

### Error States

```
Icon (error/alert)
Error message (clear, actionable)
Retry button
Red accent (#EF4444)
```

### Success States

```
Checkmark icon
Success message
Primary color accent
Auto-dismiss or Continue CTA
```

## Micro-interactions

### Letter Input

```
- Key press: Scale animation
- Letter appears: Fade + scale in
- Invalid word: Shake animation
```

### Win Celebration

```
- Confetti (Lottie animation placeholder)
- Modal slide up with bounce
- Success icon pulse
```

### Bounty Progress

```
- Smooth width animation
- Color transition
- Number count-up animation
```

## Dark Mode (Default)

All designs use dark mode by default:

```
Background: #0B1220
Cards: #1F2937, #374151
Text: White, grays
Borders: Gray-800
```

Light mode support can be added using theme context.

## Tailwind Class Mapping

### Most Used Patterns

#### Card

```jsx
className = "bg-gray-800 rounded-2xl p-4 mb-3";
```

#### Primary Button

```jsx
className = "bg-primary rounded-2xl py-4 px-6 items-center";
```

#### Tile

```jsx
className = "w-14 h-14 bg-tileCorrect rounded-md items-center justify-center";
```

#### Header Text

```jsx
className = "text-white text-2xl font-bold";
```

#### Secondary Text

```jsx
className = "text-gray-400 text-sm";
```

#### Container

```jsx
className = "flex-1 bg-darkBg px-4";
```

## Responsive Considerations

### Mobile-First

-   Design for iPhone SE (375px) minimum
-   Touch targets: 44px minimum
-   Readable text: 16px minimum for body
-   Comfortable spacing for thumbs

### Landscape

-   Adjust grid layouts
-   Reduce vertical padding
-   Optimize for wider screens

## Performance

### Animation Performance

-   Use `react-native-reanimated` for smooth 60fps
-   Avoid animating layout properties
-   Use `transform` and `opacity` for best performance

### Image Optimization

-   Use WebP for images
-   Lazy load off-screen content
-   Compress assets

## File Organization

```
/components
  /game
    - Tile.tsx
    - Keyboard.tsx
    - Header.tsx
  /ui
    - StatCard.tsx
    - BountyCard.tsx
    - Modal.tsx
    - IconSymbol.tsx (existing)

/screens
  - SplashScreen.tsx
  - HomeScreen.tsx
  - GameScreen.tsx
  - ProfileScreen.tsx
  - BountiesScreen.tsx
  - LeaderboardScreen.tsx
  - SettingsScreen.tsx

/mocks.ts (all mock data)
/design.md (this file)
```

## Mock Data Usage

All screens use data from `/mocks.ts`:

-   `mockProfile` - User profile data
-   `mockGameHistory` - Recent games
-   `mockBounties` - Bounty information
-   `mockLeaderboard` - Top players
-   `mockFreshGame`, `mockMidGame`, `mockWonGame`, `mockLostGame` - Game states
-   `KEYBOARD_ROWS` - Keyboard layout

## Production Checklist

Before going to production:

1. Remove all "Mock" UI labels
2. Implement real wallet connection
3. Replace mock data with API calls
4. Add loading states
5. Implement error handling
6. Add analytics
7. Test on multiple devices
8. Accessibility audit
9. Performance optimization
10. Security review

---

**Design Version:** 1.0.0  
**Last Updated:** October 2025  
**Framework:** React Native + Expo + NativeWind

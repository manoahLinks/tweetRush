/**
 * PlayScreen.tsx
 *
 * Full game screen with 5x6 grid and keyboard
 * Mock data: Uses mockMidGame from @/mocks
 */

import React from "react";
import GameScreen from "./GameScreen";
import { mockMidGame } from "@/mocks";

const PlayScreen: React.FC = () => {
    return <GameScreen gameState={mockMidGame} onBack={() => {}} />;
};

export default PlayScreen;

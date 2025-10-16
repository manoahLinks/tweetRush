// Mock data for TweetRush UI

export type TileState = "empty" | "filled" | "correct" | "present" | "absent";
export type LetterState = "default" | "correct" | "present" | "absent";

export interface GameTile {
    letter: string | null;
    state: TileState;
}

export interface GameState {
    wordIndex: number;
    targetWord: string;
    attempts: number;
    maxAttempts: number;
    currentAttempt: number;
    grid: GameTile[][];
    gameStatus: "active" | "won" | "lost";
    hasBounty: boolean;
    bountyAmount?: number;
}

export interface PlayerProfile {
    username: string;
    address: string;
    avatar: string;
    registrationDate: string;
    totalGames: number;
    gamesWon: number;
    currentStreak: number;
    maxStreak: number;
    averageAttempts: number;
}

export interface GameHistory {
    id: string;
    date: string;
    wordIndex: number;
    attempts: number;
    won: boolean;
    word: string;
}

export interface Bounty {
    id: string;
    wordIndex: number;
    totalBounty: number;
    remainingBounty: number;
    isActive: boolean;
    createdBy: string;
    winnerCount: number;
    createdAt: string;
    claimHistory: BountyClaim[];
}

export interface BountyClaim {
    id: string;
    username: string;
    amount: number;
    attempts: number;
    claimedAt: string;
}

export interface LeaderboardEntry {
    rank: number;
    username: string;
    address: string;
    avatar: string;
    gamesWon: number;
    currentStreak: number;
    totalGames: number;
    isCurrentUser?: boolean;
}

// Mock Game States
export const mockFreshGame: GameState = {
    wordIndex: 42,
    targetWord: "REACT",
    attempts: 0,
    maxAttempts: 6,
    currentAttempt: 0,
    grid: Array(6)
        .fill(null)
        .map(() =>
            Array(5)
                .fill(null)
                .map(() => ({ letter: null, state: "empty" as TileState }))
        ),
    gameStatus: "active",
    hasBounty: true,
    bountyAmount: 150,
};

export const mockMidGame: GameState = {
    wordIndex: 42,
    targetWord: "REACT",
    attempts: 2,
    maxAttempts: 6,
    currentAttempt: 2,
    grid: [
        [
            { letter: "S", state: "absent" },
            { letter: "T", state: "present" },
            { letter: "A", state: "present" },
            { letter: "R", state: "correct" },
            { letter: "T", state: "correct" },
        ],
        [
            { letter: "C", state: "present" },
            { letter: "O", state: "absent" },
            { letter: "A", state: "present" },
            { letter: "S", state: "absent" },
            { letter: "T", state: "correct" },
        ],
        ...Array(4)
            .fill(null)
            .map(() =>
                Array(5)
                    .fill(null)
                    .map(() => ({ letter: null, state: "empty" as TileState }))
            ),
    ],
    gameStatus: "active",
    hasBounty: true,
    bountyAmount: 150,
};

export const mockWonGame: GameState = {
    wordIndex: 41,
    targetWord: "STACKS",
    attempts: 4,
    maxAttempts: 6,
    currentAttempt: 4,
    grid: [
        [
            { letter: "S", state: "correct" },
            { letter: "T", state: "correct" },
            { letter: "O", state: "absent" },
            { letter: "N", state: "absent" },
            { letter: "E", state: "absent" },
        ],
        [
            { letter: "S", state: "correct" },
            { letter: "T", state: "correct" },
            { letter: "A", state: "correct" },
            { letter: "R", state: "absent" },
            { letter: "E", state: "absent" },
        ],
        [
            { letter: "S", state: "correct" },
            { letter: "T", state: "correct" },
            { letter: "A", state: "correct" },
            { letter: "C", state: "correct" },
            { letter: "K", state: "correct" },
        ],
        [
            { letter: "S", state: "correct" },
            { letter: "T", state: "correct" },
            { letter: "A", state: "correct" },
            { letter: "C", state: "correct" },
            { letter: "K", state: "correct" },
        ],
        ...Array(2)
            .fill(null)
            .map(() =>
                Array(5)
                    .fill(null)
                    .map(() => ({ letter: null, state: "empty" as TileState }))
            ),
    ],
    gameStatus: "won",
    hasBounty: false,
};

export const mockLostGame: GameState = {
    wordIndex: 40,
    targetWord: "BLOCK",
    attempts: 6,
    maxAttempts: 6,
    currentAttempt: 6,
    grid: [
        [
            { letter: "B", state: "correct" },
            { letter: "R", state: "absent" },
            { letter: "I", state: "absent" },
            { letter: "C", state: "present" },
            { letter: "K", state: "correct" },
        ],
        [
            { letter: "B", state: "correct" },
            { letter: "L", state: "correct" },
            { letter: "A", state: "absent" },
            { letter: "C", state: "present" },
            { letter: "K", state: "correct" },
        ],
        [
            { letter: "B", state: "correct" },
            { letter: "L", state: "correct" },
            { letter: "U", state: "absent" },
            { letter: "C", state: "present" },
            { letter: "K", state: "correct" },
        ],
        [
            { letter: "B", state: "correct" },
            { letter: "L", state: "correct" },
            { letter: "E", state: "absent" },
            { letter: "C", state: "present" },
            { letter: "K", state: "correct" },
        ],
        [
            { letter: "B", state: "correct" },
            { letter: "L", state: "correct" },
            { letter: "O", state: "correct" },
            { letter: "N", state: "absent" },
            { letter: "K", state: "correct" },
        ],
        [
            { letter: "B", state: "correct" },
            { letter: "L", state: "correct" },
            { letter: "O", state: "correct" },
            { letter: "W", state: "absent" },
            { letter: "K", state: "correct" },
        ],
    ],
    gameStatus: "lost",
    hasBounty: true,
    bountyAmount: 200,
};

// Mock Profile
export const mockProfile: PlayerProfile = {
    username: "CryptoWordler",
    address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
    avatar: "🎮",
    registrationDate: "2024-01-15",
    totalGames: 45,
    gamesWon: 38,
    currentStreak: 7,
    maxStreak: 15,
    averageAttempts: 3.8,
};

// Mock Game History
export const mockGameHistory: GameHistory[] = [
    {
        id: "1",
        date: "2024-10-13",
        wordIndex: 42,
        attempts: 4,
        won: true,
        word: "REACT",
    },
    {
        id: "2",
        date: "2024-10-12",
        wordIndex: 41,
        attempts: 3,
        won: true,
        word: "STACK",
    },
    {
        id: "3",
        date: "2024-10-11",
        wordIndex: 40,
        attempts: 6,
        won: false,
        word: "BLOCK",
    },
    {
        id: "4",
        date: "2024-10-10",
        wordIndex: 39,
        attempts: 5,
        won: true,
        word: "CHAIN",
    },
    {
        id: "5",
        date: "2024-10-09",
        wordIndex: 38,
        attempts: 2,
        won: true,
        word: "TOKEN",
    },
];

// Mock Bounties
export const mockBounties: Bounty[] = [
    {
        id: "1",
        wordIndex: 42,
        totalBounty: 500,
        remainingBounty: 150,
        isActive: true,
        createdBy: "BountyHunter",
        winnerCount: 12,
        createdAt: "2024-10-10",
        claimHistory: [
            {
                id: "c1",
                username: "FastSolver",
                amount: 35,
                attempts: 2,
                claimedAt: "2024-10-12T10:30:00Z",
            },
            {
                id: "c2",
                username: "WordMaster",
                amount: 35,
                attempts: 3,
                claimedAt: "2024-10-12T14:20:00Z",
            },
        ],
    },
    {
        id: "2",
        wordIndex: 41,
        totalBounty: 300,
        remainingBounty: 80,
        isActive: true,
        createdBy: "Web3Gamer",
        winnerCount: 8,
        createdAt: "2024-10-09",
        claimHistory: [
            {
                id: "c3",
                username: "QuickWit",
                amount: 22,
                attempts: 2,
                claimedAt: "2024-10-11T09:15:00Z",
            },
        ],
    },
    {
        id: "3",
        wordIndex: 39,
        totalBounty: 1000,
        remainingBounty: 0,
        isActive: false,
        createdBy: "MegaBounty",
        winnerCount: 25,
        createdAt: "2024-10-05",
        claimHistory: [],
    },
];

// Mock Leaderboard
export const mockLeaderboard: LeaderboardEntry[] = [
    {
        rank: 1,
        username: "WordNinja",
        address: "SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE",
        avatar: "🥷",
        gamesWon: 156,
        currentStreak: 23,
        totalGames: 180,
    },
    {
        rank: 2,
        username: "BlockMaster",
        address: "SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR",
        avatar: "🎯",
        gamesWon: 142,
        currentStreak: 18,
        totalGames: 165,
    },
    {
        rank: 3,
        username: "ChainGenius",
        address: "SP1P72Z3704VMT3DMHPP2CB8TGQWGDBHD3RPR9GZS",
        avatar: "🧠",
        gamesWon: 138,
        currentStreak: 12,
        totalGames: 155,
    },
    {
        rank: 4,
        username: "CryptoWordler",
        address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
        avatar: "🎮",
        gamesWon: 38,
        currentStreak: 7,
        totalGames: 45,
        isCurrentUser: true,
    },
    {
        rank: 5,
        username: "StacksQueen",
        address: "SP3QSAJQ4EA8WXEDSRRKMZZ29NH91VZ6C5X88FGZQ",
        avatar: "👑",
        gamesWon: 125,
        currentStreak: 15,
        totalGames: 148,
    },
    {
        rank: 6,
        username: "DecentralDave",
        address: "SP2R93XZE0NE29Q8B6ZXR8TEB8G0E9TBV26DN5YJX",
        avatar: "🚀",
        gamesWon: 118,
        currentStreak: 9,
        totalGames: 142,
    },
];

// Keyboard layout
export const KEYBOARD_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

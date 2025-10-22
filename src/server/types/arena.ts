export interface GamePlayer {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameEvent {
  id: string;
  eventName: string;
  isFinal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GamePackage {
  id: string;
  name: string;
  image: string;
  stats: Array<{
    name: string;
    currentValue: number;
    maxValue: number;
    description: string;
  }>;
  players: string[];
  type: string;
  cost: number;
  unlockAtPoints: number;
  metadata: {
    id: string;
    type: string;
    quantity: string;
  };
}

export interface EvaGameDetails {
  _id: string;
  gameId: string;
  vorldAppId: string;
  appName: string;
  gameDeveloperId: string;
  arcadeGameId: string;
  isActive: boolean;
  numberOfCycles: number;
  cycleTime: number;
  waitingTime: number;
  players: GamePlayer[];
  events: GameEvent[];
  packages: GamePackage[];
  createdAt: string;
  updatedAt: string;
}

export interface GameState {
  gameId: string;
  expiresAt: string;
  status: "pending" | "active" | "completed" | "cancelled";
  websocketUrl: string;
  evaGameDetails: EvaGameDetails;
  arenaActive: boolean;
  countdownStarted: boolean;
}

export interface BoostData {
  playerId: string;
  playerName: string;
  currentCyclePoints: number;
  totalPoints: number;
  arenaCoinsSpent: number;
  newArenaCoinsBalance: number;
}

export interface ItemDrop {
  itemId: string;
  itemName: string;
  targetPlayer: string;
  cost: number;
}

export interface ArenaWebSocketEvent {
  type: string;
  gameId: string;
  timestamp: string;
  [key: string]: any;
}

export interface InitializeGameRequest {
  streamUrl: string;
}

export interface BoostPlayerRequest {
  amount: number;
  username: string;
}

export interface UpdateStreamUrlRequest {
  streamUrl: string;
  oldStreamUrl: string;
}

export interface DropItemRequest {
  itemId: string;
  targetPlayer: string;
}

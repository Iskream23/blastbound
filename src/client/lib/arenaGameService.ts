import { io, Socket } from "socket.io-client";
import axios from "axios";

const SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";
const ARENA_API_BASE = `${SERVER_URL}/api/arena`;

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

export class ArenaGameService {
  private socket: Socket | null = null;
  private gameState: GameState | null = null;
  private userToken: string = "";

  // Initialize game with stream URL
  async initializeGame(
    streamUrl: string,
    userToken: string,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      this.userToken = userToken;

      const response = await axios.post<{
        success: boolean;
        data: GameState;
        message: string;
      }>(
        `${ARENA_API_BASE}/init`,
        { streamUrl },
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.success) {
        this.gameState = response.data.data;

        // Connect to WebSocket
        if (this.gameState?.websocketUrl) {
          await this.connectWebSocket();
        }

        return {
          success: true,
          data: this.gameState,
        };
      } else {
        return {
          success: false,
          error: "Failed to initialize game",
        };
      }
    } catch (error: any) {
      console.error("Failed to initialize game:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to initialize game",
      };
    }
  }

  // Connect to WebSocket
  private async connectWebSocket(): Promise<boolean> {
    try {
      if (!this.gameState?.websocketUrl) return false;

      this.socket = io(this.gameState.websocketUrl, {
        transports: ["websocket"],
        auth: {
          token: this.userToken,
        },
      });

      this.setupEventListeners();

      return new Promise((resolve) => {
        this.socket?.on("connect", () => {
          console.log("✅ Connected to Arena WebSocket");
          resolve(true);
        });

        this.socket?.on("connect_error", (error) => {
          console.error("❌ WebSocket connection failed:", error);
          resolve(false);
        });
      });
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      return false;
    }
  }

  // Set up WebSocket event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Arena Events
    this.socket.on("arena_countdown_started", (data) => {
      console.log("🕐 Arena countdown started:", data);
      this.onArenaCountdownStarted?.(data);
    });

    this.socket.on("countdown_update", (data) => {
      this.onCountdownUpdate?.(data);
    });

    this.socket.on("arena_begins", (data) => {
      console.log("🎮 Arena begins:", data);
      this.onArenaBegins?.(data);
    });

    // Boost Events
    this.socket.on("player_boost_activated", (data) => {
      console.log("⚡ Player boost activated:", data);
      this.onPlayerBoostActivated?.(data);
    });

    this.socket.on("boost_cycle_update", (data) => {
      this.onBoostCycleUpdate?.(data);
    });

    this.socket.on("boost_cycle_complete", (data) => {
      console.log("✅ Boost cycle complete:", data);
      this.onBoostCycleComplete?.(data);
    });

    // Package Events
    this.socket.on("package_drop", (data) => {
      console.log("📦 Package drop:", data);
      this.onPackageDrop?.(data);
    });

    this.socket.on("immediate_item_drop", (data) => {
      console.log("🎁 Immediate item drop:", data);
      this.onImmediateItemDrop?.(data);
    });

    // Game Events
    this.socket.on("event_triggered", (data) => {
      console.log("🎯 Event triggered:", data);
      this.onEventTriggered?.(data);
    });

    this.socket.on("player_joined", (data) => {
      console.log("👤 Player joined:", data);
      this.onPlayerJoined?.(data);
    });

    this.socket.on("game_completed", (data) => {
      console.log("🏁 Game completed:", data);
      this.onGameCompleted?.(data);
    });

    this.socket.on("game_stopped", (data) => {
      console.log("🛑 Game stopped:", data);
      this.onGameStopped?.(data);
    });

    // Connection Events
    this.socket.on("disconnect", (reason) => {
      console.log("❌ Disconnected from Arena:", reason);
    });

    this.socket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });
  }

  // Get game details
  async getGameDetails(
    gameId: string,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      const response = await axios.get<{ success: boolean; data: GameState }>(
        `${ARENA_API_BASE}/game/${gameId}`,
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to get game details:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to get game details",
      };
    }
  }

  // Get current game state
  async getCurrentGameState(): Promise<{
    success: boolean;
    data?: GameState;
    error?: string;
  }> {
    try {
      const response = await axios.get<{ success: boolean; data: GameState }>(
        `${ARENA_API_BASE}/state`,
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to get game state:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to get game state",
      };
    }
  }

  // Boost a player
  async boostPlayer(
    gameId: string,
    playerId: string,
    amount: number,
    username: string,
  ): Promise<{ success: boolean; data?: BoostData; error?: string }> {
    try {
      const response = await axios.post<{
        success: boolean;
        data: BoostData;
        message: string;
      }>(`${ARENA_API_BASE}/boost/${gameId}/${playerId}`, {
        amount,
        username,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to boost player:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to boost player",
      };
    }
  }

  // Update stream URL
  async updateStreamUrl(
    gameId: string,
    streamUrl: string,
    oldStreamUrl: string,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await axios.put(
        `${ARENA_API_BASE}/stream-url/${gameId}`,
        {
          streamUrl,
          oldStreamUrl,
        },
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to update stream URL:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to update stream URL",
      };
    }
  }

  // Get items catalog
  async getItemsCatalog(): Promise<{
    success: boolean;
    data?: any;
    error?: string;
  }> {
    try {
      const response = await axios.get(`${ARENA_API_BASE}/items/catalog`);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to get items catalog:", error);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          error.message ||
          "Failed to get items catalog",
      };
    }
  }

  // Drop immediate item
  async dropImmediateItem(
    gameId: string,
    itemId: string,
    targetPlayer: string,
  ): Promise<{ success: boolean; data?: ItemDrop; error?: string }> {
    try {
      const response = await axios.post<{
        success: boolean;
        data: ItemDrop;
        message: string;
      }>(`${ARENA_API_BASE}/items/drop/${gameId}`, {
        itemId,
        targetPlayer,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to drop item:", error);
      return {
        success: false,
        error:
          error.response?.data?.error || error.message || "Failed to drop item",
      };
    }
  }

  // Check connection status
  async getStatus(): Promise<{
    success: boolean;
    data?: {
      connected: boolean;
      hasActiveGame: boolean;
      gameId: string | null;
      status: string | null;
    };
    error?: string;
  }> {
    try {
      const response = await axios.get(`${ARENA_API_BASE}/status`);

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to get status:", error);
      return {
        success: false,
        error:
          error.response?.data?.error || error.message || "Failed to get status",
      };
    }
  }

  // Disconnect from arena
  async disconnect(): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.post(`${ARENA_API_BASE}/disconnect`);

      if (this.socket) {
        this.socket.disconnect();
        this.socket = null;
      }
      this.gameState = null;

      return { success: true };
    } catch (error: any) {
      console.error("Failed to disconnect:", error);
      return {
        success: false,
        error:
          error.response?.data?.error || error.message || "Failed to disconnect",
      };
    }
  }

  // Event handlers (to be set by components)
  onArenaCountdownStarted?: (data: any) => void;
  onCountdownUpdate?: (data: any) => void;
  onArenaBegins?: (data: any) => void;
  onPlayerBoostActivated?: (data: any) => void;
  onBoostCycleUpdate?: (data: any) => void;
  onBoostCycleComplete?: (data: any) => void;
  onPackageDrop?: (data: any) => void;
  onImmediateItemDrop?: (data: any) => void;
  onEventTriggered?: (data: any) => void;
  onPlayerJoined?: (data: any) => void;
  onGameCompleted?: (data: any) => void;
  onGameStopped?: (data: any) => void;

  // Get current game state (local)
  getGameState(): GameState | null {
    return this.gameState;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance
let arenaServiceInstance: ArenaGameService | null = null;

export function getArenaService(): ArenaGameService {
  if (!arenaServiceInstance) {
    arenaServiceInstance = new ArenaGameService();
  }
  return arenaServiceInstance;
}

export function resetArenaService(): void {
  if (arenaServiceInstance) {
    arenaServiceInstance.disconnect();
    arenaServiceInstance = null;
  }
}

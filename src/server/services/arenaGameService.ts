import { io, Socket } from "socket.io-client";
import axios from "axios";
import type {
  GameState,
  BoostData,
  ItemDrop,
  InitializeGameRequest,
  BoostPlayerRequest,
  UpdateStreamUrlRequest,
  DropItemRequest,
} from "../types/arena.js";

const ARENA_SERVER_URL =
  process.env.ARENA_SERVER_URL || "wss://airdrop-arcade.onrender.com";
const GAME_API_URL =
  process.env.GAME_API_URL || "https://airdrop-arcade.onrender.com/api/";
const ARENA_GAME_ID = process.env.ARENA_GAME_ID || "";

export class ArenaGameService {
  private socket: Socket | null = null;
  private gameState: GameState | null = null;
  private userToken: string = "";
  private vorldAppId: string = "";

  constructor(vorldAppId: string) {
    this.vorldAppId = vorldAppId;
  }

  // Initialize game with stream URL
  async initializeGame(
    streamUrl: string,
    userToken: string,
  ): Promise<{ success: boolean; data?: GameState; error?: string }> {
    try {
      this.userToken = userToken;

      // Build headers dynamically, only include ARENA_GAME_ID if it's set
      const headers: Record<string, string> = {
        Authorization: `Bearer ${userToken}`,
        "X-Vorld-App-ID": this.vorldAppId,
        "Content-Type": "application/json",
      };

      if (ARENA_GAME_ID) {
        headers["X-Arena-Arcade-Game-ID"] = ARENA_GAME_ID;
      }

      const response = await axios.post<{ data: GameState }>(
        `${GAME_API_URL}/games`,
        { streamUrl },
        { headers },
      );

      this.gameState = response.data.data;

      // Connect to WebSocket
      if (this.gameState?.websocketUrl) {
        console.log("Start connect websocket")
        await this.connectWebSocket();
      }

      return {
        success: true,
        data: this.gameState,
      };
    } catch (error: any) {
      console.error("Failed to initialize game server:", error);
      console.error("Error details:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.config?.headers,
      });
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || "Failed to initialize game",
      };
    }
  }

  // Connect to WebSocket
  private async connectWebSocket(): Promise<boolean> {
    try {
      if (!this.gameState?.websocketUrl) return false;

      // Parse the WebSocket URL to extract base URL and namespace
      const wsUrl = this.gameState.websocketUrl;
      let baseUrl = "";
      let namespace = ""; // Socket.IO namespace (e.g., /ws/TPSX1N)

      try {
        const parsed = new URL(wsUrl);

        // Convert ws/wss to http/https for Socket.IO client
        if (parsed.protocol === "wss:") {
          parsed.protocol = "https:";
        } else if (parsed.protocol === "ws:") {
          parsed.protocol = "http:";
        }

        // Extract base URL (protocol + host)
        baseUrl = `${parsed.protocol}//${parsed.host}`;

        // Extract namespace from pathname (e.g., /ws/TPSX1N)
        if (parsed.pathname && parsed.pathname !== "/" && parsed.pathname !== "/socket.io") {
          namespace = parsed.pathname;
        }

        console.log(`🔗 [Server] WebSocket Base URL: ${baseUrl}`);
        console.log(`🔗 [Server] WebSocket Namespace: ${namespace || "(default)"}`);
      } catch (e) {
        console.error("[Server] Failed to parse WebSocket URL:", e);
        // Fallback to default
        baseUrl = "https://airdrop-arcade.onrender.com";
      }

      // Connect to base URL + namespace
      // Socket.IO namespace is part of the connection URL, not a separate option
      let connectionUrl: string = baseUrl;
      console.log(`🔌 [Server] Full connection URL: ${connectionUrl}`);

      this.socket = io(connectionUrl, {
        transports: ["websocket", "polling"],
        timeout: 30000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 10,
        reconnectionDelayMax: 5000,
        randomizationFactor: 0.5,
        auth: {
          token: this.userToken,
          appId: this.vorldAppId,
          gameId: this.gameState.gameId,
        },
      });

      console.log(`🔌 [Server] Connecting to Arena WebSocket...`);
      this.setupEventListeners();

      return new Promise((resolve) => {
        this.socket?.on("connect", () => {
          console.log("✅ [Server] Connected to Arena WebSocket");
          console.log(`🔗 [Server] Socket ID: ${this.socket?.id}`);

          // Join game room
          if (this.gameState?.gameId) {
            this.socket?.emit("join_game", this.gameState.gameId);
            console.log(`🎮 [Server] Joined game room: ${this.gameState.gameId}`);
          }

          resolve(true);
        });

        this.socket?.on("connect_error", (error: any) => {
          console.error("❌ [Server] WebSocket connection failed:", error);
          console.error("Error details:", {
            message: error.message,
            description: error.description,
            context: error.context,
            type: error.type,
          });
          resolve(false);
        });
      });
    } catch (error) {
      console.error("[Server] Failed to connect to WebSocket:", error);
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
      console.log("⏱️ Countdown update:", data);
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
      console.log("🔄 Boost cycle update:", data);
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.userToken}`,
        "X-Vorld-App-ID": this.vorldAppId,
      };

      if (ARENA_GAME_ID) {
        headers["X-Arena-Arcade-Game-ID"] = ARENA_GAME_ID;
      }

      const response = await axios.get<{ data: GameState }>(
        `${GAME_API_URL}/games/${gameId}`,
        { headers },
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to get game details:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || "Failed to get game details",
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.userToken}`,
        "X-Vorld-App-ID": this.vorldAppId,
        "Content-Type": "application/json",
      };

      if (ARENA_GAME_ID) {
        headers["X-Arena-Arcade-Game-ID"] = ARENA_GAME_ID;
      }

      const response = await axios.post<{ data: BoostData }>(
        `${GAME_API_URL}/games/boost/player/${gameId}/${playerId}`,
        { amount, username },
        { headers },
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to boost player:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || "Failed to boost player",
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.userToken}`,
        "X-Vorld-App-ID": this.vorldAppId,
        "Content-Type": "application/json",
      };

      if (ARENA_GAME_ID) {
        headers["X-Arena-Arcade-Game-ID"] = ARENA_GAME_ID;
      }

      const response = await axios.put(
        `${GAME_API_URL}/games/${gameId}/stream-url`,
        { streamUrl, oldStreamUrl },
        { headers },
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to update stream URL:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || "Failed to update stream URL",
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.userToken}`,
        "X-Vorld-App-ID": this.vorldAppId,
      };

      if (ARENA_GAME_ID) {
        headers["X-Arena-Arcade-Game-ID"] = ARENA_GAME_ID;
      }

      const response = await axios.get(`${GAME_API_URL}/items/catalog`, {
        headers,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to get items catalog:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || "Failed to get items catalog",
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
      const headers: Record<string, string> = {
        Authorization: `Bearer ${this.userToken}`,
        "X-Vorld-App-ID": this.vorldAppId,
        "Content-Type": "application/json",
      };

      if (ARENA_GAME_ID) {
        headers["X-Arena-Arcade-Game-ID"] = ARENA_GAME_ID;
      }

      const response = await axios.post<{ data: ItemDrop }>(
        `${GAME_API_URL}/items/drop/${gameId}`,
        { itemId, targetPlayer },
        { headers },
      );

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error: any) {
      console.error("Failed to drop item:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data?.error || "Failed to drop item",
      };
    }
  }

  // Event handlers (to be set by consumers)
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

  // Disconnect from WebSocket
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.gameState = null;
    console.log("🔌 Disconnected from Arena service");
  }

  // Get current game state
  getGameState(): GameState | null {
    return this.gameState;
  }

  // Check if connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

// Singleton instance manager
class ArenaGameServiceManager {
  private instances: Map<string, ArenaGameService> = new Map();

  getInstance(vorldAppId: string): ArenaGameService {
    if (!this.instances.has(vorldAppId)) {
      this.instances.set(vorldAppId, new ArenaGameService(vorldAppId));
    }
    return this.instances.get(vorldAppId)!;
  }

  removeInstance(vorldAppId: string): void {
    const instance = this.instances.get(vorldAppId);
    if (instance) {
      instance.disconnect();
      this.instances.delete(vorldAppId);
    }
  }

  disconnectAll(): void {
    for (const instance of this.instances.values()) {
      instance.disconnect();
    }
    this.instances.clear();
  }
}

export const arenaServiceManager = new ArenaGameServiceManager();

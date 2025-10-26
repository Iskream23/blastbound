import { Scene } from "phaser";
import { io, Socket } from "socket.io-client";

export interface ArenaConfig {
  gameId: string;
  streamUrl: string;
  websocketUrl: string;
  token: string;
  appId: string;
  arenaGameId: string;
}

export interface BoostEvent {
  boosterUsername: string;
  playerName: string;
  playerId: string;
  boostAmount: number;
  timestamp: number;
}

export interface ItemDropEvent {
  itemId: string;
  itemName: string;
  targetPlayer: string;
  targetPlayerName: string;
  purchaserUsername: string;
  cost: number;
  effects: {
    stats?: Array<{
      name: string;
      currentValue: number;
      maxValue: number;
      description: string;
    }>;
    image?: string;
  };
}

export interface DifficultyEvent {
  eventId: string;
  eventName: string;
  targetPlayer?: string;
  isFinal: boolean;
}

export class ArenaIntegrationService {
  private scene: Scene;
  private socket: Socket | null = null;
  private config: ArenaConfig | null = null;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;

  // Event callbacks
  public onBoostActivated?: (boost: BoostEvent) => void;
  public onItemDropped?: (item: ItemDropEvent) => void;
  public onDifficultyEvent?: (event: DifficultyEvent) => void;
  public onArenaBegins?: () => void;
  public onArenaEnds?: () => void;
  public onGameCompleted?: (data: any) => void;
  public onConnectionChange?: (connected: boolean) => void;

  constructor(scene: Scene) {
    this.scene = scene;
  }

  /**
   * Initialize Arena connection with config
   */
  public async initialize(config: ArenaConfig): Promise<void> {
    this.config = config;
    console.log("[Arena] Initializing with config:", config);

    try {
      await this.connectWebSocket();
    } catch (error) {
      console.error("[Arena] Failed to initialize:", error);
      throw error;
    }
  }

  /**
   * Connect to Arena WebSocket server
   */
  private async connectWebSocket(): Promise<void> {
    if (!this.config) {
      throw new Error("Arena config not set");
    }

    // Parse WebSocket URL
    let wsUrl = this.config.websocketUrl;
    try {
      const parsed = new URL(wsUrl);
      if (parsed.protocol === "wss:") {
        parsed.protocol = "https:";
      } else if (parsed.protocol === "ws:") {
        parsed.protocol = "http:";
      }
      wsUrl = `${parsed.protocol}//${parsed.host}`;
    } catch (e) {
      console.warn("[Arena] Invalid WebSocket URL, using default");
      wsUrl = "https://vorld-arena-server.onrender.com";
    }

    console.log("[Arena] Connecting to WebSocket:", wsUrl);

    this.socket = io(wsUrl, {
      transports: ["websocket", "polling"],
      timeout: 30000,
      forceNew: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      auth: {
        token: this.config.token,
        gameId: this.config.gameId,
        appId: this.config.appId,
        arenaGameId: this.config.arenaGameId,
      },
    });

    this.setupSocketListeners();
  }

  /**
   * Setup all WebSocket event listeners
   */
  private setupSocketListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on("connect", () => {
      console.log("[Arena] WebSocket connected! Socket ID:", this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;

      // Join game room
      if (this.config) {
        this.socket?.emit("join_game", this.config.gameId);
        console.log("[Arena] Joined game room:", this.config.gameId);
      }

      this.onConnectionChange?.(true);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Arena] WebSocket disconnected:", reason);
      this.isConnected = false;
      this.onConnectionChange?.(false);
    });

    this.socket.on("connect_error", (error) => {
      console.error("[Arena] WebSocket connection error:", error.message);
      this.reconnectAttempts++;
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log("[Arena] WebSocket reconnected after", attemptNumber, "attempts");
      if (this.config) {
        this.socket?.emit("join_game", this.config.gameId);
      }
    });

    // Arena lifecycle events
    this.socket.on("arena_countdown_started", (data) => {
      console.log("[Arena] Countdown started:", data);
    });

    this.socket.on("countdown_update", (data) => {
      console.log("[Arena] Countdown update:", data);
    });

    this.socket.on("arena_begins", (data) => {
      console.log("[Arena] Arena begins!", data);
      this.onArenaBegins?.();
    });

    this.socket.on("arena_ends", (data) => {
      console.log("[Arena] Arena ends:", data);
      this.onArenaEnds?.();
    });

    this.socket.on("game_start", (data) => {
      console.log("[Arena] Game start:", data);
    });

    // Player boost events
    this.socket.on("player_boost_activated", (data) => {
      console.log("[Arena] Player boost activated:", data);

      const boostEvent: BoostEvent = {
        boosterUsername: data.boosterUsername,
        playerName: data.playerName,
        playerId: data.playerId,
        boostAmount: data.boostAmount,
        timestamp: Date.now(),
      };

      this.onBoostActivated?.(boostEvent);
    });

    // Legacy faction boost (Astrokidz/Aquaticans)
    this.socket.on("boost_activated", (data) => {
      console.log("[Arena] Faction boost activated:", data);

      // Convert faction boost to player boost format
      const boostEvent: BoostEvent = {
        boosterUsername: data.boosterUsername,
        playerName: data.faction,
        playerId: data.faction,
        boostAmount: data.boostAmount,
        timestamp: Date.now(),
      };

      this.onBoostActivated?.(boostEvent);
    });

    this.socket.on("boost_cycle_update", (data) => {
      console.log("[Arena] Boost cycle update:", data);
    });

    this.socket.on("boost_cycle_reset", (data) => {
      console.log("[Arena] Boost cycle reset:", data);
    });

    // Item drop events
    this.socket.on("immediate_item_drop", (data) => {
      console.log("[Arena] Immediate item drop:", data);

      const itemEvent: ItemDropEvent = {
        itemId: data.itemId || data.item?.id,
        itemName: data.itemName || data.item?.name,
        targetPlayer: data.targetPlayer,
        targetPlayerName: data.targetPlayerName || data.targetPlayer,
        purchaserUsername: data.purchaserUsername,
        cost: data.cost,
        effects: {
          stats: data.item?.effects?.stats || [],
          image: data.item?.effects?.image,
        },
      };

      this.onItemDropped?.(itemEvent);
    });

    this.socket.on("items_dropped", (data) => {
      console.log("[Arena] Items dropped:", data);
    });

    this.socket.on("package_drop", (data) => {
      console.log("[Arena] Package drop:", data);
    });

    // Event trigger system
    this.socket.on("event_triggered", (data) => {
      console.log("[Arena] Event triggered:", data);

      const difficultyEvent: DifficultyEvent = {
        eventId: data.eventId,
        eventName: data.eventName,
        targetPlayer: data.targetPlayer,
        isFinal: data.isFinal || false,
      };

      this.onDifficultyEvent?.(difficultyEvent);
    });

    // Game completion
    this.socket.on("game_completed", (data) => {
      console.log("[Arena] Game completed:", data);
      this.onGameCompleted?.(data);
    });

    this.socket.on("game_ended", (data) => {
      console.log("[Arena] Game ended:", data);
    });

    this.socket.on("game_stopped", (data) => {
      console.log("[Arena] Game stopped:", data);
    });

    // Catch-all for unhandled events
    this.socket.onAny((eventName, ...args) => {
      if (
        ![
          "connect",
          "disconnect",
          "reconnect",
          "connect_error",
          "reconnect_error",
        ].includes(eventName)
      ) {
        console.log(`[Arena] Unknown event: ${eventName}`, args);
      }
    });
  }

  /**
   * Send player boost to Arena API
   */
  public async sendBoost(
    playerId: string,
    amount: number,
    username: string
  ): Promise<void> {
    if (!this.config) {
      throw new Error("Arena not initialized");
    }

    try {
      const response = await fetch(
        `/api/arena/boost/${this.config.gameId}/${playerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.token}`,
          },
          body: JSON.stringify({
            amount,
            username,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Boost failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[Arena] Boost sent successfully:", data);
    } catch (error) {
      console.error("[Arena] Failed to send boost:", error);
      throw error;
    }
  }

  /**
   * Drop item to player
   */
  public async dropItem(itemId: string, targetPlayer: string): Promise<void> {
    if (!this.config) {
      throw new Error("Arena not initialized");
    }

    try {
      const response = await fetch(
        `/api/arena/items/drop/${this.config.gameId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.config.token}`,
          },
          body: JSON.stringify({
            itemId,
            targetPlayer,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Item drop failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("[Arena] Item dropped successfully:", data);
    } catch (error) {
      console.error("[Arena] Failed to drop item:", error);
      throw error;
    }
  }

  /**
   * Get game state
   */
  public async getGameState(): Promise<any> {
    if (!this.config) {
      throw new Error("Arena not initialized");
    }

    try {
      const response = await fetch(`/api/arena/game/${this.config.gameId}`, {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get game state: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[Arena] Failed to get game state:", error);
      throw error;
    }
  }

  /**
   * Get items catalog
   */
  public async getItemsCatalog(): Promise<any> {
    try {
      const response = await fetch("/api/arena/items/catalog", {
        headers: {
          Authorization: `Bearer ${this.config?.token || ""}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get items catalog: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error("[Arena] Failed to get items catalog:", error);
      throw error;
    }
  }

  /**
   * Check if connected
   */
  public isConnectedToArena(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  /**
   * Disconnect from Arena
   */
  public disconnect(): void {
    console.log("[Arena] Disconnecting...");

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.isConnected = false;
    this.config = null;
  }

  /**
   * Cleanup on scene shutdown
   */
  public destroy(): void {
    this.disconnect();
    console.log("[Arena] Service destroyed");
  }
}

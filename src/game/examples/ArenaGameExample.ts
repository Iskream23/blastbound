/**
 * Example: How to start Blastbound game with VORLD Arena integration
 *
 * This file demonstrates how to initialize the game with Arena features enabled.
 * Copy this code to your game initialization logic.
 */

import { ArenaConfig } from "../services/ArenaIntegrationService";

// ========================================
// EXAMPLE 1: Start game with Arena
// ========================================

export async function startArenaGame(scene: Phaser.Scene) {
  // Step 1: Get user authentication token
  // This would typically come from your login system
  const userToken = localStorage.getItem("jwtToken") || "your_jwt_token";

  // Step 2: Initialize Arena game session via API
  const arenaResponse = await fetch("/api/arena/init", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userToken}`,
      "x-vorld-app-id": "app_mgp47brw_475f5e06",
      "x-arena-arcade-game-id": "arcade_mgyo9bv7_c8081d4f",
    },
    body: JSON.stringify({
      streamUrl: "https://twitch.tv/yourstream",
    }),
  });

  const arenaData = await arenaResponse.json();

  // Step 3: Create Arena config object
  const arenaConfig: ArenaConfig = {
    gameId: arenaData.data.gameId,
    streamUrl: arenaData.data.streamUrl || "https://twitch.tv/yourstream",
    websocketUrl: arenaData.data.websocketUrl || "wss://vorld-arena-server.onrender.com",
    token: userToken,
    appId: "app_mgp47brw_475f5e06",
    arenaGameId: "arcade_mgyo9bv7_c8081d4f",
  };

  // Step 4: Start game with Arena config
  scene.scene.start("Game", {
    levelId: 1,
    arenaConfig: arenaConfig,
  });

  console.log("🎮 Arena game started:", arenaConfig.gameId);
}

// ========================================
// EXAMPLE 2: Start game without Arena (standalone)
// ========================================

export function startStandaloneGame(scene: Phaser.Scene) {
  // Just start the game without arenaConfig
  scene.scene.start("Game", {
    levelId: 1,
    // No arenaConfig = standalone mode
  });

  console.log("🎮 Standalone game started");
}

// ========================================
// EXAMPLE 3: Check if Arena is available
// ========================================

export async function checkArenaAvailability(): Promise<boolean> {
  try {
    const userToken = localStorage.getItem("jwtToken");
    if (!userToken) {
      return false;
    }

    const response = await fetch("/api/arena/status", {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    const data = await response.json();
    return data.success && data.data.available;
  } catch (error) {
    console.error("Arena availability check failed:", error);
    return false;
  }
}

// ========================================
// EXAMPLE 4: React component integration
// ========================================

export const ArenaGameComponent = () => {
  // Example React component that starts the game with Arena

  const handleStartGame = async () => {
    // Check if user is logged in
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("Please login first!");
      return;
    }

    // Check if Arena is available
    const arenaAvailable = await checkArenaAvailability();

    if (arenaAvailable) {
      // Start with Arena
      console.log("Starting game with Arena integration...");
      // Initialize Arena game here
    } else {
      // Start standalone
      console.log("Starting standalone game...");
      // Start game without Arena
    }
  };

  return (
    <button onClick={handleStartGame}>
      Start Game
    </button>
  );
};

// ========================================
// EXAMPLE 5: Manual event triggering (for testing)
// ========================================

export function testArenaFeatures(gameScene: any) {
  // Test boost
  console.log("Testing boost...");
  gameScene.boostManager?.applyBoost({
    boosterUsername: "TestViewer",
    playerName: "Player1",
    playerId: "test_player",
    boostAmount: 100,
    timestamp: Date.now(),
  });

  // Test item drop
  console.log("Testing item drop...");
  setTimeout(() => {
    gameScene.itemDropManager?.spawnItem({
      itemId: "test_health",
      itemName: "Health Potion",
      targetPlayer: "test_player",
      targetPlayerName: "Player1",
      purchaserUsername: "TestViewer",
      cost: 50,
      effects: {
        stats: [
          {
            name: "health",
            currentValue: 20,
            maxValue: 100,
            description: "Restores health",
          },
        ],
      },
    });
  }, 2000);

  // Test difficulty event
  console.log("Testing difficulty event...");
  setTimeout(() => {
    gameScene.difficultyManager?.applyDifficultyEvent({
      eventId: "test_spawn",
      eventName: "Spawn Extra Enemies",
      isFinal: false,
    });
  }, 4000);
}

// ========================================
// EXAMPLE 6: Monitor Arena connection
// ========================================

export function monitorArenaConnection(gameScene: any) {
  // Check connection status
  setInterval(() => {
    const isConnected = gameScene.arenaService?.isConnectedToArena();
    console.log(`Arena connection: ${isConnected ? "✅ Connected" : "❌ Disconnected"}`);

    // Get active boosts
    const boosts = gameScene.boostManager?.getActiveBoosts();
    if (boosts && boosts.length > 0) {
      console.log(`Active boosts: ${boosts.length}`);
      boosts.forEach((boost: any) => {
        const remaining = boost.duration - (Date.now() - boost.startTime);
        console.log(`  - ${boost.type}: ${Math.ceil(remaining / 1000)}s remaining`);
      });
    }

    // Get metrics
    const metrics = gameScene.arenaUI?.getMetrics();
    if (metrics) {
      console.log(`Metrics: ${metrics.enemiesKilled} kills, ${metrics.cratesDestroyed} crates`);
    }
  }, 5000); // Check every 5 seconds
}

// ========================================
// EXAMPLE 7: Full integration in MainMenu
// ========================================

export class MainMenuWithArena extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    // Add title
    this.add
      .text(this.scale.width / 2, 200, "BLASTBOUND", {
        fontFamily: "PressStart2P",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    // Add Arena mode button
    const arenaBtn = this.add
      .text(this.scale.width / 2, 300, "PLAY WITH ARENA", {
        fontFamily: "PressStart2P",
        fontSize: "16px",
        color: "#00ff00",
      })
      .setOrigin(0.5)
      .setInteractive();

    arenaBtn.on("pointerdown", async () => {
      await this.startWithArena();
    });

    // Add standalone mode button
    const standaloneBtn = this.add
      .text(this.scale.width / 2, 350, "PLAY SOLO", {
        fontFamily: "PressStart2P",
        fontSize: "16px",
        color: "#ffff00",
      })
      .setOrigin(0.5)
      .setInteractive();

    standaloneBtn.on("pointerdown", () => {
      this.startStandalone();
    });
  }

  private async startWithArena() {
    console.log("Initializing Arena game...");

    try {
      // Get token from user context
      const userToken = (window as any).currentUser?.token || localStorage.getItem("jwtToken");
      if (!userToken) {
        alert("Please login to play with Arena!");
        return;
      }

      // Initialize Arena session
      const response = await fetch("/api/arena/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
          "x-vorld-app-id": "app_mgp47brw_475f5e06",
          "x-arena-arcade-game-id": "arcade_mgyo9bv7_c8081d4f",
        },
        body: JSON.stringify({
          streamUrl: "https://twitch.tv/blastbound",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to initialize Arena");
      }

      const data = await response.json();

      // Create Arena config
      const arenaConfig: ArenaConfig = {
        gameId: data.data.gameId,
        streamUrl: data.data.streamUrl,
        websocketUrl: data.data.websocketUrl || "wss://vorld-arena-server.onrender.com",
        token: userToken,
        appId: "app_mgp47brw_475f5e06",
        arenaGameId: "arcade_mgyo9bv7_c8081d4f",
      };

      // Start game with Arena
      this.scene.start("Game", {
        levelId: 1,
        arenaConfig: arenaConfig,
      });

      console.log("✅ Arena game started:", arenaConfig.gameId);
    } catch (error) {
      console.error("❌ Failed to start Arena game:", error);
      alert("Failed to start Arena mode. Starting standalone game...");
      this.startStandalone();
    }
  }

  private startStandalone() {
    console.log("Starting standalone game...");

    // Start game without Arena config
    this.scene.start("Game", {
      levelId: 1,
      // No arenaConfig
    });
  }
}

// ========================================
// EXAMPLE 8: Environment-based configuration
// ========================================

export function getArenaConfig(): {
  appId: string;
  arenaGameId: string;
  websocketUrl: string;
} {
  // Development
  if (process.env.NODE_ENV === "development") {
    return {
      appId: "app_mgp47brw_475f5e06",
      arenaGameId: "arcade_mgyo9bv7_c8081d4f",
      websocketUrl: "ws://localhost:3000",
    };
  }

  // Production
  return {
    appId: process.env.VORLD_APP_ID || "app_mgp47brw_475f5e06",
    arenaGameId: process.env.ARENA_GAME_ID || "arcade_mgyo9bv7_c8081d4f",
    websocketUrl: process.env.ARENA_WS_URL || "wss://vorld-arena-server.onrender.com",
  };
}

// ========================================
// Usage in your app:
// ========================================
// import { startArenaGame, startStandaloneGame } from './ArenaGameExample';
//
// // Start with Arena
// await startArenaGame(this.scene);
//
// // Or start standalone
// startStandaloneGame(this.scene);

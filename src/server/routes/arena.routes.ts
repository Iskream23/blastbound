import { Router, type Request, type Response } from "express";
import { arenaServiceManager } from "../services/arenaGameService.js";
import { env } from "../config/env.js";
import type {
  InitializeGameRequest,
  BoostPlayerRequest,
  UpdateStreamUrlRequest,
  DropItemRequest,
} from "../types/arena.js";

export const arenaRouter = Router();

// Initialize a new game
arenaRouter.post(
  "/init",
  async (req: Request<{}, {}, InitializeGameRequest>, res: Response) => {
    try {
      const { streamUrl } = req.body;
      const authHeader = req.headers.authorization;

      if (!streamUrl) {
        return res.status(400).json({
          success: false,
          error: "Stream URL is required",
        });
      }

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          error: "Authorization token is required",
        });
      }

      const token = authHeader.split(" ")[1];
      const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);

      const result = await arenaService.initializeGame(streamUrl, token);

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: "Game initialized successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error initializing game:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to initialize game",
      });
    }
  },
);

// Get game details
arenaRouter.get("/game/:gameId", async (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);

    const result = await arenaService.getGameDetails(gameId);

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error("Error getting game details:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get game details",
    });
  }
});

// Get current game state
arenaRouter.get("/state", async (_req: Request, res: Response) => {
  try {
    const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);
    const gameState = arenaService.getGameState();

    if (gameState) {
      return res.status(200).json({
        success: true,
        data: gameState,
      });
    } else {
      return res.status(404).json({
        success: false,
        error: "No active game found",
      });
    }
  } catch (error: any) {
    console.error("Error getting game state:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get game state",
    });
  }
});

// Boost a player
arenaRouter.post(
  "/boost/:gameId/:playerId",
  async (
    req: Request<
      { gameId: string; playerId: string },
      {},
      BoostPlayerRequest
    >,
    res: Response,
  ) => {
    try {
      const { gameId, playerId } = req.params;
      const { amount, username } = req.body;

      if (!amount || !username) {
        return res.status(400).json({
          success: false,
          error: "Amount and username are required",
        });
      }

      const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);
      const result = await arenaService.boostPlayer(
        gameId,
        playerId,
        amount,
        username,
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: `Boost applied successfully`,
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error boosting player:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to boost player",
      });
    }
  },
);

// Update stream URL
arenaRouter.put(
  "/stream-url/:gameId",
  async (
    req: Request<{ gameId: string }, {}, UpdateStreamUrlRequest>,
    res: Response,
  ) => {
    try {
      const { gameId } = req.params;
      const { streamUrl, oldStreamUrl } = req.body;

      if (!streamUrl || !oldStreamUrl) {
        return res.status(400).json({
          success: false,
          error: "Stream URL and old stream URL are required",
        });
      }

      const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);
      const result = await arenaService.updateStreamUrl(
        gameId,
        streamUrl,
        oldStreamUrl,
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: "Stream URL updated successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error updating stream URL:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to update stream URL",
      });
    }
  },
);

// Get items catalog
arenaRouter.get("/items/catalog", async (_req: Request, res: Response) => {
  try {
    const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);
    const result = await arenaService.getItemsCatalog();

    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }
  } catch (error: any) {
    console.error("Error getting items catalog:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to get items catalog",
    });
  }
});

// Drop immediate item
arenaRouter.post(
  "/items/drop/:gameId",
  async (
    req: Request<{ gameId: string }, {}, DropItemRequest>,
    res: Response,
  ) => {
    try {
      const { gameId } = req.params;
      const { itemId, targetPlayer } = req.body;

      if (!itemId || !targetPlayer) {
        return res.status(400).json({
          success: false,
          error: "Item ID and target player are required",
        });
      }

      const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);
      const result = await arenaService.dropImmediateItem(
        gameId,
        itemId,
        targetPlayer,
      );

      if (result.success) {
        return res.status(200).json({
          success: true,
          data: result.data,
          message: "Item dropped successfully",
        });
      } else {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }
    } catch (error: any) {
      console.error("Error dropping item:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Failed to drop item",
      });
    }
  },
);

// Check connection status
arenaRouter.get("/status", async (_req: Request, res: Response) => {
  try {
    const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);
    const isConnected = arenaService.isConnected();
    const gameState = arenaService.getGameState();

    return res.status(200).json({
      success: true,
      data: {
        connected: isConnected,
        hasActiveGame: gameState !== null,
        gameId: gameState?.gameId || null,
        status: gameState?.status || null,
      },
    });
  } catch (error: any) {
    console.error("Error checking status:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to check status",
    });
  }
});

// Disconnect from arena
arenaRouter.post("/disconnect", async (_req: Request, res: Response) => {
  try {
    const arenaService = arenaServiceManager.getInstance(env.VORLD_APP_ID);
    arenaService.disconnect();

    return res.status(200).json({
      success: true,
      message: "Disconnected from Arena service",
    });
  } catch (error: any) {
    console.error("Error disconnecting:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to disconnect",
    });
  }
});

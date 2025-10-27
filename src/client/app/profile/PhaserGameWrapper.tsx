"use client";

import { useEffect, useRef, useState } from "react";
import { VorldUser } from "../_lib/authService";
import { getArenaService } from "../../lib/arenaGameService";

interface PhaserGameWrapperProps {
  userProfile: VorldUser;
}

const GLOBAL_GAME_KEY = "__blastboundGame";

export default function PhaserGameWrapper({ userProfile }: PhaserGameWrapperProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const isStartingRef = useRef(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const loadGame = async () => {
      if (!gameContainerRef.current) return;

      const currentGame = (window as any)[GLOBAL_GAME_KEY];
      if (currentGame || isStartingRef.current) {
        return;
      }

      isStartingRef.current = true;

      try {
        // Clear any existing canvas elements in the container
        const container = gameContainerRef.current;
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }

        // Initialize Arena integration
        console.log("[PhaserGameWrapper] Initializing Arena integration...");
        const arenaService = getArenaService();

        // Get the user's auth token from localStorage
        const token = localStorage.getItem("vorld_token");
        if (!token) {
          console.warn("[PhaserGameWrapper] No auth token found, starting game without Arena");
        }

        // Initialize Arena game session
        let arenaConfig = null;
        if (token) {
          // const streamUrl = `https://twitch.tv/${userProfile.username}`;
          const streamUrl = `https://www.twitch.tv/lizabaktt`;
          const result = await arenaService.initializeGame(streamUrl, token);

          if (result.success && result.data) {
            console.log("[PhaserGameWrapper] Arena initialized successfully:", result.data);

            // Prepare Arena config for Phaser game
            arenaConfig = {
              gameId: result.data.gameId,
              streamUrl: streamUrl,
              websocketUrl: result.data.websocketUrl,
              token: token,
              appId: result.data.evaGameDetails.vorldAppId,
              arenaGameId: result.data.evaGameDetails.arcadeGameId,
            };
          } else {
            console.error("[PhaserGameWrapper] Failed to initialize Arena:", result.error);
            setInitError(result.error || "Failed to initialize Arena");
            // Continue without Arena integration
          }
        }

        // Dynamically import your game
        const { default: StartGame } = await import("../../../game/main");

        // Start the game with the container ID
        const createdGame = StartGame("game-container");
        if (createdGame?.canvas) {
          const focusCanvas = () => createdGame.canvas?.focus();
          createdGame.canvas.setAttribute("tabindex", "0");
          createdGame.canvas.addEventListener("pointerdown", focusCanvas);
          createdGame.canvas.focus();
          (createdGame as any).__focusHandler = focusCanvas;
        }
        (window as any)[GLOBAL_GAME_KEY] = createdGame;

        // Pass user data and Arena config to game via global object
        if (window) {
          (window as any).currentUser = {
            username: userProfile.username,
            email: userProfile.email,
            id: userProfile.id
          };
          (window as any).arenaConfig = arenaConfig;
        }

        console.log("[PhaserGameWrapper] Game loaded successfully with Arena config:", arenaConfig ? "enabled" : "disabled");
      } catch (error) {
        console.error("Failed to load game:", error);
        setInitError(error instanceof Error ? error.message : "Failed to load game");
      } finally {
        isStartingRef.current = false;
      }
    };

    loadGame();

    return () => {
      // Only clean up when component unmounts
      const currentGame = (window as any)[GLOBAL_GAME_KEY];
      if (currentGame) {
        try {
          if (currentGame.canvas && (currentGame as any).__focusHandler) {
            currentGame.canvas.removeEventListener("pointerdown", (currentGame as any).__focusHandler);
          }
          if (currentGame.destroy) {
            currentGame.destroy(true);
          }
        } catch (error) {
          console.error("Error destroying game:", error);
        }
        (window as any)[GLOBAL_GAME_KEY] = null;
        
        // Clean up global user data
        if (window && (window as any).currentUser) {
          delete (window as any).currentUser;
        }
      }
    };
  }, [userProfile.username, userProfile.email, userProfile.id]);

  return (
    <div
      id="game-container"
      ref={gameContainerRef}
      className="phaser-game-container"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100vh",
        position: "relative"
      }}
    >
      {initError && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            fontSize: "12px",
            maxWidth: "300px",
            zIndex: 1000,
          }}
        >
          <strong>Arena Warning:</strong> {initError}
          <br />
          <small>Game will run in standalone mode</small>
        </div>
      )}
    </div>
  );
}
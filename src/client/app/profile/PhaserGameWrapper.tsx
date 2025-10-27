"use client";

import { useEffect, useRef, useState } from "react";
import { VorldUser } from "../_lib/authService";

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

        // Get Arena config from window (set by profile page)
        const arenaConfig = (window as any).arenaConfig || null;
        
        if (arenaConfig) {
          console.log("[PhaserGameWrapper] Arena config loaded:", arenaConfig);
        } else {
          console.warn("[PhaserGameWrapper] No Arena config found, starting game in standalone mode");
        }

        // Dynamically import your game
        const { default: StartGame } = await import("../../game/main");

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

        // Pass user data to game via global object
        if (window) {
          (window as any).currentUser = {
            username: userProfile.username,
            email: userProfile.email,
            id: userProfile.id
          };
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
        
        // Clean up global user data and arena config
        if (window) {
          delete (window as any).currentUser;
          delete (window as any).arenaConfig;
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
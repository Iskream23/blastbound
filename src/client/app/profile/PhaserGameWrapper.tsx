"use client";

import { useEffect, useRef } from "react";
import { VorldUser } from "../_lib/authService";

interface PhaserGameWrapperProps {
  userProfile: VorldUser;
}

const GLOBAL_GAME_KEY = "__blastboundGame";

export default function PhaserGameWrapper({ userProfile }: PhaserGameWrapperProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const isStartingRef = useRef(false);

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
        
        // Optionally pass user data to your game via global object or other method
        if (window) {
          (window as any).currentUser = {
            username: userProfile.username,
            email: userProfile.email,
            id: userProfile.id
          };
        }
      } catch (error) {
        console.error("Failed to load game:", error);
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
        height: "100vh"
      }}
    />
  );
}
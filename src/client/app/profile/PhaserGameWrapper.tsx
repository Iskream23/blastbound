"use client";

import { useEffect, useRef } from "react";
import { VorldUser } from "../_lib/authService";

interface PhaserGameWrapperProps {
  userProfile: VorldUser;
}

export default function PhaserGameWrapper({ userProfile }: PhaserGameWrapperProps) {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const gameInstanceRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;

    const loadGame = async () => {
      if (!gameContainerRef.current || !mounted) return;

      try {
        // Dynamically import your game
        const { default: StartGame } = await import("../../../game/main");
        
        // Start the game with the container ID
        gameInstanceRef.current = StartGame("game-container");
        
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
      }
    };

    loadGame();

    return () => {
      mounted = false;
      
      // Clean up the game instance
      if (gameInstanceRef.current) {
        // If your StartGame returns a Phaser.Game instance
        if (gameInstanceRef.current.destroy) {
          gameInstanceRef.current.destroy(true);
        }
        
        // Clean up global user data
        if (window && (window as any).currentUser) {
          delete (window as any).currentUser;
        }
      }
    };
  }, [userProfile]);

  return (
    <div 
      id="game-container" 
      ref={gameContainerRef}
      className="phaser-game-container"
    />
  );
}
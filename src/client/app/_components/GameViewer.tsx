"use client";

import { useEffect, useRef } from "react";
import { GameState } from "../../lib/arenaGameService";

interface GameViewerProps {
  gameState: GameState;
}

export function GameViewer({ gameState }: GameViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // You can implement game embedding logic here
    // For now, we'll show a placeholder that can be replaced with actual game content
    console.log("Game viewer initialized with state:", gameState);
  }, [gameState]);

  return (
    <div className="game-viewer-container w-full h-full flex items-center justify-center bg-black relative">
      {/* Game Canvas Container */}
      <div
        ref={canvasContainerRef}
        id="game-viewer-canvas"
        className="w-full h-full flex items-center justify-center"
      >
        {/* Placeholder - Replace with actual game embedding */}
        <div className="text-center">
          <div className="mb-4">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-white text-2xl font-bold mb-2">
              {gameState?.evaGameDetails?.appName}
            </h2>
            <div className="text-gray-400 mb-4">
              Game will appear here when loaded
            </div>
          </div>

          {/* Stream URL display */}
          {gameState?.evaGameDetails && (
            <div className="bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
              <div className="text-gray-300 text-sm mb-2">Game Details:</div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>Cycles: {gameState.evaGameDetails?.numberOfCycles}</div>
                <div>Cycle Time: {gameState.evaGameDetails?.cycleTime}s</div>
                <div>Players: {gameState.evaGameDetails?.players.length}</div>
                <div>Status: {gameState.arenaActive ? "Active" : "Waiting"}</div>
              </div>
            </div>
          )}

          {/* Status indicator */}
          <div className="mt-6">
            {gameState.countdownStarted ? (
              <div className="bg-yellow-900 text-yellow-200 px-4 py-2 rounded inline-block">
                ⏱️ Countdown started - Game starting soon!
              </div>
            ) : gameState.arenaActive ? (
              <div className="bg-green-900 text-green-200 px-4 py-2 rounded inline-block">
                ▶️ Game is active!
              </div>
            ) : (
              <div className="bg-blue-900 text-blue-200 px-4 py-2 rounded inline-block">
                ⏸️ Waiting for game to start...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Optional: Overlay controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="bg-gray-900 bg-opacity-75 hover:bg-opacity-100 text-white px-3 py-2 rounded text-sm transition-all"
          title="Fullscreen"
        >
          ⛶
        </button>
        <button
          className="bg-gray-900 bg-opacity-75 hover:bg-opacity-100 text-white px-3 py-2 rounded text-sm transition-all"
          title="Settings"
        >
          ⚙️
        </button>
      </div>
    </div>
  );
}

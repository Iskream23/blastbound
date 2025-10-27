"use client";

import { useState, useEffect } from "react";
import { GameState, GamePlayer } from "../../lib/arenaGameService";

interface PlayerStatsPanelProps {
  gameState: GameState;
}

interface PlayerStats {
  playerId: string;
  playerName: string;
  currentCyclePoints: number;
  totalPoints: number;
}

export function PlayerStatsPanel({ gameState }: PlayerStatsPanelProps) {
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [currentCycle, setCurrentCycle] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Initialize player stats
  useEffect(() => {
    const initialStats: PlayerStats[] = gameState.evaGameDetails?.players.map(
      (player: GamePlayer) => ({
        playerId: player.id,
        playerName: player.name,
        currentCyclePoints: 0,
        totalPoints: 0,
      })
    );
    setPlayerStats(initialStats);
  }, [gameState]);

  // Update stats when boost cycle updates (you can connect this to WebSocket events)
  useEffect(() => {
    // This would be connected to the Arena service's boost_cycle_update event
    // For now, we'll just initialize it
    setCurrentCycle(0);
  }, []);

  const getTopPlayer = () => {
    if (playerStats.length === 0) return null;
    return playerStats.reduce((prev, current) =>
      prev.totalPoints > current.totalPoints ? prev : current
    );
  };

  const topPlayer = getTopPlayer();

  return (
    <div className="player-stats-panel bg-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Game Info */}
        <div className="flex items-center gap-6">
          <div>
            <div className="text-gray-400 text-xs">Cycle</div>
            <div className="text-white font-bold text-lg">{currentCycle}</div>
          </div>

          <div className="h-8 w-px bg-gray-700"></div>

          {/* Player Stats */}
          <div className="flex items-center gap-4">
            {playerStats.map((player) => (
              <div key={player.playerId} className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    player.playerId === topPlayer?.playerId
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-gray-600"
                  }`}
                ></div>
                <div>
                  <div className="text-gray-300 text-sm font-medium">
                    {player.playerName}
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-400">Cycle:</span>{" "}
                    <span className="text-purple-400 font-bold">
                      {player.currentCyclePoints}
                    </span>
                    <span className="text-gray-500 mx-1">|</span>
                    <span className="text-gray-400">Total:</span>{" "}
                    <span className="text-blue-400 font-bold">
                      {player.totalPoints}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Game Status */}
        <div className="flex items-center gap-4">
          {timeRemaining > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-gray-400 text-xs">Time:</div>
              <div className="text-white font-mono font-bold">
                {Math.floor(timeRemaining / 60)}:
                {(timeRemaining % 60).toString().padStart(2, "0")}
              </div>
            </div>
          )}

          <div
            className={`px-3 py-1 rounded text-xs font-bold ${
              gameState.arenaActive
                ? "bg-green-600 text-white animate-pulse"
                : gameState.countdownStarted
                ? "bg-yellow-600 text-white"
                : "bg-gray-600 text-gray-300"
            }`}
          >
            {gameState.arenaActive
              ? "🔴 LIVE"
              : gameState.countdownStarted
              ? "⏱️ STARTING"
              : "⏸️ WAITING"}
          </div>
        </div>
      </div>

      {/* Progress Bars for Each Player */}
      {playerStats.length > 0 && (
        <div className="mt-3 space-y-2">
          {playerStats.map((player) => {
            const maxPoints = Math.max(
              ...playerStats.map((p) => p.totalPoints),
              100
            );
            const percentage = (player.totalPoints / maxPoints) * 100;

            return (
              <div key={player.playerId} className="flex items-center gap-2">
                <div className="text-gray-400 text-xs w-24 truncate">
                  {player.playerName}
                </div>
                <div className="flex-1 bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      player.playerId === topPlayer?.playerId
                        ? "bg-gradient-to-r from-yellow-400 to-orange-500"
                        : "bg-gradient-to-r from-purple-500 to-blue-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-white text-xs font-bold w-16 text-right">
                  {player.totalPoints}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

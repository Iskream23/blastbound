"use client";

import { useState, useEffect } from "react";
import { getArenaService, GameState, GamePlayer } from "../../lib/arenaGameService";
import { authService } from "../_lib/authService";
import { LiveEvent } from "./WatchScreen";

interface BoostPanelProps {
  gameState: GameState;
  onEventCreated: (event: LiveEvent) => void;
}

export function BoostPanel({ gameState, onEventCreated }: BoostPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [boostAmount, setBoostAmount] = useState<number>(25);
  const [username, setUsername] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const boostAmounts = [25, 50, 100, 500, 5000];

  // Load username from auth
  useEffect(() => {
    const loadUsername = async () => {
      let user = authService.getUser();

      if (!user) {
        // Try to fetch profile
        const profileResult = await authService.getProfile();
        if (profileResult.success && profileResult.data.profile) {
          user = profileResult.data.profile;
        }
      }

      if (user) {
        setUsername(user.username || user.email.split("@")[0]);
      }
    };
    loadUsername();
  }, []);

  // Auto-select first player if none selected
  useEffect(() => {
    if (
      !selectedPlayer &&
      gameState.evaGameDetails?.players &&
      gameState.evaGameDetails?.players.length > 0
    ) {
      setSelectedPlayer(gameState.evaGameDetails?.players[0].id);
    }
  }, [gameState, selectedPlayer]);

  const handleBoost = async () => {
    if (!selectedPlayer) {
      setError("Please select a player to boost");
      return;
    }

    if (!username) {
      setError("Username is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const arenaService = getArenaService();
      const result = await arenaService.boostPlayer(
        gameState.gameId,
        selectedPlayer,
        boostAmount,
        username
      );

      if (result.success && result.data) {
        setSuccess(
          `Successfully boosted ${result.data.playerName} with ${boostAmount} points!`
        );

        // Create local event (WebSocket will also send one)
        onEventCreated({
          id: Date.now().toString(),
          type: "boost",
          timestamp: Date.now(),
          message: `You boosted ${result.data.playerName} with ${boostAmount} points!`,
          data: result.data,
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to boost player");
      }
    } catch (err) {
      console.error("Boost error:", err);
      setError(err instanceof Error ? err.message : "Failed to boost player");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = gameState.evaGameDetails?.players.find((p) => p.id === playerId);
    return player?.name || "Unknown Player";
  };

  return (
    <div className="boost-panel p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">⚡ Boost a Player</h3>
        <p className="text-gray-400 text-xs">
          Support your favorite player with boost points!
        </p>
      </div>

      {/* Username Input */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Your Username
        </label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          maxLength={30}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
        />
        <div className="text-xs text-gray-500 mt-1">
          This will be shown to other viewers
        </div>
      </div>

      {/* Player Selection */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Select Player
        </label>
        <div className="space-y-2">
          {gameState?.evaGameDetails?.players.map((player: GamePlayer) => (
            <button
              key={player.id}
              onClick={() => setSelectedPlayer(player.id)}
              className={`w-full px-4 py-3 rounded text-left transition-all ${
                selectedPlayer === player.id
                  ? "bg-purple-600 text-white ring-2 ring-purple-400"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{player.name}</div>
                  <div className="text-xs opacity-75">ID: {player.id.slice(0, 8)}...</div>
                </div>
                {selectedPlayer === player.id && (
                  <div className="text-xl">✓</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Boost Amount Selection */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Boost Amount
        </label>
        <div className="grid grid-cols-3 gap-2">
          {boostAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => setBoostAmount(amount)}
              className={`px-3 py-2 rounded font-medium text-sm transition-all ${
                boostAmount === amount
                  ? "bg-yellow-500 text-gray-900 ring-2 ring-yellow-300"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {amount}
            </button>
          ))}
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Selected: <span className="text-yellow-400 font-bold">{boostAmount}</span> points
        </div>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="bg-red-900 bg-opacity-50 border border-red-500 text-red-200 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900 bg-opacity-50 border border-green-500 text-green-200 px-3 py-2 rounded text-sm">
          {success}
        </div>
      )}

      {/* Boost Button */}
      <button
        onClick={handleBoost}
        disabled={isSubmitting || !selectedPlayer || !username}
        className={`w-full py-3 rounded font-bold text-white transition-all ${
          isSubmitting || !selectedPlayer || !username
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 active:scale-95"
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">⚡</span>
            Boosting...
          </span>
        ) : (
          <span>
            ⚡ Boost {selectedPlayer ? getPlayerName(selectedPlayer) : "Player"}
          </span>
        )}
      </button>

      {/* Info */}
      <div className="bg-blue-900 bg-opacity-30 border border-blue-700 rounded p-3">
        <div className="text-blue-200 text-xs">
          <div className="font-bold mb-1">💡 How Boosting Works</div>
          <ul className="list-disc list-inside space-y-1 text-blue-300">
            <li>Boost points help your player get advantages</li>
            <li>Higher boost amounts = more impact</li>
            <li>Your username will be shown in the live feed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

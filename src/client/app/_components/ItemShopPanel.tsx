"use client";

import { useState, useEffect } from "react";
import { getArenaService, GameState, GamePackage, GamePlayer } from "../../lib/arenaGameService";
import { LiveEvent } from "./WatchScreen";

interface ItemShopPanelProps {
  gameState: GameState;
  onEventCreated: (event: LiveEvent) => void;
}

export function ItemShopPanel({ gameState, onEventCreated }: ItemShopPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Filter immediate packages
  const immediatePackages = gameState.evaGameDetails?.packages.filter(
    (pkg) => pkg.type === "immediate"
  );

  // Auto-select first player and item if none selected
  useEffect(() => {
    if (
      !selectedPlayer &&
      gameState.evaGameDetails?.players &&
      gameState.evaGameDetails?.players.length > 0
    ) {
      setSelectedPlayer(gameState.evaGameDetails?.players[0].id);
    }

    if (!selectedItem && immediatePackages.length > 0) {
      setSelectedItem(immediatePackages[0].id);
    }
  }, [gameState, selectedPlayer, selectedItem, immediatePackages]);

  const handleDropItem = async () => {
    if (!selectedPlayer) {
      setError("Please select a target player");
      return;
    }

    if (!selectedItem) {
      setError("Please select an item");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const arenaService = getArenaService();
      const result = await arenaService.dropImmediateItem(
        gameState.gameId,
        selectedItem,
        selectedPlayer
      );

      if (result.success && result.data) {
        const playerName = getPlayerName(selectedPlayer);
        const itemName = getItemName(selectedItem);
        setSuccess(`Successfully sent ${itemName} to ${playerName}!`);

        // Create local event
        onEventCreated({
          id: Date.now().toString(),
          type: "item_drop",
          timestamp: Date.now(),
          message: `You sent ${itemName} to ${playerName}!`,
          data: result.data,
        });

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(result.error || "Failed to drop item");
      }
    } catch (err) {
      console.error("Item drop error:", err);
      setError(err instanceof Error ? err.message : "Failed to drop item");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPlayerName = (playerId: string) => {
    const player = gameState.evaGameDetails?.players.find((p) => p.id === playerId);
    return player?.name || "Unknown Player";
  };

  const getItemName = (itemId: string) => {
    const item = immediatePackages.find((p) => p.id === itemId);
    return item?.name || "Unknown Item";
  };

  const isItemAvailableForPlayer = (pkg: GamePackage, playerId: string) => {
    if (!pkg.players || pkg.players.length === 0) {
      return true; // Available for all players
    }
    return pkg.players.includes(playerId);
  };

  return (
    <div className="item-shop-panel p-4 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-white font-semibold text-lg mb-1">🎁 Item Shop</h3>
        <p className="text-gray-400 text-xs">
          Send items to players during the game!
        </p>
      </div>

      {/* Player Selection */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Target Player
        </label>
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-purple-500 focus:outline-none text-sm"
        >
          <option value="">Select a player...</option>
          {gameState.evaGameDetails?.players.map((player: GamePlayer) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
      </div>

      {/* Items Grid */}
      <div>
        <label className="block text-gray-300 text-sm font-medium mb-2">
          Available Items ({immediatePackages.length})
        </label>

        {immediatePackages.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <div className="text-4xl mb-2">📦</div>
            <div className="text-sm">No items available</div>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {immediatePackages.map((pkg: GamePackage) => {
              const isAvailable = isItemAvailableForPlayer(pkg, selectedPlayer);
              const isSelected = selectedItem === pkg.id;

              return (
                <button
                  key={pkg.id}
                  onClick={() => isAvailable && setSelectedItem(pkg.id)}
                  disabled={!isAvailable}
                  className={`w-full p-3 rounded text-left transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white ring-2 ring-purple-400"
                      : isAvailable
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium flex items-center gap-2">
                        {pkg.image && (
                          <img
                            src={pkg.image}
                            alt={pkg.name}
                            className="w-8 h-8 rounded"
                          />
                        )}
                        <span>{pkg.name}</span>
                      </div>

                      {/* Stats */}
                      {pkg.stats && pkg.stats.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {pkg.stats.map((stat, idx) => (
                            <div key={idx} className="text-xs opacity-75">
                              <span className="font-medium">{stat.name}:</span>{" "}
                              {stat.currentValue}/{stat.maxValue}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Cost */}
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded font-bold ${
                            isSelected
                              ? "bg-yellow-400 text-gray-900"
                              : "bg-yellow-600 text-white"
                          }`}
                        >
                          💰 {pkg.cost} Coins
                        </span>
                        {!isAvailable && (
                          <span className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">
                            Not Available
                          </span>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <div className="text-xl ml-2">✓</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
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

      {/* Send Button */}
      <button
        onClick={handleDropItem}
        disabled={isSubmitting || !selectedPlayer || !selectedItem}
        className={`w-full py-3 rounded font-bold text-white transition-all ${
          isSubmitting || !selectedPlayer || !selectedItem
            ? "bg-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 active:scale-95"
        }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <span className="animate-spin mr-2">🎁</span>
            Sending...
          </span>
        ) : (
          <span>
            🎁 Send Item to {selectedPlayer ? getPlayerName(selectedPlayer) : "Player"}
          </span>
        )}
      </button>

      {/* Info */}
      <div className="bg-purple-900 bg-opacity-30 border border-purple-700 rounded p-3">
        <div className="text-purple-200 text-xs">
          <div className="font-bold mb-1">💡 About Items</div>
          <ul className="list-disc list-inside space-y-1 text-purple-300">
            <li>Items are sent immediately to players</li>
            <li>Each item costs Arena Coins</li>
            <li>Some items are only available for specific players</li>
            <li>Items can give buffs, weapons, or special abilities</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        /* Custom scrollbar */
        .item-shop-panel div::-webkit-scrollbar {
          width: 6px;
        }

        .item-shop-panel div::-webkit-scrollbar-track {
          background: #1a202c;
        }

        .item-shop-panel div::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }

        .item-shop-panel div::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}

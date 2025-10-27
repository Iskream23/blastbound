"use client";

import { useEffect, useState, useCallback } from "react";
import { getArenaService, GameState } from "../../lib/arenaGameService";
import { GameViewer } from "./GameViewer";
import { InteractionSidebar } from "./InteractionSidebar";
import { PlayerStatsPanel } from "./PlayerStatsPanel";
import { LiveEventFeed } from "./LiveEventFeed";
import { authService } from "../_lib/authService";

interface WatchScreenProps {
  gameId: string | null;
}

export interface LiveEvent {
  id: string;
  type: "boost" | "item_drop" | "event" | "system" | "game_event";
  timestamp: number;
  message: string;
  data?: any;
}

export function WatchScreen({ gameId: initialGameId }: WatchScreenProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([]);

  // Add live event to feed
  const addLiveEvent = useCallback((event: LiveEvent) => {
    setLiveEvents((prev) => [event, ...prev].slice(0, 100)); // Keep last 100 events
  }, []);

  // Initialize or join existing game (only runs once on mount)
  useEffect(() => {
    let isMounted = true;

    const initializeGame = async () => {
      if (!isMounted) return;

      setIsLoading(true);
      setError(null);

      try {
        // Get user from authService
        let user = authService.getUser();

        if (!user) {
          // Try to fetch profile
          const profileResult = await authService.getProfile();
          if (!profileResult.success || !profileResult.data.profile) {
            if (isMounted) {
              setError("Please login to watch games");
              setIsLoading(false);
            }
            return;
          }
          user = profileResult.data.profile;
        }

        const arenaService = getArenaService();
        const token = authService.getAccessToken();

        if (!token) {
          if (isMounted) {
            setError("Authentication token not found");
            setIsLoading(false);
          }
          return;
        }

        let result;
        const gameIdToJoin = initialGameId;

        if (gameIdToJoin) {
          // Join existing game
          console.log("Joining existing game:", gameIdToJoin);
          result = await arenaService.getGameDetails(gameIdToJoin);
        } else {
          // Create new game
          console.log("Creating new game...");
          // const streamUrl = `https://twitch.tv/${user.username}`;
          const streamUrl = `https://www.twitch.tv/lizabaktt`;
          result = await arenaService.initializeGame(streamUrl, token);
        }

        if (!isMounted) return;

        if (result.success && result.data) {
          setGameState(result.data);
          setIsConnected(true);

          addLiveEvent({
            id: Date.now().toString(),
            type: "system",
            timestamp: Date.now(),
            message: gameIdToJoin
              ? `Joined game ${gameIdToJoin}`
              : `Created new game ${result.data.gameId}`,
          });

          console.log("Game initialized successfully:", result.data.gameId);
        } else {
          setError(result.error || "Failed to initialize game");
          console.error("Failed to initialize game:", result.error);
        }
      } catch (err) {
        console.error("Failed to initialize game:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to initialize game");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initializeGame();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Setup Arena event listeners
  useEffect(() => {
    const arenaService = getArenaService();

    // Arena lifecycle events
    arenaService.onArenaCountdownStarted = (data) => {
      addLiveEvent({
        id: Date.now().toString(),
        type: "game_event",
        timestamp: Date.now(),
        message: `Arena countdown started! Game begins in ${data.countdown}s`,
        data,
      });
    };

    arenaService.onArenaBegins = (data) => {
      addLiveEvent({
        id: Date.now().toString(),
        type: "game_event",
        timestamp: Date.now(),
        message: "Arena has begun! Good luck!",
        data,
      });
    };

    // Player boost events
    arenaService.onPlayerBoostActivated = (data) => {
      addLiveEvent({
        id: Date.now().toString(),
        type: "boost",
        timestamp: Date.now(),
        message: `${data.boosterUsername} boosted ${data.playerName} with ${data.boostAmount} points!`,
        data,
      });
    };

    // Item drop events
    arenaService.onImmediateItemDrop = (data) => {
      addLiveEvent({
        id: Date.now().toString(),
        type: "item_drop",
        timestamp: Date.now(),
        message: `${data.purchaserUsername} sent ${data.itemName} to ${data.targetPlayerName}!`,
        data,
      });
    };

    arenaService.onPackageDrop = (data) => {
      addLiveEvent({
        id: Date.now().toString(),
        type: "item_drop",
        timestamp: Date.now(),
        message: `Package dropped! Cycle ${data.currentCycle}`,
        data,
      });
    };

    // Event triggers
    arenaService.onEventTriggered = (data) => {
      addLiveEvent({
        id: Date.now().toString(),
        type: "event",
        timestamp: Date.now(),
        message: data.isFinal
          ? `FINAL EVENT: ${data.eventName} - Game will end!`
          : `Event triggered: ${data.eventName}`,
        data,
      });
    };

    // Game completion
    arenaService.onGameCompleted = (data) => {
      addLiveEvent({
        id: Date.now().toString(),
        type: "game_event",
        timestamp: Date.now(),
        message: `Game completed! Winner: ${data.winner || "Unknown"}`,
        data,
      });
    };

    return () => {
      // Clean up event handlers
      arenaService.onArenaCountdownStarted = undefined;
      arenaService.onArenaBegins = undefined;
      arenaService.onPlayerBoostActivated = undefined;
      arenaService.onImmediateItemDrop = undefined;
      arenaService.onPackageDrop = undefined;
      arenaService.onEventTriggered = undefined;
      arenaService.onGameCompleted = undefined;
    };
  }, [addLiveEvent]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading game...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error</div>
          <div className="text-white">{error}</div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">No game state available</div>
      </div>
    );
  }

  return (
    <div className="watch-screen-container">
      {/* Main Layout */}
      <div className="flex h-screen bg-gray-900">
        {/* Left - Game Viewer */}
        <div className="flex-1 flex flex-col">
          {/* Game Canvas/Stream */}
          <div className="flex-1 bg-black relative">
            <GameViewer gameState={gameState} />
          </div>

          {/* Player Stats Bar */}
          <div className="bg-gray-800 border-t border-gray-700">
            <PlayerStatsPanel gameState={gameState} />
          </div>
        </div>

        {/* Right - Interaction Sidebar */}
        <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
          {/* Stream Info Header */}
          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-bold text-lg">
                {gameState?.evaGameDetails?.appName}
              </h2>
              <div
                className={`px-2 py-1 rounded text-xs font-bold ${
                  gameState.status === "active"
                    ? "bg-red-600 text-white"
                    : "bg-gray-600 text-gray-300"
                }`}
              >
                {gameState?.status === "active" ? "LIVE" : gameState?.status}
              </div>
            </div>
            <div className="text-gray-400 text-sm">
              Game ID: {gameState.gameId}
            </div>
            <div className="text-gray-400 text-xs mt-1">
              {isConnected ? (
                <span className="text-green-500">Connected</span>
              ) : (
                <span className="text-red-500">Disconnected</span>
              )}
            </div>
          </div>

          {/* Live Events Feed */}
          <div className="flex-1 overflow-hidden">
            <LiveEventFeed events={liveEvents} />
          </div>

          {/* Interaction Panel */}
          <div className="border-t border-gray-700">
            <InteractionSidebar gameState={gameState} onEventCreated={addLiveEvent} />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { GameState } from "../../lib/arenaGameService";
import { BoostPanel } from "./BoostPanel";
import { ItemShopPanel } from "./ItemShopPanel";
import { LiveEvent } from "./WatchScreen";

interface InteractionSidebarProps {
  gameState: GameState;
  onEventCreated: (event: LiveEvent) => void;
}

type TabType = "boost" | "items" | "chat";

export function InteractionSidebar({ gameState, onEventCreated }: InteractionSidebarProps) {
  const [activeTab, setActiveTab] = useState<TabType>("boost");

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "boost", label: "Boost", icon: "⚡" },
    { id: "items", label: "Items", icon: "🎁" },
    { id: "chat", label: "Chat", icon: "💬" },
  ];

  return (
    <div className="interaction-sidebar h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-gray-700 text-white border-b-2 border-purple-500"
                : "text-gray-400 hover:text-white hover:bg-gray-750"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "boost" && (
          <BoostPanel gameState={gameState} onEventCreated={onEventCreated} />
        )}

        {activeTab === "items" && (
          <ItemShopPanel gameState={gameState} onEventCreated={onEventCreated} />
        )}

        {activeTab === "chat" && (
          <div className="p-4 text-center text-gray-400">
            <div className="text-4xl mb-2">💬</div>
            <div className="text-sm">Chat coming soon!</div>
            <div className="text-xs mt-2">
              Real-time chat with other viewers
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .bg-gray-750 {
          background-color: #2d3748;
        }

        /* Custom scrollbar */
        .interaction-sidebar > div::-webkit-scrollbar {
          width: 6px;
        }

        .interaction-sidebar > div::-webkit-scrollbar-track {
          background: #1a202c;
        }

        .interaction-sidebar > div::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }

        .interaction-sidebar > div::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}

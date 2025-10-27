"use client";

import { useEffect, useRef } from "react";
import { LiveEvent } from "./WatchScreen";

interface LiveEventFeedProps {
  events: LiveEvent[];
}

export function LiveEventFeed({ events }: LiveEventFeedProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0; // Scroll to top since we're prepending
    }
  }, [events]);

  const getEventIcon = (type: LiveEvent["type"]) => {
    switch (type) {
      case "boost":
        return "⚡";
      case "item_drop":
        return "🎁";
      case "event":
        return "🎯";
      case "game_event":
        return "🎮";
      case "system":
        return "ℹ️";
      default:
        return "•";
    }
  };

  const getEventColor = (type: LiveEvent["type"]) => {
    switch (type) {
      case "boost":
        return "text-yellow-400";
      case "item_drop":
        return "text-purple-400";
      case "event":
        return "text-red-400";
      case "game_event":
        return "text-blue-400";
      case "system":
        return "text-gray-400";
      default:
        return "text-white";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="live-event-feed h-full flex flex-col bg-gray-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-white font-semibold text-sm">LIVE EVENTS</h3>
        <div className="text-gray-400 text-xs mt-1">
          {events.length} event{events.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Events List */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-2 py-2 space-y-2"
        style={{ scrollBehavior: "smooth" }}
      >
        {events.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-500 text-sm">No events yet</div>
            <div className="text-gray-600 text-xs mt-1">
              Events will appear here when they happen
            </div>
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="event-item bg-gray-800 rounded p-3 hover:bg-gray-750 transition-colors animate-fade-in"
            >
              <div className="flex items-start gap-2">
                <div className={`text-lg ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm ${getEventColor(event.type)} font-medium`}>
                    {event.message}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatTime(event.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .bg-gray-750 {
          background-color: #2d3748;
        }

        /* Custom scrollbar */
        .live-event-feed div::-webkit-scrollbar {
          width: 6px;
        }

        .live-event-feed div::-webkit-scrollbar-track {
          background: #1a202c;
        }

        .live-event-feed div::-webkit-scrollbar-thumb {
          background: #4a5568;
          border-radius: 3px;
        }

        .live-event-feed div::-webkit-scrollbar-thumb:hover {
          background: #718096;
        }
      `}</style>
    </div>
  );
}

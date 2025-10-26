# VORLD Arena - Quick Reference Card

## 🚀 Quick Start

### Start Game with Arena
```typescript
const config: ArenaConfig = {
  gameId: "game_abc123",
  streamUrl: "https://twitch.tv/stream",
  websocketUrl: "wss://vorld-arena-server.onrender.com",
  token: "jwt_token_here",
  appId: "app_mgp47brw_475f5e06",
  arenaGameId: "arcade_mgyo9bv7_c8081d4f"
};

this.scene.start("Game", { levelId: 1, arenaConfig: config });
```

### Start Without Arena (Standalone)
```typescript
this.scene.start("Game", { levelId: 1 });
```

## 📋 Boost Effects

| Amount | Effect | Duration |
|--------|--------|----------|
| 25 | Speed +50% | 10s |
| 50 | Rapid Fire | 15s |
| 100 | +1 Bomb | 20s |
| 500 | +1 Range | 15s |
| 5000 | Invincibility | 10s |

## 🎁 Item Types

| Type | Color | Effect |
|------|-------|--------|
| Health | Red | Healing |
| Bomb Power | Orange | Power up |
| Speed | Green | Speed up |
| Shield | Blue | Protection |
| Score | Yellow | Points |
| Mystery | Purple | Random |

## 🎚️ Difficulty Modes

| Mode | Enemy Speed | Enemy Count |
|------|-------------|-------------|
| Easy | 0.7x | 0.5x |
| Normal | 1.0x | 1.0x |
| Hard | 1.5x | 1.5x |
| Extreme | 2.0x | 2.5x |

## 🔌 WebSocket Events

### Listening For
- `player_boost_activated` → Apply boost
- `immediate_item_drop` → Spawn item
- `event_triggered` → Change difficulty
- `arena_begins` → Start tracking
- `arena_ends` → End session
- `game_completed` → Show results

### Emitting To
- `join_game` → Join room on connect
- (API calls for boost/items/events)

## 🎮 Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| ArenaIntegrationService | `services/` | WebSocket & API |
| BoostManager | `managers/` | Player boosts |
| ItemDropManager | `managers/` | Item pickups |
| DifficultyManager | `managers/` | Difficulty control |
| ArenaUI | `ui/` | Status display |

## 📡 API Endpoints

```typescript
POST   /api/arena/init                     // Start game
GET    /api/arena/game/:gameId             // Get state
POST   /api/arena/boost/:gameId/:playerId  // Send boost
POST   /api/arena/items/drop/:gameId       // Drop item
GET    /api/arena/items/catalog            // List items
GET    /api/arena/status                   // Check status
```

## 🧪 Testing Commands

### Browser Console
```javascript
// Get game scene
const g = game.scene.scenes[0];

// Test boost
g.boostManager?.applyBoost({
  boosterUsername: "Test", playerName: "P1",
  playerId: "test", boostAmount: 100, timestamp: Date.now()
});

// Test item
g.itemDropManager?.spawnItem({
  itemId: "test", itemName: "Test Item",
  targetPlayer: "test", targetPlayerName: "P1",
  purchaserUsername: "Test", cost: 50,
  effects: { stats: [] }
});

// Test difficulty
g.difficultyManager?.applyDifficultyEvent({
  eventId: "test", eventName: "spawn enemies", isFinal: false
});

// Check connection
g.arenaService?.isConnectedToArena();
```

## 🐛 Debug Logs

All systems log with prefixes:
- `[Arena]` - Integration service
- `[BoostManager]` - Boosts
- `[ItemDropManager]` - Items
- `[DifficultyManager]` - Difficulty
- `[Game]` - Scene lifecycle

## ⚙️ Configuration

### Environment Variables
```env
VORLD_APP_ID=app_mgp47brw_475f5e06
ARENA_GAME_ID=arcade_mgyo9bv7_c8081d4f
ARENA_SERVER_URL=wss://vorld-arena-server.onrender.com
GAME_API_URL=https://arena.vorld.com/api
```

### Demo Client URLs
```
Base URL: http://localhost:4000
Auth URL: https://vorld-auth.onrender.com
WebSocket: wss://vorld-arena-server.onrender.com
```

## 🎨 Customization

### Add Custom Boost
```typescript
// In BoostManager.ts
export enum BoostType {
  YOUR_BOOST = "your_boost"
}

private determineBoostType(amount: number): BoostType {
  if (amount >= 1000) return BoostType.YOUR_BOOST;
}

private applyYourBoost(): void {
  // Your logic
}
```

### Add Custom Item
```typescript
// In ItemDropManager.ts
export enum ItemType {
  YOUR_ITEM = "your_item"
}

private determineItemType(drop: ItemDropEvent): ItemType {
  if (drop.itemName.includes("custom")) {
    return ItemType.YOUR_ITEM;
  }
}
```

### Add Custom Difficulty Event
```typescript
// In DifficultyManager.ts
public applyDifficultyEvent(event: DifficultyEvent): void {
  if (event.eventName.includes("custom")) {
    this.customDifficultyLogic();
  }
}
```

## 📊 UI Positions

```
Top-Left:       Connection Status + Game ID
Top-Right:      Active Boosts (with timers)
Bottom-Left:    Metrics (kills, crates, time)
Center:         Notifications (temporary)
```

## 🔒 Security

- JWT required for all API calls
- WebSocket auth with token + gameId
- Rate limiting on endpoints
- Server-side validation

## 📦 Dependencies

```json
{
  "socket.io-client": "4.7.4",
  "phaser": "3.90.0",
  "typescript": "5.7.2"
}
```

## 🚨 Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Arena not initialized" | Missing config | Pass arenaConfig to scene |
| "WebSocket failed" | Bad URL/token | Check credentials |
| "Boost not applying" | Manager null | Ensure Arena enabled |
| "Item not spawning" | Invalid position | Check level grid |

## ✅ Verification Checklist

- [ ] Socket.io-client installed
- [ ] All files in place
- [ ] Environment configured
- [ ] TypeScript compiles
- [ ] Standalone mode works
- [ ] WebSocket connects
- [ ] Boosts apply correctly
- [ ] Items spawn properly
- [ ] Difficulty changes work
- [ ] UI displays metrics

## 📚 Documentation Files

1. **INSTALLATION.md** - Setup guide
2. **ARENA_INTEGRATION.md** - Full features
3. **INTEGRATION_SUMMARY.md** - Overview
4. **QUICK_REFERENCE.md** - This file
5. **ArenaGameExample.ts** - Code examples

## 🎯 Key Files

```
src/game/
├── services/ArenaIntegrationService.ts  (447 lines)
├── managers/BoostManager.ts            (341 lines)
├── managers/ItemDropManager.ts         (454 lines)
├── managers/DifficultyManager.ts       (406 lines)
├── ui/ArenaUI.ts                       (363 lines)
└── scenes/Game.ts                      (Updated +172)
```

## 💡 Pro Tips

1. **Test standalone first** - Ensure game works without Arena
2. **Use demo client** - Test all features before production
3. **Check console logs** - All systems log debug info
4. **Monitor performance** - Watch memory and CPU usage
5. **Start simple** - Add custom features gradually

## 🔗 Quick Links

- Demo Client: `index.html`
- Examples: `src/game/examples/ArenaGameExample.ts`
- Main Integration: `src/game/scenes/Game.ts`
- Docs: `ARENA_INTEGRATION.md`

---

**Ready to go!** This reference card covers 90% of common use cases.

For detailed info, see **ARENA_INTEGRATION.md**

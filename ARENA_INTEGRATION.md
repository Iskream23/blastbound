# VORLD Arena Integration Guide

## Overview

Your Blastbound game now has full VORLD Arena integration, enabling interactive features like:
- **Player Boosts** - Viewers can boost player abilities (speed, bombs, invincibility, etc.)
- **Item Drops** - Send gifts/power-ups to players during gameplay
- **Difficulty Control** - Dynamically adjust game difficulty based on Arena events
- **Real-time Metrics** - Track and display player stats (kills, crates destroyed, survival time)

## Architecture

### Core Components

1. **ArenaIntegrationService** (`src/game/services/ArenaIntegrationService.ts`)
   - Manages WebSocket connection to VORLD Arena server
   - Handles all Arena events (boosts, items, difficulty changes)
   - Provides API methods for game-to-Arena communication

2. **BoostManager** (`src/game/managers/BoostManager.ts`)
   - Applies player boosts from Arena events
   - Manages boost duration and effects
   - Supports: Speed, Bombs, Explosion Range, Invincibility, Rapid Fire

3. **ItemDropManager** (`src/game/managers/ItemDropManager.ts`)
   - Spawns item pickups on the game map
   - Handles item collection and effects
   - Visual feedback with particles and animations

4. **DifficultyManager** (`src/game/managers/DifficultyManager.ts`)
   - Adjusts game difficulty based on Arena events
   - Controls enemy count and speed
   - Supports: Easy, Normal, Hard, Extreme modes

5. **ArenaUI** (`src/game/ui/ArenaUI.ts`)
   - Displays Arena connection status
   - Shows active boosts with timers
   - Tracks game metrics (kills, crates, time)

## How to Use

### Starting an Arena Game

To start the game with Arena integration, pass an `arenaConfig` object to the Game scene:

```typescript
import { ArenaConfig } from "./game/services/ArenaIntegrationService";

// Example: Initialize Arena game
const arenaConfig: ArenaConfig = {
  gameId: "game_abc123",
  streamUrl: "https://twitch.tv/yourstream",
  websocketUrl: "wss://vorld-arena-server.onrender.com",
  token: "your_jwt_token",
  appId: "app_mgp47brw_475f5e06",
  arenaGameId: "arcade_mgyo9bv7_c8081d4f"
};

// Start game with Arena config
this.scene.start("Game", { levelId: 1, arenaConfig });
```

### Arena Events

The game automatically handles these Arena WebSocket events:

#### Player Boost Events
```typescript
// Event: player_boost_activated
{
  boosterUsername: "viewer123",
  playerName: "Player1",
  playerId: "player_id",
  boostAmount: 100  // 25, 50, 100, 500, or 5000
}
```

**Boost Effects by Amount:**
- **25 points** → Speed Boost (50% faster, 10s)
- **50 points** → Rapid Fire (faster bombs, 15s)
- **100 points** → More Bombs (+1 bomb capacity, 20s)
- **500 points** → Explosion Range (+1 range, 15s)
- **5000 points** → Invincibility (yellow glow, 10s)

#### Item Drop Events
```typescript
// Event: immediate_item_drop
{
  itemId: "item_health_01",
  itemName: "Health Potion",
  targetPlayer: "player_id",
  purchaserUsername: "viewer456",
  cost: 50,
  effects: {
    stats: [
      { name: "health", currentValue: 20, maxValue: 100 }
    ]
  }
}
```

**Item Types:**
- Health (red) - Healing effects
- Bomb Power (orange) - Increase bomb power
- Speed (green) - Speed boost
- Shield (blue) - Protection
- Score (yellow) - Score bonus
- Mystery (purple) - Random effect

#### Difficulty Events
```typescript
// Event: event_triggered
{
  eventId: "event_spawn_enemies",
  eventName: "Spawn Extra Enemies",
  targetPlayer: "player_id",
  isFinal: false  // true = game-ending event
}
```

**Difficulty Effects:**
- "easy" / "slow" → Easy Mode (slower, fewer enemies)
- "hard" / "fast" → Hard Mode (faster, more enemies)
- "extreme" / "chaos" → Extreme Mode (very fast, many enemies)
- "spawn" / "add" → Spawn 2 extra enemies
- "remove" / "clear" → Remove 2 random enemies
- "reset" → Back to Normal Mode

### Using the Demo Client

Use the provided demo client (index.html) to test Arena features:

1. **Configure Settings:**
   ```
   Base URL: http://localhost:4000 (your server)
   Auth URL: https://vorld-auth.onrender.com
   Email: your@email.com
   Password: your_password
   Arena Game ID: arcade_mgyo9bv7_c8081d4f
   ```

2. **Login & Get Token:**
   - Click "Login & Get Token"
   - JWT token will be saved automatically

3. **Initialize Game:**
   - Enter streamer URL: `https://twitch.tv/yourstream`
   - Click "Initialize Game"
   - Game ID and WebSocket URL will be saved

4. **Connect WebSocket:**
   - Click "Connect WebSocket"
   - Status indicator turns green when connected

5. **Send Boosts:**
   - Enter username (viewer name)
   - Select boost amount
   - Click "Boost Astrokidz" or "Boost Aquaticans"
   - Boost will appear in game!

6. **Drop Items:**
   - Select target player
   - Click on package button
   - Item spawns on map near player

7. **Trigger Events:**
   - Select target player (optional)
   - Click event button
   - Difficulty changes in game

## API Endpoints

Your server should expose these endpoints for Arena integration:

### Game Management
- `POST /api/arena/init` - Initialize Arena game session
- `GET /api/arena/game/:gameId` - Get game details
- `GET /api/arena/state` - Get current game state

### Interactive Features
- `POST /api/arena/boost/:gameId/:playerId` - Send player boost
- `POST /api/arena/items/drop/:gameId` - Drop item to player
- `PUT /api/arena/stream-url/:gameId` - Update stream URL

### Data Queries
- `GET /api/arena/items/catalog` - List available items
- `GET /api/arena/status` - Connection status

## Game Integration Flow

```
1. User starts game from profile page
   ↓
2. Frontend calls /api/arena/init
   - Receives gameId, websocketUrl, token
   ↓
3. Pass arenaConfig to Game scene
   - Game scene initializes Arena services
   ↓
4. ArenaIntegrationService connects to WebSocket
   - Joins game room
   - Starts listening for events
   ↓
5. During gameplay:
   - Viewers send boosts → BoostManager applies effects
   - Viewers drop items → ItemDropManager spawns pickups
   - Events trigger → DifficultyManager adjusts game
   ↓
6. Game over:
   - Final metrics reported to Arena
   - WebSocket disconnects
   - Resources cleaned up
```

## Customization

### Adding Custom Boost Types

Edit `src/game/managers/BoostManager.ts`:

```typescript
export enum BoostType {
  SPEED = "speed",
  BOMBS = "bombs",
  // Add your custom boost:
  MEGA_EXPLOSION = "mega_explosion",
}

private determineBoostType(amount: number): BoostType {
  if (amount >= 1000) {
    return BoostType.MEGA_EXPLOSION;
  }
  // ... rest of logic
}
```

### Adding Custom Item Types

Edit `src/game/managers/ItemDropManager.ts`:

```typescript
export enum ItemType {
  HEALTH = "health",
  // Add your custom item:
  TELEPORT = "teleport",
}

private determineItemType(drop: ItemDropEvent): ItemType {
  const itemName = drop.itemName.toLowerCase();

  if (itemName.includes("teleport")) {
    return ItemType.TELEPORT;
  }
  // ... rest of logic
}
```

### Adding Custom Difficulty Events

Edit `src/game/managers/DifficultyManager.ts`:

```typescript
public applyDifficultyEvent(event: DifficultyEvent): void {
  const eventName = event.eventName.toLowerCase();

  if (eventName.includes("boss")) {
    this.spawnBoss();
  } else if (eventName.includes("freeze")) {
    this.freezeAllEnemies();
  }
  // ... rest of logic
}
```

### Customizing UI

Edit `src/game/ui/ArenaUI.ts`:

```typescript
// Change UI position
this.metricsContainer = this.scene.add.container(
  10,
  this.scene.scale.height - 60  // Bottom-left
);

// Change boost colors
private getBoostColor(type: string): number {
  const colors: Record<string, number> = {
    speed: 0x00ff00,      // Green
    bombs: 0xff9900,      // Orange
    // Add your colors
  };
  return colors[type] || 0xffffff;
}
```

## Debugging

### Enable Debug Logs

All systems log to console with prefixes:
- `[Arena]` - ArenaIntegrationService
- `[BoostManager]` - Boost system
- `[ItemDropManager]` - Item drops
- `[DifficultyManager]` - Difficulty changes
- `[Game]` - Game scene

### Check Connection Status

Press "Check Connection Status" button in demo client to see:
- WebSocket connection state
- Socket ID
- Active event listeners
- Game room membership
- Authentication status

### Common Issues

**"Arena not initialized" error:**
- Ensure arenaConfig is passed to Game scene init
- Check that all required fields are present in config

**"WebSocket connection failed":**
- Verify websocketUrl is correct
- Check that token is valid (not expired)
- Ensure gameId exists on server

**"Boost not applying":**
- Check console for BoostManager logs
- Verify boost event data format
- Ensure player object exists

**"Items not spawning":**
- Check ItemDropManager logs
- Verify level grid has empty spaces
- Ensure item drop event has required fields

## Testing Without Server

You can test Arena features offline by manually triggering events:

```typescript
// In browser console:

// Test boost
game.scene.scenes[0].boostManager?.applyBoost({
  boosterUsername: "TestUser",
  playerName: "Player1",
  playerId: "test",
  boostAmount: 100,
  timestamp: Date.now()
});

// Test item drop
game.scene.scenes[0].itemDropManager?.spawnItem({
  itemId: "test_item",
  itemName: "Test Item",
  targetPlayer: "test",
  targetPlayerName: "Player1",
  purchaserUsername: "TestUser",
  cost: 50,
  effects: { stats: [] }
});

// Test difficulty event
game.scene.scenes[0].difficultyManager?.applyDifficultyEvent({
  eventId: "test_event",
  eventName: "spawn enemies",
  isFinal: false
});
```

## Performance Considerations

- **WebSocket Reconnection:** Automatically retries up to 10 times
- **Boost Stacking:** Same-type boosts replace each other (no stacking)
- **Item Cleanup:** Items auto-remove after 30 seconds if not collected
- **Particle Effects:** Limited to prevent performance issues

## Security

- All Arena API calls require JWT authentication
- WebSocket connections authenticated with token + gameId
- Arena Game ID validated server-side
- Rate limiting on boost/item endpoints

## Next Steps

1. **Add more boost types** - Create custom power-ups
2. **Implement health system** - Make health items functional
3. **Add boss battles** - Trigger via difficulty events
4. **Create power-up combos** - Stack compatible boosts
5. **Add Arena leaderboards** - Track top performers
6. **Implement replay system** - Record Arena games

## Support

For issues or questions:
- Check console logs for debug information
- Review demo client for working examples
- Test with dummy client first before production
- Verify Arena server is running and accessible

## Credits

Built with:
- Phaser 3.90.0 - Game engine
- Socket.io 4.7.4 - WebSocket client
- VORLD Arena API - Interactive features

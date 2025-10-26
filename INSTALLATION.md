# VORLD Arena Integration - Installation Guide

## Prerequisites

Before installing the Arena integration, ensure you have:

- [x] Node.js 18+ installed
- [x] npm or yarn package manager
- [x] TypeScript 5.7+
- [x] Phaser 3.90.0
- [x] VORLD account with API credentials

## Installation Steps

### 1. Install Required Dependencies

The Arena integration requires Socket.io client for WebSocket connections:

```bash
npm install socket.io-client@4.7.4
```

Or with yarn:

```bash
yarn add socket.io-client@4.7.4
```

### 2. Verify File Structure

Check that all Arena files are in place:

```
src/game/
├── services/
│   └── ArenaIntegrationService.ts   ✓ Created
├── managers/
│   ├── BoostManager.ts              ✓ Created
│   ├── ItemDropManager.ts           ✓ Created
│   └── DifficultyManager.ts         ✓ Created
├── ui/
│   └── ArenaUI.ts                   ✓ Created
├── scenes/
│   └── Game.ts                      ✓ Updated
└── examples/
    └── ArenaGameExample.ts          ✓ Created
```

### 3. Configure Environment Variables

Create or update your `.env` file:

```env
# VORLD Arena Configuration
VORLD_APP_ID=app_mgp47brw_475f5e06
ARENA_GAME_ID=arcade_mgyo9bv7_c8081d4f
ARENA_SERVER_URL=wss://vorld-arena-server.onrender.com
GAME_API_URL=https://arena.vorld.com/api

# Development
NODE_ENV=development
PORT=4000

# Optional: Custom WebSocket URL for local testing
# ARENA_WS_URL=ws://localhost:3000
```

### 4. Update TypeScript Configuration

Ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM"],
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": [
    "src/**/*"
  ]
}
```

### 5. Build the Project

```bash
npm run build
```

Or for development:

```bash
npm run dev
```

### 6. Verify Installation

Run the type checker:

```bash
npx tsc --noEmit
```

Should show no errors if everything is installed correctly.

## Testing the Installation

### Quick Test (Standalone Mode)

Test that the game still works without Arena:

```typescript
// In your game initialization
this.scene.start("Game", {
  levelId: 1,
  // No arenaConfig = standalone mode
});
```

### Full Test (Arena Mode)

1. **Start the demo client:**
   - Open `index.html` in your browser
   - Configure base URL and auth settings
   - Login to get JWT token

2. **Initialize Arena game:**
   - Enter streamer URL
   - Click "Initialize Game"
   - Wait for game ID and WebSocket URL

3. **Connect WebSocket:**
   - Click "Connect WebSocket"
   - Status should turn green

4. **Test features:**
   - Send a boost → Should see effect in game
   - Drop an item → Should spawn on map
   - Trigger event → Should change difficulty

### Console Test

Open browser console and run:

```javascript
// Should see Arena service
console.log(game.scene.scenes[0].arenaService);

// Should show connection status
game.scene.scenes[0].arenaService?.isConnectedToArena();
```

## Troubleshooting

### Common Issues

#### 1. "Cannot find module 'socket.io-client'"

**Solution:**
```bash
npm install socket.io-client@4.7.4
```

#### 2. TypeScript errors about missing types

**Solution:**
```bash
npm install --save-dev @types/node
```

#### 3. "Arena not initialized" in console

**Solution:**
- Ensure `arenaConfig` is passed to Game scene
- Check that config has all required fields:
  - gameId
  - streamUrl
  - websocketUrl
  - token
  - appId
  - arenaGameId

#### 4. WebSocket connection fails

**Possible causes:**
- Invalid JWT token (expired or malformed)
- Incorrect WebSocket URL
- Network/firewall blocking WebSocket connections
- Game ID doesn't exist on server

**Debug steps:**
1. Check console for `[Arena]` logs
2. Verify token in localStorage: `localStorage.getItem("jwtToken")`
3. Test WebSocket URL manually with Socket.io client
4. Check server logs for connection attempts

#### 5. Boosts/Items not appearing

**Check:**
- Is WebSocket connected? (Green indicator in UI)
- Are events being received? (Check console for `[Arena]` logs)
- Is game scene initialized with Arena enabled?
- Are managers created? `console.log(gameScene.boostManager)`

### Debug Mode

Enable verbose logging:

```typescript
// In ArenaIntegrationService.ts, add:
private debug = true;

// Then add to each event handler:
if (this.debug) {
  console.log("[Arena] Event received:", eventName, data);
}
```

## Server Setup (If Running Your Own)

### Backend Requirements

Your server needs these endpoints:

```typescript
// Arena endpoints
POST   /api/arena/init                    // Initialize game
GET    /api/arena/game/:gameId            // Get game state
POST   /api/arena/boost/:gameId/:playerId // Send boost
POST   /api/arena/items/drop/:gameId      // Drop item
GET    /api/arena/items/catalog           // List items
```

### Example Server Setup

```bash
# Clone or create server project
cd server/

# Install dependencies
npm install express socket.io cors dotenv

# Create .env
cat > .env << EOF
PORT=4000
VORLD_APP_ID=app_mgp47brw_475f5e06
ARENA_GAME_ID=arcade_mgyo9bv7_c8081d4f
ARENA_SERVER_URL=wss://vorld-arena-server.onrender.com
EOF

# Start server
npm start
```

## Production Deployment

### 1. Build for Production

```bash
npm run build
```

### 2. Environment Configuration

Update `.env` for production:

```env
NODE_ENV=production
VORLD_APP_ID=your_production_app_id
ARENA_GAME_ID=your_production_game_id
ARENA_SERVER_URL=wss://vorld-arena-server.onrender.com
```

### 3. Deploy Client

Deploy the built files to your hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### 4. Configure CORS

Ensure your server allows requests from your game domain:

```typescript
app.use(cors({
  origin: [
    'https://yourgame.com',
    'http://localhost:3000' // For local testing
  ],
  credentials: true
}));
```

### 5. SSL/TLS

Ensure WebSocket connections use WSS (secure) in production:

```typescript
const websocketUrl = process.env.NODE_ENV === 'production'
  ? 'wss://vorld-arena-server.onrender.com'
  : 'ws://localhost:3000';
```

## Performance Optimization

### 1. Lazy Loading

Only load Arena services when needed:

```typescript
// In Game scene
if (this.arenaEnabled) {
  const { ArenaIntegrationService } = await import('./services/ArenaIntegrationService');
  this.arenaService = new ArenaIntegrationService(this);
}
```

### 2. Asset Preloading

Preload Arena UI assets in Boot scene:

```typescript
// In Boot.ts
this.load.image('arena-ui', 'assets/arena-ui-atlas.png');
```

### 3. Memory Management

Monitor memory usage:

```typescript
// Check memory periodically
setInterval(() => {
  if (performance.memory) {
    console.log('Memory:', {
      used: Math.round(performance.memory.usedJSHeapSize / 1048576),
      total: Math.round(performance.memory.totalJSHeapSize / 1048576)
    });
  }
}, 10000);
```

## Update and Maintenance

### Updating Arena Integration

To update the Arena integration:

1. **Backup current files:**
```bash
git commit -am "Backup before Arena update"
```

2. **Pull latest changes:**
```bash
git pull origin main
```

3. **Update dependencies:**
```bash
npm install
```

4. **Test thoroughly:**
```bash
npm run dev
```

### Version Compatibility

| Arena Integration | Socket.io | Phaser | TypeScript |
|-------------------|-----------|--------|------------|
| 1.0.0 | 4.7.4 | 3.90.0 | 5.7.2 |

## Additional Resources

### Documentation
- [ARENA_INTEGRATION.md](./ARENA_INTEGRATION.md) - Full integration guide
- [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) - Feature summary
- [src/game/examples/ArenaGameExample.ts](./src/game/examples/ArenaGameExample.ts) - Code examples

### Demo Files
- [index.html](./index.html) - Demo client UI
- [index.js](./index.js) - Demo client logic
- [index.css](./index.css) - Demo client styles

### External Links
- [VORLD Documentation](https://docs.vorld.com)
- [Socket.io Documentation](https://socket.io/docs/v4/)
- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)

## Getting Help

If you need assistance:

1. **Check the logs:**
   - Browser console for client-side errors
   - Server logs for backend errors
   - Look for `[Arena]` prefixed messages

2. **Review examples:**
   - See `ArenaGameExample.ts` for working code
   - Test with demo client first
   - Compare with integration guide

3. **Common solutions:**
   - Clear browser cache
   - Restart server
   - Check environment variables
   - Verify credentials

4. **Still stuck?**
   - Check GitHub issues
   - Review VORLD documentation
   - Test with curl/Postman first
   - Simplify to minimal reproduction

## Success Checklist

✅ Socket.io-client installed
✅ All Arena files in place
✅ Environment variables configured
✅ TypeScript compiles without errors
✅ Game runs in standalone mode
✅ Demo client connects successfully
✅ Boosts appear in game
✅ Items spawn correctly
✅ Difficulty changes work
✅ UI displays properly
✅ Metrics track correctly

## Next Steps

After installation:

1. **Test thoroughly** - Use demo client to verify all features
2. **Customize** - Add your own boost types and items
3. **Style** - Adjust UI colors and positions
4. **Deploy** - Push to production
5. **Monitor** - Track usage and performance

---

**Installation complete!** Your Blastbound game is now ready for VORLD Arena integration. 🎉

Start the game with Arena mode and test with the demo client to see it in action!

import { createServer } from "node:http";
import app from "./server.js";
import { env } from "./config/env.js";

const port = env.PORT;

const httpServer = createServer(app);

httpServer.listen(port, () => {
  console.log(`🚀 Vorld auth proxy running on http://localhost:${port}`);
});

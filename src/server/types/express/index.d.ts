import type { VorldUser } from "../vorld.js";

declare global {
  namespace Express {
    interface Request {
      user?: VorldUser;
      token?: string;
    }
  }
}

export {};

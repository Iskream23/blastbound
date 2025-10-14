import { Router, type Request, type Response } from "express";
import { authenticateUser, rateLimitByUser } from "../middleware/authenticate.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get(
  "/profile",
  authenticateUser,
  rateLimitByUser(60, 10 * 60 * 1000),
  asyncHandler(async (req: Request, res: Response) => {
    // Return the user data from the token verification (already populated by middleware)
    res.json({
      success: true,
      profile: req.user,
    });
  }),
);

export const userRouter = router;

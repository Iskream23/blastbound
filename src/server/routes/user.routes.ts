import { Router, type Request, type Response } from "express";
import { authenticateUser, rateLimitByUser } from "@middleware/authenticate.js";
import { asyncHandler } from "@utils/asyncHandler.js";
import { vorldAuth } from "@services/vorldAuth.js";

const router = Router();

router.get(
  "/profile",
  authenticateUser,
  rateLimitByUser(60, 10 * 60 * 1000),
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.token!;
    const result = await vorldAuth.getUserProfile(token);

    if (!result.success) {
      return res.status(502).json(result);
    }

    res.json(result);
  }),
);

export const userRouter = router;

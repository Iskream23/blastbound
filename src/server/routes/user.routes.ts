import { Router, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { vorldAuth } from "../services/vorldAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateUser } from "../middleware/authenticate.js";

const router = Router();

router.get(
  "/profile",
  authenticateUser,
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.token;

    if (!token) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        error: "Missing authentication token",
      });
    }

    const result = await vorldAuth.getUserProfile(token);

    if (!result.success) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: result.error ?? "Failed to fetch profile",
      });
    }

    res.json({
      success: true,
      profile: result.profile,
    });
  })
);

export const userRouter = router;

import { Router, type Request, type Response } from "express";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";
import { vorldAuth } from "../services/vorldAuth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authenticateUser, rateLimitByUser } from "../middleware/authenticate.js";

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const otpSchema = z.object({
  email: z.string().email(),
  otp: z.string().min(4).max(10),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(10),
});

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = loginSchema.parse(req.body);
    const result = await vorldAuth.authenticateUser(email, password);

    if (!result.success) {
      return res.status(StatusCodes.UNAUTHORIZED).json(result);
    }

    res.json(result);
  })
);

router.post(
  "/verify-otp",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, otp } = otpSchema.parse(req.body);
    const result = await vorldAuth.verifyOTP(email, otp);

    if (!result.success) {
      return res.status(StatusCodes.UNAUTHORIZED).json(result);
    }

    res.json(result);
  })
);

router.post(
  "/refresh",
  asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = refreshSchema.parse(req.body);
    const result = await vorldAuth.refreshToken(refreshToken);

    if (!result.success) {
      return res.status(StatusCodes.UNAUTHORIZED).json(result);
    }

    res.json(result);
  })
);

router.get(
  "/verify",
  asyncHandler(async (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        valid: false,
        error: "Missing token",
      });
    }

    // Use getUserProfile to validate the token since /auth/verify doesn't exist
    const result = await vorldAuth.getUserProfile(token);

    if (!result.success) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        valid: false,
        error: result.error,
      });
    }

    // Extract user info from profile
    const profile = result.profile as any;
    res.json({
      success: true,
      valid: true,
      user: {
        id: profile.id || profile.userId,
        email: profile.email,
        role: profile.role,
      },
    });
  })
);

router.get(
  "/profile",
  authenticateUser,
  rateLimitByUser(60, 10 * 60 * 1000),
  asyncHandler(async (req: Request, res: Response) => {
    res.json({
      success: true,
      profile: req.user,
    });
  }),
);

export const authRouter = router;

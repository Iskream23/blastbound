import axios, { AxiosError } from "axios";
import { env } from "@config/env.js";
import type {
  VorldAuthResponse,
  VorldLoginResult,
  VorldOtpResult,
  VorldProfileResult,
  VorldRefreshResult,
  VorldVerifyResult,
} from "../types/vorld.js";

const httpClient = axios.create({
  baseURL: "https://auth.vorld.com",
  timeout: 8000,
});

const withHeaders = () => ({
  "X-Vorld-App-Id": env.VORLD_APP_ID,
  "X-Vorld-App-Secret": env.VORLD_APP_SECRET,
  "Content-Type": "application/json",
});

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string }>;
    return axiosError.response?.data?.message ?? fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

export class VorldAuth {
  async authenticateUser(email: string, password: string): Promise<VorldLoginResult> {
    try {
      const response = await httpClient.post<VorldAuthResponse>(
        "/api/auth/login",
        { email, password },
        { headers: withHeaders() },
      );
      return {
        success: true,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
        requiresOTP: Boolean(response.data.requiresOTP),
      };
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error, "Authentication failed"),
      };
    }
  }

  async verifyOTP(email: string, otp: string): Promise<VorldOtpResult> {
    try {
      const response = await httpClient.post<VorldAuthResponse>(
        "/api/auth/verify-otp",
        { email, otp },
        { headers: withHeaders() },
      );
      return {
        success: true,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        user: response.data.user,
      };
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error, "OTP verification failed"),
      };
    }
  }

  async refreshToken(refreshToken: string): Promise<VorldRefreshResult> {
    try {
      const response = await httpClient.post<VorldAuthResponse>(
        "/api/auth/refresh",
        { refreshToken },
        { headers: withHeaders() },
      );
      return {
        success: true,
        token: response.data.token,
        refreshToken: response.data.refreshToken,
      };
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error, "Token refresh failed"),
      };
    }
  }

  async verifyToken(token: string): Promise<VorldVerifyResult> {
    try {
      const response = await httpClient.get<VorldAuthResponse>("/api/auth/verify", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Vorld-App-Id": env.VORLD_APP_ID,
        },
      });
      return {
        success: true,
        user: response.data.user,
        valid: Boolean(response.data.valid ?? true),
      };
    } catch (error) {
      return {
        success: false,
        valid: false,
        error: extractErrorMessage(error, "Token verification failed"),
      };
    }
  }

  async getUserProfile(token: string): Promise<VorldProfileResult> {
    try {
      const response = await httpClient.get<{ profile: unknown }>("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Vorld-App-Id": env.VORLD_APP_ID,
        },
      });
      return {
        success: true,
        profile: response.data.profile,
      };
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to fetch user profile"),
      };
    }
  }

  async logout(token: string): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      await httpClient.post(
        "/api/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Vorld-App-Id": env.VORLD_APP_ID,
          },
        },
      );
      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      return {
        success: false,
        error: extractErrorMessage(error, "Logout failed"),
      };
    }
  }
}

export const vorldAuth = new VorldAuth();

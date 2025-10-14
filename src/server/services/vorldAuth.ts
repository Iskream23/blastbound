import axios, { AxiosError } from "axios";
import { env } from "../config/env.js";
import {
  VorldLoginData,
  VorldLoginResult,
  VorldLogoutData,
  VorldOtpData,
  VorldOtpResult,
  VorldProfileData,
  VorldProfileResult,
  VorldRefreshData,
  VorldRefreshResult,
  VorldResponse,
  VorldVerifyData,
  VorldVerifyResult,
} from "../types/vorld.js";
import { sha256 } from "../utils/hashPassword.js";

const httpClient = axios.create({
  baseURL: "https://vorld-auth.onrender.com/api",
  timeout: 8000,
  headers: {
    "X-Vorld-App-Id": env.VORLD_APP_ID || "app_mgp47brw_475f5e06",
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const extractErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;
    return (
      axiosError.response?.data?.error ??
      axiosError.response?.data?.message ??
      fallback
    );
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

const unwrapResponse = <TData>(
  payload: VorldResponse<TData>,
  fallback: string
): TData => {
  if (!payload?.success) {
    throw new Error(payload?.error ?? payload?.message ?? fallback);
  }

  return payload.data;
};

export class VorldAuth {
  async authenticateUser(
    email: string,
    password: string
  ): Promise<VorldLoginResult> {
    try {
      const hashPassword = await sha256(password);
      console.log(`Hash password: ${JSON.stringify(hashPassword)}`);
      const response = await httpClient.post<VorldResponse<VorldLoginData>>(
        "/auth/login",
        { email, password: hashPassword }
      );
      const data = unwrapResponse(response.data, "Authentication failed");
      return {
        success: true,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        requiresOTP: Boolean(data.requiresOTP),
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
      const response = await httpClient.post<VorldResponse<VorldOtpData>>(
        "/auth/verify-otp",
        { email, otp }
      );
      const data = unwrapResponse(response.data, "OTP verification failed");
      return {
        success: true,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
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
      const response = await httpClient.post<VorldResponse<VorldRefreshData>>(
        "/auth/refresh",
        { refreshToken }
      );
      const data = unwrapResponse(response.data, "Token refresh failed");
      return {
        success: true,
        token: data.accessToken,
        refreshToken: data.refreshToken,
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
      console.log(`[VorldAuth] Verifying token: ${token.substring(0, 20)}...`);
      const response = await httpClient.get<VorldResponse<VorldVerifyData>>(
        "/auth/verify",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`[VorldAuth] Verify response:`, response.data);
      const data = unwrapResponse(response.data, "Token verification failed");
      return {
        success: true,
        user: data.user,
        valid: Boolean(data.valid ?? true),
      };
    } catch (error) {
      console.error(`[VorldAuth] Token verification error:`, error);
      if (axios.isAxiosError(error)) {
        console.error(`[VorldAuth] Response data:`, error.response?.data);
      }
      return {
        success: false,
        valid: false,
        error: extractErrorMessage(error, "Token verification failed"),
      };
    }
  }

  async getUserProfile(token: string): Promise<VorldProfileResult> {
    try {
      console.log(`[VorldAuth] Fetching profile with token: ${token.substring(0, 20)}...`);
      const response = await httpClient.get<VorldResponse<VorldProfileData>>(
        "/user/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`[VorldAuth] Profile response:`, response.data);
      const data = unwrapResponse(
        response.data,
        "Failed to fetch user profile"
      );
      return {
        success: true,
        profile: data.profile,
      };
    } catch (error) {
      console.error(`[VorldAuth] Profile fetch error:`, error);
      if (axios.isAxiosError(error)) {
        console.error(`[VorldAuth] Response data:`, error.response?.data);
      }
      return {
        success: false,
        error: extractErrorMessage(error, "Failed to fetch user profile"),
      };
    }
  }

  async logout(
    token: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const response = await httpClient.post<VorldResponse<VorldLogoutData>>(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = unwrapResponse(response.data, "Logout failed");
      return {
        success: true,
        message: data.message ?? "Logged out successfully",
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

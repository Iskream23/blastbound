"use client";

import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000";
const VORLD_BASE_URL = process.env.NEXT_PUBLIC_VORLD_SERVER_URL ?? "http://localhost:4000";
const TOKEN_KEY = "vorld_access_token";
const REFRESH_TOKEN_KEY = "vorld_refresh_token";
const VORD_APP_ID = process.env.NEXT_PUBLIC_VORLD_APP_ID || "";

export type VorldUser = {
  id: string;
  email: string;
  username: string;
  verified: boolean;
  authMethods?: string[];
  totalConnectedAccounts?: number;
  states?: {
    developer?: string;
    gameDeveloper?: string;
  };
  createdAt?: string;
  lastLogin?: string;
  [key: string]: unknown;
};

export type AuthResult<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
};

const USER_KEY = "vorld_user";

export class VorldAuthService {
  setTokens(accessToken: string, refreshToken: string, user?: VorldUser) {
    Cookies.set(TOKEN_KEY, accessToken, {
      expires: 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, {
      expires: 30, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    if (user) {
      Cookies.set(USER_KEY, JSON.stringify(user), {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }
  }

  getAccessToken(): string | undefined {
    return Cookies.get(TOKEN_KEY);
  }

  getRefreshToken(): string | undefined {
    return Cookies.get(REFRESH_TOKEN_KEY);
  }

  clearTokens() {
    Cookies.remove(TOKEN_KEY);
    Cookies.remove(REFRESH_TOKEN_KEY);
    Cookies.remove(USER_KEY);
  }

  getUser(): VorldUser | null {
    const userJson = Cookies.get(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as VorldUser;
    } catch {
      return null;
    }
  }

  async getProfile(): Promise<AuthResult<{ profile: VorldUser }>> {
    try {
      const token = this.getAccessToken();

      if (!token) {
        return {
          success: false,
          error: "No access token found. Please login again.",
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }
      });

      const payload = await response.json();

      if (!response.ok || payload.sucess === false) {
        return {
          success: false,
           error: payload?.error ?? "Failed to fetch profile",
        }
      }

       if (payload.profile) {
        const refreshToken = this.getRefreshToken();
        if (refreshToken) {
          this.setTokens(token, refreshToken, payload.profile);
        }
      }     

      return {
        success: true,
        data: { profile: payload.profile },
      };
    } catch (error) {
      console.error("[AuthService] Profile fetch error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch profile",
      };
    }
  }

  async logout(): Promise<AuthResult<{ message: string }>> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        this.clearTokens();
        return {
          success: true,
          data: { message: "Already logged out" },
        };
      }
      const response = await fetch(`${VORLD_BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          "x-vorld-app-id": VORD_APP_ID|| "",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await response.json();
      this.clearTokens();

      if (!response.ok || payload.success === false) {
        return {
          success: false,
          error: payload?.error ?? payload?.message ?? "Logout failed",
        };
      }

      return {
        success: true,
        data: { message: payload.message ?? "Logged out successfully" },
      };
    } catch (error) {
      this.clearTokens();
      return {
        success: false,
        error: error instanceof Error ? error.message : "Logout failed",
      };
    }
  }
}

export const authService = new VorldAuthService();

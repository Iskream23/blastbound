'use client';

import {
  FormEvent,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import PortalBackground from "./PortalBackground";
import LoginCard from "./LoginCard";
import { socialProviders } from "../_providers/socialProviders";
import type { FormStatus, PortalFormValues, Ripple } from "../_types/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? "http://localhost:4000";

type AuthTokens = {
  token: string;
  refreshToken: string;
};

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [rippleCount, setRippleCount] = useState(0);
  const [formValues, setFormValues] = useState<PortalFormValues>({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [status, setStatus] = useState<FormStatus | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [profile, setProfile] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    if (tokens) {
      sessionStorage.setItem("blastbound-auth", JSON.stringify(tokens));
    }
  }, [tokens]);

  const updateStatus = useCallback((message: string, tone: FormStatus["tone"]) => {
    setStatus({ message, tone });
  }, []);

  const handleApiResponse = useCallback(async (response: Response) => {
    const payload = await response.json();
    if (!response.ok || payload.success === false) {
      const errorMessage = payload?.error ?? payload?.message ?? "Authentication failed";
      throw new Error(errorMessage);
    }
    return payload as {
      success: true;
      token?: string;
      refreshToken?: string;
      user?: Record<string, unknown>;
      requiresOTP?: boolean;
      profile?: Record<string, unknown>;
    };
  }, []);

  const fetchProfile = useCallback(
    async (tokenValue: string) => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${tokenValue}`,
          },
        });
        const payload = await handleApiResponse(response);
        if (payload.profile) {
          setProfile(payload.profile as Record<string, unknown>);
        }
      } catch (error) {
        console.warn("Profile fetch failed", error);
      }
    },
    [handleApiResponse],
  );

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (isLoading) {
        return;
      }

      setIsLoading(true);
      setStatus(null);

      try {
        if (requiresOtp) {
          const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formValues.email, otp }),
          });

          const payload = await handleApiResponse(response);

          if (payload.token && payload.refreshToken) {
            const authTokens = {
              token: payload.token,
              refreshToken: payload.refreshToken,
            };
            setTokens(authTokens);
            updateStatus("Access granted. Neural link stabilized.", "success");
            setRequiresOtp(false);
            setOtp("");
            await fetchProfile(payload.token);
          }
          return;
        }

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formValues.email, password: formValues.password }),
        });

        const payload = await handleApiResponse(response);

        if (payload.requiresOTP) {
          setRequiresOtp(true);
          updateStatus("One-time cipher requested. Enter the temporal code sent to you.", "success");
          return;
        }

        if (payload.token && payload.refreshToken) {
          const authTokens = {
            token: payload.token,
            refreshToken: payload.refreshToken,
          };
          setTokens(authTokens);
          updateStatus("Access granted. Neural link stabilized.", "success");
          await fetchProfile(payload.token);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Authentication failed";
        updateStatus(message, "error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      fetchProfile,
      formValues.email,
      formValues.password,
      handleApiResponse,
      isLoading,
      otp,
      requiresOtp,
      updateStatus,
    ],
  );

  const handleButtonClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      if (isLoading) {
        return;
      }

      const boundingRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - boundingRect.left;
      const y = event.clientY - boundingRect.top;
      const newId = rippleCount + 1;

      setRippleCount(newId);
      setRipples((previous) => [...previous, { id: newId, x, y }]);

      setTimeout(() => {
        setRipples((previous) => previous.filter((ripple) => ripple.id !== newId));
      }, 600);
    },
    [isLoading, rippleCount],
  );

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((previous) => !previous);
  }, []);

  const handleFieldChange = useCallback((field: keyof PortalFormValues, value: string) => {
    setFormValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  }, []);

  const statusSummary = useMemo(() => {
    if (!tokens) {
      return null;
    }

    return {
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      profile,
    };
  }, [profile, tokens]);

  return (
    <div className="portal-page">
      <PortalBackground />
      <main className="portal-main">
        <LoginCard
          isLoading={isLoading}
          showPassword={showPassword}
          ripples={ripples}
          socialProviders={socialProviders}
          formValues={formValues}
          otp={otp}
          requiresOtp={requiresOtp}
          status={status}
          onSubmit={handleSubmit}
          onTogglePassword={togglePasswordVisibility}
          onButtonClick={handleButtonClick}
          onFieldChange={handleFieldChange}
          onOtpChange={setOtp}
        />

        {statusSummary && (
          <aside className="portal-status-panel" aria-live="polite">
            <h2 className="portal-status-title">Session Diagnostics</h2>
            <dl className="portal-status-grid">
              <div>
                <dt>Access Token</dt>
                <dd>{statusSummary.token}</dd>
              </div>
              <div>
                <dt>Refresh Token</dt>
                <dd>{statusSummary.refreshToken}</dd>
              </div>
              {statusSummary.profile && (
                <div>
                  <dt>Profile Snapshot</dt>
                  <dd>
                    <pre className="portal-status-pre">
                      {JSON.stringify(statusSummary.profile, null, 2)}
                    </pre>
                  </dd>
                </div>
              )}
            </dl>
          </aside>
        )}
      </main>
    </div>
  );
};

export default LoginPage;

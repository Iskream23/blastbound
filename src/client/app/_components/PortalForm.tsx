import Link from "next/link";
import type { FormEvent, MouseEvent } from "react";
import type {
  FormStatus,
  PortalFormValues,
  Ripple,
  SocialProvider,
} from "../_types/types";

type PortalFormProps = {
  isLoading: boolean;
  showPassword: boolean;
  ripples: Ripple[];
  socialProviders: SocialProvider[];
  formValues: PortalFormValues;
  otp: string;
  requiresOtp: boolean;
  status: FormStatus | null;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onTogglePassword: () => void;
  onButtonClick: (event: MouseEvent<HTMLButtonElement>) => void;
  onFieldChange: (field: keyof PortalFormValues, value: string) => void;
  onOtpChange: (value: string) => void;
};

const PortalForm = ({
  isLoading,
  showPassword,
  ripples,
  socialProviders,
  formValues,
  otp,
  requiresOtp,
  status,
  onSubmit,
  onTogglePassword,
  onButtonClick,
  onFieldChange,
  onOtpChange,
}: PortalFormProps) => {
  const buttonLabel = requiresOtp ? "VERIFY ACCESS CODE" : "ENTER THE VORLD";
  const isSubmitDisabled =
    isLoading ||
    !formValues.email.trim() ||
    !formValues.password.trim() ||
    (requiresOtp && !otp.trim());

  return (
    <form className="portal-form" onSubmit={onSubmit} aria-busy={isLoading}>
      <div className="portal-fieldset">
        <label className="portal-label" htmlFor="email">
          Email
        </label>
        <div className="portal-input">
          <span className="portal-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M3.75 5.25h16.5a.75.75 0 0 1 .75.75v12a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75v-12a.75.75 0 0 1 .75-.75Zm.75 1.5v.39l7.5 4.63 7.5-4.63V6.75Zm0 2.71V18h15V9.46l-6.93 4.28a1.5 1.5 0 0 1-1.54 0Z" />
            </svg>
          </span>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="user@vorld.com"
            required
            className="portal-input-field"
            autoComplete="email"
            value={formValues.email}
            onChange={(event) => onFieldChange("email", event.target.value)}
          />
        </div>
      </div>

      <div className="portal-fieldset">
        <label className="portal-label" htmlFor="password">
          Password
        </label>
        <div className="portal-input">
          <span className="portal-icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" />
            </svg>
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••-ACCESS-OVERRIDE"
            required
            className="portal-input-field"
            autoComplete="current-password"
            value={formValues.password}
            onChange={(event) => onFieldChange("password", event.target.value)}
          />
          <button
            type="button"
            className="portal-toggle"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="m4 4 16 16" />
                <path d="M9.88 9.88A3 3 0 0 0 12 15a3 3 0 0 0 2.11-.88" />
                <path d="M7.05 7.05A10.88 10.88 0 0 0 2 12s3.5 6 10 6a11.57 11.57 0 0 0 5.36-1.24" />
                <path d="M17.94 13.46A10.73 10.73 0 0 0 22 12s-3.5-6-10-6a10.66 10.66 0 0 0-2.41.28" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M1.5 12s3.5-6 10.5-6 10.5 6 10.5 6-3.5 6-10.5 6S1.5 12 1.5 12Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {requiresOtp && (
        <div className="portal-fieldset">
          <label className="portal-label" htmlFor="otp">
            Temporal Code
          </label>
          <div className="portal-input">
            <span className="portal-icon" aria-hidden="true">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 5.5a6.5 6.5 0 1 0 6.5 6.5A6.51 6.51 0 0 0 12 5.5Zm0-1.5a8 8 0 1 1-8 8 8 8 0 0 1 8-8Z" />
                <path d="M12 8v4l2.5 2.5" />
              </svg>
            </span>
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter OTP code"
              className="portal-input-field"
              autoComplete="one-time-code"
              value={otp}
              onChange={(event) => onOtpChange(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className="portal-meta">
        <label className="portal-checkbox">
          <input type="checkbox" defaultChecked />
          <span className="portal-checkbox-box" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 10.5 8.25 14 15 6" />
            </svg>
          </span>
          <span>Remember Me</span>
        </label>
        <Link href="#" className="portal-link">
          Forgot password?
        </Link>
      </div>

      {status && (
        <div
          className={`portal-alert portal-alert--${status.tone}`}
          role="status"
          aria-live="polite"
        >
          <p>{status.message}</p>
        </div>
      )}

      <div className="portal-action">
        <button
          type="submit"
          className="portal-button"
          onClick={onButtonClick}
          disabled={isSubmitDisabled}
        >
          <span className="portal-button-label">{buttonLabel}</span>
          <span className="portal-button-glow" aria-hidden="true" />
          <span className="portal-ripple-container" aria-hidden="true">
            {ripples.map((ripple) => (
              <span
                key={ripple.id}
                className="portal-ripple"
                style={{ left: ripple.x, top: ripple.y }}
              />
            ))}
          </span>
        </button>
      </div>
      {/* TODO: Setup connect wallet in the future  */}
      {/* <div className="portal-divider" aria-hidden="true">
        <span />
        <p>or connect with</p>
        <span />
      </div>

      <div className="portal-social">
        {socialProviders.map((provider) => (
          <button key={provider.name} type="button" className="portal-social-button">
            <span className="sr-only">Sign in with {provider.name}</span>
            {provider.icon}
          </button>
        ))}
      </div> */}
    </form>
  );
};

export default PortalForm;

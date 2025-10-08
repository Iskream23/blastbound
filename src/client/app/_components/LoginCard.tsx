import type { FormEvent, MouseEvent } from "react";
import PortalForm from "./PortalForm";
import type {
  FormStatus,
  PortalFormValues,
  Ripple,
  SocialProvider,
} from "../_types/types";

type LoginCardProps = {
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

const LoginCard = ({
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
}: LoginCardProps) => (
  <div className="portal-card portal-fade-in portal-floating">
    <div className="portal-card-border" />
    <div className="portal-card-glow" />

    {isLoading && (
      <div className="portal-spinner" role="status" aria-live="polite">
        <span className="sr-only">Authenticating…</span>
      </div>
    )}

    <header className="portal-header">
      <span className="portal-kicker">SYSTEM PROTOCOL 7.2</span>
      <h1 className="portal-title">ACCESS PORTAL</h1>
      <p className="portal-subtitle">
        Sync your neural credentials to enter the Vorld mainframe.
      </p>
    </header>

    <PortalForm
      isLoading={isLoading}
      showPassword={showPassword}
      ripples={ripples}
      socialProviders={socialProviders}
      formValues={formValues}
      otp={otp}
      requiresOtp={requiresOtp}
      status={status}
      onSubmit={onSubmit}
      onTogglePassword={onTogglePassword}
      onButtonClick={onButtonClick}
      onFieldChange={onFieldChange}
      onOtpChange={onOtpChange}
    />
  </div>
);

export default LoginCard;

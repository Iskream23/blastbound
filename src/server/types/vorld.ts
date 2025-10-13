export type VorldUser = {
  id: string;
  email: string;
  role?: string;
  [key: string]: unknown;
};

export type VorldAuthResponse = {
  success?: boolean;
  token: string;
  refreshToken: string;
  user: VorldUser;
  requiresOTP?: boolean;
  valid?: boolean;
};

export type VorldLoginResult =
  | ({ success: true; requiresOTP: boolean } & Pick<VorldAuthResponse, "token" | "refreshToken" | "user">)
  | { success: false; error: string };

export type VorldOtpResult =
  | ({ success: true } & Pick<VorldAuthResponse, "token" | "refreshToken" | "user">)
  | { success: false; error: string };

export type VorldRefreshResult =
  | ({ success: true } & Pick<VorldAuthResponse, "token" | "refreshToken">)
  | { success: false; error: string };

export type VorldVerifyResult =
  | ({ success: true; valid: boolean } & Pick<VorldAuthResponse, "user">)
  | { success: false; valid: false; error: string };

export type VorldProfileResult =
  | { success: true; profile: unknown }
  | { success: false; error: string };

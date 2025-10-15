export type VorldUser = {
  id: string;
  email: string;
  role?: string;
  [key: string]: unknown;
};

export type VorldResponse<TData> = {
  success: boolean;
  data: TData;
  message?: string;
  error?: string;
};

export type VorldLoginData = {
  user: VorldUser;
  accessToken: string;
  refreshToken: string;
  requiresOTP?: boolean;
};

export type VorldOtpData = {
  user: VorldUser;
  accessToken: string;
  refreshToken: string;
};

export type VorldRefreshData = {
  accessToken: string;
  refreshToken: string;
};

export type VorldVerifyData = {
  user: VorldUser;
  valid?: boolean;
};

export type VorldProfileData = {
  profile: unknown;
};

export type VorldLogoutData = {
  message?: string;
};

export type VorldLoginResult =
  | {
      success: true;
      token: string;
      refreshToken: string;
      user: VorldUser;
      requiresOTP: boolean;
    }
  | { success: false; error: string };

export type VorldOtpResult =
  | {
      success: true;
      token: string;
      refreshToken: string;
      user: VorldUser;
    }
  | { success: false; error: string };

export type VorldRefreshResult =
  | {
      success: true;
      token: string;
      refreshToken: string;
    }
  | { success: false; error: string };

export type VorldVerifyResult =
  | {
      success: true;
      valid: boolean;
      user: VorldUser;
    }
  | { success: false; valid: false; error: string };

export type VorldProfileResult =
  | { success: true; profile: unknown }
  | { success: false; error: string };

import type { ReactNode } from "react";

export type Ripple = {
  id: number;
  x: number;
  y: number;
};

export type SocialProvider = {
  name: string;
  icon: ReactNode;
};

export type PortalFormValues = {
  email: string;
  password: string;
};

export type FormStatusTone = "idle" | "success" | "error";

export type FormStatus = {
  tone: FormStatusTone;
  message: string;
};

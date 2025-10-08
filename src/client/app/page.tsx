"use client";

import Link from "next/link";
import { FormEvent, MouseEvent, useState } from "react";

type Ripple = { id: number; x: number; y: number };

const socialProviders = [
  {
    name: "Quantum ID",
    icon: (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M12 2.75c-5.1 0-9.25 4.15-9.25 9.25s4.15 9.25 9.25 9.25 9.25-4.15 9.25-9.25S17.1 2.75 12 2.75Zm0 1.5c4.27 0 7.75 3.48 7.75 7.75s-3.48 7.75-7.75 7.75-7.75-3.48-7.75-7.75S7.73 4.25 12 4.25Z"
          fill="currentColor"
          opacity="0.6"
        />
        <path
          d="M12 7.25a4.75 4.75 0 1 0 4.75 4.75A4.76 4.76 0 0 0 12 7.25Zm0 1.5a3.25 3.25 0 1 1-3.25 3.25A3.25 3.25 0 0 1 12 8.75Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "Nebula",
    icon: (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M4.5 12A7.5 7.5 0 0 1 18 7.54a.75.75 0 1 0 1.05-1.07A9 9 0 1 0 21 12a1.5 1.5 0 0 1-1.5 1.5H16.5a.75.75 0 0 0 0 1.5H19.5A3 3 0 0 0 22.5 12a10.5 10.5 0 1 0-4.55 8.62.75.75 0 0 0-.84-1.25A9 9 0 0 1 4.5 12Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
  {
    name: "SynthWave",
    icon: (
      <svg
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          d="M3.75 4.5h16.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H3.75a.75.75 0 0 1-.75-.75V5.25a.75.75 0 0 1 .75-.75Zm.75 1.5v3.05l5.15 2.98a2.25 2.25 0 0 0 2.2 0l5.15-2.98V6H4.5Zm14.25 11.5v-6l-4.38 2.53a3.75 3.75 0 0 1-3.74 0L6.25 12v5.5Z"
          fill="currentColor"
        />
      </svg>
    ),
  },
];

export default function Home() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [rippleCount, setRippleCount] = useState(0);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2200);
  };

  const handleButtonClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (isLoading) return;
    const boundingRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - boundingRect.left;
    const y = event.clientY - boundingRect.top;
    const newId = rippleCount + 1;

    setRippleCount(newId);
    setRipples((previous) => [...previous, { id: newId, x, y }]);

    setTimeout(() => {
      setRipples((previous) => previous.filter((ripple) => ripple.id !== newId));
    }, 600);
  };

  return (
    <div className="portal-page">
      <div className="portal-gradient" />
      <div className="portal-grid" />
      <div className="portal-particles" />
      <div className="portal-orb portal-orb--cyan" />
      <div className="portal-orb portal-orb--magenta" />
      <div className="portal-orb portal-orb--violet" />

      <main className="portal-main">
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

          <form className="portal-form" onSubmit={handleSubmit} aria-busy={isLoading}>
            <div className="portal-fieldset">
              <label className="portal-label" htmlFor="username">
                Identifier
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
                    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z" />
                    <path d="M5 20.25c0-3.451 3.134-6.25 7-6.25s7 2.799 7 6.25" />
                  </svg>
                </span>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="CITIZEN-ID // user@vorld.net"
                  required
                  className="portal-input-field"
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="portal-fieldset">
              <label className="portal-label" htmlFor="password">
                Cipher Key
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
                />
                <button
                  type="button"
                  className="portal-toggle"
                  onClick={() => setShowPassword((previous) => !previous)}
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

            <div className="portal-action">
              <button
                type="submit"
                className="portal-button"
                onClick={handleButtonClick}
                disabled={isLoading}
              >
                <span className="portal-button-label">ENTER THE VORLD</span>
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

            <div className="portal-divider" aria-hidden="true">
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
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

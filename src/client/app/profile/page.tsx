"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, type VorldUser } from "../_lib/authService";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<VorldUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const result = await authService.getProfile();

      if (result.success) {
        setProfile(result.data.profile);
      } else {
        console.error("Failed to load profile:", result.error);
        router.push("/");
      }
    } catch (error) {
      console.error("Profile loading failed:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      router.push("/");
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="portal-page">
        <div className="portal-gradient" />
        <div className="portal-grid" />
        <div className="portal-particles" />
        <div className="portal-orb portal-orb--cyan" />
        <div className="portal-orb portal-orb--magenta" />
        <div className="portal-orb portal-orb--violet" />

        <main className="profile-main">
          <div className="profile-card portal-fade-in">
            <div className="portal-card-border" />
            <div className="portal-card-glow" />
            <div className="profile-skeleton">
              <div className="skeleton-bar skeleton-title" />
              <div className="skeleton-bar skeleton-text" />
              <div className="skeleton-bar skeleton-text" />
              <div className="skeleton-bar skeleton-text" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="portal-page">
        <div className="portal-gradient" />
        <div className="portal-grid" />
        <div className="portal-particles" />
        <main className="profile-main">
          <div className="profile-card portal-fade-in">
            <div className="portal-card-border" />
            <p className="profile-error">Failed to load profile</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="portal-page">
      <div className="portal-gradient" />
      <div className="portal-grid" />
      <div className="portal-particles" />
      <div className="portal-orb portal-orb--cyan" />
      <div className="portal-orb portal-orb--magenta" />
      <div className="portal-orb portal-orb--violet" />

      <main className="profile-main">
        <div className="profile-card portal-fade-in portal-floating">
          <div className="portal-card-border" />
          <div className="portal-card-glow" />

          <header className="profile-header">
            <div className="profile-header-top">
              <div>
                <span className="portal-kicker">SYSTEM PROTOCOL 7.2</span>
                <h1 className="portal-title profile-title">Profile</h1>
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="profile-logout-btn"
                aria-label="Logout"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </header>

          <div className="profile-content">
            {/* Basic Information */}
            <section className="profile-section">
              <h2 className="profile-section-title">
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
                Basic Information
              </h2>
              <div className="profile-grid">
                <div className="profile-field">
                  <dt>Username</dt>
                  <dd>{profile.username}</dd>
                </div>
                <div className="profile-field">
                  <dt>Email</dt>
                  <dd className="profile-email">
                    {profile.email || "Not provided"}
                    {profile.verified && (
                      <span className="profile-verified" title="Verified">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </dd>
                </div>
              </div>
            </section>

            {/* Account Details */}
            <section className="profile-section">
              <h2 className="profile-section-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Account Details
              </h2>
              <div className="profile-grid">
                <div className="profile-field">
                  <dt>Account Created</dt>
                  <dd>
                    {profile.createdAt
                      ? new Date(profile.createdAt as string).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Unknown"}
                  </dd>
                </div>
                <div className="profile-field">
                  <dt>Last Login</dt>
                  <dd>
                    {profile.lastLogin
                      ? new Date(profile.lastLogin as string).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "Unknown"}
                  </dd>
                </div>
                <div className="profile-field">
                  <dt>Connected Wallets</dt>
                  <dd>{profile.totalConnectedAccounts ?? 0}</dd>
                </div>
              </div>
            </section>

            {/* Connected Accounts */}
            <section className="profile-section">
              <h2 className="profile-section-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Connected Accounts ({profile.authMethods?.length ?? 0})
              </h2>
              <div className="profile-badges">
                {profile.authMethods && profile.authMethods.length > 0 ? (
                  profile.authMethods.map((method) => (
                    <span key={method} className="profile-badge">
                      {method.toUpperCase()}
                    </span>
                  ))
                ) : (
                  <p className="profile-empty">No connected accounts</p>
                )}
              </div>
            </section>

            {/* Security Features */}
            {profile.states && (
              <section className="profile-section">
                <h2 className="profile-section-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Security Features
                </h2>
                <div className="profile-grid">
                  <div className="profile-field">
                    <dt>Email Verification</dt>
                    <dd>
                      <span className={profile.verified ? "profile-status-on" : "profile-status-off"}>
                        {profile.verified ? "Verified" : "Not Verified"}
                      </span>
                    </dd>
                  </div>
                  {profile.states.developer && (
                    <div className="profile-field">
                      <dt>Developer Mode</dt>
                      <dd>
                        <span
                          className={
                            profile.states.developer === "enabled"
                              ? "profile-status-on"
                              : "profile-status-off"
                          }
                        >
                          {profile.states.developer === "enabled" ? "Enabled" : "Disabled"}
                        </span>
                      </dd>
                    </div>
                  )}
                  {profile.states.gameDeveloper && (
                    <div className="profile-field">
                      <dt>Game Developer</dt>
                      <dd>
                        <span
                          className={
                            profile.states.gameDeveloper === "enabled"
                              ? "profile-status-on"
                              : "profile-status-off"
                          }
                        >
                          {profile.states.gameDeveloper === "enabled" ? "Enabled" : "Disabled"}
                        </span>
                      </dd>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

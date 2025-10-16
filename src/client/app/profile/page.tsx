"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService, type VorldUser } from "../_lib/authService";
import dynamic from "next/dynamic";

// Dynamically import the game wrapper to avoid SSR issues
const PhaserGameWrapper = dynamic(() => import("./PhaserGameWrapper"), {
  ssr: false,
  loading: () => (
    <div className="game-loading">
      <div className="portal-card-border" />
      <div className="portal-card-glow" />
      <div className="loading-spinner" />
      <p>Loading game...</p>
    </div>
  ),
});

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

      <main className="game-main">
        <div className="game-container portal-fade-in">
          <header className="game-header">
            <div className="game-header-content">
              <div>
                <span className="portal-kicker">BLASTBOUND</span>
                <h1 className="portal-title game-title">Welcome, {profile.username}!</h1>
              </div>
              <div className="game-header-actions">
                <div className="user-info">
                  <span className="user-level">Level 1</span>
                  <span className="user-score">Score: 0</span>
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
            </div>
          </header>

          <div className="game-wrapper">
            <PhaserGameWrapper userProfile={profile} />
          </div>
        </div>
      </main>
    </div>
  );
}
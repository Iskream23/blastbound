"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WatchScreen } from "../_components/WatchScreen";
import { authService } from "../_lib/authService";

function WatchPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Get gameId from URL params (e.g., /watch?gameId=ABC123)
  const gameId = searchParams.get("gameId");

  useEffect(() => {
    const checkAuth = async () => {
      // Check if user has a token and cached user data
      const token = authService.getAccessToken();
      const user = authService.getUser();

      if (!token || !user) {
        // Try to fetch profile if token exists
        if (token) {
          const result = await authService.getProfile();
          if (result.success && result.data.profile) {
            setIsAuthenticated(true);
            setIsLoading(false);
            return;
          }
        }

        // No valid authentication, redirect to home
        router.push("/");
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <WatchScreen gameId={gameId} />;
}

export default function WatchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
          <div className="text-white text-xl">Loading...</div>
        </div>
      }
    >
      <WatchPageContent />
    </Suspense>
  );
}

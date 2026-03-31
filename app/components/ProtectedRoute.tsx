"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      if (pathname !== "/") {
        router.push("/");
      }
      return;
    }

    // User is logged in but profile is null -> they need to complete onboarding
    if (!userProfile) {
      if (pathname !== "/onboarding") {
        router.push("/onboarding");
      }
      return;
    }

    // User has profile but is pending approval
    if (!userProfile.isApproved && userProfile.role === "PENDING") {
      if (pathname !== "/pending") {
        router.push("/pending");
      }
      return;
    }

    // Role-based protection
    if (allowedRoles && !allowedRoles.includes(userProfile.role)) {
      router.push("/dashboard");
      return;
    }
    
    // If onboarding is complete, don't let them go back to onboarding or pending
    if (userProfile.isApproved && (pathname === "/onboarding" || pathname === "/pending")) {
        if (userProfile.role === "ADMIN" || userProfile.role === "SUPER_ADMIN") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
    }

  }, [user, userProfile, loading, router, pathname, allowedRoles]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Before redirecting, we may render briefly, so return a loading block
  if (!user && pathname !== "/") {
    return <div className="min-h-screen flex items-center justify-center">Redirecting...</div>;
  }
  if (user && !userProfile && pathname !== "/onboarding") {
    return <div className="min-h-screen flex items-center justify-center">Setting up profile...</div>;
  }
  if (user && userProfile && !userProfile.isApproved && pathname !== "/pending") {
    return <div className="min-h-screen flex items-center justify-center">Checking approval status...</div>;
  }

  return <>{children}</>;
}

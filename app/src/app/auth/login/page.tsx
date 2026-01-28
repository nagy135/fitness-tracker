"use client";

import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 sm:text-3xl">Fitness Tracker</h1>
          <p className="text-gray-600 text-sm sm:text-base">Log in to your account</p>
        </div>
        <LoginForm onSuccess={() => router.push("/")} />
        <div className="text-sm text-center text-gray-600 mt-4">
          Don't have an account?{' '}
          <button
            onClick={() => router.push('/auth/signup')}
            className="text-blue-600 hover:underline font-medium"
          >
            Sign up here
          </button>
        </div>
      </div>
    </div>
  );
}

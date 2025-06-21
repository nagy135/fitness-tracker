'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/LoginForm';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-md mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">Fitness Tracker</h1>
            <p className="text-gray-600 mb-8">Welcome back! You're logged in.</p>
          </div>
          
          <div className="space-y-4">
            <Button 
              onClick={() => router.push('/exercises')}
              className="w-full"
              size="lg"
            >
              Exercises
            </Button>
            
            <Button 
              onClick={logout}
              variant="outline"
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Fitness Tracker</h1>
          <p className="text-gray-600">Please log in to continue</p>
        </div>
        <LoginForm onSuccess={() => window.location.reload()} />
      </div>
    </div>
  );
}

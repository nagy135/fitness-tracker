"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Dumbbell,
  Trophy,
  Calendar,
  BarChart3,
  LogOut,
  Home,
} from "lucide-react";

export function NavigationBar() {
  const { isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (!isAuthenticated) {
    return null;
  }

  const navigationItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
      isActive: pathname === "/",
    },
    {
      label: "Exercises",
      href: "/exercises",
      icon: Dumbbell,
      isActive: pathname.startsWith("/exercises"),
    },
    {
      label: "Records",
      href: "/records",
      icon: Trophy,
      isActive: pathname.startsWith("/records"),
    },
    {
      label: "Workouts",
      href: "/workouts",
      icon: Calendar,
      isActive: pathname.startsWith("/workouts"),
    },
    {
      label: "Statistics",
      href: "/statistics",
      icon: BarChart3,
      isActive: pathname.startsWith("/statistics"),
    },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-between h-14">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <h1 className="text-lg font-bold text-gray-900">Fitness Tracker</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  variant={item.isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex items-center gap-2 px-3 py-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* Logout Button */}
          <div className="flex items-center">
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Horizontal Layout */}
        <div className="md:hidden">
          {/* Top Row - Brand and Logout */}
          <div className="flex items-center justify-between h-12">
            <h1 className="text-base font-bold text-gray-900">
              Fitness Tracker
            </h1>
            <Button
              onClick={logout}
              variant="outline"
              size="sm"
              className="flex items-center gap-1 px-2 py-1 text-xs"
            >
              <LogOut className="h-3 w-3" />
              <span>Logout</span>
            </Button>
          </div>

          {/* Bottom Row - Navigation Items (Horizontal) */}
          <div className="flex items-center justify-between py-3 space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  variant={item.isActive ? "default" : "outline"}
                  size="sm"
                  className="flex-1 flex items-center justify-center gap-1 px-1 py-2 text-xs h-10"
                >
                  <Icon className="h-3 w-3 flex-shrink-0" />
                  <span className="text-xs leading-none truncate">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}


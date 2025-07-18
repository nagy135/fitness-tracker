"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import {
  Dumbbell,
  Trophy,
  Calendar,
  BarChart3,
  LogOut,
  Home,
  Sun,
  Moon,
} from "lucide-react";

export function NavigationBar() {
  const { isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                Fitness Tracker
              </h1>
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

            {/* Theme Toggle and Logout Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {theme === "light" ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {theme === "light" ? "Dark" : "Light"}
                </span>
              </Button>
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
        </div>
      </nav>

      {/* Mobile Top Bar - Fixed */}
      <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-12">
            <h1 className="text-base font-bold text-gray-900 dark:text-white">
              Fitness Tracker
            </h1>
            <div className="flex items-center gap-1">
              <Button
                onClick={toggleTheme}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 px-2 py-1 text-xs"
              >
                {theme === "light" ? (
                  <Moon className="h-3 w-3" />
                ) : (
                  <Sun className="h-3 w-3" />
                )}
              </Button>
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
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Fixed */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="px-2 py-2">
          <div className="flex items-center justify-between space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  variant={item.isActive ? "default" : "ghost"}
                  size="sm"
                  className="flex-1 flex flex-col items-center justify-center gap-1 px-1 py-2 text-xs h-12"
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="text-xs leading-none truncate">
                    {item.label}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Mobile Spacer for bottom navigation */}
      <div className="md:hidden h-16"></div>
    </>
  );
}

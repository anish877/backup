'use client';
import React, { useState } from 'react';
import { Search, Bell, Menu, Home, Calendar, MessageCircle, Activity, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavBar = () => {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If still checking auth status, show minimal navbar
  if (isLoading) {
    return (
      <div className="flex items-center justify-between w-full z-40 px-4 py-3">
        <div className="flex items-center">
          <div className="flex flex-col">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full ml-0.5"></div>
            </div>
            <div className="flex items-center space-x-1 mt-0.5">
              <div className="w-2 h-2 bg-black rounded-full"></div>
              <div className="w-2 h-2 bg-black rounded-full"></div>
            </div>
          </div>
          <span className="ml-2 font-bold text-lg">MetricsIQ</span>
        </div>
      </div>
    );
  }

  // Define navigation items - only show when authenticated
  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { path: '/goal', label: 'Set Goal', icon: <Activity className="w-5 h-5" /> },
    { path: '/log', label: 'Daily Log', icon: <Calendar className="w-5 h-5" /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageCircle className="w-5 h-5" /> },
    { path: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      <div className="flex items-center justify-between w-full z-40 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center">
            <div className="flex flex-col">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <div className="w-2 h-2 bg-black rounded-full ml-0.5"></div>
              </div>
              <div className="flex items-center space-x-1 mt-0.5">
                <div className="w-2 h-2 bg-black rounded-full"></div>
                <div className="w-2 h-2 bg-black rounded-full"></div>
              </div>
            </div>
            <Link href={isAuthenticated ? "/" : "/auth/signin"} className="ml-2 font-bold text-lg">MetricsIQ</Link>
          </div>
          
          {isAuthenticated && (
            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                    pathname === item.path 
                      ? 'bg-orange-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {item.icon}
                  <span className="ml-1">{item.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        {isAuthenticated ? (
          <div className="flex items-center space-x-4">
            <div className="relative w-64 hidden md:block">
              <input
                type="text"
                placeholder="Search for any health metrics (Filters)..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
            </div>
            <Bell className="w-5 h-5 cursor-pointer" />
            <div className="md:hidden">
              <Menu 
                className="w-5 h-5 cursor-pointer" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="bg-orange-500 cursor-pointer">
                  <AvatarImage src="/lovable-uploads/a6ceadf4-1747-4ad6-a0c6-d78ff8e109e3.png" />
                  <AvatarFallback className="bg-orange-500">
                    {user?.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link 
              href="/auth/signin" 
              className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200"
            >
              Sign In
            </Link>
            <Link 
              href="/auth/signup" 
              className="px-4 py-2 text-sm font-medium rounded-lg bg-orange-500 text-white hover:bg-orange-600"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile Navigation Menu */}
      {isAuthenticated && mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white pt-16">
          <div className="px-4 py-2">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link 
                  key={item.path} 
                  href={item.path} 
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    pathname === item.path 
                      ? 'bg-orange-500 text-white' 
                      : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </Link>
              ))}
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-3 rounded-lg text-red-500 hover:bg-gray-100"
              >
                <LogOut className="w-5 h-5" />
                <span className="ml-3">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
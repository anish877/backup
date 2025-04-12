'use client';
import React from 'react';
import { Search, Bell, Menu, Home, Calendar, MessageCircle, Activity, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const NavBar = () => {
  const location = usePathname();
  
  const navItems = [
    { path: '/', label: 'Home', icon: <Home className="w-5 h-5" /> },
    { path: '/goal', label: 'Set Goal', icon: <Activity className="w-5 h-5" /> },
    { path: '/log', label: 'Daily Log', icon: <Calendar className="w-5 h-5" /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageCircle className="w-5 h-5" /> },
    { path: '/profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];
  
  return (
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
          <Link href="/" className="ml-2 font-bold text-lg">MetricsIQ</Link>
        </div>
        
        <div className="hidden md:flex space-x-2">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`flex items-center px-3 py-1 rounded-lg text-sm ${
                location === item.path 
                  ? 'bg-brandOrange text-white' 
                  : 'hover:bg-gray-100'
              }`}
            >
              {item.icon}
              <span className="ml-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative w-64 hidden md:block">
          <input
            type="text"
            placeholder="Search for any health metrics (Filters)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-1 focus:ring-brandOrange"
          />
          <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
        </div>
        <Bell className="w-5 h-5" />
        <Menu className="w-5 h-5 md:hidden" />
        <Avatar className="bg-brandOrange">
          <AvatarImage src="/lovable-uploads/a6ceadf4-1747-4ad6-a0c6-d78ff8e109e3.png" />
          <AvatarFallback className="bg-brandOrange">U</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default NavBar;
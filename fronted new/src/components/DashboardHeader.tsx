import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { useState } from "react";
import { 
  Search, 
  Bell, 
  Menu,
  BookOpen,
  Settings
} from "lucide-react";

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  userName?: string;
  userAvatar?: string;
}

export function DashboardHeader({ 
  onMenuToggle, 
  userName = "Alex Johnson",
  userAvatar
}: DashboardHeaderProps) {
  const [hasNotifications, setHasNotifications] = useState(true);
  const [notificationCount, setNotificationCount] = useState(3);

  const handleNotificationClick = () => {
    console.log("Notifications clicked");
    // Simulate marking notifications as read
    setNotificationCount(0);
  };

  const handleSettingsClick = () => {
    console.log("Settings clicked");
  };

  const handleAvatarClick = () => {
    console.log("Profile clicked");
  };

  return (
    <header className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-40 shadow-sm">
      <div className="flex h-16 items-center gap-4 px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden hover:bg-purple-50 transition-all duration-200 hover:scale-110"
          onClick={onMenuToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold hidden sm:inline bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            LearnHub
          </span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search courses..."
              className="pl-10 bg-muted/50 focus:bg-white transition-all duration-200 focus:ring-2 focus:ring-purple-300 border-purple-100"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNotificationClick}
            className="relative hover:bg-purple-50 transition-all duration-200 hover:scale-110"
          >
            <Bell className={`w-5 h-5 transition-all duration-200 ${notificationCount > 0 ? 'animate-pulse' : ''}`} />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs bg-gradient-to-r from-red-400 to-pink-500 border-0 text-white animate-bounce">
                {notificationCount}
              </Badge>
            )}
          </Button>

          {/* Settings */}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleSettingsClick}
            className="hover:bg-purple-50 transition-all duration-200 hover:scale-110 hover:rotate-12"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Avatar */}
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-all duration-200 hover:scale-105"
            onClick={handleAvatarClick}
          >
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">Student ⭐</p>
            </div>
            <Avatar className="ring-2 ring-purple-200 hover:ring-purple-300 transition-all duration-200">
              <AvatarImage src={userAvatar} alt={userName} />
              <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                {userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
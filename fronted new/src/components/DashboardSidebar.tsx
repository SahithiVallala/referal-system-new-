import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { useState } from "react";
import { 
  Home, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Calendar,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft
} from "lucide-react";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  badge?: string;
  active?: boolean;
  id: string;
}

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen = true, onClose }: DashboardSidebarProps) {
  const [activeItem, setActiveItem] = useState("dashboard");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const mainNavItems: SidebarItem[] = [
    { id: "dashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard", active: activeItem === "dashboard" },
    { id: "courses", icon: <BookOpen className="w-5 h-5" />, label: "My Courses", badge: "12", active: activeItem === "courses" },
    { id: "progress", icon: <TrendingUp className="w-5 h-5" />, label: "Progress", active: activeItem === "progress" },
    { id: "achievements", icon: <Award className="w-5 h-5" />, label: "Achievements", badge: "3", active: activeItem === "achievements" },
    { id: "schedule", icon: <Calendar className="w-5 h-5" />, label: "Schedule", active: activeItem === "schedule" },
    { id: "messages", icon: <MessageSquare className="w-5 h-5" />, label: "Messages", badge: "5", active: activeItem === "messages" },
  ];

  const categories = [
    "Programming",
    "Design",
    "Business", 
    "Data Science",
    "Languages",
    "Mathematics"
  ];

  const bottomNavItems: SidebarItem[] = [
    { id: "settings", icon: <Settings className="w-5 h-5" />, label: "Settings", active: activeItem === "settings" },
    { id: "logout", icon: <LogOut className="w-5 h-5" />, label: "Logout", active: false },
  ];

  const handleNavClick = (itemId: string) => {
    setActiveItem(itemId);
    // Add any navigation logic here
    console.log(`Navigating to: ${itemId}`);
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      onClose?.();
    }
  };

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
    console.log(`Selected category: ${category}`);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-full w-72 bg-gradient-to-b from-white to-indigo-50 border-r border-indigo-100 transform transition-transform duration-300 ease-in-out shadow-xl
        md:relative md:transform-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile Close Button */}
          <div className="flex items-center justify-between p-4 border-b md:hidden">
            <h2 className="font-semibold">Navigation</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 px-3 py-4">
            {/* Main Navigation */}
            <div className="space-y-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Main
              </h3>
              {mainNavItems.map((item, index) => (
                <Button
                  key={index}
                  variant={item.active ? "secondary" : "ghost"}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full justify-start gap-3 h-10 transition-all duration-200 ${
                    item.active 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700 transform scale-105 shadow-lg' 
                      : 'hover:bg-indigo-50 hover:transform hover:scale-105 hover:shadow-md'
                  }`}
                >
                  {item.icon}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <Badge className={`ml-auto border-0 text-xs transition-all duration-200 ${
                      item.active 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white animate-pulse' 
                        : 'bg-gradient-to-r from-orange-400 to-pink-500 text-white'
                    }`}>
                      {item.badge}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Categories */}
            <div className="mt-8 space-y-2">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Categories
              </h3>
              {categories.map((category, index) => {
                const categoryColors = [
                  'bg-gradient-to-r from-blue-400 to-purple-500',
                  'bg-gradient-to-r from-pink-400 to-orange-400',
                  'bg-gradient-to-r from-green-400 to-blue-500',
                  'bg-gradient-to-r from-purple-400 to-pink-500',
                  'bg-gradient-to-r from-green-400 to-cyan-500',
                  'bg-gradient-to-r from-purple-500 to-blue-600'
                ];
                const isSelected = selectedCategory === category;
                return (
                  <Button
                    key={index}
                    variant="ghost"
                    onClick={() => handleCategoryClick(category)}
                    className={`w-full justify-start gap-3 h-9 text-sm transition-all duration-200 ${
                      isSelected 
                        ? 'bg-indigo-100 border-l-4 border-indigo-500 transform scale-105 shadow-md' 
                        : 'hover:bg-indigo-50 hover:transform hover:scale-102'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${categoryColors[index]} shadow-sm transition-all duration-200 ${
                      isSelected ? 'scale-125 shadow-lg' : ''
                    }`} />
                    <span className={isSelected ? 'font-medium' : ''}>{category}</span>
                  </Button>
                );
              })}
            </div>
          </ScrollArea>

          {/* Bottom Navigation */}
          <div className="border-t border-indigo-100 p-3 space-y-1">
            {bottomNavItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                onClick={() => handleNavClick(item.id)}
                className={`w-full justify-start gap-3 h-10 transition-all duration-200 ${
                  item.active 
                    ? 'bg-indigo-100 text-indigo-700 font-medium' 
                    : 'hover:bg-indigo-50 hover:text-indigo-600'
                } ${item.id === 'logout' ? 'hover:bg-red-50 hover:text-red-600' : ''}`}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
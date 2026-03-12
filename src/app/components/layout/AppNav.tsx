import React from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import {
  Heart,
  Home,
  ClipboardList,
  LogOut,
  Stethoscope,
} from "lucide-react";

export function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Don't show nav on login, AI chat, or consultation chat
  const hideNav =
    location.pathname === "/" ||
    location.pathname === "/ai-chat" ||
    location.pathname.startsWith("/consultation/") ||
    location.pathname === "/doctor";

  if (hideNav || !user) return null;

  const navItems =
    user.role === "patient"
      ? [
          { label: "首页", path: "/home", icon: Home },
          { label: "开始咨询", path: "/symptoms", icon: Stethoscope },
          { label: "我的咨询", path: "/consultations", icon: ClipboardList },
        ]
      : [];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-primary"
          >
            <Heart className="w-6 h-6" />
            <span className="hidden sm:inline">医问诊</span>
          </button>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {user.name}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}

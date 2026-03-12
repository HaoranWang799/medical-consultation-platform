import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../ui/button";
import {
  Activity,
  Home,
  ClipboardList,
  LogOut,
  Stethoscope,
  Menu,
  X
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function AppNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hideNav =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/doctor"; // Assuming doctor dashboard has own layout or sidebar

  if (hideNav) return null;
  if (!user) return null;

  const navItems = [
    { label: "首页", path: "/home", icon: Home },
    { label: "智能问诊", path: "/symptoms", icon: Stethoscope },
    { label: "咨询记录", path: "/consultations", icon: ClipboardList },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-200 ${
        isScrolled
          ? "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-border"
          : "bg-background/95 border-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight cursor-pointer" onClick={() => navigate("/home")}>
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <span>医问诊</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`transition-colors hover:text-primary ${
                location.pathname === item.path
                  ? "text-foreground font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* User Menu (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9 border">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                  <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.role === 'doctor' ? '医生账户' : '患者账户'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/consultations")}>
                <ClipboardList className="mr-2 h-4 w-4" />
                <span>我的咨询</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                <span>退出登录</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="flex md:hidden items-center justify-center p-2 text-muted-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background p-4 space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3">
             {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 text-sm font-medium py-2 px-2 rounded-md ${
                     location.pathname === item.path ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              ))}
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center gap-3 px-2 mb-3">
                   <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} />
                      <AvatarFallback>{user.name?.[0]}</AvatarFallback>
                   </Avatar>
                   <div className="text-sm">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.role}</p>
                   </div>
                </div>
                <Button variant="outline" className="w-full justify-start text-destructive" onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />
                   退出登录
                </Button>
              </div>
          </nav>
        </div>
      )}
    </header>
  );
}

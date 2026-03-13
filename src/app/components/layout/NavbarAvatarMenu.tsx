import React from "react";
import { useNavigate } from "react-router";
import type { User } from "../../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ClipboardList, LogOut, Settings, UserRound } from "lucide-react";

interface NavbarAvatarMenuProps {
  user: User;
  onLogout: () => void;
}

export function NavbarAvatarMenu({ user, onLogout }: NavbarAvatarMenuProps) {
  const navigate = useNavigate();
  const avatarSrc =
    user.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full transition-transform hover:scale-[1.02]"
        >
          <Avatar className="h-10 w-10 border border-teal-100 shadow-sm">
            <AvatarImage src={avatarSrc} alt={user.name} />
            <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        forceMount
        className="mt-2 w-60 rounded-2xl border border-slate-200/80 bg-white/95 p-2 shadow-[0_20px_45px_-25px_rgba(15,118,110,0.45)] backdrop-blur data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95"
      >
        <DropdownMenuLabel className="rounded-xl px-3 py-2 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none text-slate-900">{user.name}</p>
            <p className="text-xs leading-none text-slate-500">
              {user.role === "doctor" ? "医生账户" : "患者账户"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="rounded-xl px-3 py-2.5" onClick={() => navigate("/profile")}>
          <UserRound className="mr-2 h-4 w-4 text-teal-600" />
          <span>我的资料</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="rounded-xl px-3 py-2.5" onClick={() => navigate("/settings")}>
          <Settings className="mr-2 h-4 w-4 text-teal-600" />
          <span>账户设置</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="rounded-xl px-3 py-2.5"
          onClick={() => navigate("/consultations")}
        >
          <ClipboardList className="mr-2 h-4 w-4 text-teal-600" />
          <span>咨询记录</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onLogout}
          className="rounded-xl px-3 py-2.5 text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

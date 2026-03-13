import React from "react";
import type { User } from "../../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Camera, Mail, Phone, ShieldCheck } from "lucide-react";

interface ProfileCardProps {
  user: User;
  onEdit: () => void;
  onEditAvatar: () => void;
}

export function ProfileCard({ user, onEdit, onEditAvatar }: ProfileCardProps) {
  const avatarSrc =
    user.avatarUrl ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`;

  return (
    <Card className="overflow-hidden rounded-[28px] border-slate-200/80 bg-white shadow-[0_24px_60px_-36px_rgba(15,118,110,0.45)]">
      <div className="h-24 bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.3),_transparent_45%),linear-gradient(135deg,_#f0fdfa,_#ffffff_55%,_#ecfeff)]" />
      <CardContent className="-mt-12 px-6 pb-6">
        <div className="flex flex-col items-center text-center">
          <button
            type="button"
            onClick={onEditAvatar}
            className="group relative rounded-full focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-200"
          >
            <Avatar className="h-28 w-28 border-4 border-white shadow-lg">
              <AvatarImage src={avatarSrc} alt={user.name} />
              <AvatarFallback className="text-2xl">{user.name?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-900/0 transition-all group-hover:bg-slate-900/35">
              <Camera className="h-5 w-5 text-white opacity-0 transition-opacity group-hover:opacity-100" />
            </span>
          </button>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">{user.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{user.role === "doctor" ? "医生账户" : "患者账户"}</p>

          <div className="mt-5 w-full space-y-3 rounded-2xl bg-slate-50/80 p-4 text-left">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail className="h-4 w-4 text-teal-600" />
              <span>{user.email || "未填写邮箱"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Phone className="h-4 w-4 text-teal-600" />
              <span>{user.phone || "未填写手机号"}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <ShieldCheck className="h-4 w-4 text-teal-600" />
              <span>{user.role === "doctor" ? "医生认证身份" : "患者个人账户"}</span>
            </div>
          </div>

          <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
            <Button type="button" variant="outline" className="flex-1" onClick={onEditAvatar}>
              修改头像
            </Button>
            <Button type="button" className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={onEdit}>
              修改资料
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

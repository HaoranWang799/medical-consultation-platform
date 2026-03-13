import React, { useEffect, useState } from "react";
import type { User } from "../../context/AuthContext";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";

interface EditProfileFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSave: (payload: Partial<User> & { name: string }) => Promise<void>;
  title?: string;
}

type FormState = Partial<User> & { name: string };

function createInitialState(user: User): FormState {
  return {
    name: user.name || "",
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || "",
    birthDate: user.birthDate || "",
    gender: user.gender || "",
    allergies: user.allergies || "",
    medicalHistory: user.medicalHistory || "",
    hospital: user.hospital || "",
    department: user.department || "",
    title: user.title || "",
    bio: user.bio || "",
  };
}

export function EditProfileForm({
  open,
  onOpenChange,
  user,
  onSave,
  title = "编辑个人资料",
}: EditProfileFormProps) {
  const [form, setForm] = useState<FormState>(createInitialState(user));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(createInitialState(user));
  }, [user, open]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onSave(form);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-3xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-xl text-slate-900">{title}</DialogTitle>
            <DialogDescription>完善个人资料，让问诊体验更顺畅、更专业。</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="profile-name">姓名</Label>
              <Input id="profile-name" value={form.name} onChange={(e) => setField("name", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="profile-phone">手机号</Label>
              <Input id="profile-phone" value={form.phone || ""} onChange={(e) => setField("phone", e.target.value)} placeholder="选填" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="profile-avatar">头像链接</Label>
              <Input id="profile-avatar" value={form.avatarUrl || ""} onChange={(e) => setField("avatarUrl", e.target.value)} placeholder="可粘贴头像图片 URL" />
            </div>

            {user.role === "patient" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="profile-birth">出生日期</Label>
                  <Input id="profile-birth" type="date" value={form.birthDate || ""} onChange={(e) => setField("birthDate", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>性别</Label>
                  <Select value={form.gender || ""} onValueChange={(value) => setField("gender", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="请选择" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="男">男</SelectItem>
                      <SelectItem value="女">女</SelectItem>
                      <SelectItem value="其他">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-allergies">过敏史</Label>
                  <Textarea id="profile-allergies" value={form.allergies || ""} onChange={(e) => setField("allergies", e.target.value)} placeholder="如青霉素、海鲜等" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-history">既往病史</Label>
                  <Textarea id="profile-history" value={form.medicalHistory || ""} onChange={(e) => setField("medicalHistory", e.target.value)} placeholder="如高血压、糖尿病、手术史等" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="profile-hospital">医院</Label>
                  <Input id="profile-hospital" value={form.hospital || ""} onChange={(e) => setField("hospital", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-department">科室</Label>
                  <Input id="profile-department" value={form.department || ""} onChange={(e) => setField("department", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-title">职称</Label>
                  <Input id="profile-title" value={form.title || ""} onChange={(e) => setField("title", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-doctor-phone">手机号</Label>
                  <Input id="profile-doctor-phone" value={form.phone || ""} onChange={(e) => setField("phone", e.target.value)} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="profile-bio">个人简介</Label>
                  <Textarea id="profile-bio" value={form.bio || ""} onChange={(e) => setField("bio", e.target.value)} placeholder="介绍你的擅长方向、接诊经验和专业背景" />
                </div>
              </>
            )}
          </div>

          <DialogFooter className="border-t border-slate-100 px-6 py-5">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={saving}>
              {saving ? "保存中..." : "修改资料"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import React from "react";
import { Outlet } from "react-router";
import { AppNav } from "./AppNav";

export function RootLayout() {
  return (
    <div className="min-h-screen">
      <AppNav />
      <Outlet />
    </div>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getUser, logout, isAuthenticated } from "@/lib/auth";

export default function Navbar({ onToggleSidebar, showSidebarToggle = false }) {
  const [user, setUserState] = useState(null);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
    setUserState(getUser());
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur-xs">
      <div className="flex items-center gap-3">
        {showSidebarToggle && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden"
            aria-label="Toggle Navigation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-base shadow-xs">
            VZ
          </div>
          <span>
            Vendor<span className="text-emerald-600">Zone</span>
          </span>
        </Link>
      </div>

      {/* User / Auth navigation */}
      <div className="flex items-center gap-3">
        {isAuth && user ? (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">{user.name || user.email}</span>
              <span className="text-xs uppercase tracking-wider text-emerald-600 font-medium">
                {user.role || "User"}
              </span>
            </div>
            <button
              onClick={logout}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
            >
              Log out
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="rounded-lg px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-sm font-medium text-white shadow-xs hover:bg-emerald-700 transition-colors"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

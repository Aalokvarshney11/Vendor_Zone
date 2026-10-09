"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUser } from "@/lib/auth";
import { useState, useEffect } from "react";

import {
  LayoutDashboard,
  User,
  MapPin,
  Calendar,
  Award,
  MessageSquare,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function Sidebar({ role = "vendor", isOpen = false, onClose }) {
  const pathname = usePathname();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const navItems = {
    vendor: [
      { name: "Overview", href: "/vendor", icon: LayoutDashboard },
      { name: "My Profile", href: "/vendor/profile", icon: User },
      { name: "Browse Zones", href: "/vendor/zones", icon: MapPin },
      { name: "Reservations", href: "/vendor/reservations", icon: Calendar },
      { name: "Digital Permits", href: "/vendor/permits", icon: Award },
      { name: "Complaints", href: "/vendor/complaints", icon: MessageSquare },
    ],
    officer: [
      { name: "Overview", href: "/officer", icon: LayoutDashboard },
      { name: "Verify Vendors", href: "/officer/vendors", icon: ShieldCheck },
      { name: "Manage Zones", href: "/officer/zones", icon: MapPin },
      { name: "Reservations", href: "/officer/reservations", icon: Calendar },
      { name: "Complaints", href: "/officer/complaints", icon: MessageSquare },
    ],
    admin: [
      { name: "Overview", href: "/admin", icon: LayoutDashboard },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Zone Management", href: "/admin/zones", icon: MapPin },
      { name: "All Reservations", href: "/admin/reservations", icon: Calendar },
      { name: "All Complaints", href: "/admin/complaints", icon: MessageSquare },
    ],
  };

  const currentNav = navItems[role] || navItems.vendor;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar sidebar element */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white border-r border-slate-200 transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col justify-between p-4">
          <div className="space-y-6">
            {/* User Role Banner */}
            <div className="rounded-lg bg-slate-900 px-3.5 py-3 text-white">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                Portal Role
              </div>
              <div className="text-sm font-bold capitalize text-emerald-400">
                {role} Workspace
              </div>
              {user?.email && (
                <div className="truncate text-xs text-slate-300 mt-1">
                  {user.email}
                </div>
              )}
            </div>

            {/* Navigation links */}
            <nav className="space-y-1">
              {currentNav.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick links at bottom */}
          <div className="border-t border-slate-200 pt-4 text-xs text-slate-500">
            <div className="flex items-center justify-between">
              <span>VendorZone v1.0</span>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                Live
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

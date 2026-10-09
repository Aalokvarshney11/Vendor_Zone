"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getAdminStats,
  getUsers,
  getAllVendors,
  getAdminZones,
  getAdminReservations,
  getAdminComplaints,
} from "@/lib/api";
import { Users, Store, MapPin, Calendar, MessageSquare } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVendors: 0,
    totalZones: 0,
    totalReservations: 0,
    totalComplaints: 0,
    pendingVendors: 0,
    pendingReservations: 0,
    activePermits: 0,
    pendingComplaints: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    setError("");
    try {
      // First try dedicated stats endpoint
      const statsRes = await getAdminStats().catch(() => null);

      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }

      // Also fetch users for the recent accounts preview
      const usersRes = await getUsers().catch(() => ({ users: [] }));
      const usersList = Array.isArray(usersRes) ? usersRes : usersRes.users || [];
      setRecentUsers(usersList.slice(0, 5));

      // If dedicated stats wasn't returned, fallback to counting lists
      if (!statsRes || !statsRes.stats) {
        const [vendorsRes, zonesRes, resRes, compRes] = await Promise.allSettled([
          getAllVendors(),
          getAdminZones(),
          getAdminReservations(),
          getAdminComplaints(),
        ]);

        const vList = vendorsRes.status === "fulfilled" && vendorsRes.value ? (Array.isArray(vendorsRes.value) ? vendorsRes.value : vendorsRes.value.vendors || []) : [];
        const zList = zonesRes.status === "fulfilled" && zonesRes.value ? (Array.isArray(zonesRes.value) ? zonesRes.value : zonesRes.value.zones || []) : [];
        const rList = resRes.status === "fulfilled" && resRes.value ? (Array.isArray(resRes.value) ? resRes.value : resRes.value.reservations || []) : [];
        const cList = compRes.status === "fulfilled" && compRes.value ? (Array.isArray(compRes.value) ? compRes.value : compRes.value.complaints || []) : [];

        setStats({
          totalUsers: usersList.length,
          totalVendors: vList.length,
          totalZones: zList.length,
          totalReservations: rList.length,
          totalComplaints: cList.length,
          pendingVendors: vList.filter((v) => (v.verificationStatus || "pending") === "pending").length,
          pendingReservations: rList.filter((r) => (r.status || "pending") === "pending").length,
          activePermits: rList.filter((r) => (r.status || "") === "approved").length,
          pendingComplaints: cList.filter((c) => (c.status || "pending") === "pending").length,
        });
      }
    } catch {
      setError("Failed to fetch administrative metrics from the backend.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          System Administration Dashboard
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          High-level oversight of municipal street vending infrastructure, users, allocations, and compliance
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          {error}
        </div>
      )}

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/admin/users"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-5 h-5 text-slate-700" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : stats.totalUsers}
          </div>
          <p className="mt-1 text-xs text-slate-500">All registered accounts</p>
        </Link>

        <Link
          href="/admin/users"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Vendors
            </span>
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : stats.totalVendors}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats.pendingVendors} pending verification
          </p>
        </Link>

        <Link
          href="/admin/zones"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Zones
            </span>
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : stats.totalZones}
          </div>
          <p className="mt-1 text-xs text-slate-500">Authorized vending spots</p>
        </Link>

        <Link
          href="/admin/reservations"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Reservations
            </span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : stats.totalReservations}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats.activePermits} active permits
          </p>
        </Link>

        <Link
          href="/admin/complaints"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Complaints
            </span>
            <MessageSquare className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : stats.totalComplaints}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {stats.pendingComplaints} open grievances
          </p>
        </Link>
      </div>

      {/* Navigation Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link
          href="/admin/users"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all shadow-xs"
        >
          <div className="font-bold text-slate-900 text-sm">Manage Users</div>
          <p className="text-xs text-slate-500 mt-1">View vendor, officer & admin accounts</p>
        </Link>

        <Link
          href="/admin/zones"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all shadow-xs"
        >
          <div className="font-bold text-slate-900 text-sm">Manage Zones</div>
          <p className="text-xs text-slate-500 mt-1">Audit capacity & locations</p>
        </Link>

        <Link
          href="/admin/reservations"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all shadow-xs"
        >
          <div className="font-bold text-slate-900 text-sm">All Reservations</div>
          <p className="text-xs text-slate-500 mt-1">Inspect booking transactions & permits</p>
        </Link>

        <Link
          href="/admin/complaints"
          className="rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 transition-all shadow-xs"
        >
          <div className="font-bold text-slate-900 text-sm">All Grievances</div>
          <p className="text-xs text-slate-500 mt-1">Audit dispute resolution records</p>
        </Link>
      </div>

      {/* Recent Users Snapshot */}
      {recentUsers.length > 0 && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-bold text-slate-900">Recent Registered Accounts</h2>
            <Link
              href="/admin/users"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              View All Users →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentUsers.map((u, idx) => (
              <div key={u._id || u.id || idx} className="px-6 py-3.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-900">{u.name || "User"}</span>
                  <span className="text-slate-500 ml-2">({u.email})</span>
                </div>
                <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 font-semibold text-[10px] uppercase text-slate-700">
                  {u.role || "User"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

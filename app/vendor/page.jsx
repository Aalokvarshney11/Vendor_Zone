"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getUser } from "@/lib/auth";
import { getVendorProfile, getMyReservations, getZones, getMyComplaints } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import {
  ShieldCheck,
  Calendar,
  MapPin,
  MessageSquare,
  User,
  Award,
} from "lucide-react";

export default function VendorDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [reservations, setReservations] = useState([]);
  const [zones, setZones] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setUser(getUser());
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError("");
    try {
      // Fetch data in parallel
      const [profileRes, resRes, zonesRes, compRes] = await Promise.allSettled([
        getVendorProfile(),
        getMyReservations(),
        getZones(),
        getMyComplaints(),
      ]);

      if (profileRes.status === "fulfilled" && profileRes.value) {
        setProfile(profileRes.value.profile || profileRes.value);
      }
      if (resRes.status === "fulfilled" && resRes.value) {
        setReservations(Array.isArray(resRes.value) ? resRes.value : resRes.value.reservations || []);
      }
      if (zonesRes.status === "fulfilled" && zonesRes.value) {
        setZones(Array.isArray(zonesRes.value) ? zonesRes.value : zonesRes.value.zones || []);
      }
      if (compRes.status === "fulfilled" && compRes.value) {
        setComplaints(Array.isArray(compRes.value) ? compRes.value : compRes.value.complaints || []);
      }
    } catch (err) {
      setError("Failed to load some dashboard details. Please make sure the backend is active.");
    } finally {
      setLoading(false);
    }
  }

  const verificationStatus = profile?.status || profile?.verificationStatus || "pending";
  const activeReservations = reservations.filter((r) => (r.status || "").toLowerCase() === "approved" || (r.status || "").toLowerCase() === "active");
  const pendingComplaints = complaints.filter((c) => (c.status || "").toLowerCase() === "pending" || (c.status || "").toLowerCase() === "submitted");
  const availableZonesCount = zones.filter((z) => (z.status || "active").toLowerCase() === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, {profile?.businessName || user?.name || "Vendor"}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your vending permits, reservations, and official credentials
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/vendor/zones"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
          >
            + Reserve Vending Zone
          </Link>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          {error}
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Verification Status Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Verification Status
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3 flex items-center gap-2">
            <StatusBadge status={verificationStatus} />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {verificationStatus === "verified" || verificationStatus === "approved"
              ? "Official vendor status active"
              : "Pending municipal verification"}
          </p>
        </div>

        {/* Active Reservations Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Reservations
            </span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : activeReservations.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {reservations.length} total booked slots
          </p>
        </div>

        {/* Available Zones Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Available Zones
            </span>
            <MapPin className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : availableZonesCount}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Open for slot reservations
          </p>
        </div>

        {/* Pending Complaints Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Complaints
            </span>
            <MessageSquare className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : pendingComplaints.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {complaints.length} total reported issues
          </p>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Quick Actions & Portals
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <Link
            href="/vendor/profile"
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-400 hover:shadow-xs transition-all"
          >
            <User className="w-6 h-6 text-slate-700 mb-2" />
            <div>
              <div className="text-sm font-semibold text-slate-900">My Profile</div>
              <div className="text-xs text-slate-500">Update business & ID details</div>
            </div>
          </Link>

          <Link
            href="/vendor/zones"
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-400 hover:shadow-xs transition-all"
          >
            <MapPin className="w-6 h-6 text-slate-700 mb-2" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Browse Zones</div>
              <div className="text-xs text-slate-500">Find approved vending spots</div>
            </div>
          </Link>

          <Link
            href="/vendor/reservations"
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-400 hover:shadow-xs transition-all"
          >
            <Calendar className="w-6 h-6 text-slate-700 mb-2" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Reservations</div>
              <div className="text-xs text-slate-500">Track and manage bookings</div>
            </div>
          </Link>

          <Link
            href="/vendor/permits"
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-400 hover:shadow-xs transition-all"
          >
            <Award className="w-6 h-6 text-slate-700 mb-2" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Digital Permits</div>
              <div className="text-xs text-slate-500">View official QR badges</div>
            </div>
          </Link>

          <Link
            href="/vendor/complaints"
            className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-400 hover:shadow-xs transition-all"
          >
            <MessageSquare className="w-6 h-6 text-slate-700 mb-2" />
            <div>
              <div className="text-sm font-semibold text-slate-900">Complaints</div>
              <div className="text-xs text-slate-500">Report disputes & harassment</div>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Reservations Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Slot Reservations</h2>
            <p className="text-xs text-slate-500">Your latest zone bookings</p>
          </div>
          <Link
            href="/vendor/reservations"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading reservations...</div>
          ) : reservations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No reservations yet.{" "}
              <Link href="/vendor/zones" className="text-emerald-600 font-semibold underline">
                Browse available zones
              </Link>{" "}
              to make your first booking.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Zone</th>
                  <th className="px-6 py-3">Start Date</th>
                  <th className="px-6 py-3">End Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reservations.slice(0, 4).map((r, idx) => (
                  <tr key={r._id || r.id || idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      {r.zoneId?.name || r.zone?.name || r.zoneName || "Designated Zone"}
                    </td>
                    <td className="px-6 py-3.5">
                      {r.startDate ? new Date(r.startDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-3.5">
                      {r.endDate ? new Date(r.endDate).toLocaleDateString() : "N/A"}
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={r.status || "pending"} />
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      {((r.status || "").toLowerCase() === "approved" && r.permitId) && (
                        <Link
                          href={`/verify/${r.permitId}`}
                          className="font-semibold text-emerald-600 hover:text-emerald-700 mr-2"
                        >
                          View Permit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

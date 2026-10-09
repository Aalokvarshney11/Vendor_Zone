"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getVendors, getZones, getReservations, getOfficerComplaints } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import { ShieldCheck, MapPin, Calendar, MessageSquare } from "lucide-react";

export default function OfficerDashboard() {
  const [vendors, setVendors] = useState([]);
  const [zones, setZones] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadOfficerStats();
  }, []);

  async function loadOfficerStats() {
    setLoading(true);
    setError("");
    try {
      const [vRes, zRes, rRes, cRes] = await Promise.allSettled([
        getVendors(),
        getZones(),
        getReservations(),
        getOfficerComplaints(),
      ]);

      if (vRes.status === "fulfilled" && vRes.value) {
        setVendors(Array.isArray(vRes.value) ? vRes.value : vRes.value.vendors || []);
      }
      if (zRes.status === "fulfilled" && zRes.value) {
        setZones(Array.isArray(zRes.value) ? zRes.value : zRes.value.zones || []);
      }
      if (rRes.status === "fulfilled" && rRes.value) {
        setReservations(Array.isArray(rRes.value) ? rRes.value : rRes.value.reservations || []);
      }
      if (cRes.status === "fulfilled" && cRes.value) {
        setComplaints(Array.isArray(cRes.value) ? cRes.value : cRes.value.complaints || []);
      }
    } catch {
      setError("Unable to load officer metrics. Check server connectivity.");
    } finally {
      setLoading(false);
    }
  }

  const pendingVendors = vendors.filter(
    (v) => (v.status || v.verificationStatus || "pending").toLowerCase() === "pending"
  );
  const pendingReservations = reservations.filter(
    (r) => (r.status || "pending").toLowerCase() === "pending"
  );
  const pendingComplaints = complaints.filter(
    (c) => (c.status || "submitted").toLowerCase() === "pending" || (c.status || "").toLowerCase() === "submitted"
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Municipal Officer Control Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review vendor registrations, allocate zone capacity, approve slot reservations, and address field grievances
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/officer/vendors"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Vendors
            </span>
            <ShieldCheck className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {loading ? "..." : pendingVendors.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {vendors.length} total registered vendors
          </p>
        </Link>

        <Link
          href="/officer/zones"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Managed Zones
            </span>
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {loading ? "..." : zones.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">Active municipal areas</p>
        </Link>

        <Link
          href="/officer/reservations"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-600">
            {loading ? "..." : pendingReservations.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {reservations.length} total reservation requests
          </p>
        </Link>

        <Link
          href="/officer/complaints"
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Open Grievances
            </span>
            <MessageSquare className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-600">
            {loading ? "..." : pendingComplaints.length}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {complaints.length} total filed complaints
          </p>
        </Link>
      </div>

      {/* Two Column Section: Pending Vendors & Pending Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Vendors Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pending Vendor Verifications</h2>
              <p className="text-xs text-slate-500">Requires identity approval</p>
            </div>
            <Link
              href="/officer/vendors"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Review All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading vendors...</div>
            ) : pendingVendors.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No vendors currently waiting for verification.
              </div>
            ) : (
              pendingVendors.slice(0, 4).map((v, idx) => (
                <div key={v._id || v.id || idx} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{v.name || v.businessName || "Vendor"}</div>
                    <div className="text-[11px] text-slate-500">
                      {v.businessType || "Retail"} • ID: {v.idNumber || v.aadhaarNumber || "N/A"}
                    </div>
                  </div>
                  <Link
                    href="/officer/vendors"
                    className="rounded-md bg-emerald-50 border border-emerald-300 px-3 py-1 font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    Inspect
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Reservations Card */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pending Slot Reservations</h2>
              <p className="text-xs text-slate-500">Requires zone allocation approval</p>
            </div>
            <Link
              href="/officer/reservations"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
            >
              Review All →
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {loading ? (
              <div className="p-8 text-center text-slate-500">Loading reservations...</div>
            ) : pendingReservations.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No pending reservation requests.
              </div>
            ) : (
              pendingReservations.slice(0, 4).map((r, idx) => (
                <div key={r._id || r.id || idx} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">
                      {r.zoneId?.name || r.zone?.name || r.zoneName || "Vending Zone"}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Vendor: {r.vendorId?.businessName || r.vendorId?.userId?.name || r.vendor?.name || "Registered Vendor"} •{" "}
                      {r.startDate ? new Date(r.startDate).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <Link
                    href="/officer/reservations"
                    className="rounded-md bg-emerald-50 border border-emerald-300 px-3 py-1 font-semibold text-emerald-700 hover:bg-emerald-100"
                  >
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

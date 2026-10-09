"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getAdminReservations } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminReservations();
      const list = Array.isArray(data) ? data : data.reservations || [];
      setReservations(list);
    } catch (err) {
      setError(err.message || "Failed to load platform reservations.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = reservations.filter((r) => {
    const status = (r.status || "pending").toLowerCase();
    const matchesStatus = statusFilter === "all" ? true : status === statusFilter;
    const q = search.toLowerCase();
    const vendor = r.vendorId || r.vendor;
    const zone = r.zoneId || r.zone;

    const vendorName = (vendor?.businessName || vendor?.userId?.name || vendor?.name || "").toLowerCase();
    const zoneName = (zone?.name || "").toLowerCase();
    const permitId = (r.permitId || "").toLowerCase();

    const matchesSearch =
      vendorName.includes(q) || zoneName.includes(q) || permitId.includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            All Municipal Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Global ledger of all street vending bookings, permit statuses, and active authorizations
          </p>
        </div>

        {/* Filter and Search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved & Active</option>
            <option value="pending">Pending Review</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>

          <input
            type="text"
            placeholder="Search vendor, zone, permit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Loading reservations...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No reservations found matching your filter criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Vendor & Business</th>
                  <th className="px-6 py-3.5">Zone & Capacity</th>
                  <th className="px-6 py-3.5">Validity Dates</th>
                  <th className="px-6 py-3.5">Permit Number</th>
                  <th className="px-6 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((r) => {
                  const id = r._id || r.id;
                  const status = (r.status || "pending").toLowerCase();
                  const vendor = r.vendorId || r.vendor;
                  const zone = r.zoneId || r.zone;

                  return (
                    <tr key={id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {vendor?.businessName || vendor?.name || "Vendor"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {vendor?.userId?.name ? `${vendor.userId.name} (${vendor.userId.email})` : vendor?.businessType || "Retail"}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-800">
                        <div>{zone?.name || "Vending Zone"}</div>
                        <div className="text-[11px] text-slate-500">
                          Occupancy: {zone?.occupiedSpaces || 0} / {zone?.capacity || "N/A"} slots
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-800">
                        {r.startDate ? new Date(r.startDate).toLocaleDateString() : "N/A"} —{" "}
                        {r.endDate ? new Date(r.endDate).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px]">
                        {r.permitId ? (
                          <Link
                            href={`/verify/${r.permitId}`}
                            target="_blank"
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            {r.permitId} ↗
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <StatusBadge status={status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

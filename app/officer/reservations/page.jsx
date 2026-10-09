"use client";

import { useEffect, useState } from "react";
import { getOfficerPendingReservations, getAdminReservations, approveReservation, rejectReservation } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { Check, X } from "lucide-react";

export default function OfficerReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    loadReservations();
  }, [filter]);

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const data = filter === "pending"
        ? await getOfficerPendingReservations()
        : await getAdminReservations().catch(() => getOfficerPendingReservations());
      const list = Array.isArray(data) ? data : data.reservations || [];
      setReservations(list);
    } catch (err) {
      setError(err.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    setActionLoading(id);
    try {
      await approveReservation(id);
      await loadReservations();
    } catch (err) {
      alert(err.message || "Failed to approve reservation.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    if (!confirm("Are you sure you want to reject this reservation request?")) return;

    setActionLoading(id);
    try {
      await rejectReservation(id);
      await loadReservations();
    } catch (err) {
      alert(err.message || "Failed to reject reservation.");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = reservations.filter((r) => {
    const status = (r.status || "pending").toLowerCase();
    if (filter === "all") return true;
    return status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Slot Reservations & Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review vendor slot booking applications, issue digital permits, and enforce zone capacity limits
          </p>
        </div>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="pending">Pending Review</option>
          <option value="approved">Approved & Active</option>
          <option value="rejected">Rejected</option>
          <option value="all">All Reservations</option>
        </select>
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
              No reservations found under this filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Vendor & Business</th>
                  <th className="px-6 py-3.5">Zone & Capacity</th>
                  <th className="px-6 py-3.5">Dates Requested</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Permit ID</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filtered.map((r) => {
                  const id = r._id || r.id;
                  const status = (r.status || "pending").toLowerCase();
                  const isPending = status === "pending";
                  const vendor = r.vendorId || r.vendor;
                  const zone = r.zoneId || r.zone;

                  return (
                    <tr key={id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {vendor?.businessName || vendor?.name || "Registered Vendor"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Category: <span className="font-semibold uppercase text-slate-700">{vendor?.businessType || "Retail"}</span>{" "}
                          {vendor?.phone ? `• ${vendor.phone}` : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {zone?.name || "Vending Zone"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          Occupancy: {zone?.occupiedSpaces || 0} / {zone?.capacity || "N/A"} slots
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {r.startDate ? new Date(r.startDate).toLocaleDateString() : "N/A"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          until {r.endDate ? new Date(r.endDate).toLocaleDateString() : "N/A"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-slate-600">
                        {r.permitId ? (
                          <span className="font-bold text-emerald-700">{r.permitId}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleApprove(id)}
                                loading={actionLoading === id}
                                className="inline-flex items-center text-[11px] bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                <span>Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(id)}
                                loading={actionLoading === id}
                                className="inline-flex items-center text-[11px] text-rose-600 hover:bg-rose-50 border-rose-200"
                              >
                                <X className="w-3.5 h-3.5 mr-1" />
                                <span>Reject</span>
                              </Button>
                            </>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium capitalize">
                              {status}
                            </span>
                          )}
                        </div>
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

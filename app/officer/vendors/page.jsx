"use client";

import { useEffect, useState } from "react";
import { getPendingVendors, getAllVendors, verifyVendor, rejectVendor } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { Check, X } from "lucide-react";

export default function OfficerVendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadVendors();
  }, [filter]);

  async function loadVendors() {
    setLoading(true);
    setError("");
    try {
      // If filter is pending, fetch pending endpoint, else all
      const data = filter === "pending" ? await getPendingVendors() : await getAllVendors().catch(() => getPendingVendors());
      const list = Array.isArray(data) ? data : data.vendors || [];
      setVendors(list);
    } catch (err) {
      setError(err.message || "Failed to load vendors from the server.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(id) {
    setActionLoading(id);
    try {
      await verifyVendor(id);
      await loadVendors();
    } catch (err) {
      alert(err.message || "Failed to verify vendor.");
    } finally {
      setActionLoading(null);
    }
  }

  async function handleReject(id) {
    if (!confirm("Are you sure you want to reject this vendor's verification request?")) return;

    setActionLoading(id);
    try {
      await rejectVendor(id);
      await loadVendors();
    } catch (err) {
      alert(err.message || "Failed to reject vendor.");
    } finally {
      setActionLoading(null);
    }
  }

  const filteredVendors = vendors.filter((v) => {
    const status = (v.verificationStatus || v.status || "pending").toLowerCase();
    const matchesFilter = filter === "all" ? true : status === filter;
    const q = search.toLowerCase();
    const name = (v.userId?.name || v.name || "").toLowerCase();
    const bName = (v.businessName || "").toLowerCase();
    const phone = (v.phone || "").toLowerCase();
    const email = (v.userId?.email || "").toLowerCase();

    return (
      matchesFilter &&
      (name.includes(q) || bName.includes(q) || phone.includes(q) || email.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Vendor Verification & Credentials
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review street vendor identities, trade categories, and approve municipal vending status
          </p>
        </div>

        {/* Filter and search */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="pending">Pending Verifications</option>
            <option value="verified">Verified Vendors</option>
            <option value="rejected">Rejected</option>
            <option value="all">All Vendors</option>
          </select>

          <input
            type="text"
            placeholder="Search vendor, stall, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Vendors Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Loading vendors list...
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No vendors found under this filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Vendor & User</th>
                  <th className="px-6 py-3.5">Trade Category</th>
                  <th className="px-6 py-3.5">Contact Phone</th>
                  <th className="px-6 py-3.5">Operating Address</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredVendors.map((vendor) => {
                  const id = vendor._id || vendor.id;
                  const status = (vendor.verificationStatus || vendor.status || "pending").toLowerCase();
                  const isPending = status === "pending";

                  return (
                    <tr key={id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">
                          {vendor.businessName || "Unnamed Stall"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {vendor.userId?.name || "Vendor"}{" "}
                          {vendor.userId?.email ? `• ${vendor.userId.email}` : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded bg-slate-100 px-2.5 py-1 font-semibold uppercase text-slate-700 text-[10px]">
                          {vendor.businessType || "General"}
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-slate-800">
                        {vendor.phone || "No phone"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-800 text-[11px] truncate max-w-xs">
                          {vendor.address || "No address provided"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending ? (
                            <>
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleVerify(id)}
                                loading={actionLoading === id}
                                className="inline-flex items-center text-[11px] bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Check className="w-3.5 h-3.5 mr-1" />
                                <span>Verify</span>
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

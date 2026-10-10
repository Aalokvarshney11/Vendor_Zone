"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyReservations, cancelReservation, getPermit } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { QRCodeSVG } from "qrcode.react";
import { Award, Printer, ExternalLink } from "lucide-react";

export default function VendorReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Permit viewer modal
  const [activePermit, setActivePermit] = useState(null);
  const [permitLoading, setPermitLoading] = useState(false);

  useEffect(() => {
    loadReservations();
  }, []);

  async function loadReservations() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyReservations();
      const list = Array.isArray(data) ? data : data.reservations || [];
      setReservations(list);
    } catch (err) {
      setError(err.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(id) {
    if (!confirm("Are you sure you want to cancel this reservation?")) return;

    setActionLoading(true);
    try {
      await cancelReservation(id);
      await loadReservations();
    } catch (err) {
      alert(err.message || "Failed to cancel reservation.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleViewPermit(r) {
    setPermitLoading(true);
    setActivePermit(r);
    try {
      const data = await getPermit(r._id || r.id);
      if (data.permit) {
        setActivePermit({
          ...r,
          ...data.permit,
        });
      }
    } catch (err) {
      console.log("Could not load fresh permit data:", err);
    } finally {
      setPermitLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            My Slot Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track all submitted and approved vending zone permits
          </p>
        </div>
        <Link
          href="/vendor/zones"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700 transition-colors"
        >
          + Book New Zone Slot
        </Link>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              Loading your reservations...
            </div>
          ) : reservations.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No reservations found.{" "}
              <Link href="/vendor/zones" className="text-emerald-600 font-semibold underline">
                Browse available zones
              </Link>{" "}
              to make your first booking.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Zone</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5">End Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Permit ID</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reservations.map((r, idx) => {
                  const status = (r.status || "pending").toLowerCase();
                  const isApproved = status === "approved";
                  const canCancel = status === "pending" || status === "approved";
                  const permitId = r.permitId;

                  return (
                    <tr key={r._id || r.id || idx} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">
                          {r.zoneId?.name || r.zone?.name || "Designated Zone"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {r.zoneId?.description || "Municipal Vending Zone"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {r.startDate ? new Date(r.startDate).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        {r.endDate ? new Date(r.endDate).toLocaleDateString() : "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={status} />
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px]">
                        {permitId ? (
                          <span className="font-bold text-emerald-700">{permitId}</span>
                        ) : (
                          <span className="text-slate-400">Pending Officer Approval</span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isApproved && (
                            <button
                              type="button"
                              onClick={() => handleViewPermit(r)}
                              className="inline-flex items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>View Permit</span>
                            </button>
                          )}

                          {canCancel && (
                            <button
                              type="button"
                              onClick={() => handleCancel(r._id || r.id)}
                              disabled={actionLoading}
                              className="rounded-md border border-rose-200 bg-white px-2.5 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-50"
                            >
                              Cancel
                            </button>
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

      {/* Digital Permit Modal */}
      <Modal
        isOpen={!!activePermit}
        onClose={() => setActivePermit(null)}
        title="Official Municipal Digital Permit"
      >
        {activePermit && (
          <div className="space-y-4 text-xs">
            {permitLoading ? (
              <div className="py-8 text-center text-slate-500">Loading permit certificate...</div>
            ) : (
              <div className="rounded-xl border-2 border-emerald-600 bg-white p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Municipal Corporation of Street Vendors
                    </div>
                    <div className="text-base font-black text-slate-900">
                      OFFICIAL VENDING PERMIT
                    </div>
                  </div>
                  <StatusBadge status={activePermit.status || "approved"} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div className="space-y-2.5">
                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        Trade Name
                      </span>
                      <div className="font-bold text-slate-900 text-sm">
                        {activePermit.businessName || "Authorized Vendor"}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        Trade Category
                      </span>
                      <div className="font-semibold text-slate-800 uppercase">
                        {activePermit.businessType || "Retail"}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        Designated Zone
                      </span>
                      <div className="font-semibold text-emerald-800">
                        {activePermit.zone?.name || activePermit.zoneId?.name || "Municipal Zone"}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        Validity Period
                      </span>
                      <div className="font-medium text-slate-800">
                        {activePermit.startDate ? new Date(activePermit.startDate).toLocaleDateString() : "N/A"} —{" "}
                        {activePermit.endDate ? new Date(activePermit.endDate).toLocaleDateString() : "N/A"}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                        Permit Reference ID
                      </span>
                      <div className="font-mono text-xs font-bold text-slate-900">
                        {activePermit.permitId}
                      </div>
                    </div>
                  </div>

                  {/* QR Code */}
                  <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                    <div className="p-2.5 bg-white rounded-xl shadow-xs border border-slate-200 flex items-center justify-center">
                      {activePermit.qrCode ? (
                        <img
                          src={activePermit.qrCode}
                          alt="Permit QR Code"
                          className="w-32 h-32 object-contain"
                        />
                      ) : activePermit.permitId ? (
                        <QRCodeSVG
                          value={
                            typeof window !== "undefined"
                              ? `${window.location.origin}/verify/${activePermit.permitId}`
                              : `http://localhost:3000/verify/${activePermit.permitId}`
                          }
                          size={120}
                          level="H"
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                        />
                      ) : (
                        <div className="w-32 h-32 flex items-center justify-center text-slate-400 text-xs text-center p-2">
                          QR Pending Approval
                        </div>
                      )}
                    </div>
                    <span className="mt-2 text-[10px] font-semibold text-slate-500">
                      Scan to verify live on municipal registry
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              {activePermit.permitId && (
                <Link
                  href={`/verify/${activePermit.permitId}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-50 text-xs"
                >
                  <span>Public Verification Page</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
              <Button
                variant="primary"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Permit</span>
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

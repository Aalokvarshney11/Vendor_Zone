"use client";

import { useEffect, useState } from "react";
import { getAdminComplaints, updateAdminComplaint } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { ShieldCheck } from "lucide-react";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Resolution modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [status, setStatus] = useState("resolved");
  const [resolution, setResolution] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminComplaints();
      const list = Array.isArray(data) ? data : data.complaints || [];
      setComplaints(list);
    } catch (err) {
      setError(err.message || "Failed to load platform complaints.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenResolution(c) {
    setSelectedComplaint(c);
    setStatus(c.status || "resolved");
    setResolution(c.resolution || "");
    setModalMsg({ type: "", text: "" });
  }

  async function handleSaveResolution(e) {
    e.preventDefault();
    if (!selectedComplaint) return;

    setSaving(true);
    setModalMsg({ type: "", text: "" });

    try {
      await updateAdminComplaint(selectedComplaint._id || selectedComplaint.id, {
        status,
        resolution,
      });

      setModalMsg({ type: "success", text: "Complaint updated successfully!" });
      await loadComplaints();

      setTimeout(() => {
        setSelectedComplaint(null);
      }, 1200);
    } catch (err) {
      setModalMsg({ type: "error", text: err.message || "Failed to update complaint." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Municipal Grievance Redressal Audit
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit vendor dispute filings, resolve jurisdiction complaints, and monitor compliance enforcement
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Complaints List */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading complaints...
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500 bg-white">
          No complaints registered in the system.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const id = c._id || c.id;
            const currentStatus = (c.status || "pending").toLowerCase();
            const vendor = c.vendorId;

            return (
              <div
                key={id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="font-bold text-slate-900 text-sm">
                      {c.subject || c.title || "Grievance Record"}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Vendor: <span className="font-semibold text-slate-700">{vendor?.businessName || vendor?.name || "Vendor"}</span>{" "}
                      {vendor?.phone ? `• ${vendor.phone}` : ""} •{" "}
                      Filed on {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={currentStatus} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenResolution(c)}
                      className="text-xs"
                    >
                      Update / Resolve
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {c.description}
                </div>

                {c.resolution && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Official Resolution Logged</span>
                    </div>
                    <p className="text-emerald-800">{c.resolution}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Resolution Modal */}
      <Modal
        isOpen={!!selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
        title="Admin Dispute Resolution"
      >
        {selectedComplaint && (
          <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
            {modalMsg.text && (
              <div
                className={`rounded-lg p-3 text-xs font-medium border ${
                  modalMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {modalMsg.text}
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
              <div className="font-bold text-slate-900">
                {selectedComplaint.subject || selectedComplaint.title}
              </div>
              <div className="text-slate-600 line-clamp-2">{selectedComplaint.description}</div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="resolved">Resolved</option>
                <option value="in_progress">In Progress</option>
                <option value="rejected">Rejected / Invalid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Resolution Remarks
              </label>
              <textarea
                rows={4}
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                Save
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

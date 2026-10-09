"use client";

import { useEffect, useState } from "react";
import { getOfficerComplaints, updateComplaint } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import { ShieldCheck } from "lucide-react";

export default function OfficerComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Resolution Modal
  const [activeComplaint, setActiveComplaint] = useState(null);
  const [resStatus, setResStatus] = useState("resolved");
  const [resolutionText, setResolutionText] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    setError("");
    try {
      const data = await getOfficerComplaints();
      const list = Array.isArray(data) ? data : data.complaints || [];
      setComplaints(list);
    } catch (err) {
      setError(err.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenResolution(complaint) {
    setActiveComplaint(complaint);
    setResStatus(complaint.status || "resolved");
    setResolutionText(complaint.resolution || "");
    setModalMsg({ type: "", text: "" });
  }

  async function handleSaveResolution(e) {
    e.preventDefault();
    if (!activeComplaint) return;

    setSaving(true);
    setModalMsg({ type: "", text: "" });

    try {
      await updateComplaint(activeComplaint._id || activeComplaint.id, {
        status: resStatus,
        resolution: resolutionText,
      });

      setModalMsg({ type: "success", text: "Complaint resolution updated successfully!" });
      await loadComplaints();

      setTimeout(() => {
        setActiveComplaint(null);
      }, 1200);
    } catch (err) {
      setModalMsg({
        type: "error",
        text: err.message || "Failed to update complaint resolution.",
      });
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
            Grievance Redressal & Field Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review complaints filed by street vendors regarding harassment, zoning disputes, or municipal issues
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
          No complaints registered in this jurisdiction.
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const id = c._id || c.id;
            const status = (c.status || "pending").toLowerCase();
            const vendor = c.vendorId;

            return (
              <div
                key={id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {c.subject || c.title || "Grievance Record"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Vendor: <span className="font-semibold text-slate-700">{vendor?.businessName || vendor?.name || "Vendor"}</span>{" "}
                      {vendor?.phone ? `• ${vendor.phone}` : ""} •{" "}
                      Filed on {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently"}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={status} />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenResolution(c)}
                      className="text-xs"
                    >
                      Resolve / Update
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {c.description}
                </div>

                {c.resolution && (
                  <div className="rounded-lg bg-emerald-50/80 border border-emerald-200 p-3 text-xs space-y-1">
                    <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-700" />
                      <span>Official Resolution Recorded</span>
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
        isOpen={!!activeComplaint}
        onClose={() => setActiveComplaint(null)}
        title="Update Grievance Resolution"
      >
        {activeComplaint && (
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
                {activeComplaint.subject || activeComplaint.title}
              </div>
              <div className="text-slate-600 line-clamp-2">{activeComplaint.description}</div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Resolution Status
              </label>
              <select
                value={resStatus}
                onChange={(e) => setResStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="in_progress">In Investigation / Progress</option>
                <option value="resolved">Resolved / Action Taken</option>
                <option value="rejected">Dismissed / Invalid</option>
                <option value="pending">Pending Review</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Official Resolution Remarks & Action Taken <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Explain the inspection outcome, action taken by municipal team, or redressal details..."
                value={resolutionText}
                onChange={(e) => setResolutionText(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActiveComplaint(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={saving}
              >
                Save Resolution
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

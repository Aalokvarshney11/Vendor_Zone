"use client";

import { useEffect, useState } from "react";
import { getMyComplaints, createComplaint } from "@/lib/api";
import Button from "@/components/Button";
import Input from "@/components/Input";
import StatusBadge from "@/components/StatusBadge";
import { ShieldCheck } from "lucide-react";

export default function VendorComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formMsg, setFormMsg] = useState({ type: "", text: "" });

  const [formData, setFormData] = useState({
    subject: "",
    description: "",
  });

  useEffect(() => {
    loadComplaints();
  }, []);

  async function loadComplaints() {
    setLoading(true);
    setError("");
    try {
      const data = await getMyComplaints();
      const list = Array.isArray(data) ? data : data.complaints || [];
      setComplaints(list);
    } catch (err) {
      setError(err.message || "Failed to load complaints.");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormMsg({ type: "", text: "" });

    try {
      await createComplaint({
        subject: formData.subject,
        description: formData.description,
      });

      setFormMsg({
        type: "success",
        text: "Grievance filed successfully. A municipal officer will review it shortly.",
      });

      setFormData({
        subject: "",
        description: "",
      });

      await loadComplaints();
    } catch (err) {
      setFormMsg({
        type: "error",
        text: err.message || "Failed to submit grievance.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Grievances & Complaint Redressal
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Report municipal zoning issues, unauthorized eviction, extortion, or slot disputes
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Grid: Form on left/top, Submitted Complaints list on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Complaint Form */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs sticky top-24">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              File New Grievance
            </h2>

            {formMsg.text && (
              <div
                className={`mb-4 rounded-lg p-3 text-xs font-medium border ${
                  formMsg.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Complaint Subject / Title"
                id="subject"
                name="subject"
                placeholder="e.g. Unauthorized eviction attempt at Subhash Chowk"
                value={formData.subject}
                onChange={handleChange}
                required
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Detailed Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  name="description"
                  rows={5}
                  placeholder="Provide date, time, location facts, and specific details regarding the incident..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full text-xs mt-2"
              >
                Submit Grievance
              </Button>
            </form>
          </div>
        </div>

        {/* Complaints List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            My Submitted Grievances ({complaints.length})
          </h2>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-500">
              Loading complaints history...
            </div>
          ) : complaints.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-500 bg-white">
              No grievances filed. Your complaint history will appear here.
            </div>
          ) : (
            <div className="space-y-4">
              {complaints.map((c, idx) => {
                const status = (c.status || "pending").toLowerCase();

                return (
                  <div
                    key={c._id || c.id || idx}
                    className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {c.subject || c.title || "Grievance Record"}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Filed on{" "}
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "Recently"}
                        </div>
                      </div>
                      <StatusBadge status={status} />
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/50 p-3.5 rounded-lg whitespace-pre-wrap">
                      {c.description}
                    </p>

                    {/* Official Resolution Section */}
                    {c.resolution && (
                      <div className="rounded-lg bg-emerald-50/90 border border-emerald-200 p-3.5 text-xs space-y-1">
                        <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-emerald-700" />
                          <span>Official Municipal Resolution</span>
                        </div>
                        <p className="text-emerald-800 leading-relaxed">{c.resolution}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

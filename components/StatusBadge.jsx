// Clean status badge component for reservations, permits, complaints, etc.
export default function StatusBadge({ status, className = "" }) {
  const normalized = (status || "unknown").toLowerCase().replace(/[\s-]/g, "_");

  const styles = {
    // Green / Success
    active: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
    valid: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",
    resolved: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-600/20",

    // Amber / Pending / In Progress
    pending: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20",
    in_review: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-600/20",
    submitted: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-600/20",

    // Red / Danger / Inactive
    rejected: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20",
    cancelled: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20",
    expired: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20",
    invalid: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-600/20",
    inactive: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20",
    closed: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20",
  };

  const currentStyle = styles[normalized] || "bg-slate-100 text-slate-700 border-slate-200 ring-slate-600/20";
  const displayLabel = (status || "Unknown").replace(/_/g, " ").toUpperCase();

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide border shadow-xs ${currentStyle} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {displayLabel}
    </span>
  );
}

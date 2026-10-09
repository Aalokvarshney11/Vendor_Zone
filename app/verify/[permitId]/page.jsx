"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { verifyPermit } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { X, RefreshCw, MapPin, ShieldCheck, ArrowRight } from "lucide-react";

export default function PublicVerifyPage() {
  const params = useParams();
  const permitId = params?.permitId;

  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifiedAt, setVerifiedAt] = useState(null);

  useEffect(() => {
    if (permitId) {
      checkPermit();
    }
  }, [permitId]);

  async function checkPermit() {
    setLoading(true);
    setError("");
    try {
      const data = await verifyPermit(permitId);
      setVerificationData(data);
      setVerifiedAt(new Date().toLocaleTimeString());
    } catch (err) {
      setError(
        err.message ||
          "Permit could not be verified against the municipal registry. It may be invalid or not yet registered."
      );
      setVerifiedAt(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }

  const permit = verificationData?.permit;
  const isValid = verificationData?.valid === true;

  // Determine status display
  let statusText = "VALID PERMIT";
  let statusColor = "bg-emerald-600 text-white border-emerald-500";
  let isInvalid = false;

  if (error || !permit || verificationData?.valid === false) {
    isInvalid = true;
    const msg = verificationData?.message || error;
    if (msg && msg.toLowerCase().includes("expired")) {
      statusText = "EXPIRED PERMIT";
      statusColor = "bg-amber-600 text-white border-amber-500";
    } else if (msg && msg.toLowerCase().includes("not active yet")) {
      statusText = "NOT YET ACTIVE";
      statusColor = "bg-blue-600 text-white border-blue-500";
    } else {
      statusText = "INVALID PERMIT";
      statusColor = "bg-rose-600 text-white border-rose-500";
    }
  } else {
    statusText = "OFFICIAL VALID PERMIT";
    statusColor = "bg-emerald-600 text-white border-emerald-500";
  }

  function formatZone(zone) {
    if (!zone) return "Municipal Designated Zone";
    if (typeof zone === "string") return zone;
    return zone.name || "Municipal Designated Zone";
  }

  function formatLocation(loc) {
    if (!loc) return "Municipal Area";
    if (typeof loc === "string") return loc;
    if (loc.coordinates && Array.isArray(loc.coordinates)) {
      return `${loc.coordinates[1].toFixed(4)}°N, ${loc.coordinates[0].toFixed(4)}°E`;
    }
    return "Municipal Coordinates";
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
              VZ
            </div>
            <span>
              Vendor<span className="text-emerald-600">Zone</span>
            </span>
          </Link>
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Public Civic Verification Portal
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-xl space-y-6">
          {/* Card */}
          <div className="rounded-2xl border-2 border-slate-200 bg-white shadow-md overflow-hidden">
            {/* Status Banner */}
            <div className={`p-6 text-center border-b ${statusColor}`}>
              <div className="text-xs font-bold uppercase tracking-widest opacity-90">
                Municipal Corporation of Street Vendors
              </div>
              <h1 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight">
                {loading ? "VERIFYING PERMIT..." : statusText}
              </h1>
              {verifiedAt && (
                <div className="mt-1 text-[11px] opacity-90">
                  Verified in real-time at {verifiedAt}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8 space-y-6">
              {loading ? (
                <div className="py-12 text-center text-xs text-slate-500">
                  Contacting official municipal registry...
                </div>
              ) : isInvalid ? (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 font-bold">
                    <X className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      {verificationData?.message || "No Valid Permit Found"}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 max-w-md mx-auto">
                      Permit ID <span className="font-mono font-bold text-slate-900">{permitId}</span> is either expired, revoked, or not registered in the active municipal registry.
                    </p>
                  </div>
                  {error && (
                    <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                      {error}
                    </div>
                  )}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkPermit}
                      className="inline-flex items-center gap-1.5 text-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Re-check Registry</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 text-xs">
                  {/* Seal / Reference ID */}
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Permit Reference ID
                      </div>
                      <div className="font-mono font-bold text-base text-slate-900">
                        {permit.permitId || permitId}
                      </div>
                    </div>
                    <StatusBadge status={permit.status || "approved"} />
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Authorized Vending Trade
                      </span>
                      <div className="font-bold text-sm text-slate-900">
                        {permit.businessName || "Authorized Trade"}
                      </div>
                      <div className="text-[11px] text-slate-600 uppercase font-semibold">
                        Category: {permit.businessType || "Retail"}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Designated Vending Zone
                      </span>
                      <div className="font-bold text-sm text-emerald-800">
                        {formatZone(permit.zone)}
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{formatLocation(permit.zone?.location)}</span>
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Valid From
                      </span>
                      <div className="font-semibold text-slate-900">
                        {permit.startDate ? new Date(permit.startDate).toLocaleDateString() : "N/A"}
                      </div>
                    </div>

                    <div className="rounded-lg bg-slate-50 p-3.5 border border-slate-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Valid Until
                      </span>
                      <div className="font-semibold text-slate-900">
                        {permit.endDate ? new Date(permit.endDate).toLocaleDateString() : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Official Notice */}
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-3 text-[11px] text-emerald-900 flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">Authentic Municipal Certificate</div>
                      <p className="mt-0.5 text-emerald-800">
                        This street vendor holds legal municipal authorization to vend within the designated zone during the stated validity window.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
              <span>Secure Digital Municipal Registry</span>
              <Link href="/" className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700">
                <span>VendorZone Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

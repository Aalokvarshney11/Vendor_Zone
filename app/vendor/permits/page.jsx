"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getMyReservations, getVendorProfile } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Award, ExternalLink } from "lucide-react";

export default function VendorPermitsPage() {
  const [permits, setPermits] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadPermits();
  }, []);

  async function loadPermits() {
    setLoading(true);
    setError("");
    try {
      const [resData, profData] = await Promise.allSettled([
        getMyReservations(),
        getVendorProfile(),
      ]);

      if (profData.status === "fulfilled" && profData.value) {
        setProfile(profData.value.vendor || profData.value.profile || profData.value);
      }

      if (resData.status === "fulfilled" && resData.value) {
        const list = Array.isArray(resData.value)
          ? resData.value
          : resData.value.reservations || [];
        // Filter approved permits that have permitId
        const approvedList = list.filter(
          (r) =>
            (r.status || "").toLowerCase() === "approved" && r.permitId
        );
        setPermits(approvedList);
      }
    } catch (err) {
      setError(err.message || "Failed to load digital permits.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Digital Vending Permits & QR Certificates
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official municipal authorizations with tamper-proof QR code verification
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 text-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print All Permits</span>
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading digital permits...
        </div>
      ) : permits.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500 bg-white">
          <Award className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <div className="font-semibold text-slate-800 text-sm">No Active Permits Found</div>
          <p className="mt-1 text-slate-500 max-w-md mx-auto">
            Permits are automatically generated once your vending zone reservations are approved by a municipal officer.
          </p>
          <div className="mt-4">
            <Link
              href="/vendor/zones"
              className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-emerald-700"
            >
              Browse & Reserve Zones
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {permits.map((permit) => {
            const permitId = permit.permitId;
            const vendorName =
              profile?.businessName || "Registered Trade";
            const businessType =
              profile?.businessType || permit.businessType || "General";
            const zoneName =
              permit.zoneId?.name || permit.zone?.name || "Designated Municipal Zone";
            const zoneDesc =
              permit.zoneId?.description || "Authorized Vending Zone";
            const verificationUrl =
              typeof window !== "undefined"
                ? `${window.location.origin}/verify/${permitId}`
                : `http://localhost:3000/verify/${permitId}`;

            return (
              <div
                key={permitId}
                className="relative rounded-2xl border-2 border-slate-900 bg-white shadow-sm overflow-hidden flex flex-col justify-between"
              >
                {/* Header Banner */}
                <div className="bg-slate-900 px-5 py-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-black text-sm">
                      VZ
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                        Municipal Corporation of Street Vendors
                      </div>
                      <div className="text-sm font-bold">DIGITAL VENDING PERMIT</div>
                    </div>
                  </div>
                  <StatusBadge status={permit.status || "approved"} />
                </div>

                {/* Permit Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Details Column */}
                    <div className="sm:col-span-2 space-y-3 text-xs">
                      <div>
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          Trade Name
                        </span>
                        <div className="font-bold text-slate-900 text-sm">{vendorName}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          Trade Category
                        </span>
                        <div className="font-semibold text-slate-800 uppercase">{businessType}</div>
                      </div>

                      <div>
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          Authorized Zone
                        </span>
                        <div className="font-semibold text-emerald-800">{zoneName}</div>
                        <div className="text-[11px] text-slate-500">{zoneDesc}</div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2">
                        <div>
                          <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                            Valid From
                          </span>
                          <div className="font-medium text-slate-800">
                            {permit.startDate ? new Date(permit.startDate).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                            Valid Until
                          </span>
                          <div className="font-medium text-slate-800">
                            {permit.endDate ? new Date(permit.endDate).toLocaleDateString() : "N/A"}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 pt-2">
                        <span className="text-slate-400 uppercase text-[10px] font-bold tracking-wider">
                          Official Permit ID
                        </span>
                        <div className="font-mono font-bold text-slate-900 text-xs">
                          {permitId}
                        </div>
                      </div>
                    </div>

                    {/* QR Code Column */}
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs flex items-center justify-center">
                        <QRCodeSVG
                          value={verificationUrl}
                          size={105}
                          level="H"
                          bgColor="#FFFFFF"
                          fgColor="#000000"
                        />
                      </div>
                      <div className="mt-2 text-[9px] font-semibold text-slate-500 uppercase tracking-wider">
                        Scan to verify
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-500">
                    Tamper-proof digital certificate
                  </span>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/verify/${permitId}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      <span>Public Verification Page</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

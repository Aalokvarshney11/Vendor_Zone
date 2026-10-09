"use client";

import { useEffect, useState } from "react";
import { getVendorProfile, createVendorProfile, updateVendorProfile } from "@/lib/api";
import { getUser } from "@/lib/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import StatusBadge from "@/components/StatusBadge";
import { Clock, CheckCircle2, AlertTriangle } from "lucide-react";

export default function VendorProfilePage() {
  const [profileExists, setProfileExists] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "food",
    phone: "",
    address: "",
  });
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const u = getUser();
      if (u) setUser(u);

      const data = await getVendorProfile();
      const profile = data.vendor || data.profile || data;

      if (profile && (profile.businessName || profile._id)) {
        setProfileExists(true);
        setFormData({
          businessName: profile.businessName || "",
          businessType: profile.businessType || "food",
          phone: profile.phone || "",
          address: profile.address || "",
        });
        setStatus(profile.verificationStatus || profile.status || "pending");
        if (profile.userId) {
          setUser(typeof profile.userId === "object" ? profile.userId : u);
        }
      }
    } catch {
      // Profile not created yet
      const u = getUser();
      if (u) setUser(u);
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
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      if (profileExists) {
        const res = await updateVendorProfile(formData);
        setMessage({ type: "success", text: "Vendor profile updated successfully!" });
        if (res.vendor) {
          setStatus(res.vendor.verificationStatus || status);
        }
      } else {
        const res = await createVendorProfile(formData);
        setProfileExists(true);
        setMessage({
          type: "success",
          text: "Vendor profile registered! A municipal officer will verify your details soon.",
        });
        if (res.vendor) {
          setStatus(res.vendor.verificationStatus || "pending");
        }
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.message || "Failed to save profile. Please check your connection.",
      });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-xs text-slate-500">
        Loading vendor profile...
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Vendor Profile & Verification
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your registered trade details and municipal verification status
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Verification Status:</span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>

      {/* Verification Notice Banner */}
      {status === "pending" && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-900 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Pending Municipal Officer Verification</div>
            <p className="mt-0.5 text-amber-800">
              Your vendor registration is currently under review by the municipal team. Once verified, you will be able to book slots in authorized vending zones.
            </p>
          </div>
        </div>
      )}

      {status === "verified" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 text-xs text-emerald-900 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Officially Verified Street Vendor</div>
            <p className="mt-0.5 text-emerald-800">
              Your identity is verified. You are authorized to book designated vending zones and receive digital QR permits.
            </p>
          </div>
        </div>
      )}

      {status === "rejected" && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-xs text-rose-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Verification Request Needs Update</div>
            <p className="mt-0.5 text-rose-800">
              Your verification was rejected by municipal review. Please check your business details or contact municipal grievance redressal.
            </p>
          </div>
        </div>
      )}

      {message.text && (
        <div
          className={`rounded-lg p-3.5 text-xs font-medium border ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Profile Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Details (Read-only from User Auth) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1">
                Account Holder Name
              </label>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm text-slate-800 font-medium">
                {user?.name || "Registered Vendor"}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1">
                Account Email
              </label>
              <div className="rounded-lg bg-slate-50 border border-slate-200 px-3.5 py-2 text-sm text-slate-800 font-medium">
                {user?.email || "—"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Vending Stall / Trade Name"
              id="businessName"
              name="businessName"
              placeholder="e.g. Ramesh Chaat & Snacks"
              value={formData.businessName}
              onChange={handleChange}
              required
              helperText="Official trading name of your cart or stall"
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Trade Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="food">Food & Street Snacks</option>
                <option value="beverages">Beverages, Tea & Drinks</option>
                <option value="fruits">Fresh Fruits</option>
                <option value="vegetables">Fresh Vegetables</option>
                <option value="clothing">Clothing & Garments</option>
                <option value="electronics">Electronics & Mobile Kiosks</option>
                <option value="services">Utility Services & Repairs</option>
                <option value="other">Other General Merchandise</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Zones are matched against this category during reservation
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Phone Number"
              id="phone"
              name="phone"
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={handleChange}
              required
              helperText="Active mobile number for municipal SMS alerts"
            />

            <Input
              label="Operational / Ward Address"
              id="address"
              name="address"
              placeholder="e.g. Ward 12, Subhash Chowk Market"
              value={formData.address}
              onChange={handleChange}
              required
              helperText="Base locality where you operate"
            />
          </div>

          <div className="border-t border-slate-100 pt-5 flex items-center justify-end gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
              className="px-6"
            >
              {profileExists ? "Update Vendor Profile" : "Submit for Verification"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

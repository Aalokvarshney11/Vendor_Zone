"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      if (data.token) {
        setToken(data.token);
      }

      if (data.user) {
        setUser(data.user);
      }

      // Role-based redirect
      const role = data.user?.role?.toLowerCase() || "vendor";
      if (role === "admin") {
        router.push("/admin");
      } else if (role === "officer") {
        router.push("/officer");
      } else {
        router.push("/vendor");
      }
    } catch (err) {
      setError(err.message || "Failed to log in. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  // Quick helper for demo testing
  function handleDemoFill(role) {
    const creds = {
      vendor: { email: "vendor@vendorzone.org", password: "password123" },
      officer: { email: "officer@vendorzone.org", password: "password123" },
      admin: { email: "admin@vendorzone.org", password: "password123" },
    };
    setFormData(creds[role]);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-white/95 p-8 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-xs">
          <div>
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xl shadow-xs">
                VZ
              </div>
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
              Log in to VendorZone
            </h1>
            <p className="mt-1 text-center text-xs text-slate-500">
              Access your digital vending permits and management portal
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Pre-fill for Hackathon Testing */}
          <div className="border-t border-slate-100 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center mb-2">
              Demo Quick Fill (Hackathon)
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemoFill("vendor")}
                className="rounded-md border border-slate-200 bg-slate-50 py-1.5 font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
              >
                Vendor
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("officer")}
                className="rounded-md border border-slate-200 bg-slate-50 py-1.5 font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
              >
                Officer
              </button>
              <button
                type="button"
                onClick={() => handleDemoFill("admin")}
                className="rounded-md border border-slate-200 bg-slate-50 py-1.5 font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-600">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="font-semibold text-emerald-600 hover:text-emerald-500 underline"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

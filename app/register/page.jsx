"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Navbar from "@/components/Navbar";
import { Store, ShieldAlert } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "vendor",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: "vendor",
      });

      setSuccess("Vendor account registered successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-6 bg-white/95 p-8 rounded-2xl border border-slate-200 shadow-sm backdrop-blur-xs">
          <div>
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white font-black text-xl shadow-xs">
                VZ
              </div>
            </div>
            <h1 className="mt-4 text-center text-2xl font-bold tracking-tight text-slate-900">
              Vendor Registration
            </h1>
            <p className="mt-1 text-center text-xs text-slate-500">
              Create your street vendor account to book slots and manage permits
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
              {success}
            </div>
          )}

          {/* Role note */}
          <div className="flex items-center gap-2 p-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 text-xs font-medium">
            <Store className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Registering as: <strong>Street Vendor</strong></span>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              id="name"
              name="name"
              placeholder="e.g. Ramesh Kumar"
              value={formData.name}
              onChange={handleChange}
              required
            />

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
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Repeat your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-2"
            >
              Create Vendor Account
            </Button>
          </form>

          {/* Officer notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <strong>Officer or Municipal Staff?</strong> Accounts for Municipal Officers & Administrators are strictly provisioned by the city administrator.
            </div>
          </div>

          <div className="text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-emerald-600 hover:text-emerald-500 underline"
            >
              Log in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

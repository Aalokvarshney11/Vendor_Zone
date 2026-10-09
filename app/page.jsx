import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  MapPin,
  Award,
  ShieldCheck,
  Calendar,
  MessageSquare,
  Users,
  Search,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 max-w-6xl mx-auto text-center">
        {/* Subtle Pill Tag */}
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-semibold text-emerald-800 mb-6">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Municipal Street Vending Management Platform
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Smart Digital Management for{" "}
          <span className="text-emerald-600 underline decoration-emerald-300 decoration-wavy decoration-2">
            Street Vendors
          </span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Empowering municipal authorities and micro-entrepreneurs with authorized vending zones, instant digital permits, transparent slot booking, and real-time QR verification.
        </p>

        {/* Action Buttons */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            Portal Login
          </Link>
          <Link
            href="/verify/SAMPLE-PERMIT-001"
            className="inline-flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-100/70 px-5 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors"
          >
            <Search className="w-4 h-4 text-slate-500" />
            <span>Verify a Permit</span>
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-bold mb-4">
              <MapPin className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Authorized Vending Zones</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Explore officially designated commercial and food zones with clear capacity limits, transparent fee structures, and defined trading hours.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 font-bold mb-4">
              <Award className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Instant Digital Permits</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Eliminate paper bureaucracy. Approved reservations generate tamper-proof digital certificates equipped with verifiable QR codes.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-bold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">QR On-Spot Verification</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Civic enforcement officers and citizens can scan vendor QR codes with any smartphone camera for zero-login validity checks.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold mb-4">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Transparent Reservations</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Fair allocation of vending slots based on real-time availability, avoiding overcrowding and harassment on public streets.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700 font-bold mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Grievance & Complaints</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Direct escalation channel for vendors to report harassment, extortion, or zoning disputes with logged resolution audits.
            </p>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white/90 p-6 shadow-xs backdrop-blur-xs">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 font-bold mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-2">Role-Based Portals</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Dedicated interfaces designed for Street Vendors, Field Municipal Officers, and Municipal Administrators.
            </p>
          </div>
        </div>

        {/* How it works simple section */}
        <div className="mt-20 border-t border-slate-200 pt-16">
          <h2 className="text-2xl font-bold text-slate-900">How VendorZone Works</h2>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-3xl font-black text-emerald-600">01</div>
              <h3 className="font-semibold text-slate-900">Vendor Registration</h3>
              <p className="text-xs text-slate-600">Vendors register their profile and trade category.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-emerald-600">02</div>
              <h3 className="font-semibold text-slate-900">Officer Verification</h3>
              <p className="text-xs text-slate-600">Municipal officers review and approve credentials.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-emerald-600">03</div>
              <h3 className="font-semibold text-slate-900">Zone Reservation</h3>
              <p className="text-xs text-slate-600">Vendors pick an authorized zone and book dates.</p>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-black text-emerald-600">04</div>
              <h3 className="font-semibold text-slate-900">Digital QR Permit</h3>
              <p className="text-xs text-slate-600">Instant digital badge ready for QR spot checks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white/80 py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} VendorZone — Municipal Street Vendor Digital Infrastructure.</p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-900">Log In</Link>
            <Link href="/register" className="hover:text-slate-900">Register</Link>
            <Link href="/verify/SAMPLE-001" className="hover:text-slate-900">Permit Verification</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { getZones, getVendorProfile, createReservation } from "@/lib/api";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";
import StatusBadge from "@/components/StatusBadge";
import {
  AlertTriangle,
  ShieldCheck,
  MapPin,
  Tag,
  Map as MapIcon,
  LayoutGrid,
  Columns,
  RefreshCw,
  Search,
} from "lucide-react";

// Dynamically import Leaflet Map to prevent SSR window issues
const ZoneMap = dynamic(() => import("@/components/ZoneMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full rounded-2xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-xs text-slate-500">
      <RefreshCw className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
      <span>Loading Interactive Leaflet Map...</span>
    </div>
  ),
});

export default function VendorZonesPage() {
  const [zones, setZones] = useState([]);
  const [vendorProfile, setVendorProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("split"); // 'split' | 'map' | 'grid'

  // Selected zone for map focus
  const [selectedZone, setSelectedZone] = useState(null);

  // Reservation Modal state
  const [resModalOpen, setResModalOpen] = useState(false);
  const [targetZoneForBooking, setTargetZoneForBooking] = useState(null);
  const [resData, setResData] = useState({
    startDate: "",
    endDate: "",
  });
  const [resLoading, setResLoading] = useState(false);
  const [resMessage, setResMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError("");
    try {
      const [zonesRes, profileRes] = await Promise.allSettled([
        getZones(),
        getVendorProfile(),
      ]);

      if (zonesRes.status === "fulfilled" && zonesRes.value) {
        const list = Array.isArray(zonesRes.value)
          ? zonesRes.value
          : zonesRes.value.zones || [];
        setZones(list);
      }

      if (profileRes.status === "fulfilled" && profileRes.value) {
        const prof =
          profileRes.value.vendor ||
          profileRes.value.profile ||
          profileRes.value;
        setVendorProfile(prof);
      }
    } catch (err) {
      setError(err.message || "Failed to load vending zones from the server.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenReserveModal(zone) {
    const today = new Date().toISOString().split("T")[0];
    const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    setTargetZoneForBooking(zone);
    setResData({
      startDate: today,
      endDate: nextMonth,
    });
    setResMessage({ type: "", text: "" });
    setResModalOpen(true);
  }

  async function handleCreateReservation(e) {
    e.preventDefault();
    if (!targetZoneForBooking) return;

    setResLoading(true);
    setResMessage({ type: "", text: "" });

    try {
      await createReservation({
        zoneId: targetZoneForBooking._id || targetZoneForBooking.id,
        startDate: resData.startDate,
        endDate: resData.endDate,
      });

      setResMessage({
        type: "success",
        text: "Reservation request submitted successfully! A municipal officer will review it.",
      });

      // Refresh data
      loadData();

      setTimeout(() => {
        setResModalOpen(false);
      }, 1800);
    } catch (err) {
      setResMessage({
        type: "error",
        text: err.message || "Failed to submit reservation.",
      });
    } finally {
      setResLoading(false);
    }
  }

  function formatLocation(loc) {
    if (!loc) return "Municipal Designated Area";
    if (typeof loc === "string") return loc;
    if (
      loc.coordinates &&
      Array.isArray(loc.coordinates) &&
      loc.coordinates.length === 2
    ) {
      return `${Number(loc.coordinates[1]).toFixed(4)}°N, ${Number(
        loc.coordinates[0]
      ).toFixed(4)}°E`;
    }
    return "Municipal Coordinates";
  }

  const isVerified = vendorProfile?.verificationStatus === "verified";
  const vendorType = vendorProfile?.businessType || "";

  const filteredZones = zones.filter((z) => {
    const q = search.toLowerCase();
    const locText = formatLocation(z.location).toLowerCase();
    const nameText = (z.name || "").toLowerCase();
    const descText = (z.description || "").toLowerCase();
    const typesText = (z.allowedBusinessTypes || []).join(" ").toLowerCase();
    return (
      nameText.includes(q) ||
      locText.includes(q) ||
      descText.includes(q) ||
      typesText.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <MapPin className="w-6 h-6 text-emerald-600" />
            Authorized Vending Zones
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Explore interactive geospatial map of municipal designated street vending slots and book allocations
          </p>
        </div>

        {/* View mode toggle & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Buttons */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === "split"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Split View (Map + Cards)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>

            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === "map"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Interactive Map Only"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Map</span>
            </button>

            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                viewMode === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Grid Cards Only"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cards</span>
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search zones or trades..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 text-xs text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Verification status notice */}
      {!vendorProfile ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              You haven&apos;t created your vendor profile yet. Profile registration is required before booking zones.
            </span>
          </div>
          <Link
            href="/vendor/profile"
            className="rounded-lg bg-amber-600 px-3 py-1.5 font-semibold text-white hover:bg-amber-700 transition-colors shadow-xs"
          >
            Create Profile
          </Link>
        </div>
      ) : !isVerified ? (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              Your profile status is{" "}
              <strong className="uppercase">
                {vendorProfile.verificationStatus || "pending"}
              </strong>
              . Municipal officer verification is required to submit zone bookings.
            </span>
          </div>
          <Link
            href="/vendor/profile"
            className="font-semibold text-blue-700 underline hover:text-blue-800"
          >
            Check Profile Status
          </Link>
        </div>
      ) : null}

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* 1. Leaflet Map Section (Displayed in 'split' or 'map' mode) */}
      {(viewMode === "split" || viewMode === "map") && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5">
              <MapIcon className="w-4 h-4 text-emerald-600" />
              Live Interactive Geo-Map ({filteredZones.length} Zones)
            </span>
            <span className="text-[11px] text-slate-500 font-normal">
              Click any pin to inspect capacity and book
            </span>
          </div>

          <ZoneMap
            zones={filteredZones}
            selectedZone={selectedZone}
            onSelectZone={(z) => setSelectedZone(z)}
            onBookZone={(z) => handleOpenReserveModal(z)}
            vendorProfile={vendorProfile}
            height={viewMode === "map" ? "620px" : "420px"}
          />
        </div>
      )}

      {/* 2. Zones Cards Grid (Displayed in 'split' or 'grid' mode) */}
      {(viewMode === "split" || viewMode === "grid") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
            <span>Zone Directory Cards</span>
            <span className="text-[11px] text-slate-500 font-normal">
              Showing {filteredZones.length} available areas
            </span>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-400" />
              Loading authorized vending zones...
            </div>
          ) : filteredZones.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-12 text-center text-xs text-slate-500 bg-white">
              No vending zones matching your search.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredZones.map((zone) => {
                const zid = zone._id || zone.id;
                const capacity = zone.capacity || 0;
                const occupied = zone.occupiedSpaces || 0;
                const available = Math.max(0, capacity - occupied);

                const isTypeAllowed =
                  !vendorType ||
                  (Array.isArray(zone.allowedBusinessTypes) &&
                    zone.allowedBusinessTypes.includes(vendorType));

                const isFull = available <= 0;
                const canBook =
                  isVerified &&
                  isTypeAllowed &&
                  !isFull &&
                  (zone.status || "active") === "active";

                const allowedTypes = Array.isArray(zone.allowedBusinessTypes)
                  ? zone.allowedBusinessTypes
                  : [];

                const isSelected =
                  selectedZone &&
                  (selectedZone._id === zid || selectedZone.id === zid);

                return (
                  <div
                    key={zid}
                    className={`flex flex-col justify-between rounded-xl border bg-white p-5 shadow-xs transition-all ${
                      isSelected
                        ? "border-emerald-500 ring-2 ring-emerald-100"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h2 className="text-base font-bold text-slate-900 leading-snug">
                            {zone.name}
                          </h2>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            {formatLocation(zone.location)}
                          </div>
                        </div>
                        <StatusBadge status={zone.status || "active"} />
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-2">
                        {zone.description ||
                          "Designated municipal street vending zone."}
                      </p>

                      <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                            <Tag className="w-3.5 h-3.5 text-slate-500" /> Permitted Trades:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {allowedTypes.map((t) => (
                              <span
                                key={t}
                                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${
                                  t === vendorType
                                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-xs">
                          <div>
                            <span className="text-slate-500">Capacity: </span>
                            <span className="font-bold text-slate-900">
                              {capacity} slots
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500">Available: </span>
                            <span
                              className={`font-bold ${
                                available > 0
                                  ? "text-emerald-600"
                                  : "text-rose-600"
                              }`}
                            >
                              {available} free
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedZone(zone);
                          if (viewMode === "grid") setViewMode("split");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex items-center gap-1 text-[11px]"
                      >
                        <MapIcon className="w-3 h-3 text-emerald-600" />
                        Locate
                      </Button>

                      <Button
                        onClick={() => handleOpenReserveModal(zone)}
                        disabled={!canBook}
                        variant={canBook ? "primary" : "outline"}
                        size="sm"
                        className="flex-1 text-xs"
                      >
                        {!isVerified
                          ? "Verification Required"
                          : !isTypeAllowed
                          ? `Not for '${vendorType}'`
                          : isFull
                          ? "Zone Full"
                          : "Book Slot"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Reservation Booking Modal */}
      <Modal
        isOpen={resModalOpen}
        onClose={() => setResModalOpen(false)}
        title={`Reserve Slot in ${targetZoneForBooking?.name || "Zone"}`}
      >
        {resMessage.text && (
          <div
            className={`mb-4 rounded-lg p-3 text-xs font-medium border ${
              resMessage.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {resMessage.text}
          </div>
        )}

        <form onSubmit={handleCreateReservation} className="space-y-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">
              {targetZoneForBooking?.name}
            </div>
            <div className="text-slate-600">
              Location: {formatLocation(targetZoneForBooking?.location)}
            </div>
            <div className="text-emerald-700 font-semibold">
              Available Capacity:{" "}
              {Math.max(
                0,
                (targetZoneForBooking?.capacity || 0) -
                  (targetZoneForBooking?.occupiedSpaces || 0)
              )}{" "}
              slots
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Reservation Start Date"
              id="startDate"
              name="startDate"
              type="date"
              value={resData.startDate}
              onChange={(e) =>
                setResData({ ...resData, startDate: e.target.value })
              }
              required
              helperText="Cannot be in the past"
            />

            <Input
              label="Reservation End Date"
              id="endDate"
              name="endDate"
              type="date"
              value={resData.endDate}
              onChange={(e) =>
                setResData({ ...resData, endDate: e.target.value })
              }
              required
              helperText="Up to 365 days max"
            />
          </div>

          <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-3 text-[11px] text-emerald-800">
            Once approved by a municipal officer, you will receive an official
            Digital Permit with a verifiable QR badge.
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setResModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={resLoading}>
              Submit Reservation Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

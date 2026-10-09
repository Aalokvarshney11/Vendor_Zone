"use client";

import { useEffect, useState } from "react";
import { getAdminZones, createZone, updateZone, updateZoneStatus } from "@/lib/api";
import StatusBadge from "@/components/StatusBadge";
import Button from "@/components/Button";
import Input from "@/components/Input";
import Modal from "@/components/Modal";

const BUSINESS_TYPE_OPTIONS = [
  { value: "food", label: "Food & Street Snacks" },
  { value: "beverages", label: "Beverages & Tea" },
  { value: "fruits", label: "Fresh Fruits" },
  { value: "vegetables", label: "Fresh Vegetables" },
  { value: "clothing", label: "Clothing & Garments" },
  { value: "electronics", label: "Electronics & Mobile" },
  { value: "services", label: "Utility Services" },
  { value: "other", label: "Other Merchandise" },
];

export default function AdminZonesPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longitude: 77.2090,
    latitude: 28.6139,
    capacity: 25,
    allowedBusinessTypes: ["food", "clothing", "fruits"],
    status: "active",
  });
  const [saving, setSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState({ type: "", text: "" });

  useEffect(() => {
    loadZones();
  }, []);

  async function loadZones() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminZones();
      const list = Array.isArray(data) ? data : data.zones || [];
      setZones(list);
    } catch (err) {
      setError(err.message || "Failed to load municipal zones.");
    } finally {
      setLoading(false);
    }
  }

  function handleOpenCreate() {
    setEditingZone(null);
    setFormData({
      name: "",
      description: "",
      longitude: 77.2167,
      latitude: 28.6328,
      capacity: 25,
      allowedBusinessTypes: ["food", "clothing", "fruits"],
      status: "active",
    });
    setModalMsg({ type: "", text: "" });
    setModalOpen(true);
  }

  function handleOpenEdit(zone) {
    setEditingZone(zone);
    const coords = zone.location?.coordinates || [77.2090, 28.6139];
    setFormData({
      name: zone.name || "",
      description: zone.description || "",
      longitude: coords[0] ?? 77.2090,
      latitude: coords[1] ?? 28.6139,
      capacity: zone.capacity || 25,
      allowedBusinessTypes: Array.isArray(zone.allowedBusinessTypes)
        ? zone.allowedBusinessTypes
        : ["food"],
      status: zone.status || "active",
    });
    setModalMsg({ type: "", text: "" });
    setModalOpen(true);
  }

  function handleBusinessTypeToggle(val) {
    const current = formData.allowedBusinessTypes || [];
    if (current.includes(val)) {
      setFormData({
        ...formData,
        allowedBusinessTypes: current.filter((t) => t !== val),
      });
    } else {
      setFormData({
        ...formData,
        allowedBusinessTypes: [...current, val],
      });
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setModalMsg({ type: "", text: "" });

    if (formData.allowedBusinessTypes.length === 0) {
      setModalMsg({ type: "error", text: "Please select at least one allowed trade category." });
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        location: {
          type: "Point",
          coordinates: [Number(formData.longitude), Number(formData.latitude)],
        },
        capacity: Number(formData.capacity),
        allowedBusinessTypes: formData.allowedBusinessTypes,
      };

      if (editingZone) {
        await updateZone(editingZone._id || editingZone.id, payload);
        if (formData.status !== editingZone.status) {
          await updateZoneStatus(editingZone._id || editingZone.id, formData.status);
        }
        setModalMsg({ type: "success", text: "Zone details saved!" });
      } else {
        await createZone(payload);
        setModalMsg({ type: "success", text: "New zone created successfully!" });
      }

      await loadZones();
      setTimeout(() => setModalOpen(false), 1200);
    } catch (err) {
      setModalMsg({ type: "error", text: err.message || "Failed to save zone." });
    } finally {
      setSaving(false);
    }
  }

  function formatLocation(loc) {
    if (!loc) return "Municipal Designated Area";
    if (typeof loc === "string") return loc;
    if (loc.coordinates && Array.isArray(loc.coordinates) && loc.coordinates.length === 2) {
      return `${loc.coordinates[1].toFixed(4)}°N, ${loc.coordinates[0].toFixed(4)}°E`;
    }
    return "Municipal Coordinates";
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Municipal Zone Infrastructure
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure urban street vending zones, slot capacity limits, and trade regulations
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenCreate}
          className="text-xs"
        >
          + Add New Zone
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 font-medium">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-500">Loading zones...</div>
          ) : zones.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-500">
              No zones found. Create one using the button above.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Zone Name & Description</th>
                  <th className="px-6 py-3.5">Geo Coordinates</th>
                  <th className="px-6 py-3.5">Total Capacity</th>
                  <th className="px-6 py-3.5">Permitted Trades</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {zones.map((zone) => {
                  const id = zone._id || zone.id;
                  const types = Array.isArray(zone.allowedBusinessTypes)
                    ? zone.allowedBusinessTypes
                    : [];

                  return (
                    <tr key={id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{zone.name}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {zone.description || "Municipal vending area"}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono text-[11px] text-slate-800">
                        {formatLocation(zone.location)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900">{zone.capacity} spaces</span>
                        <div className="text-[10px] text-slate-500">
                          {zone.occupiedSpaces || 0} occupied
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {types.map((t) => (
                            <span
                              key={t}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-slate-700"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={zone.status || "active"} />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(zone)}
                          className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                        >
                          Edit Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingZone ? "Edit Vending Zone" : "Add Vending Zone"}
      >
        {modalMsg.text && (
          <div
            className={`mb-4 rounded-lg p-3 text-xs font-medium border ${
              modalMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-800"
            }`}
          >
            {modalMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <Input
            label="Zone Name"
            name="name"
            placeholder="e.g. South End Market Food Zone"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Longitude (East)"
              name="longitude"
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: Number(e.target.value) })}
              required
              helperText="e.g. 77.2090"
            />

            <Input
              label="Latitude (North)"
              name="latitude"
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: Number(e.target.value) })}
              required
              helperText="e.g. 28.6139"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Slot Capacity"
              name="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Zone Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="active">Active (Open for Booking)</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive / Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Allowed Trade Categories <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {BUSINESS_TYPE_OPTIONS.map((opt) => {
                const checked = formData.allowedBusinessTypes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleBusinessTypeToggle(opt.value)}
                    className={`p-2 rounded-lg border text-left text-[11px] font-medium transition-colors ${
                      checked
                        ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Description & Regulations
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="border-t border-slate-100 pt-4 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              Save Zone
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

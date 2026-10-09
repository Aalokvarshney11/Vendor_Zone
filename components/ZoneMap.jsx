"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { Plus, Minus, Maximize2, Compass, Layers } from "lucide-react";

export default function ZoneMap({
  zones = [],
  selectedZone = null,
  onSelectZone,
  onBookZone,
  vendorProfile = null,
  height = "450px",
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const allLatLngsRef = useRef([]);
  const [zoomLevel, setZoomLevel] = useState(12);

  const isVerified = vendorProfile?.verificationStatus === "verified";
  const vendorType = vendorProfile?.businessType || "";

  // Custom Zoom In Handler
  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  // Custom Zoom Out Handler
  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  // Fit Bounds / Center All Zones Handler
  const handleFitAllZones = () => {
    if (mapInstanceRef.current && allLatLngsRef.current.length > 0) {
      import("leaflet").then((L) => {
        const bounds = L.default.latLngBounds(allLatLngsRef.current);
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      });
    } else if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([28.6139, 77.2090], 12);
    }
  };

  // Reset Center Handler
  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([28.6139, 77.2090], 12);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let L;
    let isMounted = true;

    async function initMap() {
      L = (await import("leaflet")).default;

      // Fix default Leaflet icon paths
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!isMounted || !mapContainerRef.current) return;

      // Initialize map instance if not already created
      if (!mapInstanceRef.current) {
        // Default center: India (Delhi: [28.6139, 77.2090])
        const defaultCenter = [28.6139, 77.2090];

        const map = L.map(mapContainerRef.current, {
          center: defaultCenter,
          zoom: 12,
          zoomControl: false, // We provide modern custom floating zoom controls
          scrollWheelZoom: true,
          attributionControl: false,
        });

        // High quality OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          subdomains: ["a", "b", "c"],
        }).addTo(map);

        // Add Leaflet attribution nicely styled
        L.control
          .attribution({ position: "bottomright", prefix: "© OpenStreetMap contributors" })
          .addTo(map);

        // Track zoom level changes for UI feedback
        map.on("zoomend", () => {
          if (isMounted) {
            setZoomLevel(map.getZoom());
          }
        });

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m) => m.remove());
      markersRef.current = {};

      const validLatLngs = [];

      zones.forEach((zone) => {
        const id = zone._id || zone.id;
        const coords = zone.location?.coordinates;
        if (!coords || !Array.isArray(coords) || coords.length !== 2) return;

        // MongoDB GeoJSON is [longitude, latitude], Leaflet expects [latitude, longitude]
        const lng = Number(coords[0]);
        const lat = Number(coords[1]);
        if (isNaN(lat) || isNaN(lng)) return;

        const latLng = [lat, lng];
        validLatLngs.push(latLng);

        const capacity = zone.capacity || 0;
        const occupied = zone.occupiedSpaces || 0;
        const available = Math.max(0, capacity - occupied);
        const isFull = available <= 0;
        const isActive = (zone.status || "active") === "active";
        const isSelected = selectedZone && (selectedZone._id === id || selectedZone.id === id);

        const isTypeAllowed =
          !vendorType ||
          (Array.isArray(zone.allowedBusinessTypes) &&
            zone.allowedBusinessTypes.includes(vendorType));

        const canBook = isVerified && isTypeAllowed && !isFull && isActive;

        // Custom Tailwind styled Marker Pin
        const pinBg = !isActive
          ? "#64748b"
          : isFull
          ? "#ef4444"
          : "#10b981";

        const markerIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              display: flex;
              flex-direction: column;
              align-items: center;
              cursor: pointer;
              transform: ${isSelected ? "scale(1.2)" : "scale(1)"};
              transition: transform 0.2s ease;
            ">
              <div style="
                background: ${pinBg};
                color: #ffffff;
                width: 32px;
                height: 32px;
                border-radius: 9999px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 700;
                font-size: 11px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.25);
                border: 2.5px solid #ffffff;
              ">
                ${available}
              </div>
              <div style="
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid ${pinBg};
                margin-top: -1px;
              "></div>
            </div>
          `,
          iconSize: [32, 38],
          iconAnchor: [16, 38],
          popupAnchor: [0, -38],
        });

        const marker = L.marker(latLng, { icon: markerIcon }).addTo(map);

        // Build popup content
        const tradesHtml = (zone.allowedBusinessTypes || [])
          .map(
            (t) =>
              `<span style="background: #f1f5f9; color: #475569; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase;">${t}</span>`
          )
          .join(" ");

        const popupContent = document.createElement("div");
        popupContent.className = "zone-map-popup";
        popupContent.style.minWidth = "220px";
        popupContent.style.fontFamily = "inherit";
        popupContent.innerHTML = `
          <div style="padding: 2px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #0f172a;">${zone.name}</h3>
              <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 9999px; background: ${isActive ? "#dcfce7" : "#fee2e2"}; color: ${isActive ? "#166534" : "#991b1b"};">${zone.status || "active"}</span>
            </div>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b; line-height: 1.4;">${zone.description || "Official street vending zone."}</p>
            
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; margin-bottom: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
                <span style="color: #64748b;">Total Capacity:</span>
                <strong style="color: #0f172a;">${capacity} slots</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span style="color: #64748b;">Available Slots:</span>
                <strong style="color: ${available > 0 ? "#16a34a" : "#dc2626"};">${available} free</strong>
              </div>
            </div>

            <div style="margin-bottom: 10px;">
              <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px;">Permitted Trades:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 4px;">${tradesHtml || "<span style='font-size: 10px; color: #94a3b8;'>All trades</span>"}</div>
            </div>

            <button id="book-btn-${id}" style="
              width: 100%;
              padding: 6px 12px;
              background: ${canBook ? "#059669" : "#94a3b8"};
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 12px;
              font-weight: 600;
              cursor: ${canBook ? "pointer" : "not-allowed"};
              transition: background 0.15s ease;
            ">
              ${
                !isVerified
                  ? "Verification Required"
                  : !isTypeAllowed
                  ? `Not allowed for '${vendorType}'`
                  : isFull
                  ? "Zone Full"
                  : "Book This Zone"
              }
            </button>
          </div>
        `;

        // Handle button click inside popup
        const bookBtn = popupContent.querySelector(`#book-btn-${id}`);
        if (bookBtn && canBook) {
          bookBtn.addEventListener("click", () => {
            if (onBookZone) onBookZone(zone);
          });
        }

        marker.bindPopup(popupContent, { maxWidth: 280 });

        marker.on("click", () => {
          if (onSelectZone) onSelectZone(zone);
        });

        markersRef.current[id] = marker;
      });

      allLatLngsRef.current = validLatLngs;

      // Fit bounds if valid coordinates exist and no specific zone is selected
      if (validLatLngs.length > 0 && !selectedZone) {
        const bounds = L.latLngBounds(validLatLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }

      // If a specific zone is selected, fly to it and open its popup
      if (selectedZone) {
        const sid = selectedZone._id || selectedZone.id;
        const targetMarker = markersRef.current[sid];
        if (targetMarker) {
          const coords = selectedZone.location?.coordinates;
          if (coords && Array.isArray(coords)) {
            map.flyTo([Number(coords[1]), Number(coords[0])], 15, { duration: 1 });
            targetMarker.openPopup();
          }
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, [zones, selectedZone, isVerified, vendorType, onSelectZone, onBookZone]);

  // Clean up map on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
      {/* Map Legend & Overlay (Top Left) */}
      <div className="absolute top-3 left-3 z-[1000] bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl px-3.5 py-2 shadow-sm text-xs space-y-1.5 pointer-events-auto">
        <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          Zone Availability
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
            <span className="text-slate-700 font-medium">Slots Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
            <span className="text-slate-700 font-medium">Zone Full</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500 inline-block"></span>
            <span className="text-slate-700 font-medium">Closed</span>
          </div>
        </div>
      </div>

      {/* Floating Zoom & Map Controls Toolbar (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1.5 bg-white/95 backdrop-blur-sm border border-slate-200 rounded-xl p-1.5 shadow-md pointer-events-auto">
        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
          title="Zoom In (+)"
          aria-label="Zoom In"
        >
          <Plus className="w-4 h-4 font-bold" />
        </button>

        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
          title="Zoom Out (-)"
          aria-label="Zoom Out"
        >
          <Minus className="w-4 h-4 font-bold" />
        </button>

        <div className="h-[1px] bg-slate-200 my-0.5" />

        {/* Fit All Zones Button */}
        <button
          onClick={handleFitAllZones}
          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
          title="Fit All Zones on Screen"
          aria-label="Fit All Zones"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Center / Compass Button */}
        <button
          onClick={handleResetCenter}
          className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 flex items-center justify-center transition-colors shadow-2xs active:scale-95"
          title="Center Map View"
          aria-label="Center Map"
        >
          <Compass className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Zoom level indicator (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-xs border border-slate-200/80 rounded-lg px-2.5 py-1 text-[10px] text-slate-600 font-mono shadow-2xs pointer-events-auto">
        Zoom: {zoomLevel}x • Scroll Wheel Enabled
      </div>

      {/* Map container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%" }}
        className="z-0 bg-slate-100"
      />
    </div>
  );
}

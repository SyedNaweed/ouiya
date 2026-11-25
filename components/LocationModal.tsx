"use client";

import React, { useState, useEffect } from "react";
import { 
  MapPin, 
  Navigation, 
  X, 
  Check, 
  Search, 
  ShieldCheck, 
  Sparkles, 
  Compass, 
  ArrowRight,
  AlertCircle,
  Loader2
} from "lucide-react";

export interface LocationItem {
  name: string;
  area: string;
  lat: number;
  lng: number;
}

export const POPULAR_LOCATIONS: LocationItem[] = [
  { name: "White Town / Heritage Town", area: "French Quarter, Beach Rd", lat: 11.9341, lng: 79.8359 },
  { name: "Mission Street / MG Road", area: "Central Shopping District", lat: 11.9360, lng: 79.8290 },
  { name: "ECR / Lawspet", area: "North Pondicherry", lat: 11.9620, lng: 79.8200 },
  { name: "Auroville / Kottakuppam", area: "International City Area", lat: 11.9900, lng: 79.8050 },
  { name: "Subbiah Salai / Railway Station", area: "South Pondicherry", lat: 11.9280, lng: 79.8260 },
  { name: "Muthialpet", area: "East Coastal Zone", lat: 11.9540, lng: 79.8310 },
  { name: "Villianur", area: "West Heritage Zone", lat: 11.9150, lng: 79.7570 },
  { name: "JIPMER / Gorimedu", area: "North Academic Zone", lat: 11.9520, lng: 79.7990 },
  { name: "All Locations", area: "Puducherry Union Territory", lat: 11.9416, lng: 79.8083 },
];

/**
 * Checks if coordinates fall within Pondicherry / Puducherry region (matching mobile app LocationService)
 */
export function isCoordinatesInPondicherry(lat: number, lng: number): boolean {
  return lat >= 11.65 && lat <= 12.25 && lng >= 79.55 && lng <= 80.10;
}

/**
 * Resolves nearest Pondicherry neighborhood by Haversine formula
 */
export function getNearestPondicherryArea(lat: number, lng: number): { name: string; isPondy: boolean } {
  const inPondy = isCoordinatesInPondicherry(lat, lng);

  let minDistance = Infinity;
  let nearest = POPULAR_LOCATIONS[0].name;

  for (const loc of POPULAR_LOCATIONS) {
    if (loc.name === "All Locations") continue;
    const dLat = (lat - loc.lat) * (Math.PI / 180);
    const dLng = (lng - loc.lng) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(loc.lat * (Math.PI / 180)) *
        Math.cos(lat * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = 6371 * c; // distance in km
    if (dist < minDistance) {
      minDistance = dist;
      nearest = loc.name;
    }
  }

  if (inPondy) {
    return { name: nearest, isPondy: true };
  }
  return { name: "White Town / Heritage Town", isPondy: false };
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: string;
  isPromptMode?: boolean;
  onSelectLocation: (loc: string, coords?: { lat: number; lng: number }) => void;
}

export default function LocationModal({
  isOpen,
  onClose,
  selectedLocation,
  isPromptMode = false,
  onSelectLocation,
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showManualList, setShowManualList] = useState(!isPromptMode);

  // Sync mode whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setShowManualList(!isPromptMode);
      setStatusMessage(null);
      setIsSuccess(false);
      setIsLocating(false);
      setSearchQuery("");
    }
  }, [isOpen, isPromptMode]);

  if (!isOpen) return null;

  // Primary GPS Location Request (matching mobile app detectAndVerifyLocation)
  const handleDetectGPS = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setStatusMessage("Geolocation is not supported by your browser. Please select an area manually.");
      setShowManualList(true);
      return;
    }

    setIsLocating(true);
    setStatusMessage("Requesting GPS coordinates in Pondicherry...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const result = getNearestPondicherryArea(latitude, longitude);

        setIsLocating(false);
        setIsSuccess(true);

        const chosenLocation = result.name;
        if (result.isPondy) {
          setStatusMessage(`Location verified: ${chosenLocation} ✓`);
        } else {
          setStatusMessage("Outside Pondicherry bounds. Set to White Town to explore deals! ✓");
        }

        onSelectLocation(chosenLocation, { lat: latitude, lng: longitude });

        // Smooth auto-dismiss after confirming detected location
        setTimeout(() => {
          onClose();
        }, 800);
      },
      (error) => {
        console.warn("GPS Location error:", error);
        setIsLocating(false);
        setIsSuccess(false);

        if (error.code === error.PERMISSION_DENIED) {
          setStatusMessage("Location permission denied. Please choose your area below.");
        } else if (error.code === error.TIMEOUT) {
          setStatusMessage("Location request timed out. Please choose an area from the list.");
        } else {
          setStatusMessage("Unable to retrieve GPS position. Please pick your area below.");
        }
        setShowManualList(true);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  const filteredLocations = POPULAR_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    loc.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[92vh] animate-scale-up relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ======================================================== */}
        {/* POST-LOGIN PERMISSION PROMPT VIEW                        */}
        {/* ======================================================== */}
        {!showManualList ? (
          <div className="p-6 sm:p-8 flex flex-col items-center text-center">
            {/* Glowing Map Pin Icon */}
            <div className="relative mb-5">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#DC0101] to-[#970202] flex items-center justify-center text-white shadow-xl shadow-red-500/30">
                <Compass className="w-8 h-8 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-400 border-2 border-white dark:border-zinc-900 flex items-center justify-center text-zinc-900">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>

            {/* Header Badge */}
            <div className="inline-flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 text-[#DC0101] dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
              <MapPin className="w-3.5 h-3.5" />
              <span>Location Permission • Verified Pondicherry Deals</span>
            </div>

            {/* Title & Description */}
            <h3 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Enable Location Access
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-2 leading-relaxed max-w-xs">
              Ouiya needs your location to show verified discounts, French cafes, boutique stays, and stores closest to you in Pondicherry.
            </p>

            {/* Status / Feedback Banner */}
            {statusMessage && (
              <div className={`mt-4 w-full p-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 ${
                isSuccess 
                  ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                  : "bg-red-500/10 border border-red-500/25 text-[#DC0101] dark:text-red-400"
              }`}>
                {isSuccess ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="w-full mt-6 space-y-3">
              {/* Primary Allow Location Access Button */}
              <button
                onClick={handleDetectGPS}
                disabled={isLocating || isSuccess}
                className="w-full bg-gradient-to-r from-[#DC0101] via-[#E53935] to-[#B71C1C] hover:opacity-95 text-white font-black text-sm py-4 rounded-2xl shadow-xl shadow-red-500/25 transition-all cursor-pointer active:scale-98 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLocating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Detecting Location...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Location Verified!</span>
                  </>
                ) : (
                  <>
                    <Navigation className="w-5 h-5" />
                    <span>Allow Location Access</span>
                  </>
                )}
              </button>

              {/* Manual Selection Trigger */}
              <button
                type="button"
                onClick={() => setShowManualList(true)}
                disabled={isLocating}
                className="w-full py-3 px-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Select Pondicherry Area Manually</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Skip Option */}
            <button
              onClick={() => {
                onSelectLocation("White Town / Heritage Town", { lat: 11.9341, lng: 79.8359 });
                onClose();
              }}
              className="mt-4 text-[11px] font-bold text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:underline cursor-pointer"
            >
              Skip for now • Use White Town, Pondicherry
            </button>
          </div>
        ) : (
          /* ======================================================== */
          /* STANDARD LOCATION PICKER VIEW                            */
          /* ======================================================== */
          <>
            {/* Header */}
            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 text-[#DC0101] dark:text-red-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-zinc-900 dark:text-white">Select Location</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">Find offers and deals near you</p>
                </div>
              </div>
            </div>

            {/* Auto Detect GPS button */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 bg-red-50/50 dark:bg-red-950/20">
              <button
                onClick={handleDetectGPS}
                disabled={isLocating}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-[#DC0101] to-[#B71C1C] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm transition-all shadow-md active:scale-98 disabled:opacity-70 cursor-pointer"
              >
                <Navigation className={`w-4 h-4 ${isLocating ? "animate-spin" : ""}`} />
                <span>{isLocating ? "Detecting GPS position..." : "Use Current GPS Location"}</span>
              </button>

              {statusMessage && (
                <div className="mt-2 text-[11px] font-bold text-center text-zinc-600 dark:text-zinc-300">
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search Pondicherry area or landmark..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 text-xs font-semibold focus:outline-none focus:border-[#DC0101] transition-colors"
                />
              </div>
            </div>

            {/* Locations List */}
            <div className="p-2 overflow-y-auto flex-1 divide-y divide-zinc-100 dark:divide-zinc-800/60 max-h-[320px]">
              {filteredLocations.map((loc) => {
                const isSelected = selectedLocation.toLowerCase().includes(loc.name.toLowerCase()) || 
                                   loc.name.toLowerCase().includes(selectedLocation.toLowerCase());
                return (
                  <button
                    key={loc.name}
                    onClick={() => {
                      onSelectLocation(loc.name, { lat: loc.lat, lng: loc.lng });
                      onClose();
                    }}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all group cursor-pointer ${
                      isSelected
                        ? "bg-red-500/10 text-[#DC0101] dark:text-red-400 font-extrabold"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold group-hover:text-[#DC0101] dark:group-hover:text-red-400 transition-colors">
                        {loc.name}
                      </div>
                      <div className="text-[11px] text-zinc-400 font-medium mt-0.5">{loc.area}</div>
                    </div>
                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-[#DC0101] text-white flex items-center justify-center shrink-0 ml-2">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </>
        )}

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Star, MapPin, CheckCircle2, Store } from "lucide-react";
import { Business } from "../lib/db";
import { useApp } from "../lib/AppContext";

interface StoreCardProps {
  business: Business;
  onOpenShop: (shopId: string) => void;
}

const DEFAULT_STORE_IMG = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500&auto=format&fit=crop&q=80";

export default function StoreCard({ business, onOpenShop }: StoreCardProps) {
  const { likedShops, toggleShopLike } = useApp();
  
  const rawImage = (business as any).imageUrls?.[0] || business.logoUrl || business.gallery?.[0] || (business as any).imageUrl || DEFAULT_STORE_IMG;
  const [imgSrc, setImgSrc] = useState(rawImage);

  return (
    <div
      onClick={() => onOpenShop(business.id)}
      className="group relative rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 h-56 sm:h-64 cursor-pointer border border-zinc-200/80 dark:border-[#27272A] hover:-translate-y-1 flex flex-col justify-end bg-[#18181B]"
    >
      {/* Background Image */}
      <img
        src={imgSrc}
        alt={business.name}
        onError={() => setImgSrc(DEFAULT_STORE_IMG)}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
      />

      {/* Dark Multi-stop Gradient Overlay for pristine text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent pointer-events-none" />

      {/* Top Badges */}
      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
        <span className="bg-[#DC0101] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm">
          {business.hasVoucher ? "Vouchers Available" : "Top Verified"}
        </span>
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md text-amber-300 border border-white/10 px-2 py-0.5 rounded-lg text-[11px] font-black">
          <Star className="w-3 h-3 fill-current" />
          <span>{business.rating || 4.8}</span>
        </div>
      </div>

      {/* Bottom Content */}
      <div className="relative z-10 p-4 space-y-1 text-white">
        <div className="flex items-center gap-1.5">
          <h3 className="text-base font-extrabold truncate drop-shadow-sm group-hover:text-red-400 transition-colors">
            {business.name}
          </h3>
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 fill-sky-400/20" />
        </div>

        <p className="text-xs text-slate-300 font-medium truncate">
          {(business as any).category || "Local Store & Dining"}
        </p>

        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-300">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#DC0101]" />
            <span className="truncate max-w-[140px] font-medium">{business.address || "Pondicherry"}</span>
          </span>
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">
            Verified Partner
          </span>
        </div>
      </div>
    </div>
  );
}

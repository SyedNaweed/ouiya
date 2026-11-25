"use client";

import React, { useState } from "react";
import { Star, MapPin, Heart, ShoppingBag, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Offer } from "../lib/db";
import { useApp } from "../lib/AppContext";

interface OfferCardProps {
  offer: Offer;
  onViewOffer: (offer: Offer) => void;
}

const DEFAULT_OFFER_IMG = "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80";

export default function OfferCard({ offer, onViewOffer }: OfferCardProps) {
  const { likedOffers, toggleOfferLike, addToCart } = useApp();
  const [imgSrc, setImgSrc] = useState(offer.businessLogo || DEFAULT_OFFER_IMG);
  
  const isLiked = Boolean(likedOffers[offer.id]);
  const isSoldOut = (offer as any).isSoldOut || (offer as any).availableCount === 0;

  const originalPrice = offer.originalPrice || Math.round((offer.ouiyaPrice ?? 499) * 1.35);
  const discountedPrice = offer.ouiyaPrice ?? 499;
  const savings = originalPrice - discountedPrice;

  return (
    <div 
      onClick={() => onViewOffer(offer)}
      className="group bg-white dark:bg-[#1E1E1E] border border-zinc-200/80 dark:border-[#27272A] rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col h-full hover:-translate-y-1 relative cursor-pointer"
    >
      {/* Product Image Container with Badges */}
      <div className="relative h-44 sm:h-48 w-full bg-zinc-100 dark:bg-[#18181B] overflow-hidden flex items-center justify-center">
        <img
          src={imgSrc}
          alt={offer.title}
          onError={() => setImgSrc(DEFAULT_OFFER_IMG)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out ${
            isSoldOut ? "grayscale opacity-60" : ""
          }`}
        />

        {/* Soft bottom image gradient for high-contrast presentation */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Top-Left Discount Badge */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className="bg-gradient-to-r from-[#FA0303] to-[#970202] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-lg shadow-sm tracking-tight inline-flex items-center gap-1">
            <span>{offer.discount || "25% OFF"}</span>
          </span>
        </div>

        {/* Top-Right Wishlist Heart */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleOfferLike(offer.id);
          }}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all active:scale-90 shadow-sm cursor-pointer ${
            isLiked
              ? "bg-[#DC0101] text-white"
              : "bg-white/85 dark:bg-black/60 text-zinc-700 dark:text-zinc-200 hover:text-[#DC0101] hover:bg-white"
          }`}
          title={isLiked ? "Remove from favourites" : "Save to favourites"}
        >
          <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
        </button>

        {/* Sold out overlay tag */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
            <span className="bg-[#DC0101] text-white text-xs font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg border border-red-400">
              CLAIMED OUT
            </span>
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[10px] font-extrabold text-[#DC0101] dark:text-red-400 uppercase tracking-wider truncate">
              {offer.category || "General"}
            </span>
            <div className="flex items-center gap-1 bg-emerald-600 text-white px-1.5 py-0.5 rounded-md text-[10px] font-black shrink-0 shadow-xs">
              <Star className="w-3 h-3 fill-current" />
              <span>{offer.rating || 4.5}</span>
            </div>
          </div>

          {/* Store Name with Verified Icon */}
          <div className="flex items-center gap-1">
            <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 truncate">
              {offer.businessName}
            </h4>
            <CheckCircle2 className="w-3 h-3 text-sky-500 shrink-0" />
          </div>

          {/* Deal Title */}
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white line-clamp-1 group-hover:text-[#DC0101] transition-colors leading-snug mt-0.5">
            {offer.title}
          </h3>

          {/* Location / Distance Indicator */}
          <div className="flex items-center gap-1 text-[11px] text-zinc-400 dark:text-zinc-500 mt-1 font-medium">
            <MapPin className="w-3 h-3 text-[#DC0101] shrink-0" />
            <span className="truncate">{offer.location || "Pondicherry"}</span>
          </div>
        </div>

        {/* Pricing Row & Action Buttons */}
        <div className="pt-2.5 border-t border-zinc-100 dark:border-[#27272A] flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                ₹{discountedPrice}
              </span>
              {originalPrice > discountedPrice && (
                <span className="text-xs text-zinc-400 line-through font-medium">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            {savings > 0 && (
              <span className="text-[9.5px] font-bold text-emerald-600 dark:text-emerald-400 block">
                Save ₹{savings}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(offer);
              }}
              disabled={isSoldOut}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-[#27272A] hover:bg-[#DC0101] hover:text-white text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer disabled:opacity-50 active:scale-95 shadow-2xs"
              title="Add to Cart"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewOffer(offer);
              }}
              disabled={isSoldOut}
              className="bg-[#DC0101] hover:bg-[#B91C1C] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 flex items-center gap-1"
            >
              <span>{isSoldOut ? "Claimed" : "View"}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../lib/AppContext";
import { 
  X, 
  MapPin, 
  Navigation, 
  ShoppingCart, 
  Star, 
  Check, 
  Copy, 
  Gift, 
  Tag, 
  Ticket, 
  Store, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  MessageCircle, 
  Clock, 
  CheckCircle2, 
  ExternalLink 
} from "lucide-react";
import { getOffers, MOCK_BUSINESSES, Business, Offer } from "../lib/db";

export default function OfferDetailModal() {
  const { 
    selectedOffer, 
    closeOfferDetails, 
    openOfferDetails, 
    addToCart, 
    user, 
    openAuthModal, 
    setTab 
  } = useApp();

  const [activeTab, setActiveTab] = useState<"offers" | "vouchers" | "about" | "reviews">("offers");
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [storeOffers, setStoreOffers] = useState<Offer[]>([]);
  const [storeBusiness, setStoreBusiness] = useState<Business | null>(null);
  const [addedToCartToast, setAddedToCartToast] = useState(false);
  
  // Claimed voucher modal state
  const [claimedCoupon, setClaimedCoupon] = useState<{
    code: string;
    discount: string;
    validTill: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [inviteCopied, setInviteCopied] = useState(false);

  // New review form state
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [localReviews, setLocalReviews] = useState<Array<{ username: string; rating: number; text: string; date: string }>>([]);

  // Load all offers for this store to display "More from [Store]"
  useEffect(() => {
    if (!selectedOffer) return;
    setActiveTab("offers");
    setIsDescriptionExpanded(false);
    setClaimedCoupon(null);

    // Find store business in MOCK_BUSINESSES or fallback
    const shop = MOCK_BUSINESSES.find(b => 
      (selectedOffer.shopId && b.id === selectedOffer.shopId) ||
      b.name.toLowerCase().trim() === selectedOffer.businessName.toLowerCase().trim()
    );
    setStoreBusiness(shop || null);
    if (shop?.comments) {
      setLocalReviews(shop.comments);
    }

    // Load offers matching this business
    getOffers().then((all) => {
      const filtered = all.filter(o => 
        (selectedOffer.shopId && o.shopId === selectedOffer.shopId) ||
        o.businessName.toLowerCase().trim() === selectedOffer.businessName.toLowerCase().trim()
      );
      setStoreOffers(filtered);
    });
  }, [selectedOffer]);

  if (!selectedOffer) return null;

  // Other offers from this store (excluding current one)
  const otherOffers = storeOffers.filter(o => o.id !== selectedOffer.id);

  // Pricing & savings calculations
  const ouiyaPrice = selectedOffer.ouiyaPrice ?? 899;
  const originalPrice = selectedOffer.originalPrice || Math.round(ouiyaPrice * 1.6);
  const youSaveAmount = Math.max(0, originalPrice - ouiyaPrice);
  const discountPercent = originalPrice > 0 
    ? Math.round(((originalPrice - ouiyaPrice) / originalPrice) * 100) 
    : 40;
  const discountDisplay = selectedOffer.discount || `${discountPercent}% OFF`;

  // Store metadata
  const validTill = selectedOffer.expiryDate ? new Date(selectedOffer.expiryDate).toLocaleDateString("en-GB") : "23/12/2026";
  const locationText = selectedOffer.location || storeBusiness?.address || "18, Mission Street, White Town, Puducherry – 605001";
  const ratingText = selectedOffer.rating ? selectedOffer.rating.toFixed(1) : (storeBusiness?.rating ? storeBusiness.rating.toFixed(1) : "4.8");
  const reviewsCountText = selectedOffer.reviewsCount || (storeBusiness?.reviewsCount ?? "254");
  const aboutText = selectedOffer.aboutOffer || selectedOffer.description || "Intensive steam therapy, relaxing scalp massage, hair nourishing masque, and professional blow-dry styling.";

  // Handle Add to Cart
  const handleAddToCart = () => {
    addToCart(selectedOffer);
    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2200);
  };

  // Handle Claim Offer Voucher
  const handleClaimOffer = (offerToClaim: Offer = selectedOffer) => {
    if (!user) {
      openAuthModal();
      return;
    }

    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const storePrefix = offerToClaim.businessName.replace(/[^A-Za-z]/g, "").substring(0, 4).toUpperCase() || "DEAL";
    const generatedCode = offerToClaim.code || `TG-${storePrefix}-${randomSuffix}`;

    const newClaim = {
      code: generatedCode,
      discount: offerToClaim.discount || discountDisplay,
      validTill: validTill,
    };

    try {
      const existingStr = localStorage.getItem("ouiya_purchased_coupons") || "[]";
      const existing = JSON.parse(existingStr);
      const voucherItem = {
        id: `voucher-${Date.now()}`,
        businessName: offerToClaim.businessName,
        title: offerToClaim.title,
        discount: offerToClaim.discount || discountDisplay,
        code: generatedCode,
        validTill: validTill,
        qrText: `https://youroffersanddeals.com/verify?code=${generatedCode}`,
      };
      localStorage.setItem("ouiya_purchased_coupons", JSON.stringify([voucherItem, ...existing]));
    } catch (_) {}

    addToCart(offerToClaim);
    setClaimedCoupon(newClaim);
  };

  const handleCopyCode = () => {
    if (claimedCoupon?.code) {
      navigator.clipboard.writeText(claimedCoupon.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInvite = () => {
    const text = `Hey! Check out this exclusive offer at ${selectedOffer.businessName} on ouiya: "${selectedOffer.title}" at just ₹${ouiyaPrice}! Use my link to get ₹50 Cashback: https://youroffersanddeals.com`;
    if (navigator.share) {
      navigator.share({ title: "ouiya Deals", text });
    } else {
      navigator.clipboard.writeText(text);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    }
  };

  const handleDirections = () => {
    const query = encodeURIComponent(`${selectedOffer.businessName} ${locationText}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    const review = {
      username: user?.displayName || "Happy Customer",
      rating: newReviewRating,
      text: newReviewText.trim(),
      date: "Just now"
    };
    setLocalReviews([review, ...localReviews]);
    setNewReviewText("");
  };

  const handleModalClose = () => {
    setClaimedCoupon(null);
    closeOfferDetails();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 select-none">
      {/* Background Dim Backdrop */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-md animate-fade-in"
        onClick={handleModalClose}
      />

      {/* Main Modal Container (Styled exactly like Flutter App Screen 1:1) */}
      <div className="relative bg-[#18181B] border border-zinc-800 w-full max-w-md sm:max-w-lg rounded-[32px] shadow-2xl z-10 max-h-[94vh] flex flex-col justify-between animate-scale-up text-white overflow-hidden">
        
        {/* ======================================================== */}
        {/* VIEW A: VOUCHER CLAIMED SUCCESS VIEW                    */}
        {/* ======================================================== */}
        {claimedCoupon ? (
          <div className="p-6 overflow-y-auto no-scrollbar space-y-5 text-center">
            <button
              onClick={handleModalClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white p-2 rounded-full hover:bg-zinc-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <Check className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#DC0101] bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
                🎉 Congratulations!
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-2.5 tracking-tight">
                Your Voucher is Ready
              </h3>
              <p className="text-xs text-zinc-400 font-medium mt-1">
                Show this voucher QR code or promo code at <strong className="text-white">{selectedOffer.businessName}</strong> to redeem.
              </p>
            </div>

            {/* Voucher Card */}
            <div className="bg-[#202024] border-2 border-dashed border-zinc-700 rounded-3xl p-5 space-y-4 max-w-sm mx-auto">
              <div className="w-36 h-36 mx-auto bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-lg">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(claimedCoupon.code)}`}
                  alt="Voucher QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                  VOUCHER PROMO CODE
                </span>
                <div className="flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3">
                  <span className="font-mono text-lg font-black tracking-widest text-[#DC0101]">
                    {claimedCoupon.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-zinc-400 space-y-1 pt-1 border-t border-zinc-800">
                <div className="flex justify-between">
                  <span>Offer:</span>
                  <strong className="text-zinc-200">{selectedOffer.title}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <strong className="text-[#DC0101]">{claimedCoupon.discount}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Valid Till:</span>
                  <strong className="text-zinc-200">{claimedCoupon.validTill}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDirections}
                className="flex-1 border border-zinc-700 hover:border-zinc-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Navigation className="w-4 h-4 text-[#DC0101] rotate-45" />
                <span>Get Route</span>
              </button>
              <button
                type="button"
                onClick={handleModalClose}
                className="flex-1 bg-[#DC0101] hover:bg-[#B70101] text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/30"
              >
                <span>Done</span>
              </button>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* VIEW B: MAIN SCROLLABLE APP SCREEN (Offers/Vouchers/etc) */
          /* ======================================================== */
          <div className="flex flex-col flex-1 overflow-hidden">
            
            {/* Scrollable Upper Area */}
            <div className="overflow-y-auto no-scrollbar flex-1 p-4 sm:p-5 space-y-4">
              
              {/* TAB 0: OFFERS VIEW (Exact Match to Mobile Screenshot) */}
              {activeTab === "offers" && (
                <>
                  {/* 1. Header Banner Image with Badges */}
                  <div className="relative h-48 sm:h-56 w-full rounded-[24px] overflow-hidden bg-zinc-900 border border-zinc-800">
                    <img
                      src={selectedOffer.businessLogo || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=800&auto=format&fit=crop&q=80"}
                      alt={selectedOffer.title}
                      className="w-full h-full object-cover"
                    />

                    {/* Discount Badge (Top-Left) */}
                    <div className="absolute top-3.5 left-3.5 bg-[#DC0101] text-white text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                      {discountDisplay}
                    </div>

                    {/* Translucent Circular Close Button (Top-Right) */}
                    <button
                      onClick={handleModalClose}
                      className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white transition-all cursor-pointer shadow-md"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* 2. Store Name, Location & Star Rating */}
                  <div className="pt-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                          {selectedOffer.businessName}
                        </h2>
                        <p className="text-xs text-zinc-400 font-medium mt-1 flex items-center gap-1.5 leading-tight">
                          <MapPin className="w-3.5 h-3.5 text-[#DC0101] shrink-0" />
                          <span className="truncate">{locationText}</span>
                        </p>
                      </div>

                      {/* Rating Badge */}
                      <div className="flex items-center gap-1 bg-[#00A86B] text-white px-2.5 py-1 rounded-xl text-xs font-black shadow-sm shrink-0">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{ratingText}</span>
                      </div>
                    </div>

                    {/* Offer Title */}
                    <h3 className="text-sm sm:text-base font-bold text-zinc-200 mt-2.5 leading-snug">
                      {selectedOffer.title}
                    </h3>
                  </div>

                  {/* 3. Three-Column Price Comparison Card */}
                  <div className="bg-[#202024] border border-zinc-800 rounded-2xl p-3.5 grid grid-cols-3 divide-x divide-zinc-800 text-center">
                    <div className="px-2">
                      <span className="text-[10px] font-extrabold uppercase text-zinc-400 tracking-wider block">
                        ORIGINAL PRICE
                      </span>
                      <span className="text-sm sm:text-base font-bold text-zinc-400 line-through mt-1 block">
                        ₹{originalPrice}
                      </span>
                    </div>

                    <div className="px-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#DC0101] tracking-wider block">
                        OFFER PRICE
                      </span>
                      <span className="text-lg sm:text-xl font-black text-[#DC0101] mt-0.5 block">
                        ₹{ouiyaPrice}
                      </span>
                    </div>

                    <div className="px-2">
                      <span className="text-[10px] font-extrabold uppercase text-[#00E676] tracking-wider block">
                        YOU SAVE
                      </span>
                      <span className="text-sm sm:text-base font-black text-[#00E676] mt-1 block">
                        ₹{youSaveAmount}
                      </span>
                    </div>
                  </div>

                  {/* 4. Four Stat Badges in a Single Row */}
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-[#202024] border border-zinc-800/80 p-2.5 rounded-xl">
                      <span className="text-[9px] text-zinc-400 block font-semibold">Valid Till</span>
                      <span className="text-xs font-black text-white block mt-0.5 truncate">{validTill}</span>
                    </div>
                    <div className="bg-[#202024] border border-zinc-800/80 p-2.5 rounded-xl">
                      <span className="text-[9px] text-zinc-400 block font-semibold">Min Bill</span>
                      <span className="text-xs font-black text-white block mt-0.5">₹{ouiyaPrice}</span>
                    </div>
                    <div className="bg-[#202024] border border-zinc-800/80 p-2.5 rounded-xl">
                      <span className="text-[9px] text-zinc-400 block font-semibold">Max Discount</span>
                      <span className="text-xs font-black text-white block mt-0.5">₹1000</span>
                    </div>
                    <div className="bg-[#202024] border border-zinc-800/80 p-2.5 rounded-xl">
                      <span className="text-[9px] text-zinc-400 block font-semibold">Use While</span>
                      <span className="text-xs font-black text-white block mt-0.5">Dine-in</span>
                    </div>
                  </div>

                  {/* 5. Extra Savings Referral Card (Matches Mobile Screenshot 1:1) */}
                  <div className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 shadow-md">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-[#3F3F46] flex items-center justify-center shrink-0">
                        <Gift className="w-5 h-5 text-[#DC0101]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-black text-[#DC0101] tracking-tight">
                          Extra Savings!
                        </h4>
                        <p className="text-[11px] text-zinc-300 font-medium truncate mt-0.5">
                          Invite your friends &amp; you both get ₹50 Cashback
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleInvite}
                      className="border border-[#DC0101] bg-[#1E1E1E] hover:bg-[#DC0101]/10 text-[#DC0101] font-bold text-xs px-3 py-1.5 rounded-full transition-all cursor-pointer shrink-0 active:scale-95"
                    >
                      {inviteCopied ? "Copied!" : "Invite Now"}
                    </button>
                  </div>

                  {/* 6. About This Offer Card (Matches Mobile Screenshot 1:1) */}
                  <div className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-4 space-y-2">
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      About This Offer
                    </h4>
                    <p className={`text-xs text-zinc-300 leading-relaxed font-normal ${!isDescriptionExpanded ? "line-clamp-3" : ""}`}>
                      {aboutText}
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                      className="text-xs font-bold text-[#DC0101] hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                    >
                      <span>{isDescriptionExpanded ? "Read Less" : "Read More"}</span>
                      {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* 7. More from [Store Name] (Matches Mobile Screenshot 1:1) */}
                  {otherOffers.length > 0 && (
                    <div className="space-y-3 pt-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Tag className="w-4 h-4 text-[#DC0101]" />
                          <h4 className="text-sm font-bold text-white">
                            More from {selectedOffer.businessName}
                          </h4>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("offers")}
                          className="bg-[#27272A] hover:bg-zinc-700 text-[#DC0101] font-bold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>View Store ({storeOffers.length})</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Store Offer Cards List */}
                      <div className="space-y-2.5">
                        {otherOffers.map((otherOffer) => {
                          const otherOriginal = otherOffer.originalPrice || 1000;
                          const otherPrice = otherOffer.ouiyaPrice || 749;
                          const otherDiscount = otherOffer.discount || "38% OFF";

                          return (
                            <div
                              key={otherOffer.id}
                              onClick={() => openOfferDetails(otherOffer)}
                              className="bg-[#1E1E1E] hover:bg-[#252529] border border-zinc-800 rounded-2xl p-2.5 flex items-center justify-between gap-3 cursor-pointer transition-all active:scale-[0.99] group"
                            >
                              {/* Left Thumbnail Image with Discount Badge */}
                              <div className="relative w-[76px] h-[76px] rounded-xl overflow-hidden bg-zinc-900 shrink-0">
                                <img
                                  src={otherOffer.businessLogo || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=200&auto=format&fit=crop&q=80"}
                                  alt={otherOffer.title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-[#DC0101] text-white text-[9px] font-black text-center py-0.5">
                                  {otherDiscount}
                                </div>
                              </div>

                              {/* Middle Details */}
                              <div className="flex-1 min-w-0 pr-1">
                                <h5 className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-red-400 transition-colors">
                                  {otherOffer.title}
                                </h5>
                                <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
                                  {otherOffer.subTitle || "On beauty parlour saloon"}
                                </p>
                                <div className="flex items-center gap-2 mt-1.5">
                                  <span className="text-xs text-zinc-400 line-through">
                                    ₹{otherOriginal}
                                  </span>
                                  <span className="text-xs sm:text-sm font-black text-[#DC0101]">
                                    ₹{otherPrice}
                                  </span>
                                </div>
                              </div>

                              {/* Right Chevron Action Button */}
                              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#DC0101] shadow-md shrink-0 group-hover:scale-105 transition-transform">
                                <ChevronRight className="w-4 h-4 text-[#DC0101]" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* TAB 1: VOUCHERS VIEW */}
              {activeTab === "vouchers" && (
                <div className="space-y-3.5 py-1">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-[#DC0101]" />
                    <h3 className="text-base font-bold text-white">
                      Exclusive Vouchers for {selectedOffer.businessName}
                    </h3>
                  </div>

                  {storeBusiness?.vouchers && storeBusiness.vouchers.length > 0 ? (
                    <div className="space-y-3">
                      {storeBusiness.vouchers.map((vouch) => (
                        <div
                          key={vouch.id}
                          className="bg-[#202024] border border-dashed border-red-500/40 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="space-y-1">
                            <span className="bg-[#DC0101] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                              {vouch.discount}
                            </span>
                            <h4 className="text-sm font-bold text-white pt-1">
                              {vouch.title}
                            </h4>
                            <p className="text-[11px] text-zinc-400">
                              Valid until {vouch.expiry}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleClaimOffer({
                              ...selectedOffer,
                              title: vouch.title,
                              code: vouch.code,
                              discount: vouch.discount,
                            })}
                            className="bg-[#DC0101] hover:bg-[#B70101] text-white text-xs font-black px-4 py-2 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                          >
                            Claim
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#202024] border border-dashed border-zinc-800 rounded-2xl p-6 text-center space-y-2">
                      <Ticket className="w-8 h-8 text-zinc-500 mx-auto" />
                      <p className="text-sm font-bold text-zinc-300">No standalone vouchers currently</p>
                      <p className="text-xs text-zinc-400">Check the Offers tab for instant deals and discounts.</p>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: ABOUT STORE VIEW */}
              {activeTab === "about" && (
                <div className="space-y-4 py-1">
                  {/* Photo Gallery Carousel */}
                  {storeBusiness?.gallery && storeBusiness.gallery.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden">
                      {storeBusiness.gallery.slice(0, 3).map((imgUrl, i) => (
                        <div key={i} className="h-24 bg-zinc-900 overflow-hidden rounded-xl">
                          <img src={imgUrl} alt={`Store photo ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Store Details Card */}
                  <div className="bg-[#202024] border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <h3 className="text-base font-bold text-white">
                      About {selectedOffer.businessName}
                    </h3>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {storeBusiness?.about || "Premier salon and wellness clinic offering high quality beauty, hair, and spa therapies with verified hygiene standards."}
                    </p>

                    <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-zinc-300">
                        <MapPin className="w-4 h-4 text-[#DC0101] shrink-0" />
                        <span>{locationText}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Open Today: 9:00 AM – 9:00 PM</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                        <span>Verified Merchant • Instant Voucher Acceptance</span>
                      </div>
                    </div>

                    {/* Quick Call & Route buttons */}
                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => window.open(`tel:${storeBusiness?.phone || "+919442218899"}`, "_self")}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Call Store</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleDirections}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <Navigation className="w-3.5 h-3.5 text-[#DC0101]" />
                        <span>Directions</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: REVIEWS VIEW */}
              {activeTab === "reviews" && (
                <div className="space-y-4 py-1">
                  {/* Rating Header Card */}
                  <div className="bg-[#202024] border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <span className="text-3xl font-black text-white">{ratingText}</span>
                      <div className="flex items-center gap-1 text-[#00A86B] mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-1">
                        Based on {reviewsCountText} verified ratings
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="bg-[#00A86B]/15 text-[#00A86B] font-bold text-xs px-3 py-1.5 rounded-full inline-block border border-[#00A86B]/30">
                        Excellent (94%)
                      </span>
                    </div>
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {localReviews.map((rev, i) => (
                      <div key={i} className="bg-[#1E1E1E] border border-zinc-800 rounded-2xl p-3.5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{rev.username}</span>
                          <span className="text-[10px] text-zinc-400">{rev.date}</span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, s) => (
                            <Star key={s} className="w-3 h-3 fill-current" />
                          ))}
                        </div>
                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {rev.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Add Review Form */}
                  <form onSubmit={handleAddReview} className="bg-[#202024] border border-zinc-800 rounded-2xl p-3.5 space-y-2.5">
                    <h5 className="text-xs font-bold text-white">Write a Review</h5>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          onClick={() => setNewReviewRating(s)}
                          className={`w-4 h-4 cursor-pointer transition-colors ${
                            s <= newReviewRating ? "text-amber-400 fill-amber-400" : "text-zinc-600"
                          }`}
                        />
                      ))}
                    </div>
                    <input
                      type="text"
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#DC0101]"
                    />
                    <button
                      type="submit"
                      className="bg-[#DC0101] hover:bg-[#B70101] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      Post Review
                    </button>
                  </form>
                </div>
              )}

            </div>

            {/* ======================================================== */}
            {/* FIXED BOTTOM SECTION (Action Buttons + Store Nav Bar)    */}
            {/* ======================================================== */}
            <div className="p-3 sm:p-4 bg-[#18181B] border-t border-zinc-800/90 space-y-2.5">
              
              {/* Row 1: Action Buttons (Directions + Add to Cart) */}
              <div className="flex items-center gap-2.5">
                {/* Directions Button (Red outlined matching screenshot) */}
                <button
                  type="button"
                  onClick={handleDirections}
                  className="border border-[#DC0101] hover:bg-[#DC0101]/10 bg-transparent text-[#DC0101] font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <Navigation className="w-4 h-4 text-[#DC0101] rotate-45" />
                  <span>Directions</span>
                </button>

                {/* Add to Cart Button (Solid Red matching screenshot) */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="bg-[#DC0101] hover:bg-[#B70101] text-white font-black py-3 px-4 rounded-xl text-xs sm:text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 flex-1 cursor-pointer transition-all active:scale-98 tracking-wide"
                >
                  {addedToCartToast ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4 text-white" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Row 2: Store Navigation Bar ([Offers] [Vouchers] [About Store] [Reviews]) */}
              <div className="bg-[#1E1E1E] border border-[#DC0101] rounded-2xl p-1 grid grid-cols-4 gap-1 text-center shadow-md">
                
                {/* Tab: Offers */}
                <button
                  type="button"
                  onClick={() => setActiveTab("offers")}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                    activeTab === "offers" 
                      ? "text-[#DC0101] font-bold" 
                      : "text-zinc-400 hover:text-white font-medium"
                  }`}
                >
                  <Tag className={`w-4 h-4 ${activeTab === "offers" ? "text-[#DC0101] fill-current" : ""}`} />
                  <span className="text-[10px] leading-tight">Offers</span>
                </button>

                {/* Tab: Vouchers */}
                <button
                  type="button"
                  onClick={() => setActiveTab("vouchers")}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                    activeTab === "vouchers" 
                      ? "text-[#DC0101] font-bold" 
                      : "text-zinc-400 hover:text-white font-medium"
                  }`}
                >
                  <Ticket className={`w-4 h-4 ${activeTab === "vouchers" ? "text-[#DC0101] fill-current" : ""}`} />
                  <span className="text-[10px] leading-tight">Vouchers</span>
                </button>

                {/* Tab: About Store */}
                <button
                  type="button"
                  onClick={() => setActiveTab("about")}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                    activeTab === "about" 
                      ? "text-[#DC0101] font-bold" 
                      : "text-zinc-400 hover:text-white font-medium"
                  }`}
                >
                  <Store className={`w-4 h-4 ${activeTab === "about" ? "text-[#DC0101] fill-current" : ""}`} />
                  <span className="text-[10px] leading-tight">About Store</span>
                </button>

                {/* Tab: Reviews */}
                <button
                  type="button"
                  onClick={() => setActiveTab("reviews")}
                  className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                    activeTab === "reviews" 
                      ? "text-[#DC0101] font-bold" 
                      : "text-zinc-400 hover:text-white font-medium"
                  }`}
                >
                  <Star className={`w-4 h-4 ${activeTab === "reviews" ? "text-[#DC0101] fill-current" : ""}`} />
                  <span className="text-[10px] leading-tight">Reviews</span>
                </button>

              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { Ticket, Copy, Check } from "lucide-react";

interface VoucherCardProps {
  storeName: string;
  discountText: string;
  conditionText: string;
  promoCode: string;
  gradient: string;
  onSelectStore?: () => void;
}

export default function VoucherCard({
  storeName,
  discountText,
  conditionText,
  promoCode,
  gradient,
  onSelectStore
}: VoucherCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onClick={onSelectStore}
      className={`relative rounded-2xl p-4 sm:p-5 text-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[150px] ${gradient} group`}
    >
      {/* Semi-circular ticket cutouts on left and right */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#0b0f19] z-10" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white dark:bg-[#0b0f19] z-10" />

      {/* Decorative dashed dividing line */}
      <div className="absolute left-4 right-4 top-1/2 border-b border-white/20 border-dashed pointer-events-none" />

      {/* Top half */}
      <div className="space-y-1 z-10">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full backdrop-blur-xs">
            {storeName}
          </span>
          <Ticket className="w-4 h-4 opacity-75" />
        </div>
        <h4 className="text-xl font-black tracking-tight drop-shadow-sm">
          {discountText}
        </h4>
        <p className="text-[10px] text-white/80 font-medium">
          {conditionText}
        </p>
      </div>

      {/* Bottom half */}
      <div className="pt-5 flex items-center justify-between z-10">
        <div className="bg-black/30 border border-white/25 backdrop-blur-sm rounded-xl px-3 py-1 flex items-center gap-1.5">
          <span className="text-xs font-mono font-black tracking-widest text-yellow-300">
            {promoCode}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="bg-white text-zinc-900 font-black text-[11px] px-3 py-1.5 rounded-xl shadow-sm hover:bg-white/90 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

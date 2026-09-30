"use client";

import React from "react";
import { X, ShieldCheck, FileText, HelpCircle, Info, Sparkles, CheckCircle2, MapPin } from "lucide-react";

export type LegalModalTab = "terms" | "privacy" | "how-it-works" | "faqs" | "about";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: LegalModalTab;
  setActiveTab: (tab: LegalModalTab) => void;
}

export default function LegalModal({
  isOpen,
  onClose,
  activeTab,
  setActiveTab
}: LegalModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
      <div 
        className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl relative overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Brand Gradient Accent */}
        <div className="bg-gradient-to-r from-[#FA0303] via-[#DC0101] to-[#970202] text-white p-5 sm:p-6 pb-4 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-md p-1 flex items-center justify-center">
              <img src="/assets/images/logo.png" alt="Ouiya Logo" className="w-full h-full object-contain" onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }} />
            </div>
            <span className="text-xl font-black tracking-tight">ouiya.</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black">
            {activeTab === "terms" && "Terms & Conditions"}
            {activeTab === "privacy" && "Privacy Policy"}
            {activeTab === "how-it-works" && "How Ouiya Works"}
            {activeTab === "faqs" && "Frequently Asked Questions"}
            {activeTab === "about" && "About Ouiya"}
          </h2>
          <p className="text-xs text-white/85 font-medium mt-0.5">
            Everything you need to know about offers, vouchers & consumer protection.
          </p>

          {/* Tab Navigation Strip */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-4 -mb-1">
            {[
              { id: "how-it-works" as LegalModalTab, label: "How It Works", icon: Sparkles },
              { id: "faqs" as LegalModalTab, label: "FAQs", icon: HelpCircle },
              { id: "terms" as LegalModalTab, label: "Terms", icon: FileText },
              { id: "privacy" as LegalModalTab, label: "Privacy", icon: ShieldCheck },
              { id: "about" as LegalModalTab, label: "About Us", icon: Info },
            ].map((tab) => {
              const isSelected = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    isSelected
                      ? "bg-white text-[#DC0101] shadow-sm font-black"
                      : "text-white/80 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed">
          
          {/* TAB: HOW IT WORKS */}
          {activeTab === "how-it-works" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    step: "01",
                    title: "Browse Local Offers",
                    desc: "Explore verified discounts and deals across French cafes, beach resorts, luxury spas, bike rentals, and activities in Pondicherry."
                  },
                  {
                    step: "02",
                    title: "Claim or Purchase",
                    desc: "Add your deal to the cart or 1-click copy trending voucher promo codes. Complete quick payment via Razorpay, UPI, or Cards."
                  },
                  {
                    step: "03",
                    title: "Instant Digital Voucher",
                    desc: "Receive your unique QR code voucher stored safely under your purchases and sent to your email with instant validity."
                  },
                  {
                    step: "04",
                    title: "Redeem at Store",
                    desc: "Visit the partner business in Pondicherry, show your QR code voucher at billing, and enjoy your discount instantly!"
                  },
                ].map((s) => (
                  <div key={s.step} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1.5">
                    <span className="text-xl font-black text-[#DC0101]">{s.step}</span>
                    <h4 className="text-base font-black text-zinc-900 dark:text-white">{s.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{s.desc}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Single Store Rule:</strong> Each purchase order is bound to a single merchant to ensure a unified QR voucher for straightforward redemption at the merchant counter.
                </span>
              </div>
            </div>
          )}

          {/* TAB: FAQS */}
          {activeTab === "faqs" && (
            <div className="space-y-4">
              {[
                {
                  q: "How do I redeem my purchased offer at the store?",
                  a: "After purchasing, open your Profile / Purchases tab to view your active QR code. Simply show this QR code or 6-character voucher code to the merchant at the billing counter."
                },
                {
                  q: "Can I combine deals from multiple stores in a single cart?",
                  a: "No. Because each checkout generates a single digital QR voucher for the merchant, offers must be from the same business. You can make separate checkouts for different stores."
                },
                {
                  q: "What is Discover Pondicherry?",
                  a: "Discover Pondicherry is Ouiya's curated tourist and hotspot explorer. It features Heritage Town, Promenade Beach, French Quarters, Auroville, and Chunnambar Boating with verified local activities."
                },
                {
                  q: "What happens if an offer is claimed out?",
                  a: "Offers have business-set redemption quotas. Once the quota is reached, the offer is labeled as 'CLAIMED OUT' and cannot be purchased until the merchant restocks."
                },
                {
                  q: "How do refund requests work?",
                  a: "Unused coupons can be cancelled within 24 hours of purchase if the merchant is unable to fulfill the service. Once redeemed at the counter, coupons are non-refundable."
                }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-700/60 space-y-1">
                  <h4 className="text-sm font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#DC0101] shrink-0" />
                    <span>{item.q}</span>
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium pl-6 leading-relaxed">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB: TERMS */}
          {activeTab === "terms" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <h4 className="text-base font-black text-zinc-900 dark:text-white">1. Introduction & Acceptance</h4>
              <p>
                By accessing or using the Ouiya application and website (the &quot;Platform&quot;), operated by TechGajana Pvt. Ltd., you agree to be bound by these Terms and Conditions.
              </p>

              <h4 className="text-base font-black text-zinc-900 dark:text-white">2. Coupon & Voucher Redemption</h4>
              <ul className="list-disc pl-5 space-y-1 text-zinc-600 dark:text-zinc-400">
                <li>Each coupon or voucher is valid only until the stated expiration date.</li>
                <li>Vouchers must be presented prior to billing at the partner outlet.</li>
                <li>Coupons cannot be exchanged for cash or combined with other ongoing merchant promotions unless explicitly permitted.</li>
                <li>Redemption status is permanently verified in Cloud Firestore at the time of QR scan.</li>
              </ul>

              <h4 className="text-base font-black text-zinc-900 dark:text-white">3. Merchant Responsibility</h4>
              <p>
                Partner businesses are independent entities responsible for the quality of goods and services provided. Ouiya facilitates digital vouchers and discovery.
              </p>
            </div>
          )}

          {/* TAB: PRIVACY */}
          {activeTab === "privacy" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <h4 className="text-base font-black text-zinc-900 dark:text-white">1. Information We Collect</h4>
              <p>
                We collect your name, email, phone number, and location coordinates when you grant permission. Location data is used strictly to display nearby stores and calculate real distances in Pondicherry.
              </p>

              <h4 className="text-base font-black text-zinc-900 dark:text-white">2. Payment Security</h4>
              <p>
                All online transactions are securely encrypted and processed through certified RBI-compliant gateways (Razorpay). Ouiya never stores debit/credit card numbers or CVV codes.
              </p>

              <h4 className="text-base font-black text-zinc-900 dark:text-white">3. Your Data Rights</h4>
              <p>
                You have the right to request deletion of your account and associated purchases by emailing support@ouiya.in or navigating to Account Settings.
              </p>
            </div>
          )}

          {/* TAB: ABOUT US */}
          {activeTab === "about" && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/80 dark:border-zinc-700/60">
                <img src="/assets/images/logo.png" alt="Ouiya Logo" className="w-14 h-14 object-contain rounded-xl bg-white p-1 shadow-sm" />
                <div>
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white">Ouiya - The Offer Explorer</h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold">Developed by TechGajana Pvt. Ltd.</p>
                  <p className="text-[11px] text-[#DC0101] font-bold mt-0.5">Version 1.0.0 &bull; Pondicherry, India</p>
                </div>
              </div>

              <p className="text-xs sm:text-sm">
                Ouiya is Pondicherry&apos;s premier hyper-local discovery platform, bridging the gap between discerning customers and high-quality local merchants. From beach villas to traditional French dining and wellness spas, Ouiya unlocks verified savings across Puducherry.
              </p>

              <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/40 text-xs space-y-1">
                <p><strong>Corporate Office:</strong> TechGajana Pvt. Ltd., Mission Street, Pondicherry 605001</p>
                <p><strong>Support Email:</strong> support@ouiya.in</p>
                <p><strong>Official Helpline:</strong> +91 94432 10987</p>
              </div>
            </div>
          )}

        </div>

        {/* Footer Action */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50 dark:bg-[#0E121B] flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#DC0101] hover:bg-[#B91C1C] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

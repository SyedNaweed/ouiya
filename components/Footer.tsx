"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tag, Smartphone } from "lucide-react";
import { useApp } from "../lib/AppContext";
import LegalModal, { LegalModalTab } from "./LegalModal";

export default function Footer() {
  const { setTab } = useApp();
  const router = useRouter();

  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<LegalModalTab>("how-it-works");
  const [appStoreNotice, setAppStoreNotice] = useState(false);

  const openLegal = (tab: LegalModalTab, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setLegalModalTab(tab);
    setLegalModalOpen(true);
  };

  const handleNav = (tabName: "home" | "categories" | "cart" | "discover", targetAnchor?: string) => {
    setTab(tabName);
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      router.push("/");
    }
    setTimeout(() => {
      if (targetAnchor) {
        const el = document.getElementById(targetAnchor);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <footer className="bg-zinc-50 border-t border-zinc-100 dark:bg-zinc-950 dark:border-zinc-800 select-none">
        <div className="max-w-[1600px] mx-auto px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            
            {/* Logo & Intro Column */}
            <div className="lg:col-span-2">
              <button 
                onClick={() => handleNav("home")} 
                className="flex items-center gap-2 group mb-6 text-left cursor-pointer focus:outline-none"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition-transform bg-white dark:bg-zinc-800 p-0.5 border border-zinc-200 dark:border-zinc-800">
                  <img 
                    src="/assets/icons/Logo.png" 
                    alt="Ouiya Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/images/logo.png";
                    }}
                  />
                </div>
                <span className="text-xl font-black tracking-tight text-zinc-900 dark:text-white">
                  ouiya<span className="text-[#DC0101]">.</span>
                </span>
              </button>

              <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed mb-6 font-medium">
                Your one-stop destination for the best offers, coupons & exciting deals from top businesses in your city. Save on dining, fashion, electronics, and more!
              </p>

              {/* Social Buttons */}
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm text-zinc-600 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] hover:scale-105 transition-all duration-200 cursor-pointer"
                  title="Facebook"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm text-zinc-600 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] hover:scale-105 transition-all duration-200 cursor-pointer"
                  title="Instagram"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </a>
                <a 
                  href="https://twitter.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm text-zinc-600 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] hover:scale-105 transition-all duration-200 cursor-pointer"
                  title="Twitter (X)"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
                  </svg>
                </a>
                <a 
                  href="https://wa.me/919443210987" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow-sm text-zinc-600 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] hover:scale-105 transition-all duration-200 cursor-pointer"
                  title="WhatsApp Support"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Links Column 1: Quick Links */}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wider uppercase mb-5">
                Quick Links
              </h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={() => handleNav("home")}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNav("categories")}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    Offers
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNav("home", "categories")}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    Categories
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNav("home", "businesses")}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    Top Businesses
                  </button>
                </li>
              </ul>
            </div>

            {/* Links Column 2: For Users */}
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-wider uppercase mb-5">
                For Users
              </h3>
              <ul className="space-y-3">
                <li>
                  <button 
                    onClick={(e) => openLegal("how-it-works", e)}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    How it Works
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => openLegal("faqs", e)}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    FAQs
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => openLegal("terms", e)}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button 
                    onClick={(e) => openLegal("privacy", e)}
                    className="text-sm text-zinc-500 hover:text-[#DC0101] dark:text-zinc-400 dark:hover:text-[#DC0101] transition-colors duration-150 cursor-pointer text-left font-medium"
                  >
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

          </div>

          {/* Footer Bottom */}
          <div className="mt-12 pt-8 border-t border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              &copy; {new Date().getFullYear()} ouiya. All rights reserved.
            </p>
            <div className="flex gap-4">
              {/* App Store Badge */}
              <button 
                onClick={() => setAppStoreNotice(true)} 
                className="block hover:scale-[1.02] transition-transform cursor-pointer"
                title="Download on the App Store"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                  alt="Download on the App Store"
                  className="h-10 dark:invert dark:brightness-200"
                />
              </button>
              {/* Play Store Badge */}
              <button 
                onClick={() => setAppStoreNotice(true)} 
                className="block hover:scale-[1.02] transition-transform cursor-pointer"
                title="Get it on Google Play"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                  alt="Get it on Google Play"
                  className="h-10"
                />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal & Help Modal */}
      <LegalModal
        isOpen={legalModalOpen}
        onClose={() => setLegalModalOpen(false)}
        activeTab={legalModalTab}
        setActiveTab={setLegalModalTab}
      />

      {/* App Store Beta Download Modal */}
      {appStoreNotice && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in select-none">
          <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-4 shadow-2xl relative animate-scale-up">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-950/40 text-[#DC0101] rounded-2xl flex items-center justify-center mx-auto">
              <Smartphone className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-[#DC0101] bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/40">
                Public Beta Release
              </span>
              <h3 className="text-lg font-black text-zinc-900 dark:text-white pt-2">
                Mobile Apps Coming Soon!
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                The Ouiya Android & iOS apps are currently undergoing final Google Play and Apple App Store review. You can use our mobile-optimized web app directly with full functionality!
              </p>
            </div>

            <button
              onClick={() => setAppStoreNotice(false)}
              className="w-full bg-[#DC0101] hover:bg-[#B91C1C] text-white text-xs font-bold py-3 rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Continue on Web
            </button>
          </div>
        </div>
      )}
    </>
  );
}

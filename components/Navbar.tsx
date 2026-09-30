"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  MapPin, 
  ChevronDown, 
  Search, 
  Mic, 
  ShoppingBag, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  LogIn, 
  Menu, 
  X,
  Compass,
  Grid,
  Home
} from "lucide-react";
import { useApp } from "../lib/AppContext";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const { 
    cart, 
    activeTab, 
    setTab, 
    toggleDrawer, 
    isDrawerOpen,
    user,
    logout,
    openAuthModal,
    location,
    openLocationModal,
    searchQuery,
    setSearchQuery
  } = useApp();

  const [isScrolled, setIsScrolled] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() !== "") {
      setTab("home");
      if (pathname !== "/") {
        router.push("/");
      }
    }
  };

  const handleVoiceSearch = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "en-IN";
      recognition.start();
      setVoiceActive(true);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setTab("categories");
        setVoiceActive(false);
        if (pathname !== "/") router.push("/");
      };

      recognition.onerror = () => {
        setVoiceActive(false);
      };

      recognition.onend = () => {
        setVoiceActive(false);
      };
    } else {
      alert("Voice search is not supported in this browser. Please type your search.");
    }
  };

  return (
    <header className="sticky top-0 z-50 select-none shadow-md">
      {/* ── Main Brand Red Header (Flipkart-style / Mobile App Style) ── */}
      <div className="bg-gradient-to-r from-[#FA0303] via-[#DC0101] to-[#970202] text-white">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8">
          
          {/* DESKTOP HEADER ROW */}
          <div className="hidden md:flex h-18 lg:h-20 items-center justify-between gap-4">
            
            {/* Left: Brand Logo & Location */}
            <div className="flex items-center gap-4 shrink-0">
              <Link 
                href="/" 
                onClick={() => setTab("home")} 
                className="flex items-center gap-2.5 group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-1 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                  <img 
                    src="/assets/icons/Logo.png" 
                    alt="Ouiya Logo" 
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/assets/images/logo.png";
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-baseline leading-none">
                    <span className="text-2xl font-black tracking-tight text-white font-sans drop-shadow-sm">
                      ouiya
                    </span>
                    <span className="text-amber-300 text-2xl font-black">.</span>
                  </div>
                  <span className="text-[10px] uppercase font-black tracking-widest text-white/80 block mt-0.5">
                    Offers & Deals
                  </span>
                </div>
              </Link>

              {/* Location Selector Pill */}
              <button
                onClick={openLocationModal}
                className="flex items-center gap-2 bg-white/15 hover:bg-white/25 border border-white/30 text-white px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer backdrop-blur-sm shadow-xs"
                title="Change Location"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <div className="text-left leading-tight">
                  <span className="block font-black text-xs truncate max-w-[130px] lg:max-w-[180px]">
                    {location}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 opacity-80 shrink-0" />
              </button>
            </div>

            {/* Center: Flipkart-style Search Bar */}
            <div className="flex-1 max-w-xl mx-2">
              <form onSubmit={handleSearchSubmit} className="relative">
                <div className="flex items-center bg-white dark:bg-[#1e1e1e] rounded-full shadow-md border border-white/20 overflow-hidden px-3.5 py-1.5 lg:py-2 transition-all focus-within:ring-2 focus-within:ring-white">
                  <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for offers, stores & products..."
                    className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm font-medium focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 mr-2 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    className={`p-1.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                      voiceActive ? "bg-red-500 text-white animate-pulse" : "bg-red-50 text-[#DC0101] hover:bg-red-100"
                    }`}
                    title="Voice Search"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            </div>

            {/* Right: Quick Nav, Notification, Cart, Profile & Theme */}
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              
              {/* Quick Navigation Links */}
              <nav className="flex items-center gap-1">
                <button
                  onClick={() => { setTab("home"); if (pathname !== "/") router.push("/"); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "home" && pathname === "/"
                      ? "bg-white text-[#DC0101] shadow-sm font-black"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => { setTab("categories"); if (pathname !== "/") router.push("/"); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "categories"
                      ? "bg-white text-[#DC0101] shadow-sm font-black"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Offers
                </button>
                <button
                  onClick={() => { setTab("discover"); if (pathname !== "/") router.push("/"); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "discover"
                      ? "bg-white text-[#DC0101] shadow-sm font-black"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  Discover
                </button>
              </nav>

              <div className="h-6 w-px bg-white/20 mx-1" />

              {/* Cart Button */}
              <button
                onClick={() => { setTab("cart"); if (pathname !== "/") router.push("/"); }}
                className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
                title="View Cart"
              >
                <ShoppingBag className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-300 text-zinc-950 text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center border-2 border-[#DC0101] animate-pulse">
                    {totalCartCount}
                  </span>
                )}
              </button>

              {/* Notification Bell */}
              <button
                onClick={toggleDrawer}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
                title="Notifications & Menu"
              >
                <Bell className="w-4 h-4 lg:w-4.5 lg:h-4.5" />
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Authentication */}
              {user ? (
                <div className="flex items-center gap-2 bg-white/15 border border-white/30 rounded-full p-1 pl-2 shadow-sm">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt="User avatar" 
                      className="w-6 h-6 rounded-full object-cover border border-white/40" 
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center text-xs font-black uppercase">
                      {user.displayName 
                        ? user.displayName.charAt(0).toUpperCase() 
                        : (user.phoneNumber ? user.phoneNumber.slice(-2) : (user.email ? user.email.charAt(0).toUpperCase() : "U"))}
                    </div>
                  )}
                  <span className="text-xs font-bold text-white max-w-[90px] truncate hidden xl:inline">
                    {user.displayName || user.phoneNumber || user.email?.split("@")[0] || "User"}
                  </span>
                  <button
                    onClick={logout}
                    className="p-1 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={openAuthModal}
                  className="bg-white text-[#DC0101] hover:bg-white/95 font-black text-xs px-4 py-2 rounded-full shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </button>
              )}

              {/* Side Drawer Menu Trigger */}
              <button
                onClick={toggleDrawer}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer"
                title="Open Side Menu"
              >
                <Menu className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* MOBILE HEADER (Matches Mobile App _AnimatedHeaderBar) */}
          <div className="md:hidden py-2.5 space-y-2">
            
            {/* Mobile Row 1: Location + Profile Avatar & Notifications */}
            <div className="flex items-center justify-between">
              
              {/* Location selector */}
              <button
                onClick={openLocationModal}
                className="flex items-center gap-1.5 text-left text-white cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-white shrink-0" />
                <div className="leading-tight">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-extrabold tracking-tight truncate max-w-[190px]">
                      {location.split(",")[0] || "Pondicherry"}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-90" />
                  </div>
                  <span className="text-[10px] text-white/85 font-medium block">
                    Pondicherry
                  </span>
                </div>
              </button>

              {/* Right: Notifications & Profile */}
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleDrawer}
                  className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>

                <button
                  onClick={user ? toggleDrawer : openAuthModal}
                  className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white overflow-hidden"
                  title="Account"
                >
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Mobile Row 2: Search Bar Pill */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <div className="flex items-center bg-white dark:bg-[#1e1e1e] rounded-full shadow-md px-3.5 py-2">
                <Search className="w-4 h-4 text-zinc-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for offers, stores & products..."
                  className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs font-medium focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`p-1 rounded-full shrink-0 ml-1 ${
                    voiceActive ? "bg-red-500 text-white animate-pulse" : "bg-red-50 text-[#DC0101]"
                  }`}
                  title="Voice Search"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>

        </div>
      </div>
    </header>
  );
}

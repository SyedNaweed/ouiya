"use client";

import React from "react";
import { useApp } from "../lib/AppContext";
import { Home, LayoutGrid, ShoppingBag, User } from "lucide-react";

export default function BottomNav() {
  const { 
    activeTab, 
    setTab, 
    cart, 
    user, 
    openAuthModal, 
    toggleDrawer 
  } = useApp();

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleProfileClick = () => {
    if (!user) {
      openAuthModal();
    } else {
      toggleDrawer();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-[#1E1E1E] border-t border-zinc-200/80 dark:border-[#27272A] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] md:hidden select-none">
      <div className="max-w-lg mx-auto h-16 flex items-center justify-between px-2 sm:px-3">
        {/* 1. HOME */}
        <button
          onClick={() => setTab("home")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "home" 
              ? "text-[#DC0101] dark:text-[#FA0303]" 
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <div className="relative">
            <Home className={`w-5 h-5 ${activeTab === "home" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          </div>
          <span className={`text-[9.5px] mt-1 tracking-tight ${activeTab === "home" ? "font-extrabold" : "font-bold"}`}>
            HOME
          </span>
        </button>

        {/* 2. CATEGORIES */}
        <button
          onClick={() => setTab("categories")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "categories" 
              ? "text-[#DC0101] dark:text-[#FA0303]" 
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <div className="relative">
            <LayoutGrid className={`w-5 h-5 ${activeTab === "categories" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          </div>
          <span className={`text-[9.5px] mt-1 tracking-tight ${activeTab === "categories" ? "font-extrabold" : "font-bold"}`}>
            CATEGORIES
          </span>
        </button>

        {/* 3. CART (With Badge) */}
        <button
          onClick={() => setTab("cart")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
            activeTab === "cart" 
              ? "text-[#DC0101] dark:text-[#FA0303]" 
              : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`w-5 h-5 ${activeTab === "cart" ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#DC0101] text-white text-[9px] font-black min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 border border-white dark:border-zinc-900 shadow-sm animate-pulse">
                {totalItems}
              </span>
            )}
          </div>
          <span className={`text-[9.5px] mt-1 tracking-tight ${activeTab === "cart" ? "font-extrabold" : "font-bold"}`}>
            CART
          </span>
        </button>

        {/* 4. PROFILE */}
        <button
          onClick={handleProfileClick}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all text-zinc-600 dark:text-zinc-400 hover:text-zinc-900"
        >
          <div className="relative">
            {user?.photoURL ? (
              <img 
                src={user.photoURL} 
                alt="Profile" 
                className="w-5 h-5 rounded-full object-cover border border-[#DC0101]" 
              />
            ) : (
              <User className="w-5 h-5 stroke-[1.8]" />
            )}
          </div>
          <span className="text-[9.5px] mt-1 tracking-tight font-bold">
            PROFILE
          </span>
        </button>

        {/* 5. DISCOVER PONDICHERRY (Special Pill Button matching Mobile App) */}
        <div className="shrink-0 pl-1 pr-1">
          <button
            onClick={() => setTab("discover")}
            className={`w-[96px] h-12 rounded-xl flex items-center justify-center text-center shadow-md transition-all active:scale-95 cursor-pointer ${
              activeTab === "discover"
                ? "ring-2 ring-zinc-900 dark:ring-white scale-102"
                : ""
            } bg-gradient-to-b from-[#FA0303] to-[#970202] text-white shadow-red-500/25`}
          >
            <span className="text-[10px] font-black leading-tight tracking-tight uppercase">
              Discover<br />Pondicherry
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

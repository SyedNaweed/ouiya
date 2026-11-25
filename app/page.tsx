"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../lib/AppContext";
import { 
  getOffers, 
  getCategoriesFromFirebase,
  getBusinessesFromFirebase, 
  getBannersFromFirebase,
  getPromoBannersFromFirebase,
  getHotspotsFromFirebase,
  OFFICIAL_CATEGORIES,
  Offer, 
  Category, 
  Business,
  AppBanner,
  PromoBanner,
  Hotspot,
  matchesSubCategory,
  normalizeCategory
} from "../lib/db";
import CategoryBannerCarousel from "../components/CategoryBannerCarousel";
import BottomNav from "../components/BottomNav";
import OfferCard from "../components/OfferCard";
import StoreCard from "../components/StoreCard";
import { searchOffers, searchBusinesses } from "../lib/searchMatcher";
import VoucherCard from "../components/VoucherCard";
import ShopDetailModal from "../components/ShopDetailModal";
import OfferDetailModal from "../components/OfferDetailModal";
import CartModal from "../components/CartModal";
import CouponSuccessModal from "../components/CouponSuccessModal";
import Navbar from "../components/Navbar";
import SideDrawer from "../components/SideDrawer";
import Footer from "../components/Footer";
import AuthModal from "../components/AuthModal";
import LocationModal from "../components/LocationModal";
import DestinationDetailModal from "../components/DestinationDetailModal";

// Views
import CategoryBrowseView from "./offers/page";
import DiscoverPondicherryView from "./discover/page";

import { 
  Sparkles, Flame, Ticket, Compass, MapPin, Store, Gift, ChevronRight, ShieldCheck,
  Utensils, Shirt, Smartphone, Home, Plane, Car, Hotel, Scissors, Anchor, Clapperboard, Wine, Flower2, Dumbbell, Tag, ArrowRight, Share2, Copy, Check
} from "lucide-react";

// Helper to resolve real PNG category icons matching the Mobile App
const resolveCategoryIcon = (categoryName: string) => {
  const lower = (categoryName || "").toLowerCase().trim();
  if (lower.includes("accommodat") || lower.includes("hotel") || lower.includes("resort") || lower.includes("villa") || lower.includes("stay")) {
    return "/assets/category_icons/cat_accommodation.png";
  }
  if (lower.includes("food") || lower.includes("dine") || lower.includes("dining") || lower.includes("restaurant") || lower.includes("cafe")) {
    return "/assets/category_icons/cat_food.png";
  }
  if (lower.includes("beauty") || lower.includes("parlour") || lower.includes("saloon") || lower.includes("salon") || lower.includes("hair")) {
    return "/assets/category_icons/cat_beauty_parlour_saloon.png";
  }
  if (lower.includes("boat") || lower.includes("water") || lower.includes("cruise") || lower.includes("kayak")) {
    return "/assets/category_icons/cat_boating_service.png";
  }
  if (lower.includes("car") || lower.includes("wash") || lower.includes("detail")) {
    return "/assets/category_icons/cat_car_wash.png";
  }
  if (lower.includes("two wheeler") || lower.includes("bike") || lower.includes("scooter") || lower.includes("rental")) {
    return "/assets/category_icons/cat_two_wheeler_rental.png";
  }
  if (lower.includes("spa") || lower.includes("massage") || lower.includes("wellness")) {
    return "/assets/category_icons/cat_spa_massage_center.png";
  }
  if (lower.includes("night") || lower.includes("pub") || lower.includes("bar") || lower.includes("club")) {
    return "/assets/category_icons/cat_night_life.png";
  }
  if (lower.includes("real estate") || lower.includes("property") || lower.includes("estate")) {
    return "/assets/category_icons/cat_real_estate.png";
  }
  if (lower.includes("entertainment") || lower.includes("game") || lower.includes("movie") || lower.includes("play")) {
    return "/assets/category_icons/cat_entertainment.png";
  }
  if (lower.includes("mobile") || lower.includes("phone") || lower.includes("repair") || lower.includes("electronics") || lower.includes("tech")) {
    return "/assets/category_icons/cat_mobile_repair.png";
  }
  return null;
};

// Sub-categories mapping matching Mobile App (kDefaultMockCategories)
const SUB_CATEGORIES_MAP: Record<string, string[]> = {
  "accommodation": ["All", "Hotels", "Resorts", "Homestays", "Lodges", "Guest Houses", "Villas"],
  "food": ["All", "Restaurant", "Cafe", "Fast Food", "Sweets & Desserts", "Ice Cream", "Snacks", "Biryani", "Vegetarian", "Non-Vegetarian", "Street food"],
  "two wheeler rental": ["All", "Scooters", "Bikes", "Electric Scooters", "Premium Bikes", "Gear Bikes"],
  "two_wheeler_rental": ["All", "Scooters", "Bikes", "Electric Scooters", "Premium Bikes", "Gear Bikes"],
  "car wash": ["All", "Car Wash", "Bike Wash", "Interior Cleaning", "Exterior Cleaning", "Detailing", "Polishing"],
  "car_wash": ["All", "Car Wash", "Bike Wash", "Interior Cleaning", "Exterior Cleaning", "Detailing", "Polishing"],
  "mobile repair": ["All", "Mobile Repair", "Screen Replacement", "Battery Replacement", "Software Service", "Accessories", "Unlocking"],
  "mobile_repair": ["All", "Mobile Repair", "Screen Replacement", "Battery Replacement", "Software Service", "Accessories", "Unlocking"],
  "real estate": ["All", "Buy Property", "Rent Property", "Sell Property", "Residential", "Commercial", "Plots", "Apartments", "Villas"],
  "real_estate": ["All", "Buy Property", "Rent Property", "Sell Property", "Residential", "Commercial", "Plots", "Apartments", "Villas"],
  "beauty parlour & saloon": ["All", "Haircut", "Hair Styling", "Hair Colour", "Facial", "Makeup", "Bridal Makeup", "Manicure & Pedicure", "Waxing", "Threading"],
  "beauty parlour": ["All", "Haircut", "Hair Styling", "Hair Colour", "Facial", "Makeup", "Bridal Makeup", "Manicure & Pedicure", "Waxing", "Threading"],
  "beauty_parlour_saloon": ["All", "Haircut", "Hair Styling", "Hair Colour", "Facial", "Makeup", "Bridal Makeup", "Manicure & Pedicure", "Waxing", "Threading"],
  "beauty": ["All", "Haircut", "Hair Styling", "Hair Colour", "Facial", "Makeup", "Bridal Makeup", "Manicure & Pedicure", "Waxing", "Threading"],
  "spa massage center": ["All", "Full Body Massage", "Head Massage", "Foot Massage", "Couple Massage", "Ayurvedic Massage", "Spa Treatments", "Body Scrub"],
  "spa_massage_center": ["All", "Full Body Massage", "Head Massage", "Foot Massage", "Couple Massage", "Ayurvedic Massage", "Spa Treatments", "Body Scrub"],
  "night life": ["All", "Pubs", "Bars", "Restro Bars", "Lounges", "Clubs", "Live Music", "DJ", "Karaoke"],
  "night_life": ["All", "Pubs", "Bars", "Restro Bars", "Lounges", "Clubs", "Live Music", "DJ", "Karaoke"],
  "entertainment": ["All", "Theme Park", "Theatre", "Gaming", "Bowling", "Arcade", "Kids Play", "Events", "Amusement", "Sports & Activities"],
  "boating service": ["All", "Boat Ride", "Speed Boat", "Pedal Boat", "Kayaking", "Canoeing", "Fishing Boat", "Cruise", "Sunset Boat Ride"],
  "boating_service": ["All", "Boat Ride", "Speed Boat", "Pedal Boat", "Kayaking", "Canoeing", "Fishing Boat", "Cruise", "Sunset Boat Ride"],
};

// Default curated vouchers
const DEFAULT_VOUCHERS = [
  {
    id: "vouch-1",
    storeName: "Villa Shanti French Cafe",
    discountText: "Flat ₹250 OFF",
    conditionText: "On dining bills above ₹1,000",
    promoCode: "SHANTI250",
    gradient: "bg-gradient-to-r from-red-600 via-rose-600 to-red-700"
  },
  {
    id: "vouch-2",
    storeName: "Aura Luxury Spa & Salon",
    discountText: "Flat 40% OFF",
    conditionText: "On full body wellness packages",
    promoCode: "AURA40",
    gradient: "bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-900"
  },
  {
    id: "vouch-3",
    storeName: "Chunnambar Speed Boating",
    discountText: "Flat ₹150 OFF",
    conditionText: "Valid on all Paradise Beach boat passes",
    promoCode: "BOAT150",
    gradient: "bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700"
  },
  {
    id: "vouch-4",
    storeName: "Royal Enfield Pondy Riders",
    discountText: "Flat ₹300 OFF",
    conditionText: "On 3-day weekend bike rentals",
    promoCode: "RIDER300",
    gradient: "bg-gradient-to-r from-amber-600 via-orange-600 to-red-600"
  }
];

export default function AppHome() {
  const { 
    activeTab, 
    setTab, 
    selectedCategory,
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery, 
    openShopDetails,
    openOfferDetails,
    likedOffers,
    toggleOfferLike,
    cartConflictOffer,
    resolveCartConflict,
    location,
    isLocationModalOpen,
    isLocationPrompt,
    closeLocationModal,
    setLocation
  } = useApp();

  const [categories, setCategories] = useState<Category[]>(OFFICIAL_CATEGORIES);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [banners, setBanners] = useState<AppBanner[]>([]);
  const [promoBanners, setPromoBanners] = useState<PromoBanner[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [activeSubCategory, setActiveSubCategory] = useState<string>("All");
  const [referralCopied, setReferralCopied] = useState(false);
  const [promoCarouselIndex, setPromoCarouselIndex] = useState(0);

  // Fetch initial data from Cloud Firestore
  useEffect(() => {
    getCategoriesFromFirebase().then(setCategories);
    getBusinessesFromFirebase().then(setBusinesses);
    getOffers().then(setOffers);
    getBannersFromFirebase().then(setBanners);
    getPromoBannersFromFirebase().then(setPromoBanners);
    getHotspotsFromFirebase().then(setHotspots);
  }, []);

  // Reset subcategory when selectedCategory changes
  useEffect(() => {
    setActiveSubCategory("All");
  }, [selectedCategory]);

  // Auto-scroll promo banner carousel
  useEffect(() => {
    if (promoBanners.length <= 1) return;
    const timer = setInterval(() => {
      setPromoCarouselIndex((prev) => (prev + 1) % promoBanners.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [promoBanners.length]);

  const handleCategoryClick = (categoryName: string) => {
    setSelectedCategory(categoryName);
  };

  const handleCopyReferral = () => {
    navigator.clipboard.writeText("OUIYA-PONDY50");
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 2000);
  };

  // Algorithm logic: filter recommended offers based on user likes
  const likedCategories = useMemo(() => {
    const cats = new Set<string>();
    offers.forEach(o => {
      if (likedOffers[o.id] && o.category) {
        cats.add(o.category.toLowerCase());
      }
    });
    return Array.from(cats);
  }, [likedOffers, offers]);

  const recommendedOffers = useMemo(() => {
    if (likedCategories.length > 0) {
      const matched = offers.filter(o => o.category && likedCategories.includes(o.category.toLowerCase()));
      if (matched.length >= 2) return matched;
    }
    return offers;
  }, [likedCategories, offers]);

  const popularBusinesses = useMemo(() => {
    return businesses.slice(0, 8);
  }, [businesses]);

  const trendingNowOffers = useMemo(() => {
    return offers.slice(0, 6);
  }, [offers]);

  // Subcategories loaded dynamically
  const subCategoriesList = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") return [];
    const norm = normalizeCategory(selectedCategory);
    const catKey = norm.toLowerCase().trim();
    
    const activeCatDoc = categories.find(c => {
      const name = (c.name || "").toLowerCase().trim();
      const id = (c.id || "").toLowerCase().trim();
      return name === catKey || id === catKey || catKey.includes(name) || name.includes(catKey);
    });

    if (activeCatDoc && activeCatDoc.subcategories && activeCatDoc.subcategories.length > 0) {
      return ["All", ...activeCatDoc.subcategories];
    }

    return SUB_CATEGORIES_MAP[norm.toLowerCase()] || SUB_CATEGORIES_MAP[catKey] || ["All", "Top Rated", "Best Discounts", "New Arrivals"];
  }, [selectedCategory, categories]);

  // Filtered category offers for real-time category switching
  const filteredCategoryOffers = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") return offers;
    const catTargetNorm = normalizeCategory(selectedCategory).toLowerCase().replace(/[^a-z0-9]/g, "");

    return offers.filter((o) => {
      const oCatNorm = normalizeCategory(o.category).toLowerCase().replace(/[^a-z0-9]/g, "");
      const oRawNorm = (o.category || "").toLowerCase().replace(/[^a-z0-9]/g, "");
      const oTitle = (o.title || "").toLowerCase();
      const oBiz = (o.businessName || "").toLowerCase();
      const oSub = (o.subTitle || "").toLowerCase();

      return (
        oCatNorm === catTargetNorm ||
        oRawNorm === catTargetNorm ||
        oCatNorm.includes(catTargetNorm) ||
        catTargetNorm.includes(oCatNorm) ||
        oTitle.includes(selectedCategory.toLowerCase()) ||
        oBiz.includes(selectedCategory.toLowerCase()) ||
        oSub.includes(selectedCategory.toLowerCase())
      );
    });
  }, [offers, selectedCategory]);

  const subFilteredOffers = useMemo(() => {
    if (activeSubCategory === "All") return filteredCategoryOffers;
    return filteredCategoryOffers.filter((o) => matchesSubCategory(o, activeSubCategory));
  }, [filteredCategoryOffers, activeSubCategory]);

  // Live intelligent search matching ported from mobile SearchMatcher
  const isSearching = searchQuery.trim().length > 0;
  const searchResultsOffers = useMemo(() => {
    if (!isSearching) return [];
    return searchOffers(offers, searchQuery);
  }, [offers, searchQuery, isSearching]);

  const searchResultsBusinesses = useMemo(() => {
    if (!isSearching) return [];
    return searchBusinesses(businesses, searchQuery);
  }, [businesses, searchQuery, isSearching]);

  // Render home page feed
  const renderHomeFeed = () => {
    const isAll = !selectedCategory || selectedCategory === "All";

    return (
      <div className="w-full pb-24 animate-fade-in select-none bg-[#F7F7F7] dark:bg-[#18181B]">
        
        {/* ── 1. FLIPKART-STYLE CATEGORIES STRIP (Just like the Mobile App) ── */}
        <div id="categories" className="scroll-mt-24" />
        <section id="categories-section" className="bg-white/95 dark:bg-[#1E1E1E]/95 backdrop-blur-md border-b border-zinc-200/80 dark:border-[#27272A] py-3 sm:py-4 px-2 sm:px-6 shadow-xs sticky top-16 md:top-20 z-30 transition-all">
          <div className="max-w-[1600px] mx-auto">
            <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth px-1">
              
              {/* "All / For You" Item */}
              <button
                onClick={() => handleCategoryClick("All")}
                className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none shrink-0 w-[68px] sm:w-[84px]"
              >
                <div className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  isAll
                    ? "bg-gradient-to-br from-[#FA0303] to-[#970202] text-white shadow-lg shadow-red-500/25 scale-105 ring-2 ring-[#DC0101] ring-offset-2 dark:ring-offset-[#1E1E1E]"
                    : "bg-zinc-100 dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46] text-zinc-700 dark:text-zinc-300 group-hover:bg-red-50 dark:group-hover:bg-red-950/20 group-hover:text-[#DC0101] group-hover:scale-102"
                }`}>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <span className={`text-[11px] sm:text-xs text-center leading-tight transition-colors ${
                  isAll
                    ? "font-extrabold text-[#DC0101] dark:text-[#FA0303]"
                    : "font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-[#DC0101]"
                }`}>
                  All Deals
                </span>
              </button>

              {/* Dynamic Categories with real PNG icons from mobile assets */}
              {categories.map((cat) => {
                const isSelected = !isAll && selectedCategory.toLowerCase() === cat.name.toLowerCase();
                const iconPath = resolveCategoryIcon(cat.name);

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.name)}
                    className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none shrink-0 w-[68px] sm:w-[84px]"
                  >
                    <div className={`w-13 h-13 sm:w-15 sm:h-15 rounded-2xl flex items-center justify-center p-2.5 transition-all duration-300 ${
                      isSelected
                        ? "bg-gradient-to-br from-[#FA0303] to-[#970202] text-white shadow-lg shadow-red-500/25 scale-105 ring-2 ring-[#DC0101] ring-offset-2 dark:ring-offset-[#1E1E1E]"
                        : "bg-zinc-100 dark:bg-[#27272A] border border-zinc-200 dark:border-[#3F3F46] group-hover:bg-red-50 dark:group-hover:bg-red-950/20 group-hover:scale-102 group-hover:shadow-xs"
                    }`}>
                      {iconPath ? (
                        <img 
                          src={iconPath} 
                          alt={cat.name} 
                          className="w-full h-full object-contain filter drop-shadow-xs" 
                        />
                      ) : (
                        <Tag className={`w-5 h-5 ${isSelected ? "text-white" : "text-zinc-600 dark:text-zinc-300"}`} />
                      )}
                    </div>
                    <span className={`text-[10px] sm:text-[11px] text-center leading-tight line-clamp-2 w-full px-0.5 transition-colors ${
                      isSelected
                        ? "font-extrabold text-[#DC0101] dark:text-[#FA0303]"
                        : "font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-[#DC0101]"
                    }`}>
                      {cat.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── Main Content Container ── */}
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 pt-4 space-y-7">
          
          {/* ── Live Search Results View (Ported from mobile SearchMatcher) ── */}
          {isSearching ? (
            <section className="space-y-6 pt-2 animate-fade-in">
              {/* Search Header Banner */}
              <div className="bg-white dark:bg-[#1E1E1E] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-red-500/10 text-[#DC0101] dark:text-red-400 border border-red-500/20 text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Live Search Results</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                    Results for &ldquo;<span className="text-[#DC0101]">{searchQuery}</span>&rdquo;
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                    Found {searchResultsOffers.length} {searchResultsOffers.length === 1 ? "deal" : "deals"}
                    {searchResultsBusinesses.length > 0 ? ` and ${searchResultsBusinesses.length} ${searchResultsBusinesses.length === 1 ? "partner store" : "partner stores"}` : ""}
                  </p>
                </div>

                <button
                  onClick={() => setSearchQuery("")}
                  className="self-start sm:self-auto bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>✕ Clear Search</span>
                </button>
              </div>

              {/* Matching Stores Row */}
              {searchResultsBusinesses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Store className="w-4 h-4 text-[#DC0101]" />
                    <span>Matching Stores ({searchResultsBusinesses.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {searchResultsBusinesses.slice(0, 4).map((shop) => (
                      <StoreCard
                        key={shop.id}
                        business={shop}
                        onOpenShop={(id) => openShopDetails(id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Matching Offers Grid */}
              {searchResultsOffers.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-sm font-black text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#DC0101]" />
                    <span>Matching Deals & Offers ({searchResultsOffers.length})</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                    {searchResultsOffers.map((offer) => (
                      <OfferCard
                        key={offer.id}
                        offer={offer}
                        onViewOffer={(o) => openOfferDetails(o)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#1E1E1E] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-10 sm:p-14 text-center space-y-4 shadow-sm">
                  <div className="w-16 h-16 rounded-full bg-red-500/10 text-[#DC0101] flex items-center justify-center mx-auto">
                    <Tag className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-zinc-900 dark:text-white">
                      No deals found matching &ldquo;{searchQuery}&rdquo;
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
                      Try searching with broader terms like Salon, Spa, Food, or tap one of the suggested keywords below.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    {["Salon", "Spa", "Pizza", "Biryani", "Burgers", "Hotel", "Fitness", "Fashion"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="bg-zinc-100 hover:bg-red-50 dark:bg-zinc-800 dark:hover:bg-red-950/20 text-zinc-700 dark:text-zinc-300 hover:text-[#DC0101] text-xs font-bold px-3.5 py-1.5 rounded-full transition-all cursor-pointer border border-zinc-200 dark:border-zinc-700"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : (
            <>
              {/* ── 2. Hero Mega Deals Banner Carousel ── */}
              <CategoryBannerCarousel
                categoryId={selectedCategory}
                categoryName={selectedCategory}
              />

          {/* ── 3. Subcategories Filter Row (When specific category selected) ── */}
          {!isAll && subCategoriesList.length > 0 && (
            <section className="bg-white dark:bg-[#1E1E1E] border border-zinc-200 dark:border-[#27272A] rounded-2xl p-3 shadow-xs">
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                {subCategoriesList.map((subName) => {
                  const isSelected = activeSubCategory === subName;
                  return (
                    <button
                      key={subName}
                      onClick={() => setActiveSubCategory(subName)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-[#DC0101] text-white shadow-md scale-102"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      <span>{subName}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* ── 4. SECTION 1: RECOMMENDED FOR YOU (Matching _RecommendedSection) ── */}
          <section id="offers-feed-section" className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2.5">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                  <Sparkles className="w-5 h-5 text-[#DC0101]" />
                  <span>{isAll ? "Recommended For You" : `${selectedCategory} Deals`}</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  {isAll ? "Tailored offers & exclusive discounts based on your preferences" : `Explore verified offers in ${selectedCategory}`}
                </p>
              </div>

              <button
                onClick={() => setTab("categories")}
                className="text-xs font-black text-[#DC0101] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>See All</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {(isAll ? recommendedOffers : subFilteredOffers).length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {(isAll ? recommendedOffers : subFilteredOffers).slice(0, 10).map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    onViewOffer={(o) => openOfferDetails(o)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-[#1E1E1E] border border-zinc-200 dark:border-[#27272A] rounded-3xl p-10 text-center space-y-3">
                <p className="text-sm font-bold text-zinc-500">
                  No offers available in this subcategory.
                </p>
                <button
                  onClick={() => setActiveSubCategory("All")}
                  className="bg-[#DC0101] text-white text-xs font-bold px-4 py-2 rounded-xl"
                >
                  View All {selectedCategory} Offers
                </button>
              </div>
            )}
          </section>

          {/* ── 5. SECTION 2: POPULAR NEAR YOU (Matching _PopularNearYouSection / _StoreCard) ── */}
          {isAll && popularBusinesses.length > 0 && (
            <div id="businesses" className="scroll-mt-24">
              <section id="popular-stores-section" className="space-y-4 pt-2">
              <div className="flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2.5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Store className="w-5 h-5 text-[#DC0101]" />
                    <span>Popular Near You</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Top-rated partner stores, restaurants & luxury salons in Pondicherry
                  </p>
                </div>

                <button
                  onClick={() => setTab("categories")}
                  className="text-xs font-black text-[#DC0101] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>View All Stores</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {popularBusinesses.map((biz) => (
                  <StoreCard
                    key={biz.id}
                    business={biz}
                    onOpenShop={(id) => openShopDetails(id)}
                  />
                ))}
              </div>
            </section>
          </div>
        )}

          {/* ── 6. SECTION 3: SAVE MORE WITH COUPONS! (Matching _CouponSavingsBanner) ── */}
          {isAll && (
            <section className="rounded-3xl p-5 sm:p-7 bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-lg relative overflow-hidden">
              <div className="relative z-10 max-w-2xl space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full backdrop-blur-xs">
                  Exclusive Savings
                </span>
                <h3 className="text-xl sm:text-3xl font-black tracking-tight">
                  Save More with Verified Coupons!
                </h3>
                <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed">
                  Claim discount coupons & exclusive gift vouchers for your favourite French bistros, beachside resorts, and wellness spas.
                </p>
                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={() => setTab("categories")}
                    className="bg-white text-zinc-900 hover:bg-white/90 font-black text-xs px-5 py-2.5 rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
                  >
                    Browse All Vouchers
                  </button>
                  <span className="text-xs font-bold text-white/80">
                    Instant 1-Click Code Copy
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* ── 7. SECTION 4: INVITE & EARN + TOP LOCAL BRANDS ROW ── */}
          {isAll && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
              
              {/* Invite & Earn Card */}
              <div className="lg:col-span-5 bg-white dark:bg-[#1E1E1E] border border-zinc-200 dark:border-[#27272A] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                    <Gift className="w-6 h-6" />
                  </div>
                  <h4 className="text-lg font-black text-zinc-900 dark:text-white">
                    Invite Friends & Earn ₹50
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                    Share your referral code with friends. When they claim their first deal in Pondicherry, both of you get ₹50 coupon credits!
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <div className="flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-2xl px-4 py-2.5 font-mono font-black text-xs text-zinc-900 dark:text-white border border-dashed border-zinc-300 dark:border-zinc-700 text-center tracking-wider">
                    OUIYA-PONDY50
                  </div>
                  <button
                    onClick={handleCopyReferral}
                    className="bg-[#DC0101] text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-sm hover:bg-[#B91C1C] transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    {referralCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{referralCopied ? "Copied" : "Copy"}</span>
                  </button>
                </div>
              </div>

              {/* Top Verified Brands / Categories */}
              <div className="lg:col-span-7 bg-white dark:bg-[#1E1E1E] border border-zinc-200 dark:border-[#27272A] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-base font-black text-zinc-900 dark:text-white">
                    Top Local Categories in Pondicherry
                  </h4>
                  <span className="text-[11px] font-bold text-zinc-400">
                    Verified Deals
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { name: "French Cafes", count: "18+ Deals", tag: "Food" },
                    { name: "Heritage Villas", count: "12+ Stays", tag: "Accommodation" },
                    { name: "Aroma Massages", count: "15+ Packages", tag: "Spa Massage Center" },
                    { name: "Royal Enfield", count: "9+ Rentals", tag: "Two Wheeler Rental" },
                    { name: "Mangrove Cruises", count: "8+ Boats", tag: "Boating Service" },
                    { name: "Craft Breweries", count: "14+ Passes", tag: "Night Life" },
                  ].map((brand) => (
                    <div
                      key={brand.name}
                      onClick={() => {
                        setSelectedCategory(brand.tag);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-150 dark:border-zinc-800 hover:border-[#DC0101] transition-all cursor-pointer group"
                    >
                      <span className="text-[10px] font-extrabold uppercase text-[#DC0101] dark:text-red-400 block truncate">
                        {brand.tag}
                      </span>
                      <p className="text-xs font-black text-zinc-900 dark:text-white mt-1 group-hover:text-[#DC0101] transition-colors truncate">
                        {brand.name}
                      </p>
                      <span className="text-[10px] text-zinc-400 font-bold block mt-0.5">
                        {brand.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </section>
          )}

          {/* ── 8. SECTION 5: TRENDING VOUCHERS (Matching _TrendingVouchersSection / _VoucherCard) ── */}
          {isAll && (
            <section className="space-y-4 pt-2">
              <div className="flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2.5">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2 tracking-tight">
                    <Ticket className="w-5 h-5 text-indigo-500" />
                    <span>Trending Vouchers</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    1-Click copy coupon codes for immediate discount redemption at stores
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {DEFAULT_VOUCHERS.map((vouch) => (
                  <VoucherCard
                    key={vouch.id}
                    storeName={vouch.storeName}
                    discountText={vouch.discountText}
                    conditionText={vouch.conditionText}
                    promoCode={vouch.promoCode}
                    gradient={vouch.gradient}
                  />
                ))}
              </div>
            </section>
          )}

          {/* ── 9. SECTION 6: DISCOVER PONDICHERRY HIGHLIGHTS ── */}
          {isAll && (
            <section className="rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-black text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 max-w-xl">
                  <div className="flex items-center gap-2 text-amber-400">
                    <Compass className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-wider">
                      Tourist Hotspots & City Guide
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
                    Experience The Magic of Pondicherry
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-300 font-medium leading-relaxed">
                    From scenic sunrise walks along Promenade Beach to French colonial villas, mangrove boating, and Auroville spiritual retreats.
                  </p>
                </div>

                <button
                  onClick={() => setTab("discover")}
                  className="bg-[#DC0101] hover:bg-[#B91C1C] text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-red-600/30 transition-all active:scale-95 cursor-pointer flex items-center gap-2 shrink-0 self-start md:self-center"
                >
                  <span>Explore Discover Pondicherry</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}

          {/* ── 10. SECTION 7: TRUST & ASSURANCE STRIP ── */}
          {isAll && (
            <section className="bg-white dark:bg-[#1E1E1E] border border-zinc-200/80 dark:border-[#27272A] rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#DC0101] flex items-center justify-center mx-auto shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">100% Verified Deals</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Hand-curated & directly verified with venues</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Instant Redemption</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Show digital voucher code on your phone</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto shadow-2xs">
                    <Tag className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Exclusive Savings</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Guaranteed discounts in Pondicherry</p>
                </div>
                <div className="space-y-1.5">
                  <div className="w-10 h-10 rounded-2xl bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center mx-auto shadow-2xs">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">Hyper-Local Guide</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">White Town, beach stays & water sports</p>
                </div>
              </div>
            </section>
          )}

            </>
          )}

        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F7F7] dark:bg-[#18181B] text-zinc-900 dark:text-zinc-100 transition-colors duration-300 font-sans">
      <Navbar />

      {/* Conditionally Render Custom Page view based on AppContext Tab state */}
      <main className="flex-grow">
        {activeTab === "home" && renderHomeFeed()}
        {activeTab === "categories" && (
          <div className="pb-28">
            <CategoryBrowseView />
          </div>
        )}
        {activeTab === "discover" && <DiscoverPondicherryView />}
        {activeTab === "cart" && (
          <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-28">
            <CartModal />
          </div>
        )}
      </main>

      <Footer />

      {/* Global Overlays/Modals */}
      <ShopDetailModal />
      <OfferDetailModal />
      <CouponSuccessModal />
      <SideDrawer />
      <AuthModal />
      <DestinationDetailModal />
      <LocationModal 
        isOpen={isLocationModalOpen}
        onClose={closeLocationModal}
        selectedLocation={location}
        isPromptMode={isLocationPrompt}
        onSelectLocation={(loc, coords) => {
          setLocation(loc, coords);
        }}
      />

      {/* Cart Conflict Warning Modal */}
      {cartConflictOffer && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 max-w-md w-full shadow-2xl relative animate-scale-up text-center space-y-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-[#DC0101] bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-900/50">
                Single Store Purchase Only
              </span>
              <h3 className="text-base font-black text-zinc-900 dark:text-white pt-1">
                Different Business Selected
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                Your cart contains offers from another store. Each purchase generates a single QR code for one business.
              </p>
              <div className="bg-zinc-50 dark:bg-[#18181B] p-3 rounded-2xl border border-zinc-200 dark:border-[#27272A] text-left text-xs space-y-1">
                <p className="text-[11px] text-zinc-500 font-bold">Offer you are trying to add:</p>
                <p className="font-black text-zinc-900 dark:text-white">{cartConflictOffer.title}</p>
                <p className="text-[#DC0101] font-bold text-[11px]">{cartConflictOffer.businessName}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => resolveCartConflict(false)}
                className="bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold py-3 rounded-2xl text-xs transition-colors cursor-pointer"
              >
                Keep Current Cart
              </button>
              <button
                onClick={() => resolveCartConflict(true)}
                className="bg-[#DC0101] hover:bg-[#B91C1C] text-white font-bold py-3 rounded-2xl text-xs shadow-lg shadow-red-600/20 transition-transform active:scale-95 cursor-pointer"
              >
                Clear & Add New Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation (Mobile App Shell) */}
      <BottomNav />
    </div>
  );
}

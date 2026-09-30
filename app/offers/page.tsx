"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useApp } from "../../lib/AppContext";
import { 
  getOffers, 
  getBusinessesFromFirebase, 
  getCategoriesFromFirebase, 
  OFFICIAL_CATEGORIES, 
  Offer, 
  Business, 
  Category, 
  matchesSubCategory 
} from "../../lib/db";
import CategoryBannerCarousel from "../../components/CategoryBannerCarousel";
import OfferCard from "../../components/OfferCard";
import { 
  ArrowLeft, Search, Star, Heart, MapPin, 
  Sparkles, Flame, Percent, ChevronRight, Filter, Tag, ArrowUpRight
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

// Sub-categories mapping matching the 11 Mobile App Categories (kDefaultMockCategories)
const SUB_CATEGORIES: Record<string, string[]> = {
  "Accommodation": ["All", "Hotels", "Resorts", "Homestays", "Lodges", "Guest Houses", "Villas"],
  "Food": ["All", "Restaurant", "Cafe", "Fast Food", "Sweets & Desserts", "Ice Cream", "Snacks", "Biryani", "Vegetarian", "Non-Vegetarian", "Street food"],
  "Two Wheeler Rental": ["All", "Scooters", "Bikes", "Electric Scooters", "Premium Bikes", "Gear Bikes"],
  "Car Wash": ["All", "Car Wash", "Bike Wash", "Interior Cleaning", "Exterior Cleaning", "Detailing", "Polishing"],
  "Mobile Repair": ["All", "Mobile Repair", "Screen Replacement", "Battery Replacement", "Software Service", "Accessories", "Unlocking"],
  "Real Estate": ["All", "Buy Property", "Rent Property", "Sell Property", "Residential", "Commercial", "Plots", "Apartments", "Villas"],
  "Beauty Parlour & Saloon": ["All", "Haircut", "Hair Styling", "Hair Colour", "Facial", "Makeup", "Bridal Makeup", "Manicure & Pedicure", "Waxing", "Threading"],
  "Spa Massage Center": ["All", "Full Body Massage", "Head Massage", "Foot Massage", "Couple Massage", "Ayurvedic Massage", "Spa Treatments", "Body Scrub"],
  "Night Life": ["All", "Pubs", "Bars", "Restro Bars", "Lounges", "Clubs", "Live Music", "DJ", "Karaoke"],
  "Entertainment": ["All", "Theme Park", "Theatre", "Gaming", "Bowling", "Arcade", "Kids Play", "Events", "Amusement", "Sports & Activities"],
  "Boating Service": ["All", "Boat Ride", "Speed Boat", "Pedal Boat", "Kayaking", "Canoeing", "Fishing Boat", "Cruise", "Sunset Boat Ride"]
};

// Category Banners mapping for the 11 Official Mobile App Categories
const CATEGORY_BANNERS: Record<string, { title: string; subtitle: string; discount: string; bg: string }> = {
  "Accommodation": { 
    title: "Luxury Stays & Heritage Resorts", 
    subtitle: "Beachfront villas, French quarter boutiques & seaside hotels", 
    discount: "Up to 45% OFF", 
    bg: "from-sky-800 via-blue-900 to-indigo-950" 
  },
  "Food": { 
    title: "Pondicherry Foodie Special", 
    subtitle: "French cafes, authentic wood-fired pizzas & fresh seafood", 
    discount: "Flat 30% OFF", 
    bg: "from-orange-700 via-red-800 to-amber-900" 
  },
  "Two Wheeler Rental": { 
    title: "Explore Pondy on Wheels", 
    subtitle: "Scooters, Royal Enfields & electric bikes at daily discounts", 
    discount: "From ₹299/day", 
    bg: "from-amber-700 via-orange-800 to-zinc-950" 
  },
  "Car Wash": { 
    title: "Premium Vehicle Care", 
    subtitle: "Foam wash, deep interior detailing & ceramic coating deals", 
    discount: "Up to 40% OFF", 
    bg: "from-cyan-800 via-blue-900 to-zinc-950" 
  },
  "Mobile Repair": { 
    title: "Expert Tech & Phone Fixes", 
    subtitle: "Same-day screen replacements, battery repairs & accessories", 
    discount: "Up to 50% OFF", 
    bg: "from-violet-800 via-purple-900 to-zinc-950" 
  },
  "Real Estate": { 
    title: "Prime Properties & Beachfront Lands", 
    subtitle: "Top residential plots, commercial spaces & heritage villas", 
    discount: "Verified Listings", 
    bg: "from-emerald-800 via-teal-900 to-zinc-950" 
  },
  "Beauty Parlour & Saloon": { 
    title: "Glow Up & Styling", 
    subtitle: "Bridal makeup, hair styling, facials & grooming packages", 
    discount: "Up to 50% OFF", 
    bg: "from-pink-700 via-rose-800 to-purple-900" 
  },
  "Spa Massage Center": { 
    title: "Ultimate Relaxation & Wellness", 
    subtitle: "Ayurvedic therapy, Swedish massage & luxury couple spas", 
    discount: "Up to 55% OFF", 
    bg: "from-rose-800 via-red-900 to-zinc-950" 
  },
  "Night Life": { 
    title: "Vibrant Pondicherry Evenings", 
    subtitle: "Restro-bars, craft beer lounges & weekend beach parties", 
    discount: "Happy Hours Deals", 
    bg: "from-purple-900 via-indigo-950 to-zinc-950" 
  },
  "Entertainment": { 
    title: "Fun, Gaming & Activities", 
    subtitle: "Bowling alleys, VR gaming zones, theme parks & cinema", 
    discount: "Up to 35% OFF", 
    bg: "from-fuchsia-800 via-pink-900 to-zinc-950" 
  },
  "Boating Service": { 
    title: "Chunnambar & Mangrove Cruises", 
    subtitle: "Speed boats, sunset rides & serene backwater kayaking", 
    discount: "Flat 25% OFF", 
    bg: "from-teal-700 via-cyan-800 to-blue-950" 
  }
};

export default function CategoryBrowseView() {
  const { 
    selectedCategory, 
    setSelectedCategory, 
    setTab, 
    searchQuery, 
    setSearchQuery,
    openOfferDetails
  } = useApp();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>(OFFICIAL_CATEGORIES);
  const [activeSubCategory, setActiveSubCategory] = useState<string>("All");

  useEffect(() => {
    getCategoriesFromFirebase().then((cats) => {
      if (cats && cats.length > 0) {
        setCategoriesList(cats);
      }
    });
  }, []);

  useEffect(() => {
    setActiveSubCategory("All");
  }, [selectedCategory]);

  useEffect(() => {
    const fetchData = async () => {
      const activeOffers = await getOffers({
        category: selectedCategory,
        query: searchQuery
      });
      setOffers(activeOffers);
    };
    fetchData();
  }, [selectedCategory, searchQuery]);

  const handleBack = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setTab("home");
  };

  const subCategoriesList = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All") return ["All", "Top Rated", "New Arrivals", "Best Discount"];
    const catKey = selectedCategory.toLowerCase().trim();
    
    const activeCatDoc = categoriesList.find(c => {
      const name = (c.name || "").toLowerCase().trim();
      const id = (c.id || "").toLowerCase().trim();
      return name === catKey || id === catKey || catKey.includes(name) || name.includes(catKey);
    });

    if (activeCatDoc && activeCatDoc.subcategories && activeCatDoc.subcategories.length > 0) {
      return ["All", ...activeCatDoc.subcategories];
    }

    return SUB_CATEGORIES[selectedCategory] || ["All", "Top Rated", "New Arrivals", "Best Discount"];
  }, [selectedCategory, categoriesList]);

  // Filtered offers by sub-category tab
  const filteredOffers = useMemo(() => {
    if (activeSubCategory === "All") return offers;
    return offers.filter((o) => matchesSubCategory(o, activeSubCategory));
  }, [offers, activeSubCategory]);

  return (
    <div className="w-full pb-24 animate-fade-in select-none bg-zinc-50 dark:bg-[#0b0f19]">
      
      {/* 1. Header Navigation */}
      <div className="sticky top-16 z-30 bg-white dark:bg-[#121620] border-b border-zinc-200/80 dark:border-zinc-800 px-3 sm:px-8 py-3.5 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <button 
              onClick={handleBack} 
              className="hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-750 p-2 rounded-xl transition-colors cursor-pointer"
              title="Back to Home"
            >
              <ArrowLeft className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight text-zinc-900 dark:text-white leading-tight">
                {searchQuery ? `Search: "${searchQuery}"` : (selectedCategory === "All" ? "All Categories" : selectedCategory)}
              </h2>
              <span className="text-[10.5px] text-zinc-500 font-semibold">
                {filteredOffers.length} Verified Deals in Pondicherry
              </span>
            </div>
          </div>

          <button
            onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
              selectedCategory === "All"
                ? "bg-[#DC0101] text-white shadow-sm"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Reset All
          </button>
        </div>

        {/* 11 Official Category Quick Selector Chips (Horizontal Scroll) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === "All" 
                ? "bg-[#DC0101] text-white shadow-sm scale-102" 
                : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>All Deals</span>
          </button>
          {categoriesList.map((cat) => {
            const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
            const iconPath = resolveCategoryIcon(cat.name);

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                  isSelected 
                    ? "bg-[#DC0101] text-white shadow-sm scale-102" 
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                {iconPath && (
                  <img src={iconPath} alt="" className="w-3.5 h-3.5 object-contain" />
                )}
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 mt-5 space-y-6">

        {/* 2. Sub-Category Scrollable Pills Row */}
        <div className="bg-white dark:bg-[#121620] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-black uppercase text-zinc-400 shrink-0 px-1 flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#DC0101]" />
            <span>Filter:</span>
          </span>
          {subCategoriesList.map((subCat) => (
            <button
              key={subCat}
              onClick={() => setActiveSubCategory(subCat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                activeSubCategory === subCat
                  ? "bg-[#DC0101] text-white shadow-xs scale-102"
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              }`}
            >
              {subCat}
            </button>
          ))}
        </div>

        {/* 3. Category Promotional Hero Banner Slideshow (Category Banners Carousel) */}
        <CategoryBannerCarousel
          categoryId={selectedCategory}
          categoryName={selectedCategory}
        />

        {/* 4. Filtered Deal Offers Grid */}
        <section className="space-y-4 pt-1">
          <div className="flex justify-between items-center border-b border-zinc-200/80 dark:border-zinc-800/80 pb-2.5">
            <h3 className="text-base font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#DC0101]" />
              <span>{selectedCategory === "All" ? "All Verified Deals" : `${selectedCategory} Deals`}</span>
            </h3>
            <span className="text-xs font-bold text-zinc-500">
              {filteredOffers.length} Deals Found
            </span>
          </div>

          {filteredOffers.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
              {filteredOffers.map((offer) => (
                <OfferCard
                  key={offer.id}
                  offer={offer}
                  onViewOffer={(o) => openOfferDetails(o)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-[#121620] border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/40 text-[#DC0101] flex items-center justify-center mx-auto">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="text-base font-black text-zinc-900 dark:text-white">
                No offers found in this subcategory
              </h4>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Try selecting "All" or browse other categories to discover verified discounts in Pondicherry.
              </p>
              <button
                onClick={() => setActiveSubCategory("All")}
                className="bg-[#DC0101] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-[#B91C1C] transition-all cursor-pointer"
              >
                Show All {selectedCategory} Deals
              </button>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

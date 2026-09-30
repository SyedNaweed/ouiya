# Discover Pondicherry Tourism Module & Mobile App Parity Technical Documentation

## Executive Summary
This document covers the comprehensive architectural and feature updates implemented on **ouiya**, bringing full 1:1 visual, functional, and aesthetic parity between the website and the Flutter mobile application, alongside the **Discover Pondicherry** interactive tourism explorer.

---

## 1. Mobile App 1:1 Parity & Feature Synchronization

### A. Authentication Architecture (Strict Mobile Parity)
- **Removal of OAuth**: Following strict mobile app parity, all third-party OAuth providers (Google OAuth) were removed from the customer authentication flow.
- **3-Step Mobile Phone OTP Flow**:
  1. **Phone Number Entry**: 10-digit Indian phone number input (`+91` country code) with invisible Firebase reCAPTCHA verification.
  2. **6-Digit SMS OTP Verification**: Auto-advancing verification code input with resend timer.
  3. **Profile Setup**: Mandatory Full Name input and optional Email Address onboarding (matching `auth_screen.dart`, `phone_otp_screen.dart`, `enter_name_screen.dart`, and `enter_email_screen.dart`).
- **Guest Mode**: Allows users to browse and explore freely without mandatory upfront sign-in, prompting authentication only at high-intent actions (claiming vouchers, cart checkout).

### B. Offer Details Modal Redesign (Exact 1:1 App Visual Parity)
Refactored `components/OfferDetailModal.tsx` to match the Flutter mobile app screens pixel-by-pixel:
1. **Hero Gallery & Header**:
   - Full-width hero image with rounded top corners.
   - Bold red discount pill badge (e.g., `40% OFF`, `38% OFF`) at the top-left.
   - Translucent circular close button (`✕`) at the top-right.
2. **Store & Deal Metadata**:
   - Store name in bold white typography.
   - Emerald green rating badge (`★ 4.8` in `#00A86B`).
   - Red location pin with store address and White Town/Puducherry locality.
   - Prominent deal title typography.
3. **Three-Column Price Comparison Card**:
   - `ORIGINAL PRICE` (struck-through, muted grey, e.g., `₹1499`).
   - `OFFER PRICE` (bold brand red, e.g., `₹899`).
   - `YOU SAVE` (bold green `#00E676`, e.g., `₹600`).
4. **Four Quick Stat Badges**:
   - `Valid Till`, `Min Bill`, `Max Discount`, and `Use While (Dine-in / In-Store)`.
5. **Extra Savings Referral Card**:
   - Dark grey surface (`#1E1E1E`) with subtle border (`#27272A`).
   - Circular container (`#3F3F46`) with red gift card icon.
   - Red bold title **`Extra Savings!`** with subtitle *"Invite your friends & you both get ₹50 Cashback"*.
   - Outlined button with red border and red text **`Invite Now`** supporting Web Share API with clipboard fallback.
6. **"About This Offer" Section**:
   - Section heading: **`About This Offer`**.
   - Full offer description with collapsible **`Read More ⌵`** / **`Read Less ⌃`** toggle button.
7. **"More from [Store Name]" Section**:
   - Header with red tag icon: **`🏷️ More from Bloom & Glow Unisex Salon`** with right-hand **`View Store (5) >`** pill.
   - List of other offers from this store (e.g., *Brightening Herbal Facial*, *Men's Executive Haircut*, *Premium Pedicure*, *Flat 20% OFF Voucher*):
     - 76×76 thumbnail with red discount badge at bottom.
     - Deal title and category subtitle (*"On beauty parlour saloon"*).
     - Price comparison (crossed-out original price vs red discounted price).
     - White circular button with red chevron **`>`** that switches to that offer.
8. **Fixed Bottom Action Bar**:
   - **`➤ Directions`**: Outlined button with red border, transparent background, red navigation icon, and red text that opens Google Maps.
   - **`🛒 Add to Cart`**: Solid bold red button (`#DC0101`) that adds the deal to the cart with instant confirmation feedback.
9. **Four Store Navigation Tabs**:
   - Red-bordered navbar at the base containing 4 interactive tabs:
     1. **`🏷️ Offers`**: Active offer details, price comparison, stat badges, and "More from Store" list.
     2. **`🎟️ Vouchers`**: Available store coupons with instant **`Claim`** buttons.
     3. **`🏪 About Store`**: Store photo gallery, address, opening hours (`9:00 AM – 9:00 PM`), and **`Call Store`** (`tel:`).
     4. **`⭐ Reviews`**: Overall rating summary (`4.8 ★★★★★`), verified customer reviews, and a **`Write a Review`** form.
10. **Claimed Voucher Screen**:
    - When claimed, displays a high-resolution QR code, copyable promo code, validity dates, and directions route.

### C. Color System Alignment
Synchronized `app/globals.css` with Flutter app theme tokens (`mobile/lib/shared/themes/app_colors.dart`):
- **Dark Scaffold Background**: `#18181B` (Zinc-900)
- **Card / Surface Background**: `#1E1E1E` (Dark Charcoal)
- **Borders & Dividers**: `#27272A`
- **Brand Primary Red**: `#DC0101` and `#FA0303`
- **Success / Rating Accent**: `#00A86B` / `#10B981`

### D. Official App Logo
- Integrated official launcher icon from `mobile/flutter_launcher_icons.yaml` located at `/assets/icons/Logo.png`.
- Applied across `components/Navbar.tsx` and `components/Footer.tsx` with clean brand typography.

### E. Advanced Multi-Field Search System
- Implemented `lib/searchMatcher.ts` replicating the Flutter mobile app's `search_matcher.dart` algorithm:
  - Token-based fuzzy distance matching.
  - Prefix prioritization for instant typeahead feel.
  - Multi-field scoring across offer title, store name, category, and tags.
- Fully wired into `app/page.tsx` with live results feed, matched deal count, store cards, quick filter tags, and clear search controls.

---

## 2. Discover Pondicherry Tourism Module & OpenStreetMap Explorer

### A. Core Architecture: Separating Information from Commerce
- **Destination Pages (Information Modules)**: Provide rich educational content, history, photos, best visit times, facilities, and live map coordinates.
- **Business Pages (Commerce Modules)**: Handle shopping, offers, reservations, and checkout.
- **Commercial Redirection**: When a tourist selects a bookable activity (e.g. *Chunnambar Ferry*, *Backwater Kayaking*, *Surf Lessons*) or taps a partner shop pin on the live map, the application seamlessly transitions to registered business offers under that category on **ouiya**.

### B. Key Project Files

| File Path | Description |
| :--- | :--- |
| `lib/discoverData.ts` | **Data Layer**: Defines `TouristDestination`, `DestinationActivity`, and `RegisteredShopMapPoint` datasets, GPS coordinates, and registered partner shop map points. |
| `app/discover/page.tsx` | **Main Tourism Hub**: French Riviera hero styling, dynamic 4.5s background slideshow of iconic Pondicherry landmarks, category filters, live search, destination cards, and map modal trigger. |
| `components/DestinationDetailModal.tsx` | **Destination Detail Overlay**: Full-screen modal with cover gallery, quick stats, history, visitor experience, best visit times, facilities badges, Google Maps links, and bookable activities. |
| `components/PondicherryMapModal.tsx` | **Interactive OpenStreetMap Explorer**: Centered on Puducherry (`11.9416, 79.8083`) with gold pin markers for tourist spots and red pin markers for registered partner shops displaying active discounts (*e.g., 20% OFF*). Includes fail-safe OpenStreetMap embed fallback. |
| `components/BottomNav.tsx` | **Mobile Bottom Navigation**: Integrated dedicated **`DISCOVER`** tab with Compass icon into sticky bottom navigation pill (`[HOME]`, `[OFFERS]`, `[DISCOVER]`, `[CART]`). |
| `lib/AppContext.tsx` | **App Context Integration**: Added `"discover"` tab state, modal management, `bookActivityRedirect` helper, and resolved function hoisting order to prevent TDZ execution errors. |
| `components/Navbar.tsx` & `components/SideDrawer.tsx` | **Navigation Bar & Drawer**: Added "Discover Pondicherry" links to desktop navigation and mobile side drawer menu. |
| `app/page.tsx` | **Main Entry Point**: Added prominent `"Discover Pondicherry 📍"` hero quick action pill button, integrated `<DiscoverPondicherryView />`, and embedded `<DestinationDetailModal />` in global overlays. |

### C. Curated Tourism Dataset (`lib/discoverData.ts`)
Curated data for top Puducherry destinations:
1. **Paradise Beach (Chunnambar)**: Backwater ferry, kayaking, scuba diving, and scooter rentals.
2. **Promenade Beach (Rock Beach)**: Heritage walk, French cafe tasting, and bicycle rentals.
3. **Auroville & Matrimandir**: Township guided tours, Solar Kitchen organic dining, sound healing & yoga.
4. **French Quarter (White Town)**: Professional photo shoots and electric Vespa rentals.
5. **Pondicherry Botanical Garden**: Historic toy train passes and exotic plant conservatories.
6. **Serenity Beach & Surf School**: 1-on-1 beginner surfing classes and surfboard rentals.
7. **Sri Aurobindo Ashram**: Spiritual library & meditation hall.
8. **Arikamedu Archaeological Ruins**: Ancient Indo-Roman trading port site.

### D. Interactive OpenStreetMap Explorer (`components/PondicherryMapModal.tsx`)
- **Coordinates & Engine**: Centered on Puducherry (`11.9416° N, 79.8083° E`) with Leaflet tiles and an automatic OpenStreetMap iframe fallback (`https://www.openstreetmap.org/export/embed.html?...`).
- **Interactive Pins**:
  - **Tourist Destinations 📍**: Gold pin markers.
  - **Registered Partner Businesses 🛍️**: Primary red pin markers displaying active discount badges (*e.g. 20% OFF*).
- **Controls & Navigation**:
  - Filter toggle bar (*"All Pins"*, *"Tourist Spots"*, *"Registered Shops"*).
  - Side panel location list with smooth `flyTo` camera transitions.
  - Quick-action popup card with direct redirect buttons (*"Explore Destination"* or *"View Business Offers"*).

### E. Commercial Redirection Architecture
- Clicking **"Book Now"** on any activity or **"View Business Offers"** on a shop pin invokes `bookActivityRedirect(activity)`, which:
  1. Closes the destination modal.
  2. Sets `selectedCategory` in `AppContext` to the relevant category (*e.g. "Dining", "Sports", "Entertainment"*).
  3. Switches `activeTab` to `"categories"`, immediately presenting all matching business offers to the user.

---

## 3. Production Verification & Status
- **Build Verification**: `npm run build` executed and passed cleanly with **0 errors**.
- **Static Page Generation**: All 9 routes prerendered successfully:
  - `/` (Home Feed with live multi-field search and Bloom & Glow showcase)
  - `/discover` (Discover Pondicherry Tourism Hub)
  - `/offers` (Category & Deal Explorer)
  - `/portal` (Partner Merchant Portal)
  - `/portal/new-ad` (Ad Creator)
  - `/portal/payment` (Checkout & Payment Gateway)
  - `/_not-found`

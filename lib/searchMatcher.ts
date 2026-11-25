import { Offer, Business } from "./db";

// Synonym dictionary ported directly from mobile app SearchMatcher (search_matcher.dart)
export const CATEGORY_SYNONYMS: Record<string, string[]> = {
  spa: ["spa", "massage", "salon", "beauty", "wellness", "parlour", "therapy", "ayurveda", "relaxation"],
  salon: ["salon", "haircut", "hair", "parlour", "beauty", "styling", "spa", "facial", "grooming", "tan"],
  beauty: ["beauty", "cosmetics", "makeup", "skincare", "parlour", "salon", "spa", "facial"],
  food: ["food", "dining", "restaurant", "cafe", "bakery", "hotel", "eats", "meal", "lunch", "dinner", "breakfast", "snack", "biryani", "pizza", "burger"],
  pizza: ["pizza", "italian", "crust", "slice", "fast food", "food", "cafe", "cheese"],
  burger: ["burger", "fast food", "food", "cafe", "snacks", "sandwich", "fries"],
  biryani: ["biryani", "rice", "non veg", "chicken", "mutton", "restaurant", "food", "briyani"],
  coffee: ["coffee", "cafe", "tea", "espresso", "cappuccino", "bakery", "beverage", "drinks"],
  fashion: ["fashion", "clothing", "clothes", "apparel", "wear", "dress", "shirt", "saree", "garments", "shoes", "footwear"],
  electronics: ["electronics", "mobile", "gadgets", "phone", "headphones", "earphones", "laptop", "audio", "boat", "tech", "smart"],
  fitness: ["fitness", "gym", "workout", "yoga", "crossfit", "health", "training"],
  entertainment: ["entertainment", "cinema", "movie", "games", "gaming", "arcade", "bowling", "fun", "boating"],
  auto: ["auto", "car", "bike", "motor", "vehicle", "mechanic", "service", "car wash", "repair"],
};

/**
 * Computes a relevance score for an offer based on a user's search query.
 * Matches title, business name, category, subcategory, location, and description.
 */
export function scoreOffer(offer: Offer, rawQuery: string): number {
  const cleanQuery = rawQuery.trim().toLowerCase();
  if (!cleanQuery) return 1.0;

  const tokens = cleanQuery
    .split(/[\s,.\-_/]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 0);

  if (tokens.length === 0) return 1.0;

  const title = (offer.title || "").toLowerCase();
  const shop = (offer.businessName || "").toLowerCase();
  const desc = (offer.description || "").toLowerCase();
  const cat = (offer.category || "").toLowerCase();
  const subcat = (offer.subcategory || "").toLowerCase();
  const code = (offer.code || "").toLowerCase();
  const loc = (offer.location || "").toLowerCase();

  let score = 0.0;
  let matchedTokensCount = 0;

  // Exact phrase match boost
  if (title.includes(cleanQuery)) {
    score += 150.0;
    if (title.startsWith(cleanQuery)) score += 50.0;
  }
  if (shop.includes(cleanQuery)) {
    score += 120.0;
    if (shop.startsWith(cleanQuery)) score += 40.0;
  }
  if (cat.includes(cleanQuery) || subcat.includes(cleanQuery)) {
    score += 90.0;
  }

  for (const token of tokens) {
    let tokenMatched = false;

    // 1. Title matching
    if (title.includes(token)) {
      tokenMatched = true;
      score += 60.0;
      if (title.startsWith(token)) score += 20.0;
      const words = title.split(/\s+/);
      for (const w of words) {
        if (w === token) score += 30.0;
        else if (w.startsWith(token)) score += 15.0;
      }
    }

    // 2. Shop name matching
    if (shop.includes(token)) {
      tokenMatched = true;
      score += 50.0;
      const words = shop.split(/\s+/);
      for (const w of words) {
        if (w === token) score += 25.0;
        else if (w.startsWith(token)) score += 12.0;
      }
    }

    // 3. Category / Subcategory matching
    if (cat.includes(token) || subcat.includes(token)) {
      tokenMatched = true;
      score += 40.0;
      if (cat === token || subcat === token) score += 20.0;
    }

    // 4. Synonym semantic matching
    for (const [key, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
      if (key === token || synonyms.includes(token)) {
        const isCatMatch = cat.includes(key) || synonyms.some((syn) => cat.includes(syn) || subcat.includes(syn));
        const isContentMatch = title.includes(key) || desc.includes(key) || synonyms.some((syn) => title.includes(syn) || desc.includes(syn));
        if (isCatMatch || isContentMatch) {
          tokenMatched = true;
          score += 35.0;
        }
      }
    }

    // 5. Code & Location matching
    if (code.includes(token)) {
      tokenMatched = true;
      score += 30.0;
    }
    if (loc.includes(token)) {
      tokenMatched = true;
      score += 25.0;
    }

    // 6. Description matching
    if (desc.includes(token)) {
      tokenMatched = true;
      score += 15.0;
    }

    if (tokenMatched) {
      matchedTokensCount++;
    }
  }

  if (matchedTokensCount === 0 && score === 0.0) {
    return 0.0;
  }

  // Multi-token match boost
  if (tokens.length > 1 && matchedTokensCount === tokens.length) {
    score *= 1.8;
  }

  return score;
}

/**
 * Filter and sort offers by search relevance score.
 */
export function searchOffers(offers: Offer[], query: string): Offer[] {
  const clean = query.trim();
  if (!clean) return offers;

  const scored: { offer: Offer; score: number }[] = [];

  for (const offer of offers) {
    const score = scoreOffer(offer, clean);
    if (score > 0) {
      scored.push({ offer, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.offer);
}

/**
 * Filter and rank businesses by search relevance.
 */
export function searchBusinesses(businesses: Business[], query: string): Business[] {
  const clean = query.trim().toLowerCase();
  if (!clean) return businesses;

  const tokens = clean.split(/[\s,.\-_/]+/).filter((t) => t.length > 0);

  return businesses.filter((b) => {
    const name = (b.name || "").toLowerCase();
    const cat = (b.category || "").toLowerCase();
    const addr = (b.address || "").toLowerCase();
    const desc = (b.about || b.description || "").toLowerCase();

    // Exact phrase match
    if (name.includes(clean) || cat.includes(clean) || addr.includes(clean)) return true;

    // Token matching
    return tokens.some((t) => 
      name.includes(t) || 
      cat.includes(t) || 
      addr.includes(t) || 
      desc.includes(t) ||
      Object.entries(CATEGORY_SYNONYMS).some(([key, syns]) => 
        (key === t || syns.includes(t)) && (cat.includes(key) || syns.some((s) => cat.includes(s)))
      )
    );
  });
}

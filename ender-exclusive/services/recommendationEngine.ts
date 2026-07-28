import { Product } from "@/types/product";
import {
  RecommendationCategory,
  ScoredRecommendation,
  StylingCategoryGroup,
  StylingResult,
} from "@/types/lookbook";

// Helper to determine the fashion category of a product
export const getProductCategoryType = (
  product: Product
): RecommendationCategory | "tops" | "unknown" => {
  const name = (product.name || "").toLowerCase();
  const cat = (product.category || "").toLowerCase();
  const fullText = `${name} ${cat}`;

  if (
    fullText.includes("short") ||
    fullText.includes("chino") ||
    fullText.includes("pant") ||
    fullText.includes("jean") ||
    fullText.includes("jogger") ||
    fullText.includes("trouser") ||
    fullText.includes("skirt") ||
    fullText.includes("sweatpant")
  ) {
    return "bottoms";
  }

  if (
    fullText.includes("shoe") ||
    fullText.includes("sneaker") ||
    fullText.includes("loafer") ||
    fullText.includes("boot") ||
    fullText.includes("slide") ||
    fullText.includes("sandal") ||
    fullText.includes("footwear")
  ) {
    return "shoes";
  }

  if (
    fullText.includes("cap") ||
    fullText.includes("hat") ||
    fullText.includes("beanie") ||
    fullText.includes("visor")
  ) {
    return "caps";
  }

  if (
    fullText.includes("watch") ||
    fullText.includes("timepiece")
  ) {
    return "watches";
  }

  if (
    fullText.includes("sunglass") ||
    fullText.includes("shades") ||
    fullText.includes("eyewear")
  ) {
    return "sunglasses";
  }

  if (
    fullText.includes("bag") ||
    fullText.includes("backpack") ||
    fullText.includes("duffle") ||
    fullText.includes("tote") ||
    fullText.includes("crossbody")
  ) {
    return "bags";
  }

  if (
    fullText.includes("belt") ||
    fullText.includes("sock") ||
    fullText.includes("scarf") ||
    fullText.includes("glove") ||
    fullText.includes("jewel") ||
    fullText.includes("ring") ||
    fullText.includes("chain")
  ) {
    return "accessories";
  }

  if (
    fullText.includes("shirt") ||
    fullText.includes("polo") ||
    fullText.includes("hoodie") ||
    fullText.includes("jacket") ||
    fullText.includes("tee font") ||
    fullText.includes("t-shirt") ||
    fullText.includes("sweater") ||
    fullText.includes("coat") ||
    fullText.includes("top") ||
    fullText.includes("vest")
  ) {
    return "tops";
  }

  return "accessories";
};

// Color Harmony Matrix Scoring
const calculateColorScore = (color1: string = "", color2: string = ""): number => {
  const c1 = color1.toLowerCase().trim();
  const c2 = color2.toLowerCase().trim();

  if (!c1 || !c2) return 10;
  if (c1 === c2) return 12; // Monochromatic

  const neutrals = ["white", "black", "grey", "gray", "beige", "cream", "navy"];
  if (neutrals.includes(c1) || neutrals.includes(c2)) return 15;

  const HarmonyMap: Record<string, string[]> = {
    blue: ["white", "beige", "grey", "black", "brown", "navy", "khaki"],
    navy: ["white", "beige", "grey", "black", "brown", "khaki", "gold"],
    black: ["white", "grey", "red", "blue", "beige", "green", "silver", "gold"],
    white: ["navy", "black", "blue", "grey", "green", "red", "beige", "brown"],
    red: ["black", "white", "grey", "navy", "denim"],
    green: ["beige", "brown", "white", "black", "navy"],
    beige: ["navy", "blue", "white", "black", "brown", "green"],
    brown: ["white", "beige", "blue", "navy", "black", "cream"],
  };

  const matches = HarmonyMap[c1] || [];
  if (matches.some((m) => c2.includes(m))) return 14;

  return 8;
};

export const generateStylingRecommendations = (
  mainProduct: Product,
  allProducts: Product[]
): StylingResult => {
  const mainType = getProductCategoryType(mainProduct);
  const mainGender = mainProduct.gender || "men";
  const mainSeason = mainProduct.season || "all-season";
  const mainColors = mainProduct.colors || (mainProduct as any).color ? [((mainProduct as any).color)] : ["black"];
  const mainColorStr = mainColors[0] || "black";

  // Filter out main product itself
  const candidates = allProducts.filter((p) => p.id !== mainProduct.id);

  const scoredRecommendations: ScoredRecommendation[] = [];

  for (const candidate of candidates) {
    const candType = getProductCategoryType(candidate);

    // Don't recommend products of the exact same type (e.g. top vs top) unless accessories
    if (candType === mainType && mainType !== "accessories") {
      continue;
    }
    if (candType === "unknown" || candType === "tops") {
      // If main is top, don't recommend top as styling pair
      if (mainType === "tops") continue;
    }

    // Gender Compatibility (HARD FILTER OUT OPPOSITES)
    const candGender = candidate.gender || "men";
    if (
      mainGender !== "unisex" &&
      candGender !== "unisex" &&
      mainGender !== candGender
    ) {
      continue;
    }

    // Season Compatibility (HARD FILTER OUT EXTREME OPPOSITES)
    const candSeason = candidate.season || "all-season";
    if (
      (mainSeason === "summer" && candSeason === "winter") ||
      (mainSeason === "winter" && candSeason === "summer")
    ) {
      continue;
    }

    const reasons: string[] = [];
    let rawScore = 65;

    // Gender score
    if (candGender === mainGender) {
      rawScore += 10;
      reasons.push(`${mainGender.toUpperCase()} tailoring match`);
    }

    // Season score
    if (candSeason === mainSeason || candSeason === "all-season") {
      rawScore += 10;
      reasons.push(`${mainSeason.toUpperCase()} season alignment`);
    }

    // Color score
    const candColors = candidate.colors || [];
    const candColorStr = candColors[0] || "white";
    const colorPts = calculateColorScore(mainColorStr, candColorStr);
    rawScore += colorPts;
    if (colorPts >= 12) {
      reasons.push(`Harmonious color contrast (${candColorStr})`);
    }

    // Fashion tags overlap
    const mainTags = mainProduct.fashionTags || [];
    const candTags = candidate.fashionTags || [];
    const sharedTags = mainTags.filter((t) => candTags.includes(t));
    if (sharedTags.length > 0) {
      rawScore += Math.min(sharedTags.length * 4, 12);
      reasons.push(`Matching aesthetic: ${sharedTags.join(", ")}`);
    }

    // Cap match score between 84% and 98% for realism
    const finalScore = Math.min(Math.max(Math.round(rawScore), 84), 98);

    const mappedCategory: RecommendationCategory =
      candType === "tops" || candType === "unknown" ? "accessories" : candType;

    const categoryLabels: Record<RecommendationCategory, string> = {
      bottoms: "Bottoms",
      shoes: "Footwear",
      accessories: "Accessories",
      caps: "Headwear & Caps",
      bags: "Bags & Leather",
      watches: "Luxury Watches",
      sunglasses: "Eyewear & Shades",
      jackets: "Jackets & Outerwear",
      tops: "Tops & Shirts",
    };

    scoredRecommendations.push({
      product: candidate,
      matchScore: finalScore,
      matchReasons: reasons,
      category: mappedCategory,
      categoryLabel: categoryLabels[mappedCategory] || "Accessories",
    });
  }

  // Sort descending by matchScore
  scoredRecommendations.sort((a, b) => b.matchScore - a.matchScore);

  // Group by category
  const categoriesOrder: RecommendationCategory[] = [
    "bottoms",
    "shoes",
    "accessories",
    "caps",
    "bags",
    "watches",
    "sunglasses",
  ];

  const categoryLabels: Record<RecommendationCategory, string> = {
    bottoms: "Bottoms",
    shoes: "Shoes",
    accessories: "Accessories",
    caps: "Caps & Headwear",
    bags: "Bags & Leather Goods",
    watches: "Watches",
    sunglasses: "Sunglasses",
    jackets: "Jackets & Outerwear",
    tops: "Tops & Shirts",
  };

  const recommendationsGrouped: StylingCategoryGroup[] = [];

  for (const catKey of categoriesOrder) {
    const itemsInCat = scoredRecommendations.filter(
      (r) => r.category === catKey
    );
    if (itemsInCat.length > 0) {
      recommendationsGrouped.push({
        categoryKey: catKey,
        categoryLabel: categoryLabels[catKey],
        items: itemsInCat.slice(0, 4), // Top 4 per category
      });
    }
  }

  // Generate AI Styling Tip text
  const topBottom = scoredRecommendations.find((r) => r.category === "bottoms");
  const topShoe = scoredRecommendations.find((r) => r.category === "shoes");
  const topAcc = scoredRecommendations.find(
    (r) => r.category === "accessories" || r.category === "watches" || r.category === "caps"
  );

  let aiStylingTip = `This ${mainColorStr} ${mainProduct.name} delivers a crisp, elevated silhouette. `;
  if (topBottom && topShoe) {
    aiStylingTip += `For a curated outfit, pair it with ${topBottom.product.name} (${topBottom.matchScore}% Match) and ${topShoe.product.name} (${topShoe.matchScore}% Match).`;
  } else if (topBottom) {
    aiStylingTip += `Style with ${topBottom.product.name} (${topBottom.matchScore}% Match) for an effortless modern aesthetic.`;
  } else if (topShoe) {
    aiStylingTip += `Anchor the outfit with ${topShoe.product.name} (${topShoe.matchScore}% Match) for a sleek finish.`;
  }

  if (topAcc) {
    aiStylingTip += ` Complete the look with ${topAcc.product.name}.`;
  }

  return {
    mainProduct,
    recommendationsGrouped,
    topScoredItems: scoredRecommendations.slice(0, 6),
    aiStylingTip,
  };
};

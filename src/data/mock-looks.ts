import type { InspirationAnalysis } from "@/lib/matching/types";

// Sample analyses returned by the MOCK analyzeInspiration().
// They are not derived from the uploaded image. Each one is written to match
// items in the demo catalogue so the results screen is meaningful to test.
// Delete this file once a real vision model is connected.

export const MOCK_LOOKS: InspirationAnalysis[] = [
  {
    garmentTypes: ["fitted top", "maxi skirt"],
    colors: ["white", "dark grey"],
    silhouette: ["fitted", "low-rise", "straight"],
    materials: ["unknown"],
    style: ["minimalist", "Korean", "Y2K"],
    notableDetails: ["square neckline"],
    englishSearchPhrase: "white square-neck fitted top with a dark grey low-rise straight maxi skirt",
    taobaoSearchKeywords: ["白色方领修身上衣", "深灰低腰长裙", "韩系极简穿搭"],
  },
  {
    garmentTypes: ["blouse", "midi skirt"],
    colors: ["ivory", "burgundy"],
    silhouette: ["relaxed", "a-line", "midi"],
    materials: ["satin"],
    style: ["new chinese", "elegant"],
    notableDetails: ["mandarin collar", "frog buttons", "pleats"],
    englishSearchPhrase: "ivory mandarin-collar blouse with frog buttons and a burgundy pleated midi skirt",
    taobaoSearchKeywords: ["新中式盘扣立领衬衫", "酒红色马面裙", "新中式套装"],
  },
  {
    garmentTypes: ["oversized hoodie", "baggy jeans", "sneakers"],
    colors: ["grey", "blue", "white"],
    silhouette: ["oversized", "baggy", "low-rise"],
    materials: ["cotton", "denim"],
    style: ["streetwear", "Y2K"],
    notableDetails: ["hood", "zip front"],
    englishSearchPhrase: "grey oversized zip hoodie with low-rise baggy blue jeans and chunky white sneakers",
    taobaoSearchKeywords: ["美式宽松拉链卫衣", "低腰阔腿牛仔裤", "厚底老爹鞋"],
  },
  {
    garmentTypes: ["cardigan", "camisole", "mini skirt"],
    colors: ["pink", "white"],
    silhouette: ["cropped", "fitted", "mini"],
    materials: ["knit", "lace"],
    style: ["coquette", "romantic"],
    notableDetails: ["bows", "lace trim"],
    englishSearchPhrase: "cropped pink cardigan with bows over a lace-trim cami and a white pleated mini skirt",
    taobaoSearchKeywords: ["蕾丝边蝴蝶结开衫", "甜美吊带背心", "百褶短裙"],
  },
  {
    garmentTypes: ["blazer", "knit top", "wide-leg trousers"],
    colors: ["camel", "cream"],
    silhouette: ["relaxed", "wide-leg", "high-waisted"],
    materials: ["wool", "knit"],
    style: ["quiet luxury", "office"],
    notableDetails: ["front pleats", "polo collar"],
    englishSearchPhrase: "relaxed camel blazer over a cream knit polo with high-waisted wide-leg trousers",
    taobaoSearchKeywords: ["高级感廓形西装外套", "针织翻领上衣", "高腰垂感阔腿裤"],
  },
];

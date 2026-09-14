export const CUSTOM_CATEGORY_ORDER = [
  'velvet suzani jacket',
  'velvet printed jacket',
  'tnt suzani jacket',
  'cotton suzani jacket',
  'kimonos'
];

export function sortCategoriesCustom(categories: string[]): string[] {
  return [...categories].sort((a, b) => {
    // Exact or partial match (case insensitive)
    const normalizedA = a.toLowerCase().trim();
    const normalizedB = b.toLowerCase().trim();
    
    let idxA = CUSTOM_CATEGORY_ORDER.findIndex(cat => normalizedA === cat);
    let idxB = CUSTOM_CATEGORY_ORDER.findIndex(cat => normalizedB === cat);
    
    // Fallback to partial match if exact match not found
    if (idxA === -1) idxA = CUSTOM_CATEGORY_ORDER.findIndex(cat => normalizedA.includes(cat));
    if (idxB === -1) idxB = CUSTOM_CATEGORY_ORDER.findIndex(cat => normalizedB.includes(cat));

    if (idxA !== -1 && idxB !== -1) {
      return idxA - idxB;
    }
    if (idxA !== -1) return -1; // A comes before others
    if (idxB !== -1) return 1;  // B comes before others
    
    return a.localeCompare(b); // Alphabetical for the rest
  });
}

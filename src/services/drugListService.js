// Drug List Service
// Provides search, filtering, and access to drug database

import drugList from '../drugList.json';

// Cache for performance
let drugCache = null;
let searchIndex = null;

/**
 * Initialize drug database and search index
 */
function initializeDatabase() {
  if (drugCache) return;
  
  drugCache = drugList.map((drug, index) => ({
    ...drug,
    id: index,
    searchableText: `${drug.name} ${drug.tradeName} ${drug.approvedFor} ${drug.category}`.toLowerCase()
  }));
  
  // Create search index for fast lookup
  searchIndex = new Map();
  drugCache.forEach(drug => {
    const key = drug.name.toLowerCase();
    searchIndex.set(key, drug);
  });
  
  console.log(`✅ Loaded ${drugCache.length} drugs into database`);
}

/**
 * Get all drugs
 * @returns {Array} Array of all drugs
 */
export function getAllDrugs() {
  initializeDatabase();
  return drugCache;
}

/**
 * Get drug by exact name
 * @param {string} name - Drug name
 * @returns {Object|null} Drug object or null
 */
export function getDrugByName(name) {
  initializeDatabase();
  return searchIndex.get(name.toLowerCase()) || null;
}

/**
 * Search drugs by query
 * @param {string} query - Search query
 * @param {number} limit - Maximum results
 * @returns {Array} Array of matching drugs
 */
export function searchDrugs(query, limit = 20) {
  if (!query || query.length < 2) return [];
  
  initializeDatabase();
  const lowerQuery = query.toLowerCase().trim();
  
  // Exact match first
  const exactMatch = drugCache.filter(drug => 
    drug.name.toLowerCase() === lowerQuery ||
    drug.tradeName.toLowerCase() === lowerQuery
  );
  
  if (exactMatch.length > 0) return exactMatch;
  
  // Starts with match (high priority)
  const startsWithMatches = drugCache.filter(drug =>
    drug.name.toLowerCase().startsWith(lowerQuery) ||
    drug.tradeName.toLowerCase().startsWith(lowerQuery)
  );
  
  // Contains match (lower priority)
  const containsMatches = drugCache.filter(drug =>
    !drug.name.toLowerCase().startsWith(lowerQuery) &&
    !drug.tradeName.toLowerCase().startsWith(lowerQuery) &&
    drug.searchableText.includes(lowerQuery)
  );
  
  return [...startsWithMatches, ...containsMatches].slice(0, limit);
}

/**
 * Filter drugs by category
 * @param {string} category - Drug category
 * @returns {Array} Filtered drugs
 */
export function getDrugsByCategory(category) {
  initializeDatabase();
  return drugCache.filter(drug => drug.category === category);
}

/**
 * Get all unique categories
 * @returns {Array} Array of category names
 */
export function getCategories() {
  initializeDatabase();
  const categories = new Set(drugCache.map(drug => drug.category));
  return Array.from(categories).sort();
}

/**
 * Get drug statistics
 * @returns {Object} Database statistics
 */
export function getDrugStats() {
  initializeDatabase();
  
  const enrichedCount = drugCache.filter(d => d.enriched).length;
  const openFDACount = drugCache.filter(d => d.dataSource === 'OpenFDA').length;
  
  return {
    total: drugCache.length,
    enriched: enrichedCount,
    openFDAData: openFDACount,
    categories: getCategories().length,
    enrichmentRate: ((enrichedCount / drugCache.length) * 100).toFixed(1)
  };
}

/**
 * Get random drugs for suggestions
 * @param {number} count - Number of suggestions
 * @returns {Array} Random drug suggestions
 */
export function getRandomDrugs(count = 5) {
  initializeDatabase();
  const shuffled = [...drugCache].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Get popular drugs (high-priority for demo)
 * @returns {Array} Popular/common drugs
 */
export function getPopularDrugs() {
  initializeDatabase();
  const popularNames = [
    'Metformin', 'Aspirin', 'Ibuprofen', 'Atorvastatin', 'Lisinopril',
    'Sildenafil', 'Thalidomide', 'Tamoxifen', 'Hydroxychloroquine',
    'Omeprazole', 'Sertraline', 'Gabapentin', 'Methotrexate'
  ];
  
  return drugCache.filter(drug => 
    popularNames.includes(drug.name)
  ).slice(0, 10);
}

/**
 * Validate drug name exists
 * @param {string} name - Drug name to validate
 * @returns {boolean} True if drug exists
 */
export function isDrugValid(name) {
  initializeDatabase();
  return searchIndex.has(name.toLowerCase());
}

// Export drug count for UI display
export const DRUG_COUNT = drugList.length;

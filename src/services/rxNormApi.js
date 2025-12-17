// RxNorm Drug Search API
// Provides comprehensive drug name search from National Library of Medicine
// Contains ALL FDA-approved drugs and clinical drugs

const RXNORM_BASE = 'https://rxnav.nlm.nih.gov/REST';

// Cache for performance
const drugNameCache = new Map();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

/**
 * Search ALL drug names using RxNorm API
 * @param {string} query - Drug name to search
 * @param {number} maxResults - Maximum results to return
 * @returns {Promise<Array>} Array of drug names
 */
export async function searchAllDrugNames(query, maxResults = 50) {
  if (!query || query.length < 2) return [];
  
  const cacheKey = `drug_search_${query.toLowerCase()}`;
  
  // Check cache
  if (drugNameCache.has(cacheKey)) {
    const cached = drugNameCache.get(cacheKey);
    if (Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log('📦 Using cached drug names for:', query);
      return cached.data;
    }
  }
  
  try {
    console.log('🔍 Searching ALL drugs in RxNorm for:', query);
    
    // RxNorm approximate search - finds drugs that match the query
    const url = `${RXNORM_BASE}/approximateTerm.json?term=${encodeURIComponent(query)}&maxEntries=${maxResults}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`RxNorm API error: ${response.status}`);
    }
    
    const data = await response.json();
    const candidates = data.approximateGroup?.candidate || [];
    
    // Transform to simple drug name list with scores
    const drugNames = candidates.map(candidate => ({
      name: candidate.name,
      rxcui: candidate.rxcui,
      score: candidate.score,
      rank: candidate.rank
    })).sort((a, b) => b.score - a.score);
    
    // Cache results
    drugNameCache.set(cacheKey, {
      data: drugNames,
      timestamp: Date.now()
    });
    
    return drugNames;
    
  } catch (error) {
    console.error('RxNorm API error:', error);
    return [];
  }
}

/**
 * Get drug details by RxCUI
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @returns {Promise<Object>} Drug details
 */
export async function getDrugDetailsByRxcui(rxcui) {
  try {
    const url = `${RXNORM_BASE}/rxcui/${rxcui}/properties.json`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const properties = data.properties;
    
    return {
      rxcui: properties.rxcui,
      name: properties.name,
      synonym: properties.synonym,
      tty: properties.tty, // Term type (e.g., IN = ingredient, BN = brand name)
      language: properties.language
    };
  } catch (error) {
    console.error('Error fetching drug details:', error);
    return null;
  }
}

/**
 * Get related drugs (generics, brands, etc.)
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @returns {Promise<Object>} Related drug information
 */
export async function getRelatedDrugs(rxcui) {
  try {
    const url = `${RXNORM_BASE}/rxcui/${rxcui}/related.json?tty=IN+BN+SCD+SBD`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    const relatedGroup = data.relatedGroup?.conceptGroup || [];
    
    const related = {
      ingredients: [],
      brandNames: [],
      clinicalDrugs: []
    };
    
    relatedGroup.forEach(group => {
      const concepts = group.conceptProperties || [];
      
      switch (group.tty) {
        case 'IN': // Ingredient
          related.ingredients = concepts.map(c => ({ name: c.name, rxcui: c.rxcui }));
          break;
        case 'BN': // Brand Name
          related.brandNames = concepts.map(c => ({ name: c.name, rxcui: c.rxcui }));
          break;
        case 'SCD': // Semantic Clinical Drug
        case 'SBD': // Semantic Branded Drug
          related.clinicalDrugs.push(...concepts.map(c => ({ name: c.name, rxcui: c.rxcui })));
          break;
      }
    });
    
    return related;
  } catch (error) {
    console.error('Error fetching related drugs:', error);
    return null;
  }
}

/**
 * Spelling suggestions for misspelled drug names
 * @param {string} query - Possibly misspelled drug name
 * @returns {Promise<Array>} Spelling suggestions
 */
export async function getSpellingSuggestions(query) {
  if (!query || query.length < 3) return [];
  
  try {
    const url = `${RXNORM_BASE}/spellingsuggestions.json?name=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.suggestionGroup?.suggestionList?.suggestion || [];
  } catch (error) {
    console.error('Error fetching spelling suggestions:', error);
    return [];
  }
}

/**
 * Search drugs with autocomplete suggestions
 * @param {string} query - Drug name query
 * @returns {Promise<Array>} Autocomplete suggestions
 */
export async function autocompleteDrugNames(query) {
  if (!query || query.length < 2) return [];
  
  try {
    const url = `${RXNORM_BASE}/displaynames.json?name=${encodeURIComponent(query)}&maxEntries=20`;
    const response = await fetch(url);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    return data.displayTermsList?.term || [];
  } catch (error) {
    console.error('Error fetching autocomplete:', error);
    return [];
  }
}

/**
 * Combined search: Local database + RxNorm API
 * @param {string} query - Search query
 * @param {Array} localDrugs - Local drug database (79 drugs)
 * @returns {Promise<Object>} Combined results
 */
export async function searchDrugsCombined(query, localDrugs = []) {
  if (!query || query.length < 2) {
    return { local: [], rxnorm: [] };
  }
  
  // Search local database first (fast)
  const lowerQuery = query.toLowerCase();
  const localResults = localDrugs.filter(drug =>
    drug.name.toLowerCase().includes(lowerQuery) ||
    drug.tradeName?.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
  
  // Search RxNorm API for comprehensive results (slower but complete)
  const rxnormResults = await searchAllDrugNames(query, 40);
  
  return {
    local: localResults,
    rxnorm: rxnormResults,
    total: localResults.length + rxnormResults.length
  };
}

/**
 * Get drug interactions
 * @param {string} rxcui - RxNorm Concept Unique Identifier
 * @returns {Promise<Array>} Drug interactions
 */
export async function getDrugInteractions(rxcui) {
  try {
    const url = `${RXNORM_BASE}/interaction/interaction.json?rxcui=${rxcui}`;
    const response = await fetch(url);
    
    if (!response.ok) return [];
    
    const data = await response.json();
    const interactionGroup = data.interactionTypeGroup || [];
    
    const interactions = [];
    interactionGroup.forEach(group => {
      const pairs = group.interactionType?.[0]?.interactionPair || [];
      pairs.forEach(pair => {
        interactions.push({
          drug1: pair.interactionConcept?.[0]?.minConceptItem?.name,
          drug2: pair.interactionConcept?.[1]?.minConceptItem?.name,
          severity: pair.severity,
          description: pair.description
        });
      });
    });
    
    return interactions;
  } catch (error) {
    console.error('Error fetching drug interactions:', error);
    return [];
  }
}

// Export cache management
export function clearDrugCache() {
  drugNameCache.clear();
  console.log('✅ Drug name cache cleared');
}

export function getCacheSize() {
  return drugNameCache.size;
}

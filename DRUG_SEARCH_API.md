# Drug Search API - Complete Guide

## 🔍 Overview
Your app now has **TWO drug search systems** working together:

1. **Local Database** (79 FDA drugs) - Fast, with full repurposing data
2. **RxNorm API** (ALL drugs) - Comprehensive, searches thousands of drugs

---

## 📊 Search APIs Available

### 1. **Local Drug Search** (`drugListService.js`)
Fast in-memory search of 79 FDA-approved drugs with complete data.

**Functions:**
```javascript
// Search 79 drugs instantly
searchDrugs(query, limit = 20)

// Get exact drug by name
getDrugByName(name)

// Get all drugs
getAllDrugs()

// Filter by category
getDrugsByCategory(category)

// Get popular drugs
getPopularDrugs()

// Get drug statistics
getDrugStats()
```

**Features:**
- ⚡ < 10ms response time
- 📦 Works offline
- 🎯 Exact + fuzzy matching
- 📋 Full drug data (indication, side effects, category)

---

### 2. **RxNorm API** (`rxNormApi.js`) - NEW!
Comprehensive search of ALL FDA-approved drugs from National Library of Medicine.

**Functions:**
```javascript
// Search ALL drug names (thousands)
searchAllDrugNames(query, maxResults = 50)

// Autocomplete suggestions
autocompleteDrugNames(query)

// Get drug details by RxCUI
getDrugDetailsByRxcui(rxcui)

// Get related drugs (generics, brands)
getRelatedDrugs(rxcui)

// Spelling suggestions
getSpellingSuggestions(query)

// Drug interactions
getDrugInteractions(rxcui)

// Combined search (local + RxNorm)
searchDrugsCombined(query, localDrugs)
```

**Features:**
- 🌍 Searches ALL FDA drugs
- 🔄 Real-time API calls
- 💾 24-hour caching
- 🔤 Spelling correction
- 🤝 Drug interactions

---

## 🎯 How The Search Works

When you type in the search box:

### **Phase 1: Instant Local Results**
1. Searches 79 local drugs immediately
2. Shows results in dropdown with blue badge "📦 LOCAL DATABASE"
3. Includes drug indication, trade name, category

### **Phase 2: Comprehensive Search**
1. Calls RxNorm API to search ALL drugs
2. Shows results with green badge "🌍 ALL DRUGS DATABASE"
3. Can find any FDA-approved drug name

---

## 📝 Usage Examples

### Example 1: Search for Common Drug
```javascript
// User types "aspirin"

LOCAL DATABASE:
✓ Aspirin - Anti-inflammatory, Cardiovascular

ALL DRUGS DATABASE:
✓ Aspirin
✓ Aspirin Low Strength
✓ Aspirin Delayed-Release
✓ Aspirin-Dipyridamole
(+ 20 more variations)
```

### Example 2: Search for Rare Drug
```javascript
// User types "adalimumab"

LOCAL DATABASE:
❌ No matches

ALL DRUGS DATABASE:
✓ Adalimumab
✓ Adalimumab-adbm
✓ Adalimumab-atto
✓ Adalimumab-adaz
(+ more biosimilars)
```

---

## 🔧 API Endpoints

### RxNorm Base URL
```
https://rxnav.nlm.nih.gov/REST
```

### Key Endpoints Used

1. **Approximate Search**
   ```
   GET /approximateTerm.json?term={drug}&maxEntries=50
   ```
   Returns drugs matching the search term

2. **Autocomplete**
   ```
   GET /displaynames.json?name={drug}&maxEntries=20
   ```
   Fast autocomplete suggestions

3. **Drug Properties**
   ```
   GET /rxcui/{rxcui}/properties.json
   ```
   Details for specific drug

4. **Related Drugs**
   ```
   GET /rxcui/{rxcui}/related.json?tty=IN+BN+SCD+SBD
   ```
   Generics, brands, formulations

5. **Interactions**
   ```
   GET /interaction/interaction.json?rxcui={rxcui}
   ```
   Drug-drug interactions

6. **Spelling**
   ```
   GET /spellingsuggestions.json?name={query}
   ```
   Spelling corrections

---

## ⚡ Performance

### Local Search
- **Speed**: < 10ms
- **Caching**: In-memory (permanent)
- **Coverage**: 79 drugs
- **Offline**: ✅ Yes

### RxNorm Search
- **Speed**: 200-500ms
- **Caching**: 24 hours (localStorage)
- **Coverage**: Thousands of drugs
- **Offline**: ❌ No (requires internet)

---

## 🎨 UI Integration

### Search Dropdown Structure
```
┌─────────────────────────────────────┐
│  📦 LOCAL DATABASE (3 matches)      │
├─────────────────────────────────────┤
│ ✓ Metformin - Antidiabetic          │
│ ✓ Methotrexate - Oncology           │
│ ✓ Methylphenidate - ADHD            │
├─────────────────────────────────────┤
│  🌍 ALL DRUGS DATABASE (47 matches) │
├─────────────────────────────────────┤
│ ✓ Metformin Hydrochloride           │
│ ✓ Metformin Extended Release        │
│ ✓ Metformin 500 MG                  │
│   ... (+ 44 more)                   │
└─────────────────────────────────────┘
```

---

## 🔐 Rate Limits

### RxNorm API
- **Free tier**: No authentication required
- **Rate limit**: Not publicly specified (appears unlimited)
- **Caching**: Implemented to minimize requests

### Best Practices
- Cache results for 24 hours
- Debounce search input (500ms)
- Show local results immediately
- Fetch RxNorm results asynchronously

---

## 🚀 Future Enhancements

### Possible Additions
1. **DrugBank API** - More detailed drug information
2. **PubChem Search** - Chemical structure search
3. **OpenFDA Drug Labels** - Full prescribing information
4. **ChEMBL API** - Drug target information
5. **Elasticsearch** - Self-hosted drug search index

---

## 📚 Resources

- **RxNorm Documentation**: https://rxnav.nlm.nih.gov/
- **API Usage Guide**: https://rxnav.nlm.nih.gov/RxNormAPIs.html
- **Drug Concepts**: https://www.nlm.nih.gov/research/umls/rxnorm/

---

## 💡 Key Advantages

### Why This Hybrid Approach?

**Local Database (79 drugs):**
- ✅ Instant results
- ✅ Full repurposing data
- ✅ Curated side effects
- ✅ Works offline

**RxNorm API (ALL drugs):**
- ✅ Comprehensive coverage
- ✅ Always up-to-date
- ✅ Official FDA database
- ✅ No maintenance needed

**Combined = Best of Both Worlds!** 🎉

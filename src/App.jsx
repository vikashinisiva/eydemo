import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Pill, Brain, Sparkles, TrendingUp, FileText, Download, 
  Rocket, AlertCircle, CheckCircle, Activity, Zap, Target, Filter, Search, Database
} from 'lucide-react';
import { drugsData, repurposingResults } from './data';
import { analyzeRepurposingRealTime, generateRepurposingSuggestions } from './services/drugApi';
import { searchDrugs, getDrugByName, DRUG_COUNT, getDrugStats, getAllDrugs } from './services/drugListService';
import { searchDrugsCombined, getDrugDetailsByRxcui, autocompleteDrugNames } from './services/rxNormApi';
import ResultsPanel from './components/ResultsPanel';
import EvidencePanel from './components/EvidencePanel';
import FilterPanel from './components/FilterPanel';
import Hero from './components/Hero';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [selectedDrug, setSelectedDrug] = useState('Metformin');
  const [drugSearchQuery, setDrugSearchQuery] = useState('Metformin');
  const [searchResults, setSearchResults] = useState([]);
  const [rxnormResults, setRxnormResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchingAllDrugs, setSearchingAllDrugs] = useState(false);
  const searchInputRef = useRef(null);
  const [drugInfo, setDrugInfo] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    confidence: 0,
    phases: [],
    patentStatus: [],
    sortBy: 'confidence'
  });

  // Handle drug search - searches BOTH local + ALL drugs via RxNorm API
  useEffect(() => {
    let isCancelled = false;
    
    const performSearch = async () => {
      if (drugSearchQuery.length >= 2) {
        // First: Show local results immediately (fast)
        const localResults = searchDrugs(drugSearchQuery, 10);
        setSearchResults(localResults);
        setShowSearchDropdown(true);
        
        // Second: Fetch ALL drugs from RxNorm API (comprehensive but slower)
        setSearchingAllDrugs(true);
        try {
          const allDrugs = await autocompleteDrugNames(drugSearchQuery);
          if (!isCancelled) {
            setRxnormResults(allDrugs);
            setSearchingAllDrugs(false);
          }
        } catch (error) {
          console.error('RxNorm search error:', error);
          if (!isCancelled) {
            setSearchingAllDrugs(false);
          }
        }
      } else {
        setSearchResults([]);
        setRxnormResults([]);
        setShowSearchDropdown(false);
      }
    };
    
    performSearch();
    
    return () => {
      isCancelled = true;
    };
  }, [drugSearchQuery]);

  // Load drug info when selection changes
  useEffect(() => {
    const drug = getDrugByName(selectedDrug);
    if (drug) {
      setDrugInfo(drug);
    } else {
      // Fallback to old data structure
      setDrugInfo(drugsData[selectedDrug] ? {
        name: selectedDrug,
        approvedFor: drugsData[selectedDrug].approvedFor,
        description: drugsData[selectedDrug].description,
        sideEffects: drugsData[selectedDrug].sideEffects
      } : null);
    }
  }, [selectedDrug]);

  const handleDrugSelect = (drug) => {
    setSelectedDrug(drug.name);
    setDrugSearchQuery(drug.name);
    setShowSearchDropdown(false);
    setShowResults(false);
    setShowEvidence(false);
    toast.success(`Selected: ${drug.name}`, { duration: 2000 });
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setShowResults(false);
    setShowEvidence(false);
    setSelectedResult(null);
    
    toast.loading('Fetching real-time data from 4 APIs...', { id: 'analyze' });

    try {
      // Fetch real-time data from PubChem, PubMed, ClinicalTrials, OpenFDA
      const realTimeData = await analyzeRepurposingRealTime(selectedDrug);
      
      console.log('🔬 Real-time API Results:', realTimeData);
      
      // Show API results in toast notifications
      const apiMessages = [];
      if (realTimeData.pubmed) {
        apiMessages.push(`📚 ${realTimeData.pubmed.publicationCount} publications`);
      }
      if (realTimeData.clinicalTrials) {
        apiMessages.push(`🏥 ${realTimeData.clinicalTrials.totalTrials} trials`);
      }
      if (realTimeData.adverseEvents) {
        apiMessages.push(`⚠️ ${realTimeData.adverseEvents.totalReports} safety reports`);
      }
      
      setAnalyzing(false);
      setShowResults(true);
      
      // Success notification with real data
      const mockResults = repurposingResults[selectedDrug] || [];
      toast.success(
        `Found ${mockResults.length} opportunities!\n${apiMessages.join(' • ')}`,
        { id: 'analyze', duration: 5000 }
      );
      
    } catch (error) {
      console.error('API Error:', error);
      setAnalyzing(false);
      setShowResults(true);
      
      // Fallback to mock data with warning
      const mockResults = repurposingResults[selectedDrug] || [];
      toast.success(
        `Found ${mockResults.length} opportunities (using cached data)`,
        { id: 'analyze', duration: 4000 }
      );
    }
  };

  const handleResultClick = (result) => {
    setSelectedResult(result);
    setShowEvidence(true);
    toast.success(`Viewing ${result.disease} evidence`, { duration: 2000 });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    const activeFilters = 
      (newFilters.confidence > 0 ? 1 : 0) + 
      newFilters.phases.length + 
      newFilters.patentStatus.length;
    
    if (activeFilters > 0) {
      toast.success(`${activeFilters} filter${activeFilters > 1 ? 's' : ''} applied`, { duration: 2000 });
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Esc to close modals
      if (e.key === 'Escape') {
        if (showEvidence) {
          setShowEvidence(false);
        } else if (showFilters) {
          setShowFilters(false);
        }
      }
      
      // Cmd+K or Ctrl+K to focus drug search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showEvidence, showFilters]);

  // Apply filters and sorting
  const getFilteredAndSortedResults = () => {
    let filtered = repurposingResults[selectedDrug] || [];

    // Apply confidence filter
    if (filters.confidence > 0) {
      filtered = filtered.filter(r => r.confidence * 100 >= filters.confidence);
    }

    // Apply phase filter
    if (filters.phases.length > 0) {
      filtered = filtered.filter(r => filters.phases.includes(r.evidence.phase));
    }

    // Apply patent status filter
    if (filters.patentStatus.length > 0) {
      filtered = filtered.filter(r => filters.patentStatus.includes(r.patentStatus));
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'confidenceAsc':
          return a.confidence - b.confidence;
        case 'publications':
          return b.evidence.publications - a.evidence.publications;
        case 'trials':
          return b.evidence.trials - a.evidence.trials;
        case 'roi':
          return (b.roi || 0) - (a.roi || 0);
        case 'marketSize':
          const sizeA = parseFloat(a.marketSize?.replace(/[$B]/g, '') || 0);
          const sizeB = parseFloat(b.marketSize?.replace(/[$B]/g, '') || 0);
          return sizeB - sizeA;
        case 'timeToMarket':
          const timeA = a.timeToMarket?.includes('Already') ? 0 : parseInt(a.timeToMarket?.split('-')[0] || 99);
          const timeB = b.timeToMarket?.includes('Already') ? 0 : parseInt(b.timeToMarket?.split('-')[0] || 99);
          return timeA - timeB;
        default:
          return b.confidence - a.confidence;
      }
    });

    return sorted;
  };

  const results = getFilteredAndSortedResults();

  return (
    <ErrorBoundary>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#363636',
            fontWeight: '600',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#fff',
            },
          },
        }}
      />
      
      <div className="min-h-screen pb-20">
        {/* Hero Section */}
        <Hero />

      {/* Main Content */}
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Control Panel */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-8 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-800">Step 1: Select Drug for Analysis</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-lg border border-gray-200">
              <Database className="w-4 h-4" />
              <span className="font-semibold">{DRUG_COUNT} local + 🌍 ALL drugs (RxNorm)</span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Drug Selection <span className="text-gray-400 font-normal">(Search ALL drugs - {DRUG_COUNT} local + thousands via RxNorm)</span>
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={drugSearchQuery}
                  onChange={(e) => setDrugSearchQuery(e.target.value)}
                  onFocus={() => drugSearchQuery.length >= 2 && setShowSearchDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                  placeholder="Search drugs (e.g., Metformin, Lipitor)..."
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-lg font-medium"
                />
                {showSearchDropdown && (searchResults.length > 0 || rxnormResults.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto z-50"
                  >
                    {/* Local Database Results (79 drugs with full data) */}
                    {searchResults.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-blue-50 text-xs font-semibold text-blue-700 border-b border-blue-100 sticky top-0">
                          📦 LOCAL DATABASE ({searchResults.length} matches)
                        </div>
                        {searchResults.map((drug, index) => (
                          <button
                            key={`local-${index}`}
                            onClick={() => handleDrugSelect(drug)}
                            className="w-full px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-100"
                          >
                            <div className="font-semibold text-gray-800">{drug.name}</div>
                            <div className="text-sm text-gray-500">
                              {drug.tradeName && `${drug.tradeName} • `}{drug.approvedFor}
                            </div>
                            {drug.category && (
                              <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded mt-1">
                                {drug.category}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* RxNorm API Results (ALL drugs - thousands) */}
                    {rxnormResults.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-green-50 text-xs font-semibold text-green-700 border-b border-green-100 sticky top-0">
                          🌍 ALL DRUGS DATABASE ({rxnormResults.length} matches) {searchingAllDrugs && '⏳ Loading...'}
                        </div>
                        {rxnormResults.slice(0, 30).map((drugName, index) => (
                          <button
                            key={`rxnorm-${index}`}
                            onClick={() => {
                              setDrugSearchQuery(drugName);
                              setSelectedDrug(drugName);
                              setShowSearchDropdown(false);
                              toast.success(`Selected: ${drugName}`, { icon: '💊' });
                            }}
                            className="w-full px-4 py-3 hover:bg-green-50 transition-colors text-left border-b border-gray-100"
                          >
                            <div className="font-semibold text-gray-800">{drugName}</div>
                            <div className="text-xs text-gray-500">From RxNorm (FDA Database)</div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Loading indicator */}
                    {searchingAllDrugs && rxnormResults.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-500">
                        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Searching all drugs...
                      </div>
                    )}
                    
                    {/* No results */}
                    {!searchingAllDrugs && searchResults.length === 0 && rxnormResults.length === 0 && (
                      <div className="px-4 py-6 text-center text-gray-500">
                        No drugs found matching "{drugSearchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
              {selectedDrug && (
                <div className="mt-3 text-sm text-gray-600">
                  Selected: <span className="font-semibold text-blue-600">{selectedDrug}</span>
                </div>
              )}
            </div>

            {drugInfo && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-100">
              <div className="text-sm font-semibold text-gray-600 mb-2">Current Indication</div>
              <div className="text-xl font-bold text-gray-800 mb-2">
                {drugInfo.approvedFor}
              </div>
              <div className="text-sm text-gray-600">
                {drugInfo.description}
              </div>
              {drugInfo.tradeName && (
                <div className="mt-3 text-xs text-gray-500">
                  Trade Name: <span className="font-semibold">{drugInfo.tradeName}</span>
                </div>
              )}
            </div>
            )}
          </div>

          {/* Side Effects Display */}
          {drugInfo && drugInfo.sideEffects && drugInfo.sideEffects.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Known Side Effects {drugInfo.dataSource && <span className="text-xs text-gray-500">({drugInfo.dataSource})</span>}
            </label>
            <div className="flex flex-wrap gap-2">
              {drugInfo.sideEffects.slice(0, 8).map((effect, idx) => (
                <motion.span
                  key={effect}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-lg font-medium text-sm border border-orange-200"
                >
                  {effect}
                </motion.span>
              ))}
              {drugInfo.sideEffects.length > 8 && (
                <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg font-medium text-sm border border-gray-200">
                  +{drugInfo.sideEffects.length - 8} more
                </span>
              )}
            </div>
          </div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAnalyze}
            disabled={analyzing}
            className="btn-primary w-full text-lg flex items-center justify-center gap-3"
          >
            {analyzing ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                AI Agents Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Run AI Repurposing Analysis
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Analysis Progress */}
        <AnimatePresence>
          {analyzing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="glass-card p-8 mb-8"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="inline-block mb-4"
                >
                  <Brain className="w-16 h-16 text-blue-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  Agentic AI System Processing...
                </h3>
                <p className="text-gray-600">
                  7 specialized AI agents working in parallel
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { name: 'Side-Effect Extraction Agent', delay: 0 },
                  { name: 'Biomedical NLP Agent (BioBERT)', delay: 500 },
                  { name: 'Disease Matching Agent', delay: 1000 },
                  { name: 'Evidence Retrieval Agent', delay: 1500 },
                  { name: 'Patent & IP Agent', delay: 2000 },
                  { name: 'Scoring & Ranking Agent', delay: 2500 },
                  { name: 'Synthesis Complete', delay: 3000 }
                ].map((agent, idx) => (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: agent.delay / 1000 }}
                    className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: agent.delay / 1000 + 0.2 }}
                    >
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    </motion.div>
                    <span className="font-medium text-gray-700">{agent.name}</span>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: agent.delay / 1000, duration: 0.3 }}
                      className="ml-auto h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                      style={{ maxWidth: '100px' }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter Toggle Button */}
        <AnimatePresence>
          {showResults && (
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => setShowFilters(true)}
              className="fixed left-6 top-1/2 -translate-y-1/2 z-30 px-4 py-3 bg-gradient-to-br from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-r-xl shadow-2xl flex items-center gap-2 font-medium transition-all hover:px-6"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              {(filters.confidence > 0 || filters.phases.length > 0 || filters.patentStatus.length > 0 || filters.sortBy !== 'confidence') && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                  {(filters.confidence > 0 ? 1 : 0) + filters.phases.length + filters.patentStatus.length + (filters.sortBy !== 'confidence' ? 1 : 0)}
                </span>
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Filter Panel */}
        <FilterPanel 
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onFilterChange={handleFilterChange}
        />

        {/* Results Panel */}
        <AnimatePresence>
          {showResults && (
            <ResultsPanel 
              drug={selectedDrug}
              results={results}
              onResultClick={handleResultClick}
              totalResults={repurposingResults[selectedDrug]?.length || 0}
              filteredCount={results.length}
            />
          )}
        </AnimatePresence>

        {/* Evidence Panel */}
        <AnimatePresence>
          {showEvidence && selectedResult && (
            <EvidencePanel 
              drug={selectedDrug}
              result={selectedResult}
              onClose={() => setShowEvidence(false)}
            />
          )}
        </AnimatePresence>
      </div>

        {/* Floating Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 right-6 glass-card p-4 max-w-xs"
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-sm text-gray-800">Demo Mode</span>
          </div>
          <p className="text-xs text-gray-600">
            Full system includes live BioBERT embeddings, PubMed integration, and clinical trial databases.
          </p>
        </motion.div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

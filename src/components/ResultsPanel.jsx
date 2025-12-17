import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import debounce from 'lodash.debounce';
import { TrendingUp, Award, BarChart3, CheckCircle, Search, X, GitCompare, LayoutGrid, CircleDot } from 'lucide-react';
import ComparisonTable from './ComparisonTable';
import BubbleChartView from './BubbleChartView';
import SkeletonLoader, { MetricSkeletonLoader } from './SkeletonLoader';

export default function ResultsPanel({ drug, results, onResultClick, totalResults, filteredCount }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'bubble'
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Search examples and suggestions
  const searchExamples = [
    { text: 'Cancer Prevention', category: 'Disease', icon: '🎯' },
    { text: 'Alzheimer', category: 'Disease', icon: '🧠' },
    { text: 'AMPK Activation', category: 'Mechanism', icon: '⚡' },
    { text: 'Cardiovascular', category: 'Disease', icon: '❤️' },
    { text: 'Obesity', category: 'Disease', icon: '⚖️' },
    { text: 'neuroprotection', category: 'Effect', icon: '🛡️' },
    { text: 'inflammation', category: 'Mechanism', icon: '🔥' },
    { text: 'PCOS', category: 'Disease', icon: '🔬' }
  ];
  
  // Debounced search
  const debouncedSearch = useCallback(
    debounce((value) => {
      setDebouncedSearchTerm(value);
      setIsSearching(false);
      if (value) {
        const count = results.filter(result =>
          result.disease.toLowerCase().includes(value.toLowerCase()) ||
          result.drivingEffect.toLowerCase().includes(value.toLowerCase()) ||
          result.mechanism.toLowerCase().includes(value.toLowerCase())
        ).length;
        toast.success(`Found ${count} result${count !== 1 ? 's' : ''}`, { duration: 2000 });
      }
    }, 500),
    [results]
  );

  useEffect(() => {
    if (searchTerm) {
      setIsSearching(true);
      debouncedSearch(searchTerm);
    } else {
      setDebouncedSearchTerm('');
      setIsSearching(false);
    }
  }, [searchTerm, debouncedSearch]);

  // Filter results based on debounced search term
  const searchFilteredResults = results.filter(result =>
    result.disease.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    result.drivingEffect.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
    result.mechanism.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const displayResults = searchFilteredResults;
  const avgConfidence = displayResults.length > 0 
    ? displayResults.reduce((sum, r) => sum + r.confidence, 0) / displayResults.length 
    : 0;
  const highConfCount = displayResults.filter(r => r.confidence > 0.8).length;

  const handleComparisonToggle = (result) => {
    if (selectedForComparison.find(r => r.disease === result.disease)) {
      setSelectedForComparison(selectedForComparison.filter(r => r.disease !== result.disease));
      toast.success('Removed from comparison', { duration: 2000 });
    } else {
      if (selectedForComparison.length < 5) {
        setSelectedForComparison([...selectedForComparison, result]);
        toast.success(`Added to comparison (${selectedForComparison.length + 1}/5)`, { duration: 2000 });
      } else {
        toast.error('Maximum 5 items for comparison', { duration: 3000 });
      }
    }
  };

  const isSelectedForComparison = (result) => {
    return selectedForComparison.find(r => r.disease === result.disease);
  };

  // Filter search suggestions based on query
  const filteredSuggestions = searchTerm.length > 0
    ? searchExamples.filter(ex => 
        ex.text.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : searchExamples;

  const handleSearchFocus = () => {
    setShowSearchSuggestions(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchSuggestions(false), 200);
  };

  const handleSuggestionClick = (text) => {
    setSearchTerm(text);
    setShowSearchSuggestions(false);
    toast.success(`Searching for "${text}"`, { duration: 2000 });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        {/* Success Message with Search */}
        <motion.div
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="glass-card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
          style={{ overflow: 'visible', marginBottom: showSearchSuggestions ? '420px' : '1.5rem' }}
        >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h3 className="text-xl font-bold text-green-900">Analysis Complete!</h3>
              <p className="text-green-700">
                Found {totalResults || results.length} promising repurposing opportunities for {drug}
                {filteredCount !== undefined && filteredCount < totalResults && (
                  <span className="ml-1 text-sm">
                    ({filteredCount} after filters)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Search Bar with Suggestions */}
        <div className="relative" style={{ position: 'relative', zIndex: 50 }}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            placeholder="Try: 'Cancer Prevention', 'AMPK Activation', 'Cardiovascular'..."
            className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all bg-white text-gray-800 font-medium"
          />
          {searchTerm && (
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4 text-gray-500" />
            </motion.button>
          )}
          
          {/* Inline Dropdown - Not Portal */}
          <AnimatePresence>
            {showSearchSuggestions && filteredSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-green-300 rounded-xl shadow-2xl overflow-hidden"
                style={{ zIndex: 100 }}
              >
                <div className="p-2">
                  <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                    {searchTerm ? 'Matching Suggestions' : 'Try Searching For'}
                  </div>
                  <div className="space-y-1">
                    {filteredSuggestions.slice(0, 6).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSuggestionClick(suggestion.text);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{suggestion.icon}</span>
                          <span className="text-gray-800 font-medium group-hover:text-green-700 transition-colors">
                            {suggestion.text}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full group-hover:bg-green-100 group-hover:text-green-700 transition-colors">
                          {suggestion.category}
                        </span>
                      </button>
                    ))}
                  </div>
                  {searchTerm && filteredSuggestions.length === 0 && (
                    <div className="px-3 py-6 text-center">
                      <p className="text-gray-500 text-sm mb-2">No suggestions found</p>
                      <p className="text-xs text-gray-400">Try: Cancer, AMPK, Cardiovascular, or Obesity</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

          {searchTerm && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-gray-600"
            >
              Showing {displayResults.length} of {results.length} results
            </motion.p>
          )}
        </motion.div>

        {/* Metrics */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: TrendingUp, label: 'Candidates Found', value: displayResults.length, color: 'blue' },
          { icon: Award, label: 'High Confidence', value: highConfCount, color: 'green' },
          { icon: BarChart3, label: 'Avg Confidence', value: `${(avgConfidence * 100).toFixed(0)}%`, color: 'purple' }
        ].map((metric, idx) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            className="glass-card p-6 text-center"
          >
            <metric.icon className={`w-12 h-12 mx-auto mb-3 text-${metric.color}-600`} />
            <div className={`text-4xl font-bold text-${metric.color}-600 mb-2`}>
              {metric.value}
            </div>
            <div className="text-sm font-semibold text-gray-600">{metric.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Results Header */}
      <div className="glass-card p-8 mb-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              Step 2: Ranked Repurposing Opportunities
            </h2>
            <p className="text-gray-600">
              {comparisonMode ? 'Select up to 5 results to compare' : 'Click any result to view detailed evidence and reasoning'}
            </p>
          </div>
          <div className="flex gap-3">
            <div className="flex bg-gray-200 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-md font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode('bubble')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${
                  viewMode === 'bubble'
                    ? 'bg-white text-blue-600 shadow-md font-semibold'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <CircleDot className="w-4 h-4" />
                Bubble
              </button>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setComparisonMode(!comparisonMode);
                if (comparisonMode) setSelectedForComparison([]);
              }}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                comparisonMode
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <GitCompare className="w-5 h-5" />
              {comparisonMode ? 'Exit Comparison' : 'Compare Mode'}
            </motion.button>
            {selectedForComparison.length >= 2 && (
              <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setComparisonMode(true)}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-medium shadow-lg flex items-center gap-2"
              >
                <BarChart3 className="w-5 h-5" />
                View Comparison ({selectedForComparison.length})
              </motion.button>
            )}
          </div>
        </div>
        {selectedForComparison.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200"
          >
            <p className="text-sm font-medium text-blue-900 mb-2">
              Selected for comparison: {selectedForComparison.length}/5
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedForComparison.map((result) => (
                <span
                  key={result.disease}
                  className="px-3 py-1 bg-white text-blue-700 rounded-full text-sm font-medium flex items-center gap-2 border border-blue-300"
                >
                  {result.disease}
                  <button
                    onClick={() => handleComparisonToggle(result)}
                    className="hover:bg-blue-100 rounded-full p-0.5 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Bubble Chart View */}
      {viewMode === 'bubble' && displayResults.length > 0 && (
        <BubbleChartView 
          results={displayResults}
          onResultClick={onResultClick}
        />
      )}

      {/* Results Grid */}
      {viewMode === 'grid' && (
        <AnimatePresence mode="popLayout">
          {displayResults.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="glass-card p-12 text-center"
          >
            <Search className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {displayResults.map((result, idx) => (
              <motion.div
                key={result.disease}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.02, x: 10 }}
                onClick={(e) => {
                  if (comparisonMode) {
                    e.stopPropagation();
                    handleComparisonToggle(result);
                  } else {
                    onResultClick(result);
                  }
                }}
                className={`glass-card p-6 cursor-pointer hover:shadow-2xl transition-all ${
                  isSelectedForComparison(result) ? 'ring-4 ring-blue-500 bg-blue-50' : ''
                }`}
              >
                {comparisonMode && (
                  <div className="absolute top-4 right-4">
                    <input
                      type="checkbox"
                      checked={isSelectedForComparison(result)}
                      onChange={() => handleComparisonToggle(result)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-6 h-6 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                )}
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl font-bold text-gray-400">#{idx + 1}</span>
                  <h3 className="text-2xl font-bold text-gray-800">{result.disease}</h3>
                </div>

                <div className="mb-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-lg border border-orange-200">
                    <span className="text-sm font-semibold text-orange-700">Key Mechanism:</span>
                    <span className="text-sm font-bold text-orange-900">{result.drivingEffect}</span>
                  </div>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{result.mechanism}</p>

                <div className="flex flex-wrap gap-3">
                  <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
                    📚 {result.evidence.publications} Publications
                  </div>
                  <div className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                    🏥 {result.evidence.trials} Clinical Trials
                  </div>
                  <div className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                    {result.evidence.phase}
                  </div>
                  <div className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                    ⚖️ {result.patentStatus}
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 text-center">
                <div className="mb-2 text-sm font-semibold text-gray-600">Confidence</div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: idx * 0.15 + 0.3, type: "spring" }}
                  className={`w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold ${
                    result.confidence > 0.8
                      ? 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                      : result.confidence > 0.7
                      ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white'
                      : 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white'
                  } shadow-lg`}
                >
                  {(result.confidence * 100).toFixed(0)}%
                </motion.div>
                <div className={`mt-2 text-xs font-bold ${
                  result.confidence > 0.8 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {result.confidence > 0.8 ? 'HIGH' : 'MEDIUM'}
                </div>
              </div>
            </div>
          </motion.div>
            ))}
          </div>
          )}
        </AnimatePresence>
      )}

        {/* Comparison Table Modal */}
        <AnimatePresence>
          {comparisonMode && selectedForComparison.length >= 2 && (
            <ComparisonTable
              results={selectedForComparison}
              onClose={() => setComparisonMode(false)}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Filter, X, ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function FilterPanel({ onFilterChange, isOpen, onClose }) {
  const [confidence, setConfidence] = useState(0);
  const [selectedPhases, setSelectedPhases] = useState([]);
  const [selectedPatentStatus, setSelectedPatentStatus] = useState([]);
  const [sortBy, setSortBy] = useState('confidence');

  const phases = ['Phase 1', 'Phase 2', 'Phase 2/3', 'Phase 3', 'Standard of Care', 'Phase 3 (Completed)'];
  const patentStatuses = ['Expired (Generic)', 'Generic', 'Generic (some formulations protected)'];

  const handlePhaseToggle = (phase) => {
    const updated = selectedPhases.includes(phase)
      ? selectedPhases.filter(p => p !== phase)
      : [...selectedPhases, phase];
    setSelectedPhases(updated);
    applyFilters({ phases: updated });
  };

  const handlePatentToggle = (status) => {
    const updated = selectedPatentStatus.includes(status)
      ? selectedPatentStatus.filter(s => s !== status)
      : [...selectedPatentStatus, status];
    setSelectedPatentStatus(updated);
    applyFilters({ patentStatus: updated });
  };

  const handleConfidenceChange = (e) => {
    const value = parseInt(e.target.value);
    setConfidence(value);
    applyFilters({ confidence: value });
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setSortBy(value);
    applyFilters({ sortBy: value });
  };

  const applyFilters = (updates) => {
    onFilterChange({
      confidence: updates.confidence !== undefined ? updates.confidence : confidence,
      phases: updates.phases !== undefined ? updates.phases : selectedPhases,
      patentStatus: updates.patentStatus !== undefined ? updates.patentStatus : selectedPatentStatus,
      sortBy: updates.sortBy !== undefined ? updates.sortBy : sortBy
    });
  };

  const handleReset = () => {
    setConfidence(0);
    setSelectedPhases([]);
    setSelectedPatentStatus([]);
    setSortBy('confidence');
    onFilterChange({
      confidence: 0,
      phases: [],
      patentStatus: [],
      sortBy: 'confidence'
    });
    toast.success('Filters reset', { duration: 2000 });
  };

  const activeFiltersCount = 
    (confidence > 0 ? 1 : 0) + 
    selectedPhases.length + 
    selectedPatentStatus.length +
    (sortBy !== 'confidence' ? 1 : 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Filter Panel */}
          <motion.div
            initial={{ x: -400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 bottom-0 w-96 bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-r border-purple-500/20 z-50 overflow-y-auto"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-lg">
                    <SlidersHorizontal className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Filters</h2>
                    {activeFiltersCount > 0 && (
                      <p className="text-sm text-purple-400">{activeFiltersCount} active</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Confidence Threshold */}
              <div className="space-y-3">
                <label className="block">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-300">Minimum Confidence</span>
                    <span className="text-lg font-bold text-purple-400">{confidence}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={confidence}
                    onChange={handleConfidenceChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, rgb(168 85 247) 0%, rgb(168 85 247) ${confidence}%, rgb(55 65 81) ${confidence}%, rgb(55 65 81) 100%)`
                    }}
                  />
                </label>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Clinical Phase Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                  Clinical Phase
                </h3>
                <div className="space-y-2">
                  {phases.map((phase) => (
                    <label
                      key={phase}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPhases.includes(phase)}
                        onChange={() => handlePhaseToggle(phase)}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {phase}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Patent Status Filter */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                  Patent Status
                </h3>
                <div className="space-y-2">
                  {patentStatuses.map((status) => (
                    <label
                      key={status}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPatentStatus.includes(status)}
                        onChange={() => handlePatentToggle(status)}
                        className="w-4 h-4 text-purple-500 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                        {status}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-purple-500 to-blue-500 rounded-full"></div>
                  Sort By
                </h3>
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                >
                  <option value="confidence">Confidence Score (High to Low)</option>
                  <option value="confidenceAsc">Confidence Score (Low to High)</option>
                  <option value="publications">Publications (Most to Least)</option>
                  <option value="trials">Clinical Trials (Most to Least)</option>
                  <option value="roi">ROI (High to Low)</option>
                  <option value="marketSize">Market Size (Largest First)</option>
                  <option value="timeToMarket">Time to Market (Fastest First)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={handleReset}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors font-medium"
                >
                  Reset All
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-purple-500/25"
                >
                  Apply Filters
                </button>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg"
                >
                  <p className="text-sm text-purple-300 font-medium mb-2">Active Filters:</p>
                  <div className="space-y-1 text-xs text-gray-400">
                    {confidence > 0 && <p>• Confidence ≥ {confidence}%</p>}
                    {selectedPhases.length > 0 && <p>• Phases: {selectedPhases.length} selected</p>}
                    {selectedPatentStatus.length > 0 && <p>• Patent Status: {selectedPatentStatus.length} selected</p>}
                    {sortBy !== 'confidence' && <p>• Sorted by: {sortBy}</p>}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

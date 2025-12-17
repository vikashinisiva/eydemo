import { motion } from 'framer-motion';
import { X, Trophy, TrendingUp, FileText, Shield, DollarSign, Clock } from 'lucide-react';

export default function ComparisonTable({ results, onClose }) {
  if (results.length === 0) return null;

  const metrics = [
    { key: 'confidence', label: 'Confidence', format: (v) => `${(v * 100).toFixed(1)}%`, icon: Trophy },
    { key: 'evidence.publications', label: 'Publications', format: (v) => v, icon: FileText },
    { key: 'evidence.trials', label: 'Clinical Trials', format: (v) => v, icon: FileText },
    { key: 'evidence.phase', label: 'Phase', format: (v) => v, icon: Clock },
    { key: 'mechanismScore', label: 'Mechanism Score', format: (v) => `${((v || 0.92) * 100).toFixed(0)}%`, icon: TrendingUp },
    { key: 'safetyScore', label: 'Safety Score', format: (v) => `${((v || 0.88) * 100).toFixed(0)}%`, icon: Shield },
    { key: 'efficacyScore', label: 'Efficacy Score', format: (v) => `${((v || 0.79) * 100).toFixed(0)}%`, icon: TrendingUp },
    { key: 'roi', label: 'ROI', format: (v) => `${v || 0}%`, icon: DollarSign },
    { key: 'marketSize', label: 'Market Size', format: (v) => v || 'N/A', icon: DollarSign },
    { key: 'timeToMarket', label: 'Time to Market', format: (v) => v || 'N/A', icon: Clock },
    { key: 'patentStatus', label: 'Patent Status', format: (v) => v, icon: Shield },
    { key: 'commercialViability', label: 'Commercial Viability', format: (v) => v, icon: DollarSign }
  ];

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const getBestValue = (metricKey) => {
    if (metricKey.includes('confidence') || metricKey.includes('Score') || metricKey === 'roi') {
      return Math.max(...results.map(r => {
        const value = getNestedValue(r, metricKey);
        return typeof value === 'number' ? value : 0;
      }));
    }
    if (metricKey.includes('publications') || metricKey.includes('trials')) {
      return Math.max(...results.map(r => {
        const value = getNestedValue(r, metricKey);
        return typeof value === 'number' ? value : 0;
      }));
    }
    return null;
  };

  const isBestValue = (result, metricKey) => {
    const value = getNestedValue(result, metricKey);
    const bestValue = getBestValue(metricKey);
    return bestValue !== null && value === bestValue;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="glass-card max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Side-by-Side Comparison</h2>
              <p className="text-blue-100">Comparing {results.length} repurposing candidates</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </motion.button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto p-6">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-100 to-gray-50 sticky top-0 z-10">
                  <th className="p-4 text-left font-bold text-gray-700 border-b-2 border-gray-300 min-w-[200px]">
                    Metric
                  </th>
                  {results.map((result, idx) => (
                    <th
                      key={idx}
                      className="p-4 text-center font-bold text-gray-700 border-b-2 border-gray-300 min-w-[180px]"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="text-lg">{result.disease}</div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.confidence > 0.8
                            ? 'bg-green-100 text-green-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {(result.confidence * 100).toFixed(0)}% Confidence
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {metrics.map((metric, metricIdx) => (
                  <motion.tr
                    key={metric.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: metricIdx * 0.05 }}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-4 font-semibold text-gray-700 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <metric.icon className="w-4 h-4 text-gray-500" />
                        {metric.label}
                      </div>
                    </td>
                    {results.map((result, resultIdx) => {
                      const value = getNestedValue(result, metric.key);
                      const displayValue = metric.format(value);
                      const isBest = isBestValue(result, metric.key);

                      return (
                        <td
                          key={resultIdx}
                          className={`p-4 text-center font-medium transition-all ${
                            isBest
                              ? 'bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 font-bold'
                              : 'text-gray-700'
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            {isBest && <Trophy className="w-4 h-4 text-green-600" />}
                            {displayValue}
                          </div>
                        </td>
                      );
                    })}
                  </motion.tr>
                ))}

                {/* Additional Info Rows */}
                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      Driving Effect
                    </div>
                  </td>
                  {results.map((result, idx) => (
                    <td key={idx} className="p-4 text-center text-sm text-gray-600">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                        {result.drivingEffect}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-4 font-semibold text-gray-700 bg-gray-50">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      Mechanism
                    </div>
                  </td>
                  {results.map((result, idx) => (
                    <td key={idx} className="p-4 text-xs text-gray-600 text-left">
                      {result.mechanism}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 text-center">
          <p className="text-sm text-gray-600">
            <Trophy className="w-4 h-4 inline mr-1 text-green-600" />
            Green highlights indicate best-in-class performance for each metric
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

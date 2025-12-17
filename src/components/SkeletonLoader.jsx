import { motion } from 'framer-motion';

export default function SkeletonLoader({ count = 3 }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1 space-y-4">
              {/* Rank and Title */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />
                <div className="w-48 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />
              </div>

              {/* Mechanism Badge */}
              <div className="w-64 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />

              {/* Description Lines */}
              <div className="space-y-2">
                <div className="w-full h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
                <div className="w-3/4 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer" />
              </div>

              {/* Badges */}
              <div className="flex gap-3">
                <div className="w-32 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />
                <div className="w-32 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />
                <div className="w-24 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />
                <div className="w-28 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg shimmer" />
              </div>
            </div>

            {/* Confidence Circle */}
            <div className="flex-shrink-0 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 shimmer mx-auto mb-2" />
              <div className="w-12 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer mx-auto" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export function MetricSkeletonLoader() {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-8">
      {[...Array(3)].map((_, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="glass-card p-6 text-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full shimmer mx-auto mb-3" />
          <div className="w-20 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer mx-auto mb-2" />
          <div className="w-32 h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded shimmer mx-auto" />
        </motion.div>
      ))}
    </div>
  );
}

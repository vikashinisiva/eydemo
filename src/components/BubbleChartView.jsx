import { motion } from 'framer-motion';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, Cell } from 'recharts';
import { DollarSign, Shield, TrendingUp } from 'lucide-react';

export default function BubbleChartView({ results, onResultClick }) {
  // Prepare data for bubble chart
  const bubbleData = results.map(result => ({
    name: result.disease,
    roi: result.roi || 0,
    safety: (result.safetyScore || 0.88) * 100,
    marketSize: parseFloat((result.marketSize || '0').replace(/[$B]/g, '')),
    confidence: result.confidence * 100,
    result: result
  }));

  const getColorByConfidence = (confidence) => {
    if (confidence >= 80) return '#10b981'; // green
    if (confidence >= 70) return '#3b82f6'; // blue
    return '#f59e0b'; // orange
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-xl border-2 border-gray-200">
          <p className="font-bold text-lg text-gray-800 mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">ROI:</span> {data.roi}%
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Safety:</span> {data.safety.toFixed(0)}%
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Market Size:</span> ${data.marketSize}B
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Confidence:</span> {data.confidence.toFixed(0)}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 mb-6"
    >
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-3">
          <TrendingUp className="w-7 h-7 text-purple-600" />
          ROI vs Safety Risk Analysis
        </h3>
        <p className="text-gray-600">
          Bubble size = Market size | Color indicates confidence level
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900">Total Market</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            ${bubbleData.reduce((sum, d) => sum + d.marketSize, 0).toFixed(1)}B
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-semibold text-green-900">Avg ROI</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {(bubbleData.reduce((sum, d) => sum + d.roi, 0) / bubbleData.length).toFixed(0)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-semibold text-purple-900">Avg Safety</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {(bubbleData.reduce((sum, d) => sum + d.safety, 0) / bubbleData.length).toFixed(0)}%
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-sm font-semibold text-orange-900">High ROI Count</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {bubbleData.filter(d => d.roi > 300).length}
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: 500 }}>
        <ResponsiveContainer>
          <ScatterChart
            margin={{ top: 20, right: 20, bottom: 70, left: 70 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              type="number"
              dataKey="roi"
              name="ROI"
              unit="%"
              label={{ value: 'Return on Investment (%)', position: 'bottom', offset: 50, style: { fontSize: 14, fontWeight: 'bold' } }}
              stroke="#6b7280"
            />
            <YAxis
              type="number"
              dataKey="safety"
              name="Safety"
              unit="%"
              label={{ value: 'Safety Score (%)', angle: -90, position: 'left', offset: 50, style: { fontSize: 14, fontWeight: 'bold' } }}
              stroke="#6b7280"
            />
            <ZAxis
              type="number"
              dataKey="marketSize"
              range={[400, 2000]}
              name="Market Size"
              unit="B"
            />
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
            <Scatter
              name="Repurposing Candidates"
              data={bubbleData}
              onClick={(data) => {
                if (onResultClick && data.result) {
                  onResultClick(data.result);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              {bubbleData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getColorByConfidence(entry.confidence)}
                  opacity={0.7}
                  stroke={getColorByConfidence(entry.confidence)}
                  strokeWidth={2}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-sm text-gray-700">High Confidence (≥80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500"></div>
          <span className="text-sm text-gray-700">Medium Confidence (70-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span className="text-sm text-gray-700">Lower Confidence (&lt;70%)</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">💡 Investment Insight:</span> Candidates in the top-right quadrant 
          (high ROI + high safety) represent optimal risk-reward opportunities. Larger bubbles indicate 
          bigger market opportunities.
        </p>
      </div>
    </motion.div>
  );
}

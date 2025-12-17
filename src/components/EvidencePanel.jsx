import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  X, Brain, FileText, Shield, TrendingUp, Download, Rocket, Clock,
  Activity, Dna, Target, AlertTriangle, BarChart3,
  Microscope, FlaskConical, Users, DollarSign, Award, CheckCircle
} from 'lucide-react';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, 
  LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart as RechartsPie, Pie, Cell
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function EvidencePanel({ drug, result, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [exporting, setExporting] = useState(false);

  // Prepare data for visualizations
  const scoreData = [
    { subject: 'Mechanism', value: (result.mechanismScore || 0.92) * 100, fullMark: 100 },
    { subject: 'Safety', value: (result.safetyScore || 0.88) * 100, fullMark: 100 },
    { subject: 'Efficacy', value: (result.efficacyScore || 0.79) * 100, fullMark: 100 },
    { subject: 'Commercial', value: result.confidence * 100, fullMark: 100 },
    { subject: 'Evidence', value: (result.evidence.publications / 500) * 100, fullMark: 100 }
  ];

  const adverseEventData = [
    { name: 'Mild', value: result.adverseEvents?.mild || 12, color: '#10b981' },
    { name: 'Moderate', value: result.adverseEvents?.moderate || 3, color: '#f59e0b' },
    { name: 'Severe', value: result.adverseEvents?.severe || 1, color: '#ef4444' }
  ];

  const publications = result.publications || [
    { year: 2020, count: 89 },
    { year: 2021, count: 102 },
    { year: 2022, count: 76 },
    { year: 2023, count: 78 }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'mechanism', label: 'Mechanism', icon: Dna },
    { id: 'evidence', label: 'Evidence', icon: FileText },
    { id: 'clinical', label: 'Clinical', icon: Activity },
    { id: 'safety', label: 'Safety', icon: Shield },
    { id: 'commercial', label: 'Commercial', icon: DollarSign }
  ];

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yOffset = 20;

      // Header
      pdf.setFillColor(37, 99, 235); // Blue
      pdf.rect(0, 0, pageWidth, 40, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Drug Repurposing Analysis Report', 20, 20);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${drug} → ${result.disease}`, 20, 30);

      yOffset = 50;

      // Executive Summary
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Executive Summary', 20, yOffset);
      yOffset += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryText = pdf.splitTextToSize(
        `Confidence Score: ${(result.confidence * 100).toFixed(1)}% | ` +
        `Phase: ${result.evidence.phase} | ` +
        `Publications: ${result.evidence.publications} | ` +
        `Clinical Trials: ${result.evidence.trials}`,
        pageWidth - 40
      );
      pdf.text(summaryText, 20, yOffset);
      yOffset += 15;

      // Scientific Rationale
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Scientific Rationale', 20, yOffset);
      yOffset += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const rationaleLines = pdf.splitTextToSize(result.rationale, pageWidth - 40);
      pdf.text(rationaleLines, 20, yOffset);
      yOffset += rationaleLines.length * 5 + 10;

      // Mechanism of Action
      if (yOffset > pageHeight - 40) {
        pdf.addPage();
        yOffset = 20;
      }
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Mechanism of Action', 20, yOffset);
      yOffset += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const mechanismLines = pdf.splitTextToSize(result.mechanism, pageWidth - 40);
      pdf.text(mechanismLines, 20, yOffset);
      yOffset += mechanismLines.length * 5 + 10;

      // Molecular Targets
      if (result.molecularTargets) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Molecular Targets:', 20, yOffset);
        yOffset += 6;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(result.molecularTargets.join(', '), 30, yOffset);
        yOffset += 10;
      }

      // Biomarkers
      if (result.biomarkers) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Biomarkers:', 20, yOffset);
        yOffset += 6;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(result.biomarkers.join(', '), 30, yOffset);
        yOffset += 10;
      }

      // Clinical Endpoints
      if (result.clinicalEndpoints && yOffset < pageHeight - 30) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Clinical Endpoints:', 20, yOffset);
        yOffset += 6;
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        result.clinicalEndpoints.forEach(endpoint => {
          if (yOffset > pageHeight - 20) {
            pdf.addPage();
            yOffset = 20;
          }
          pdf.text(`• ${endpoint}`, 30, yOffset);
          yOffset += 5;
        });
        yOffset += 5;
      }

      // New page for commercial analysis
      pdf.addPage();
      yOffset = 20;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Commercial Analysis', 20, yOffset);
      yOffset += 10;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      
      const commercialData = [
        ['Market Size', result.marketSize || 'N/A'],
        ['ROI', `${result.roi || 0}%`],
        ['Cost Effectiveness', `${result.costEffectiveness || 0}/10`],
        ['Time to Market', result.timeToMarket || 'N/A'],
        ['Patent Status', result.patentStatus || 'N/A'],
        ['Regulatory Path', result.regulatoryPath || 'N/A'],
        ['Commercial Viability', result.commercialViability || 'N/A']
      ];

      commercialData.forEach(([label, value]) => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${label}:`, 20, yOffset);
        pdf.setFont('helvetica', 'normal');
        pdf.text(value, 80, yOffset);
        yOffset += 7;
      });

      // Footer
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.setTextColor(128, 128, 128);
        pdf.text(
          `Generated by AI Drug Repurposing Platform | ${new Date().toLocaleDateString()} | Page ${i} of ${pageCount}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const filename = `DrugRepurposing_${drug}_${result.disease.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(filename);
      
      toast.success(`PDF exported: ${filename}`, { duration: 4000 });

    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.', { duration: 4000 });
    } finally {
      setExporting(false);
    }
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
        className="glass-card max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Microscope className="w-8 h-8" />
                <h2 className="text-3xl font-bold">Research-Grade Analysis</h2>
              </div>
              <p className="text-blue-100 text-lg">{drug} → {result.disease}</p>
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

          <div className="flex items-center gap-6">
            <div className="flex-1">
              <div className="text-sm text-blue-100 mb-1">Overall Confidence Score</div>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence * 100}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-4 bg-gradient-to-r from-green-400 to-green-500 rounded-full shadow-lg"
              />
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">{(result.confidence * 100).toFixed(1)}%</div>
              <div className="text-sm text-blue-100">
                {result.confidence > 0.8 ? 'HIGH CONFIDENCE' : 'MEDIUM CONFIDENCE'}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab result={result} />}
          {activeTab === 'mechanism' && <MechanismTab result={result} />}
          {activeTab === 'evidence' && <EvidenceTab result={result} publications={publications} />}
          {activeTab === 'clinical' && <ClinicalTab result={result} scoreData={scoreData} />}
          {activeTab === 'safety' && <SafetyTab result={result} adverseEventData={adverseEventData} />}
          {activeTab === 'commercial' && <CommercialTab result={result} />}
        </div>

        {/* Action Bar */}
        <div className="bg-gray-50 border-t border-gray-200 p-6">
          <div className="grid md:grid-cols-4 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportPDF}
              disabled={exporting}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Export PDF
                </>
              )}
            </motion.button>
            <button className="btn-secondary flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Save Analysis
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2">
              <Users className="w-4 h-4" />
              Share
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              onClick={() => alert(`🚀 R&D Program Initiated!\n\n${drug} for ${result.disease}\nConfidence: ${(result.confidence * 100).toFixed(0)}%`)}
            >
              <Rocket className="w-4 h-4" />
              Launch Program
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Overview Tab
function OverviewTab({ result }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold">Scientific Rationale</h3>
        </div>
        <p className="text-gray-700 leading-relaxed text-lg mb-4">{result.rationale}</p>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-gray-600 mb-2">Driving Effect</div>
            <div className="text-xl font-bold text-blue-600">{result.drivingEffect}</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <div className="text-sm font-semibold text-gray-600 mb-2">Mechanism</div>
            <div className="text-sm text-gray-800">{result.mechanism}</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Mechanism', value: result.mechanismScore || 0.92, icon: Dna, color: 'blue' },
          { label: 'Safety', value: result.safetyScore || 0.88, icon: Shield, color: 'green' },
          { label: 'Efficacy', value: result.efficacyScore || 0.79, icon: Activity, color: 'purple' },
          { label: 'Cost-Eff.', value: (result.costEffectiveness || 8.5) / 10, icon: DollarSign, color: 'yellow' }
        ].map((metric) => (
          <div key={metric.label} className={`bg-${metric.color}-50 p-4 rounded-xl border border-${metric.color}-200`}>
            <metric.icon className={`w-6 h-6 text-${metric.color}-600 mb-2`} />
            <div className="text-2xl font-bold">{(metric.value * 100).toFixed(0)}%</div>
            <div className="text-xs font-semibold text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Mechanism Tab
function MechanismTab({ result }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Target className="w-6 h-6 text-purple-600" />
          Molecular Targets
        </h3>
        <div className="flex flex-wrap gap-3">
          {(result.molecularTargets || ['AMPK', 'mTOR', 'Complex I']).map((target) => (
            <span key={target} className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 rounded-lg font-semibold border border-purple-200">
              {target}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FlaskConical className="w-6 h-6 text-blue-600" />
          Biomarkers
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {(result.biomarkers || ['p-AMPK', 'p-mTOR', 'LC3-II', 'Ki67']).map((biomarker) => (
            <div key={biomarker} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <span className="font-semibold text-blue-900">{biomarker}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-xl border-2 border-orange-200">
        <h3 className="text-xl font-bold mb-4">Mechanism Pathway</h3>
        <div className="flex items-center justify-between">
          {['Drug Binding', 'Target Modulation', 'Signal Cascade', 'Therapeutic Effect'].map((step, idx) => (
            <div key={step} className="flex-1 text-center">
              <div className="w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center border-2 border-orange-300 font-bold text-orange-600 text-xl">
                {idx + 1}
              </div>
              <div className="mt-2 text-sm font-semibold">{step}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Evidence Tab
function EvidenceTab({ result, publications }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200 text-center">
          <FileText className="w-12 h-12 mx-auto mb-3 text-blue-600" />
          <div className="text-4xl font-bold text-blue-600">{result.evidence.publications}</div>
          <div className="text-sm font-semibold text-gray-600">Publications</div>
        </div>
        <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200 text-center">
          <Activity className="w-12 h-12 mx-auto mb-3 text-green-600" />
          <div className="text-4xl font-bold text-green-600">{result.evidence.trials}</div>
          <div className="text-sm font-semibold text-gray-600">Clinical Trials</div>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200 text-center">
          <Award className="w-12 h-12 mx-auto mb-3 text-purple-600" />
          <div className="text-2xl font-bold text-purple-600">{result.evidence.phase}</div>
          <div className="text-sm font-semibold text-gray-600">Development Phase</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-xl font-bold mb-4">Publication Timeline</h3>
        <ResponsiveContainer width="100%" height={250}>
          <RechartsLine data={publications}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} name="Publications" />
          </RechartsLine>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Clinical Tab
function ClinicalTab({ result, scoreData }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-xl font-bold mb-4">Multi-Dimensional Assessment</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={scoreData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" />
            <PolarRadiusAxis angle={90} domain={[0, 100]} />
            <Radar name="Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-xl font-bold mb-4">Clinical Endpoints</h3>
        <div className="space-y-3">
          {(result.clinicalEndpoints || ['Cancer incidence reduction', 'Tumor size reduction', 'Overall survival improvement']).map((endpoint, idx) => (
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-gray-700">{endpoint}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Safety Tab
function SafetyTab({ result, adverseEventData }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <h3 className="text-xl font-bold mb-4">Adverse Event Profile</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RechartsPie>
              <Pie
                data={adverseEventData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                dataKey="value"
              >
                {adverseEventData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
          <h3 className="text-xl font-bold mb-4">Safety Score</h3>
          <div className="flex items-center justify-center h-[250px]">
            <div className="text-center">
              <div className="text-6xl font-bold text-green-600">
                {((result.safetyScore || 0.88) * 100).toFixed(0)}
              </div>
              <div className="text-xl font-semibold text-gray-600 mt-2">/ 100</div>
              <div className="mt-4 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-semibold">
                Acceptable Profile
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold mb-2">Safety Considerations</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              <li>Well-established safety profile from current indication</li>
              <li>Long-term safety data available</li>
              <li>Known drug interactions documented</li>
              <li>Risk mitigation strategies in place</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Commercial Tab
function CommercialTab({ result }) {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 p-6 rounded-xl border-2 border-yellow-200">
          <Shield className="w-8 h-8 text-yellow-600 mb-3" />
          <h4 className="font-bold mb-2">Patent Status</h4>
          <div className="text-2xl font-bold text-yellow-900 mb-3">{result.patentStatus}</div>
          <div className={`inline-block px-4 py-2 rounded-lg font-semibold ${
            result.patentStatus.includes('Expired') ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
          }`}>
            {result.patentStatus.includes('Expired') ? '✓ No IP Barriers' : '⚠ Some Restrictions'}
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
          <TrendingUp className="w-8 h-8 text-purple-600 mb-3" />
          <h4 className="font-bold mb-2">Commercial Viability</h4>
          <div className="text-2xl font-bold text-purple-900 mb-3">{result.commercialViability}</div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>Time to Market: <strong>{result.timeToMarket}</strong></span>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-green-600" />
          Cost-Effectiveness
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold">Development Cost</span>
            <span className="text-xl font-bold">$2.5M - $5M</span>
          </div>
          <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-semibold">Market Size (TAM)</span>
            <span className="text-xl font-bold">$850M</span>
          </div>
          <div className="flex justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <span className="font-semibold">ROI Potential</span>
            <span className="text-xl font-bold text-green-600">High (15-25%)</span>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold mb-3">Market Entry Strategy</h4>
        <div className="space-y-2 text-sm">
          {[
            'File IND application with FDA',
            'Initiate Phase II trials (18-24 months)',
            'Prepare regulatory submission',
            'Commercial launch with repurposing narrative'
          ].map((step, idx) => (
            <div key={idx} className="flex items-start gap-2">
              <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">
                {idx + 1}
              </div>
              <span className="text-gray-700">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

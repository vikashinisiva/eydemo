// Real-time pharmaceutical data integration
// Combines PubChem, PubMed, ClinicalTrials.gov, and OpenFDA APIs

const PUBCHEM_BASE = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
const PUBMED_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const CLINICAL_TRIALS_BASE = 'https://clinicaltrials.gov/api/v2';
const OPENFDA_BASE = 'https://api.fda.gov/drug';

// Cache utilities to prevent rate limiting
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

const cacheGet = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (e) {
    console.error('Cache get error:', e);
  }
  return null;
};

const cacheSet = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (e) {
    console.error('Cache set error:', e);
  }
};

// Fetch PubChem drug information
const fetchPubChemData = async (drug) => {
  try {
    const response = await fetch(`${PUBCHEM_BASE}/compound/name/${encodeURIComponent(drug)}/JSON`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.PC_Compounds?.[0] || null;
  } catch (error) {
    console.error('PubChem API error:', error);
    return null;
  }
};

// Fetch PubMed publications
const fetchPubMedData = async (drug) => {
  try {
    const searchUrl = `${PUBMED_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(drug)}+repurposing&retmode=json&retmax=100`;
    const response = await fetch(searchUrl);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      count: parseInt(data.esearchresult?.count || 0),
      ids: data.esearchresult?.idlist || []
    };
  } catch (error) {
    console.error('PubMed API error:', error);
    return null;
  }
};

// Fetch Clinical Trials data
const fetchClinicalTrialsData = async (drug) => {
  try {
    const response = await fetch(`${CLINICAL_TRIALS_BASE}/studies?query.intr=${encodeURIComponent(drug)}&format=json&pageSize=100`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      total: data.totalCount || 0,
      studies: data.studies || []
    };
  } catch (error) {
    console.error('ClinicalTrials API error:', error);
    return null;
  }
};

// Fetch OpenFDA adverse events
const fetchOpenFDAData = async (drug) => {
  try {
    const response = await fetch(`${OPENFDA_BASE}/event.json?search=patient.drug.medicinalproduct:"${encodeURIComponent(drug)}"&limit=100`);
    if (!response.ok) return null;
    const data = await response.json();
    return {
      total: data.meta?.results?.total || 0,
      events: data.results || []
    };
  } catch (error) {
    console.error('OpenFDA API error:', error);
    return null;
  }
};

// Main function: Fetch data from all APIs in parallel
export const analyzeRepurposingRealTime = async (drug) => {
  const cacheKey = `drug_analysis_${drug.toLowerCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached) {
    console.log('📦 Using cached data for:', drug);
    return cached;
  }

  console.log('🔍 Fetching real-time data for:', drug);

  try {
    // Fetch all APIs in parallel for faster response
    const [pubchem, pubmed, trials, adverse] = await Promise.all([
      fetchPubChemData(drug),
      fetchPubMedData(drug),
      fetchClinicalTrialsData(drug),
      fetchOpenFDAData(drug)
    ]);

    // Transform data to match UI format
    const results = {
      drug,
      timestamp: new Date().toISOString(),
      pubchem: pubchem ? {
        cid: pubchem.id?.id?.cid,
        molecularFormula: pubchem.props?.find(p => p.urn?.label === 'Molecular Formula')?.value?.sval,
        molecularWeight: pubchem.props?.find(p => p.urn?.label === 'Molecular Weight')?.value?.fval,
        iupacName: pubchem.props?.find(p => p.urn?.label === 'IUPAC Name')?.value?.sval
      } : null,
      pubmed: pubmed ? {
        publicationCount: pubmed.count,
        recentIds: pubmed.ids.slice(0, 10)
      } : null,
      clinicalTrials: trials ? {
        totalTrials: trials.total,
        activeTrials: trials.studies.filter(s => 
          s.protocolSection?.statusModule?.overallStatus === 'RECRUITING'
        ).length,
        phases: trials.studies.map(s => 
          s.protocolSection?.designModule?.phases
        ).flat().filter(Boolean)
      } : null,
      adverseEvents: adverse ? {
        totalReports: adverse.total,
        seriousEvents: adverse.events.filter(e => e.serious === '1').length,
        commonReactions: adverse.events
          .flatMap(e => e.patient?.reaction || [])
          .map(r => r.reactionmeddrapt)
          .filter(Boolean)
          .slice(0, 10)
      } : null
    };

    cacheSet(cacheKey, results);
    return results;

  } catch (error) {
    console.error('Error analyzing drug repurposing:', error);
    throw error;
  }
};

// Helper: Generate repurposing suggestions based on real data
export const generateRepurposingSuggestions = (apiResults) => {
  const suggestions = [];

  if (apiResults.pubmed?.publicationCount > 50) {
    suggestions.push({
      disease: 'Multiple therapeutic areas (based on publications)',
      confidence: Math.min(apiResults.pubmed.publicationCount / 10, 95),
      evidence: `${apiResults.pubmed.publicationCount} research publications found`,
      phase: 'Preclinical'
    });
  }

  if (apiResults.clinicalTrials?.totalTrials > 0) {
    const phases = apiResults.clinicalTrials.phases;
    const maxPhase = phases.includes('PHASE4') ? 'Phase 4' :
                     phases.includes('PHASE3') ? 'Phase 3' :
                     phases.includes('PHASE2') ? 'Phase 2' :
                     phases.includes('PHASE1') ? 'Phase 1' : 'Preclinical';
    
    suggestions.push({
      disease: 'Clinical investigation areas',
      confidence: 70 + (apiResults.clinicalTrials.activeTrials * 2),
      evidence: `${apiResults.clinicalTrials.totalTrials} clinical trials (${apiResults.clinicalTrials.activeTrials} active)`,
      phase: maxPhase
    });
  }

  return suggestions;
};

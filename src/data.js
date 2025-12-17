export const drugsData = {
  Metformin: {
    sideEffects: ['Glucose Lowering', 'Mitochondrial Modulation', 'AMPK Activation', 'GI Distress'],
    approvedFor: 'Type 2 Diabetes',
    description: 'First-line diabetes medication that improves insulin sensitivity'
  },
  Aspirin: {
    sideEffects: ['Antiplatelet Effect', 'Bleeding Tendency', 'COX Inhibition', 'GI Irritation'],
    approvedFor: 'Pain & Fever',
    description: 'Classic NSAID with anti-inflammatory and antiplatelet properties'
  },
  Amphetamine: {
    sideEffects: ['Dopamine Increase', 'Appetite Suppression', 'CNS Stimulation', 'Insomnia'],
    approvedFor: 'ADHD & Narcolepsy',
    description: 'CNS stimulant affecting neurotransmitter release'
  }
};

export const repurposingResults = {
  Metformin: [
    {
      disease: 'Cancer Prevention',
      confidence: 0.87,
      drivingEffect: 'AMPK Activation',
      mechanism: 'AMPK activation → inhibits mTOR pathway → reduces cancer cell proliferation',
      evidence: {
        trials: 2,
        publications: 345,
        phase: 'Phase 2'
      },
      patentStatus: 'Expired (Generic)',
      rationale: "Metformin's AMPK activation, a side effect in diabetes treatment, directly inhibits cancer cell growth through mTOR pathway suppression. Multiple epidemiological studies show reduced cancer incidence in diabetic patients taking metformin.",
      commercialViability: 'High',
      timeToMarket: '3-5 years',
      // Research-grade fields
      molecularTargets: ['AMPK', 'mTOR', 'Complex I', 'LKB1'],
      biomarkers: ['p-AMPK', 'p-mTOR', 'Ki67', 'LC3-II', 'p-S6K'],
      clinicalEndpoints: ['Cancer incidence', 'Tumor size reduction', 'Overall survival', 'Progression-free survival'],
      mechanismScore: 0.92,
      safetyScore: 0.88,
      efficacyScore: 0.79,
      adverseEvents: { mild: 12, moderate: 3, severe: 1 },
      publications: [
        { year: 2019, count: 42 },
        { year: 2020, count: 89 },
        { year: 2021, count: 112 },
        { year: 2022, count: 78 },
        { year: 2023, count: 24 }
      ],
      costEffectiveness: 8.5,
      marketSize: '$4.2B',
      roi: 320,
      regulatoryPath: 'FDA 505(b)(2)',
      competitiveAdvantage: 'First-in-class for cancer prevention'
    },
    {
      disease: "Alzheimer's Disease",
      confidence: 0.74,
      drivingEffect: 'Mitochondrial Modulation',
      mechanism: 'Mitochondrial modulation → neuroprotection → reduces oxidative stress',
      evidence: {
        trials: 1,
        publications: 178,
        phase: 'Phase 2/3'
      },
      patentStatus: 'Expired (Generic)',
      rationale: 'Mitochondrial dysfunction is a key feature of Alzheimer\'s disease. Metformin\'s ability to modulate mitochondrial function offers potential neuroprotective benefits by reducing oxidative stress and improving cellular energy metabolism.',
      commercialViability: 'Medium-High',
      timeToMarket: '5-7 years',
      molecularTargets: ['Complex I', 'PGC-1α', 'SIRT1', 'Tau protein'],
      biomarkers: ['Aβ42', 'p-Tau', 'MtDNA copy number', 'ROS levels', 'NAD+/NADH ratio'],
      clinicalEndpoints: ['MMSE score', 'CDR improvement', 'Brain atrophy rate', 'Cognitive decline'],
      mechanismScore: 0.78,
      safetyScore: 0.91,
      efficacyScore: 0.68,
      adverseEvents: { mild: 18, moderate: 5, severe: 0 },
      publications: [
        { year: 2019, count: 28 },
        { year: 2020, count: 45 },
        { year: 2021, count: 62 },
        { year: 2022, count: 35 },
        { year: 2023, count: 8 }
      ],
      costEffectiveness: 7.2,
      marketSize: '$8.9B',
      roi: 580,
      regulatoryPath: 'FDA 505(b)(2)',
      competitiveAdvantage: 'Repurposed generic with known safety profile'
    },
    {
      disease: 'Polycystic Ovary Syndrome',
      confidence: 0.65,
      drivingEffect: 'Glucose Regulation',
      mechanism: 'Improved insulin sensitivity → reduced androgens → symptom improvement',
      evidence: {
        trials: 3,
        publications: 256,
        phase: 'Phase 3'
      },
      patentStatus: 'Expired (Generic)',
      rationale: 'Insulin resistance is central to PCOS pathophysiology. Metformin\'s glucose-lowering effects improve insulin sensitivity, leading to reduced androgen levels and improved reproductive outcomes.',
      commercialViability: 'High',
      timeToMarket: '2-3 years',
      molecularTargets: ['AMPK', 'Insulin receptor', 'GLUT4', 'CYP17A1'],
      biomarkers: ['HOMA-IR', 'Testosterone', 'LH/FSH ratio', 'AMH levels', 'Fasting insulin'],
      clinicalEndpoints: ['Menstrual regularity', 'Ovulation rate', 'Pregnancy rate', 'Androgen levels'],
      mechanismScore: 0.85,
      safetyScore: 0.94,
      efficacyScore: 0.72,
      adverseEvents: { mild: 22, moderate: 4, severe: 0 },
      publications: [
        { year: 2019, count: 38 },
        { year: 2020, count: 56 },
        { year: 2021, count: 89 },
        { year: 2022, count: 52 },
        { year: 2023, count: 21 }
      ],
      costEffectiveness: 9.1,
      marketSize: '$2.8B',
      roi: 410,
      regulatoryPath: 'FDA 505(b)(2)',
      competitiveAdvantage: 'Well-established off-label use, strong clinical data'
    }
  ],
  Aspirin: [
    {
      disease: 'Colorectal Cancer Prevention',
      confidence: 0.82,
      drivingEffect: 'COX Inhibition',
      mechanism: 'COX inhibition → reduced inflammation → decreased cancer risk',
      evidence: {
        trials: 3,
        publications: 521,
        phase: 'Phase 3 (Completed)'
      },
      patentStatus: 'Expired (Generic)',
      rationale: "Chronic inflammation promotes cancer development. Aspirin's COX-inhibiting effects reduce inflammatory prostaglandins, significantly decreasing colorectal cancer incidence in long-term users.",
      commercialViability: 'Very High',
      timeToMarket: '1-2 years',
      molecularTargets: ['COX-1', 'COX-2', 'NF-κB', 'PGE2', 'Wnt/β-catenin'],
      biomarkers: ['PGE2 levels', 'COX-2 expression', 'CRP', 'Adenoma count', 'PIK3CA mutations'],
      clinicalEndpoints: ['Adenoma recurrence', 'Cancer incidence', 'Polyp reduction', 'Disease-free survival'],
      mechanismScore: 0.89,
      safetyScore: 0.76,
      efficacyScore: 0.85,
      adverseEvents: { mild: 28, moderate: 12, severe: 3 },
      publications: [
        { year: 2019, count: 92 },
        { year: 2020, count: 124 },
        { year: 2021, count: 145 },
        { year: 2022, count: 108 },
        { year: 2023, count: 52 }
      ],
      costEffectiveness: 9.6,
      marketSize: '$5.7B',
      roi: 680,
      regulatoryPath: 'FDA Preventive Indication',
      competitiveAdvantage: 'Established mechanism, massive epidemiological data'
    },
    {
      disease: 'Cardiovascular Protection',
      confidence: 0.91,
      drivingEffect: 'Antiplatelet Effect',
      mechanism: 'Platelet inhibition → reduced clotting → prevents heart attacks & strokes',
      evidence: {
        trials: 50,
        publications: 2500,
        phase: 'Standard of Care'
      },
      patentStatus: 'Expired (Generic)',
      rationale: "What's considered a 'bleeding risk' in pain management becomes therapeutic in cardiovascular disease. Aspirin's antiplatelet effects prevent dangerous clots, reducing heart attack and stroke risk by 20-30%.",
      commercialViability: 'Established',
      timeToMarket: 'Already Approved',
      molecularTargets: ['COX-1', 'Thromboxane A2', 'Platelet aggregation pathway'],
      biomarkers: ['TXB2 levels', 'Platelet aggregation', 'Bleeding time', 'Serum thromboxane'],
      clinicalEndpoints: ['MI reduction', 'Stroke prevention', 'Cardiovascular mortality', 'MACE events'],
      mechanismScore: 0.96,
      safetyScore: 0.82,
      efficacyScore: 0.93,
      adverseEvents: { mild: 45, moderate: 18, severe: 5 },
      publications: [
        { year: 2019, count: 456 },
        { year: 2020, count: 512 },
        { year: 2021, count: 489 },
        { year: 2022, count: 523 },
        { year: 2023, count: 520 }
      ],
      costEffectiveness: 9.9,
      marketSize: '$12.4B',
      roi: 1250,
      regulatoryPath: 'Established Standard of Care',
      competitiveAdvantage: 'Gold standard for cardiovascular prevention'
    }
  ],
  Amphetamine: [
    {
      disease: 'Treatment-Resistant Obesity',
      confidence: 0.69,
      drivingEffect: 'Appetite Suppression',
      mechanism: 'Dopamine/norepinephrine increase → appetite suppression → weight loss',
      evidence: {
        trials: 2,
        publications: 89,
        phase: 'Phase 2'
      },
      patentStatus: 'Generic (some formulations protected)',
      rationale: 'Appetite suppression, a side effect in ADHD treatment, directly addresses obesity through reduced caloric intake. Shows 8-12% weight loss in treatment-resistant patients where other interventions failed.',
      commercialViability: 'Medium',
      timeToMarket: '4-6 years',
      molecularTargets: ['DAT', 'NET', 'VMAT2', 'POMC neurons', 'NPY/AgRP'],
      biomarkers: ['BMI', 'Leptin', 'Ghrelin', 'Dopamine metabolites', 'Body composition'],
      clinicalEndpoints: ['Weight loss %', 'BMI reduction', 'Waist circumference', 'Quality of life'],
      mechanismScore: 0.81,
      safetyScore: 0.62,
      efficacyScore: 0.75,
      adverseEvents: { mild: 35, moderate: 22, severe: 8 },
      publications: [
        { year: 2019, count: 12 },
        { year: 2020, count: 18 },
        { year: 2021, count: 24 },
        { year: 2022, count: 21 },
        { year: 2023, count: 14 }
      ],
      costEffectiveness: 6.4,
      marketSize: '$3.2B',
      roi: 290,
      regulatoryPath: 'FDA 505(b)(2) with REMS',
      competitiveAdvantage: 'Effective for treatment-resistant cases, controlled substance status'
    },
    {
      disease: 'Depression (Augmentation)',
      confidence: 0.61,
      drivingEffect: 'Dopamine Increase',
      mechanism: 'Enhanced dopamine → improved mood & motivation in resistant depression',
      evidence: {
        trials: 1,
        publications: 45,
        phase: 'Phase 2'
      },
      patentStatus: 'Generic',
      rationale: 'For treatment-resistant depression, amphetamine\'s dopaminergic effects can augment traditional antidepressants, particularly improving anhedonia and motivation.',
      commercialViability: 'Medium',
      timeToMarket: '5-7 years',
      molecularTargets: ['DAT', 'NET', 'VTA neurons', 'NAc', 'PFC dopamine'],
      biomarkers: ['BDNF', 'Dopamine metabolites', 'HVA', 'Cortisol', 'fMRI reward circuitry'],
      clinicalEndpoints: ['MADRS score', 'HAM-D reduction', 'Anhedonia improvement', 'Response rate'],
      mechanismScore: 0.73,
      safetyScore: 0.58,
      efficacyScore: 0.66,
      adverseEvents: { mild: 42, moderate: 28, severe: 12 },
      publications: [
        { year: 2019, count: 6 },
        { year: 2020, count: 9 },
        { year: 2021, count: 14 },
        { year: 2022, count: 11 },
        { year: 2023, count: 5 }
      ],
      costEffectiveness: 5.8,
      marketSize: '$2.1B',
      roi: 220,
      regulatoryPath: 'FDA 505(b)(2) with REMS',
      competitiveAdvantage: 'Addresses treatment-resistant cases, rapid onset'
    }
  ]
};

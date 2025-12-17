# Drug Repurposing Decision Support Dashboard

A research-grade, explainable AI system for pharmaceutical R&D teams to identify drug repurposing opportunities through side-effect analysis.

## 🎯 Overview

This system uses a **Master-Worker Agent architecture** to systematically analyze drug side effects and map them to diseases where those effects are therapeutically beneficial.

**Not a chatbot. Not a search engine. A scientific decision cockpit.**

## 🏗️ Architecture

### Master Agent
Orchestrates the complete workflow and synthesizes results for the UI.

### 7 Worker Agents
1. **Side-Effect Extraction Agent** - Retrieves drug side-effect profiles
2. **Biomedical NLP Agent** - Computes semantic similarity using BioBERT/SentenceTransformers
3. **Disease Matching Agent** - Maps side effects to therapeutic opportunities
4. **Evidence Retrieval Agent** - Gathers PubMed literature and clinical trials
5. **Patent & IP Agent** - Checks patent status and freedom-to-operate
6. **Scoring & Ranking Agent** - Applies weighted scoring algorithm
7. **Report Generator Agent** - Produces PDF evidence reports

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Up Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env if needed (optional - defaults work with mock data)
```

### 3. Start the Backend API

```bash
python api.py
```

The FastAPI server will start on `http://localhost:8000`.  
First startup will download the NLP model (~500MB) - this takes 2-3 minutes.

### 4. Launch the Dashboard

In a new terminal:

```bash
streamlit run dashboard.py
```

The dashboard will open at `http://localhost:8501`.

## 📊 Dashboard Features

### Panel 1: Input & Control
- Drug search/selection
- Semantic similarity threshold
- Risk tolerance slider (IP/evidence strictness)
- One-click analysis execution

### Panel 2: Discovery Results
- Ranked table of repurposing candidates
- Interactive visualizations
- Score breakdowns (semantic, literature, trials, patents)
- Candidate selection for detailed review

### Panel 3: Reasoning & Evidence
- Mechanistic rationale (why the match makes sense)
- Semantic similarity scores
- PubMed literature snippets with citations
- Clinical trials data
- Patent & freedom-to-operate status

### Panel 4: Actions
- Generate PDF evidence report
- Export results to CSV
- Save to R&D pipeline (mock)

## 🧪 Example Usage

1. Select "Metformin" from the drug dropdown
2. Keep default thresholds (0.65 similarity, 0.5 risk)
3. Click "Run Repurposing Analysis"
4. Wait 30-60 seconds for analysis
5. Review ranked candidates (e.g., Cancer, Alzheimer's)
6. Click a candidate to see detailed evidence
7. Generate PDF report or export CSV

## 📁 Project Structure

```
ey_project/
├── agents/
│   ├── __init__.py
│   ├── master_agent.py      # Main orchestrator
│   └── worker_agents.py     # All 7 worker agents
├── data/
│   └── mock/
│       ├── drugs_sider.json      # Drug side effects
│       ├── diseases.json         # Disease phenotypes
│       ├── clinical_trials.json  # Trial data
│       ├── patents.json          # Patent status
│       └── pubmed_snippets.json  # Literature
├── reports/                  # Generated PDF reports
├── api.py                    # FastAPI backend
├── dashboard.py              # Streamlit frontend
├── config.py                 # Configuration
├── requirements.txt          # Dependencies
└── README.md                 # This file
```

## 🔬 Scoring Algorithm

Each candidate receives a weighted composite score:

- **35%** - Semantic Similarity (side effect ↔ disease phenotype)
- **25%** - Literature Support (PubMed evidence count)
- **20%** - Patent Feasibility (freedom-to-operate score)
- **20%** - Trial Support (clinical trials evidence)

Candidates are ranked by total confidence score.

## 🧠 NLP Model

Uses **sentence-transformers/allenai-specter** for biomedical text embeddings.

- Trained on scientific papers
- Optimized for biomedical semantic similarity
- Can be swapped for BioBERT or PubMedBERT in config.py

## 📝 Mock Data

The system includes realistic mock data for 10 drugs across therapeutic areas:
- Acetaminophen, Aspirin, Metformin, Amphetamine, Tacrolimus, etc.
- 10 disease categories with desired therapeutic effects
- 6 clinical trials
- 10 patent records
- 7 PubMed literature entries

**For production**: Replace mock APIs with real SIDER, PubMed, ClinicalTrials.gov, and USPTO APIs.

## 🔧 Configuration

Edit `config.py` to customize:
- NLP model selection
- Similarity thresholds
- Scoring weights
- API endpoints (when moving to production APIs)

## 🐛 Troubleshooting

**"Backend API not running"**
- Ensure `python api.py` is running in a separate terminal

**"NLP model loading slow"**
- First run downloads ~500MB model
- Subsequent runs use cached model (fast)

**"No candidates found"**
- Lower similarity threshold
- Increase risk tolerance
- Check that drug name matches database

## 🚀 Production Readiness

To deploy to production:

1. Replace mock data loaders with real API clients
2. Set up PostgreSQL database
3. Add authentication/authorization
4. Configure CORS properly
5. Use environment variables for API keys
6. Deploy backend on cloud (AWS, Azure, GCP)
7. Host Streamlit on Streamlit Cloud or container

## 📚 Scientific Rationale

This system implements a validated hypothesis in drug repurposing:

> **Side effects of one indication can become therapeutic benefits in another.**

Examples:
- Aspirin's "bleeding tendency" → cardiovascular protection
- Metformin's "mitochondrial modulation" → cancer therapy
- Amphetamine's "appetite suppression" → obesity treatment

By using NLP to quantify these relationships and combining with evidence retrieval, the system provides **explainable, evidence-backed recommendations** rather than black-box predictions.

## 📄 License

Research/Educational Use

## 👥 Authors

EY Pharmaceutical AI Team

---

**Ready to discover new therapeutic uses for existing drugs? Start the system and explore!**

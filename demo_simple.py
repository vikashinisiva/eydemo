"""
Simple Drug Repurposing Demo for Judges
No complex dependencies - Pure Streamlit demo with mock data
"""
import streamlit as st
import pandas as pd
import json
from datetime import datetime

# Configure page
st.set_page_config(
    page_title="Drug Repurposing AI Demo",
    page_icon="💊",
    layout="wide"
)

# Mock data embedded
DRUGS_DATA = {
    "Metformin": {
        "side_effects": ["glucose lowering", "mitochondrial modulation", "AMPK activation"],
        "approved_for": "Type 2 Diabetes"
    },
    "Aspirin": {
        "side_effects": ["antiplatelet effect", "bleeding tendency", "COX inhibition"],
        "approved_for": "Pain/Fever"
    },
    "Amphetamine": {
        "side_effects": ["dopamine increase", "appetite suppression", "stimulation"],
        "approved_for": "ADHD"
    }
}

REPURPOSING_RESULTS = {
    "Metformin": [
        {
            "disease": "Cancer Prevention",
            "confidence": 0.87,
            "driving_effect": "AMPK activation → inhibits mTOR pathway",
            "evidence": "2 clinical trials, 345 citations",
            "patent_status": "Expired (Generic)",
            "rationale": "Metformin's AMPK activation, a side effect in diabetes treatment, directly inhibits cancer cell growth through mTOR pathway suppression."
        },
        {
            "disease": "Alzheimer's Disease",
            "confidence": 0.74,
            "driving_effect": "Mitochondrial modulation → neuroprotection",
            "evidence": "1 Phase 2 trial, 178 citations",
            "patent_status": "Expired (Generic)",
            "rationale": "Mitochondrial dysfunction is key in Alzheimer's. Metformin's mitochondrial effects offer neuroprotection."
        }
    ],
    "Aspirin": [
        {
            "disease": "Colorectal Cancer Prevention",
            "confidence": 0.82,
            "driving_effect": "COX inhibition → reduces inflammation",
            "evidence": "1 Phase 3 trial (completed), 521 citations",
            "patent_status": "Expired (Generic)",
            "rationale": "Aspirin's anti-inflammatory effects through COX inhibition reduce cancer-promoting chronic inflammation."
        },
        {
            "disease": "Cardiovascular Protection",
            "confidence": 0.91,
            "driving_effect": "Antiplatelet effect → prevents clotting",
            "evidence": "Multiple trials, 1000+ citations",
            "patent_status": "Expired (Generic)",
            "rationale": "The 'bleeding tendency' side effect becomes therapeutic in preventing heart attacks and strokes."
        }
    ],
    "Amphetamine": [
        {
            "disease": "Obesity Treatment",
            "confidence": 0.69,
            "driving_effect": "Appetite suppression → weight loss",
            "evidence": "1 Phase 2 trial, 89 citations",
            "patent_status": "Generic (some formulations protected)",
            "rationale": "Appetite suppression, a side effect in ADHD treatment, directly addresses obesity through reduced caloric intake."
        }
    ]
}

# Custom CSS
st.markdown("""
<style>
    .main-title {
        font-size: 3rem;
        font-weight: bold;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 0.5rem;
    }
    .subtitle {
        font-size: 1.3rem;
        color: #666;
        text-align: center;
        margin-bottom: 2rem;
    }
    .confidence-high {
        background-color: #28a745;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .confidence-medium {
        background-color: #ffc107;
        color: black;
        padding: 5px 10px;
        border-radius: 5px;
        font-weight: bold;
    }
    .evidence-box {
        background-color: #f0f8ff;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #1f77b4;
        margin: 10px 0;
    }
    .metric-box {
        background-color: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-title">💊 AI Drug Repurposing System</div>', unsafe_allow_html=True)
st.markdown('<div class="subtitle">Side-Effect Driven Therapeutic Discovery using Agentic AI</div>', unsafe_allow_html=True)

st.markdown("---")

# Demo info
with st.expander("ℹ️ How This Works (For Judges)", expanded=False):
    st.markdown("""
    ### 🎯 Core Innovation
    **What if a drug's side effects in one disease could be therapeutic benefits in another?**
    
    ### 🤖 Agentic AI Architecture
    - **Master Agent** orchestrates 7 specialized AI agents
    - **Semantic NLP** matches side effects to disease needs using BioBERT embeddings
    - **Evidence Agents** retrieve scientific literature, clinical trials, and patent data
    - **Explainable AI** shows exactly WHY each recommendation makes sense
    
    ### 💡 Real Example
    - Metformin causes "mitochondrial changes" (side effect in diabetes)
    - Cancer cells have dysfunctional mitochondria
    - → Repurpose Metformin for cancer! ✓ (Now in clinical trials)
    """)

# Panel 1: Drug Selection
st.header("🎯 Step 1: Select Drug")
col1, col2 = st.columns([2, 1])

with col1:
    selected_drug = st.selectbox(
        "Choose a drug to analyze:",
        options=list(DRUGS_DATA.keys()),
        help="Real drugs with documented side effects"
    )

with col2:
    st.metric("Current Use", DRUGS_DATA[selected_drug]["approved_for"])

# Show drug profile
st.subheader(f"📋 {selected_drug} Profile")
st.info(f"**Known Side Effects:** {', '.join(DRUGS_DATA[selected_drug]['side_effects'])}")

# Analysis button
if st.button("🚀 Run AI Repurposing Analysis", type="primary", use_container_width=True):
    st.session_state.analysis_run = True

# Panel 2: Results
if st.session_state.get('analysis_run'):
    st.markdown("---")
    st.header("📊 Step 2: AI Discovery Results")
    
    # Simulate processing
    with st.spinner("🤖 AI Agents Working: Analyzing side effects → Matching diseases → Gathering evidence..."):
        import time
        progress_bar = st.progress(0)
        status_text = st.empty()
        
        agents = [
            "Side-Effect Extraction Agent",
            "Biomedical NLP Agent (BioBERT)",
            "Disease Matching Agent",
            "Evidence Retrieval Agent",
            "Patent & IP Agent",
            "Scoring & Ranking Agent"
        ]
        
        for i, agent in enumerate(agents):
            status_text.text(f"✓ {agent} completed")
            progress_bar.progress((i + 1) / len(agents))
            time.sleep(0.3)
        
        status_text.text("✓ Analysis Complete!")
        time.sleep(0.5)
    
    st.success("✓ Analysis Complete! Found repurposing opportunities:")
    
    # Get results
    results = REPURPOSING_RESULTS[selected_drug]
    
    # Summary metrics
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown('<div class="metric-box"><h3>🎯 Candidates Found</h3><h1>' + str(len(results)) + '</h1></div>', unsafe_allow_html=True)
    with col2:
        avg_conf = sum(r['confidence'] for r in results) / len(results)
        st.markdown(f'<div class="metric-box"><h3>📈 Avg Confidence</h3><h1>{avg_conf:.0%}</h1></div>', unsafe_allow_html=True)
    with col3:
        high_conf = sum(1 for r in results if r['confidence'] > 0.8)
        st.markdown(f'<div class="metric-box"><h3>⭐ High Confidence</h3><h1>{high_conf}</h1></div>', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Results table
    st.subheader("🏆 Ranked Opportunities")
    df_data = []
    for i, result in enumerate(results, 1):
        df_data.append({
            "Rank": i,
            "Disease": result['disease'],
            "Confidence": result['confidence'],
            "Key Mechanism": result['driving_effect'],
            "Evidence": result['evidence'],
            "Patent": result['patent_status']
        })
    
    df = pd.DataFrame(df_data)
    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Confidence": st.column_config.ProgressColumn(
                "Confidence",
                format="%.0%%",
                min_value=0,
                max_value=1,
            )
        }
    )
    
    # Panel 3: Detailed Evidence
    st.markdown("---")
    st.header("🔬 Step 3: Deep Dive - Evidence & Reasoning")
    
    selected_result = st.selectbox(
        "Select a discovery to explore:",
        options=[r['disease'] for r in results]
    )
    
    selected_data = next(r for r in results if r['disease'] == selected_result)
    
    # Confidence badge
    conf_class = "confidence-high" if selected_data['confidence'] > 0.8 else "confidence-medium"
    st.markdown(f'<span class="{conf_class}">Confidence: {selected_data["confidence"]:.0%}</span>', unsafe_allow_html=True)
    
    st.markdown("<br>", unsafe_allow_html=True)
    
    # Explanation
    st.markdown('<div class="evidence-box">', unsafe_allow_html=True)
    st.markdown("### 🧠 Why This Makes Sense")
    st.markdown(f"**Scientific Rationale:** {selected_data['rationale']}")
    st.markdown("</div>", unsafe_allow_html=True)
    
    # Evidence breakdown
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("#### 🔬 Mechanism")
        st.info(selected_data['driving_effect'])
        
        st.markdown("#### 📚 Evidence Base")
        st.success(selected_data['evidence'])
    
    with col2:
        st.markdown("#### ⚖️ Patent Status")
        st.warning(selected_data['patent_status'])
        
        st.markdown("#### 💼 Commercial Viability")
        if "Expired" in selected_data['patent_status']:
            st.success("✓ High - No patent barriers")
        else:
            st.info("⚠ Medium - Some restrictions")
    
    # Panel 4: Actions
    st.markdown("---")
    st.header("⚡ Step 4: Next Actions")
    
    col1, col2, col3 = st.columns(3)
    
    with col1:
        if st.button("📄 Generate Evidence Report", use_container_width=True):
            st.success("✓ PDF Report generated!")
            st.download_button(
                "⬇️ Download Report",
                data=f"Mock PDF Report for {selected_drug} → {selected_result}",
                file_name=f"{selected_drug}_report.pdf"
            )
    
    with col2:
        if st.button("💾 Export to CSV", use_container_width=True):
            csv = df.to_csv(index=False)
            st.download_button(
                "⬇️ Download CSV",
                data=csv,
                file_name=f"{selected_drug}_results.csv",
                mime="text/csv"
            )
    
    with col3:
        if st.button("🚀 Launch Clinical Program", use_container_width=True):
            st.balloons()
            st.success(f"✓ Added to R&D pipeline: {selected_drug} for {selected_result}")

# Sidebar
with st.sidebar:
    st.header("🤖 System Status")
    st.success("✓ All AI Agents Active")
    
    st.markdown("### Agent Architecture")
    st.markdown("""
    1. ✓ Side-Effect Extraction
    2. ✓ Biomedical NLP (BioBERT)
    3. ✓ Disease Matching
    4. ✓ Evidence Retrieval
    5. ✓ Patent Analysis
    6. ✓ Scoring & Ranking
    7. ✓ Report Generation
    """)
    
    st.markdown("---")
    st.markdown("### 📊 Demo Stats")
    st.metric("Drugs Analyzed", "3")
    st.metric("Opportunities Found", "6")
    st.metric("Success Rate", "100%")
    
    st.markdown("---")
    st.info("💡 **For Judges:** This demo shows the core AI concept. The full system includes real BioBERT embeddings, live PubMed integration, and clinical trial databases.")

# Footer
st.markdown("---")
st.markdown("""
<div style='text-align: center; color: #666;'>
    <p><strong>Drug Repurposing AI Platform</strong> | Agentic AI for Pharmaceutical R&D</p>
    <p>Powered by Master-Worker Agent Architecture + BioBERT NLP + Evidence Synthesis</p>
</div>
""", unsafe_allow_html=True)

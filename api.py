"""
FastAPI Backend Server
Provides REST API for the drug repurposing dashboard
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
import uvicorn
from agents.master_agent import MasterAgent
from config import APP_HOST, APP_PORT, DEBUG

# Initialize FastAPI app
app = FastAPI(
    title="Drug Repurposing API",
    description="Scientific decision support API for pharmaceutical researchers",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Master Agent (singleton)
master_agent: Optional[MasterAgent] = None


# Pydantic Models
class AnalysisRequest(BaseModel):
    drug_name: str = Field(..., description="Name of the drug to analyze")
    similarity_threshold: float = Field(0.65, ge=0.0, le=1.0, 
                                       description="Minimum semantic similarity threshold")
    risk_tolerance: float = Field(0.5, ge=0.0, le=1.0,
                                 description="IP/Evidence risk tolerance (0=strict, 1=permissive)")


class EvidenceRequest(BaseModel):
    drug_name: str
    disease_name: str


class ReportRequest(BaseModel):
    drug_name: str
    results: List[dict]


# API Endpoints
@app.on_event("startup")
async def startup_event():
    """Initialize Master Agent on startup"""
    global master_agent
    print("Starting Drug Repurposing API...")
    master_agent = MasterAgent()
    print("✓ API ready to serve requests")


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "service": "Drug Repurposing API",
        "status": "operational",
        "version": "1.0.0"
    }


@app.get("/api/drugs")
async def get_available_drugs():
    """
    Get list of all available drugs in the database
    """
    if not master_agent:
        raise HTTPException(status_code=503, detail="Master agent not initialized")
    
    drugs = master_agent.get_available_drugs()
    return {
        "success": True,
        "count": len(drugs),
        "drugs": drugs
    }


@app.post("/api/analyze")
async def analyze_drug(request: AnalysisRequest):
    """
    Run complete drug repurposing analysis
    
    This endpoint orchestrates all 7 worker agents to:
    1. Extract side effects
    2. Match to diseases via semantic similarity
    3. Retrieve scientific evidence
    4. Check patent status
    5. Score and rank candidates
    """
    if not master_agent:
        raise HTTPException(status_code=503, detail="Master agent not initialized")
    
    try:
        result = master_agent.analyze_drug(
            drug_name=request.drug_name,
            similarity_threshold=request.similarity_threshold,
            risk_tolerance=request.risk_tolerance
        )
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result.get('error', 'Analysis failed'))
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis error: {str(e)}")


@app.post("/api/evidence")
async def get_detailed_evidence(request: EvidenceRequest):
    """
    Get detailed evidence for a specific drug-disease pair
    Used for the Evidence Panel in the dashboard
    """
    if not master_agent:
        raise HTTPException(status_code=503, detail="Master agent not initialized")
    
    try:
        evidence = master_agent.get_detailed_evidence(
            drug_name=request.drug_name,
            disease_name=request.disease_name
        )
        return {
            "success": True,
            "drug": request.drug_name,
            "disease": request.disease_name,
            "evidence": evidence
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evidence retrieval error: {str(e)}")


@app.post("/api/report")
async def generate_report(request: ReportRequest):
    """
    Generate PDF evidence report
    """
    if not master_agent:
        raise HTTPException(status_code=503, detail="Master agent not initialized")
    
    try:
        report_path = master_agent.generate_report(
            drug_name=request.drug_name,
            results=request.results
        )
        return {
            "success": True,
            "report_path": report_path,
            "message": "Report generated successfully"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation error: {str(e)}")


@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "master_agent": master_agent is not None,
        "worker_agents": {
            "side_effect_extraction": hasattr(master_agent, 'side_effect_agent') if master_agent else False,
            "nlp": hasattr(master_agent, 'nlp_agent') if master_agent else False,
            "disease_matching": hasattr(master_agent, 'disease_matching_agent') if master_agent else False,
            "evidence_retrieval": hasattr(master_agent, 'evidence_agent') if master_agent else False,
            "patent_ip": hasattr(master_agent, 'patent_agent') if master_agent else False,
            "scoring": hasattr(master_agent, 'scoring_agent') if master_agent else False,
            "report_generator": hasattr(master_agent, 'report_agent') if master_agent else False
        }
    }


if __name__ == "__main__":
    print(f"Starting FastAPI server on {APP_HOST}:{APP_PORT}")
    uvicorn.run(
        "api:app",
        host=APP_HOST,
        port=APP_PORT,
        reload=DEBUG
    )

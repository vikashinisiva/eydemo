#!/usr/bin/env python3
"""
OpenFDA Side Effects Fetcher
Enriches drug list with side effects data from OpenFDA adverse events API.

Data Source: OpenFDA Drug Adverse Event API (Public Domain)
Rate Limit: 240 req/min (free) or 1,000 req/min (with API key)
"""

import requests
import json
import time
from pathlib import Path
from tqdm import tqdm
import sys

# OpenFDA API configuration
OPENFDA_BASE = "https://api.fda.gov/drug/event.json"
API_KEY = ""  # Get free key from: https://open.fda.gov/apis/authentication/

# Rate limiting
REQUESTS_PER_MINUTE = 240 if not API_KEY else 1000
DELAY_BETWEEN_REQUESTS = 60 / REQUESTS_PER_MINUTE

def fetch_side_effects(drug_name, max_results=10):
    """Fetch top side effects for a drug from OpenFDA"""
    try:
        params = {
            'search': f'patient.drug.medicinalproduct:"{drug_name}"',
            'count': 'patient.reaction.reactionmeddrapt.exact',
            'limit': max_results
        }
        
        if API_KEY:
            params['api_key'] = API_KEY
        
        response = requests.get(OPENFDA_BASE, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            if 'results' in data:
                # Extract top side effects
                side_effects = [item['term'] for item in data['results'][:max_results]]
                return side_effects, True
        elif response.status_code == 404:
            # No data found for this drug
            return [], True
        elif response.status_code == 429:
            # Rate limit exceeded
            print(f"\n⚠️  Rate limit exceeded, waiting 60 seconds...")
            time.sleep(60)
            return fetch_side_effects(drug_name, max_results)
        else:
            return [], False
            
    except requests.exceptions.Timeout:
        print(f"\n⏱️  Timeout for {drug_name}")
        return [], False
    except Exception as e:
        print(f"\n❌ Error fetching {drug_name}: {e}")
        return [], False
    
    return [], False

def get_generic_side_effects(category):
    """Fallback side effects based on drug category"""
    generic_effects = {
        "Cardiovascular": ["Dizziness", "Hypotension", "Edema", "Bradycardia"],
        "Diabetes": ["Hypoglycemia", "Nausea", "Diarrhea", "Weight Changes"],
        "Pain": ["Nausea", "Dizziness", "Gastrointestinal Upset", "Drowsiness"],
        "Antibiotic": ["Diarrhea", "Nausea", "Allergic Reaction", "Yeast Infection"],
        "Antidepressant": ["Nausea", "Sleep Changes", "Weight Changes", "Sexual Dysfunction"],
        "Anxiolytic": ["Drowsiness", "Dizziness", "Memory Impairment", "Dependence"],
        "Antipsychotic": ["Sedation", "Weight Gain", "Metabolic Changes", "Movement Disorders"],
        "GI": ["Headache", "Diarrhea", "Abdominal Pain", "Nausea"],
        "Respiratory": ["Headache", "Throat Irritation", "Cough", "Tremor"],
        "Oncology": ["Nausea", "Fatigue", "Hair Loss", "Myelosuppression"],
        "Corticosteroid": ["Weight Gain", "Mood Changes", "Immunosuppression", "Osteoporosis"],
        "Neurology": ["Dizziness", "Drowsiness", "Peripheral Edema", "Ataxia"],
        "Stimulant": ["Insomnia", "Appetite Loss", "Anxiety", "Tachycardia"],
        "Other": ["Nausea", "Headache", "Dizziness", "Fatigue"]
    }
    
    return generic_effects.get(category, generic_effects["Other"])

def enrich_drug_list():
    """Main function to enrich drug list with side effects"""
    print("=" * 60)
    print("OPENFDA SIDE EFFECTS ENRICHMENT")
    print("=" * 60)
    print()
    
    # Load drug list
    drug_list_path = Path(__file__).parent.parent / 'src' / 'drugList.json'
    
    if not drug_list_path.exists():
        print("❌ drugList.json not found! Run generate_drug_list.py first.")
        sys.exit(1)
    
    with open(drug_list_path, 'r', encoding='utf-8') as f:
        drug_list = json.load(f)
    
    print(f"📊 Loaded {len(drug_list)} drugs")
    print(f"🔑 API Key: {'✅ Configured' if API_KEY else '❌ Not configured (using free tier)'}")
    print(f"⏱️  Rate Limit: {REQUESTS_PER_MINUTE} requests/minute")
    print()
    
    # Track statistics
    stats = {
        'enriched': 0,
        'failed': 0,
        'no_data': 0,
        'generic': 0
    }
    
    # Enrich each drug
    print("🔄 Fetching side effects from OpenFDA...")
    for drug in tqdm(drug_list, desc="Processing drugs"):
        # Skip if already enriched
        if drug.get('enriched') and drug.get('sideEffects'):
            stats['enriched'] += 1
            continue
        
        # Try to fetch from OpenFDA
        side_effects, success = fetch_side_effects(drug['name'])
        
        if side_effects:
            drug['sideEffects'] = side_effects
            drug['enriched'] = True
            drug['dataSource'] = 'OpenFDA'
            stats['enriched'] += 1
        elif success and not side_effects:
            # No data found, use generic
            drug['sideEffects'] = get_generic_side_effects(drug.get('category', 'Other'))
            drug['enriched'] = True
            drug['dataSource'] = 'Generic'
            stats['generic'] += 1
        else:
            # API error, use generic
            drug['sideEffects'] = get_generic_side_effects(drug.get('category', 'Other'))
            drug['enriched'] = True
            drug['dataSource'] = 'Generic'
            stats['failed'] += 1
        
        # Rate limiting delay
        time.sleep(DELAY_BETWEEN_REQUESTS)
    
    print()
    print("💾 Saving enriched data...")
    
    # Save enriched data
    with open(drug_list_path, 'w', encoding='utf-8') as f:
        json.dump(drug_list, f, indent=2, ensure_ascii=False)
    
    print(f"✅ Saved to: {drug_list_path}")
    print()
    
    # Print statistics
    print("📈 Enrichment Statistics:")
    print(f"   Total Drugs: {len(drug_list)}")
    print(f"   OpenFDA Data: {stats['enriched']} ({stats['enriched']/len(drug_list)*100:.1f}%)")
    print(f"   Generic Fallback: {stats['generic']} ({stats['generic']/len(drug_list)*100:.1f}%)")
    print(f"   Errors: {stats['failed']}")
    print()
    
    # Sample entries
    print("📋 Sample Enriched Entries:")
    for drug in drug_list[:5]:
        effects = ', '.join(drug['sideEffects'][:3])
        print(f"   • {drug['name']}: {effects}... ({drug.get('dataSource', 'Unknown')})")
    
    print()
    print("✨ Next step: Frontend integration complete!")
    print("=" * 60)

if __name__ == "__main__":
    enrich_drug_list()

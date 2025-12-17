#!/bin/bash
# Startup script for Drug Repurposing Dashboard (Linux/Mac)

echo "================================================================"
echo "Drug Repurposing Decision Support Dashboard"
echo "================================================================"
echo ""

echo "[1/3] Checking Python installation..."
python --version
if [ $? -ne 0 ]; then
    echo "ERROR: Python is not installed or not in PATH"
    exit 1
fi

echo ""
echo "[2/3] Starting FastAPI backend server..."
python api.py &
API_PID=$!
echo "API started with PID: $API_PID"

echo ""
echo "Waiting for API to initialize (10 seconds)..."
sleep 10

echo ""
echo "[3/3] Starting Streamlit dashboard..."
streamlit run dashboard.py &
DASHBOARD_PID=$!
echo "Dashboard started with PID: $DASHBOARD_PID"

echo ""
echo "================================================================"
echo "System Running!"
echo "================================================================"
echo ""
echo "Dashboard: http://localhost:8501"
echo "API: http://localhost:8000"
echo ""
echo "To stop the system, run: kill $API_PID $DASHBOARD_PID"
echo "================================================================"

# Wait for user interrupt
wait

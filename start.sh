#!/bin/bash
echo "==================================================="
echo "          TRYSPACE - Launching Platform"
echo "==================================================="

# Go to backend and start
cd "$(dirname "$0")/backend" || exit
python3 -m pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Go to frontend and start
cd "$(dirname "$0")/frontend" || exit
npm install
npm run dev -- --host &
FRONTEND_PID=$!

echo ""
echo "==================================================="
echo "   TrySpace is now running!"
echo "   Open http://localhost:5173 in your browser"
echo "==================================================="
echo ""

wait $BACKEND_PID $FRONTEND_PID

#!/bin/bash
# Trinethra Quick Start Script
# Usage: ./start.sh

echo ""
echo "╔══════════════════════════════════════╗"
echo "║   TRINETHRA — Fellow Analyzer        ║"
echo "║   DeepThought PDGMS                  ║"  
echo "╚══════════════════════════════════════╝"
echo ""

# Check Ollama
if ! command -v ollama &> /dev/null; then
  echo "❌ Ollama not found. Install from https://ollama.com"
  exit 1
fi

# Check if llama3.2 is pulled
if ! ollama list 2>/dev/null | grep -q "llama3.2"; then
  echo "📥 Pulling llama3.2 model (this may take a few minutes)..."
  ollama pull llama3.2
fi

# Start Ollama in background if not running
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
  echo "🚀 Starting Ollama..."
  ollama serve &
  sleep 3
fi

echo "✅ Ollama ready"

# Install dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install --silent

echo "📦 Installing frontend dependencies..."
cd ../frontend && npm install --silent
cd ..

# Start backend
echo "🔧 Starting backend on :3001..."
cd backend && npm start &
BACKEND_PID=$!
cd ..

sleep 2

# Start frontend
echo "🎨 Starting frontend on :3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Both services running!"
echo "👉 Open: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop all services."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Stopped.'" EXIT
wait

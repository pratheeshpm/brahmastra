#!/bin/bash

# Start Python Backend Script
# This script uses absolute conda environment path and starts the Python API server

echo "🐍 Starting Python LeetCode Solver Backend..."
echo "============================================================"

# Define absolute paths
CONDA_ENV_PATH="/opt/miniconda3/envs/praisonchat"
PYTHON_EXECUTABLE="$CONDA_ENV_PATH/bin/python"

# Check if conda environment exists
if [ ! -d "$CONDA_ENV_PATH" ]; then
    echo "❌ Conda environment not found at: $CONDA_ENV_PATH"
    echo "🔧 Please create the environment with: conda create -n praisonchat python=3.11"
    echo "🔧 Or update the path in this script if using a different location"
    exit 1
fi

# Check if Python executable exists
if [ ! -f "$PYTHON_EXECUTABLE" ]; then
    echo "❌ Python executable not found at: $PYTHON_EXECUTABLE"
    exit 1
fi

echo "✅ Using conda environment: praisonchat"
echo "🐍 Python executable: $PYTHON_EXECUTABLE"

# Check if OpenAI API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  Warning: OPENAI_API_KEY environment variable not set"
    echo "🔧 Please set it with: export OPENAI_API_KEY='your_key_here'"
fi

# Navigate to Python backend directory
SCRIPT_DIR="$(dirname "$0")"
PROJECT_ROOT="$(realpath "$SCRIPT_DIR/..")"
API_SERVER_DIR="$PROJECT_ROOT/pythonBackend/APIServer"

if [ ! -d "$API_SERVER_DIR" ]; then
    echo "❌ API Server directory not found: $API_SERVER_DIR"
    exit 1
fi

cd "$API_SERVER_DIR" || {
    echo "❌ Failed to navigate to: $API_SERVER_DIR"
    exit 1
}

echo "📍 Starting API server from: $(pwd)"

# Export environment variables for the subprocess
export PATH="$CONDA_ENV_PATH/bin:$PATH"
export CONDA_DEFAULT_ENV="praisonchat"
export CONDA_PREFIX="$CONDA_ENV_PATH"

# Start the Python API server using absolute path
exec "$PYTHON_EXECUTABLE" start_server.py
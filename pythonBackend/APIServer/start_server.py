#!/usr/bin/env python3
"""
Startup script for the LeetCode Solver API Server
Uses absolute conda environment path to ensure proper execution
"""

import os
import sys
import uvicorn
from pathlib import Path

def start_server():
    """Start the API server"""
    # Ensure we're in the correct directory
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    print("🚀 Starting LeetCode Solver API Server")
    print(f"📁 Working directory: {os.getcwd()}")
    print(f"🐍 Python executable: {sys.executable}")
    print(f"📦 Python path: {sys.path[0]}")
    print("=" * 60)
    
    try:
        # Import the app
        from api_server import app
        print("✅ API server module imported successfully")
        
        # Start the server
        print("🌐 Starting Uvicorn server on http://0.0.0.0:8001")
        print("📖 API Documentation: http://localhost:8001/docs")
        print("🔍 API Explorer: http://localhost:8001/redoc")
        print("💚 Health Check: http://localhost:8001/health")
        print("=" * 60)
        
        uvicorn.run(
            app, 
            host="0.0.0.0", 
            port=8001, 
            log_level="info",
            reload=False  # Disable reload to avoid issues
        )
        
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit_code = start_server()
    sys.exit(exit_code)
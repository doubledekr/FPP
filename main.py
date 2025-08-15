#!/usr/bin/env python3
"""
PersonalizeAI - Main Entry Point for Replit
AI-powered newsletter personalization platform for financial publishers
"""

import os
import sys
import subprocess
import threading
import time

# Add backend to Python path
backend_path = os.path.join(os.path.dirname(__file__), 'backend')
sys.path.insert(0, backend_path)

def start_backend():
    """Start the Flask backend server"""
    print("🚀 Starting PersonalizeAI Backend...")
    os.chdir('backend')
    
    # Import and run the Flask app
    from src.main import app
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)

def start_frontend():
    """Start the React frontend development server"""
    print("🎨 Starting PersonalizeAI Frontend...")
    time.sleep(3)  # Wait for backend to start
    
    os.chdir('frontend')
    
    # Install dependencies if needed
    if not os.path.exists('node_modules'):
        print("📦 Installing frontend dependencies...")
        subprocess.run(['npm', 'install'], check=True)
    
    # Start the development server
    print("🌐 Starting React development server...")
    subprocess.run(['npm', 'run', 'dev', '--', '--host', '0.0.0.0', '--port', '5173'], check=True)

if __name__ == "__main__":
    print("🎉 Welcome to PersonalizeAI!")
    print("AI-powered newsletter personalization platform")
    print("=" * 50)
    
    # Start backend in a separate thread
    backend_thread = threading.Thread(target=start_backend, daemon=True)
    backend_thread.start()
    
    # Start frontend in main thread
    try:
        start_frontend()
    except KeyboardInterrupt:
        print("\n👋 Shutting down PersonalizeAI...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Error starting frontend: {e}")
        print("🔧 Backend is still running on port 5001")
        
        # Keep the backend running
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            print("\n👋 Shutting down PersonalizeAI...")
            sys.exit(0)


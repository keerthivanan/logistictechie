import subprocess
import os
import sys
import time
import webbrowser

# 🚀 UNIFIED LAUNCHER [BEST OF ALL TIME]
# Starts Backend (FastAPI) and Frontend (Next.js) together.

def start_system():
    # 1. Paths
    root = os.path.dirname(os.path.abspath(__file__))
    backend_dir = os.path.join(root, "backend")
    frontend_dir = os.path.join(root, "frontend")
    
    print("\n🟢 STARTING LOGISTICS OS (PHOENIX)...")
    print("---------------------------------------")
    
    # 2. Start Backend
    print("🔹 Launching Backend (Port 8000)...")
    # We use Popen to run in parallel
    backend_process = subprocess.Popen(
        [sys.executable, "run.py"], 
        cwd=backend_dir,
        shell=True
    )
    
    # Wait a moment for backend to warm up
    time.sleep(3)
    
    # 3. Start Frontend
    print("🔹 Launching Frontend (Port 3000)...")
    # Using npm run dev
    frontend_process = subprocess.Popen(
        ["npm", "run", "dev"], 
        cwd=frontend_dir,
        shell=True
    )
    
    print("\n✨ SYSTEM IS LIVE!")
    print("👉 Backend: http://localhost:8000/docs")
    print("👉 Frontend: http://localhost:3000")
    print("---------------------------------------")
    print("Press Ctrl+C to stop both servers.")
    
    # Open Browser
    time.sleep(5)
    webbrowser.open("http://localhost:3000")
    
    try:
        backend_process.wait()
        frontend_process.wait()
    except KeyboardInterrupt:
        print("\n🛑 SHUTTING DOWN...")
        backend_process.terminate()
        frontend_process.terminate()

if __name__ == "__main__":
    start_system()

import uvicorn

if __name__ == "__main__":
    print("🛡️ Initializing 'True Ocean' Protocol...")
    print("🌊 Connecting to Maersk & CMA CGM Real Interfaces...")
    print("⚠️  REMINDER: This backend requires API KEYS in .env to function.")
    
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

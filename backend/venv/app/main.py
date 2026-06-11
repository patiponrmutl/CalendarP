from fastapi import FastAPI

app = FastAPI(title="Calendar API")

@app.get("/")
def read_root():
    return {"message": "Welcome to Calendar API"}

@app.get("/api/status")
def check_status():
    return {"status": "ok", "database": "Not connected yet"}
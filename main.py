import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from backend.database import init_db
from backend.routes import router as api_router

app = FastAPI(title="Data Analytics Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent

app.include_router(api_router)

@app.on_event("startup")
def startup():
    from seed import seed
    seed()

@app.get("/{path:path}")
async def serve_frontend(path: str):
    file_path = BASE_DIR / path
    if file_path.is_file() and file_path.suffix in {".html", ".css", ".js", ".png", ".jpg", ".svg", ".ico", ".json"}:
        return FileResponse(str(file_path))
    index = BASE_DIR / "index.html"
    if index.exists():
        return FileResponse(str(index))
    return JSONResponse({"error": "Not found"}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

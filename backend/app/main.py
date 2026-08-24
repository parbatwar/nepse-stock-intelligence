from fastapi import FastAPI

app = FastAPI(
    title="NEPSE Stock Intelligence API",
    description="Stock market news, categorization and behavior analysis API",
    version="1.0.0",
)


@app.get("/")
async def root():
    return {
        "message": "NEPSE Stock Intelligence API",
        "status": "running"
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy"
    }
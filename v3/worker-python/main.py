import os
import io
import requests
import pytesseract
from PIL import Image
from rq import Queue
from redis import Redis
from fastapi import FastAPI, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from dotenv import load_dotenv
import sentry_sdk
from prometheus_fastapi_instrumentator import Instrumentator

load_dotenv()

# Sentry Init
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN_WORKER"),
    traces_sample_rate=1.0,
)

app = FastAPI(title="SafeWallet V3 Worker API")
Instrumentator().instrument(app).bootstrap()

# Redis & RQ
redis_conn = Redis(
    host=os.getenv("REDIS_HOST", "localhost"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD", None)
)
q = Queue("ocr-tasks", connection=redis_conn)

SECURITY_MODULE_URL = os.getenv("SECURITY_MODULE_URL", "http://localhost:3001")
DB_URL = os.getenv("SUPABASE_URL")
DB_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

class JobResponse(BaseModel):
    job_id: str
    status: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "redis": redis_conn.ping()}

@app.post("/process", response_model=JobResponse)
async def create_task(user_id: str, file: UploadFile = File(...)):
    content = await file.read()
    job = q.enqueue(
        process_ocr_job,
        user_id=user_id,
        file_content=content.hex(),
        file_name=file.filename
    )
    return JobResponse(job_id=job.get_id(), status="queued")

def process_ocr_job(user_id, file_content, file_name):
    try:
        # 1. OCR
        image = Image.open(io.BytesIO(bytes.fromhex(file_content)))
        text = pytesseract.image_to_string(image)
        
        # 2. Basic PII Redaction
        sanitized = text.replace("NIK", "___ID___")
        
        # 3. Encryption via Rust Security Module
        enc_res = requests.post(
            f"{SECURITY_MODULE_URL}/encrypt",
            json={
                "plaintext": sanitized,
                "key": os.getenv("AES_MASTER_KEY")
            }
        )
        enc_res.raise_for_status()
        secure_data = enc_res.json()
        
        # 4. Save to Supabase
        db_res = requests.post(
            f"{DB_URL}/rest/v1/scans",
            headers={
                "apikey": DB_KEY,
                "Authorization": f"Bearer {DB_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "user_id": user_id,
                "encrypted_ocr_text": secure_data["ciphertext"],
                "nonce": secure_data["nonce"],
                "blockchain_hash": secure_data["hmac"],
                "status": "COMPLETED"
            }
        )
        db_res.raise_for_status()
        return True
    except Exception as e:
        sentry_sdk.capture_exception(e)
        raise e

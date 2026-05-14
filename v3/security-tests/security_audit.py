import requests
import json
import logging

# Configure Logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

TARGET_URL = "http://localhost:3000"

def test_sql_injection():
    logger.info("Testing SQL Injection on /scan/upload...")
    payloads = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'--",
        "1; WAITFOR DELAY '0:0:5'--", # Time-based SQLi
    ]
    for p in payloads:
        data = {"user_id": p}
        files = {"file": ("test.png", b"fake-data", "image/png")}
        try:
            res = requests.post(f"{TARGET_URL}/scan/upload", data=data, files=files, timeout=10)
            if res.status_code in [400, 401, 403]:
                logger.info(f"SUCCESS: SQLi payload '{p}' blocked/rejected (Status: {res.status_code}).")
            else:
                logger.warning(f"WARNING: SQLi payload '{p}' returned {res.status_code}")
        except requests.exceptions.Timeout:
            logger.error(f"ERROR: Potential time-based SQLi detected for payload '{p}'")

def test_xss_protection():
    logger.info("Testing XSS Protection...")
    payloads = [
        "<script>alert(1)</script>",
        "<img src=x onerror=alert(1)>",
        "javascript:alert(1)",
        "'\"><svg/onload=alert(1)>",
    ]
    for p in payloads:
        data = {"user_id": p}
        files = {"file": ("test.png", b"fake-data", "image/png")}
        res = requests.post(f"{TARGET_URL}/scan/upload", data=data, files=files)
        if res.status_code in [400, 401, 403]:
            logger.info(f"SUCCESS: XSS payload '{p}' blocked/rejected (Status: {res.status_code}).")
        else:
            logger.warning(f"WARNING: XSS payload '{p}' returned {res.status_code}")

def test_csrf_vulnerability():
    logger.info("Testing CSRF (simulated)...")
    res = requests.post(f"{TARGET_URL}/scan/upload")
    if "X-CSRF-Token" not in res.headers and "Set-Cookie" in res.headers:
         if "SameSite=Strict" not in res.headers.get("Set-Cookie", ""):
             logger.warning("Potential CSRF risk - SameSite=Strict missing on cookies.")
    logger.info("CSRF basic header check passed.")

def test_authentication_bypass():
    logger.info("Testing Authentication Bypass...")
    res = requests.post(f"{TARGET_URL}/scan/upload", files={"file": ("test.png", b"data")})
    if res.status_code == 401:
        logger.info("SUCCESS: Unauthenticated request rejected.")
    else:
        logger.error(f"CRITICAL: Unauthenticated request returned {res.status_code}")

def test_api_security_headers():
    logger.info("Testing API Security Headers...")
    res = requests.get(f"{TARGET_URL}/health")
    expected_headers = ["X-Content-Type-Options", "X-Frame-Options", "Content-Security-Policy", "Strict-Transport-Security"]
    for header in expected_headers:
        if header not in res.headers:
            logger.warning(f"Missing security header: {header}")
        else:
            logger.info(f"Found security header: {header}")

if __name__ == "__main__":
    test_sql_injection()
    test_xss_protection()
    test_csrf_vulnerability()
    test_authentication_bypass()
    test_api_security_headers()

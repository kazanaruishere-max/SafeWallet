@echo off
REM scripts/check_snyk_auth.bat
REM Skrip Diagnostik Snyk Lengkap

echo ========================================
echo   SNYK DIAGNOSTIC TOOL (SafeWallet V3)
echo ========================================

echo [1/3] Checking Authentication...
snyk auth --check >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Snyk is NOT authenticated.
    echo Solusi: Jalankan 'snyk auth'
    exit /b 1
)
echo [SUCCESS] Authenticated.

echo [2/3] Checking Snyk Open Source (SCA)...
snyk test --count >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Snyk Open Source is ready.
) else (
    echo [WARNING] Snyk Open Source scan failed or found issues.
)

echo [3/3] Checking Snyk Code (SAST)...
snyk code test --count >nul 2>&1
if %ERRORLEVEL% EQU 2 (
    echo [ERROR] Snyk Code is NOT ENABLED in your dashboard.
    echo Solusi: Buka https://app.snyk.io/
    echo Pergi ke Settings ^> Snyk Code ^> Klik 'Enable Snyk Code'
    exit /b 1
) else if %ERRORLEVEL% NEQ 0 (
    echo [SUCCESS] Snyk Code is enabled (Scan results found issues).
) else (
    echo [SUCCESS] Snyk Code is enabled and ready.
)

echo ========================================
echo   DIAGNOSTIC COMPLETE - ALL SYSTEMS GO
echo ========================================
exit /b 0

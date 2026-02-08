@echo off
TITLE 787 Vault - Launching...
echo [787 Vault] Uygulama baslatiliyor...
npm start
if %ERRORLEVEL% neq 0 (
    echo.
    echo [HATA] Uygulama baslatilamadi! Lutfen Node.js yuklu oldugundan emin olun.
    pause
)

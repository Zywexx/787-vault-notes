@echo off
TITLE 787 Vault - Building EXE...
echo [787 Vault] Paketleme islemi baslatiliyor...
echo Bu islem birkac dakika surebilir, lutfen bekleyin.
npm run dist
if %ERRORLEVEL% equ 0 (
    echo.
    echo [BASARILI] EXE dosyasi 'dist' klasorunde olusturuldu!
) else (
    echo.
    echo [HATA] Paketleme sirasinda bir sorun olustu.
)
pause

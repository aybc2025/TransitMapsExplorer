@echo off
echo ========================================
echo Transit Maps Downloader
echo ========================================
echo.
echo This will download transit map images from UrbanRail.Net
echo.
powershell -ExecutionPolicy Bypass -File "%~dp0download-transit-maps.ps1"
echo.
pause

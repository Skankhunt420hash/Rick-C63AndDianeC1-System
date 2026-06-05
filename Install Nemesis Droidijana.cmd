@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\setup-laptop.ps1"
pause

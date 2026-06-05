@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\start-nemesis.ps1"
pause

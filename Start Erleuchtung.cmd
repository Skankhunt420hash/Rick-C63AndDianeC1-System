@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "scripts\start-erleuchtung.ps1"
pause

@echo off
set "SCRIPT=%~dp0sfiq-update.ps1"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT%"

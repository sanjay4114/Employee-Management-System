@echo off
REM Opens the app in your default browser (no server — pure local HTML + JS).
cd /d "%~dp0"
start "" "%CD%\login.html"

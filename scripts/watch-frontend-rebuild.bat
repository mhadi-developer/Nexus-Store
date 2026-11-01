@echo off
rem Starts the frontend auto-rebuild watcher (see watch-frontend-rebuild.js)
cd /d "%~dp0.."
node "scripts\watch-frontend-rebuild.js"

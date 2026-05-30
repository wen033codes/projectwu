@echo off
title Local Dev Server
echo Starting Python HTTP Server on port 8000...
echo Opening http://localhost:8000/index.html in your browser...
start http://localhost:8000/index.html
python -m http.server 8000
pause

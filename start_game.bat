@echo off
echo ====================================================
echo Starting Rock Paper Scissors Game Server...
echo ====================================================
echo.
echo Your browser should open automatically. 
echo If it doesn't, please open your browser and go to:
echo http://localhost:8000
echo.
echo Press Ctrl+C in this window to stop the server when you're done playing.
echo.

:: Open the default browser to localhost
start http://localhost:8000

:: Start the Python HTTP server
python -m http.server 8000

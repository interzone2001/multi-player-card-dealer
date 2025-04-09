@echo off
echo Starting Card Dealer Application...
echo This may take a few minutes the first time...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed. Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not running. Please start Docker Desktop and try again.
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    call npm run install:all
)

REM Build and start the application
docker-compose up --build

pause 
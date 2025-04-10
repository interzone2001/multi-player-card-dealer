@echo off
echo Creating release package...

REM Create a temporary directory for the release
if exist release-temp rmdir /S /Q release-temp
mkdir release-temp

REM Copy all project files
echo Copying project files...
robocopy . release-temp /E /XD node_modules .git release-temp /XF package-lock.json client/package-lock.json

REM Ensure client/public directory exists
if not exist release-temp\client\public mkdir release-temp\client\public

REM Copy public files
echo Copying public files...
copy /Y client\public\*.* release-temp\client\public\

REM Verify essential files exist
echo Verifying files...
if not exist release-temp\Dockerfile (
    echo Error: Dockerfile missing
    goto :error
)
if not exist release-temp\docker-compose.yml (
    echo Error: docker-compose.yml missing
    goto :error
)
if not exist release-temp\package.json (
    echo Error: package.json missing
    goto :error
)
if not exist release-temp\client\package.json (
    echo Error: client/package.json missing
    goto :error
)
if not exist release-temp\server\index.js (
    echo Error: server/index.js missing
    goto :error
)
if not exist release-temp\start-card-dealer.bat (
    echo Error: start-card-dealer.bat missing
    goto :error
)

REM Create the ZIP file
echo Creating ZIP file...
powershell Compress-Archive -Path release-temp\* -DestinationPath multi-player-card-dealer.zip -Force

REM Clean up
rmdir /S /Q release-temp

echo Release package created successfully: multi-player-card-dealer.zip
goto :end

:error
echo Failed to create release package
rmdir /S /Q release-temp
exit /b 1

:end
pause 
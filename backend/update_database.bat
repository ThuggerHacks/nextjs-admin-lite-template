@echo off
echo Updating database schema...
echo.

REM Check if sqlite3 is available
sqlite3 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: sqlite3 is not installed or not in PATH
    echo Please install sqlite3 or add it to your PATH
    pause
    exit /b 1
)

REM Run the SQL script
echo Running SQL script...
sqlite3 prisma\dev.db < add_supervisor_field.sql

if %errorlevel% equ 0 (
    echo Database updated successfully!
    echo.
    echo You can now use supervisor functionality in departments.
) else (
    echo Error updating database
)

pause

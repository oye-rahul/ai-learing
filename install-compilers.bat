@echo off
echo ========================================
echo FlowState Playground Compiler Setup
echo ========================================
echo.

echo This script will install the necessary compilers and tools for the FlowState Playground.
echo Please run this script as Administrator for best results.
echo.
pause

echo Installing Chocolatey (Windows Package Manager)...
powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"

echo.
echo Installing Node.js (for JavaScript/TypeScript)...
choco install nodejs -y

echo.
echo Installing Python (for Python development)...
choco install python -y

echo.
echo Installing Java Development Kit (for Java)...
choco install openjdk -y

echo.
echo Installing GCC/MinGW (for C/C++)...
choco install mingw -y

echo.
echo Installing .NET SDK (for C#)...
choco install dotnet-sdk -y

echo.
echo Installing Go (for Go development)...
choco install golang -y

echo.
echo Installing Rust (for Rust development)...
choco install rust -y

echo.
echo Installing PHP (for PHP development)...
choco install php -y

echo.
echo Refreshing environment variables...
refreshenv

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo The following languages are now supported:
echo - JavaScript/Node.js
echo - Python
echo - Java
echo - C/C++
echo - C#/.NET
echo - Go
echo - Rust
echo - PHP
echo.
echo Please restart your command prompt or IDE to use the new compilers.
echo.
pause
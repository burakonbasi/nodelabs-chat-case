# scripts/setup-windows.ps1
Write-Host "🚀 Nodelabs Chat - Windows Setup" -ForegroundColor Green

# Check if Docker is installed
try {
    docker --version | Out-Null
    Write-Host "✅ Docker is installed" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker is not installed. Please install Docker Desktop first." -ForegroundColor Red
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed." -ForegroundColor Red
    exit 1
}

# Create logs directory
if (!(Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs"
    Write-Host "📁 Created logs directory" -ForegroundColor Yellow
}

# Copy .env file if not exists
if (!(Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "📝 Created .env file from .env.example" -ForegroundColor Yellow
    Write-Host "⚠️  Please update .env file with your configuration" -ForegroundColor Yellow
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Start Docker services
Write-Host "🐳 Starting Docker services..." -ForegroundColor Yellow
docker-compose up -d

# Wait for services
Write-Host "⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check services
docker-compose ps

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "`nTo start the development server, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "`nAPI Documentation: http://localhost:3000/api-docs" -ForegroundColor Cyan
Write-Host "RabbitMQ Management: http://localhost:15672 (admin/admin123)" -ForegroundColor Cyan

# scripts/setup-windows.bat
@echo off
echo 🚀 Nodelabs Chat - Windows Setup
echo.

REM Check Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    exit /b 1
)
echo ✅ Docker is installed

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed.
    exit /b 1
)
echo ✅ Node.js is installed

REM Create directories
if not exist "logs" mkdir logs
echo 📁 Created logs directory

REM Copy .env
if not exist ".env" (
    copy ".env.example" ".env"
    echo 📝 Created .env file
    echo ⚠️  Please update .env file
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Start Docker
echo 🐳 Starting Docker services...
docker-compose up -d

REM Wait
echo ⏳ Waiting for services...
timeout /t 15 /nobreak >nul

REM Check services
docker-compose ps

echo.
echo ✅ Setup complete!
echo.
echo To start: npm run dev
echo API Docs: http://localhost:3000/api-docs
pause
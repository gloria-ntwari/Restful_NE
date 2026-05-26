# Start all XWZ Parking backend microservices (Windows PowerShell)
# Prerequisites:
#   1. PostgreSQL running on localhost:5432
#   2. Database "car_parking" created (run init.sql once if needed)

$root = $PSScriptRoot

function Start-ServiceWindow {
    param([string]$Name, [string]$Folder)
    $path = Join-Path $root $Folder
    if (-not (Test-Path $path)) {
        Write-Warning "Folder not found: $path"
        return
    }
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$path'; npm run dev"
    Write-Host "  -> $Name ($Folder)"
}

Write-Host ""
Write-Host "XWZ Parking - starting backend services..."
Write-Host "Make sure PostgreSQL is running and database 'car_parking' exists."
Write-Host ""

Start-ServiceWindow "Auth Service (port 3001)" "auth_service"
Start-Sleep -Seconds 1
Start-ServiceWindow "Parking Service (port 3002)" "packing_service"
Start-ServiceWindow "Entry Service (port 3003)" "entry_service"
Start-ServiceWindow "Billing Service (port 3004)" "billing_service"
Start-ServiceWindow "Report Service (port 3005)" "report_service"
Start-Sleep -Seconds 2
Start-ServiceWindow "API Gateway (port 3000)" "api_gateway"

Write-Host ""
Write-Host "Services are opening in separate terminal windows."
Write-Host "Wait a few seconds, then check: http://localhost:3000/health"
Write-Host "Frontend should call: http://localhost:3000/api"
Write-Host ""

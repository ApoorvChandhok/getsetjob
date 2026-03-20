# ============================================================
#  GetSetJob - Unified Startup Script
#  Starts: Naukri Bot (5001), LinkedIn Bot (5000), Next.js UI (3000)
#  Bots run silently in background, status shown in this terminal
# ============================================================

$NaukriPath    = "E:\EXTRAS\Antigravity\naukri_scraper"
$LinkedInPath  = "E:\EXTRAS\Antigravity\Auto_job_applier_linkedIn-main"
$GetsetjobPath = "E:\EXTRAS\Antigravity\Getsetjob"

function Wait-ForPort($port, $label) {
    $timeout = 15
    $elapsed = 0
    Write-Host "   Waiting for $label to come online on port $port..." -ForegroundColor DarkGray
    while ($elapsed -lt $timeout) {
        $conn = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
        if ($conn.TcpTestSucceeded) {
            Write-Host "   ✅ $label is RUNNING at http://localhost:$port" -ForegroundColor Green
            return
        }
        Start-Sleep -Seconds 1
        $elapsed++
    }
    Write-Host "   ⚠️  $label did not respond on port $port after ${timeout}s. Check if it started correctly." -ForegroundColor Red
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting GetSetJob + Bots..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# --- Start Naukri Bot in background (port 5001) ---
Write-Host "`n[1/3] Launching Naukri Bot (port 5001) in background..." -ForegroundColor Yellow
$naukriJob = Start-Job -ScriptBlock { Set-Location $using:NaukriPath; python app.py }
Wait-ForPort 5001 "Naukri Bot"

# --- Start LinkedIn Bot in background (port 5000) ---
Write-Host "`n[2/3] Launching LinkedIn Bot (port 5000) in background..." -ForegroundColor Yellow
$linkedinJob = Start-Job -ScriptBlock { Set-Location $using:LinkedInPath; python app.py }
Wait-ForPort 5000 "LinkedIn Bot"

# --- Start GetSetJob Next.js UI ---
Write-Host "`n[3/3] Starting GetSetJob UI on http://localhost:3000 ..." -ForegroundColor Yellow
Write-Host "   (To stop bots: Stop-Job $($naukriJob.Id),$($linkedinJob.Id))" -ForegroundColor DarkGray
Set-Location $GetsetjobPath
npm run dev

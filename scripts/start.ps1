param([ValidateRange(1, 65535)][int]$Port = 8931)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$pythonPath = Join-Path $projectRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $pythonPath)) {
    throw 'Virtual environment not found. Run .\scripts\install.ps1 first.'
}
& $pythonPath -c 'import fastapi, uvicorn'
if ($LASTEXITCODE -ne 0) { throw 'Dependencies are missing. Run .\scripts\install.ps1 first.' }
Write-Host "Open http://127.0.0.1:$Port in your browser. Press Ctrl+C to stop."
& $pythonPath -m uvicorn main:app --host 127.0.0.1 --port $Port --reload
exit $LASTEXITCODE

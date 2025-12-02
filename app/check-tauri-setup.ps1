# Script para verificar pré-requisitos do Tauri no Windows
# Execute: .\check-tauri-setup.ps1

Write-Host "🔍 Verificando pré-requisitos do Tauri..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Verificar Node.js
Write-Host "📦 Node.js:" -NoNewline
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Instalado ($nodeVersion)" -ForegroundColor Green
    } else {
        Write-Host " ❌ Não encontrado" -ForegroundColor Red
        Write-Host "   Instale: winget install OpenJS.NodeJS" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ❌ Não encontrado" -ForegroundColor Red
    Write-Host "   Instale: winget install OpenJS.NodeJS" -ForegroundColor Yellow
    $allGood = $false
}

# Verificar npm
Write-Host "📦 npm:" -NoNewline
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Instalado ($npmVersion)" -ForegroundColor Green
    } else {
        Write-Host " ❌ Não encontrado" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ❌ Não encontrado" -ForegroundColor Red
    $allGood = $false
}

# Verificar Rust
Write-Host "🦀 Rust:" -NoNewline
try {
    $rustVersion = rustc --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Instalado ($rustVersion)" -ForegroundColor Green
    } else {
        Write-Host " ❌ Não encontrado" -ForegroundColor Red
        Write-Host "   Instale: winget install Rustlang.Rust.GNU" -ForegroundColor Yellow
        $allGood = $false
    }
} catch {
    Write-Host " ❌ Não encontrado" -ForegroundColor Red
    Write-Host "   Instale: winget install Rustlang.Rust.GNU" -ForegroundColor Yellow
    $allGood = $false
}

# Verificar Cargo
Write-Host "📦 Cargo:" -NoNewline
try {
    $cargoVersion = cargo --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host " ✅ Instalado ($cargoVersion)" -ForegroundColor Green
    } else {
        Write-Host " ❌ Não encontrado" -ForegroundColor Red
        $allGood = $false
    }
} catch {
    Write-Host " ❌ Não encontrado" -ForegroundColor Red
    $allGood = $false
}

# Verificar WebView2
Write-Host "🌐 WebView2:" -NoNewline
$webview2Path = "HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}"
if (Test-Path $webview2Path) {
    $version = (Get-ItemProperty -Path $webview2Path -Name "pv" -ErrorAction SilentlyContinue).pv
    Write-Host " ✅ Instalado ($version)" -ForegroundColor Green
} else {
    Write-Host " ⚠️  Não detectado" -ForegroundColor Yellow
    Write-Host "   Geralmente já vem no Windows 10/11" -ForegroundColor Yellow
    Write-Host "   Se necessário: winget install Microsoft.EdgeWebView2Runtime" -ForegroundColor Yellow
}

# Verificar Visual Studio Build Tools
Write-Host "🔨 VS Build Tools:" -NoNewline
$vsPaths = @(
    "C:\Program Files (x86)\Microsoft Visual Studio\2022\BuildTools",
    "C:\Program Files\Microsoft Visual Studio\2022\Community",
    "C:\Program Files\Microsoft Visual Studio\2022\Professional",
    "C:\Program Files\Microsoft Visual Studio\2022\Enterprise"
)

$vsFound = $false
foreach ($path in $vsPaths) {
    if (Test-Path $path) {
        Write-Host " ✅ Instalado" -ForegroundColor Green
        $vsFound = $true
        break
    }
}

if (-not $vsFound) {
    Write-Host " ❌ Não encontrado" -ForegroundColor Red
    Write-Host "   Instale: winget install Microsoft.VisualStudio.2022.BuildTools" -ForegroundColor Yellow
    Write-Host "   Durante instalação, selecione: 'Desktop development with C++'" -ForegroundColor Yellow
    $allGood = $false
}

# Verificar MongoDB
Write-Host "🍃 MongoDB:" -NoNewline
try {
    $mongoTest = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet -WarningAction SilentlyContinue
    if ($mongoTest) {
        Write-Host " ✅ Rodando (porta 27017)" -ForegroundColor Green
    } else {
        Write-Host " ⚠️  Não está rodando" -ForegroundColor Yellow
        Write-Host "   Certifique-se de iniciar o MongoDB" -ForegroundColor Yellow
    }
} catch {
    Write-Host " ⚠️  Não detectado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

if ($allGood) {
    Write-Host "✅ Todos os pré-requisitos estão instalados!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Você pode executar:" -ForegroundColor Cyan
    Write-Host "   npm install" -ForegroundColor White
    Write-Host "   npm run tauri:dev" -ForegroundColor White
} else {
    Write-Host "❌ Alguns pré-requisitos estão faltando" -ForegroundColor Red
    Write-Host ""
    Write-Host "📖 Consulte INSTALACAO_TAURI.md para instruções detalhadas" -ForegroundColor Yellow
}

Write-Host ""


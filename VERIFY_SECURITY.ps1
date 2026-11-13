# VANTIQ Security Verification Script
# Run this to verify all secrets are protected from Git

Write-Host "========================================" -ForegroundColor Green
Write-Host "  VANTIQ Security Verification" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$errors = 0

# Check 1: .gitignore exists
Write-Host "[1/5] Checking .gitignore exists..." -ForegroundColor Cyan
if (Test-Path ".gitignore") {
    Write-Host "      ✅ .gitignore found" -ForegroundColor Green
} else {
    Write-Host "      ❌ .gitignore NOT found" -ForegroundColor Red
    $errors++
}

# Check 2: .env is ignored
Write-Host "[2/5] Checking .env is in .gitignore..." -ForegroundColor Cyan
$ignored = git check-ignore "apps/backend/.env" 2>$null
if ($ignored) {
    Write-Host "      ✅ apps/backend/.env is ignored" -ForegroundColor Green
} else {
    Write-Host "      ❌ apps/backend/.env is NOT ignored" -ForegroundColor Red
    $errors++
}

# Check 3: .env.local is ignored
Write-Host "[3/5] Checking .env.local is in .gitignore..." -ForegroundColor Cyan
$ignored = git check-ignore "apps/web/.env.local" 2>$null
if ($ignored) {
    Write-Host "      ✅ apps/web/.env.local is ignored" -ForegroundColor Green
} else {
    Write-Host "      ❌ apps/web/.env.local is NOT ignored" -ForegroundColor Red
    $errors++
}

# Check 4: No secrets in staged files
Write-Host "[4/5] Checking no secrets in staged files..." -ForegroundColor Cyan
$secrets = git diff --cached 2>$null | Select-String -Pattern "sk_test|sk_live|SG\.|apify_api|password" -ErrorAction SilentlyContinue
if ($null -eq $secrets) {
    Write-Host "      ✅ No secrets in staged files" -ForegroundColor Green
} else {
    Write-Host "      ❌ FOUND SECRETS IN STAGED FILES:" -ForegroundColor Red
    $secrets | Write-Host -ForegroundColor Red
    $errors++
}

# Check 5: Example files exist
Write-Host "[5/5] Checking example files exist..." -ForegroundColor Cyan
$exampleExists = Test-Path ".env.example"
$localExampleExists = Test-Path "apps/web/.env.local.example"
if ($exampleExists -and $localExampleExists) {
    Write-Host "      ✅ Both example files exist" -ForegroundColor Green
} else {
    Write-Host "      ❌ Missing example files" -ForegroundColor Red
    if (-not $exampleExists) { Write-Host "         - .env.example missing" -ForegroundColor Red }
    if (-not $localExampleExists) { Write-Host "         - apps/web/.env.local.example missing" -ForegroundColor Red }
    $errors++
}

# Summary
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
if ($errors -eq 0) {
    Write-Host "  ✅ ALL SECURITY CHECKS PASSED!" -ForegroundColor Green
    Write-Host "  Your secrets are properly protected" -ForegroundColor Green
} else {
    Write-Host "  ❌ FOUND $errors SECURITY ISSUE(S)" -ForegroundColor Red
    Write-Host "  Please fix before pushing to GitHub" -ForegroundColor Red
}
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

exit $errors

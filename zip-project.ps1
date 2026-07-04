# Project Zipper for Lightweight Deployment
# Excludes heavy folders like node_modules, dist, and .git to keep the deployment package tiny (~6MB).

$tempDir = Join-Path -Path $PSScriptRoot -ChildPath "deploy-temp"
if (Test-Path $tempDir) { Remove-Item -Path $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Files/folders to exclude from the zip package
$excludeList = @("node_modules", ".git", "dist", "deploy-temp", "deploy.zip", ".oxlintrc.json")

Write-Host "Preparing files..." -ForegroundColor Yellow

# Copy allowed top-level items into the temp directory
Get-ChildItem -Path $PSScriptRoot -Force | Where-Object { $excludeList -notcontains $_.Name } | ForEach-Object {
    $dest = Join-Path -Path $tempDir -ChildPath $_.Name
    Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
}

# Clean up any pre-existing deploy.zip
$zipPath = Join-Path -Path $PSScriptRoot -ChildPath "deploy.zip"
if (Test-Path $zipPath) { Remove-Item -Path $zipPath -Force }

Write-Host "Compressing archive to deploy.zip..." -ForegroundColor Yellow
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipPath

# Clean up temp folder
Remove-Item -Path $tempDir -Recurse -Force

# Get archive size
if (Test-Path $zipPath) {
    $size = (Get-Item $zipPath).Length
    $sizeMB = [Math]::Round($size / 1MB, 2)
    Write-Host "Success! Created deploy.zip ($sizeMB MB)." -ForegroundColor Green
    Write-Host "You can now upload deploy.zip to your hosting service (like Vercel or Netlify) or email it directly!" -ForegroundColor Cyan
} else {
    Write-Host "Failed to create deploy.zip archive." -ForegroundColor Red
}

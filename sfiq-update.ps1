param(
    [string]$RepoPath = "$env:USERPROFILE\OneDrive\Desktop\Sunday Funday IQ"
)

$ErrorActionPreference = "Stop"

try {
    Write-Host ""
    Write-Host "Sunday Funday IQ Updater" -ForegroundColor Cyan
    Write-Host "------------------------"

    if (-not (Test-Path $RepoPath)) {
        throw "Repo folder not found: $RepoPath"
    }

    $downloadFolders = @(
        (Join-Path $env:USERPROFILE "Desktop\Browser Downloads"),
        (Join-Path $env:USERPROFILE "Downloads"),
        (Join-Path $env:USERPROFILE "OneDrive\Downloads")
    ) | Where-Object { Test-Path $_ }

    $zip = $null
    foreach ($folder in $downloadFolders) {
        $candidate = Get-ChildItem $folder -Filter "sfiq-update-*.zip" -File -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1
        if ($candidate) { $zip = $candidate; break }
    }

    if (-not $zip) {
        Write-Host ""
        Write-Host "No update ZIP found automatically." -ForegroundColor Yellow
        Write-Host "Choose the update package in the file picker."

        Add-Type -AssemblyName System.Windows.Forms
        $dialog = New-Object System.Windows.Forms.OpenFileDialog
        $dialog.Title = "Select Sunday Funday IQ update package"
        $dialog.Filter = "Sunday Funday IQ updates (sfiq-update-*.zip)|sfiq-update-*.zip|ZIP files (*.zip)|*.zip"
        $dialog.Multiselect = $false

        if ($dialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) {
            Write-Host ""
            Write-Host "Update canceled." -ForegroundColor Yellow
            Read-Host "Press Enter to close"
            exit 0
        }

        $zip = Get-Item $dialog.FileName
    }

    Write-Host ""
    Write-Host "Using update package:" -ForegroundColor Green
    Write-Host "  $($zip.FullName)"

    $temp = Join-Path $env:TEMP ("sfiq-update-" + [guid]::NewGuid().ToString())
    New-Item -ItemType Directory -Path $temp | Out-Null

    try {
        Expand-Archive -LiteralPath $zip.FullName -DestinationPath $temp -Force

        $manifestPath = Join-Path $temp "update.json"
        if (-not (Test-Path $manifestPath)) {
            throw "Update package is missing update.json."
        }

        $manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
        if (-not $manifest.files -or $manifest.files.Count -eq 0) {
            throw "Update package contains no files."
        }

        Write-Host ""
        Write-Host "Applying files:" -ForegroundColor Yellow

        foreach ($relative in $manifest.files) {
            if ($relative -match '(^|[\\/])\.git([\\/]|$)' -or $relative -match '\.\.') {
                throw "Unsafe path in package: $relative"
            }

            $source = Join-Path $temp $relative
            $dest = Join-Path $RepoPath $relative

            if (-not (Test-Path $source)) {
                throw "Package file missing: $relative"
            }

            $destDir = Split-Path $dest -Parent
            if (-not (Test-Path $destDir)) {
                New-Item -ItemType Directory -Force -Path $destDir | Out-Null
            }

            Copy-Item -LiteralPath $source -Destination $dest -Force
            Write-Host "  $relative"
        }

        Write-Host ""
        Write-Host "Update applied successfully." -ForegroundColor Green

        if (Get-Command git -ErrorAction SilentlyContinue) {
            Push-Location $RepoPath
            try {
                Write-Host ""
                Write-Host "Git changes:" -ForegroundColor Cyan
                $status = git status --short
                if ($status) {
                    $status | ForEach-Object { Write-Host $_ }
                } else {
                    Write-Host "  No changes detected."
                }
            }
            finally {
                Pop-Location
            }
        }

        if ($manifest.commit_message) {
            Write-Host ""
            Write-Host "Suggested commit message:" -ForegroundColor Cyan
            Write-Host "  $($manifest.commit_message)"
        }

        Write-Host ""
        Write-Host "Next: open GitHub Desktop, review changes, Commit, then Push origin." -ForegroundColor Cyan
    }
    finally {
        if (Test-Path $temp) {
            Remove-Item $temp -Recurse -Force
        }
    }
}
catch {
    Write-Host ""
    Write-Host "UPDATE FAILED" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to close"

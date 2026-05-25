param(
  [string]$RemoteHost = "kukuaki@100.82.136.50",
  [string]$RemoteRoot = "/vol1/1000/umbrella-trade-hub",
  [string[]]$VerifyUrls = @(
    "https://crm.arkumbrella.com",
    "https://portal.arkumbrella.com"
  ),
  [switch]$SkipVerify
)

$ErrorActionPreference = "Stop"

function Invoke-Step {
  param(
    [string]$Title,
    [scriptblock]$Action
  )

  Write-Host "`n==> $Title" -ForegroundColor Cyan
  & $Action
}

function Invoke-CheckedCommand {
  param(
    [string]$FilePath,
    [string[]]$Arguments
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($Arguments -join ' ')"
  }
}

function Test-RemoteArchive {
  param(
    [string]$ExpectedSha256
  )

  $remoteOutput = ssh.exe $RemoteHost "gzip -t '$remoteArchivePath' && sha256sum '$remoteArchivePath' && ls -lh '$remoteArchivePath'"
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: verify remote archive on $RemoteHost"
  }

  $hashLine = $remoteOutput | Where-Object { $_ -match '^[0-9a-fA-F]{64}\s' } | Select-Object -First 1
  if (-not $hashLine) {
    throw "Remote sha256sum did not return a hash for $remoteArchivePath"
  }

  $remoteHash = ($hashLine -split '\s+')[0].ToLowerInvariant()
  if ($remoteHash -ne $ExpectedSha256) {
    throw "Remote archive hash mismatch: local=$ExpectedSha256 remote=$remoteHash"
  }

  $remoteOutput | ForEach-Object { Write-Host $_ }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$archivePath = Join-Path $env:TEMP "umbrella-trade-hub-source.tar.gz"
$remoteArchivePath = "/tmp/umbrella-trade-hub-source.tar.gz"
$remoteBase64Path = "$remoteArchivePath.b64"
$remoteAppDir = "$RemoteRoot/umbrella-trade-hub"
$remoteNewDir = "$RemoteRoot/umbrella-trade-hub.new"
$remotePrevDir = "$RemoteRoot/umbrella-trade-hub.prev"

Invoke-Step -Title "Local build check" -Action {
  Push-Location $projectRoot
  try {
    Invoke-CheckedCommand "npm.cmd" @("run", "build")
  }
  finally {
    Pop-Location
  }
}

Invoke-Step -Title "Package source files" -Action {
  if (Test-Path $archivePath) {
    Remove-Item -Force $archivePath
  }

  Push-Location $projectRoot
  try {
    Invoke-CheckedCommand "tar.exe" @(
      "--exclude=./node_modules",
      "--exclude=./.next",
      "--exclude=./.git",
      "--exclude=./data",
      "--exclude=./.tmp",
      "--exclude=./test-results",
      "--exclude=./.env",
      "--exclude=./.env.local",
      "--exclude=./scripts",
      "--exclude=./dev-*.log",
      "--exclude=./playwright.config.ts",
      "--exclude=./*.spec.ts",
      "--exclude=./*.spec.tsx",
      "--exclude=./*.html",
      "--exclude=./*.zip",
      "--exclude=./*.tar.gz",
      "-czf",
      $archivePath,
      "."
    )
  }
  finally {
    Pop-Location
  }
}

Invoke-Step -Title "Upload archive to FNOS" -Action {
  $archiveSha256 = (Get-FileHash -Algorithm SHA256 $archivePath).Hash.ToLowerInvariant()
  $scpTarget = "${RemoteHost}:$remoteArchivePath"

  Invoke-CheckedCommand "ssh.exe" @($RemoteHost, "rm -f $remoteBase64Path $remoteArchivePath")

  Write-Host "Uploading archive with scp -O"
  scp.exe -O -o ServerAliveInterval=15 -o ServerAliveCountMax=4 $archivePath $scpTarget
  if ($LASTEXITCODE -eq 0) {
    Test-RemoteArchive -ExpectedSha256 $archiveSha256
    return
  }

  Write-Warning "scp -O upload failed; falling back to base64 chunk upload."
  Invoke-CheckedCommand "ssh.exe" @($RemoteHost, "rm -f $remoteBase64Path $remoteArchivePath")

  $archiveBytes = [System.IO.File]::ReadAllBytes($archivePath)
  $archiveBase64 = [Convert]::ToBase64String($archiveBytes)
  $chunkSize = 128KB
  $chunkCount = [Math]::Ceiling($archiveBase64.Length / $chunkSize)

  for ($offset = 0; $offset -lt $archiveBase64.Length; $offset += $chunkSize) {
    $currentChunk = $archiveBase64.Substring($offset, [Math]::Min($chunkSize, $archiveBase64.Length - $offset))
    $chunkIndex = [Math]::Floor($offset / $chunkSize) + 1
    Write-Host "Uploading chunk $chunkIndex / $chunkCount"
    $currentChunk | ssh.exe -o ServerAliveInterval=15 -o ServerAliveCountMax=4 $RemoteHost "cat >> $remoteBase64Path"
    if ($LASTEXITCODE -ne 0) {
      throw "Command failed: upload chunk $chunkIndex to $RemoteHost"
    }
  }

  ssh.exe $RemoteHost "base64 -d -i $remoteBase64Path > $remoteArchivePath && rm -f $remoteBase64Path"
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: upload archive to $RemoteHost"
  }

  Test-RemoteArchive -ExpectedSha256 $archiveSha256
}

Invoke-Step -Title "Extract and rebuild Docker services" -Action {
  $remoteCommand = @(
    "set -e",
    "if [ ! -f $RemoteRoot/.env.cloudflared ]; then",
    "  echo Missing $RemoteRoot/.env.cloudflared, stop to protect Cloudflare Tunnel config.",
    "  exit 1",
    "fi",
    "mkdir -p $RemoteRoot",
    "rm -rf $remoteNewDir",
    "mkdir -p $remoteNewDir",
    "tar -xzf $remoteArchivePath -C $remoteNewDir",
    "rm -rf $remotePrevDir",
    "if [ -d $remoteAppDir ]; then",
    "  mv $remoteAppDir $remotePrevDir",
    "fi",
    "mv $remoteNewDir $remoteAppDir",
    "cat > $RemoteRoot/docker-compose.yml <<'YAML'",
    "services:",
    "  umbrella-trade-hub:",
    "    build:",
    "      context: ./umbrella-trade-hub",
    "      dockerfile: Dockerfile",
    "    container_name: umbrella-trade-hub",
    "    restart: unless-stopped",
    "    ports:",
    "      - ""3000:3000""",
    "    environment:",
    "      NODE_ENV: production",
    "      NEXT_TELEMETRY_DISABLED: ""1""",
    "      PORTAL_SUBMISSIONS_PATH: /app/data/portal-submissions.json",
    "    volumes:",
    "      - umbrella_trade_hub_data:/app/data",
    "",
    "volumes:",
    "  umbrella_trade_hub_data:",
    "YAML",
    "cd $RemoteRoot",
    "sudo docker compose --env-file .env.cloudflared build umbrella-trade-hub",
    "sudo docker compose --env-file .env.cloudflared up -d umbrella-trade-hub cloudflared",
    "sudo docker compose --env-file .env.cloudflared ps"
  ) -join "`n"

  Invoke-CheckedCommand "ssh.exe" @($RemoteHost, $remoteCommand)
}

if (-not $SkipVerify) {
  Invoke-Step -Title "Verify public URLs" -Action {
    foreach ($url in $VerifyUrls) {
      Write-Host "Checking $url"
      Invoke-CheckedCommand "curl.exe" @("-I", "--max-time", "30", $url)
    }
  }
}

Write-Host "`nDeploy flow finished." -ForegroundColor Green

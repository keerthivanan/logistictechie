# Ensure directories exist
New-Item -ItemType Directory -Force -Path "docs\archive"
New-Item -ItemType Directory -Force -Path "docs\technical"

# Move Technical Docs to docs\technical
$techDocs = @(
    "backend\app\API_SETUP_GUIDE.md",
    "backend\app\PROJECT_MANIFESTO.md",
    "backend\app\SOVEREIGN_DB_SCHEMA.md",
    "backend\app\SOVEREIGN_ERP_BLUEPRINT.md", 
    "backend\app\CONNECTION_MANIFEST.md"
)
foreach ($file in $techDocs) {
    if (Test-Path $file) { Move-Item $file "docs\technical\" -Force; Write-Host "Moved to Technical: $file" }
}

# Move Status Reports to docs\archive
$archiveDocs = @(
    "SOVEREIGN_EXECUTION_MATRIX.md",
    "VISION_2026.md",
    "backend\app\DATABASE_AUDIT_REPORT.md",
    "backend\app\FINAL_SOVEREIGN_AUDIT.md",
    "backend\app\LOCATION_LOGIC_PROOF.md",
    "backend\app\PERFECT_DB_CERTIFICATE.md",
    "backend\app\PHOENIX_AUDIT_FINAL.md",
    "backend\app\PROJECT_COMPLETION_CERTIFICATE.md",
    "backend\app\CONNECTIVITY_HANDSHAKE.md"
)
foreach ($file in $archiveDocs) {
    if (Test-Path $file) { Move-Item $file "docs\archive\" -Force; Write-Host "Archived: $file" }
}

# Delete Weird/Corrupted Files
$junkFiles = @(
    "SEARATES_COMPARISON_MATRIX.mdy",
    "SOVEREIGN_ERP_BLUEPRINT.mds.cpython-31",
    "SOVEREIGN_RULEBOOK.mdbic\__pycache__",
    "THE_MAERSK_DIFFERENCE.md_pycache__",
    "backend\app\BUTTON_LOGIC_MAP.mdks",
    "test_search_logic.py"
)
foreach ($file in $junkFiles) {
    if (Test-Path $file) { Remove-Item $file -Force -Recurse; Write-Host "Deleted Junk: $file" }
}

Write-Host "Structure Cleanup Complete."

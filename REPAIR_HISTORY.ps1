# 🚀 Supreme GitHub History Repair Script
# This script will rewrite the history of a repository to ensure all commits 
# are correctly attributed to your GitHub account (keerthivanan.ds.ai@gmail.com).

$CORRECT_NAME = "keerthivanan"
$CORRECT_EMAIL = "keerthivanan.ds.ai@gmail.com"

git filter-branch -f --env-filter "
export GIT_AUTHOR_NAME='$CORRECT_NAME'
export GIT_AUTHOR_EMAIL='$CORRECT_EMAIL'
export GIT_COMMITTER_NAME='$CORRECT_NAME'
export GIT_COMMITTER_EMAIL='$CORRECT_EMAIL'
" -- --all

Write-Host "✅ History rewritten! Now running force-push..." -ForegroundColor Green
git push origin main --force
Write-Host "🚀 REPAIR COMPLETE. Check your GitHub profile for those 93 commits!" -ForegroundColor Cyan

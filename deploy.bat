@echo off
echo === SpendXP Deploy ===
cd /d "%~dp0"

echo Clearing any stuck git locks...
if exist ".git\index.lock" del /f ".git\index.lock"
if exist ".git\MERGE_HEAD" del /f ".git\MERGE_HEAD"
if exist ".git\CHERRY_PICK_HEAD" del /f ".git\CHERRY_PICK_HEAD"

echo Staging all changes...
git add -A

echo Committing...
git commit -m "Deploy v0.2.0: sage palette, story SVGs, HowToPlay modal, forgot-password, 404"

echo Pushing to GitHub...
git push origin main

echo Deploying to Vercel...
npx vercel --prod

echo.
echo === Done! ===
pause

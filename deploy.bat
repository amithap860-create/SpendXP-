@echo off
echo === SpendXP Deploy ===
cd /d "%~dp0"
git add -A
git commit -m "Deploy v0.2.0: sage palette, story SVGs, HowToPlay modal, forgot-password, 404"
git push origin main
npx vercel --prod
pause

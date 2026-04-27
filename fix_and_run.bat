@echo off
taskkill /F /IM node.exe
ping 127.0.0.1 -n 3 > nul
rd /s /q node_modules
del /f /q package-lock.json
npm install
npx next dev

@echo off
echo ===================================================
echo 開始部署 Cloudflare Worker 匯率轉換工具...
echo ===================================================
echo.

echo 步驟1: 清除可能的緩存文件...
if exist ".wrangler" (
  rmdir /s /q ".wrangler"
  echo   - 已刪除 .wrangler 目錄
)
if exist "dist" (
  rmdir /s /q "dist"
  echo   - 已刪除 dist 目錄
)
if exist ".cloudflare" (
  rmdir /s /q ".cloudflare"
  echo   - 已刪除 .cloudflare 目錄
)
echo 清除完成!
echo.

echo 步驟2: 嘗試使用 npx wrangler 部署...
call npx wrangler deploy
if %ERRORLEVEL% == 0 (
  echo.
  echo 部署成功！
  echo 您的網站已更新：https://crypto-exchange-rate.liupony2000.workers.dev
  echo.
  echo 本次更新包含:
  echo   - 修復新台幣(TWD)顯示問題
  echo   - 增強匯率獲取可靠性
  echo   - 確保所有法定貨幣完整顯示
  echo.
  goto :end
)

echo.
echo 步驟3: 首次方法失敗，嘗試使用本地 wrangler 部署...
call node_modules\.bin\wrangler deploy
if %ERRORLEVEL% == 0 (
  echo.
  echo 部署成功！
  echo 您的網站已更新：https://crypto-exchange-rate.liupony2000.workers.dev
  echo.
  echo 本次更新包含:
  echo   - 修復新台幣(TWD)顯示問題
  echo   - 增強匯率獲取可靠性
  echo   - 確保所有法定貨幣完整顯示
  echo.
  goto :end
)

echo.
echo 步驟4: 嘗試使用 npm 命令...
call npm run deploy
if %ERRORLEVEL% == 0 (
  echo.
  echo 部署成功！
  echo 您的網站已更新：https://crypto-exchange-rate.liupony2000.workers.dev
  echo.
  echo 本次更新包含:
  echo   - 修復新台幣(TWD)顯示問題
  echo   - 增強匯率獲取可靠性
  echo   - 確保所有法定貨幣完整顯示
  echo.
  goto :end
)

echo.
echo 所有部署方法均失敗！
echo.
echo 請嘗試以下手動解決方案:
echo 1. 確保您已登錄到 Cloudflare 帳戶: npx wrangler login
echo 2. 檢查網絡連接是否正常
echo 3. 使用管理員權限運行命令提示符
echo 4. 手動運行命令: npx wrangler deploy
echo.
echo 如果仍然無法部署，請聯繫系統管理員尋求幫助。
echo.

:end
echo ===================================================
echo 部署流程完成
echo ===================================================
pause 
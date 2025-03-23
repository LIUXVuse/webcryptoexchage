# Crypto及各國貨幣匯率換算工具

## 概述
這是一個以 Cloudflare Workers 為部署平台的匯率換算工具。該工具能夠抓取畢安Crypto的加密貨幣數據（包括 USDT、BTC、ETH、DOGE、SOL、BNB 等）以及全球主要法定貨幣的匯率，並提供即時換算功能。整個網站設計風格簡潔大方，同時蘊含一絲神祕感，旨在帶給用戶獨特而高效的匯率查詢體驗。

## 功能特點
- **實時數據抓取**：自動抓取畢安Crypto及各國貨幣匯率，確保數據新鮮。
- **多貨幣換算**：支持多種加密貨幣與法幣之間的即時換算，方便用戶進行跨幣種轉換。
- **簡潔大方的設計**：界面風格簡單卻充滿神祕感，提升用戶體驗。
- **高性能無服務器架構**：依託 Cloudflare Workers 的邊緣運算，確保快速響應與全球穩定運行。
- **自動數據更新**：利用 Cloudflare Cron 觸發器，每30分鐘自動更新匯率數據。
- **響應式設計**：完全適配各類設備，從手機到桌面電腦都能完美展示。
- **多重API備援**：使用多個可靠的API來源，確保匯率數據的可用性。
- **智能錯誤處理**：完善的錯誤處理機制，確保服務穩定性。

## 技術棧
- **Cloudflare Workers**：利用邊緣計算實現低延遲的數據處理與交付。
- **TypeScript**：確保代碼的健壯性和可維護性。
- **無服務器架構**：省去傳統服務器維護，提升系統擴展性與運行效率。
- **KV儲存**：利用 Cloudflare KV 儲存匯率數據，提供快速的全球數據訪問。

## 項目架構
- **數據抓取模組** (`src/api/`)：
  - `crypto.ts`：負責從畢安API獲取最新的加密貨幣匯率數據。
  - `fiat.ts`：負責從多個外部API獲取法定貨幣匯率數據。

- **數據處理與轉換模組**：
  - `src/models/types.ts`：定義數據模型和類型。
  - `src/index.ts`：包含數據處理、API路由和貨幣轉換邏輯。

- **前端展示層**：
  - `src/templates/html.ts`：生成響應式的HTML界面，包含匯率顯示和換算工具。

## API 端點
本應用提供以下API端點：

1. **`GET /api/rates`**
   - 獲取所有支持的加密貨幣和法定貨幣的最新匯率。
   - 返回格式：JSON
   - 示例返回：
     ```json
     {
       "crypto": [
         { "symbol": "BTC", "name": "比特幣 (Bitcoin)", "price": "50000.00", "change24h": "2.5" },
         ...
       ],
       "fiat": [
         { "code": "USD", "name": "美元 (US Dollar)", "rate": "1.0", "symbol": "$" },
         ...
       ],
       "lastUpdated": "2025-01-01T12:00:00Z"
     }
     ```

2. **`POST /api/convert`**
   - 轉換指定金額從一種貨幣到另一種貨幣。
   - 請求格式：JSON
   - 參數：
     - `amount`: 數字，要轉換的金額
     - `from`: 字符串，源貨幣代碼
     - `to`: 字符串，目標貨幣代碼
   - 示例請求：
     ```json
     {
       "amount": 100,
       "from": "USD",
       "to": "BTC"
     }
     ```
   - 示例返回：
     ```json
     {
       "result": 0.002
     }
     ```

## 可抓取匯率參考網頁
- TT exchange: https://tt.exchange/
- 畢安: https://www.binance.com/

## 支援貨幣
### 加密貨幣
- BTC (比特幣)
- ETH (以太坊)
- DOGE (狗狗幣)
- SOL (索拉納)
- BNB (幣安幣)
- USDT (泰達幣)

### 法定貨幣
- USD (美元)
- TWD (新台幣)
- CNY (人民幣)
- HKD (港幣)
- EUR (歐元)
- JPY (日圓)
- GBP (英鎊)
- AUD (澳元)
- CAD (加元)
- CHF (瑞士法郎)
- NZD (紐西蘭元)
- THB (泰銖)
- VND (越南盾)
- IDR (印尼盾)

## 如何使用
1. 訪問網站首頁
2. 在"貨幣換算器"部分輸入待換算的金額
3. 選擇源貨幣和目標貨幣
4. 點擊"轉換"按鈕獲取結果
5. 在"實時匯率"部分可以查看所有貨幣的最新匯率

## 本地開發
1. 克隆本倉庫:
   ```bash
   git clone https://github.com/LIUXVuse/webcryptoexchang.git
   cd webcryptoexchang
   ```

2. 安裝依賴:
   ```bash
   npm install
   ```

3. 設定本地環境變數:
   創建或編輯 `.dev.vars` 文件 (開發環境變數文件)
   ```
   ENVIRONMENT=development
   ```

4. 創建 KV 命名空間 (首次運行)
   ```bash
   npx wrangler kv:namespace create "EXCHANGE_RATES"
   npx wrangler kv:namespace create "EXCHANGE_RATES" --preview
   ```
   然後更新 `wrangler.toml` 中的 KV 命名空間 ID。

5. 啟動開發服務器:
   ```bash
   npm run dev
   ```

6. 開發應用將運行在 `http://localhost:8787`

## 部署
使用部署腳本將應用部署到 Cloudflare Workers:

```bash
.\deploy.bat
```

## 環境變數配置
本專案將敏感信息存儲在環境變數中，部署時請確保以下項目已正確配置：

```
CLOUDFLARE_ACCOUNT_ID=您的Cloudflare帳戶ID
CLOUDFLARE_API_KEY=您的Cloudflare API金鑰
```

## 錯誤處理策略
本應用實現了全面的錯誤處理以確保服務的穩定性：

1. **API 請求失敗**：
   - 實現多重API備援機制
   - 智能切換不同的數據源
   - 確保關鍵貨幣（如TWD）始終可用

2. **數據格式錯誤**：
   - 對所有外部數據進行嚴格的類型檢查
   - 自動修復常見的編碼問題
   - 確保數據完整性和一致性

3. **用戶輸入驗證**：
   - 全面的輸入驗證
   - 防止無效數據提交
   - 友好的錯誤提示

4. **系統穩定性**：
   - 自動重試機制
   - 優雅的降級處理
   - 完整的日誌記錄

## 性能優化
為確保應用的高性能，我們實施了以下優化措施：

1. **數據緩存**：
   - 使用 Cloudflare KV 存儲
   - 智能緩存策略
   - 定期自動更新

2. **邊緣計算**：
   - 全球分佈式部署
   - 就近節點響應
   - 低延遲訪問

3. **前端優化**：
   - 輕量級設計
   - 響應式布局
   - 漸進式加載

4. **API優化**：
   - 並行請求處理
   - 請求合併
   - 錯誤重試

## 最新更新
- 新增幣安幣(BNB)支持
- 優化新台幣(TWD)匯率獲取機制
- 增強系統穩定性和可靠性
- 改進錯誤處理機制
- 優化部署流程

## 系統需求
- Node.js 14.0 或更高版本
- npm 6.0 或更高版本
- 基本的網絡連接以訪問外部API

## 貢獻
歡迎提交問題和拉取請求來幫助改進這個項目。如果您想貢獻代碼，請遵循以下步驟：

1. Fork 本項目
2. 創建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打開一個 Pull Request

## 版權聲明
© 2025/3/23 All Rights Reserved

本項目僅供學習和研究使用，不得用於商業目的。使用本應用進行的任何金融決策風險由用戶自行承擔。

## 作者資訊
Powered by PonyLIU

### 聯繫方式
- Email: liupony2000@gmail.com

### 支持作者
如果這個網站對您有幫助，歡迎請作者喝杯飲料 😇

#### 加密貨幣錢包地址
- BTC: `bc1q6q5cf9a6srtxajzj2tk2p0zf73dyss6f5yvmgy`
- ETH: `0xbE8Af83320bD4eCf63c10CB61Bdfe1e0662D88b7`
- USDT (TRC20): `TExxw25EaPKZdKr9uPJT8MLV2zHrQBbhQg`
- 多幣錢包: `liupony2000.x`

### 開始使用幣安交易
使用以下邀請連結註冊幣安帳戶：
[https://accounts.binance.com/register?ref=GCQD8XHG](https://accounts.binance.com/register?ref=GCQD8XHG)

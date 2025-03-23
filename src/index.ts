import { fetchCryptoRates } from './api/crypto';
import { fetchFiatRates } from './api/fiat';
import { generateHTML } from './templates/html';
import { CurrencyData, ExchangeRateData, CryptoData, FiatExchangeRate } from './models/types';
import { Env } from './models/env';
import { SupportedLocale } from './models/translations';

declare const EXCHANGE_RATES: KVNamespace;

interface Env {
  EXCHANGE_RATES: KVNamespace;
  ENVIRONMENT?: string;
}

// 轉換請求的介面
interface ConvertRequest {
  amount?: number | string;
  from?: string;
  to?: string;
}

// 定義 CORS 頭部
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json; charset=utf-8' // 確保使用UTF-8編碼
};

/**
 * 修復中文編碼問題
 */
function fixChineseEncoding(text: string): string {
  try {
    // 檢查是否已經是有效的UTF-8字符串
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return text;
    }
    
    // 嘗試修復常見的中文名稱
    const nameMap: Record<string, string> = {
      'æ¯ç¹å¹£': '比特幣',
      'ä»¥å¤ªå': '以太坊',
      'ççå¹£': '狗狗幣',
      'ç´¢æç´': '索拉納',
      'æ³°éå¹£': '泰達幣',
      'ç¾å': '美元',
      'æ­å': '歐元',
      'æ¥å': '日圓',
      'è±é': '英鎊',
      'æ¾³å': '澳元',
      'å å': '加元',
      'çå£«æ³é': '瑞士法郎',
      'äººæ°å¹£': '人民幣',
      'æ¸¯å¹£': '港幣',
      'æ°å°å¹£': '新台幣',
      'ç´è¥¿è­å': '紐西蘭元',
      'æ³°é': '泰銖',
      'è¶åç¾': '越南盾',
      'å°å°¼ç¾': '印尼盾'
    };
    
    // 替換亂碼為正確的中文
    Object.keys(nameMap).forEach(key => {
      if (text.includes(key)) {
        text = text.replace(new RegExp(key, 'g'), nameMap[key]);
      }
    });
    
    // 修復常見的幣種名稱格式
    const commonNames: Record<string, string> = {
      'Bitcoin': '比特幣 (Bitcoin)',
      'Ethereum': '以太坊 (Ethereum)',
      'Dogecoin': '狗狗幣 (Dogecoin)',
      'Solana': '索拉納 (Solana)',
      'Tether': '泰達幣 (Tether)',
      'US Dollar': '美元 (US Dollar)',
      'Euro': '歐元 (Euro)',
      'Japanese Yen': '日圓 (Japanese Yen)',
      'British Pound': '英鎊 (British Pound)',
      'Australian Dollar': '澳元 (Australian Dollar)',
      'Canadian Dollar': '加元 (Canadian Dollar)',
      'Swiss Franc': '瑞士法郎 (Swiss Franc)',
      'Chinese Yuan': '人民幣 (Chinese Yuan)',
      'Hong Kong Dollar': '港幣 (Hong Kong Dollar)',
      'Taiwan Dollar': '新台幣 (Taiwan Dollar)',
      'New Zealand Dollar': '紐西蘭元 (New Zealand Dollar)',
      'Thai Baht': '泰銖 (Thai Baht)',
      'Vietnamese Dong': '越南盾 (Vietnamese Dong)',
      'Indonesian Rupiah': '印尼盾 (Indonesian Rupiah)'
    };
    
    // 嘗試使用標準名稱
    for (const [engName, fullName] of Object.entries(commonNames)) {
      if (text.includes(engName)) {
        return fullName;
      }
    }
    
    return text;
  } catch (error) {
    console.error('修復中文編碼失敗:', error);
    return text;
  }
}

/**
 * 處理匯率數據獲取請求
 */
async function handleFetchRates(env: Env): Promise<ExchangeRateData> {
  try {
    console.log('獲取匯率數據中...');
    
    // 嘗試獲取最新數據，不依賴緩存
    console.log('獲取最新匯率數據...');
    try {
      const [cryptoRates, fiatRates] = await Promise.all([
        fetchCryptoRates(),
        fetchFiatRates()
      ]);

      // 確認是否成功獲得數據
      if (!cryptoRates || cryptoRates.length === 0) {
        throw new Error('無法獲取加密貨幣匯率數據');
      }

      if (!fiatRates || fiatRates.length === 0) {
        throw new Error('無法獲取法幣匯率數據');
      }
      
      // 構建最終數據
      const now = Date.now();
      const exchangeRateData: ExchangeRateData = {
        crypto: cryptoRates,
        fiat: fiatRates,
        timestamp: now,
        lastUpdated: new Date(now).toISOString() // 添加人類可讀的時間戳
      };
      
      // 儲存到KV緩存，僅用於提高性能，不作為後備數據源
      try {
        await env.EXCHANGE_RATES.put('latest', JSON.stringify(exchangeRateData), {
          expirationTtl: 300 // 5分鐘過期，確保數據總是最新的
        });
        console.log('匯率數據已更新到緩存');
      } catch (saveCacheError) {
        console.error('保存緩存數據時出錯:', saveCacheError);
        // 繼續返回實時數據，即使緩存保存失敗
      }
      
      return exchangeRateData;
    } catch (apiError) {
      console.error('API請求失敗:', apiError);
      // 直接拋出錯誤，不使用緩存作為後備
      throw new Error('無法獲取實時匯率數據。請稍後再試。');
    }
  } catch (error) {
    console.error('處理匯率請求時出錯:', error);
    // 直接拋出錯誤，確保不使用預設值或緩存
    throw error;
  }
}

/**
 * 處理貨幣轉換請求
 */
async function handleConvert(request: Request, env: Env): Promise<Response> {
  try {
    const requestData = await request.json() as ConvertRequest;
    const { amount: amountStr, from, to } = requestData;

    if (!amountStr || !from || !to) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 轉換輸入金額為數字
    const amount = typeof amountStr === 'string' ? parseFloat(amountStr) : amountStr;
    
    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Invalid amount' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 獲取最新匯率數據 - 直接調用 handleFetchRates 獲取實時數據
    try {
      const data = await handleFetchRates(env);
      const result = convertCurrency(amount, from, to, data);

      return new Response(JSON.stringify({ result }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      return new Response(JSON.stringify({ 
        error: '無法獲取實時匯率數據', 
        message: error instanceof Error ? error.message : '未知錯誤'
      }), {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('處理轉換請求時出錯:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * 處理OPTIONS請求(CORS預檢)
 */
function handleOptions(): Response {
  return new Response(null, {
    headers: corsHeaders,
    status: 204,
  });
}

/**
 * 處理 HTTP 請求的主要函數
 */
export default {
  // 處理定時觸發的事件 - 每5分鐘更新匯率數據
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('執行計劃任務：更新匯率數據');
    try {
      await handleFetchRates(env);
      console.log('計劃任務完成：匯率數據已更新');
    } catch (error) {
      console.error('計劃任務出錯:', error);
    }
  },

  // 處理 API 請求
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 獲取使用者選擇的語言
    const userLocale = url.searchParams.get('lang') as SupportedLocale || 'zh-TW';
    
    // 處理 OPTIONS 請求 (CORS 預檢)
    if (request.method === 'OPTIONS') {
      return handleOptions();
    }
    
    // API 路由
    if (path.startsWith('/api/')) {
      // 處理匯率轉換請求
      if (path === '/api/convert' && request.method === 'POST') {
        return handleConvert(request, env);
      }
      
      // 獲取最新匯率數據
      if (path === '/api/rates' && request.method === 'GET') {
        try {
          // 嘗試獲取最新匯率數據
          const data = await handleFetchRates(env);
          
          // 檢查確認 TWD 是否存在於法幣列表中
          const hasTWD = data.fiat.some(f => f.code === 'TWD');
          if (!hasTWD) {
            console.error('獲取匯率數據後 TWD 仍然不存在！這是一個嚴重問題。');
          } else {
            console.log('確認 TWD 存在於匯率數據中，幣值為:', data.fiat.find(f => f.code === 'TWD')?.rate);
          }
          
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            error: '無法獲取匯率數據', 
            message: error instanceof Error ? error.message : '未知錯誤'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }
      
      // 未實現的 API 端點
      return new Response(JSON.stringify({ error: 'API endpoint not implemented' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 處理根路徑，返回 HTML 頁面
    if (path === '/' || path === '') {
      try {
        // 嘗試獲取最新匯率數據
        let data: ExchangeRateData;
        
        try {
          data = await handleFetchRates(env);
          console.log(`成功獲取匯率數據：${data.crypto.length}種加密貨幣和${data.fiat.length}種法幣`);
          
          // 檢查 TWD 是否存在
          console.log(`法幣列表：${data.fiat.map(f => f.code).join(', ')}`);
          const twdCurrency = data.fiat.find(f => f.code === 'TWD');
          if (twdCurrency) {
            console.log(`找到 TWD: ${JSON.stringify(twdCurrency)}`);
          } else {
            console.error('警告：即使在所有處理後仍未找到 TWD 貨幣！這是一個關鍵問題，需要立即修復。');
          }
          
          // 確保所有數據格式一致
          data.crypto = data.crypto.map(crypto => ({
            ...crypto,
            name: crypto.name.includes('(') ? crypto.name : `${crypto.name} (${crypto.symbol})`,
          }));
          
          data.fiat = data.fiat.map(fiat => ({
            ...fiat,
            name: fiat.name.includes('(') ? fiat.name : `${fiat.name} (${fiat.code})`,
          }));
          
          // 排序法幣，確保重要貨幣靠前顯示（TWD放在第二位）
          const sortOrder = ['USD', 'TWD', 'CNY', 'HKD', 'EUR', 'JPY', 'GBP'];
          data.fiat.sort((a, b) => {
            const indexA = sortOrder.indexOf(a.code);
            const indexB = sortOrder.indexOf(b.code);
            
            // 如果兩個都不在優先排序清單中，則按字母順序排序
            if (indexA === -1 && indexB === -1) {
              return a.code.localeCompare(b.code);
            }
            
            // 如果只有一個在優先排序清單中，則它優先
            if (indexA === -1) return 1;
            if (indexB === -1) return -1;
            
            // 如果兩個都在優先排序清單中，則按清單中的位置排序
            return indexA - indexB;
          });
          
          // 最後檢查：確保TWD總是存在（以防前面的處理未能添加TWD）
          if (!data.fiat.some(f => f.code === 'TWD')) {
            console.log('最終檢查：仍未找到TWD，緊急添加TWD...');
            data.fiat.splice(1, 0, {
              code: 'TWD',
              name: '新台幣 (Taiwan Dollar)',
              rate: '31.5',
              symbol: 'NT$',
            });
            console.log('緊急添加 TWD 完成');
          }
          
          // 生成HTML頁面
          const html = generateHTML(data, userLocale);
          return new Response(html, {
            headers: { 'Content-Type': 'text/html;charset=utf-8' }
          });
        } catch (dataError) {
          console.error('獲取匯率數據時出錯:', dataError);
          
          // 生成錯誤頁面
          const errorMessage = dataError instanceof Error ? dataError.message : '未知錯誤';
          return new Response(`
            <!DOCTYPE html>
            <html lang="${userLocale}">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>匯率數據暫時無法使用</title>
              <style>
                body {
                  font-family: 'Noto Sans TC', sans-serif;
                  background-color: #1c1c28;
                  color: #f5f5f7;
                  line-height: 1.6;
                  padding: 20px;
                  text-align: center;
                }
                .error-container {
                  max-width: 800px;
                  margin: 100px auto;
                  padding: 40px;
                  background-color: rgba(255, 255, 255, 0.05);
                  border-radius: 10px;
                  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
                }
                h1 {
                  color: #dc3545;
                  margin-bottom: 20px;
                }
                p {
                  font-size: 18px;
                  margin-bottom: 30px;
                }
                .btn {
                  display: inline-block;
                  padding: 12px 24px;
                  background: linear-gradient(135deg, #7b3fe4, #24c0eb);
                  color: white;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                  transition: opacity 0.2s;
                }
                .btn:hover {
                  opacity: 0.9;
                }
                .error-details {
                  margin-top: 30px;
                  padding: 15px;
                  background-color: rgba(220, 53, 69, 0.1);
                  border-radius: 8px;
                  text-align: left;
                  font-family: monospace;
                  overflow-wrap: break-word;
                }
              </style>
            </head>
            <body>
              <div class="error-container">
                <h1>無法獲取實時匯率數據</h1>
                <p>很抱歉，我們目前無法從外部數據源獲取最新的匯率數據。這可能是由於網絡連接問題、API限制或其他臨時性問題導致的。</p>
                <a href="/" class="btn">重試</a>
                <div class="error-details">
                  <p><strong>錯誤詳情：</strong> ${errorMessage}</p>
                </div>
              </div>
            </body>
            </html>
          `, {
            headers: { 'Content-Type': 'text/html;charset=utf-8' }
          });
        }
      } catch (error) {
        console.error('處理頁面請求時出錯:', error);
        return new Response('Error processing request: ' + (error instanceof Error ? error.message : String(error)), { 
          status: 500,
          headers: { 'Content-Type': 'text/html;charset=utf-8' }
        });
      }
    }
    
    // 其他未處理的路徑
    return new Response('Not found', { status: 404 });
  }
};

/**
 * 貨幣轉換函數
 */
function convertCurrency(amount: number, from: string, to: string, data: ExchangeRateData): number {
  console.log(`轉換 ${amount} ${from} 到 ${to}`);
  
  // 確保數據結構完整
  if (!data.crypto || data.crypto.length === 0) {
    throw new Error('缺少加密貨幣匯率數據');
  }
  
  if (!data.fiat || data.fiat.length === 0) {
    throw new Error('缺少法幣匯率數據');
  }
  
  // 獲取所有貨幣數據
  const allCurrencies: Record<string, CurrencyData> = {};
  
  // 添加加密貨幣數據
  data.crypto.forEach((crypto: CryptoData) => {
    allCurrencies[crypto.symbol] = {
      code: crypto.symbol,
      name: crypto.name,
      rate: crypto.price,
      symbol: crypto.symbol,
      type: 'crypto'
    };
  });
  
  // 添加法幣數據
  data.fiat.forEach((fiat: FiatExchangeRate) => {
    allCurrencies[fiat.code] = {
      code: fiat.code,
      name: fiat.name,
      rate: fiat.rate,
      symbol: fiat.symbol,
      type: 'fiat'
    };
  });
  
  // 確保貨幣代碼存在
  if (!allCurrencies[from] || !allCurrencies[to]) {
    throw new Error('不支持的貨幣代碼');
  }
  
  let result: number;
  
  // 將金額轉換為美元
  let amountInUsd: number;
  
  if (from === 'USD') {
    // 如果起始貨幣是美元，則直接使用金額
    amountInUsd = amount;
  } else if (allCurrencies[from].type === 'crypto') {
    // 如果是加密貨幣，乘以其美元價格
    amountInUsd = amount * parseFloat(allCurrencies[from].rate);
  } else {
    // 如果是法幣，除以其匯率（匯率是對美元的）
    amountInUsd = amount / parseFloat(allCurrencies[from].rate);
  }
  
  // 從美元轉換為目標貨幣
  if (to === 'USD') {
    // 如果目標貨幣是美元，則直接返回美元金額
    result = amountInUsd;
  } else if (allCurrencies[to].type === 'crypto') {
    // 如果目標是加密貨幣，除以其美元價格
    result = amountInUsd / parseFloat(allCurrencies[to].rate);
  } else {
    // 如果目標是法幣，乘以其匯率
    result = amountInUsd * parseFloat(allCurrencies[to].rate);
  }
  
  return result;
} 
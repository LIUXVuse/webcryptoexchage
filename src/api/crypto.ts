import { CryptoData } from '../models/types';

/**
 * 獲取加密貨幣匯率數據
 * 優先使用畢安(Binance)API，如無法訪問則使用備用API
 * 
 * 支持的貨幣: BTC, ETH, DOGE, SOL, USDT
 */
export async function fetchCryptoRates(): Promise<CryptoData[]> {
  console.log('開始獲取加密貨幣匯率數據...');
  
  // 定義請求超時時間
  const timeout = 8000; // 縮短超時時間以更快失敗
  const requiredSymbols = ['BTC', 'ETH', 'DOGE', 'SOL', 'BNB'];
  let cryptoRates: CryptoData[] = [];
  
  // 自定義fetch函數，添加超時處理
  async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs: number): Promise<Response> {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutPromise = new Promise<Response>((_, reject) => {
      setTimeout(() => {
        controller.abort();
        reject(new Error(`請求超時，超過 ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    return Promise.race([
      fetch(url, { ...options, signal }),
      timeoutPromise
    ]) as Promise<Response>;
  }
  
  // 添加請求重試機制
  async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3): Promise<Response> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetchWithTimeout(url, options, timeout);
        if (response.ok) {
          return response;
        }
        lastError = new Error(`HTTP錯誤 ${response.status} ${response.statusText}`);
      } catch (error) {
        console.warn(`嘗試 ${i + 1}/${retries} 失敗:`, error);
        lastError = error as Error;
        // 短暫延遲後重試
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    throw lastError || new Error('在多次嘗試後請求仍然失敗');
  }
  
  // 方法1: 使用幣安API v1 - 非結合型API，單獨查詢更快速、更低阻擋風險
  try {
    console.log('嘗試從幣安快速API獲取加密貨幣數據 (方法1)...');
    
    // 對每個幣種執行簡單請求 - 這方法通常更可靠
    for (const symbol of requiredSymbols) {
      try {
        console.log(`正在請求 ${symbol} 的數據...`);
        
        // 使用價格端點 (更簡單，更少被阻擋)
        const priceUrl = `https://api1.binance.com/api/v3/ticker/price?symbol=${symbol}USDT`;
        
        console.log(`發送請求到 ${priceUrl}`);
        const priceResponse = await fetchWithRetry(priceUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        });
        
        if (!priceResponse.ok) {
          console.error(`請求失敗: HTTP ${priceResponse.status} ${priceResponse.statusText}`);
          throw new Error(`HTTP ${priceResponse.status}: ${priceResponse.statusText}`);
        }

        const priceText = await priceResponse.text();
        console.log(`收到響應: ${priceText.substring(0, 100)}`);
        
        // 嘗試解析JSON
        const priceData = JSON.parse(priceText);
        console.log(`成功解析 ${symbol} 價格數據: ${JSON.stringify(priceData)}`);
        
        // 使用24小時統計端點獲取變化率
        const changeUrl = `https://api1.binance.com/api/v3/ticker/24hr?symbol=${symbol}USDT`;
        
        const changeResponse = await fetchWithRetry(changeUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        });
        
        const changeData = await changeResponse.json() as { priceChangePercent: string; };
        
        // 將獲取的數據添加到結果中
        cryptoRates.push({
          symbol,
          name: getCryptoFullName(symbol),
          price: priceData.price,
          change24h: changeData.priceChangePercent
        });
        
        console.log(`成功獲取 ${symbol} 的數據: 價格=${priceData.price}, 變化率=${changeData.priceChangePercent}`);
      } catch (singleError) {
        console.warn(`無法從幣安獲取 ${symbol} 的數據:`, singleError);
      }
    }
    
    // 添加USDT (固定為1USD)
    cryptoRates.push({
      symbol: 'USDT',
      name: '泰達幣 (Tether)',
      price: '1.0',
      change24h: '0.0'
    });
    
    // 如果成功獲取了至少一半的加密貨幣數據，則返回
    if (cryptoRates.length > requiredSymbols.length / 2) {
      console.log('成功從幣安快速API獲取了部分數據:', cryptoRates.map(coin => coin.symbol).join(', '));
      return cryptoRates;
    }
  } catch (binanceFastError) {
    console.error('幣安快速API請求出錯:', binanceFastError);
  }
  
  // 方法2: 使用幣安API v3 - 價格端點
  try {
    console.log('嘗試從幣安標準API獲取加密貨幣數據 (方法2)...');
    
    // 使用幣安的價格端點 - 更簡單且更不容易被阻擋
    const priceUrl = 'https://api.binance.com/api/v3/ticker/price';
    
    const priceResponse = await fetchWithRetry(priceUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    const priceData = await priceResponse.json() as Array<{
      symbol: string;
      price: string;
    }>;
    
    console.log('幣安價格數據獲取成功，開始獲取24小時變化數據...');
    
    // 獲取24小時變化數據
    const changeUrl = 'https://api.binance.com/api/v3/ticker/24hr';
    
    const changeResponse = await fetchWithRetry(changeUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    const changeData = await changeResponse.json() as Array<{
      symbol: string;
      priceChangePercent: string;
    }>;
    
    console.log('幣安24小時變化數據獲取成功');
    
    // 合併兩個數據源
    if (Array.isArray(priceData) && Array.isArray(changeData)) {
      cryptoRates = [];
      
      // 查找所需的交易對
      for (const symbol of requiredSymbols) {
        const pairSymbol = `${symbol}USDT`;
        const priceItem = priceData.find(item => item.symbol === pairSymbol);
        const changeItem = changeData.find(item => item.symbol === pairSymbol);
        
        if (priceItem) {
          cryptoRates.push({
            symbol,
            name: getCryptoFullName(symbol),
            price: priceItem.price,
            change24h: changeItem?.priceChangePercent || '0.0'
          });
        }
      }
      
      // 添加USDT (固定為1USD)
      cryptoRates.push({
        symbol: 'USDT',
        name: '泰達幣 (Tether)',
        price: '1.0',
        change24h: '0.0'
      });
      
      if (cryptoRates.length > 1) {
        console.log('成功從幣安標準API獲取數據:', cryptoRates.map(coin => coin.symbol).join(', '));
        return cryptoRates;
      }
    }
    
    console.error('幣安標準API數據處理失敗');
  } catch (binanceError) {
    console.error('幣安標準API請求出錯:', binanceError);
  }
  
  // 方法3: 使用幣安 avgPrice API
  try {
    console.log('嘗試從幣安 avgPrice API獲取數據 (方法3)...');
    cryptoRates = [];
    
    for (const symbol of requiredSymbols) {
      try {
        const url = `https://api.binance.com/api/v3/avgPrice?symbol=${symbol}USDT`;
        
        const response = await fetchWithRetry(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        });
        
        const data = await response.json() as { mins: number, price: string };
        
        if (data && data.price) {
          cryptoRates.push({
            symbol,
            name: getCryptoFullName(symbol),
            price: data.price,
            change24h: '0.0' // 這個API沒有提供變化率
          });
        }
      } catch (singleError) {
        console.warn(`無法從 avgPrice API 獲取 ${symbol} 的價格:`, singleError);
      }
    }
    
    // 添加USDT (固定為1USD)
    cryptoRates.push({
      symbol: 'USDT',
      name: '泰達幣 (Tether)',
      price: '1.0',
      change24h: '0.0'
    });
    
    if (cryptoRates.length > requiredSymbols.length / 2) {
      console.log('成功從幣安 avgPrice API獲取數據:', cryptoRates.map(coin => coin.symbol).join(', '));
      return cryptoRates;
    }
  } catch (binanceAltError) {
    console.error('幣安 avgPrice API請求出錯:', binanceAltError);
  }
  
  // 方法4: 使用 OKX API (與幣安類似的大交易所)
  try {
    console.log('嘗試從 OKX API 獲取加密貨幣數據 (方法4)...');
    cryptoRates = [];
    
    for (const symbol of requiredSymbols) {
      try {
        const url = `https://www.okx.com/api/v5/market/ticker?instId=${symbol}-USDT`;
        
        const response = await fetchWithRetry(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        });
        
        interface OKXResponse {
          code: string;
          data: Array<{
            instId: string;
            last: string;
            open24h: string;
            sodUtc0: string;
            sodUtc8: string;
          }>;
        }
        
        const data = await response.json() as OKXResponse;
        
        if (data.code === '0' && data.data && data.data.length > 0) {
          const item = data.data[0];
          // 計算24小時變化率
          const last = parseFloat(item.last);
          const open24h = parseFloat(item.open24h);
          const change24h = ((last - open24h) / open24h * 100).toFixed(2);
          
          cryptoRates.push({
            symbol,
            name: getCryptoFullName(symbol),
            price: item.last,
            change24h
          });
        }
      } catch (singleError) {
        console.warn(`無法從 OKX 獲取 ${symbol} 的價格:`, singleError);
      }
    }
    
    // 添加USDT (固定為1USD)
    cryptoRates.push({
      symbol: 'USDT',
      name: '泰達幣 (Tether)',
      price: '1.0',
      change24h: '0.0'
    });
    
    if (cryptoRates.length > requiredSymbols.length / 2) {
      console.log('成功從 OKX API 獲取數據:', cryptoRates.map(coin => coin.symbol).join(', '));
      return cryptoRates;
    }
  } catch (okxError) {
    console.error('OKX API 請求出錯:', okxError);
  }
  
  // 方法5：嘗試 CoinGecko API (作為備用)
  try {
    console.log('嘗試從 CoinGecko API 獲取加密貨幣數據 (方法5)...');
    const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,dogecoin,solana&vs_currencies=usd&include_24hr_change=true';
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    const data = await response.json() as Record<string, { usd: number, usd_24h_change?: number }>;
    console.log('CoinGecko API 響應成功');
    
    // 檢查是否有數據
    if (data && data.bitcoin && data.ethereum) {
      // 將數據轉換為我們的標準格式
      cryptoRates = [
        {
          symbol: 'BTC',
          name: '比特幣 (Bitcoin)',
          price: data.bitcoin?.usd?.toString() || '0',
          change24h: data.bitcoin?.usd_24h_change?.toString() || '0.0'
        },
        {
          symbol: 'ETH',
          name: '以太坊 (Ethereum)',
          price: data.ethereum?.usd?.toString() || '0',
          change24h: data.ethereum?.usd_24h_change?.toString() || '0.0'
        },
        {
          symbol: 'DOGE',
          name: '狗狗幣 (Dogecoin)',
          price: data.dogecoin?.usd?.toString() || '0',
          change24h: data.dogecoin?.usd_24h_change?.toString() || '0.0'
        },
        {
          symbol: 'SOL',
          name: '索拉納 (Solana)',
          price: data.solana?.usd?.toString() || '0',
          change24h: data.solana?.usd_24h_change?.toString() || '0.0'
        },
        {
          symbol: 'USDT',
          name: '泰達幣 (Tether)',
          price: '1.0',
          change24h: '0.0'
        }
      ];
      
      console.log('成功從 CoinGecko 獲取數據:', cryptoRates.length);
      return cryptoRates;
    } else {
      console.error('CoinGecko API 返回格式不符合預期');
    }
  } catch (coinGeckoError) {
    console.error('CoinGecko API 請求出錯:', coinGeckoError);
  }
  
  // 方法6：嘗試 CryptoCompare API
  try {
    console.log('嘗試從 CryptoCompare API 獲取加密貨幣數據 (方法6)...');
    const url = 'https://min-api.cryptocompare.com/data/pricemultifull?fsyms=BTC,ETH,DOGE,SOL,USDT&tsyms=USD';
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    // 定義 CryptoCompare API 響應的接口
    interface CryptoCompareResponse {
      RAW?: {
        [symbol: string]: {
          USD: {
            PRICE: number;
            CHANGEPCT24HOUR: number;
          }
        }
      }
    }
    
    const data = await response.json() as CryptoCompareResponse;
    console.log('CryptoCompare API 響應成功');
    
    if (data && data.RAW) {
      cryptoRates = [];
      
      // 處理每種加密貨幣
      const currencies = ['BTC', 'ETH', 'DOGE', 'SOL', 'USDT'];
      for (const symbol of currencies) {
        if (data.RAW && data.RAW[symbol] && data.RAW[symbol].USD) {
          const info = data.RAW[symbol].USD;
          cryptoRates.push({
            symbol: symbol,
            name: getCryptoFullName(symbol),
            price: info.PRICE.toString(),
            change24h: info.CHANGEPCT24HOUR.toString()
          });
        } else if (symbol === 'USDT') {
          // USDT 固定為 1 USD
          cryptoRates.push({
            symbol: 'USDT',
            name: '泰達幣 (Tether)',
            price: '1.0',
            change24h: '0.0'
          });
        }
      }
      
      if (cryptoRates.length > 0) {
        console.log('成功從 CryptoCompare 獲取數據:', cryptoRates.length);
        return cryptoRates;
      }
    } else {
      console.error('CryptoCompare API 返回格式不符合預期');
    }
  } catch (cryptoCompareError) {
    console.error('CryptoCompare API 請求出錯:', cryptoCompareError);
  }
  
  // 如果所有 API 都失敗，拋出錯誤
  console.error('所有 API 請求均失敗，無法獲取實時匯率數據');
  throw new Error('無法從任何API獲取加密貨幣匯率數據');
}

/**
 * 獲取加密貨幣全名
 * 
 * @param symbol 貨幣符號
 * @returns 貨幣全名
 */
function getCryptoFullName(symbol: string): string {
  const names: Record<string, string> = {
    'BTC': '比特幣 (Bitcoin)',
    'ETH': '以太坊 (Ethereum)',
    'DOGE': '狗狗幣 (Dogecoin)',
    'SOL': '索拉納 (Solana)',
    'USDT': '泰達幣 (Tether)',
    'BNB': '幣安幣 (Binance Coin)'
  };
  
  return names[symbol] || symbol;
} 
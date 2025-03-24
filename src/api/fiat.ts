import { FiatExchangeRate } from '../models/types';
import { t } from '../models/translations';

/**
 * 獲取法幣匯率
 * 使用多個API源確保數據可用性
 * 
 * @returns 返回法幣匯率數據數組
 */
export async function fetchFiatRates(): Promise<FiatExchangeRate[]> {
  console.log('開始獲取法幣匯率數據...');
  
  // 定義請求超時時間
  const timeout = 10000; // 10秒
  let fiatRates: FiatExchangeRate[] = [];
  
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
        lastError = new Error(`HTTP錯誤 ${response.status}: ${response.statusText}`);
      } catch (error) {
        console.warn(`嘗試 ${i + 1}/${retries} 失敗:`, error);
        lastError = error as Error;
        // 短暫延遲後重試
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    throw lastError || new Error('在多次嘗試後請求仍然失敗');
  }
  
  // 方法1：嘗試 Exchange Rates Data API
  try {
    console.log('嘗試從 Exchange Rates Data API 獲取法幣匯率數據...');
    
    interface ExchangeRateHostResponse {
      base: string;
      rates: Record<string, number>;
    }
    
    const url = 'https://api.exchangerate.host/latest?base=USD';
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    const data = await response.json() as ExchangeRateHostResponse;
    console.log('Exchange Rates Data API 響應成功');
    
    // 檢查數據是否符合預期
    if (data && data.rates && data.base === 'USD') {
      // 獲取所需的貨幣列表
      const currencyCodes = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'TWD', 'KRW', 'SGD', 'MYR', 'THB', 'VND', 'RUB', 'INR', 'SAR'];
      const currencyNames: { [key: string]: string } = {
        'USD': '美元 (US Dollar)',
        'EUR': '歐元 (Euro)',
        'JPY': '日元 (Japanese Yen)',
        'GBP': '英鎊 (British Pound)',
        'AUD': '澳元 (Australian Dollar)',
        'CAD': '加元 (Canadian Dollar)',
        'CHF': '瑞士法郎 (Swiss Franc)',
        'CNY': '人民幣 (Chinese Yuan)',
        'HKD': '港幣 (Hong Kong Dollar)',
        'TWD': '新台幣 (Taiwan Dollar)',
        'KRW': '韓元 (Korean Won)',
        'SGD': '新加坡元 (Singapore Dollar)',
        'MYR': '馬來西亞林吉特 (Malaysian Ringgit)',
        'THB': '泰銖 (Thai Baht)',
        'VND': '越南盾 (Vietnamese Dong)',
        'RUB': '俄羅斯盧布 (Russian Ruble)',
        'INR': '印度盧比 (Indian Rupee)',
        'SAR': '沙特里亞爾 (Saudi Riyal)'
      };
      
      const currencySymbols: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'JPY': '¥',
        'GBP': '£',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'Fr',
        'CNY': '¥',
        'HKD': 'HK$',
        'TWD': 'NT$',
        'KRW': '₩',
        'SGD': 'S$',
        'MYR': 'RM',
        'THB': '฿',
        'VND': '₫',
        'RUB': '₽',
        'INR': '₹',
        'SAR': '﷼'
      };
      
      // 構建匯率數據
      fiatRates = currencyCodes.map(code => {
        const rate = code === 'USD' ? 1 : data.rates[code];
        return {
          code,
          name: currencyNames[code] || code,
          rate: rate ? rate.toString() : undefined,
          symbol: currencySymbols[code] || '',
        };
      }).filter(rate => rate.rate !== undefined) as FiatExchangeRate[];
      
      if (fiatRates.length >= 10) { // 至少要有10種貨幣
        console.log('成功從 Exchange Rates Data API 獲取數據:', fiatRates.length);
        // 確保包含 TWD
        fiatRates = await ensureTWDRate(fiatRates);
        // 嘗試獲取可能缺少的特定貨幣
        fiatRates = await ensureSpecificCurrencies(fiatRates);
        return fiatRates;
      } else {
        console.warn('Exchange Rates Data API 返回的數據不完整，只獲得了', fiatRates.length, '種貨幣');
      }
    } else {
      console.error('Exchange Rates Data API 返回格式不符合預期');
    }
  } catch (exchangeRateError) {
    console.error('Exchange Rates Data API 請求出錯:', exchangeRateError);
  }
  
  // 方法2：嘗試 Frankfurter API
  try {
    console.log('嘗試從 Frankfurter API 獲取法幣匯率數據...');
    
    interface FrankfurterResponse {
      base: string;
      rates: Record<string, number>;
    }
    
    const url = 'https://api.frankfurter.app/latest?from=USD';
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    const data = await response.json() as FrankfurterResponse;
    console.log('Frankfurter API 響應成功');
    
    // 檢查數據是否符合預期
    if (data && data.rates && data.base === 'USD') {
      // 獲取所需的貨幣列表
      const currencyCodes = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'TWD', 'KRW', 'SGD', 'MYR', 'THB', 'VND', 'RUB', 'INR', 'SAR'];
      const currencyNames: { [key: string]: string } = {
        'USD': '美元 (US Dollar)',
        'EUR': '歐元 (Euro)',
        'JPY': '日元 (Japanese Yen)',
        'GBP': '英鎊 (British Pound)',
        'AUD': '澳元 (Australian Dollar)',
        'CAD': '加元 (Canadian Dollar)',
        'CHF': '瑞士法郎 (Swiss Franc)',
        'CNY': '人民幣 (Chinese Yuan)',
        'HKD': '港幣 (Hong Kong Dollar)',
        'TWD': '新台幣 (Taiwan Dollar)',
        'KRW': '韓元 (Korean Won)',
        'SGD': '新加坡元 (Singapore Dollar)',
        'MYR': '馬來西亞林吉特 (Malaysian Ringgit)',
        'THB': '泰銖 (Thai Baht)',
        'VND': '越南盾 (Vietnamese Dong)',
        'RUB': '俄羅斯盧布 (Russian Ruble)',
        'INR': '印度盧比 (Indian Rupee)',
        'SAR': '沙特里亞爾 (Saudi Riyal)'
      };
      
      const currencySymbols: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'JPY': '¥',
        'GBP': '£',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'Fr',
        'CNY': '¥',
        'HKD': 'HK$',
        'TWD': 'NT$',
        'KRW': '₩',
        'SGD': 'S$',
        'MYR': 'RM',
        'THB': '฿',
        'VND': '₫',
        'RUB': '₽',
        'INR': '₹',
        'SAR': '﷼'
      };
      
      // 構建匯率數據
      fiatRates = currencyCodes.map(code => {
        // Frankfurter API 可能不支持所有貨幣，對於不支持的跳過
        const rate = code === 'USD' ? 1 : data.rates[code];
        return {
          code,
          name: currencyNames[code] || code,
          rate: rate ? rate.toString() : undefined,
          symbol: currencySymbols[code] || '',
        };
      }).filter(rate => rate.rate !== undefined) as FiatExchangeRate[];
      
      if (fiatRates.length >= 5) { // 至少要有5種貨幣
        console.log('成功從 Frankfurter API 獲取數據:', fiatRates.length);
        // 確保包含 TWD
        fiatRates = await ensureTWDRate(fiatRates);
        // 嘗試獲取可能缺少的特定貨幣
        fiatRates = await ensureSpecificCurrencies(fiatRates);
        return fiatRates;
      } else {
        console.warn('Frankfurter API 返回的數據不完整，只獲得了', fiatRates.length, '種貨幣');
      }
    } else {
      console.error('Frankfurter API 返回格式不符合預期');
    }
  } catch (frankfurterError) {
    console.error('Frankfurter API 請求出錯:', frankfurterError);
  }
  
  // 方法3：嘗試 Open Exchange Rates API
  try {
    console.log('嘗試從 Open Exchange Rates API 獲取法幣匯率數據...');
    
    interface OpenExchangeRatesResponse {
      base: string;
      rates: Record<string, number>;
    }
    
    const url = 'https://open.er-api.com/v6/latest/USD';
    
    const response = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
      },
      cache: 'no-store'
    });
    
    const data = await response.json() as OpenExchangeRatesResponse;
    console.log('Open Exchange Rates API 響應成功');
    
    // 檢查數據是否符合預期
    if (data && data.rates && data.base === 'USD') {
      // 獲取所需的貨幣列表
      const currencyCodes = ['USD', 'EUR', 'JPY', 'GBP', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'TWD', 'KRW', 'SGD', 'MYR', 'THB', 'VND', 'RUB', 'INR', 'SAR'];
      const currencyNames: { [key: string]: string } = {
        'USD': '美元 (US Dollar)',
        'EUR': '歐元 (Euro)',
        'JPY': '日元 (Japanese Yen)',
        'GBP': '英鎊 (British Pound)',
        'AUD': '澳元 (Australian Dollar)',
        'CAD': '加元 (Canadian Dollar)',
        'CHF': '瑞士法郎 (Swiss Franc)',
        'CNY': '人民幣 (Chinese Yuan)',
        'HKD': '港幣 (Hong Kong Dollar)',
        'TWD': '新台幣 (Taiwan Dollar)',
        'KRW': '韓元 (Korean Won)',
        'SGD': '新加坡元 (Singapore Dollar)',
        'MYR': '馬來西亞林吉特 (Malaysian Ringgit)',
        'THB': '泰銖 (Thai Baht)',
        'VND': '越南盾 (Vietnamese Dong)',
        'RUB': '俄羅斯盧布 (Russian Ruble)',
        'INR': '印度盧比 (Indian Rupee)',
        'SAR': '沙特里亞爾 (Saudi Riyal)'
      };
      
      const currencySymbols: { [key: string]: string } = {
        'USD': '$',
        'EUR': '€',
        'JPY': '¥',
        'GBP': '£',
        'AUD': 'A$',
        'CAD': 'C$',
        'CHF': 'Fr',
        'CNY': '¥',
        'HKD': 'HK$',
        'TWD': 'NT$',
        'KRW': '₩',
        'SGD': 'S$',
        'MYR': 'RM',
        'THB': '฿',
        'VND': '₫',
        'RUB': '₽',
        'INR': '₹',
        'SAR': '﷼'
      };
      
      // 構建匯率數據
      fiatRates = currencyCodes.map(code => {
        const rate = code === 'USD' ? 1 : data.rates[code];
        return {
          code,
          name: currencyNames[code] || code,
          rate: rate ? rate.toString() : undefined,
          symbol: currencySymbols[code] || '',
        };
      }).filter(rate => rate.rate !== undefined) as FiatExchangeRate[];
      
      if (fiatRates.length >= 10) { // 至少要有10種貨幣
        console.log('成功從 Open Exchange Rates API 獲取數據:', fiatRates.length);
        // 確保包含 TWD
        fiatRates = await ensureTWDRate(fiatRates);
        // 嘗試獲取可能缺少的特定貨幣
        fiatRates = await ensureSpecificCurrencies(fiatRates);
        return fiatRates;
      } else {
        console.warn('Open Exchange Rates API 返回的數據不完整，只獲得了', fiatRates.length, '種貨幣');
      }
    } else {
      console.error('Open Exchange Rates API 返回格式不符合預期');
    }
  } catch (openExchangeError) {
    console.error('Open Exchange Rates API 請求出錯:', openExchangeError);
  }
  
  // 如果所有API請求都失敗，返回空數組
  console.error('所有法幣匯率 API 請求均失敗');
  return [];
}

/**
 * 嘗試從多個API獲取 TWD (新台幣) 匯率數據
 * 但不使用備用數據
 * 
 * @param existingRates 已經獲取到的匯率數據
 * @returns 包含 TWD 的匯率數據，如果無法獲取則保持原樣
 */
async function ensureTWDRate(existingRates: FiatExchangeRate[]): Promise<FiatExchangeRate[]> {
  // 先檢查現有數據中是否已包含 TWD
  const hasTWD = existingRates.some(rate => rate.code === 'TWD');
  if (hasTWD) {
    console.log('已存在 TWD 匯率數據，無需額外獲取');
    return existingRates;
  }
  
  console.log('未找到 TWD 匯率數據，嘗試專門獲取...');
  
  // 嘗試多個API來源獲取TWD匯率
  const apiSources = [
    // 來源1：Exchange Rate API
    async () => {
      console.log('嘗試從 Exchange Rate API 獲取 TWD 匯率...');
      const response = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=TWD', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json() as { rates: { TWD: number } };
        if (data.rates && data.rates.TWD) {
          console.log(`成功從 Exchange Rate API 獲取 TWD 匯率: ${data.rates.TWD}`);
          return data.rates.TWD;
        }
      }
      throw new Error('Exchange Rate API 無法獲取 TWD 匯率');
    },
    
    // 來源2：Open Exchange Rates
    async () => {
      console.log('嘗試從 Open Exchange Rates 獲取 TWD 匯率...');
      const response = await fetch('https://open.er-api.com/v6/latest/USD', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json() as { rates: { TWD: number } };
        if (data.rates && data.rates.TWD) {
          console.log(`成功從 Open Exchange Rates 獲取 TWD 匯率: ${data.rates.TWD}`);
          return data.rates.TWD;
        }
      }
      throw new Error('Open Exchange Rates 無法獲取 TWD 匯率');
    },
    
    // 來源3：Currency API
    async () => {
      console.log('嘗試從 Currency API 獲取 TWD 匯率...');
      const response = await fetch('https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/twd.json', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json() as { twd: number };
        if (data && data.twd) {
          console.log(`成功從 Currency API 獲取 TWD 匯率: ${data.twd}`);
          return data.twd;
        }
      }
      throw new Error('Currency API 無法獲取 TWD 匯率');
    },
    
    // 來源4：另一個可靠的API
    async () => {
      console.log('嘗試從 Abstract API 獲取 TWD 匯率...');
      const response = await fetch('https://cdn.moneyconvert.net/api/latest.json', {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        },
        cache: 'no-store'
      });
      
      if (response.ok) {
        const data = await response.json() as { rates: { TWD: number } };
        if (data.rates && data.rates.TWD) {
          console.log(`成功從 Money Convert API 獲取 TWD 匯率: ${data.rates.TWD}`);
          return data.rates.TWD;
        }
      }
      throw new Error('Money Convert API 無法獲取 TWD 匯率');
    }
  ];
  
  // 嘗試所有API來源，直到成功獲取TWD匯率
  for (const apiSource of apiSources) {
    try {
      const twdRate = await apiSource();
      
      // 添加到現有數據中
      existingRates.push({
        code: 'TWD',
        name: '新台幣 (Taiwan Dollar)',
        rate: twdRate.toString(),
        symbol: 'NT$'
      });
      
      console.log('成功添加 TWD 匯率到結果中');
      return existingRates;
    } catch (error) {
      console.warn('API來源獲取失敗:', error);
      // 繼續嘗試下一個來源
    }
  }
  
  // 如果所有API來源都失敗，不使用備用數據
  console.warn('所有 TWD 匯率 API 來源都失敗，遵循用戶要求不使用備用數據');
  return existingRates;
}

/**
 * 嘗試獲取指定貨幣的匯率數據
 * 使用多個API源確保數據可用性
 * 
 * @param currencyCode 貨幣代碼 (例如 'VND', 'RUB', 'SAR')
 * @returns 匯率數據，如果無法獲取則返回undefined
 */
async function fetchSpecificCurrencyRate(currencyCode: string): Promise<number | undefined> {
  console.log(`嘗試獲取 ${currencyCode} 的匯率數據...`);
  
  // 定義請求超時時間
  const timeout = 8000; // 8秒
  
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
  
  // 定義API響應類型
  interface CurrencyApiResponse {
    [key: string]: number;
  }
  
  interface ExchangeRateResponse {
    rates: {
      [key: string]: number;
    };
  }
  
  // API源列表
  const apiSources = [
    // CurrencyAPI - 專門處理單一貨幣匯率
    async () => {
      const url = `https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/usd/${currencyCode.toLowerCase()}.json`;
      console.log(`嘗試從 Currency API 獲取 ${currencyCode} 匯率...`, url);
      
      try {
        const response = await fetchWithTimeout(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        }, timeout);
        
        if (response.ok) {
          const data = await response.json() as CurrencyApiResponse;
          const key = currencyCode.toLowerCase();
          if (data && data[key]) {
            console.log(`成功從 Currency API 獲取 ${currencyCode} 匯率: ${data[key]}`);
            return data[key];
          }
        }
      } catch (error) {
        console.warn(`Currency API 獲取 ${currencyCode} 失敗:`, error);
      }
      return undefined;
    },
    
    // Exchange Rate API
    async () => {
      const url = `https://api.exchangerate.host/latest?base=USD&symbols=${currencyCode}`;
      console.log(`嘗試從 Exchange Rate API 獲取 ${currencyCode} 匯率...`);
      
      try {
        const response = await fetchWithTimeout(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        }, timeout);
        
        if (response.ok) {
          const data = await response.json() as ExchangeRateResponse;
          if (data && data.rates && data.rates[currencyCode]) {
            console.log(`成功從 Exchange Rate API 獲取 ${currencyCode} 匯率: ${data.rates[currencyCode]}`);
            return data.rates[currencyCode];
          }
        }
      } catch (error) {
        console.warn(`Exchange Rate API 獲取 ${currencyCode} 失敗:`, error);
      }
      return undefined;
    },
    
    // Free Currency API
    async () => {
      const url = `https://cdn.moneyconvert.net/api/latest.json`;
      console.log(`嘗試從 Money Convert API 獲取 ${currencyCode} 匯率...`);
      
      try {
        const response = await fetchWithTimeout(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        }, timeout);
        
        if (response.ok) {
          const data = await response.json() as ExchangeRateResponse;
          if (data && data.rates && data.rates[currencyCode]) {
            console.log(`成功從 Money Convert API 獲取 ${currencyCode} 匯率: ${data.rates[currencyCode]}`);
            return data.rates[currencyCode];
          }
        }
      } catch (error) {
        console.warn(`Money Convert API 獲取 ${currencyCode} 失敗:`, error);
      }
      return undefined;
    },
    
    // Open Exchange Rates API
    async () => {
      const url = `https://open.er-api.com/v6/latest/USD`;
      console.log(`嘗試從 Open Exchange Rates API 獲取 ${currencyCode} 匯率...`);
      
      try {
        const response = await fetchWithTimeout(url, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
          },
          cache: 'no-store'
        }, timeout);
        
        if (response.ok) {
          const data = await response.json() as ExchangeRateResponse;
          if (data && data.rates && data.rates[currencyCode]) {
            console.log(`成功從 Open Exchange Rates API 獲取 ${currencyCode} 匯率: ${data.rates[currencyCode]}`);
            return data.rates[currencyCode];
          }
        }
      } catch (error) {
        console.warn(`Open Exchange Rates API 獲取 ${currencyCode} 失敗:`, error);
      }
      return undefined;
    }
  ];
  
  // 依序嘗試所有API源
  for (const apiSource of apiSources) {
    const rate = await apiSource();
    if (rate !== undefined) {
      return rate;
    }
  }
  
  console.warn(`無法從任何API獲取 ${currencyCode} 的匯率數據`);
  return undefined;
}

/**
 * 確保特定貨幣在最終結果中
 * 但僅使用API成功抓取到的數據，不使用備用數據
 */
async function ensureSpecificCurrencies(rates: FiatExchangeRate[]): Promise<FiatExchangeRate[]> {
  // 需要確保的貨幣列表
  const requiredCurrencies = [
    {
      code: 'VND',
      name: '越南盾 (Vietnamese Dong)',
      symbol: '₫'
    },
    {
      code: 'RUB',
      name: '俄羅斯盧布 (Russian Ruble)',
      symbol: '₽'
    },
    {
      code: 'SAR',
      name: '沙特里亞爾 (Saudi Riyal)',
      symbol: '﷼'
    }
  ];
  
  // 檢查並嘗試獲取缺少的貨幣
  for (const currency of requiredCurrencies) {
    const exists = rates.some(rate => rate.code === currency.code);
    if (!exists) {
      console.log(`嘗試獲取缺少的貨幣匯率: ${currency.code}`);
      const rate = await fetchSpecificCurrencyRate(currency.code);
      
      if (rate !== undefined) {
        console.log(`成功獲取 ${currency.code} 匯率: ${rate}`);
        rates.push({
          code: currency.code,
          name: currency.name,
          rate: rate.toString(),
          symbol: currency.symbol
        });
      } else {
        console.warn(`無法獲取 ${currency.code} 的匯率數據，該貨幣將不會顯示`);
      }
    }
  }
  
  return rates;
} 
/**
 * 加密貨幣數據接口
 */
export interface CryptoData {
  symbol: string;   // 貨幣符號，如 BTC, ETH 等
  name: string;     // 貨幣全名，如 Bitcoin, Ethereum 等
  price: string;    // 當前價格（以 USD 為單位）
  change24h: string; // 24小時價格變化百分比
}

/**
 * 法幣匯率數據接口
 */
export interface FiatExchangeRate {
  code: string;     // 貨幣代碼，如 USD, EUR 等
  name: string;     // 貨幣名稱，如 US Dollar, Euro 等
  rate: string;     // 相對於美元的匯率
  symbol: string;   // 貨幣符號，如 $, € 等
  isBackup?: boolean; // 標記是否為備用數據
}

/**
 * FiatData 是 FiatExchangeRate 的別名，用於模板中的貨幣顯示
 */
export type FiatData = FiatExchangeRate;

/**
 * 通用貨幣數據接口
 */
export interface CurrencyData {
  code: string;             // 貨幣代碼，如 USD, EUR 等
  name: string;             // 貨幣名稱，如 US Dollar, Euro 等
  rate: string;             // 匯率
  symbol: string;           // 貨幣符號，如 $, € 等
  type: 'crypto' | 'fiat';  // 貨幣類型
}

/**
 * 完整匯率數據結構
 */
export interface ExchangeRateData {
  crypto: CryptoData[];  // 加密貨幣數據
  fiat: FiatExchangeRate[];  // 法定貨幣數據
  timestamp: number;   // 最後更新時間
  lastUpdated?: string; // 添加人類可讀的時間戳
} 
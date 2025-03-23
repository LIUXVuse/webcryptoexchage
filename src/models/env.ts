/**
 * 環境變數類型定義
 */
export interface Env {
  /**
   * Cloudflare KV存儲，用於存儲匯率數據
   */
  EXCHANGE_RATES: KVNamespace;
  
  /**
   * 環境標識符，可以是'development'或'production'
   */
  ENVIRONMENT?: string;
} 
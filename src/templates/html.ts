import { ExchangeRateData, CryptoData, FiatData } from '../models/types';
import { t, getSupportedLocales, SupportedLocale } from '../models/translations';

/**
 * 生成整個應用的 HTML
 */
export function generateHTML(data: ExchangeRateData, locale: SupportedLocale = 'zh-TW'): string {
  const lastUpdated = new Date(data.lastUpdated).toLocaleString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  // 獲取支持的語言
  const supportedLocales = getSupportedLocales();
  const localeOptions = supportedLocales.map(l => 
    `<option value="${l.code}" ${l.code === locale ? 'selected' : ''}>${l.name}</option>`
  ).join('\n');

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${t('page_title', locale)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary-color: #7b3fe4;
      --secondary-color: #24c0eb;
      --dark-color: #1c1c28;
      --light-color: #f5f5f7;
      --success-color: #28a745;
      --danger-color: #dc3545;
      --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      --gradient: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans TC', sans-serif;
      background-color: var(--dark-color);
      color: var(--light-color);
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    header {
      text-align: center;
      padding: 40px 0;
      background: var(--gradient);
      margin-bottom: 40px;
      border-radius: 10px;
      box-shadow: var(--card-shadow);
      position: relative;
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 10px;
    }
    
    .updated-time {
      font-size: 0.9rem;
      opacity: 0.8;
    }
    
    .main-content {
      display: grid;
      grid-template-columns: 1fr;
      gap: 30px;
    }
    
    @media (min-width: 768px) {
      .main-content {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .card {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
      padding: 25px;
      box-shadow: var(--card-shadow);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .card h2 {
      font-size: 1.8rem;
      margin-bottom: 20px;
      color: var(--secondary-color);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      padding-bottom: 10px;
    }
    
    .converter {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .input-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    label {
      font-size: 1rem;
      font-weight: 500;
    }
    
    input, select, button {
      padding: 12px 15px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--light-color);
      font-size: 1rem;
      width: 100%;
    }
    
    /* 语言选择器样式 */
    .language-selector {
      position: absolute;
      top: 15px;
      right: 15px;
      width: auto;
      min-width: 120px;
      background-color: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 8px 12px;
      font-size: 0.9rem;
    }
    
    /* 添加下拉選單樣式 */
    select {
      appearance: none;
      background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
      background-repeat: no-repeat;
      background-position: right 1rem center;
      background-size: 1em;
      padding-right: 2.5em;
    }
    
    /* 修復下拉選單選項樣式 */
    select option, select optgroup {
      background-color: var(--dark-color);
      color: var(--light-color);
      padding: 8px;
    }
    
    /* 確保選單在懸停時背景顏色有變化 */
    select option:hover, select option:focus {
      background-color: var(--primary-color);
    }
    
    /* 選擇群組標題樣式 */
    select optgroup {
      font-weight: bold;
      color: var(--secondary-color);
    }
    
    /* 瀏覽器相容性修復 */
    /* Firefox */
    @-moz-document url-prefix() {
      select {
        background-color: var(--dark-color);
        color: var(--light-color);
        text-shadow: 0 0 0 var(--light-color);
      }
      
      select option, select optgroup {
        background-color: var(--dark-color);
        color: var(--light-color);
      }
    }
    
    /* Webkit (Chrome/Safari) */
    select::-webkit-scrollbar {
      width: 10px;
    }
    
    select::-webkit-scrollbar-track {
      background: var(--dark-color);
    }
    
    select::-webkit-scrollbar-thumb {
      background-color: var(--secondary-color);
      border-radius: 10px;
      border: 3px solid var(--dark-color);
    }
    
    /* Microsoft Edge */
    @supports (-ms-ime-align:auto) {
      select {
        padding-right: 0.5em;
        background-image: none;
      }
    }
    
    /* 高對比度選擇項 */
    select option {
      text-shadow: 0 1px 0 rgba(0, 0, 0, 0.4);
    }
    
    /* 選項懸停和選中狀態 */
    select option:checked {
      background: linear-gradient(0deg, var(--primary-color) 0%, var(--primary-color) 100%);
      background-color: var(--primary-color) !important;
      color: white !important;
    }
    
    input:focus, select:focus {
      outline: none;
      border-color: var(--secondary-color);
    }
    
    button {
      background: var(--gradient);
      color: white;
      font-weight: 700;
      border: none;
      cursor: pointer;
      transition: opacity 0.2s;
    }
    
    button:hover {
      opacity: 0.9;
    }
    
    .conversion-result {
      font-size: 1.2rem;
      font-weight: 700;
      text-align: center;
      margin-top: 20px;
      background-color: rgba(123, 63, 228, 0.2);
      padding: 15px;
      border-radius: 8px;
      border: 1px solid var(--primary-color);
      display: none;
    }
    
    .rates-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 15px;
    }
    
    @media (min-width: 992px) {
      .rates-container {
        grid-template-columns: 1fr 1fr;
      }
    }
    
    .rate-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }
    
    .rate-table th {
      text-align: left;
      padding: 12px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      color: var(--secondary-color);
    }
    
    .rate-table td {
      padding: 12px 10px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .rate-table tr:last-child td {
      border-bottom: none;
    }
    
    .currency-symbol {
      font-weight: 700;
      padding-right: 10px;
    }
    
    .price-up {
      color: var(--success-color);
    }
    
    .price-down {
      color: var(--danger-color);
    }
    
    footer {
      text-align: center;
      margin-top: 50px;
      padding: 20px;
      font-size: 0.9rem;
      opacity: 0.7;
    }
    
    /* 手續費相關樣式 */
    .fee-section {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 15px;
      margin-top: 10px;
    }
    
    .fee-title {
      font-size: 1rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--secondary-color);
    }
    
    .fee-options {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
    }
    
    .fee-option {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .fee-input-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .fee-input {
      width: 80px;
      padding: 8px 12px;
    }
    
    .fee-label {
      font-size: 0.9rem;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <select id="language-selector" class="language-selector" onchange="changeLanguage(this.value)">
        ${localeOptions}
      </select>
      <h1>${t('page_title', locale)}</h1>
      <p class="updated-time">${t('last_updated', locale)}: ${lastUpdated}</p>
    </header>
    
    <div class="main-content">
      <div class="card">
        <h2>${t('currency_converter', locale)}</h2>
        <div class="converter">
          <div class="input-group">
            <label for="amount">${t('amount', locale)}</label>
            <input type="number" id="amount" placeholder="${t('amount_placeholder', locale)}" step="any" min="0">
          </div>
          
          <div class="input-group">
            <label for="from-currency">${t('from', locale)}</label>
            <select id="from-currency">
              <option disabled selected>${t('select_currency', locale)}</option>
              <optgroup label="${t('cryptocurrencies', locale)}">
                ${generateCryptoOptions(data.crypto, locale)}
              </optgroup>
              <optgroup label="${t('fiat_currencies', locale)}">
                ${generateFiatOptions(data.fiat, locale)}
              </optgroup>
            </select>
          </div>
          
          <div class="input-group">
            <label for="to-currency">${t('to', locale)}</label>
            <select id="to-currency">
              <option disabled selected>${t('select_currency', locale)}</option>
              <optgroup label="${t('cryptocurrencies', locale)}">
                ${generateCryptoOptions(data.crypto, locale)}
              </optgroup>
              <optgroup label="${t('fiat_currencies', locale)}">
                ${generateFiatOptions(data.fiat, locale)}
              </optgroup>
            </select>
          </div>
          
          <!-- 新增手續費部分 -->
          <div class="fee-section">
            <div class="fee-title">${t('fee_optional', locale)}</div>
            <div class="fee-options">
              <div class="fee-option">
                <input type="radio" id="fee-none" name="fee-type" value="none" checked>
                <label for="fee-none" class="fee-label">${t('no_fee', locale)}</label>
              </div>
              
              <div class="fee-option">
                <input type="radio" id="fee-percentage" name="fee-type" value="percentage">
                <label for="fee-percentage" class="fee-label">${t('percentage_fee', locale)}</label>
                <div class="fee-input-group">
                  <input type="number" id="fee-percentage-value" class="fee-input" step="0.01" min="0" max="100" value="1" disabled>
                  <span class="fee-label">%</span>
                </div>
              </div>
              
              <div class="fee-option">
                <input type="radio" id="fee-fixed" name="fee-type" value="fixed">
                <label for="fee-fixed" class="fee-label">${t('fixed_fee', locale)}</label>
                <div class="fee-input-group">
                  <input type="number" id="fee-fixed-value" class="fee-input" step="0.01" min="0" value="50" disabled>
                  <select id="fee-currency" class="fee-input" disabled>
                    <option value="USD">USD</option>
                    <optgroup label="${t('cryptocurrencies', locale)}">
                      ${generateCryptoOptions(data.crypto, locale)}
                    </optgroup>
                    <optgroup label="${t('fiat_currencies', locale)}">
                      ${generateFiatOptions(data.fiat, locale)}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <button id="convert-btn">${t('convert', locale)}</button>
          
          <div id="result" class="conversion-result"></div>
          
          <!-- 添加友商廣告位 -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
            <p style="font-size: 1.1rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 10px;">${t('partner_ad', locale)}</p>
            <div style="display: flex; flex-direction: column; gap: 15px;">
              <div style="display: flex; align-items: center; gap: 10px;">
                <p>${t('cannabis_shop', locale)}</p>
              </div>
              
              <!-- 圖片輪播容器 -->
              <div class="carousel-container" style="position: relative; width: 100%; height: 200px; overflow: hidden; border-radius: 8px; margin-top: 10px;">
                <iframe id="shop-map" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.3321243903207!2d100.88759117409619!3d12.946435187303816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3102bdc84fee7961%3A0x8b88ca83479f2358!2zVEFJTUFUT04g5aSn6bq75aCCIOC4o-C5ieC4suC4meC4geC4seC4jeC4iuC4suC4leC5iOC4suC4ouC4oeC4suC4leC4seC4mQ!5e0!3m2!1szh-TW!2stw!4v1718666301952!5m2!1szh-TW!2stw" 
                  width="100%" 
                  height="100%" 
                  style="border:0; border-radius: 8px;" 
                  allowfullscreen="" 
                  loading="lazy" 
                  referrerpolicy="no-referrer-when-downgrade">
                </iframe>
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 10px;">
                <select id="map-selector" style="width: 100%;" onchange="changeMapOrLink(this.value)">
                  <option value="map:https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3890.3321243903207!2d100.88759117409619!3d12.946435187303816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3102bdc84fee7961%3A0x8b88ca83479f2358!2zVEFJTUFUT04g5aSn6bq75aCCIOC4o-C5ieC4suC4meC4geC4seC4jeC4iuC4suC4leC5iOC4suC4ouC4oeC4suC4leC4seC4mQ!5e0!3m2!1szh-TW!2stw!4v1718666301952!5m2!1szh-TW!2stw" selected>${t('shop_location', locale)}</option>
                </select>
                
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 5px;">
                  <a href="https://www.google.com/maps/place/TAIMATON+%E5%A4%A7%E9%BA%BB%E5%A0%82+%E0%B8%A3%E0%B9%89%E0%B8%B2%E0%B8%99%E0%B8%81%E0%B8%B1%E0%B8%8D%E0%B8%8A%E0%B8%B2%E0%B8%95%E0%B9%88%E0%B8%B2%E0%B8%A2%E0%B8%A1%E0%B8%B2%E0%B8%95%E0%B8%B1%E0%B8%99/@12.9451415,100.8864709,15.25z/data=!4m16!1m9!3m8!1s0x3102bdc84fee7961:0x8b88ca83479f2358!2zVEFJTUFUT04g5aSn6bq75aCCIOC4o-C5ieC4suC4meC4geC4seC4jeC4iuC4suC4leC5iOC4suC4ouC4oeC4suC4leC4seC4mQ!8m2!3d12.9464365!4d100.8900818!9m1!1b1!16s%2Fg%2F11sw452mx9!3m5!1s0x3102bdc84fee7961:0x8b88ca83479f2358!8m2!3d12.9464365!4d100.8900818!16s%2Fg%2F11sw452mx9?entry=ttu" target="_blank" style="color: var(--secondary-color); text-decoration: none; display: flex; align-items: center; gap: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>${t('view_google_maps', locale)}</span>
                  </a>
                  
                  <a href="https://instagram.com/taimaton.420?igshid=MmIzYWVlNDQ5Yg==" target="_blank" style="color: var(--secondary-color); text-decoration: none; display: flex; align-items: center; gap: 5px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    <span>${t('view_instagram', locale)}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="card">
        <h2>${t('realtime_rates', locale)}</h2>
        <div class="rates-container">
          <div>
            <h3>${t('crypto_in_usd', locale)}</h3>
            <table class="rate-table">
              <thead>
                <tr>
                  <th>${t('currency', locale)}</th>
                  <th>${t('price_usd', locale)}</th>
                  <th>${t('change_24h', locale)}</th>
                </tr>
              </thead>
              <tbody>
                ${generateCryptoRows(data.crypto, locale)}
              </tbody>
            </table>
          </div>
          
          <div>
            <h3>${t('fiat_in_usd', locale)}</h3>
            <table class="rate-table">
              <thead>
                <tr>
                  <th>${t('currency', locale)}</th>
                  <th>${t('exchange_rate', locale)}</th>
                </tr>
              </thead>
              <tbody>
                ${generateFiatRows(data.fiat, locale)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    <footer>
      <p>${t('copyright_full', locale)}</p>
      <p style="margin-top: 10px;">${t('powered_by', locale)}</p>
      <p style="margin-top: 5px;">${t('contact_info', locale)}</p>
      <p style="margin-top: 8px;">${t('thanks_donation', locale)}</p>
      <p style="margin-top: 8px;">${t('binance_referral', locale)} <a href="https://accounts.binance.com/register?ref=GCQD8XHG" style="color: var(--secondary-color); text-decoration: none;">https://accounts.binance.com/register?ref=GCQD8XHG</a></p>
      <div style="margin-top: 10px;">
        <p>${t('wallet_addresses', locale)}</p>
        <p style="margin-top: 5px; word-break: break-all;">${t('wallet_btc', locale)} bc1q6q5cf9a6srtxajzj2tk2p0zf73dyss6f5yvmgy</p>
        <p style="margin-top: 5px; word-break: break-all;">${t('wallet_eth', locale)} 0xbE8Af83320bD4eCf63c10CB61Bdfe1e0662D88b7</p>
        <p style="margin-top: 5px; word-break: break-all;">${t('wallet_usdt', locale)} TExxw25EaPKZdKr9uPJT8MLV2zHrQBbhQg</p>
        <p style="margin-top: 5px; word-break: break-all;">${t('wallet_multicoin', locale)} liupony2000.x</p>
      </div>
    </footer>
  </div>
  
  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const amountInput = document.getElementById('amount');
      const fromCurrencySelect = document.getElementById('from-currency');
      const toCurrencySelect = document.getElementById('to-currency');
      const convertBtn = document.getElementById('convert-btn');
      const resultDiv = document.getElementById('result');
      
      // 手續費相關元素
      const feeNoneRadio = document.getElementById('fee-none');
      const feePercentageRadio = document.getElementById('fee-percentage');
      const feeFixedRadio = document.getElementById('fee-fixed');
      const feePercentageInput = document.getElementById('fee-percentage-value');
      const feeFixedInput = document.getElementById('fee-fixed-value');
      const feeCurrencySelect = document.getElementById('fee-currency');
      
      // 切換手續費類型時啟用/禁用相應輸入框
      feeNoneRadio.addEventListener('change', updateFeeInputs);
      feePercentageRadio.addEventListener('change', updateFeeInputs);
      feeFixedRadio.addEventListener('change', updateFeeInputs);
      
      function updateFeeInputs() {
        feePercentageInput.disabled = !feePercentageRadio.checked;
        feeFixedInput.disabled = !feeFixedRadio.checked;
        feeCurrencySelect.disabled = !feeFixedRadio.checked;
      }
      
      // 增強下拉選單的樣式和可讀性
      function enhanceDropdowns() {
        const selects = document.querySelectorAll('select');
        selects.forEach(select => {
          // 當下拉選單打開時，確保選項有足夠的對比度
          select.addEventListener('focus', () => {
            select.style.borderColor = 'var(--secondary-color)';
            select.style.boxShadow = '0 0 0 2px rgba(36, 192, 235, 0.25)';
          });
          
          // 當下拉選單關閉時恢復原來的樣式
          select.addEventListener('blur', () => {
            select.style.boxShadow = 'none';
          });
          
          // 為每個選項添加更好的可視性
          const options = select.querySelectorAll('option');
          options.forEach(option => {
            if (option.value) {
              // 確保選項內容可見
              option.style.padding = '10px';
              option.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
            }
          });
        });
      }
      
      // 調用增強函數
      enhanceDropdowns();
      
      // 轉換按鈕點擊事件
      convertBtn.addEventListener('click', async () => {
        const amount = parseFloat(amountInput.value);
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        
        if (!amount || isNaN(amount) || amount <= 0) {
          alert('${t('enter_valid_amount', locale)}');
          return;
        }
        
        if (!fromCurrency || !toCurrency) {
          alert('${t('select_currencies', locale)}');
          return;
        }
        
        try {
          // 發送轉換請求到API
          const response = await fetch('/api/convert', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              amount,
              from: fromCurrency,
              to: toCurrency
            })
          });
          
          if (!response.ok) {
            throw new Error('${t('conversion_failed', locale)}');
          }
          
          const data = await response.json();
          let result = data.result;
          let feeAmount = 0;
          let feeDescription = '';
          
          // 計算手續費
          if (feePercentageRadio.checked) {
            const feePercentage = parseFloat(feePercentageInput.value) / 100;
            if (!isNaN(feePercentage) && feePercentage > 0) {
              feeAmount = result * feePercentage;
              result = result * (1 + feePercentage);
              feeDescription = \`包含 \${feePercentage * 100}% 手續費\`;
            }
          } else if (feeFixedRadio.checked) {
            const fixedFeeAmount = parseFloat(feeFixedInput.value);
            const feeCurrency = feeCurrencySelect.value;
            
            if (!isNaN(fixedFeeAmount) && fixedFeeAmount > 0) {
              // 需要將固定手續費轉換為目標貨幣
              if (feeCurrency === toCurrency) {
                // 如果手續費貨幣與目標貨幣相同，直接加上手續費
                feeAmount = fixedFeeAmount;
                result += fixedFeeAmount;
              } else {
                // 如果不同，需要再次調用API進行轉換
                try {
                  const feeResponse = await fetch('/api/convert', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      amount: fixedFeeAmount,
                      from: feeCurrency,
                      to: toCurrency
                    })
                  });
                  
                  if (feeResponse.ok) {
                    const feeData = await feeResponse.json();
                    feeAmount = feeData.result;
                    result += feeData.result;
                  }
                } catch (feeError) {
                  console.error('手續費轉換錯誤:', feeError);
                }
              }
              
              feeDescription = \`包含 \${formatCurrencyAmount(feeAmount, toCurrency)} 手續費\`;
            }
          }
          
          // 格式化結果
          const formattedResult = formatCurrencyAmount(result, toCurrency);
          
          // 顯示結果
          let resultText = \`\${amount} \${getCurrencyFullName(fromCurrency)} = \${formattedResult}\`;
          if (feeDescription) {
            resultText += \` (\${feeDescription})\`;
          }
          
          resultDiv.textContent = resultText;
          resultDiv.style.display = 'block';
        } catch (error) {
          console.error('轉換錯誤:', error);
          alert('${t('error_try_later', locale)}');
        }
      });
      
      // 格式化貨幣金額
      function formatCurrencyAmount(amount, currencyCode) {
        // 獲取貨幣符號
        let symbol = '';
        const currencyData = ${JSON.stringify(getCurrencySymbolMap(data))};
        
        if (currencyData[currencyCode]) {
          symbol = currencyData[currencyCode];
        }
        
        // 格式化數字
        let formattedAmount;
        
        // 根據貨幣類型決定小數位數
        let decimals = 2;
        if (['BTC', 'ETH'].includes(currencyCode)) {
          decimals = 8; // 比特幣和以太坊顯示更多小數位
        } else if (['DOGE', 'VND', 'IDR'].includes(currencyCode)) {
          decimals = 4; // 某些價值較低的貨幣可以顯示更多小數位
        }
        
        // 數字格式化
        formattedAmount = parseFloat(amount).toLocaleString('${locale}', {
          minimumFractionDigits: 2,
          maximumFractionDigits: decimals
        });
        
        return \`\${symbol}\${formattedAmount} \${currencyCode}\`;
      }
      
      // 獲取貨幣全名
      function getCurrencyFullName(code) {
        const currencyNames = ${JSON.stringify(getCurrencyNameMap(data))};
        return currencyNames[code] || code;
      }
      
      // 地圖切換功能
      function changeMap(mapUrl) {
        document.getElementById('shop-map').src = mapUrl;
      }
      
      // 地圖或連結切換功能
      function changeMapOrLink(value) {
        if (value.startsWith('map:')) {
          changeMap(value.slice(4));
        } else if (value.startsWith('link:')) {
          window.open(value.slice(5), '_blank');
        }
      }
    });
    
    // 語言切換功能
    function changeLanguage(locale) {
      // 將所選語言保存到 URL 查詢參數
      const url = new URL(window.location.href);
      url.searchParams.set('lang', locale);
      
      // 重新加載頁面以應用新語言
      window.location.href = url.toString();
    }
  </script>
</body>
</html>
  `;
}

/**
 * 生成加密貨幣的下拉選項
 */
function generateCryptoOptions(cryptoData: CryptoData[], locale: SupportedLocale = 'zh-TW'): string {
  return cryptoData.map(crypto => 
    `<option value="${crypto.symbol}">${crypto.symbol} - ${crypto.name}</option>`
  ).join('\n');
}

/**
 * 生成法幣的下拉選項
 */
function generateFiatOptions(fiatData: FiatData[], locale: SupportedLocale = 'zh-TW'): string {
  return fiatData.map(fiat => 
    `<option value="${fiat.code}">${fiat.code} - ${fiat.name}</option>`
  ).join('\n');
}

/**
 * 生成加密貨幣表格行
 */
function generateCryptoRows(cryptoData: CryptoData[], locale: SupportedLocale = 'zh-TW'): string {
  return cryptoData.map(crypto => {
    const changeClass = parseFloat(crypto.change24h) >= 0 ? 'price-up' : 'price-down';
    const changeSign = parseFloat(crypto.change24h) >= 0 ? '+' : '';
    
    return `
      <tr>
        <td>
          <span class="currency-symbol">${crypto.symbol}</span>
          ${crypto.name}
        </td>
        <td>$${parseFloat(crypto.price).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
        <td class="${changeClass}">${changeSign}${crypto.change24h}%</td>
      </tr>
    `;
  }).join('\n');
}

/**
 * 生成法幣表格行
 */
function generateFiatRows(fiatData: FiatData[], locale: SupportedLocale = 'zh-TW'): string {
  return fiatData.map(fiat => {
    return `
      <tr>
        <td>
          <span class="currency-symbol">${fiat.symbol}</span>
          ${fiat.code} - ${fiat.name}
        </td>
        <td>${parseFloat(fiat.rate).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
      </tr>
    `;
  }).join('\n');
}

/**
 * 獲取貨幣符號映射，供前端JavaScript使用
 */
function getCurrencySymbolMap(data: ExchangeRateData): Record<string, string> {
  const symbolMap: Record<string, string> = {};
  
  // 添加加密貨幣符號
  data.crypto.forEach(crypto => {
    symbolMap[crypto.symbol] = crypto.symbol;
  });
  
  // 添加法幣符號
  data.fiat.forEach(fiat => {
    symbolMap[fiat.code] = fiat.symbol;
  });
  
  return symbolMap;
}

/**
 * 獲取貨幣名稱映射，供前端JavaScript使用
 */
function getCurrencyNameMap(data: ExchangeRateData): Record<string, string> {
  const nameMap: Record<string, string> = {};
  
  // 添加加密貨幣名稱
  data.crypto.forEach(crypto => {
    nameMap[crypto.symbol] = crypto.name;
  });
  
  // 添加法幣名稱
  data.fiat.forEach(fiat => {
    nameMap[fiat.code] = fiat.name;
  });
  
  return nameMap;
} 
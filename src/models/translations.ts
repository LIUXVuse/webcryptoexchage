// 多語言翻譯文件
export interface Translation {
  [key: string]: string;
}

export interface Translations {
  [locale: string]: Translation;
}

// 支持的語言
export type SupportedLocale = 'zh-TW' | 'zh-CN' | 'en' | 'ja' | 'vi' | 'th';

// 所有翻譯內容
export const translations: Translations = {
  // 繁體中文（預設）
  'zh-TW': {
    'page_title': '加密貨幣與各國匯率換算工具',
    'last_updated': '最後更新時間',
    'currency_converter': '貨幣換算器',
    'realtime_rates': '實時匯率',
    'amount': '金額',
    'amount_placeholder': '請輸入金額',
    'from': '從',
    'to': '兌換至',
    'select_currency': '請選擇貨幣',
    'convert': '轉換',
    'cryptocurrencies': '加密貨幣',
    'fiat_currencies': '法定貨幣',
    'currency': '貨幣',
    'price_usd': '價格 (USD)',
    'change_24h': '24小時變動',
    'exchange_rate': '匯率',
    'fee_optional': '手續費（選填）',
    'no_fee': '無手續費',
    'percentage_fee': '百分比手續費',
    'fixed_fee': '固定金額手續費',
    'crypto_in_usd': '加密貨幣 (以美元計價)',
    'fiat_in_usd': '法定貨幣 (以美元計價)',
    'ad_section': '友商廣告位',
    'view_google_maps': '查看Google地圖',
    'copyright': '© 2025 加密貨幣與各國匯率換算工具 | 本網站僅供參考，不構成任何投資建議',
    'powered_by': 'Powered by PonyLIU',
    'contact': '聯繫方式',
    'thanks_message': '感謝您的使用 網站有幫到你的話 請我喝杯飲料吧 😇',
    'start_binance': '開始使用畢安交易',
    'wallet_addresses': '錢包地址',
    'also_use_wallet': '也可以使用多幣錢包',
    'enter_valid_amount': '請輸入有效金額',
    'select_currencies': '請選擇貨幣',
    'conversion_failed': '轉換請求失敗',
    'error_try_later': '轉換過程中發生錯誤，請稍後再試',
    // 友商廣告位
    'partner_ad': '友商廣告位',
    'cannabis_shop': 'TAIMATON 大麻堂 ร้านกัญชาต่ายมาตัน',
    'shop_location': 'TAIMATON 大麻堂 - 芭達雅店 (⭐4.8/5)',
    'view_instagram': 'Instagram',
    // 頁尾
    'copyright_full': '© 2025 加密貨幣與各國匯率換算工具 | 本網站僅供參考，不構成任何投資建議',
    'contact_info': '聯繫方式: liupony2000@gmail.com',
    'thanks_donation': '感謝您的使用 網站有幫到你的話 請我喝杯飲料吧 😇',
    'binance_referral': '開始使用畢安交易:',
    'wallet_btc': 'Btc錢包:',
    'wallet_eth': 'Eth錢包:',
    'wallet_usdt': 'USDT (TRC20):',
    'wallet_multicoin': '也可以使用多幣錢包:'
  },
  
  // 簡體中文
  'zh-CN': {
    'page_title': '加密货币与各国汇率换算工具',
    'last_updated': '最后更新时间',
    'currency_converter': '货币换算器',
    'realtime_rates': '实时汇率',
    'amount': '金额',
    'amount_placeholder': '请输入金额',
    'from': '从',
    'to': '兑换至',
    'select_currency': '请选择货币',
    'convert': '转换',
    'cryptocurrencies': '加密货币',
    'fiat_currencies': '法定货币',
    'currency': '货币',
    'price_usd': '价格 (USD)',
    'change_24h': '24小时变动',
    'exchange_rate': '汇率',
    'fee_optional': '手续费（选填）',
    'no_fee': '无手续费',
    'percentage_fee': '百分比手续费',
    'fixed_fee': '固定金额手续费',
    'crypto_in_usd': '加密货币 (以美元计价)',
    'fiat_in_usd': '法定货币 (以美元计价)',
    'ad_section': '友商广告位',
    'view_google_maps': '查看Google地图',
    'copyright': '© 2025 加密货币与各国汇率换算工具 | 本网站仅供参考，不构成任何投资建议',
    'powered_by': 'Powered by PonyLIU',
    'contact': '联系方式',
    'thanks_message': '感谢您的使用 网站有帮到你的话 请我喝杯饮料吧 😇',
    'start_binance': '开始使用币安交易',
    'wallet_addresses': '钱包地址',
    'also_use_wallet': '也可以使用多币钱包',
    'enter_valid_amount': '请输入有效金额',
    'select_currencies': '请选择货币',
    'conversion_failed': '转换请求失败',
    'error_try_later': '转换过程中发生错误，请稍后再试',
    // 友商广告位
    'partner_ad': '友商广告位',
    'cannabis_shop': 'TAIMATON 大麻堂 ร้านกัญชาต่ายมาตัน',
    'shop_location': 'TAIMATON 大麻堂 - 芭达雅店 (⭐4.8/5)',
    'view_instagram': 'Instagram',
    // 页脚
    'copyright_full': '© 2025 加密货币与各国汇率换算工具 | 本网站仅供参考，不构成任何投资建议',
    'contact_info': '联系方式: liupony2000@gmail.com',
    'thanks_donation': '感谢您的使用 网站有帮到你的话 请我喝杯饮料吧 😇',
    'binance_referral': '开始使用币安交易:',
    'wallet_btc': 'Btc钱包:',
    'wallet_eth': 'Eth钱包:',
    'wallet_usdt': 'USDT (TRC20):',
    'wallet_multicoin': '也可以使用多币钱包:'
  },
  
  // 英文
  'en': {
    'page_title': 'Cryptocurrency & Currency Exchange Rate Calculator',
    'last_updated': 'Last Updated',
    'currency_converter': 'Currency Converter',
    'realtime_rates': 'Real-time Exchange Rates',
    'amount': 'Amount',
    'amount_placeholder': 'Enter amount',
    'from': 'From',
    'to': 'To',
    'select_currency': 'Select currency',
    'convert': 'Convert',
    'cryptocurrencies': 'Cryptocurrencies',
    'fiat_currencies': 'Fiat Currencies',
    'currency': 'Currency',
    'price_usd': 'Price (USD)',
    'change_24h': '24h Change',
    'exchange_rate': 'Exchange Rate',
    'fee_optional': 'Fee (Optional)',
    'no_fee': 'No Fee',
    'percentage_fee': 'Percentage Fee',
    'fixed_fee': 'Fixed Fee',
    'crypto_in_usd': 'Cryptocurrencies (in USD)',
    'fiat_in_usd': 'Fiat Currencies (in USD)',
    'ad_section': 'Partner Advertisement',
    'view_google_maps': 'View on Google Maps',
    'copyright': '© 2025 Cryptocurrency & Currency Exchange Calculator | This website is for reference only and does not constitute investment advice',
    'powered_by': 'Powered by PonyLIU',
    'contact': 'Contact',
    'thanks_message': 'Thank you for using this tool. If it helps you, consider buying me a drink 😇',
    'start_binance': 'Start trading on Binance',
    'wallet_addresses': 'Wallet Addresses',
    'also_use_wallet': 'Or use multi-coin wallet',
    'enter_valid_amount': 'Please enter a valid amount',
    'select_currencies': 'Please select currencies',
    'conversion_failed': 'Conversion request failed',
    'error_try_later': 'An error occurred during conversion, please try again later',
    // Partner Advertisement
    'partner_ad': 'Partner Advertisement',
    'cannabis_shop': 'TAIMATON Cannabis Shop ร้านกัญชาต่ายมาตัน',
    'shop_location': 'TAIMATON - Pattaya Branch (⭐4.8/5)',
    'view_instagram': 'Instagram',
    // Footer
    'copyright_full': '© 2025 Cryptocurrency & Currency Exchange Calculator | This website is for reference only and does not constitute investment advice',
    'contact_info': 'Contact: liupony2000@gmail.com',
    'thanks_donation': 'Thank you for using this tool. If it helps you, consider buying me a drink 😇',
    'binance_referral': 'Start trading on Binance:',
    'wallet_btc': 'BTC Wallet:',
    'wallet_eth': 'ETH Wallet:',
    'wallet_usdt': 'USDT (TRC20):',
    'wallet_multicoin': 'Or use multi-coin wallet:'
  },
  
  // 日文
  'ja': {
    'page_title': '暗号通貨と通貨為替レート計算ツール',
    'last_updated': '最終更新',
    'currency_converter': '通貨コンバーター',
    'realtime_rates': 'リアルタイム為替レート',
    'amount': '金額',
    'amount_placeholder': '金額を入力してください',
    'from': 'から',
    'to': 'へ',
    'select_currency': '通貨を選択',
    'convert': '変換',
    'cryptocurrencies': '暗号通貨',
    'fiat_currencies': '法定通貨',
    'currency': '通貨',
    'price_usd': '価格 (USD)',
    'change_24h': '24時間変動',
    'exchange_rate': '為替レート',
    'fee_optional': '手数料（任意）',
    'no_fee': '手数料なし',
    'percentage_fee': 'パーセンテージ手数料',
    'fixed_fee': '固定手数料',
    'crypto_in_usd': '暗号通貨 (USDベース)',
    'fiat_in_usd': '法定通貨 (USDベース)',
    'ad_section': 'パートナー広告',
    'view_google_maps': 'Google マップで見る',
    'copyright': '© 2025 暗号通貨と通貨為替レート計算ツール | このウェブサイトは参考用であり、投資アドバイスを構成するものではありません',
    'powered_by': 'Powered by PonyLIU',
    'contact': '連絡先',
    'thanks_message': 'ご利用ありがとうございます。お役に立てたら、ドリンク一杯おごってください 😇',
    'start_binance': 'Binanceで取引を始める',
    'wallet_addresses': 'ウォレットアドレス',
    'also_use_wallet': 'またはマルチコインウォレットを使用',
    'enter_valid_amount': '有効な金額を入力してください',
    'select_currencies': '通貨を選択してください',
    'conversion_failed': '変換リクエストが失敗しました',
    'error_try_later': '変換中にエラーが発生しました。後でもう一度お試しください',
    // パートナー広告
    'partner_ad': 'パートナー広告',
    'cannabis_shop': 'TAIMATON 大麻店 ร้านกัญชาต่ายมาตัน',
    'shop_location': 'TAIMATON - パタヤ支店 (⭐4.8/5)',
    'view_instagram': 'Instagram',
    // フッター
    'copyright_full': '© 2025 暗号通貨と通貨為替レート計算ツール | このウェブサイトは参考用であり、投資アドバイスを構成するものではありません',
    'contact_info': '連絡先: liupony2000@gmail.com',
    'thanks_donation': 'ご利用ありがとうございます。お役に立てたら、ドリンク一杯おごってください 😇',
    'binance_referral': 'Binanceで取引を始める:',
    'wallet_btc': 'ビットコインウォレット:',
    'wallet_eth': 'イーサリアムウォレット:',
    'wallet_usdt': 'USDT (TRC20):',
    'wallet_multicoin': 'またはマルチコインウォレットを使用:'
  },
  
  // 越南文
  'vi': {
    'page_title': 'Công Cụ Quy Đổi Tiền Điện Tử & Tỷ Giá Tiền Tệ',
    'last_updated': 'Cập nhật lần cuối',
    'currency_converter': 'Công Cụ Chuyển Đổi Tiền Tệ',
    'realtime_rates': 'Tỷ Giá Thời Gian Thực',
    'amount': 'Số lượng',
    'amount_placeholder': 'Nhập số tiền',
    'from': 'Từ',
    'to': 'Đến',
    'select_currency': 'Chọn tiền tệ',
    'convert': 'Chuyển đổi',
    'cryptocurrencies': 'Tiền điện tử',
    'fiat_currencies': 'Tiền pháp định',
    'currency': 'Tiền tệ',
    'price_usd': 'Giá (USD)',
    'change_24h': 'Thay đổi 24h',
    'exchange_rate': 'Tỷ giá',
    'fee_optional': 'Phí (Tùy chọn)',
    'no_fee': 'Không phí',
    'percentage_fee': 'Phí theo phần trăm',
    'fixed_fee': 'Phí cố định',
    'crypto_in_usd': 'Tiền điện tử (tính bằng USD)',
    'fiat_in_usd': 'Tiền pháp định (tính bằng USD)',
    'ad_section': 'Quảng cáo đối tác',
    'view_google_maps': 'Xem trên Google Maps',
    'copyright': '© 2025 Công Cụ Quy Đổi Tiền Điện Tử & Tỷ Giá | Trang web này chỉ để tham khảo và không cấu thành lời khuyên đầu tư',
    'powered_by': 'Powered by PonyLIU',
    'contact': 'Liên hệ',
    'thanks_message': 'Cảm ơn bạn đã sử dụng công cụ này. Nếu nó giúp ích cho bạn, hãy mua cho tôi một ly nước nhé 😇',
    'start_binance': 'Bắt đầu giao dịch trên Binance',
    'wallet_addresses': 'Địa chỉ ví',
    'also_use_wallet': 'Hoặc sử dụng ví đa tiền tệ',
    'enter_valid_amount': 'Vui lòng nhập số tiền hợp lệ',
    'select_currencies': 'Vui lòng chọn tiền tệ',
    'conversion_failed': 'Yêu cầu chuyển đổi thất bại',
    'error_try_later': 'Đã xảy ra lỗi trong quá trình chuyển đổi, vui lòng thử lại sau',
    // Quảng cáo đối tác
    'partner_ad': 'Quảng cáo đối tác',
    'cannabis_shop': 'TAIMATON Cửa hàng cần sa ร้านกัญชาต่ายมาตัน',
    'shop_location': 'TAIMATON - Chi nhánh Pattaya (⭐4.8/5)',
    'view_instagram': 'Instagram',
    // Chân trang
    'copyright_full': '© 2025 Công Cụ Quy Đổi Tiền Điện Tử & Tỷ Giá | Trang web này chỉ để tham khảo và không cấu thành lời khuyên đầu tư',
    'contact_info': 'Liên hệ: liupony2000@gmail.com',
    'thanks_donation': 'Cảm ơn bạn đã sử dụng công cụ này. Nếu nó giúp ích cho bạn, hãy mua cho tôi một ly nước nhé 😇',
    'binance_referral': 'Bắt đầu giao dịch trên Binance:',
    'wallet_btc': 'Ví BTC:',
    'wallet_eth': 'Ví ETH:',
    'wallet_usdt': 'USDT (TRC20):',
    'wallet_multicoin': 'Hoặc sử dụng ví đa tiền tệ:'
  },
  
  // 泰文
  'th': {
    'page_title': 'เครื่องมือแปลงอัตราแลกเปลี่ยนสกุลเงินดิจิทัลและสกุลเงินต่างๆ',
    'last_updated': 'อัปเดตล่าสุด',
    'currency_converter': 'เครื่องแปลงสกุลเงิน',
    'realtime_rates': 'อัตราแลกเปลี่ยนเรียลไทม์',
    'amount': 'จำนวน',
    'amount_placeholder': 'กรอกจำนวนเงิน',
    'from': 'จาก',
    'to': 'ไปยัง',
    'select_currency': 'เลือกสกุลเงิน',
    'convert': 'แปลง',
    'cryptocurrencies': 'สกุลเงินดิจิทัล',
    'fiat_currencies': 'สกุลเงินทั่วไป',
    'currency': 'สกุลเงิน',
    'price_usd': 'ราคา (USD)',
    'change_24h': 'เปลี่ยนแปลง 24 ชม.',
    'exchange_rate': 'อัตราแลกเปลี่ยน',
    'fee_optional': 'ค่าธรรมเนียม (ไม่บังคับ)',
    'no_fee': 'ไม่มีค่าธรรมเนียม',
    'percentage_fee': 'ค่าธรรมเนียมเป็นเปอร์เซ็นต์',
    'fixed_fee': 'ค่าธรรมเนียมคงที่',
    'crypto_in_usd': 'สกุลเงินดิจิทัล (เทียบกับ USD)',
    'fiat_in_usd': 'สกุลเงินทั่วไป (เทียบกับ USD)',
    'ad_section': 'พื้นที่โฆษณาพันธมิตร',
    'view_google_maps': 'ดูใน Google Maps',
    'copyright': '© 2025 เครื่องมือแปลงอัตราแลกเปลี่ยนสกุลเงินดิจิทัลและสกุลเงินต่างๆ | เว็บไซต์นี้ใช้สำหรับอ้างอิงเท่านั้นและไม่ได้เป็นคำแนะนำในการลงทุน',
    'powered_by': 'Powered by PonyLIU',
    'contact': 'ติดต่อ',
    'thanks_message': 'ขอบคุณที่ใช้เครื่องมือนี้ หากมันช่วยคุณได้ ลองเลี้ยงเครื่องดื่มให้ฉันสักแก้วนะ 😇',
    'start_binance': 'เริ่มเทรดบน Binance',
    'wallet_addresses': 'ที่อยู่กระเป๋าเงิน',
    'also_use_wallet': 'หรือใช้กระเป๋าเงินหลายสกุล',
    'enter_valid_amount': 'กรุณากรอกจำนวนเงินที่ถูกต้อง',
    'select_currencies': 'กรุณาเลือกสกุลเงิน',
    'conversion_failed': 'การแปลงสกุลเงินล้มเหลว',
    'error_try_later': 'เกิดข้อผิดพลาดระหว่างการแปลงสกุลเงิน โปรดลองใหม่ภายหลัง',
    // พื้นที่โฆษณาพันธมิตร
    'partner_ad': 'พื้นที่โฆษณาพันธมิตร',
    'cannabis_shop': 'TAIMATON ร้านกัญชาต่ายมาตัน',
    'shop_location': 'TAIMATON - สาขาพัทยา (⭐4.8/5)',
    'view_instagram': 'Instagram',
    // ส่วนท้าย
    'copyright_full': '© 2025 เครื่องมือแปลงอัตราแลกเปลี่ยนสกุลเงินดิจิทัลและสกุลเงินต่างๆ | เว็บไซต์นี้ใช้สำหรับอ้างอิงเท่านั้นและไม่ได้เป็นคำแนะนำในการลงทุน',
    'contact_info': 'ติดต่อ: liupony2000@gmail.com',
    'thanks_donation': 'ขอบคุณที่ใช้เครื่องมือนี้ หากมันช่วยคุณได้ ลองเลี้ยงเครื่องดื่มให้ฉันสักแก้วนะ 😇',
    'binance_referral': 'เริ่มเทรดบน Binance:',
    'wallet_btc': 'กระเป๋า BTC:',
    'wallet_eth': 'กระเป๋า ETH:',
    'wallet_usdt': 'USDT (TRC20):',
    'wallet_multicoin': 'หรือใช้กระเป๋าเงินหลายสกุล:'
  }
};

// 獲取翻譯
export function t(key: string, locale: SupportedLocale = 'zh-TW', params: string[] = []): string {
  if (!translations[locale]) {
    locale = 'zh-TW'; // 預設使用繁體中文
  }
  
  let text = translations[locale][key] || key;
  
  // 替換參數 {0}, {1} 等
  params.forEach((param, index) => {
    text = text.replace(`{${index}}`, param);
  });
  
  return text;
}

// 獲取支持的語言列表
export function getSupportedLocales(): { code: SupportedLocale; name: string }[] {
  return [
    { code: 'zh-TW', name: '繁體中文' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'en', name: 'English' },
    { code: 'ja', name: '日本語' },
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'th', name: 'ภาษาไทย' }
  ];
} 
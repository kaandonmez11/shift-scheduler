/**
 * Türkiye Resmi Tatilleri (Sabit Tarihli)
 * Not: Dini bayramlar (Ramazan ve Kurban) her yıl değiştiği için dinamik hesaplama
 * kütüphaneleri veya manuel giriş gerektirir. Şimdilik sistemin genelinde 
 * sabit resmi tatilleri baz alıyoruz.
 */

export const getFixedHolidays = (year) => [
  { date: `${year}-01-01`, name: "Yılbaşı" },
  { date: `${year}-04-23`, name: "Ulusal Egemenlik ve Çocuk Bayramı" },
  { date: `${year}-05-01`, name: "Emek ve Dayanışma Günü" },
  { date: `${year}-05-19`, name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı" },
  { date: `${year}-07-15`, name: "Demokrasi ve Milli Birlik Günü" },
  { date: `${year}-08-30`, name: "Zafer Bayramı" },
  { date: `${year}-10-29`, name: "Cumhuriyet Bayramı" }
];

/**
 * Verilen yıl, ay ve günün resmi tatil olup olmadığını kontrol eder.
 * @param {number} year 
 * @param {number} month (1-12)
 * @param {number} day (1-31)
 * @returns {Object|null} Tatil objesi { date, name } veya değilse null
 */
export const checkIsHoliday = (year, month, day) => {
  const holidays = getFixedHolidays(year);
  
  // Aylar ve günleri '04' veya '23' gibi string yapısına çeviriyoruz
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  
  const targetDate = `${year}-${formattedMonth}-${formattedDay}`;
  
  const foundHoliday = holidays.find(h => h.date === targetDate);
  return foundHoliday ? foundHoliday : null;
};

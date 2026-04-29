export const getFixedHolidays = (year) => [
  { date: `${year}-01-01`, name: "Yılbaşı" },
  { date: `${year}-04-23`, name: "Ulusal Egemenlik ve Çocuk Bayramı" },
  { date: `${year}-05-01`, name: "Emek ve Dayanışma Günü" },
  { date: `${year}-05-19`, name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı" },
  { date: `${year}-07-15`, name: "Demokrasi ve Milli Birlik Günü" },
  { date: `${year}-08-30`, name: "Zafer Bayramı" },
  { date: `${year}-10-29`, name: "Cumhuriyet Bayramı" },
];

export const checkIsHoliday = (year, month, day, customHolidays = []) => {
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  const targetDate = `${year}-${formattedMonth}-${formattedDay}`;
  const all = [...getFixedHolidays(year), ...customHolidays];
  return all.find(h => h.date === targetDate) || null;
};

// Ramazan ve Kurban Bayramı'nın "1. Gün" girişlerinden bir önceki gün = arefe.
// Verilen yıl ve aya ait arefe günlerini (gün numarası olarak) döndürür.
export const getArefeDays = (year, month, customHolidays = []) => {
  const arefeDays = [];
  customHolidays.forEach(h => {
    if (!h.name.includes('1. Gün')) return;
    const [hYear, hMonth, hDay] = h.date.split('-').map(Number);
    const arefeDate = new Date(hYear, hMonth - 1, hDay - 1);
    if (arefeDate.getFullYear() === year && arefeDate.getMonth() + 1 === month) {
      arefeDays.push(arefeDate.getDate());
    }
  });
  return arefeDays;
};

// Sorumlu/hamile programını baz alarak aylık toplam mesai saatini hesaplar:
// Hafta içi → aShiftHours, Cumartesi + arefe → bShiftHours, Pazar + tatil → 0
export const calculateSorumluMonthlyTarget = (year, month, customHolidays = [], aShiftHours = 8, bShiftHours = 5) => {
  const numDays = new Date(year, month, 0).getDate();
  const arefeDays = getArefeDays(year, month, customHolidays);
  let total = 0;
  for (let d = 1; d <= numDays; d++) {
    if (checkIsHoliday(year, month, d, customHolidays)) continue;
    const dow = new Date(year, month - 1, d).getDay();
    if (dow === 0) continue;
    total += (arefeDays.includes(d) || dow === 6) ? bShiftHours : aShiftHours;
  }
  return total;
};

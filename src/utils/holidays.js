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

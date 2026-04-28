import * as XLSX from 'xlsx';
import { checkIsHoliday } from './holidays';

const TR_DAYS_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const MONTH_NAMES   = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

const colWidth = (cells) => ({ wch: Math.min(Math.max(...cells.map(c => String(c ?? '').length)) + 2, 40) });

export const exportToExcel = (workspace, customHolidays = []) => {
  const { employees, settings, shifts, actualHours, title } = workspace;
  const {
    year, month,
    targetMonthlyHours = 180,
    shiftLabels = { day: 'D', night: 'N', fixedDay: 'A', fixedHalfDay: 'B' },
  } = settings;

  const numDays    = new Date(year, month, 0).getDate();
  const daysArray  = Array.from({ length: numDays }, (_, i) => i + 1);
  const monthLabel = `${MONTH_NAMES[month - 1]} ${year}`;

  // ── Sheet 1: Vardiya Çizelgesi ───────────────────────────────────────────

  // Başlık satırı: gün sütunları için "1 Pzt", "2 Sal" gibi etiketler
  const dayHeaders = daysArray.map(d => {
    const dow     = new Date(year, month - 1, d).getDay();
    const isHol   = checkIsHoliday(year, month, d, customHolidays);
    const suffix  = isHol ? ' ★' : '';
    return `${d} ${TR_DAYS_SHORT[dow]}${suffix}`;
  });

  const sheetHeaders = ['Personel', 'Kıdem', ...dayHeaders, 'Devreden', 'Toplam', 'Hedef'];

  const sheetRows = employees.map(emp => {
    const empShifts  = shifts?.[emp.id] || {};
    const totalHours = actualHours?.[emp.id] ?? 0;
    const balance    = totalHours - targetMonthlyHours;

    const dayCells = daysArray.map(d => {
      const v = empShifts[d];
      return (v === undefined || v === null) ? '-' : v;
    });

    return [
      emp.name,
      emp.seniority.charAt(0).toUpperCase() + emp.seniority.slice(1),
      ...dayCells,
      balance > 0 ? `+${balance}` : balance,
      totalHours,
      targetMonthlyHours,
    ];
  });

  const ws1Data = [sheetHeaders, ...sheetRows];
  const ws1     = XLSX.utils.aoa_to_sheet(ws1Data);

  // Otomatik sütun genişlikleri
  ws1['!cols'] = sheetHeaders.map((h, ci) =>
    colWidth([h, ...sheetRows.map(r => r[ci])])
  );

  // Satır yüksekliği (başlık biraz daha yüksek)
  ws1['!rows'] = [{ hpt: 20 }];

  // ── Sheet 2: Saat Analizi ────────────────────────────────────────────────

  const anaHeaders = ['Personel', 'Kıdem', 'Devreden Bakiye', 'Toplam Saat', 'Hedef Saat', 'Fark', 'Durum'];

  const anaRows = employees.map(emp => {
    const totalHours = actualHours?.[emp.id] ?? 0;
    const balance    = totalHours - targetMonthlyHours;
    return [
      emp.name,
      emp.seniority.charAt(0).toUpperCase() + emp.seniority.slice(1),
      emp.initialBalance || 0,
      totalHours,
      targetMonthlyHours,
      balance > 0 ? `+${balance}` : balance,
      balance >= 0 ? 'Hedefte' : 'Eksik',
    ];
  });

  // Özet satırı
  const totalAll = employees.reduce((s, emp) => s + (actualHours?.[emp.id] ?? 0), 0);
  anaRows.push(
    [],
    ['TOPLAM', '', '', totalAll, targetMonthlyHours * employees.length, '', '']
  );

  const ws2Data = [anaHeaders, ...anaRows];
  const ws2     = XLSX.utils.aoa_to_sheet(ws2Data);
  ws2['!cols']  = anaHeaders.map((h, ci) =>
    colWidth([h, ...anaRows.map(r => r[ci])])
  );

  // ── Workbook ─────────────────────────────────────────────────────────────

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws1, 'Vardiya Çizelgesi');
  XLSX.utils.book_append_sheet(wb, ws2, 'Saat Analizi');

  const safeName = (title || 'Vardiya').replace(/[\\/:*?"<>|]/g, '_');
  XLSX.writeFile(wb, `${safeName}_${monthLabel}.xlsx`);
};

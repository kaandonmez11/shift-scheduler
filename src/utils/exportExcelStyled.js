import XLSXStyle from 'xlsx-js-style';
import { checkIsHoliday } from './holidays';

const MONTH_NAMES = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

// ── Renk sabitleri ────────────────────────────────────────────────────────────
const C = {
  WEEKEND:  'FFFF00',  // hafta sonu sarı
  HOLIDAY:  '8DB4E2',  // resmi tatil mavi
  TITLE_BG: 'D9D9D9',  // "AYLIK ÇALIŞMA SAATİ" gri
  WHITE:    'FFFFFF',
  BLACK:    '000000',
  RED:      'FF0000',
  BORDER:   'BFBFBF',
  SUM_BG:   'FFFF00',  // özet satırı başlık sarı
  GREEN_T:  '1D6A35',  // toplam hedefte
  RED_T:    'B22222',  // toplam eksik
};

const bdr = () => ({
  top:    { style: 'thin', color: { rgb: C.BORDER } },
  bottom: { style: 'thin', color: { rgb: C.BORDER } },
  left:   { style: 'thin', color: { rgb: C.BORDER } },
  right:  { style: 'thin', color: { rgb: C.BORDER } },
});

const cell = (v, s = {}) => ({
  v: v ?? '',
  t: typeof v === 'number' ? 'n' : 's',
  s,
});

const addr = (r, c) => XLSXStyle.utils.encode_cell({ r, c });

// Boş hücre stili — beyaz arkaplan, ince kenarlık
const blankStyle = {
  fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
  border: bdr(),
};

export const exportToExcelStyled = (workspace, customHolidays = []) => {
  const { employees, settings, shifts, actualHours, title } = workspace;
  const {
    year, month,
    targetMonthlyHours = 180,
    shiftLabels = { day: 'D', night: 'N', fixedDay: 'A', fixedHalfDay: 'B' },
  } = settings;
  const { day: DAY, night: NIGHT, fixedDay: FIXED_DAY, fixedHalfDay: FIXED_HALF } = shiftLabels;

  const numDays   = new Date(year, month, 0).getDate();
  const days      = Array.from({ length: numDays }, (_, i) => i + 1);
  const monthLabel = `${MONTH_NAMES[month - 1].toUpperCase()} ${year}`;

  // Col layout: 0=İsim | 1..numDays=günler | numDays+1=Toplam | numDays+2=Hedef
  const NAME_COL   = 0;
  const TOPLAM_COL = numDays + 1;
  const HEDEF_COL  = numDays + 2;
  const LAST_COL   = HEDEF_COL;

  const ws = {};
  const merges = [];

  // ── Belirli bir günün sütun arkaplanı ──────────────────────────────────────
  const dayBg = (d) => {
    if (checkIsHoliday(year, month, d, customHolidays)) return C.HOLIDAY;
    const dow = new Date(year, month - 1, d).getDay();
    return (dow === 0 || dow === 6) ? C.WEEKEND : C.WHITE;
  };

  // ── ROW 0: Başlık satırı ────────────────────────────────────────────────────
  // [0..3] "AYLIK ÇALIŞMA SAATİ" — merged, D9D9D9, siyah, altı çizili
  merges.push({ s: { r:0, c:0 }, e: { r:0, c:3 } });
  ws[addr(0,0)] = cell('AYLIK ÇALIŞMA SAATİ', {
    fill: { patternType: 'solid', fgColor: { rgb: C.TITLE_BG } },
    font: { bold: true, sz: 11, color: { rgb: C.BLACK }, underline: true, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: bdr(),
  });
  for (let c = 1; c <= 3; c++) {
    ws[addr(0,c)] = cell('', { fill: { patternType: 'solid', fgColor: { rgb: C.TITLE_BG } }, border: bdr() });
  }

  // [4] Hedef saat — beyaz, siyah
  ws[addr(0,4)] = cell(targetMonthlyHours, {
    fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
    font: { bold: true, sz: 12, color: { rgb: C.BLACK }, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: bdr(),
    numFmt: '0',
  });

  // [5..LAST_COL] "MAYIS 2026" merged, beyaz, siyah, sağa hizalı
  merges.push({ s: { r:0, c:5 }, e: { r:0, c: LAST_COL } });
  ws[addr(0,5)] = cell(monthLabel, {
    fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
    font: { bold: true, sz: 16, color: { rgb: C.BLACK }, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: bdr(),
  });
  for (let c = 6; c <= LAST_COL; c++) {
    ws[addr(0,c)] = cell('', { fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } }, border: bdr() });
  }

  // ── ROW 1: Gün başlıkları ───────────────────────────────────────────────────
  // "AD & SOYAD" — beyaz, kırmızı
  ws[addr(1, NAME_COL)] = cell('AD & SOYAD', {
    fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
    font: { bold: true, sz: 10, color: { rgb: C.RED }, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: bdr(),
  });

  days.forEach((d, i) => {
    const bg = dayBg(d);
    ws[addr(1, i + 1)] = cell(d, {
      fill: { patternType: 'solid', fgColor: { rgb: bg } },
      font: { bold: true, sz: 10, color: { rgb: C.BLACK }, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: bdr(),
    });
  });

  // TOPLAM & HEDEF başlıkları — beyaz, siyah
  const colHdrStyle = {
    fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
    font: { bold: true, sz: 10, color: { rgb: C.BLACK }, name: 'Calibri' },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: bdr(),
  };
  ws[addr(1, TOPLAM_COL)] = cell('TOPLAM', colHdrStyle);
  ws[addr(1, HEDEF_COL)]  = cell('HEDEF',  colHdrStyle);

  // ── ROWS 2+: Personel ───────────────────────────────────────────────────────
  employees.forEach((emp, rowIdx) => {
    const r          = rowIdx + 2;
    const empShifts  = shifts?.[emp.id] || {};
    const totalHours = actualHours?.[emp.id] ?? 0;
    const onTarget   = totalHours >= targetMonthlyHours;

    // İsim — beyaz, siyah
    ws[addr(r, NAME_COL)] = cell(emp.name, {
      fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
      font: { bold: true, sz: 10, color: { rgb: C.BLACK }, name: 'Calibri' },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: bdr(),
    });

    days.forEach((d, i) => {
      const bg  = dayBg(d);
      const v   = empShifts[d];
      const val = (!v || v === '-') ? '' : v === 'İzin' ? 'İzin' : v;
      ws[addr(r, i + 1)] = cell(val, {
        fill: { patternType: 'solid', fgColor: { rgb: bg } },
        font: { bold: !!val, sz: 10, color: { rgb: C.BLACK }, name: 'Calibri' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: bdr(),
      });
    });

    // Toplam — yeşil/kırmızı
    ws[addr(r, TOPLAM_COL)] = cell(totalHours, {
      fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
      font: { bold: true, sz: 10, color: { rgb: onTarget ? C.GREEN_T : C.RED_T }, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: bdr(),
    });
    // Hedef — beyaz, siyah
    ws[addr(r, HEDEF_COL)] = cell(targetMonthlyHours, {
      fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
      font: { sz: 10, color: { rgb: C.BLACK }, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: bdr(),
    });
  });

  // ── Özet satırları ──────────────────────────────────────────────────────────
  const SUMMARY_START = employees.length + 3;

  const shiftTypes = [
    { key: DAY,        label: `Gündüz Vardiyası (${DAY})`  },
    { key: NIGHT,      label: `Gece Vardiyası (${NIGHT})`  },
    { key: FIXED_DAY,  label: `Tam Gün (${FIXED_DAY})`     },
    { key: FIXED_HALF, label: `Yarım Gün (${FIXED_HALF})`  },
    { key: 'İzin',     label: 'İzin'                        },
  ];

  shiftTypes.forEach((st, si) => {
    const r = SUMMARY_START + si;

    // Etiket — sarı arkaplan, kırmızı text
    ws[addr(r, NAME_COL)] = cell(st.label, {
      fill: { patternType: 'solid', fgColor: { rgb: C.SUM_BG } },
      font: { bold: true, sz: 9, color: { rgb: C.RED }, name: 'Calibri' },
      alignment: { horizontal: 'left', vertical: 'center' },
      border: bdr(),
    });

    let total = 0;
    days.forEach((d, i) => {
      const bg    = dayBg(d);
      const count = employees.filter(emp => shifts?.[emp.id]?.[d] === st.key).length;
      total += count;
      // Boş yerine 0 yaz
      ws[addr(r, i + 1)] = cell(count, {
        fill: { patternType: 'solid', fgColor: { rgb: bg } },
        font: { bold: count > 0, sz: 9, color: { rgb: C.BLACK }, name: 'Calibri' },
        alignment: { horizontal: 'center', vertical: 'center' },
        border: bdr(),
      });
    });

    // Toplam sayısı
    ws[addr(r, TOPLAM_COL)] = cell(total, {
      fill: { patternType: 'solid', fgColor: { rgb: C.WHITE } },
      font: { bold: true, sz: 9, color: { rgb: C.BLACK }, name: 'Calibri' },
      alignment: { horizontal: 'center', vertical: 'center' },
      border: bdr(),
    });
    ws[addr(r, HEDEF_COL)] = cell('', blankStyle);
  });

  // ── Sheet meta ──────────────────────────────────────────────────────────────
  const lastRow = SUMMARY_START + shiftTypes.length - 1;
  ws['!ref']    = XLSXStyle.utils.encode_range({ s: { r:0, c:0 }, e: { r: lastRow, c: LAST_COL } });
  ws['!merges'] = merges;
  ws['!cols']   = [
    { wch: 24 },
    ...days.map(() => ({ wch: 4.5 })),
    { wch: 9 },
    { wch: 7 },
  ];
  ws['!rows'] = [
    { hpt: 24 },
    { hpt: 20 },
    ...employees.map(() => ({ hpt: 18 })),
  ];

  const wb = XLSXStyle.utils.book_new();
  XLSXStyle.utils.book_append_sheet(wb, ws, 'Vardiya Çizelgesi');

  const safe = (title || 'Vardiya').replace(/[\\/:*?"<>|]/g, '_');
  XLSXStyle.writeFile(wb, `${safe}_${MONTH_NAMES[month - 1]}_${year}.xlsx`);
};

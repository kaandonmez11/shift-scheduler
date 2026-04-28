import React, { useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useIsMobile } from '../../hooks/useIsMobile';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useStore } from '../../store/useStore';
import { generateSchedule } from '../../utils/scheduler';
import { checkIsHoliday } from '../../utils/holidays';
import { Settings, Play, Calendar as CalendarIcon, Download } from 'lucide-react';
import { exportToExcel } from '../../utils/exportExcel';
import { exportToExcelStyled } from '../../utils/exportExcelStyled';

const TR_DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

const TYPE_ACCENT = {
  yeni:    '#34d399',
  kidemli: '#c084fc',
  hamile:  '#fb7185',
  sorumlu: '#fb923c',
};

export default function CalendarGrid() {
  const scrollRef = useRef(null);
  const activeCellRef = useRef(null);
  const [popover, setPopover] = useState(null); // { empId, day, x, y }
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!popover) return;
    const updatePos = () => {
      if (!activeCellRef.current) return;
      const rect = activeCellRef.current.getBoundingClientRect();
      setPopover(prev => prev ? { ...prev, x: rect.left + rect.width / 2, y: rect.bottom + 6 } : null);
    };
    window.addEventListener('scroll', updatePos, true);
    return () => window.removeEventListener('scroll', updatePos, true);
  }, [!!popover]);

  const { workspaces, activeWorkspaceId, setSchedule, updateShiftCell, customHolidays = [] } = useStore();
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);

  if (!activeWorkspace) return null;

  const { employees, settings, shifts, actualHours } = activeWorkspace;
  const {
    year, month,
    shiftLabels = { day: 'D', night: 'N', fixedDay: 'A', fixedHalfDay: 'B' },
    targetMonthlyHours = 180,
  } = settings;
  const { day: DAY, night: NIGHT, fixedDay: FIXED_DAY, fixedHalfDay: FIXED_HALF } = shiftLabels;

  const numDays   = new Date(year, month, 0).getDate();
  const daysArray = Array.from({ length: numDays }, (_, i) => i + 1);

  const now = new Date();
  const todayCol = (now.getFullYear() === year && now.getMonth() + 1 === month)
    ? now.getDate() : -1;

  const handleRunAlgorithm = () => {
    if (employees.length === 0) { alert('Lütfen önce personel ekleyin.'); return; }
    const startDay = (year === now.getFullYear() && month === now.getMonth() + 1)
      ? now.getDate() : 1;
    const result = generateSchedule(year, month, employees, settings, startDay, customHolidays);
    setSchedule(activeWorkspaceId, result.schedule, result.actualHours);
  };

  const handleCellClick = (empId, day, e) => {
    e.stopPropagation();
    activeCellRef.current = e.currentTarget;
    const rect = e.currentTarget.getBoundingClientRect();
    // Viewport kenarlarına taşmayı önle
    const popoverW = 290;
    const rawX = rect.left + rect.width / 2;
    const clampedX = Math.max(popoverW / 2 + 8, Math.min(rawX, window.innerWidth - popoverW / 2 - 8));
    setPopover({ empId, day, x: clampedX, y: rect.bottom + 6 });
  };

  const applyShift = (newShift) => {
    updateShiftCell(activeWorkspaceId, popover.empId, popover.day, newShift);
    setPopover(null);
  };

  // ── Hücre stil hesaplama ──────────────────────────────────────────────────
  const cellStyle = (shiftVal, isHol, isWeekend, isToday) => {
    const base = {
      width: 40, minWidth: 40, height: 44,
      padding: 0,
      borderRight: '1px solid rgba(255,255,255,0.04)',
      fontWeight: 600, fontSize: '0.8rem',
      textAlign: 'center', verticalAlign: 'middle',
      transition: 'background 0.15s',
      whiteSpace: 'nowrap',
      cursor: 'pointer',
    };

    if (shiftVal === NIGHT)
      return { ...base,
        background: 'rgba(59,130,246,0.2)',  color: '#93c5fd',
        boxShadow: 'inset 0 1px 0 rgba(59,130,246,0.35), inset 0 0 14px rgba(59,130,246,0.1)' };
    if (shiftVal === DAY)
      return { ...base,
        background: 'rgba(16,185,129,0.18)', color: '#6ee7b7',
        boxShadow: 'inset 0 1px 0 rgba(16,185,129,0.35), inset 0 0 14px rgba(16,185,129,0.1)' };
    if (shiftVal === FIXED_DAY)
      return { ...base,
        background: 'rgba(6,182,212,0.18)',  color: '#67e8f9',
        boxShadow: 'inset 0 1px 0 rgba(6,182,212,0.35), inset 0 0 14px rgba(6,182,212,0.1)' };
    if (shiftVal === FIXED_HALF)
      return { ...base,
        background: 'rgba(168,85,247,0.18)', color: '#c4b5fd',
        boxShadow: 'inset 0 1px 0 rgba(168,85,247,0.35), inset 0 0 14px rgba(168,85,247,0.1)' };
    if (shiftVal === 'İzin')
      return { ...base,
        background: 'rgba(239,68,68,0.14)',  color: '#fca5a5',
        boxShadow: 'inset 0 1px 0 rgba(239,68,68,0.25)' };

    let bg = 'transparent';
    if (isToday)    bg = 'rgba(99,102,241,0.09)';
    else if (isHol)      bg = 'rgba(252,211,77,0.06)';
    else if (isWeekend)  bg = 'rgba(255,255,255,0.018)';

    return { ...base, background: bg, color: 'rgba(255,255,255,0.18)' };
  };

  // ── Sabit stiller ──────────────────────────────────────────────────────────
  const stickyLeft = {
    position: 'sticky', left: 0, zIndex: 5,
    background: 'rgba(10,18,35,0.97)',
    backdropFilter: 'blur(12px)',
    borderRight: '1px solid rgba(255,255,255,0.08)',
  };
  const TOPLAM_W   = 96;
  const DEVREDEN_W = 72;

  // Masaüstünde sticky, mobilde normal (scroll ile birlikte kayar)
  const stickyRight = isMobile ? {
    textAlign: 'center',
    borderLeft: '1px solid rgba(255,255,255,0.07)',
  } : {
    position: 'sticky', right: 0, zIndex: 5,
    background: 'rgba(6,12,26,1)',
    backdropFilter: 'blur(40px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(40px) saturate(1.6)',
    borderLeft: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '-4px 0 16px rgba(0,0,0,0.5)',
    textAlign: 'center',
  };
  const thBase = {
    position: 'sticky', top: 0, zIndex: 8,
    background: 'rgba(10,18,35,0.98)',
    backdropFilter: 'blur(16px)',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    fontWeight: 600, userSelect: 'none',
    padding: 0,
  };

  const hasShifts = shifts && Object.keys(shifts).length > 0;

  // Popover seçenekleri
  const popoverOptions = [
    { label: DAY,        color: '#6ee7b7', bg: 'rgba(16,185,129,0.22)' },
    { label: NIGHT,      color: '#93c5fd', bg: 'rgba(59,130,246,0.22)' },
    { label: FIXED_DAY,  color: '#67e8f9', bg: 'rgba(6,182,212,0.22)' },
    { label: FIXED_HALF, color: '#c4b5fd', bg: 'rgba(168,85,247,0.22)' },
    { label: 'İzin',     color: '#fca5a5', bg: 'rgba(239,68,68,0.22)' },
    { label: 'Sil',      color: 'rgba(255,255,255,0.45)', bg: 'rgba(255,255,255,0.07)', border: 'rgba(255,255,255,0.15)' },
  ];

  return (
    <Card className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem 1rem' }}>

      {/* ── Başlık ── */}
      <div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', gap:'1rem', borderBottom:'1px solid var(--glass-border)', paddingBottom:'1rem' }}>
        <h2 style={{ fontSize:'1.3rem', fontWeight:600, display:'flex', alignItems:'center', gap:'0.5rem', color:'#fcd34d', margin:0 }}>
          <CalendarIcon size={24}/> Vardiya Çizelgesi
        </h2>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
          {hasShifts && (
            <>
              <Button onClick={() => exportToExcelStyled(activeWorkspace, customHolidays)} style={{ borderColor:'rgba(251,191,36,0.5)', color:'#fbbf24', minHeight:44 }}>
                <Download size={16}/> Detaylı Excel
              </Button>
              <Button onClick={() => exportToExcel(activeWorkspace, customHolidays)} style={{ borderColor:'rgba(52,211,153,0.4)', color:'#34d399', minHeight:44 }}>
                <Download size={16}/> Excel İndir
              </Button>
            </>
          )}
          <Button onClick={handleRunAlgorithm} style={{ background:'var(--accent-primary)', borderColor:'transparent', color:'white', minHeight:44 }}>
            <Play size={16} fill="white"/> Dağılımı Oluştur
          </Button>
        </div>
      </div>

      {/* ── Boş durumlar ── */}
      {employees.length === 0 && (
        <p style={{ color:'var(--text-muted)', textAlign:'center', margin:'2rem 0' }}>
          Liste oluşturmak için önce "Personel" ekleyin.
        </p>
      )}
      {employees.length > 0 && !hasShifts && (
        <div style={{ textAlign:'center', padding:'3rem 0', color:'var(--text-secondary)' }}>
          <Settings size={48} style={{ opacity:0.15, marginBottom:'1rem', display:'inline-block' }}/>
          <p>Henüz çizelge hesaplanmadı. "Dağılımı Oluştur" butonuna tıklayın.</p>
        </div>
      )}

      {/* ── Ana Tablo ── */}
      {hasShifts && (
        <>
          <div
            ref={scrollRef}
            className="calendar-scroll"
            style={{
              width: '100%',
              overflowX: 'auto',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain',
              borderRadius: 'var(--radius-md)',
              border: '1px solid rgba(255,255,255,0.07)',
              maxHeight: '70vh',
            }}
          >
            <table style={{ borderCollapse:'collapse', tableLayout:'fixed', minWidth: 150 + numDays * 40 + TOPLAM_W + DEVREDEN_W }}>

              {/* ── THEAD ── */}
              <thead>
                <tr>
                  <th style={{ ...thBase, ...stickyLeft, zIndex:12, width:150, minWidth:150, padding:'10px 14px', textAlign:'left', fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:500, top:0 }}>
                    Personel
                  </th>

                  {daysArray.map(day => {
                    const isHol     = checkIsHoliday(year, month, day, customHolidays);
                    const dow       = new Date(year, month - 1, day).getDay();
                    const isWeekend = dow === 0 || dow === 6;
                    const isToday   = day === todayCol;

                    return (
                      <th key={day} title={isHol ? isHol.name : undefined}
                        style={{
                          ...thBase,
                          width: 40, minWidth: 40,
                          padding: '8px 0 4px',
                          borderRight: (day % 7 === 0) ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.04)',
                          background: isToday
                            ? 'rgba(99,102,241,0.18)'
                            : isHol    ? 'rgba(252,211,77,0.07)'
                            : isWeekend ? 'rgba(255,255,255,0.03)'
                            : 'rgba(10,18,35,0.98)',
                        }}
                      >
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                          <span style={{
                            fontSize: '0.72rem',
                            color: isToday ? '#818cf8'
                              : isHol    ? '#fcd34d'
                              : isWeekend ? '#94a3b8'
                              : 'var(--text-secondary)',
                            fontWeight: isToday || isHol ? 700 : 500,
                          }}>
                            {TR_DAYS[dow]}
                          </span>
                          <span style={{
                            fontSize: '0.82rem',
                            fontWeight: isToday ? 800 : 600,
                            color: isToday ? '#a5b4fc'
                              : isHol    ? '#fbbf24'
                              : isWeekend ? '#64748b'
                              : 'var(--text-primary)',
                          }}>
                            {day}
                          </span>
                          {isHol && (
                            <div style={{ width:4, height:4, borderRadius:'50%', background:'#fbbf24', marginTop:1 }}/>
                          )}
                          {isToday && (
                            <div style={{ width:4, height:4, borderRadius:'50%', background:'#818cf8', marginTop:1 }}/>
                          )}
                        </div>
                      </th>
                    );
                  })}

                  <th style={{ ...thBase, ...stickyRight, zIndex:12, right: isMobile ? 'auto' : TOPLAM_W, minWidth:DEVREDEN_W, padding:'10px 6px', fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:500 }}>
                    Devreden
                  </th>
                  <th style={{ ...thBase, ...stickyRight, zIndex:12, right: isMobile ? 'auto' : 0, minWidth:TOPLAM_W, padding:'10px 6px', fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:500 }}>
                    Toplam / Hedef
                  </th>
                </tr>
              </thead>

              {/* ── TBODY ── */}
              <tbody>
                {employees.map((emp, rowIdx) => {
                  const empShifts   = shifts[emp.id] || {};
                  const totalHours  = actualHours ? (actualHours[emp.id] || 0) : 0;
                  const balance     = totalHours - targetMonthlyHours;
                  const onTarget    = totalHours >= targetMonthlyHours;
                  const accentColor = TYPE_ACCENT[emp.seniority] || 'rgba(255,255,255,0.2)';
                  const rowBg       = rowIdx % 2 === 0 ? 'rgba(255,255,255,0.012)' : 'transparent';

                  return (
                    <tr key={emp.id}
                      style={{ background: rowBg, transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.035)'}
                      onMouseLeave={e => e.currentTarget.style.background = rowBg}
                    >
                      {/* İsim hücresi */}
                      <td style={{ ...stickyLeft, padding:'0 14px', height:44, zIndex:4 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                          <div style={{ width:3, height:28, borderRadius:2, background: accentColor, flexShrink:0 }}/>
                          <div style={{ display:'flex', flexDirection:'column', gap:1, overflow:'hidden' }}>
                            <span style={{ fontSize:'0.85rem', fontWeight:600, color:'white', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:118 }}>
                              {emp.name}
                            </span>
                            <span style={{ fontSize:'0.62rem', color: accentColor, opacity:0.85, fontWeight:500 }}>
                              {emp.seniority.charAt(0).toUpperCase() + emp.seniority.slice(1)}
                              {emp.initialBalance !== 0 && (
                                <span style={{ marginLeft:4, color: emp.initialBalance > 0 ? '#34d399' : '#f87171' }}>
                                  ({emp.initialBalance > 0 ? '+' : ''}{emp.initialBalance}s)
                                </span>
                              )}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Vardiya hücreleri */}
                      {daysArray.map(day => {
                        const shiftVal  = empShifts[day];
                        const isHol     = checkIsHoliday(year, month, day, customHolidays);
                        const dow       = new Date(year, month - 1, day).getDay();
                        const isWeekend = dow === 0 || dow === 6;
                        const isToday   = day === todayCol;
                        const isActive  = popover && popover.empId === emp.id && popover.day === day;

                        return (
                          <td key={day}
                            onClick={(e) => handleCellClick(emp.id, day, e)}
                            style={{
                              ...cellStyle(shiftVal, isHol, isWeekend, isToday),
                              borderRight: (day % 7 === 0)
                                ? '1px solid rgba(255,255,255,0.09)'
                                : '1px solid rgba(255,255,255,0.04)',
                              outline: isActive ? '2px solid rgba(255,255,255,0.4)' : 'none',
                              outlineOffset: -2,
                            }}
                          >
                            {shiftVal === 'İzin' ? '-' : (shiftVal || '')}
                          </td>
                        );
                      })}

                      {/* Devreden */}
                      <td style={{ ...stickyRight, right: isMobile ? 'auto' : TOPLAM_W, minWidth:DEVREDEN_W, height:44, fontSize:'0.82rem', fontWeight:800,
                        color:   balance >= 0 ? '#34d399' : '#f87171',
                        background: balance >= 0 ? 'rgba(52,211,153,0.08)' : 'rgba(248,113,113,0.08)',
                      }}>
                        {balance > 0 ? `+${balance}` : balance}
                      </td>

                      {/* Toplam / Hedef */}
                      <td style={{ ...stickyRight, right: isMobile ? 'auto' : 0, minWidth:TOPLAM_W, height:44, fontSize:'0.8rem', fontWeight:700,
                        color: onTarget ? '#34d399' : '#fbbf24',
                        background: onTarget ? 'rgba(52,211,153,0.07)' : 'rgba(251,191,36,0.07)',
                      }}>
                        <span style={{ fontSize:'0.88rem' }}>{totalHours}</span>
                        <span style={{ opacity:0.45, fontWeight:400, fontSize:'0.75rem' }}> / {targetMonthlyHours}</span>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Legend ── */}
          <div style={{ display:'flex', flexWrap:'wrap', gap:'1.25rem', marginTop:'1.25rem', fontSize:'0.78rem', padding:'0 0.25rem', color:'var(--text-secondary)' }}>
            {[
              { color:'rgba(16,185,129,0.5)',  label: `${DAY}: Gündüz` },
              { color:'rgba(59,130,246,0.5)',  label: `${NIGHT}: Gece` },
              { color:'rgba(6,182,212,0.5)',   label: `${FIXED_DAY}: Tam Gün` },
              { color:'rgba(168,85,247,0.5)',  label: `${FIXED_HALF}: Yarım Gün` },
              { color:'rgba(239,68,68,0.5)',   label: 'İzin' },
              { color:'rgba(252,211,77,0.4)',  label: 'Resmi Tatil' },
            ].map(({ color, label }) => (
              <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.4rem' }}>
                <div style={{ width:10, height:10, borderRadius:2, background: color, flexShrink:0 }}/>
                <span>{label}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Popover portal ile body'e render edilir — backdrop-filter stacking context'inden kaçmak için */}
      {popover && ReactDOM.createPortal(
        <>
          <div
            style={{ position:'fixed', inset:0, zIndex:9998 }}
            onClick={() => setPopover(null)}
          />
          <div style={{
            position: 'fixed',
            left: popover.x,
            top: popover.y,
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'rgba(8,14,28,0.97)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            padding: '10px',
            display: 'flex',
            gap: '6px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
          }}>
            {popoverOptions.map(opt => (
              <button key={opt.label}
                onClick={() => applyShift(opt.label === 'Sil' ? '-' : opt.label)}
                style={{
                  background: opt.bg,
                  color: opt.color,
                  border: `1px solid ${opt.border ?? opt.color + '40'}`,
                  borderRadius: 7,
                  padding: '0 10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'filter 0.15s',
                  minWidth: 44,
                  minHeight: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  touchAction: 'manipulation',
                }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.25)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </Card>
  );
}

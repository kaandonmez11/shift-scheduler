import React from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { useStore } from '../../store/useStore';
import { generateSchedule } from '../../utils/scheduler';
import { checkIsHoliday } from '../../utils/holidays';
import { Settings, Play, Calendar as CalendarIcon, Target } from 'lucide-react';

export default function CalendarGrid() {
  const { workspaces, activeWorkspaceId, setSchedule, customHolidays = [] } = useStore();
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);

  if (!activeWorkspace) return null;

  const { employees, settings, shifts, actualHours } = activeWorkspace;
  const { year, month, shiftLabels = { day: 'D', night: 'N', fixedDay: 'A', fixedHalfDay: 'B' } } = settings;
  const { day: DAY, night: NIGHT, fixedDay: FIXED_DAY, fixedHalfDay: FIXED_HALF } = shiftLabels;

  // Ayın gün sayısını bulma
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const numDays = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: numDays }, (_, i) => i + 1);

  const handleRunAlgorithm = () => {
    if (employees.length === 0) {
      alert("Lütfen önce personel ekleyin.");
      return;
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    let startDay = 1;

    // Eğer seçili ay ve yıl içinde bulunduğumuz tarih ile eşleşiyorsa bugün ve sonrasını planla
    if (year === currentYear && month === currentMonth) {
      startDay = currentDay;
    }

    // Algoritmayı çalıştır ve dönen matrisi store'a yükle
    const result = generateSchedule(year, month, employees, settings, startDay, customHolidays);
    setSchedule(activeWorkspaceId, result.schedule, result.actualHours);
  };

  return (
    <Card className="animate-fade-in" style={{ marginTop: '2rem', padding: '1.5rem 1rem' }}>
      
      {/* Üst Kısım: Başlık ve Buton */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.3rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#fcd34d' }}>
          <CalendarIcon size={24} /> Vardiya Çizelgesi
        </h2>
        <Button 
          onClick={handleRunAlgorithm} 
          style={{ background: 'var(--accent-primary)', borderColor: 'transparent', color: 'white' }}
        >
          <Play size={16} fill="white" /> Dağılımı Oluştur (Çalıştır)
        </Button>
      </div>

      {employees.length === 0 && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '2rem 0' }}>Liste oluşturmak için önce "Personel" eklemelisiniz.</p>
      )}

      {employees.length > 0 && (!shifts || Object.keys(shifts).length === 0) && (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-secondary)' }}>
          <Settings size={48} style={{ opacity: 0.2, marginBottom: '1rem', display: 'inline-block' }} />
          <p>Henüz bir çizelge hesaplanmadı. Tabloyu görmek için "Dağılımı Oluştur" butonuna tıklayın.</p>
        </div>
      )}

      {/* Ana Takvim Matrisi */}
      {shifts && Object.keys(shifts).length > 0 && (
        <div style={{ 
          width: '100%', 
          overflowX: 'auto', 
          WebkitOverflowScrolling: 'touch',
          border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <table style={{ 
            width: '100%', 
            minWidth: 'max-content',
            borderCollapse: 'collapse', 
            textAlign: 'center', 
            color: 'var(--text-primary)'
          }}>
            <thead>
              <tr>
                {/* Sol Sabit(Sticky) Hücre */}
                <th style={{ 
                  position: 'sticky', left: 0, zIndex: 10, 
                  background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                  padding: '1rem', borderBottom: '1px solid var(--glass-border)', borderRight: '1px solid var(--glass-border)',
                  minWidth: '150px', textAlign: 'left', fontWeight: 'normal', color: 'var(--text-secondary)'
                }}>
                  Personel
                </th>
                
                {/* Gün Numaraları */}
                {daysArray.map(day => {
                  const isHol = checkIsHoliday(year, month, day, customHolidays);
                  return (
                    <th key={day} title={isHol ? isHol.name : `Gün ${day}`} style={{ 
                      padding: '0.75rem 0.5rem', 
                      minWidth: '40px',
                      borderBottom: '1px solid var(--glass-border)',
                      borderRight: '1px solid rgba(255,255,255,0.05)',
                      fontWeight: 'bold',
                      color: isHol ? '#fcd34d' : 'var(--text-primary)',
                      background: isHol ? 'rgba(252, 211, 77, 0.05)' : 'transparent'
                    }}>
                      {day}
                    </th>
                  );
                })}

                {/* Sağ Toplam Saat Sütunu */}
                <th style={{ 
                  padding: '1rem', borderBottom: '1px solid var(--glass-border)', borderLeft: '1px solid var(--glass-border)',
                  minWidth: '80px', fontWeight: 'normal', color: 'var(--text-secondary)'
                }}>
                  <Target size={14} style={{ display: 'inline', marginRight: '4px' }}/> Toplam
                </th>

                {/* Bakiye Sütunu */}
                <th style={{ 
                  padding: '1rem', borderBottom: '1px solid var(--glass-border)', borderLeft: '1px solid var(--glass-border)',
                  minWidth: '90px', fontWeight: 'bold', color: 'var(--text-secondary)'
                }}>
                  Bakiye (±)
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map(emp => {
                const empShifts = shifts[emp.id] || {};
                const collectedHours = actualHours ? actualHours[emp.id] : 0;
                
                return (
                  <tr key={emp.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: '0.2s', ':hover': { background: 'rgba(255,255,255,0.02)' } }}>
                    {/* Sabit İsim Hücresi */}
                    <td style={{ 
                      position: 'sticky', left: 0, zIndex: 5, 
                      background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)',
                      padding: '1rem', borderRight: '1px solid var(--glass-border)',
                      textAlign: 'left', fontWeight: '600'
                    }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <span>{emp.name}</span>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.65rem', opacity: 0.6, fontWeight: 'normal' }}>
                            {emp.seniority.charAt(0).toUpperCase() + emp.seniority.slice(1)}
                          </span>
                          {emp.initialBalance !== 0 && (
                            <span style={{ fontSize: '0.65rem', color: emp.initialBalance > 0 ? '#34d399' : '#f87171' }}>
                              ({emp.initialBalance > 0 ? '+' : ''}{emp.initialBalance}s)
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Gün Vardiyaları */}
                    {daysArray.map(day => {
                      const shiftVal = empShifts[day];
                      const isHol = checkIsHoliday(year, month, day, customHolidays);
                      
                      // Hücre Renk ve Stil Çözümlemesi
                      let cellStyle = {
                        padding: '0.5rem',
                        borderRight: '1px solid rgba(255,255,255,0.05)',
                        fontWeight: '500',
                        fontSize: '0.9rem'
                      };

                      if (shiftVal === NIGHT) {
                        cellStyle.background = 'rgba(59, 130, 246, 0.2)';
                        cellStyle.color = '#60a5fa';
                        cellStyle.boxShadow = 'inset 0 0 8px rgba(59, 130, 246, 0.1)';
                      } else if (shiftVal === DAY) {
                        cellStyle.background = 'rgba(16, 185, 129, 0.15)';
                        cellStyle.color = '#34d399';
                        cellStyle.boxShadow = 'inset 0 0 8px rgba(16, 185, 129, 0.1)';
                      } else if (shiftVal === FIXED_DAY) {
                        cellStyle.background = 'rgba(16, 185, 129, 0.15)';
                        cellStyle.color = '#34d399';
                        cellStyle.boxShadow = 'inset 0 0 8px rgba(16, 185, 129, 0.1)';
                      } else if (shiftVal === FIXED_HALF) {
                        cellStyle.background = 'rgba(168, 85, 247, 0.15)';
                        cellStyle.color = '#a78bfa';
                        cellStyle.boxShadow = 'inset 0 0 8px rgba(168, 85, 247, 0.1)';
                      } else if (shiftVal === 'İzin') {
                        cellStyle.background = 'rgba(239, 68, 68, 0.15)';
                        cellStyle.color = '#f87171';
                      } else {
                        cellStyle.color = 'rgba(255,255,255,0.2)';
                        if (isHol) cellStyle.background = 'rgba(252, 211, 77, 0.05)';
                      }

                      return (
                        <td key={day} style={cellStyle}>
                          {shiftVal === 'İzin' ? '-' : shiftVal}
                        </td>
                      );
                    })}

                    {/* Toplam Saat Sonucu */}
                    <td style={{ 
                      padding: '1rem', borderLeft: '1px solid var(--glass-border)',
                      fontWeight: 'bold', color: 'white', background: 'rgba(255, 255, 255, 0.05)'
                    }}>
                      {collectedHours}
                    </td>

                    {/* Bakiye Sonucu */}
                    {(() => {
                      const balance = collectedHours - settings.targetMonthlyHours;
                      return (
                        <td style={{ 
                          padding: '1rem', borderLeft: '1px solid var(--glass-border)',
                          fontWeight: '800', 
                          color: balance >= 0 ? '#34d399' : '#f87171',
                          background: balance >= 0 ? 'rgba(52, 211, 153, 0.1)' : 'rgba(248, 113, 113, 0.1)'
                        }}>
                          {balance > 0 ? `+${balance}` : balance}
                        </td>
                      );
                    })()}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Alt Açıklama / Legend */}
      {shifts && Object.keys(shifts).length > 0 && (
         <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginTop: '1.5rem', fontSize: '0.8rem', padding: '0 0.5rem', color: 'var(--text-secondary)' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(16, 185, 129, 0.4)' }} /> {DAY}: Gündüz Mesai
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(59, 130, 246, 0.4)' }} /> {NIGHT}: Gece Nöbet
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(16, 185, 129, 0.4)' }} /> {FIXED_DAY}: Tam Gün (Hamile/Sorumlu)
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(168, 85, 247, 0.4)' }} /> {FIXED_HALF}: Yarım Gün (Cumartesi)
           </div>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239, 68, 68, 0.4)' }} /> İzin
           </div>
         </div>
      )}

    </Card>
  );
}

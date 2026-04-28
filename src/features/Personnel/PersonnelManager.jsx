import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store/useStore';
import { checkIsHoliday } from '../../utils/holidays';
import { UserPlus, Trash2, CalendarDays, Plus, ChevronDown } from 'lucide-react';
import { useIsMobile } from '../../hooks/useIsMobile';

// Özel Kendi Dropdown (Select) Bileşenimiz
const CustomSeniorityDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const options = [
    { label: 'Yeni', value: 'yeni' },
    { label: 'Kıdemli', value: 'kidemli' },
    { label: 'Hamile', value: 'hamile' },
    { label: 'Sorumlu', value: 'sorumlu' },
  ];
  
  const current = options.find(o => o.value === value);

  // Kutu dışına tıklayınca kapanma mantığı
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Seçili değere göre renk belirleme
  const getColors = (val) => {
    if (val === 'yeni') return { text: '#34d399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)' };
    if (val === 'kidemli') return { text: '#c084fc', bg: 'rgba(167, 139, 250, 0.15)', border: 'rgba(167, 139, 250, 0.3)' };
    if (val === 'hamile') return { text: '#fb7185', bg: 'rgba(251, 113, 133, 0.15)', border: 'rgba(251, 113, 133, 0.3)' };
    if (val === 'sorumlu') return { text: '#fb923c', bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.3)' };
    return { text: 'white', bg: 'rgba(0,0,0,0.2)', border: 'var(--glass-border)' };
  };

  const colors = getColors(value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '42px' }}>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="glass-input"
        style={{
          width: '100%', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 1rem', background: colors.bg, border: `1px solid ${colors.border}`,
          borderRadius: 'var(--radius-md)', color: colors.text, cursor: 'pointer', outline: 'none',
          fontWeight: '600'
        }}
      >
        <span>{current?.label}</span>
        <ChevronDown size={16} style={{ 
          transform: open ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.2s',
          marginLeft: '1rem',
          marginRight: '0.2rem',
          color: colors.text,
          opacity: 0.8
        }} />
      </button>

      {open && (
        <div className="animate-fade-in" style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
          background: 'rgba(15, 23, 42, 0.98)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)', padding: '0.4rem', zIndex: 9999,
          backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: '0.2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', animationDuration: '0.1s',
          overflow: 'visible'
        }}>
          {options.map(opt => {
            const optColors = getColors(opt.value);
            return (
              <div 
                key={opt.value}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding: '0.6rem 1rem', borderRadius: '6px', cursor: 'pointer',
                  background: value === opt.value ? optColors.bg : 'transparent',
                  color: value === opt.value ? optColors.text : 'var(--text-primary)',
                  transition: '0.2s', fontSize: '0.9rem', fontWeight: value === opt.value ? '600' : 'normal'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.color = optColors.text;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = value === opt.value ? optColors.bg : 'transparent';
                  e.currentTarget.style.color = value === opt.value ? optColors.text : 'var(--text-primary)';
                }}
              >
                {opt.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default function PersonnelManager() {
  const { workspaces, activeWorkspaceId, addEmployee, removeEmployee, updateEmployeeOffDays, updateEmployeeRequestedShifts, updateEmployeeBalance, updateEmployeeData, customHolidays = [] } = useStore();
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);
  const isMobile = useIsMobile();

  const [newName, setNewName] = useState('');
  const [newSeniority, setNewSeniority] = useState('yeni');

  const [editingNameId, setEditingNameId] = useState(null);
  const [tempName, setTempName] = useState('');

  if (!activeWorkspace) return null;

  const { employees, settings } = activeWorkspace;
  const { year, month, shiftLabels = { day: 'D', night: 'N' } } = settings;

  const MONTH_NAMES = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

  // Gün tıklaması: boş → İzin → Gündüz → Gece → boş
  const cycleShift = (empId, day, currentShifts) => {
    const current = currentShifts?.[day];
    const next = current === undefined ? 'İzin'
      : current === 'İzin' ? shiftLabels.day
      : current === shiftLabels.day ? shiftLabels.night
      : undefined;

    const updated = { ...(currentShifts || {}) };
    if (next === undefined) delete updated[day];
    else updated[day] = next;

    updateEmployeeRequestedShifts(activeWorkspaceId, empId, updated);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    addEmployee(activeWorkspaceId, { name: newName.trim(), seniority: newSeniority });
    setNewName('');
    setNewSeniority('yeni');
  };

  // Takvim Mantığı (Day Picker)
  const getDaysInMonth = (y, m) => new Date(y, m, 0).getDate();
  const numDays = getDaysInMonth(year, month);
  const daysArray = Array.from({ length: numDays }, (_, i) => i + 1);
  
  // Ayın 1'inci gününün haftanın hangi gününe denk geldiğini hesaplayalım
  // js Date: 0=Pazar, 1=Pazartesi ... 6=Cumartesi
  // Biz Türk takvimi gibi (0=Pazartesi, 6=Pazar) arzu ediyoruz:
  const jsFirstDay = new Date(year, month - 1, 1).getDay();
  const startDayOffset = jsFirstDay === 0 ? 6 : jsFirstDay - 1;

  const toggleOffDay = (empId, day, currentOffDays) => {
    const isSelected = currentOffDays.includes(day);
    const newOffDays = isSelected 
      ? currentOffDays.filter(d => d !== day) 
      : [...currentOffDays, day].sort((a,b) => a - b);
      
    updateEmployeeOffDays(activeWorkspaceId, empId, newOffDays);
  };

  return (
    <Card className="animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
          <UserPlus size={24} /> Personel ve İzin Yönetimi
        </h2>
      </div>

      {/* Personel Ekleme Formu */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '2 1 180px', minWidth: 0 }}>
          <Input
            id="empName"
            label="Personel Adı Soyadı"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); }}
          />
        </div>
        <div style={{ flex: '1 1 130px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Personel Tipi</label>
          <CustomSeniorityDropdown value={newSeniority} onChange={setNewSeniority} />
        </div>
        <Button onClick={handleAdd} style={{ background: 'var(--accent-primary)', borderColor: 'transparent', color: '#fff', minHeight: 44, minWidth: 80, flexShrink: 0 }}>
          <Plus size={16} /> Ekle
        </Button>
      </div>

      {/* Personel Listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {employees.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Henüz personel eklenmedi.</p>
        ) : (
          employees.map(emp => (
            <div key={emp.id} style={{ 
              background: 'rgba(255,255,255,0.02)', 
              border: '1px solid var(--glass-border)', 
              borderRadius: 'var(--radius-md)', 
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              transition: 'all 0.3s'
            }}>

              {/* Üst Kısım: Kıdem Bilgisi (Sol) ve Sil Butonu (Sağ) */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
                <div style={{ width: '140px' }}>
                  <CustomSeniorityDropdown 
                    value={emp.seniority} 
                    onChange={(val) => updateEmployeeData(activeWorkspaceId, emp.id, { seniority: val })} 
                  />
                </div>
                
                <button 
                  onClick={() => removeEmployee(activeWorkspaceId, emp.id)}
                  style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', 
                    color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', 
                    display: 'flex', transition: '0.2s' 
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; }}
                  title="Personeli Sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              {/* Alt Kısım: İsim ve Takvim */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', minWidth: 0 }}>

                {/* Personel İsmi ve Bakiye Girişi */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: '0 0 auto', width: 190, gap: '0.75rem', minWidth: 0 }}>
                  <div style={{ minHeight: '1.5rem', display: 'flex', alignItems: 'center' }}>
                  {editingNameId === emp.id ? (
                    <input 
                      autoFocus
                      className="glass-input"
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      onBlur={() => {
                        if (tempName.trim()) {
                          updateEmployeeData(activeWorkspaceId, emp.id, { name: tempName.trim() });
                        }
                        setEditingNameId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (tempName.trim()) {
                            updateEmployeeData(activeWorkspaceId, emp.id, { name: tempName.trim() });
                          }
                          setEditingNameId(null);
                        }
                        if (e.key === 'Escape') setEditingNameId(null);
                      }}
                      style={{
                        fontSize: '1.25rem', fontWeight: 'bold', border: 'none', 
                        background: 'rgba(255,255,255,0.1)', color: 'white', padding: '0px 6px', borderRadius: '4px',
                        outline: 'none', width: '100%', height: '1.5rem'
                      }}
                    />
                  ) : (
                    <h3 
                      onClick={() => {
                        setEditingNameId(emp.id);
                        setTempName(emp.name);
                      }}
                      style={{ 
                        fontSize: '1.25rem', margin: '0', fontWeight: 'bold', color: 'white', 
                        cursor: 'text', borderBottom: '1px dashed transparent', transition: '0.2s',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.borderBottom = '1px dashed rgba(255,255,255,0.4)'}
                      onMouseLeave={(e) => e.currentTarget.style.borderBottom = '1px dashed transparent'}
                    >
                      {emp.name}
                    </h3>
                  )}
                  </div>

                  <div style={{ width: 120 }}>
                    <Input
                      id={`balance-${emp.id}`}
                      label="Devreden Saat (±)"
                      type="number"
                      value={emp.initialBalance}
                      onChange={e => updateEmployeeBalance(activeWorkspaceId, emp.id, Number(e.target.value))}
                    />
                  </div>
                </div>

              {/* Day Picker — flex-basis ile doğal wrap, overflow yok */}
              <div style={{
                flex: '1 1 240px',
                minWidth: 0,
                overflow: 'hidden',
                borderLeft: '1px solid rgba(255,255,255,0.05)',
                paddingLeft: '1rem',
              }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <CalendarDays size={14} /> İstek Seçici — {MONTH_NAMES[month - 1]} {year}
                </p>

                {/* repeat(7, minmax(0,1fr)) — her zaman 7 eşit sütun, container genişliğine uyar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                  gap: '0.25rem',
                }}>
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.62rem', color: 'var(--text-muted)', paddingBottom: '0.15rem', fontWeight: 'bold' }}>
                      {d}
                    </div>
                  ))}

                  {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
                  ))}

                  {daysArray.map(day => {
                    const reqShift = (emp.requestedShifts || {})[day];
                    const holiday  = checkIsHoliday(year, month, day, customHolidays);
                    const isIzin   = reqShift === 'İzin';
                    const isDay    = reqShift === shiftLabels.day;
                    const isNight  = reqShift === shiftLabels.night;

                    let bg, color, border, shadow;
                    if (isIzin) {
                      bg = 'rgba(244,63,94,0.25)'; color = '#fb7185';
                      border = 'rgba(244,63,94,0.6)'; shadow = '0 0 8px rgba(244,63,94,0.4)';
                    } else if (isDay) {
                      bg = 'rgba(16,185,129,0.2)'; color = '#34d399';
                      border = 'rgba(16,185,129,0.6)'; shadow = '0 0 8px rgba(16,185,129,0.3)';
                    } else if (isNight) {
                      bg = 'rgba(59,130,246,0.2)'; color = '#60a5fa';
                      border = 'rgba(59,130,246,0.6)'; shadow = '0 0 8px rgba(59,130,246,0.3)';
                    } else if (holiday) {
                      bg = 'rgba(251,191,36,0.15)'; color = '#fbbf24';
                      border = 'rgba(251,191,36,0.6)'; shadow = 'inset 0 0 6px rgba(251,191,36,0.2)';
                    } else {
                      bg = 'rgba(255,255,255,0.04)'; color = 'var(--text-primary)';
                      border = 'rgba(255,255,255,0.08)'; shadow = 'none';
                    }

                    return (
                      <button
                        key={day}
                        onClick={() => cycleShift(emp.id, day, emp.requestedShifts)}
                        title={holiday ? holiday.name : undefined}
                        style={{
                          aspectRatio: '1',
                          width: '100%',
                          borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.72rem',
                          fontWeight: reqShift ? 'bold' : 'normal',
                          cursor: 'pointer', transition: 'background 0.15s', padding: 0,
                          background: bg, color, border: `1px solid ${border}`, boxShadow: shadow,
                          touchAction: 'manipulation',
                          minHeight: 32,
                        }}
                        onMouseEnter={e => { if (!reqShift) e.currentTarget.style.backgroundColor = holiday ? 'rgba(251,191,36,0.25)' : 'rgba(255,255,255,0.1)'; }}
                        onMouseLeave={e => { if (!reqShift) e.currentTarget.style.backgroundColor = bg; }}
                      >
                        {reqShift || day}
                      </button>
                    );
                  })}

                </div>
              </div>

              </div> {/* Alt Kısım Bitişi */}
            </div>
          ))
        )}
      </div>

    </Card>
  );
}

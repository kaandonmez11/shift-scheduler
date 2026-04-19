import React, { useState, useEffect, useRef } from 'react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useStore } from '../../store/useStore';
import { checkIsHoliday } from '../../utils/holidays';
import { UserPlus, Trash2, CalendarDays, Plus, ChevronDown } from 'lucide-react';

// Özel Kendi Dropdown (Select) Bileşenimiz
const CustomSeniorityDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const options = [
    { label: 'Yeni', value: 'yeni' },
    { label: 'Deneyimli', value: 'deneyimli' },
    { label: 'Kıdemli', value: 'kidemli' }
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

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '42px' }}>
      <button 
        type="button"
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        className="glass-input"
        style={{
          width: '100%', height: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer', outline: 'none'
        }}
      >
        <span>{current?.label}</span>
        <ChevronDown size={16} style={{ 
          transform: open ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.2s',
          marginLeft: '1rem',
          marginRight: '0.2rem',
          color: 'var(--text-secondary)'
        }} />
      </button>

      {open && (
        <div className="animate-fade-in" style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
          background: 'rgba(15, 23, 42, 0.95)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)', padding: '0.4rem', zIndex: 50,
          backdropFilter: 'blur(12px)', display: 'flex', flexDirection: 'column', gap: '0.2rem',
          boxShadow: 'var(--shadow-md)', animationDuration: '0.15s' // Dropdown hızlı açılsın
        }}>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer',
                background: value === opt.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: value === opt.value ? '#60a5fa' : 'var(--text-primary)',
                transition: '0.2s', fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = value === opt.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export default function PersonnelManager() {
  const { workspaces, activeWorkspaceId, addEmployee, removeEmployee, updateEmployeeOffDays } = useStore();
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);
  
  const [newName, setNewName] = useState('');
  const [newSeniority, setNewSeniority] = useState('yeni');

  if (!activeWorkspace) return null;

  const { employees, settings } = activeWorkspace;
  const { year, month } = settings;

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
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px' }}>
          <Input 
            id="empName"
            label="Personel Adı Soyadı"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAdd();
            }}
          />
        </div>
        <div style={{ flex: '1 1 150px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Kıdem Seviyesi</label>
          <CustomSeniorityDropdown value={newSeniority} onChange={setNewSeniority} />
        </div>
        <Button onClick={handleAdd} style={{ background: 'var(--accent-primary)', borderColor: 'transparent', color: '#fff', height: '42px', minWidth: '100px' }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ 
                  fontSize: '0.75rem', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontWeight: '500',
                  background: emp.seniority === 'yeni' ? 'rgba(52, 211, 153, 0.2)' : emp.seniority === 'deneyimli' ? 'rgba(96, 165, 250, 0.2)' : 'rgba(167, 139, 250, 0.2)',
                  color: emp.seniority === 'yeni' ? '#34d399' : emp.seniority === 'deneyimli' ? '#60a5fa' : '#c084fc',
                  border: `1px solid ${emp.seniority === 'yeni' ? 'rgba(52, 211, 153, 0.3)' : emp.seniority === 'deneyimli' ? 'rgba(96, 165, 250, 0.3)' : 'rgba(167, 139, 250, 0.3)'}`
                }}>
                  {emp.seniority.charAt(0).toUpperCase() + emp.seniority.slice(1)}
                </span>
                
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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginTop: '0.5rem' }}>
                
                {/* Personel İsmi */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: '150px' }}>
                  <h3 style={{ fontSize: '1.25rem', margin: '0', fontWeight: 'bold', color: 'white' }}>{emp.name}</h3>
                </div>

              {/* Day Picker (Takvim Seçici Grid Mimarisi) */}
              <div style={{ flex: 1, minWidth: '320px', borderLeft: '1px solid rgba(255,255,255,0.05)', paddingLeft: '1.5rem' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <CalendarDays size={14} /> İstirahat / İzin Seçici ({year} / {month})
                </p>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: '0.3rem', width: 'max-content' }}>
                  
                  {/* Haftanın Günleri Başlığı */}
                  {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                    <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.2rem', fontWeight: 'bold' }}>
                      {d}
                    </div>
                  ))}
                  
                  {/* Ay öncesi boşluk hücreleri (Padding offset) */}
                  {Array.from({ length: startDayOffset }).map((_, i) => (
                    <div key={`empty-${i}`} style={{ width: '36px', height: '36px' }} />
                  ))}

                  {/* Gerçek ay günleri (1 -> DayCount) */}
                  {daysArray.map(day => {
                    const isOff = emp.requestedOffDays.includes(day);
                    const holiday = checkIsHoliday(year, month, day);
                    
                    return (
                      <button
                        key={day}
                        onClick={() => toggleOffDay(emp.id, day, emp.requestedOffDays)}
                        title={holiday ? `${holiday.name} (İzin için tıklayın)` : `${day}. Gün (İzin olarak işaretle)`}
                        style={{
                          width: '36px', height: '36px', borderRadius: '6px',
                          display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: isOff ? 'bold' : 'normal',
                          cursor: 'pointer', transition: 'all 0.2s', padding: 0,
                          
                          // Özelleştirilmiş Takvim Stil Katmanı
                          background: isOff ? 'rgba(244, 63, 94, 0.25)' : holiday ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.04)',
                          color: isOff ? '#fb7185' : holiday ? '#fbbf24' : 'var(--text-primary)',
                          border: `1px solid ${
                            isOff ? 'rgba(244, 63, 94, 0.6)' : 
                            holiday ? 'rgba(251, 191, 36, 0.6)' : 'rgba(255,255,255,0.08)'
                          }`,
                          boxShadow: isOff ? '0 0 8px rgba(244, 63, 94, 0.4)' : holiday ? 'inset 0 0 6px rgba(251, 191, 36, 0.2)' : 'none'
                        }}
                        onMouseEnter={(e) => {
                          if (!isOff) e.currentTarget.style.backgroundColor = holiday ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255,255,255,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isOff) e.currentTarget.style.backgroundColor = holiday ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.04)';
                        }}
                      >
                        {day}
                      </button>
                    )
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

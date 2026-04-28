import React, { useState, useEffect, useRef } from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Input from './components/Input';
import { Settings2, Trash2, ChevronDown } from 'lucide-react';
import { useStore } from './store/useStore';
import WorkspaceTabs from './features/Workspace/WorkspaceTabs';
import PersonnelManager from './features/Personnel/PersonnelManager';
import CalendarGrid from './features/Calendar/CalendarGrid';

// Özel Ay Seçimi Dropdown Bileşeni
const CustomMonthDropdown = ({ year, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];

  const options = monthNames.map((name, index) => ({
    label: name,
    value: index + 1,
    disabled: year <= currentYear && (index + 1) < currentMonth
  }));
  
  const current = options.find(o => o.value === value);

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
      <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: 'block' }}>Senaryo Ayı</label>
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
        <span>{current?.label || 'Seçiniz'}</span>
        <ChevronDown size={16} style={{ 
          transform: open ? 'rotate(180deg)' : 'none', 
          transition: 'transform 0.2s',
          marginLeft: '1rem',
          color: 'var(--text-secondary)'
        }} />
      </button>

      {open && (
        <div className="animate-fade-in" style={{
          position: 'absolute', top: 'calc(100% + 0.5rem)', left: 0, right: 0,
          background: 'rgba(15, 23, 42, 0.98)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-md)', padding: '0.4rem', zIndex: 100,
          backdropFilter: 'blur(20px)', display: 'flex', flexDirection: 'column', gap: '0.2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)', maxHeight: '250px', overflowY: 'auto'
        }}>
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => {
                if (!opt.disabled) {
                  onChange(opt.value);
                  setOpen(false);
                }
              }}
              style={{
                padding: '0.6rem 1rem', borderRadius: '6px', cursor: opt.disabled ? 'not-allowed' : 'pointer',
                background: value === opt.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: opt.disabled ? 'var(--text-muted)' : (value === opt.value ? '#60a5fa' : 'var(--text-primary)'),
                opacity: opt.disabled ? 0.4 : 1,
                transition: '0.2s', fontSize: '0.9rem'
              }}
              onMouseEnter={(e) => { if(!opt.disabled) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)' }}
              onMouseLeave={(e) => { if(!opt.disabled) e.currentTarget.style.backgroundColor = value === opt.value ? 'rgba(59, 130, 246, 0.2)' : 'transparent' }}
            >
              {opt.label}
              {opt.disabled && <span style={{ fontSize: '0.7rem', marginLeft: '0.5rem' }}>(Geçmiş)</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  const { 
    workspaces, 
    activeWorkspaceId, 
    addWorkspace, 
    setActiveWorkspace, 
    deleteWorkspace, 
    updateActiveWorkspaceSettings 
  } = useStore();

  // Aktif olan nesneyi state dizisinin içinden bul
  const activeWorkspace = workspaces.find(ws => ws.id === activeWorkspaceId);

  return (
    <>
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'clamp(0.75rem, 4vw, 2rem)',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        maxWidth: '800px',
        width: '100%',
      }}>

        <h1 style={{
          textAlign: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          color: 'var(--text-primary)',
          fontWeight: '800',
          fontSize: 'clamp(1.25rem, 5vw, 2rem)',
        }}>
          <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="KD Logo" style={{ width: 'clamp(28px, 5vw, 36px)', height: 'clamp(28px, 5vw, 36px)' }} />
          KD Vardiya Planlayıcı
        </h1>

      
        {/* Workspace (Senaryo) Sekmeleri ve Actions */}
        <WorkspaceTabs />

        {/* Aktif Workspace Ayarları */}
        {activeWorkspace && (
          <Card key={activeWorkspace.id} className="animate-fade-in">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '1.5rem', 
              borderBottom: '1px solid var(--glass-border)', 
              paddingBottom: '1rem',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc', margin: 0 }}>
                  <Settings2 size={24} /> {activeWorkspace.title} Ayarları
                </h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  Takvim Dönemi: {activeWorkspace.settings.year} / {activeWorkspace.settings.month}
                </span>
              </div>
              <Button onClick={() => deleteWorkspace(activeWorkspace.id)} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' }}>
                <Trash2 size={18} /> Senaryoyu Sil
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
              <Input 
                id="yearSelect" 
                label="Senaryo Yılı" 
                type="number"
                min={new Date().getFullYear()}
                value={activeWorkspace.settings.year}
                onChange={(e) => updateActiveWorkspaceSettings({ year: Number(e.target.value) })}
              />
              <div style={{ position: 'relative' }}>
                <CustomMonthDropdown 
                  year={activeWorkspace.settings.year}
                  value={activeWorkspace.settings.month}
                  onChange={(val) => updateActiveWorkspaceSettings({ month: val })}
                />
              </div>
              <Input 
                id="dayShift" 
                label="Gündüz Mesaisi Süresi (Saat)" 
                type="number"
                value={activeWorkspace.settings.dayShiftHours}
                onChange={(e) => updateActiveWorkspaceSettings({ dayShiftHours: Number(e.target.value) })}
              />
              <Input 
                id="nightShift" 
                label="Gece Nöbeti Süresi (Saat)" 
                type="number"
                value={activeWorkspace.settings.nightShiftHours}
                onChange={(e) => updateActiveWorkspaceSettings({ nightShiftHours: Number(e.target.value) })}
              />

              <Input 
                id="dailyDayTarget" 
                label="Gündüzcü Kadrosu (Kişi/Günde)" 
                type="number"
                value={activeWorkspace.settings.dailyDayTarget}
                onChange={(e) => updateActiveWorkspaceSettings({ dailyDayTarget: Number(e.target.value) })}
              />
              <Input 
                id="dailyNightTarget" 
                label="Gece Nöbetçi Kadrosu (Kişi/Günde)" 
                type="number"
                value={activeWorkspace.settings.dailyNightTarget}
                onChange={(e) => updateActiveWorkspaceSettings({ dailyNightTarget: Number(e.target.value) })}
              />

              <div style={{ gridColumn: '1 / -1' }}>
                <Input
                  id="targetHours"
                  label="Personel Aylık Hedef Mesai (Saat)"
                  type="number"
                  value={activeWorkspace.settings.targetMonthlyHours}
                  onChange={(e) => updateActiveWorkspaceSettings({ targetMonthlyHours: Number(e.target.value) })}
                />
              </div>

              {/* Vardiya Harf Etiketleri */}
              <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Vardiya Harf Etiketleri</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                  <Input
                    id="labelDay"
                    label="Gündüz Harfi"
                    value={activeWorkspace.settings.shiftLabels?.day ?? 'D'}
                    onChange={(e) => updateActiveWorkspaceSettings({ shiftLabels: { ...activeWorkspace.settings.shiftLabels, day: e.target.value || 'D' } })}
                  />
                  <Input
                    id="labelNight"
                    label="Gece Harfi"
                    value={activeWorkspace.settings.shiftLabels?.night ?? 'N'}
                    onChange={(e) => updateActiveWorkspaceSettings({ shiftLabels: { ...activeWorkspace.settings.shiftLabels, night: e.target.value || 'N' } })}
                  />
                  <Input
                    id="labelFixedDay"
                    label="Tam Gün Harfi"
                    value={activeWorkspace.settings.shiftLabels?.fixedDay ?? 'A'}
                    onChange={(e) => updateActiveWorkspaceSettings({ shiftLabels: { ...activeWorkspace.settings.shiftLabels, fixedDay: e.target.value || 'A' } })}
                  />
                  <Input
                    id="labelFixedHalf"
                    label="Yarım Gün Harfi"
                    value={activeWorkspace.settings.shiftLabels?.fixedHalfDay ?? 'B'}
                    onChange={(e) => updateActiveWorkspaceSettings({ shiftLabels: { ...activeWorkspace.settings.shiftLabels, fixedHalfDay: e.target.value || 'B' } })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem' }}>
                  <Input
                    id="aShiftHours"
                    label="Tam Gün Süresi (sa)"
                    type="number"
                    value={activeWorkspace.settings.aShiftHours ?? 8}
                    onChange={(e) => updateActiveWorkspaceSettings({ aShiftHours: Number(e.target.value) })}
                  />
                  <Input
                    id="bShiftHours"
                    label="Yarım Gün Süresi (sa)"
                    type="number"
                    value={activeWorkspace.settings.bShiftHours ?? 5}
                    onChange={(e) => updateActiveWorkspaceSettings({ bShiftHours: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Çoklu Personel ve İzin Paneli */}
        {activeWorkspace && <PersonnelManager key={activeWorkspace.id + '_personnel'} />}

        {/* Ana Vardiya Tablosu (Matrix) */}
        {activeWorkspace && <CalendarGrid key={activeWorkspace.id + '_calendar'} />}

      </div>
    </div>

    {/* Footer */}
    <div style={{
      position: 'fixed', bottom: '1rem', right: '1rem',
      fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)',
      pointerEvents: 'none', userSelect: 'none',
      zIndex: 50,
    }}>
      Designed &amp; Developed By{' '}
      <a
        href="https://www.linkedin.com/in/akaandonmez/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          color: 'rgba(255,255,255,0.4)',
          textDecoration: 'underline',
          pointerEvents: 'auto',
          cursor: 'pointer',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
        onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
      >
        Kaan Donmez
      </a>{' '}
      — 2026
    </div>
    </>
  );
}

export default App;

import React, { useState } from 'react';
import { useStore } from '../../store/useStore';
import { X, Plus, Trash2, CalendarDays } from 'lucide-react';

export default function HolidaySettings({ onClose }) {
  const { customHolidays, addCustomHoliday, removeCustomHoliday } = useStore();
  const [newDate, setNewDate] = useState('');
  const [newName, setNewName] = useState('');

  const canAdd = !!newDate && !!newName.trim() && !customHolidays.some(h => h.date === newDate);

  const handleAdd = () => {
    if (!canAdd) return;
    addCustomHoliday({ date: newDate, name: newName.trim() });
    setNewDate('');
    setNewName('');
  };

  const grouped = customHolidays.reduce((acc, h) => {
    const y = h.date.slice(0, 4);
    if (!acc[y]) acc[y] = [];
    acc[y].push(h);
    return acc;
  }, {});
  const sortedYears = Object.keys(grouped).sort();

  const formatDate = (dateStr) => {
    const [y, m, d] = dateStr.split('-');
    return `${d}.${m}.${y}`;
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'rgba(15,23,42,0.98)', border: '1px solid var(--glass-border)',
          borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
          width: '100%', maxWidth: '580px', maxHeight: '85vh',
          display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}
      >
        {/* Başlık */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0
        }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600', color: '#fcd34d', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarDays size={20} /> Dini Tatil Takvimi
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem', borderRadius: '8px', display: 'flex', transition: '0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Ekleme Formu */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>Yeni Tatil Ekle</p>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tarih</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                style={{
                  height: '40px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                  color: 'white', outline: 'none', fontSize: '0.9rem', cursor: 'pointer',
                  colorScheme: 'dark',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1, minWidth: '150px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tatil Adı</label>
              <input
                type="text"
                value={newName}
                placeholder="ör: Ramazan Bayramı 1. Gün"
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                style={{
                  height: '40px', padding: '0 0.75rem', borderRadius: 'var(--radius-md)',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                  color: 'white', outline: 'none', fontSize: '0.9rem',
                }}
              />
            </div>

            <button
              onClick={handleAdd}
              disabled={!canAdd}
              style={{
                height: '40px', padding: '0 1rem', borderRadius: 'var(--radius-md)',
                background: canAdd ? 'var(--accent-primary)' : 'rgba(255,255,255,0.05)',
                border: 'none', color: canAdd ? 'white' : 'var(--text-muted)',
                cursor: canAdd ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.9rem', fontWeight: '600', transition: '0.2s', whiteSpace: 'nowrap'
              }}
            >
              <Plus size={16} /> Ekle
            </button>
          </div>
        </div>

        {/* Tatil Listesi */}
        <div style={{ overflowY: 'auto', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {sortedYears.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>Henüz tatil eklenmedi.</p>
          )}
          {sortedYears.map(yr => (
            <div key={yr}>
              <p style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fcd34d', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>
                {yr}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {grouped[yr].map(h => (
                  <div key={h.date} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0.75rem', borderRadius: '8px',
                    background: 'rgba(252,211,77,0.05)', border: '1px solid rgba(252,211,77,0.1)'
                  }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontFamily: 'monospace', fontWeight: '600' }}>
                        {formatDate(h.date)}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)' }}>{h.name}</span>
                    </div>
                    <button
                      onClick={() => removeCustomHoliday(h.date)}
                      style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', cursor: 'pointer', padding: '0.3rem', borderRadius: '6px', display: 'flex', transition: '0.2s', flexShrink: 0 }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.25)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
                      title="Sil"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

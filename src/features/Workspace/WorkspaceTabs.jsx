import React, { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { DownloadCloud, UploadCloud, Plus, Copy, Trash2, Edit2, Check, Settings } from 'lucide-react';
import HolidaySettings from '../Settings/HolidaySettings';

// Yatay kaydırılabilir şerit içindeki tek aksiyon çipi
const ActionChip = ({ icon, label, onClick, accent, success, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
      height: 44, padding: '0 1.1rem',
      border: `1px solid ${accent ? 'transparent' : success ? 'rgba(52,211,153,0.45)' : 'rgba(255,255,255,0.1)'}`,
      borderRadius: 999,
      background: accent
        ? 'var(--accent-primary)'
        : success
          ? 'rgba(52,211,153,0.15)'
          : 'rgba(255,255,255,0.05)',
      color: accent ? '#fff' : success ? '#34d399' : 'var(--text-secondary)',
      fontSize: '0.85rem', fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.55 : 1,
      whiteSpace: 'nowrap', flexShrink: 0,
      transition: 'background 0.2s, color 0.2s, border-color 0.2s',
      outline: 'none',
      touchAction: 'manipulation',
    }}
    onMouseEnter={e => { if (!disabled && !accent) { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; } }}
    onMouseLeave={e => { if (!disabled && !accent) { e.currentTarget.style.background = success ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = success ? '#34d399' : 'var(--text-secondary)'; } }}
  >
    {icon}
    {label}
  </button>
);

export default function WorkspaceTabs() {
  const {
    workspaces, activeWorkspaceId,
    setActiveWorkspace, addWorkspace, cloneWorkspace,
    deleteWorkspace, renameWorkspace, importState,
  } = useStore();

  const fileInputRef = useRef(null);
  const [showHolidaySettings, setShowHolidaySettings] = useState(false);
  const [renamingId, setRenamingId]   = useState(null);
  const [renameText, setRenameText]   = useState('');
  const [btnStatus, setBtnStatus]     = useState({ type: null, state: 'idle' });

  const setFeedback = (type, err = false) => {
    setBtnStatus({ type, state: err ? 'error' : 'success' });
    setTimeout(() => setBtnStatus({ type: null, state: 'idle' }), 3000);
  };

  const handleExport = () => {
    if (workspaces.length === 0) { setFeedback('export', true); return; }
    try {
      const blob = new Blob([JSON.stringify({ workspaces, activeWorkspaceId }, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = Object.assign(document.createElement('a'), { href: url, download: `Vardiya-${new Date().toISOString().slice(0,10)}.shift` });
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setFeedback('export');
    } catch { setFeedback('export', true); }
  };

  const handleImport = (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const json = JSON.parse(ev.target.result);
        if (Array.isArray(json?.workspaces)) { importState(json); setFeedback('import'); }
        else setFeedback('import', true);
      } catch { setFeedback('import', true); }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleRenameSubmit = (id) => {
    if (renameText.trim()) renameWorkspace(id, renameText.trim());
    setRenamingId(null);
  };

  const importOk  = btnStatus.type === 'import' && btnStatus.state === 'success';
  const exportOk  = btnStatus.type === 'export' && btnStatus.state === 'success';
  const importBusy = btnStatus.type === 'import' && btnStatus.state !== 'idle';
  const exportBusy = btnStatus.type === 'export' && btnStatus.state !== 'idle';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
      {showHolidaySettings && <HolidaySettings onClose={() => setShowHolidaySettings(false)} />}
      <input type="file" accept=".shift,.json" ref={fileInputRef} style={{ display: 'none' }} onChange={handleImport} />

      {/* ── Aksiyon Şeridi — yatay kaydırılabilir chip'ler ── */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '2px',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',        // Firefox
        msOverflowStyle: 'none',       // IE/Edge
      }}>
        <ActionChip
          icon={<Settings size={15} />}
          label="Tatil Ayarları"
          onClick={() => setShowHolidaySettings(true)}
        />
        <ActionChip
          icon={<UploadCloud size={15} />}
          label={importOk ? 'Yüklendi ✓' : 'Projeyi Yükle'}
          onClick={() => fileInputRef.current.click()}
          success={importOk}
          disabled={importBusy}
        />
        <ActionChip
          icon={<DownloadCloud size={15} />}
          label={exportOk ? 'İndirildi ✓' : 'Projeyi İndir'}
          onClick={handleExport}
          accent={!exportOk}
          success={exportOk}
          disabled={exportBusy}
        />
      </div>

      {/* ── Sekmeler ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        overflowX: 'auto', paddingBottom: '0.25rem',
        WebkitOverflowScrolling: 'touch',
      }}>
        {workspaces.map(ws => {
          const isActive   = ws.id === activeWorkspaceId;
          const isRenaming = renamingId === ws.id;
          return (
            <div
              key={ws.id}
              onClick={() => !isRenaming && setActiveWorkspace(ws.id)}
              style={{
                display: 'flex', alignItems: 'center',
                background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? 'rgba(255,255,255,0.15)' : 'transparent'}`,
                borderBottom: isActive ? '1px solid transparent' : '1px solid var(--glass-border)',
                borderRadius: '8px 8px 0 0',
                padding: '0 0.75rem', minHeight: 44,
                cursor: 'pointer', flexShrink: 0,
                color: isActive ? '#f8fafc' : 'var(--text-secondary)',
                transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {isRenaming ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    autoFocus value={renameText}
                    onChange={e => setRenameText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleRenameSubmit(ws.id)}
                    onBlur={() => handleRenameSubmit(ws.id)}
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-primary)', color: 'white', padding: '0.3rem 0.5rem', borderRadius: '4px', outline: 'none', width: 110, fontSize: '0.9rem' }}
                  />
                  <Check size={16} color="#6ee7b7" />
                </div>
              ) : (
                <span
                  onDoubleClick={e => { e.stopPropagation(); setRenamingId(ws.id); setRenameText(ws.title); }}
                  style={{ fontWeight: isActive ? 600 : 500, whiteSpace: 'nowrap', fontSize: '0.9rem' }}
                >
                  {ws.title}
                </span>
              )}

              {/* Sekme aksiyon ikonları */}
              <div style={{
                display: 'flex',
                overflow: 'hidden',
                maxWidth: (isActive && !isRenaming) ? 140 : 0,
                opacity: (isActive && !isRenaming) ? 1 : 0,
                marginLeft: (isActive && !isRenaming) ? '0.25rem' : 0,
                transition: 'max-width 0.3s cubic-bezier(0.16,1,0.3,1), opacity 0.3s, margin-left 0.3s',
              }}>
                {[
                  { fn: e => { e.stopPropagation(); setRenamingId(ws.id); setRenameText(ws.title); }, color: '#fbbf24', Icon: Edit2,  title: 'Adını Değiştir' },
                  { fn: e => { e.stopPropagation(); cloneWorkspace(ws.id); },                          color: '#60a5fa', Icon: Copy,   title: 'Klonla' },
                  { fn: e => { e.stopPropagation(); deleteWorkspace(ws.id); },                         color: '#ef4444', Icon: Trash2, title: 'Sil' },
                ].map(({ fn, color, Icon, title }) => (
                  <button key={title} onClick={fn} title={title}
                    style={{ background: 'none', border: 'none', color, cursor: 'pointer', padding: '0.4rem', minWidth: 36, minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, transition: '0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = `${color}22`}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <Icon size={14} />
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        <button
          onClick={() => addWorkspace()}
          title="Yeni Senaryo"
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '0.25rem', borderRadius: 999, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: '0.2s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

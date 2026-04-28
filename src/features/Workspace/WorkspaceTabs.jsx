import React, { useRef, useState } from 'react';
import { useStore } from '../../store/useStore';
import { DownloadCloud, UploadCloud, Plus, Copy, Trash2, Edit2, Check, Settings } from 'lucide-react';
import Button from '../../components/Button';
import HolidaySettings from '../Settings/HolidaySettings';

export default function WorkspaceTabs() {
  const { 
    workspaces, 
    activeWorkspaceId, 
    setActiveWorkspace, 
    addWorkspace, 
    cloneWorkspace,
    deleteWorkspace,
    renameWorkspace,
    importState 
  } = useStore();

  const fileInputRef = useRef(null);
  const [showHolidaySettings, setShowHolidaySettings] = useState(false);

  // Yeniden adlandırma state'leri
  const [renamingId, setRenamingId] = useState(null);
  const [renameText, setRenameText] = useState("");

  // Sadece Buton Status State'i (Toast kaldırıldı)
  // state: 'idle' | 'success' | 'error'
  const [btnStatus, setBtnStatus] = useState({ type: null, state: 'idle' });

  // Sadece butonun animasyon ve state değişimini yürütür
  const setButtonFeedback = (type, isError = false) => {
    setBtnStatus({ type, state: isError ? 'error' : 'success' });
    setTimeout(() => {
      setBtnStatus({ type: null, state: 'idle' });
    }, 3000); 
  };

  const handleExport = () => {
    if (workspaces.length === 0) {
      setButtonFeedback('export', true);
      return;
    }
    try {
      const dataToExport = { workspaces, activeWorkspaceId };
      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `Vardiya-Projesi-${new Date().toISOString().slice(0,10)}.shift`;
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setButtonFeedback('export', false);
    } catch (error) {
      console.error(error);
      setButtonFeedback('export', true);
    }
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (json.workspaces && Array.isArray(json.workspaces)) {
          importState(json);
          setButtonFeedback('import', false);
        } else {
          setButtonFeedback('import', true);
        }
      } catch (error) {
        setButtonFeedback('import', true);
      }
    };
    reader.readAsText(file);
    e.target.value = null; 
  };

  const handleRenameSubmit = (id) => {
    if (renameText.trim()) {
      renameWorkspace(id, renameText.trim());
    }
    setRenamingId(null);
  };

  // Butonlar için animasyonlu renk/şeffaflık değişimlerini hesaplama
  const isImportSuccess = btnStatus.type === 'import' && btnStatus.state === 'success';
  const isExportSuccess = btnStatus.type === 'export' && btnStatus.state === 'success';

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
      {showHolidaySettings && <HolidaySettings onClose={() => setShowHolidaySettings(false)} />}
      {/* Üst Bar: İçe/Dışa Aktar Butonları */}
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', alignItems: 'center', padding: '0.5rem 0' }}>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            onClick={() => setShowHolidaySettings(true)}
            title="Tatil Takvimi Ayarları"
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.4rem 0.6rem',
              borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center',
              transition: '0.2s', height: '36px'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(252,211,77,0.1)'; e.currentTarget.style.color = '#fcd34d'; e.currentTarget.style.borderColor = 'rgba(252,211,77,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            <Settings size={16} />
          </button>
          <input
            type="file" 
            accept=".shift,.json" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleImport} 
          />
          <Button 
            disabled={btnStatus.type === 'import' && btnStatus.state !== 'idle'}
            onClick={() => fileInputRef.current.click()} 
            style={{ 
              width: '160px', 
              padding: '0.4rem 1rem', 
              fontSize: '0.85rem',
              background: isImportSuccess ? 'rgba(16, 185, 129, 0.15)' : undefined,
              borderColor: isImportSuccess ? 'rgba(16, 185, 129, 0.4)' : undefined,
              color: isImportSuccess ? '#34d399' : undefined
            }}
          >
            <span key={btnStatus.state} className="animate-quick-fade">
              {isImportSuccess ? (
                <><Check size={16} /> Yüklendi!</>
              ) : (
                <><UploadCloud size={16} /> Projeyi Yükle</>
              )}
            </span>
          </Button>
          
          <Button 
            disabled={btnStatus.type === 'export' && btnStatus.state !== 'idle'}
            onClick={handleExport} 
            style={{ 
              width: '160px', 
              background: isExportSuccess ? 'rgba(16, 185, 129, 0.2)' : 'var(--accent-primary)', 
              borderColor: isExportSuccess ? 'rgba(16, 185, 129, 0.4)' : 'transparent', 
              color: isExportSuccess ? '#34d399' : 'white', 
              padding: '0.4rem 1rem', 
              fontSize: '0.85rem' 
            }}
          >
            <span key={btnStatus.state} className="animate-quick-fade">
              {isExportSuccess ? (
                <><Check size={16} /> İndirildi!</>
              ) : (
                <><DownloadCloud size={16} /> Projeyi İndir</>
              )}
            </span>
          </Button>
        </div>
      </div>

      {/* Tarayıcı Sekmeleri (Tabs) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {workspaces.map(ws => {
          const isActive = ws.id === activeWorkspaceId;
          const isRenaming = renamingId === ws.id;

          return (
            <div 
              key={ws.id} 
              style={{
                display: 'flex',
                alignItems: 'center',
                background: isActive ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                border: `1px solid ${isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent'}`,
                borderBottom: isActive ? '1px solid transparent' : '1px solid var(--glass-border)',
                borderRadius: '8px 8px 0 0',
                padding: '0.6rem 1.25rem',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                color: isActive ? '#f8fafc' : 'var(--text-secondary)'
              }}
              onClick={() => !isRenaming && setActiveWorkspace(ws.id)}
            >
              {isRenaming ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input 
                    autoFocus
                    value={renameText}
                    onChange={(e) => setRenameText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleRenameSubmit(ws.id)}
                    onBlur={() => handleRenameSubmit(ws.id)}
                    style={{
                      background: 'rgba(0,0,0,0.5)', border: '1px solid var(--accent-primary)',
                      color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', outline: 'none',
                      width: '120px', fontSize: '0.9rem'
                    }}
                  />
                  <Check size={16} color="#6ee7b7" />
                </div>
              ) : (
                <span 
                  onDoubleClick={(e) => { e.stopPropagation(); setRenamingId(ws.id); setRenameText(ws.title); }} 
                  style={{ fontWeight: isActive ? '600' : '500', whiteSpace: 'nowrap', fontSize: '0.9rem' }}
                >
                  {ws.title}
                </span>
              )}
              
              <div 
                style={{ 
                  display: 'flex', 
                  gap: '0.25rem',
                  overflow: 'hidden',
                  transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, margin-left 0.4s ease',
                  maxWidth: (isActive && !isRenaming) ? '120px' : '0px',
                  opacity: (isActive && !isRenaming) ? 1 : 0,
                  marginLeft: (isActive && !isRenaming) ? '0.5rem' : '0px'
                }}
              >
                <button 
                  onClick={(e) => { e.stopPropagation(); setRenamingId(ws.id); setRenameText(ws.title); }}
                  style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', padding: '0.25rem', display: 'flex', transition: '0.2s', borderRadius: '4px' }}
                  title="Adını Değiştir"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Edit2 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); cloneWorkspace(ws.id); }}
                  style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', padding: '0.25rem', display: 'flex', transition: '0.2s', borderRadius: '4px' }}
                  title="Klonla"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Copy size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteWorkspace(ws.id); }}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.25rem', display: 'flex', transition: '0.2s', borderRadius: '4px' }}
                  title="Sil"
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
        
        {/* Yeni Sekme Ekle Butonu */}
        <button 
          onClick={() => addWorkspace()}
          style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: 'none', padding: '0.5rem',
            color: 'var(--text-secondary)', cursor: 'pointer', marginLeft: '0.5rem',
            borderRadius: 'var(--radius-full)', transition: '0.2s'
          }}
          title="Sıfırdan Yeni Sekme"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

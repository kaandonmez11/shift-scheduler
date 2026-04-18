import React from 'react';
import Card from './components/Card';
import Button from './components/Button';
import Input from './components/Input';
import { Database, Settings2, Trash2 } from 'lucide-react';
import { useStore } from './store/useStore';
import WorkspaceTabs from './features/Workspace/WorkspaceTabs';

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
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '800px',
        width: '100%'
      }}>
      
        <h1 style={{ 
          textAlign: 'center', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '1rem', 
          color: 'var(--text-primary)', 
          fontWeight: '800', 
          fontSize: '2rem' 
        }}>
          <Database size={36} color="var(--accent-primary)" /> Zustand & LocalStorage
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
              paddingBottom: '1rem' 
            }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#c084fc' }}>
                <Settings2 size={24} /> {activeWorkspace.title} Ayarları
              </h2>
              <Button onClick={() => deleteWorkspace(activeWorkspace.id)} style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.1)' }}>
                <Trash2 size={18} /> Senaryoyu Sil
              </Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
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
              <div style={{ gridColumn: '1 / -1' }}>
                <Input 
                  id="targetHours" 
                  label="Personel Aylık Hedef Mesai (Saat)" 
                  type="number"
                  value={activeWorkspace.settings.targetMonthlyHours}
                  onChange={(e) => updateActiveWorkspaceSettings({ targetMonthlyHours: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
              <p style={{ color: '#34d399', fontSize: '0.95rem', textAlign: 'center', margin: 0 }}>
                💡 <strong>Kalıcılık Testi:</strong> Yukarıdaki verileri değiştirin, sekmeler arası geçiş yapın ve tarayıcıyı (F5) yenileyin. Zustand Persist sayesinde tüm verileriniz LocalStorage'dan kayıpsız bir şekilde yüklenecektir!
              </p>
            </div>
          </Card>
        )}

      </div>
    </div>
  );
}

export default App;

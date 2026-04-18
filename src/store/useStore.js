import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useStore = create(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,

      // --- EYLEMLER (ACTIONS) ---

      // Yeni bir workspace (senaryo/ay) ekle
      addWorkspace: (title) => set((state) => {
        const newWorkspace = {
          id: generateId(),
          title: title || `Yeni Senaryo ${state.workspaces.length + 1}`,
          settings: {
            dayShiftHours: 8,      // Gündüz mesaisi saati
            nightShiftHours: 12,   // Gece nöbeti saati
            targetMonthlyHours: 180, // Aylık hedeflenen toplam saat
          },
          employees: [],
          shifts: []
        };
        
        const updatedWorkspaces = [...state.workspaces, newWorkspace];
        
        // Eğer ilk eklenenworkspace ise otomatik aktif yap
        return {
          workspaces: updatedWorkspaces,
          activeWorkspaceId: state.activeWorkspaceId || newWorkspace.id
        };
      }),

      // Aktif workspace'i değiştir
      setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

      // Workspace sil
      deleteWorkspace: (id) => set((state) => {
        const remainingWorkspaces = state.workspaces.filter(ws => ws.id !== id);
        
        // Eğer silinen workspace aktif olan ise, gidenin yerine ilk sıradakini aktif yap
        return {
          workspaces: remainingWorkspaces,
          activeWorkspaceId: state.activeWorkspaceId === id 
            ? (remainingWorkspaces.length > 0 ? remainingWorkspaces[0].id : null) 
            : state.activeWorkspaceId
        };
      }),

      // Aktif workspace'in ayarlarını/verilerini güncelle
      updateActiveWorkspaceSettings: (newSettings) => set((state) => {
        if (!state.activeWorkspaceId) return state;
        
        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id === state.activeWorkspaceId) {
            return {
              ...ws,
              settings: { ...ws.settings, ...newSettings }
            };
          }
          return ws;
        });

        return { workspaces: updatedWorkspaces };
      }),

      // Workspace adını değiştir
      renameWorkspace: (id, newTitle) => set((state) => {
        const updated = state.workspaces.map(ws => 
          ws.id === id ? { ...ws, title: newTitle } : ws
        );
        return { workspaces: updated };
      }),

      // Workspace'i tüm bağlarıyla ve verileriyle (deep copy) klonlama
      cloneWorkspace: (id) => set((state) => {
        const workspaceToClone = state.workspaces.find(ws => ws.id === id);
        if (!workspaceToClone) return state;

        // Her şeyi eksiksiz kopyalayabilmek için deep copy (içindeki objeler/diziler)
        const clonedWorkspace = JSON.parse(JSON.stringify(workspaceToClone));
        clonedWorkspace.id = generateId(); // Yeni id
        clonedWorkspace.title = `${workspaceToClone.title} (Kopya)`;

        return {
          workspaces: [...state.workspaces, clonedWorkspace],
          activeWorkspaceId: clonedWorkspace.id // Yeni kopya sekmesini aktif yap
        };
      }),

      // Dışarıdan JSON dosyasındaki tam state'i mevcut state'in üstüne yazma
      importState: (importedData) => set(() => {
        if (!importedData || !Array.isArray(importedData.workspaces)) return {}; // Geçersiz dosyaysa iptal
        return {
          workspaces: importedData.workspaces,
          activeWorkspaceId: importedData.activeWorkspaceId || (importedData.workspaces.length > 0 ? importedData.workspaces[0].id : null)
        };
      })
    }),
    {
      name: 'shift-scheduler-storage', // LocalStorage anahtar ismi
    }
  )
);

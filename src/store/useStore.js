import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateSorumluMonthlyTarget } from '../utils/holidays';

const generateId = () => Math.random().toString(36).substring(2, 9);

const DEFAULT_RELIGIOUS_HOLIDAYS = [
  { date: '2024-04-10', name: 'Ramazan Bayramı 1. Gün' },
  { date: '2024-04-11', name: 'Ramazan Bayramı 2. Gün' },
  { date: '2024-04-12', name: 'Ramazan Bayramı 3. Gün' },
  { date: '2024-06-16', name: 'Kurban Bayramı 1. Gün' },
  { date: '2024-06-17', name: 'Kurban Bayramı 2. Gün' },
  { date: '2024-06-18', name: 'Kurban Bayramı 3. Gün' },
  { date: '2024-06-19', name: 'Kurban Bayramı 4. Gün' },
  { date: '2025-03-30', name: 'Ramazan Bayramı 1. Gün' },
  { date: '2025-03-31', name: 'Ramazan Bayramı 2. Gün' },
  { date: '2025-04-01', name: 'Ramazan Bayramı 3. Gün' },
  { date: '2025-06-06', name: 'Kurban Bayramı 1. Gün' },
  { date: '2025-06-07', name: 'Kurban Bayramı 2. Gün' },
  { date: '2025-06-08', name: 'Kurban Bayramı 3. Gün' },
  { date: '2025-06-09', name: 'Kurban Bayramı 4. Gün' },
  { date: '2026-03-20', name: 'Ramazan Bayramı 1. Gün' },
  { date: '2026-03-21', name: 'Ramazan Bayramı 2. Gün' },
  { date: '2026-03-22', name: 'Ramazan Bayramı 3. Gün' },
  { date: '2026-05-27', name: 'Kurban Bayramı 1. Gün' },
  { date: '2026-05-28', name: 'Kurban Bayramı 2. Gün' },
  { date: '2026-05-29', name: 'Kurban Bayramı 3. Gün' },
  { date: '2026-05-30', name: 'Kurban Bayramı 4. Gün' },
  { date: '2027-03-09', name: 'Ramazan Bayramı 1. Gün' },
  { date: '2027-03-10', name: 'Ramazan Bayramı 2. Gün' },
  { date: '2027-03-11', name: 'Ramazan Bayramı 3. Gün' },
  { date: '2027-05-17', name: 'Kurban Bayramı 1. Gün' },
  { date: '2027-05-18', name: 'Kurban Bayramı 2. Gün' },
  { date: '2027-05-19', name: 'Kurban Bayramı 3. Gün' },
  { date: '2027-05-20', name: 'Kurban Bayramı 4. Gün' },
  { date: '2028-02-26', name: 'Ramazan Bayramı 1. Gün' },
  { date: '2028-02-27', name: 'Ramazan Bayramı 2. Gün' },
  { date: '2028-02-28', name: 'Ramazan Bayramı 3. Gün' },
  { date: '2028-05-05', name: 'Kurban Bayramı 1. Gün' },
  { date: '2028-05-06', name: 'Kurban Bayramı 2. Gün' },
  { date: '2028-05-07', name: 'Kurban Bayramı 3. Gün' },
  { date: '2028-05-08', name: 'Kurban Bayramı 4. Gün' },
  { date: '2029-02-14', name: 'Ramazan Bayramı 1. Gün' },
  { date: '2029-02-15', name: 'Ramazan Bayramı 2. Gün' },
  { date: '2029-02-16', name: 'Ramazan Bayramı 3. Gün' },
  { date: '2029-04-24', name: 'Kurban Bayramı 1. Gün' },
  { date: '2029-04-25', name: 'Kurban Bayramı 2. Gün' },
  { date: '2029-04-26', name: 'Kurban Bayramı 3. Gün' },
  { date: '2029-04-27', name: 'Kurban Bayramı 4. Gün' },
  { date: '2030-02-04', name: 'Ramazan Bayramı 1. Gün' },
  { date: '2030-02-05', name: 'Ramazan Bayramı 2. Gün' },
  { date: '2030-02-06', name: 'Ramazan Bayramı 3. Gün' },
  { date: '2030-04-13', name: 'Kurban Bayramı 1. Gün' },
  { date: '2030-04-14', name: 'Kurban Bayramı 2. Gün' },
  { date: '2030-04-15', name: 'Kurban Bayramı 3. Gün' },
  { date: '2030-04-16', name: 'Kurban Bayramı 4. Gün' },
];

export const useStore = create(
  persist(
    (set, get) => ({
      workspaces: [],
      activeWorkspaceId: null,

      customHolidays: DEFAULT_RELIGIOUS_HOLIDAYS,

      addCustomHoliday: (holiday) => set((state) => ({
        customHolidays: [...state.customHolidays, holiday].sort((a, b) => a.date.localeCompare(b.date))
      })),

      removeCustomHoliday: (date) => set((state) => ({
        customHolidays: state.customHolidays.filter(h => h.date !== date)
      })),

      // --- EYLEMLER (ACTIONS) ---

      // Yeni bir workspace (senaryo/ay) ekle
      addWorkspace: (title) => set((state) => {
        const newWorkspace = {
          id: generateId(),
          title: title || `Yeni Senaryo ${state.workspaces.length + 1}`,
          settings: {
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            dayShiftHours: 8,
            nightShiftHours: 16,
            targetMonthlyHours: 180,
            dailyDayTarget: 3,
            dailyNightTarget: 2,
            maxConsecutiveWorkDays: 6,
            aShiftHours: 8,
            bShiftHours: 5,
            shiftLabels: { day: 'D', night: 'N', fixedDay: 'A', fixedHalfDay: 'B' },
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

        const monthOrYearChanged = 'month' in newSettings || 'year' in newSettings;

        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id !== state.activeWorkspaceId) return ws;

          const updatedSettings = { ...ws.settings, ...newSettings };

          // Ay/yıl değişince sorumlu takvimine göre hedef mesayi otomatik hesapla
          if (monthOrYearChanged) {
            updatedSettings.targetMonthlyHours = calculateSorumluMonthlyTarget(
              updatedSettings.year,
              updatedSettings.month,
              state.customHolidays,
              updatedSettings.aShiftHours ?? 8,
              updatedSettings.bShiftHours ?? 5
            );
          }

          // Ay/yıl değişince istek seçici sıfırla
          const updatedEmployees = monthOrYearChanged
            ? ws.employees.map(emp => ({ ...emp, requestedShifts: {}, requestedOffDays: [] }))
            : ws.employees;

          return { ...ws, settings: updatedSettings, employees: updatedEmployees };
        });

        return { workspaces: updatedWorkspaces };
      }),

      // --- ÇALIŞAN (PERSONEL) YÖNETİMİ EYLEMLERİ ---

      // Personel Ekle (Aktif Workspace'e)
      addEmployee: (workspaceId, employeeData) => set((state) => {
        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id === workspaceId) {
            const newEmployee = {
              id: generateId(),
              name: employeeData.name,
              seniority: employeeData.seniority || 'yeni',
              initialBalance: 0,
              requestedOffDays: [],
              requestedShifts: {},
            };
            return { ...ws, employees: [...ws.employees, newEmployee] };
          }
          return ws;
        });
        return { workspaces: updatedWorkspaces };
      }),

      // Personel Sil
      removeEmployee: (workspaceId, employeeId) => set((state) => {
        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id === workspaceId) {
            return {
              ...ws,
              employees: ws.employees.filter(emp => emp.id !== employeeId)
            };
          }
          return ws;
        });
        return { workspaces: updatedWorkspaces };
      }),

      // Personel Bilgilerini (İsim, Kıdem vb.) Güncelleme
      updateEmployeeData: (workspaceId, employeeId, newData) => set((state) => {
        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id === workspaceId) {
            const updatedEmployees = ws.employees.map(emp => 
              emp.id === employeeId ? { ...emp, ...newData } : emp
            );
            return { ...ws, employees: updatedEmployees };
          }
          return ws;
        });
        return { workspaces: updatedWorkspaces };
      }),

      // Personel İzin (Off Days) Güncellemesi
      updateEmployeeOffDays: (workspaceId, employeeId, offDaysArray) => set((state) => {
        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id === workspaceId) {
            const updatedEmployees = ws.employees.map(emp => 
              emp.id === employeeId ? { ...emp, requestedOffDays: offDaysArray } : emp
            );
            return { ...ws, employees: updatedEmployees };
          }
          return ws;
        });
        return { workspaces: updatedWorkspaces };
      }),

      updateEmployeeRequestedShifts: (workspaceId, employeeId, shiftsObj) => set((state) => {
        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id === workspaceId) {
            const updatedEmployees = ws.employees.map(emp =>
              emp.id === employeeId ? { ...emp, requestedShifts: shiftsObj } : emp
            );
            return { ...ws, employees: updatedEmployees };
          }
          return ws;
        });
        return { workspaces: updatedWorkspaces };
      }),

      // Tekil hücreyi güncelle ve actualHours'u anlık yeniden hesapla
      updateShiftCell: (workspaceId, empId, day, newShift) => set((state) => ({
        workspaces: state.workspaces.map(ws => {
          if (ws.id !== workspaceId) return ws;
          const newShifts = {
            ...ws.shifts,
            [empId]: { ...(ws.shifts?.[empId] || {}), [day]: newShift },
          };
          const {
            dayShiftHours = 8, nightShiftHours = 16,
            aShiftHours = 8, bShiftHours = 5,
            shiftLabels = { day: 'D', night: 'N', fixedDay: 'A', fixedHalfDay: 'B' },
          } = ws.settings;
          const { day: DAY, night: NIGHT, fixedDay: FIXED_DAY, fixedHalfDay: FIXED_HALF } = shiftLabels;
          const emp = ws.employees.find(e => e.id === empId);
          let total = emp?.initialBalance || 0;
          for (const s of Object.values(newShifts[empId] || {})) {
            if (s === DAY)        total += dayShiftHours;
            else if (s === NIGHT)      total += nightShiftHours;
            else if (s === FIXED_DAY)  total += aShiftHours;
            else if (s === FIXED_HALF) total += bShiftHours;
          }
          return { ...ws, shifts: newShifts, actualHours: { ...(ws.actualHours || {}), [empId]: total } };
        }),
      })),

      // Hesaplanmış Vardiya (Takvim) Verisini Kaydetme
      setSchedule: (workspaceId, scheduleData, actualHoursData) => set((state) => {
        const updatedWorkspaces = state.workspaces.map(ws => {
          if (ws.id === workspaceId) {
            return {
              ...ws,
              shifts: scheduleData,
              actualHours: actualHoursData 
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
      name: 'shift-scheduler-storage',
      version: 1,
      migrate: (persisted, version) => {
        if (version < 1 && (!persisted.customHolidays || persisted.customHolidays.length === 0)) {
          persisted.customHolidays = DEFAULT_RELIGIOUS_HOLIDAYS;
        }
        return persisted;
      },
    }
  )
);

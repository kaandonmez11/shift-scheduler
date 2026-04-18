## Sprint 2.1: Zustand Store ve Persist

**Kapsam:** Veritabanı (backend) olmayan uygulamanın tarayıcı hafızasını kullanarak verileri kalıcı hale getirmesi.

**Claude Code İçin Komut:**
```text
Projeye 'zustand' bağımlılığını kur. Uygulamanın verileri tarayıcı değişmedikçe kaybolmamalı; bu yüzden 'zustand/middleware' persist özelliğini kullanarak verileri 'localStorage' üstüne yazacak bir `src/store/useStore.js` oluştur. 
State mantığını şu formatta kurgula; birden fazla ay veya senaryo açılabilmesi için 'workspaces' (sekmeler dizisi), 'activeWorkspaceId', ve aktif workspace içindeki veriler (sabah-nöbet çalışma saati tanımları, toplam saat hedefi vb). Store'un sorunsuz çalışıp çalışmadığını test etmek için state elemanlarına müdahale eden ufak bir test ekranı yaz.
```

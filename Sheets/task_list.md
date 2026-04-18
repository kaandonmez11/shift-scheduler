# Shift Scheduler - Görev ve Klasör Yapısı

## Teknoloji Yığını ve Klasör Mimarisi
Proje, hızı ve modern yapısı nedeniyle **Vite (React)** kullanılarak geliştirilecektir. State yönetimi için (ve sekmelerin yerel hafızaya kaydedilebilmesi için) **Zustand (Persist middleware)** seçilmiştir.

**Tasarım Dili (Hibrit Liquid Glass):** Kullanıcının sayfada uzun süre tablo inceleyeceği ve sayı göreceği hesaplanarak, arkada sıvı gibi hareket eden (Liquid) bir arka plan animasyonunun üstüne mat ve okunaklı, göz yormayan **Glassmorphism** (buzlu cam) panellerin oturtulduğu bir tasarım kullanılacaktır. Tasarımların hepsi Vanilla CSS ile yazılacaktır.

### Beklenen Dosya Ağacı:
```text
/src
  /components     # Glassmorphism tasarımlı Buton, Card, vs.
  /features       # Takvim, Sekme (Workspace) Yönetimi gibi ana paneller
  /store          # Zustand state (useStore.js)
  /styles         # index.css (Animasyonlar ve renk değişkenleri)
  /utils          # Nöbet algoritması (scheduler.js) ve kurallar
```

## Fazlar ve Sprintler
- [ ] **Faz 1: Temel Kurulum ve UI**
  - [ ] Sprint 1.1: Proje İskeleti ve Kütüphane Kurulumları
  - [ ] Sprint 1.2: Hibrit Liquid Glass Teması
  - [ ] Sprint 1.3: Temel Arayüz Bileşenleri
- [ ] **Faz 2: Durum Yönetimi (State)**
  - [ ] Sprint 2.1: Browser Kayıt Sistemi (Zustand Persist)
  - [ ] Sprint 2.2: Sekme Yapısı ve JSON Export/Import
- [ ] **Faz 3: Veriler ve Algoritma**
  - [ ] Sprint 3.1: Personel Listesi ve İzinlerin Eklenmesi
  - [ ] Sprint 3.2: Otomatik Vardiya Algoritması (Kural Motoru)
- [ ] **Faz 4: Takvim (Grid) Arayüzü**
  - [ ] Sprint 4.1: Büyük Çizelgenin ve Saatlerin Çizimi
  - [ ] Sprint 4.2: Manuel Düzenleme (Hücre Tıklamaları)
- [ ] **Faz 5: Raporlama ve Cila**
  - [ ] Sprint 5.1: Excel (.xlsx) Çıktısının Alınması
  - [ ] Sprint 5.2: Mobil Panel Düzenlemeleri ve Hata Ayıklama

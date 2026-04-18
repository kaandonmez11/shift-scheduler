# Shift Scheduler - Claude Code Komut Listesi

Bu dosya, Claude Code (veya kullanacağınız herhangi bir AI asistanı) için özel olarak hazırlanmış, doğrudan kopyalayıp yapıştırılabilecek 11 sprint komutunu barındırır. Faz atlamadan, sırayla asistanınıza iletebilirsiniz.

---

### Sprint 1.1: Proje İskeleti ve Kütüphaneler
```text
Sen bir senyör frontend geliştiricisisin. Lütfen bu klasöre Vanilla React ile ("React" ve "JavaScript" seçili) bir Vite projesi kur. Mevcut default Vite dosyalarını ve gereksizleri temizle.
Daha sonra projede kullanacağımız şu kütüphaneleri NPM ile yükle: 'zustand', 'xlsx', 'lucide-react' (ikonlar için), ve 'date-fns' (tarih formatları için).
Son olarak proje içinde mimari düzeni sağlamak için şu boş klasörleri oluştur: 'src/components', 'src/features', 'src/store', 'src/styles', 'src/utils'.
Proje 'npm run dev' komutuyla başarılı ve beyaz, temiz bir sayfada açılmalı.
```

---

### Sprint 1.2: Hibrit Liquid Glass Teması
```text
Yeni projede 'src/styles/index.css' dosyasını bağla ve tüm proje genelinde Vanilla CSS kullanılmasını sağla. 
Bu projede "Hibrid Liquid Glass" tasarımı kullanacağız. Lütfen CSS içerisine projede tekrar kullanabileceğim temel renk, border-radius ve gölge değişkenlerini ekle. Sonrasında uygulamanın `<body>` (arkaplan) kısmına ağır tempoda akan, sıvımsı ve bulanık (liquid / mesh gradient) bir arka plan animasyonu entegre et. Arkaplan göz yormamalı, çünkü ileride üstüne eklenecek dev tabloyu rahatça okumak istiyoruz, bu sebeple karanlık ve yumuşak tonlar kullan.
```

---

### Sprint 1.3: Temel Arayüz Bileşenleri
```text
Projedeki 'src/components' klasörü içerisine sadece Vanilla CSS kullanarak mat görünümlü, 'Glassmorphism' stili (arkası flu `backdrop-filter: blur`, hafif ince beyaz çerçeveli, yarı şeffaf) yapıda `Button.jsx`, `Card.jsx`, ve `Input.jsx` modüllerini kodla. 
Bu bileşenlerin üzerine imleç ile gelindiğinde (hover) organik sıvıyı andıran yumuşak reaksiyon animasyonları ver. `App.jsx` içinde bu 3 bileşeni ortada yan yana çağırarak görsel bir test kurgusu sergile.
```

---

### Sprint 2.1: Zustand Store ve Persist
```text
Projeye 'zustand' bağımlılığını kur. Uygulamanın verileri tarayıcı değişmedikçe kaybolmamalı; bu yüzden 'zustand/middleware' persist özelliğini kullanarak verileri 'localStorage' üstüne yazacak bir `src/store/useStore.js` oluştur. 
State mantığını şu formatta kurgula; birden fazla ay veya senaryo açılabilmesi için 'workspaces' (sekmeler dizisi), 'activeWorkspaceId', ve aktif workspace içindeki veriler (sabah-nöbet çalışma saati tanımları, toplam saat hedefi vb). Store'un sorunsuz çalışıp çalışmadığını test etmek için state elemanlarına müdahale eden ufak bir test ekranı yaz.
```

---

### Sprint 2.2: Sekme Sistemi ve JSON Import/Export
```text
'src/features/Workspace' yapısını kur. Uygulamanın üst kısmı sanki tarayıcı sekmeleri gibi olmalı ('Mayıs - Gerçek', 'Mayıs Taslak' vs). Yeni bir sekme yaratma ve mevcut bir sekmeyi içindeki tüm ayarlarla birlikte "Klonlama" işlevlerini store ile entegre et. Ayrıca mevcut localStorage State'ini bir dosya ('.json') formatında dışarıya çıkartıp indirmemizi sağlayan bir "Projeyi PC'ye İndir" fonksiyonu ve json okutarak veriyi store'a yükleyen "Projeyi Yükle" Import/Export işlevleri oluştur.
```

---

### Sprint 3.1: Personel ve Tatil Yönetimi
```text
'src/features/Personnel' altında, kullanıcının aktif workspace'e (sekmeye) eleman ekleyip silebileceği, Glassmorphism tarzı bir panel yap. Her çalışan satırının içinde, o personelin o ay "özellikle boş (tatil) kalmak istediği" günleri seçebileceği pratik bir arayüz modülü koy. İlaveten, Türkiye 2026 vb. yasal resmi tatilleri tutabilmek için 'src/utils/holidays.js' adında basit bir obje oluştur ve takvim çizimlerinde resmi tatillerin de izin yönetimi gibi ayrı bir işareti olsun.
```

---

### Sprint 3.2: Otomatik Vardiya Dağıtım Algoritması
```text
'src/utils/scheduler.js' içinde aylık görev dağıtım kurallarını barındıran salt JavaScript kodunu yaz.
Girdiler: Ay detayları, Personel Listesi, İzin alınan günler, Nöbetin uzunluğu(saat), Sabahın uzunluğu(saat) ve Aylık Hedeflenen Toplam Saat.
Kurallar:
1. İzin istenen gününe sabah/nöbet vardiyası verilemez.
2. Bir personelin nöbet (Gece-Ertesi Gün arası) yazdığı günden hemen sonraki gününe Sabah vardiyası kesinlikle verilemez.
3. Peş peşe nöbet gelmemesi için çaba gösterilir, ancak algoritmada tıkanma yaşanırsa zorunlu durumlarda en fazla 2 nöbet arka arkaya verebililir.
4. Ay sonunda tüm çalışanların biriktirdigi saatler belirlenen toplam aylık hedefe (örn: 160 saat) eşit veya çok yakın olmalıdır. Çıktı olarak oluşan matrisi dönsün.
```

---

### Sprint 4.1: Büyük Matrix (Grid) Takvimi
```text
'src/features/Calendar' içine hesaplanan takvimi döken geniş, modern bir Grid bileşeni yaz. Satırlarda personel isimleri, sütunlarda ayın günleri olsun (31 sütun). Okunabilirliği arttırmak için tablo satırlarında ve tatil günlerinin arka plan hücrelerinde hafif şeffaf glass efekti varyasyonları oluştur. (Örn: Nöbet kutusu hafif mavi, Sabah kutusu hafif sarı bir cama benzesin). Özellikle mobil cihazlarda parmak ile yatay/dikey kaydırma (swipe & scroll) yapabilmesi için overflow-scrolling özelliklerine dikkat et.
```

---

### Sprint 4.2: Manuel Düzenleme ve Eş-Zamanlı Saat Analizi
```text
Zaten çizilen takvim gridine şu işlevleri ekle: Herhangi bir takvim hücresine (hücre zaten 'nöbet' atanmış da olabilir boş da kalmış olabilir) tıklandığında pop-over şeklinde ufak bir düzenleme ekranı açılmalı ve kullanıcı onu zorla (Sabah/Nöbet/Sil) değiştirebilmelidir. 
Tablonun en sağına her satırdaki personel için "Toplam Saat / Hedef Saat" ibaresini gösteren özel bir sütun ekle. Tabloda tıkla-değiştir işlemi yapıldığı gibi bu hesaplamalar canlı (Zustand üzerinden) anlık hesaplansın ve eğer çalışan hedefin altında kalıyorsa ilgili rakam örneğin uyarıcı sarı renkte olsun, hedef tutuyorsa yeşil ışık yaksın.
```

---

### Sprint 5.1: Çıktı Formülasyonu - Excel
```text
Projene 'xlsx' (SheetJS) bağımlılığını dahil et. Ekranda gözüken, manuel müdahale edilmiş / tamamlanmış kalendar matrisini ve her personelin toplam saat analizlerini okuyarak, bilgisayara bir `.xlsx` belgesi olarak indirebilen bir "Excel İndir" butonu ve utils fonksiyonu oluştur. Çıktı alınan exceli incelerken sütun genişliklerinin falan da düzgün hizalandığından (auto width) emin ol.
```

---

### Sprint 5.2: Mobil Uyumluluk ve Nihai Cila
```text
Uygulamayı Chrome geliştirici araçlarında "Mobil ve Tablet cihaz" moduna zorla. Tüm butonların (JSON ekleme, Excel indirme, Sekmeleri açma) parmakla dokunulabilir (touch-target) büyüklükte olduğundan emin ol. Menüleri responsive yapıya uygun (dar ekranda belki Drawer / bottom sheet) şekilde ayarla. Hibrid Liquid Glass arayüzünün fazla animasyon yüzünden performansı düşürmediğini kontrol et, gerekirse GPU acceleration (will-change) CSS'leri uygula. Kusursuz bir son kullanıcı ürünü tamamla.
```

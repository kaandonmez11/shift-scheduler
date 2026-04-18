## Sprint 3.2: Otomatik Vardiya Dağıtım Algoritması

**Kapsam:** Nöbetleri adil ve kurallı dağıtan pure JavaScript fonksiyonunun yazılması.

**Claude Code İçin Komut:**
```text
'src/utils/scheduler.js' içinde aylık görev dağıtım kurallarını barındıran salt JavaScript kodunu yaz.
Girdiler: Ay detayları, Personel Listesi, İzin alınan günler, Nöbetin uzunluğu(saat), Sabahın uzunluğu(saat) ve Aylık Hedeflenen Toplam Saat.
Kurallar:
1. İzin istenen gününe sabah/nöbet vardiyası verilemez.
2. Bir personelin nöbet (Gece-Ertesi Gün arası) yazdığı günden hemen sonraki gününe Sabah vardiyası kesinlikle verilemez.
3. Peş peşe nöbet gelmemesi için çaba gösterilir, ancak algoritmada tıkanma yaşanırsa zorunlu durumlarda en fazla 2 nöbet arka arkaya verebililir.
4. Ay sonunda tüm çalışanların biriktirdigi saatler belirlenen toplam aylık hedefe (örn: 160 saat) eşit veya çok yakın olmalıdır. Çıktı olarak oluşan matrisi dönsün.
```

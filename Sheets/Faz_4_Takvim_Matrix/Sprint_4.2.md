## Sprint 4.2: Manuel Düzenleme ve Eş-Zamanlı Saat Analizi

**Kapsam:** Otomasyona kullanıcının ince ayar yapabilmesi ve hataları canlı görmesi.

**Claude Code İçin Komut:**
```text
Zaten çizilen takvim gridine şu işlevleri ekle: Herhangi bir takvim hücresine (hücre zaten 'nöbet' atanmış da olabilir boş da kalmış olabilir) tıklandığında pop-over şeklinde ufak bir düzenleme ekranı açılmalı ve kullanıcı onu zorla (Sabah/Nöbet/Sil) değiştirebilmelidir. 
Tablonun en sağına her satırdaki personel için "Toplam Saat / Hedef Saat" ibaresini gösteren özel bir sütun ekle. Tabloda tıkla-değiştir işlemi yapıldığı gibi bu hesaplamalar canlı (Zustand üzerinden) anlık hesaplansın ve eğer çalışan hedefin altında kalıyorsa ilgili rakam örneğin uyarıcı sarı renkte olsun, hedef tutuyorsa yeşil ışık yaksın.
```
